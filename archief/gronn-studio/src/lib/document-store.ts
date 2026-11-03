import { isDocument, normalize, type StudioDocument } from "@/lib/documents"

// The panel's view of the document archive.
//
// Storage is an external system, so React reads it through
// useSyncExternalStore rather than copying it into state inside an
// effect — the same shape the localStorage store had, and the reason
// this swap barely touches the builder. What changed is where the other
// end is: `/api/admin/documents` instead of this browser.
//
// Two stores live here. `documents` is the archive itself. `saveState`
// is what the panel shows about it, and it exists because a network
// round trip can fail where a localStorage write could not: the owner
// has to be able to see that the last keystroke did not land.

const EMPTY: StudioDocument[] = []

/* ------------------------------------------------------------ documents */

let cache: StudioDocument[] = EMPTY
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeDocuments(listener: () => void): () => void {
  listeners.add(listener)
  // First subscriber pulls the archive down. Later ones join whatever is
  // already in flight, so mounting two components never fetches twice.
  void hydrate()
  return () => {
    listeners.delete(listener)
  }
}

export function documentsSnapshot(): StudioDocument[] {
  return cache
}

/** The server renders no archive at all, so first paint matches. */
export function documentsServerSnapshot(): StudioDocument[] {
  return EMPTY
}

/* ----------------------------------------------------------- save state */

export type SaveState =
  | "idle"
  | "loading"
  | "saving"
  | "saved"
  | "error"
  /**
   * Another tab saved while this one was typing. The archive on the
   * server is newer than the one this tab read, so the write was refused
   * rather than allowed to erase it.
   */
  | "conflict"

let saveState: SaveState = "idle"
const saveListeners = new Set<() => void>()

function setSaveState(next: SaveState) {
  saveState = next
  for (const listener of saveListeners) listener()
}

export function subscribeSaveState(listener: () => void): () => void {
  saveListeners.add(listener)
  return () => {
    saveListeners.delete(listener)
  }
}

export function saveStateSnapshot(): SaveState {
  return saveState
}

export function saveStateServerSnapshot(): SaveState {
  return "idle"
}

/* ------------------------------------------------------------- hydration */

let hydrated = false
let inflight: Promise<void> | null = null

/**
 * The ETag of the archive this tab last read.
 *
 * Sent back on every write so the server can refuse a save that would
 * land on a version this tab never saw. One blob holds the whole
 * administration, so without it the later of two open tabs silently
 * wins with whatever it happened to be holding.
 */
let version = ""

/**
 * Pull the archive down once, then hand every later caller the same
 * promise. Called on first subscribe and again when a tab regains focus.
 */
export function hydrate(force = false): Promise<void> {
  if (inflight) return inflight
  if (hydrated && !force) return Promise.resolve()
  setSaveState("loading")
  inflight = (async () => {
    try {
      const res = await fetch("/api/admin/documents", { cache: "no-store" })
      if (!res.ok) throw new Error(String(res.status))
      const body: unknown = await res.json()
      const stamp = (body as { version?: unknown }).version
      version = typeof stamp === "string" ? stamp : ""
      const raw = (body as { documents?: unknown }).documents
      const documents = Array.isArray(raw)
        ? raw.filter(isDocument).map(normalize)
        : []
      hydrated = true
      // An empty archive on a browser that still holds the old local
      // store is the one moment the migration can run — see below.
      cache = documents.length === 0 ? await adoptLegacy() : documents
      setSaveState("idle")
      emit()
    } catch {
      // Reading failed. The panel keeps whatever it has and says so
      // rather than replacing the owner's work with an empty list.
      setSaveState("error")
    } finally {
      inflight = null
    }
  })()
  return inflight
}

/* ---------------------------------------------------------------- writes */

let pending: StudioDocument[] | null = null
let writing = false

/**
 * Replace the archive.
 *
 * Optimistic: the cache and the interface update at once, and the write
 * follows. Returns true because the panel has accepted the change — the
 * outcome of the round trip is reported through `saveState`, which is
 * the thing the owner actually needs to see.
 *
 * Writes are serialised. The builder saves a beat after typing stops, so
 * a burst can still overlap a slow request; queueing the latest and
 * dropping what it superseded means the last state typed is the state
 * stored, and never an older one landing after a newer one.
 */
export function writeDocuments(docs: StudioDocument[]): boolean {
  // A failed read must never become a write.
  //
  // Until this check, the panel could destroy the whole administration
  // without anything going visibly wrong. When `hydrate()` fails or is
  // still in flight, `cache` is `[]` and `version` is `""`. The builder
  // then renders its EMPTY state — "nog geen documenten", with no save
  // indicator anywhere near it — so a storage outage reads as a studio
  // that has never written a quote. The owner presses "Nieuwe offerte",
  // `nextNumber([])` hands back 2026-0001 on top of a number already
  // used, and 700 ms later this function PUT the array holding that one
  // draft. The route skips its ETag guard on an empty version, so the
  // write is unconditional: every quote and invoice replaced by one
  // blank document, and the numbering restarted underneath it.
  //
  // `documents.previous.json` does not save it either — `keepPrevious()`
  // runs before every PUT, so the next autosave a second later copies
  // the already-emptied file over the backup.
  //
  // `intake-workspace.tsx` has guarded its own write this way since the
  // day that nearly happened there. This is the same guard, at the
  // source, where every caller gets it.
  if (!hydrated) {
    setSaveState("error")
    return false
  }
  cache = docs
  emit()
  pending = docs
  void flush()
  return true
}

async function flush(): Promise<void> {
  if (writing || pending === null) return
  writing = true
  setSaveState("saving")
  try {
    while (pending !== null) {
      const batch = pending
      pending = null
      const res = await fetch("/api/admin/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: batch, version }),
      })
      if (res.status === 409) {
        // Somebody else's save is newer. Do not retry with this tab's
        // copy — that is exactly the overwrite the check exists to
        // prevent. Pull the current archive down and let the owner see
        // that this tab was behind.
        pending = null
        // Refresh first, then report — `hydrate` drives the same state
        // store, so setting "conflict" before it would be wiped by its
        // own "loading" and "idle" and the owner would never see it.
        await hydrate(true)
        setSaveState("conflict")
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { version?: unknown }
      if (typeof body.version === "string") version = body.version
    }
    setSaveState("saved")
  } catch {
    setSaveState("error")
  } finally {
    writing = false
  }
}

/* ------------------------------------------------------------- migration */

const LEGACY_KEY = "gronn-documents-v1"

/**
 * Everything the old browser-only store still holds, moved up once.
 *
 * This runs only when the server archive is empty, so it can never
 * overwrite work done on another device. The key is cleared on success:
 * left in place, a later empty archive — a storage outage, say — would
 * resurrect documents the owner had deliberately deleted.
 */
async function adoptLegacy(): Promise<StudioDocument[]> {
  if (typeof window === "undefined") return EMPTY
  let legacy: StudioDocument[] = []
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return EMPTY
    legacy = parsed.filter(isDocument).map(normalize)
  } catch {
    return EMPTY
  }
  if (legacy.length === 0) return EMPTY

  try {
    const res = await fetch("/api/admin/documents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents: legacy, version }),
    })
    if (!res.ok) throw new Error(String(res.status))
    window.localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Could not push them up. Keep the key — the next load tries again,
    // and until then the documents are still in this browser.
    return legacy
  }
  return legacy
}

/* ---------------------------------------------------------------- focus */

/**
 * Two tabs, one archive: the last write wins, so a tab that has been in
 * the background catches up before the owner types into a stale list.
 */
export function watchFocus(): () => void {
  if (typeof window === "undefined") return () => {}
  const refresh = () => {
    if (document.visibilityState === "visible") void hydrate(true)
  }
  window.addEventListener("focus", refresh)
  document.addEventListener("visibilitychange", refresh)
  return () => {
    window.removeEventListener("focus", refresh)
    document.removeEventListener("visibilitychange", refresh)
  }
}

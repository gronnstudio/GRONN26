import { BlobPreconditionFailedError, copy, get, put } from "@vercel/blob"

import { isDocument, normalize, type StudioDocument } from "@/lib/documents"

// Where the studio's quotes and invoices actually live.
//
// They used to live in one browser's localStorage and nowhere else. That
// was defensible while the panel was a scratchpad — the PDF was the
// business record and the store just kept drafts re-editable — but it
// stopped being true the moment the owner started running the
// administration from here. Clearing site data threw the lot away, a
// second device saw an empty panel, and nothing anywhere was a backup.
//
// So documents now sit beside the intakes, in the same private Blob
// store behind the same Google sign-on. The panel reads them on load and
// writes them back as you type.
//
// ONE blob holds the whole set, deliberately. The panel has always
// written the entire array on every save, the owner is a single person
// with a single administration, and a file per document would buy
// per-record isolation at the price of an N+1 read on every page load.
// The cost of that choice is last-write-wins across two open tabs, which
// is why the client refetches when a tab regains focus — see
// `src/lib/document-store.ts`.

const DOCUMENTS_PATH = "admin/documents.json"

/**
 * One generation back, written immediately before every overwrite.
 *
 * There is no version history on a Blob object, and this file is the
 * studio's entire administration in a single array. A cheap previous
 * copy is the difference between "undo the last save" and "it is gone".
 */
const PREVIOUS_PATH = "admin/documents.previous.json"

/**
 * Could the archive be read at all?
 *
 * A storage outage used to return an empty array, exactly like a store
 * with no documents in it. The panel then showed an empty
 * administration, and — worse — anything that read the snapshot and
 * wrote it back would have saved that emptiness over the real thing.
 */
export type ArchiveStatus = "ok" | "unavailable"

/** What the API hands the panel, and what the panel sends back. */
export type DocumentArchive = {
  documents: StudioDocument[]
  /** ISO 8601, stamped on the server — never by the client's clock. */
  savedAt: string
  /**
   * The stored object's ETag, echoed back on write so a save can refuse
   * to land on top of a version it never saw. Empty when there is no
   * record yet, which is the one case where an unconditional write is
   * correct.
   */
  version: string
  status: ArchiveStatus
}

/**
 * Read the archive.
 *
 * Private first, then public: a store that refused a private write once
 * has the file on the public side, and refusing to read it back would
 * strand exactly the documents the fallback existed to save.
 */
export async function readDocuments(): Promise<DocumentArchive> {
  const empty: DocumentArchive = {
    documents: [],
    savedAt: "",
    version: "",
    status: "ok",
  }
  const unavailable: DocumentArchive = { ...empty, status: "unavailable" }
  let blob
  try {
    blob =
      (await get(DOCUMENTS_PATH, {
        access: "private",
        useCache: false,
      }).catch(() => null)) ??
      (await get(DOCUMENTS_PATH, { access: "public" }).catch(() => null))
  } catch {
    return unavailable
  }
  // Null from both sides is "no archive yet" — a real, safe, empty
  // state. Only a throw above means storage could not answer, and the
  // two must never collapse into the same value again.
  if (!blob) return empty
  try {
    if (blob.statusCode !== 200 || !blob.stream) return empty
    const parsed: unknown = JSON.parse(await new Response(blob.stream).text())
    if (!parsed || typeof parsed !== "object") return empty
    const raw = (parsed as { documents?: unknown }).documents
    if (!Array.isArray(raw)) return empty
    return {
      version: blob.blob.etag,
      status: "ok",
      // Anything that fails the structural check is dropped rather than
      // rendered as blanks, and `normalize` fills fields added since the
      // document was written — the same forward-compatibility the local
      // store had.
      documents: raw.filter(isDocument).map(normalize),
      savedAt:
        typeof (parsed as { savedAt?: unknown }).savedAt === "string"
          ? (parsed as { savedAt: string }).savedAt
          : "",
    }
  } catch {
    // The object exists but could not be read or parsed. That is a fault,
    // not an empty administration.
    return unavailable
  }
}

/** Raised when a save would land on a version the writer never read. */
export class ArchiveConflict extends Error {
  constructor() {
    super("archive changed since it was read")
    this.name = "ArchiveConflict"
  }
}

/**
 * Replace the archive.
 *
 * `version` is the ETag the writer read. When it is supplied the write is
 * conditional, so two tabs holding different pictures of the
 * administration can no longer silently overwrite each other — the
 * second one is refused and told to catch up. Passing nothing keeps the
 * old unconditional behaviour and is only correct for a first write.
 *
 * Returns the new stamp and the new version.
 */
export async function writeDocuments(
  documents: StudioDocument[],
  version?: string
): Promise<{ savedAt: string; version: string }> {
  const savedAt = new Date().toISOString()
  const body = JSON.stringify({ documents, savedAt }, null, 2)
  const options = {
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    ...(version ? { ifMatch: version } : {}),
  }

  // One generation back, before the overwrite rather than after it. Best
  // effort on purpose: failing to keep a backup is not a reason to
  // refuse the owner's save.
  await keepPrevious()

  try {
    const result = await put(DOCUMENTS_PATH, body, {
      ...options,
      access: "private",
    })
    return { savedAt, version: result.etag }
  } catch (error) {
    if (isPreconditionFailure(error)) throw new ArchiveConflict()
    // Private refused. The administration still has to be saved — the
    // same trade the intake archive makes, for the same reason.
    try {
      const result = await put(DOCUMENTS_PATH, body, {
        ...options,
        access: "public",
      })
      return { savedAt, version: result.etag }
    } catch (fallbackError) {
      if (isPreconditionFailure(fallbackError)) throw new ArchiveConflict()
      throw fallbackError
    }
  }
}

/** A refused conditional write, whatever shape the SDK reports it in. */
function isPreconditionFailure(error: unknown): boolean {
  if (error instanceof BlobPreconditionFailedError) return true
  const message = error instanceof Error ? error.message.toLowerCase() : ""
  return message.includes("precondition") || message.includes("412")
}

/**
 * Copy the current archive aside so the last good state survives a save.
 *
 * Server-side copy rather than read-then-write: the panel saves a beat
 * after typing stops, so this runs often, and pulling the whole
 * administration down and pushing it back on every keystroke-batch would
 * be a real cost for a safety net. `copy` never moves the bytes through
 * this function.
 *
 * Best effort by design. Failing to keep a backup is not a reason to
 * refuse the owner his save.
 */
async function keepPrevious(): Promise<void> {
  const options = { addRandomSuffix: false, allowOverwrite: true }
  try {
    await copy(DOCUMENTS_PATH, PREVIOUS_PATH, { ...options, access: "private" })
  } catch {
    try {
      await copy(DOCUMENTS_PATH, PREVIOUS_PATH, { ...options, access: "public" })
    } catch {
      // No archive to copy yet, or the store refused. Either way the
      // save below is the half that matters.
    }
  }
}

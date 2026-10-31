import { del, get, list, put } from "@vercel/blob"

import {
  INTAKE_PREFIX,
  INTAKE_RECORD,
  intakeFolder,
  isOrphanOf,
  recordPath,
  safeReference,
} from "@/lib/intake-reference"

// The intake archive: where a submitted enquiry actually lives.
//
// Before this, a submission was a notification and nothing else. The
// photographs went to Blob storage and the words went to the inbox by
// email, and there was no place where the two were one thing. Lose the
// mail and the files were still there — under a path in a dashboard,
// with no answers beside them and no way to tell whose garden they
// were.
//
// So the archive is now the record and the notification is the doorbell.
// Every submission writes `intake/<reference>/submission.json` here,
// whether or not a Slack webhook is configured, and the owner panel
// reads that back. If the mail never arrives the enquiry is still whole.
//
// Everything under `intake/` is written PRIVATE where the store allows
// it. The files are photographs of people's houses and, since #92,
// cadastral drawings with addresses on them; a public URL for those is
// the wrong default even when nobody is guessing it. They are served
// through an authenticated route — see `app/api/admin/intake-file`.
//
// Where a private write is refused, both the record and the files fall
// back to public rather than failing. Losing a visitor's evening to
// protect it is the wrong trade, and every file carries what actually
// happened to it so the panel can say so instead of implying a privacy
// it does not have.
//
// The path arithmetic lives in `intake-reference.ts` rather than here,
// because the browser needs the same answer and cannot import this file.

export { INTAKE_PREFIX, recordPath, safeReference }

export type IntakeFile = {
  /** Blob pathname, e.g. `intake/2026-08-29-tuin/current-img-1.jpg`. */
  pathname: string
  /**
   * How the blob was actually stored.
   *
   * Private is what we ask for and what these files deserve. But a store
   * that will not take a private write would otherwise fail the whole
   * upload, and losing a visitor's photographs to protect them is the
   * wrong trade — so the browser retries public and records that here.
   * The panel reads this to know whether to serve the file through the
   * gated route or straight from its URL, and says which it was.
   */
  access: "private" | "public"
  /** Only set when `access` is "public": the CDN URL it landed on. */
  url?: string
  /** What the visitor called it. */
  name: string
  /** The tray it was added to: current, materials, attracts, … */
  category: string
  contentType: string
  size: number
  /**
   * Set when the file was reattached by the recovery action rather than
   * by the submission that mentions it. Kept so the panel can say where
   * a file came from instead of quietly presenting a repair as history.
   */
  recoveredAt?: string
}

export type IntakeSubmission = {
  /**
   * The folder name, which is also the human-readable label.
   *
   * Derived from the date and the visitor's own project name. Kept as
   * the path segment for every record written before ids existed, so
   * nothing has to be moved.
   */
  reference: string
  /**
   * Stable server-minted identity.
   *
   * `reference` is derived from text a visitor typed, which makes it
   * guessable and collidable — two people naming their project the same
   * on the same day used to land in one folder. This is what the client
   * dossier will link to; the reference stays a label. Optional because
   * every record written before this field existed still has to load.
   */
  id?: string
  /** ISO 8601, stamped on the server — not by the visitor's clock. */
  receivedAt: string
  name: string
  contact: string
  project: string
  /** The whole sheet as text, exactly as the studio would read it. */
  transcript: string
  files: IntakeFile[]
  /**
   * Files the visitor attached that never reached storage.
   *
   * Recorded because the alternative is a submission that mentions four
   * photographs in its own text and carries none, with nothing saying
   * why — which is exactly how this was found.
   */
  filesFailed: number
  /**
   * Why those files failed, as the browser saw it.
   *
   * A bare count is what made three separate upload failures
   * indistinguishable from each other. This is the visitor's browser
   * quoting the storage SDK, so it is diagnostic rather than decorative —
   * and it is the difference between fixing the next one and guessing at
   * it again.
   */
  filesFailedReasons?: string[]
  /** Where the notification went, if it went anywhere. */
  relay: "slack" | "email" | "none"
  /**
   * Which client dossier this belongs to, once there are dossiers.
   *
   * Never inferred from the `contact` string: a free-text field that may
   * hold a phone number is not an identity, and attaching one household's
   * garden to another is the exact failure the portal exists to prevent.
   */
  clientId?: string
  projectId?: string
  /**
   * In the drain, not gone.
   *
   * `deleteSubmission` below removes the folder and every photograph in
   * it, and there is no undo for that — the blobs are the only copy the
   * studio has of somebody's garden. So the button no longer does that.
   * It sets this timestamp, the enquiry leaves the list, and the
   * permanent step becomes a second, separate decision taken in front of
   * a count of what it will destroy.
   */
  deletedAt?: string
}

/**
 * Could the archive be read at all?
 *
 * "Nothing here yet" and "storage did not answer" used to be the same
 * value — an empty array — which meant an outage rendered as a panel
 * saying the owner had no enquiries. They are separated now, and the
 * panel says which it is.
 */
export type ArchiveStatus = "ok" | "unavailable"

export type IntakeArchive = {
  /** Everything not in the drain. */
  submissions: IntakeSubmission[]
  /** What the owner threw away and can still get back. */
  deleted: IntakeSubmission[]
  status: ArchiveStatus
  /**
   * Folders holding files whose record was written under a different
   * spelling of the same reference — see `intake-reference.ts`. The
   * files are intact; only the link is missing.
   */
  orphans: OrphanFolder[]
}

export type OrphanFolder = {
  /** The folder as it exists in storage. */
  reference: string
  /** The record it belongs to, by its own reference. */
  belongsTo: string
  files: IntakeFile[]
}

export async function writeSubmission(s: IntakeSubmission): Promise<void> {
  const options = {
    addRandomSuffix: false,
    // The record is rewritten if a submission is somehow sent twice
    // under the same reference; the second is the one that arrived.
    allowOverwrite: true,
    contentType: "application/json",
  }
  const body = JSON.stringify(s, null, 2)
  try {
    await put(recordPath(s.reference), body, { ...options, access: "private" })
  } catch {
    // Private refused. The record still has to exist — an archive that
    // only works on a correctly configured store is not an archive.
    await put(recordPath(s.reference), body, { ...options, access: "public" })
  }
}

/**
 * One intake blob, read from whichever side it actually lives on.
 *
 * Private is what the archive asks for and what these files deserve. But
 * `writeSubmission` and the browser BOTH fall back to a public write
 * where the store refuses a private one, and `filesIn` cannot tell which
 * side a listed blob is on so it labels every one of them private. A
 * stored path therefore never proves its own access.
 *
 * Exported because the gated file route needs exactly this and used to
 * ask for private alone — which is why a publicly stored photograph came
 * back 404 and rendered as a broken tile in the gallery, over a file
 * that had been in storage the whole time.
 */
export async function getIntakeBlob(path: string) {
  const blob =
    (await get(path, { access: "private", useCache: false }).catch(() => null)) ??
    (await get(path, { access: "public" }).catch(() => null))
  return blob && blob.statusCode === 200 && blob.stream ? blob : null
}

/** Read one blob as text, whichever side it lives on. */
async function readBlob(path: string): Promise<string | null> {
  const blob = await getIntakeBlob(path)
  return blob ? new Response(blob.stream).text() : null
}

/** Every file in one folder, as the panel would show them. */
async function filesIn(folder: string): Promise<IntakeFile[]> {
  const { blobs } = await list({ prefix: folder })
  return blobs
    .filter((b) => !b.pathname.endsWith(INTAKE_RECORD))
    .map((b) => ({
      pathname: b.pathname,
      // A listed blob does not say which side it lives on, and guessing
      // wrong would either leak a URL or fail to serve one. Private is
      // the safe guess: the gated route can serve either.
      access: "private" as const,
      name: b.pathname.split("/").pop() ?? b.pathname,
      category: (b.pathname.split("/").pop() ?? "").split("-")[0] || "overig",
      contentType: "",
      size: b.size,
    }))
}

/**
 * Every submission, newest first.
 *
 * Folded listing gives one entry per reference rather than one per
 * photograph, so a studio with two hundred files still gets a page of
 * enquiries rather than a page of JPEGs.
 */
export async function readArchive(): Promise<IntakeArchive> {
  let folders: string[] = []
  try {
    const result = await list({ prefix: INTAKE_PREFIX, mode: "folded" })
    folders = result.folders ?? []
  } catch {
    // Storage did not answer. Say so — an empty archive here would read
    // as "no enquiries yet" on a panel whose whole job is to show them.
    return { submissions: [], deleted: [], status: "unavailable", orphans: [] }
  }

  const references = folders.map((f) =>
    f.replace(INTAKE_PREFIX, "").replace(/\/$/, "")
  )

  const records = await Promise.all(
    references.map(async (reference) => {
      try {
        const text = await readBlob(`${INTAKE_PREFIX}${reference}/${INTAKE_RECORD}`)
        if (!text) return null
        return JSON.parse(text) as IntakeSubmission
      } catch {
        return null
      }
    })
  )

  const submissions: IntakeSubmission[] = []
  const withoutRecord: string[] = []
  records.forEach((record, i) => {
    if (record) submissions.push(record)
    else withoutRecord.push(references[i])
  })

  // A folder with files but no record is one of two things: an upload
  // that completed while the submission never landed, or — far more
  // often — the other half of a reference that the browser and the
  // server spelled differently. The second is repairable, so it is
  // reported as an orphan rather than shown as an empty enquiry.
  const known = new Set(submissions.map((s) => s.reference))
  const orphans: OrphanFolder[] = []
  for (const reference of withoutRecord) {
    const belongsTo = [...known].find((r) => isOrphanOf(reference, r))
    if (!belongsTo) {
      // Genuinely nothing to attach it to: an upload that finished while
      // the submission itself never landed. Surface it as a stub — WITH
      // its files. Stubbing it with an empty list told the owner "deze
      // aanvrager heeft niets meegestuurd" over a folder holding the
      // client's photographs, which is the opposite of what happened and
      // the reason they went unnoticed.
      let files: IntakeFile[] = []
      try {
        files = await filesIn(intakeFolder(reference))
      } catch {
        // The folder would not list. An empty stub is still better than
        // no row at all — the owner can see the reference exists.
      }
      submissions.push({
        reference,
        receivedAt: "",
        name: "",
        contact: "",
        project: "",
        transcript: "",
        files,
        filesFailed: 0,
        relay: "none",
      })
      continue
    }
    try {
      orphans.push({ reference, belongsTo, files: await filesIn(intakeFolder(reference)) })
    } catch {
      orphans.push({ reference, belongsTo, files: [] })
    }
  }

  submissions.sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1))

  // The drain is split out here rather than filtered at every call site.
  // There are five of those, and one that forgot would show a thrown-away
  // enquiry as a live one — or, worse, count it in a figure.
  const live = submissions.filter((s) => !s.deletedAt)
  const deleted = submissions
    .filter((s) => s.deletedAt)
    .sort((a, b) => ((a.deletedAt ?? "") < (b.deletedAt ?? "") ? 1 : -1))

  return { submissions: live, deleted, status: "ok", orphans }
}

/**
 * Move an enquiry to the drain, or bring it back.
 *
 * The record is re-read and rewritten rather than patched from the
 * panel's copy, for the same reason the dossier link does it: the
 * browser holds a snapshot from page load, and writing that back would
 * undo anything that landed in between.
 *
 * Nothing is deleted here. That is the whole point of the field — the
 * destructive step is `deleteSubmission`, and it now takes a second,
 * separate decision to reach it.
 */
export async function setDeleted(
  reference: string,
  deleted: boolean,
  now: string
): Promise<IntakeSubmission | null> {
  const text = await readBlob(recordPath(reference))
  if (!text) return null
  const record = JSON.parse(text) as IntakeSubmission
  let next: IntakeSubmission
  if (deleted) {
    next = { ...record, deletedAt: now }
  } else {
    // Removed rather than blanked. An empty string is falsy and would
    // work, but it leaves a field reading "was thrown away once" in
    // every export of this record forever.
    next = { ...record }
    delete next.deletedAt
  }
  await writeSubmission(next)
  return next
}

/**
 * Attach an enquiry to a client dossier, or detach it.
 *
 * The record is re-read and rewritten rather than patched from whatever
 * the panel happened to be holding. The browser's copy is a snapshot
 * from page load, and writing it back would undo anything that landed in
 * between — a recovery that reattached files, most of all.
 *
 * `clientId` is only ever set from an explicit choice the owner made.
 * The type has said so since it was added: a `contact` field that may
 * hold a phone number is not an identity, and attaching one household's
 * garden to another is the exact failure the portal exists to prevent.
 */
export async function linkSubmission(
  reference: string,
  clientId: string | null
): Promise<IntakeSubmission | null> {
  const text = await readBlob(recordPath(reference))
  if (!text) return null
  const record = JSON.parse(text) as IntakeSubmission
  const linked: IntakeSubmission = { ...record }
  if (clientId) linked.clientId = clientId
  else delete linked.clientId
  await writeSubmission(linked)
  return linked
}

/**
 * Delete one enquiry: its record, and every file under it.
 *
 * This is the one genuinely destructive thing the panel can do, so it is
 * worth saying what it does and does not protect.
 *
 * It deletes a FOLDER, not a list of paths the caller supplies. The
 * reference is normalised through `safeReference` and the folder is
 * rebuilt from it, so a caller cannot hand in `intake/a/../b` or a bare
 * prefix and take out more than one enquiry — the same confinement the
 * upload token and the file route already rely on, applied to the
 * operation that cannot be undone.
 *
 * `list` is paged, so this loops. Deleting the first page and reporting
 * success would leave photographs behind under a reference the panel no
 * longer shows — storage the owner is paying for and cannot see, holding
 * pictures of a client's house. That is a worse outcome than a visible
 * failure, so a page that will not delete throws rather than being
 * skipped.
 */
export async function deleteSubmission(reference: string): Promise<number> {
  const folder = intakeFolder(reference)
  // `intakeFolder` already ran `safeReference`, which strips `/` and `.`
  // — this is the belt to that braces, and it is cheap.
  if (!folder.startsWith(INTAKE_PREFIX) || folder.includes("..")) {
    throw new Error("out of scope")
  }
  let removed = 0
  let cursor: string | undefined
  do {
    const page = await list({ prefix: folder, cursor })
    const paths = page.blobs.map((b) => b.pathname)
    if (paths.length > 0) {
      await del(paths)
      removed += paths.length
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return removed
}

/**
 * Reattach an orphan folder's files to the record they belong to.
 *
 * Nothing is moved and nothing is deleted: the blobs stay where they
 * are, and only the record's `files` grows. The gated file route serves
 * anything under `intake/`, so a reattached path is immediately
 * readable — and if this is ever run twice, `pathname` dedupes it.
 */
export async function reattachOrphan(
  orphan: OrphanFolder,
  now: string
): Promise<IntakeSubmission | null> {
  const text = await readBlob(recordPath(orphan.belongsTo))
  if (!text) return null
  const record = JSON.parse(text) as IntakeSubmission
  const have = new Set(record.files.map((f) => f.pathname))
  const added = orphan.files
    .filter((f) => !have.has(f.pathname))
    .map((f) => ({ ...f, recoveredAt: now }))
  if (added.length === 0) return record
  const repaired: IntakeSubmission = {
    ...record,
    files: [...record.files, ...added],
    // The count was a tally of files that never reached storage. These
    // reached it; they were only unfindable. Correct it rather than
    // leaving the record claiming a loss that has been undone.
    filesFailed: Math.max(0, record.filesFailed - added.length),
  }
  await writeSubmission(repaired)
  return repaired
}

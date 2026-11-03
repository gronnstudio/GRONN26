// The intake reference, computed in exactly one place.
//
// This module exists because there used to be two implementations and
// they disagreed. The browser built the folder name for its uploads with
// one transform (deep-intake) and the server normalised the submission's
// own reference with another (intake-archive), so any project name that
// the two treated differently sent the photographs to one folder and the
// record to a second. `ownFiles` in the submission route then filtered
// every file out for failing a prefix check against the OTHER folder,
// and the studio received an enquiry that described four photographs and
// carried none.
//
// Four inputs triggered it, and only the first was ever suspected:
//
//  · a trailing non-alphanumeric  "Tuin!"                → "tuin-"
//  · a leading one                "'t Gooi"              → "-t-gooi"
//  · a doubled separator          "Tuin -- Noord"        → "tuin--noord"
//  · a 40-character truncation that lands on a separator
//
// So there is one function now, it lives in a module that imports
// nothing, and both ends call it. No `@vercel/blob` import here on
// purpose: `intake-archive.ts` cannot be pulled into a client bundle,
// which is precisely why the browser grew its own copy of this logic in
// the first place.

export const INTAKE_PREFIX = "intake/"

/** The record inside a submission's folder. */
export const INTAKE_RECORD = "submission.json"

/**
 * A string safe to use as a path segment.
 *
 * The visitor names their own project, so this has to survive anything
 * they type — including a slash, which would otherwise invent a folder,
 * and a `..`, which would climb out of the prefix the upload token is
 * built to confine writes to.
 *
 * Order matters: collapse first, then trim, then cap, then trim AGAIN.
 * Without that last pass a cap that lands on a separator reintroduces
 * exactly the trailing dash the earlier trim removed — the fourth
 * trigger above, and the one that survived the first fix.
 */
export function safeReference(value: string): string {
  const clean = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80)
    .replace(/-$/, "")
  return clean || "intake"
}

/** Where one submission's folder sits. Always ends in a slash. */
export function intakeFolder(reference: string): string {
  return `${INTAKE_PREFIX}${safeReference(reference)}/`
}

/** Where one submission's record sits. */
export function recordPath(reference: string): string {
  return `${intakeFolder(reference)}${INTAKE_RECORD}`
}

/**
 * Does this blob path belong to this submission?
 *
 * The single check both the submission route and the file route need.
 * `..` is refused here rather than at each call site, because a path
 * that climbs out of the prefix is the one failure neither of them can
 * afford to forget.
 */
export function ownedBy(pathname: string, reference: string): boolean {
  if (pathname.includes("..")) return false
  const folder = intakeFolder(reference)
  return pathname.startsWith(folder) && pathname !== `${folder}${INTAKE_RECORD}`
}

/**
 * Is this folder an orphan of that record?
 *
 * The recovery half of the same bug. A folder whose name normalises to
 * an existing record's reference, but is not that reference, holds files
 * that were uploaded under the browser's spelling while the record was
 * written under the server's. They belong together.
 */
export function isOrphanOf(folderReference: string, recordReference: string): boolean {
  return (
    folderReference !== recordReference &&
    safeReference(folderReference) === recordReference
  )
}

/* ------------------------------------------------------------- identity */

/**
 * The shape of a server-minted reference: a date and twelve hex
 * characters, e.g. `2026-08-30-a3f19c4e2b71`.
 *
 * The upload token route checks a requested folder against this before
 * it will issue anything. That is the whole guard, and it is worth being
 * precise about what it does and does not buy. It does NOT stop someone
 * inventing a conforming reference of their own — they can, and they
 * will get a token for it. What it stops is them naming a folder that
 * already belongs to a real enquiry, because 48 bits of randomness is
 * not something you arrive at by guessing "2026-08-30-jansen-tuin".
 *
 * Before this, that guess was all it took.
 */
export const INTAKE_REFERENCE_PATTERN = /^\d{4}-\d{2}-\d{2}-[0-9a-f]{12}$/

/** A fresh reference. Server-side only — the browser asks for one. */
export function mintReference(now = new Date()): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `${now.toISOString().slice(0, 10)}-${hex}`
}

/** Was this reference minted by us, rather than typed by a visitor? */
export function isMintedReference(value: string): boolean {
  return INTAKE_REFERENCE_PATTERN.test(value)
}

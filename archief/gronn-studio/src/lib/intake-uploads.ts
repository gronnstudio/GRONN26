// What the intake form accepts, decided once.
//
// This module exists for the same reason `intake-reference.ts` does: the
// rule lived in two places and the two disagreed. The browser accepted
// anything whose MIME type began `image/` or `video/`; the token route
// held a fixed list of eleven types. So a visitor could add a file, watch
// it appear in the tray, fill in forty questions, press send — and have
// the upload refused at the very end with "de upload werd geweigerd" and
// nothing saying which file or why.
//
// Everything a phone or a Mac actually produces is in the list below. The
// gaps that caused this were real formats from real devices: `image/gif`
// (a screen recording saved as a GIF), `image/avif` (Android's newer
// default), `image/tiff` and `image/bmp` (a scanned plan), and the
// `-sequence` HEIC variants Safari reports for a Live Photo.
//
// `application/octet-stream` is deliberately NOT here. Some browsers send
// it when they cannot identify a file, and accepting it would turn this
// allowlist into "anything at all" — which is the one thing a public
// upload endpoint must not be.

/** Everything the studio can actually open. */
export const ACCEPTED_TYPES = [
  // Stills
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  // Drawings and earlier quotations
  "application/pdf",
  // Video. quicktime is the one that catches people out: an iPhone films
  // .mov, and a form that takes "video" and then refuses what every
  // iPhone produces is a form that refuses video.
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
  "video/x-matroska",
  "video/mpeg",
] as const

/** A photograph's ceiling. */
export const MAX_PHOTO_BYTES = 12 * 1024 * 1024
/**
 * Video's own ceiling, because it cannot share a photograph's. A minute
 * of phone footage is routinely 100-150 MB, and a limit that refuses
 * every video ever filmed is a limit that refuses video.
 */
export const MAX_VIDEO_BYTES = 150 * 1024 * 1024

/** The ceiling storage actually enforces — one number, the larger. */
export const MAX_UPLOAD_BYTES = MAX_VIDEO_BYTES

export function isVideoType(type: string): boolean {
  return type.startsWith("video/")
}

/** What this particular file is allowed to weigh. */
export function limitFor(type: string): number {
  return isVideoType(type) ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES
}

export function isAcceptedType(type: string): boolean {
  return (ACCEPTED_TYPES as readonly string[]).includes(type)
}

/** Why a file cannot be sent, or null when it can. */
export type Refusal = "type" | "size" | null

/**
 * The one verdict both ends use.
 *
 * The browser calls it when a file is chosen, so the visitor is told at
 * the moment they can still do something about it. The token route calls
 * the same list at upload time, so the two can never drift apart again.
 */
export function refuse(file: { type: string; size: number }): Refusal {
  if (!isAcceptedType(file.type)) return "type"
  if (file.size > limitFor(file.type)) return "size"
  return null
}

/** A sentence naming what went wrong, for the person who chose the file. */
export function refusalText(reason: Exclude<Refusal, null>, type: string) {
  if (reason === "size") {
    const cap = isVideoType(type) ? "150 MB" : "12 MB"
    return {
      en: `larger than ${cap}`,
      nl: `groter dan ${cap}`,
    }
  }
  return {
    en: "not a file type we can open",
    nl: "geen bestandstype dat wij kunnen openen",
  }
}

/** The `accept` attribute for a file input, from the same list. */
export function acceptAttribute(withDocuments: boolean): string {
  return ACCEPTED_TYPES.filter(
    (t) => withDocuments || t !== "application/pdf"
  ).join(",")
}

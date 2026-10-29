import { expect, test } from "@playwright/test"

import {
  ACCEPTED_TYPES,
  MAX_PHOTO_BYTES,
  MAX_UPLOAD_BYTES,
  MAX_VIDEO_BYTES,
  acceptAttribute,
  isAcceptedType,
  limitFor,
  refuse,
} from "@/lib/intake-uploads"

// The second "two lists that must agree" bug in this form.
//
// The browser accepted anything whose MIME type began `image/` or
// `video/`. The upload route held a fixed list of eleven types. So a
// GIF, an AVIF, a scanned TIFF or a Live Photo passed the tray, survived
// forty questions, and was refused at the very end — and the only thing
// the visitor saw was "2 bestanden niet — de upload werd geweigerd",
// with no way to tell which two or why.
//
// One list now. These assertions are what stops a second one growing
// back, and they name the exact formats that were lost.

/** The formats a real phone or Mac produces that used to be refused. */
const REGRESSIONS = [
  "image/gif",
  "image/avif",
  "image/tiff",
  "image/bmp",
  "image/heic-sequence",
  "image/heif-sequence",
  "video/3gpp2",
  "video/x-matroska",
  "video/mpeg",
]

test.describe("intake uploads", () => {
  test("the formats that were silently refused are accepted", () => {
    for (const type of REGRESSIONS) {
      expect(isAcceptedType(type), type).toBe(true)
    }
  })

  test("the picker offers exactly what the upload will take", () => {
    // The `accept` attribute and the server's allowlist come from one
    // array, so a file the picker offers can never be refused for its
    // type. That equivalence IS the fix.
    const offered = acceptAttribute(true).split(",")
    expect(offered.sort()).toEqual([...ACCEPTED_TYPES].sort())

    // The photograph trays are the same list minus the PDF question,
    // which is the tray's own concern rather than the studio's.
    const withoutDocs = acceptAttribute(false).split(",")
    expect(withoutDocs).not.toContain("application/pdf")
    expect(withoutDocs.length).toBe(ACCEPTED_TYPES.length - 1)
  })

  test("an unidentifiable file is still refused", () => {
    // Some browsers send octet-stream when they cannot name a file.
    // Accepting it would turn the allowlist into "anything at all",
    // which is the one thing a public upload endpoint must not be.
    expect(isAcceptedType("application/octet-stream")).toBe(false)
    expect(isAcceptedType("text/html")).toBe(false)
    expect(isAcceptedType("application/zip")).toBe(false)
    expect(refuse({ type: "application/zip", size: 10 })).toBe("type")
  })

  test("video gets its own ceiling, and storage enforces the larger", () => {
    // A minute of phone footage is routinely 100-150 MB. One ceiling for
    // both would either refuse every video or let a 150 MB "photograph"
    // through.
    expect(limitFor("video/quicktime")).toBe(MAX_VIDEO_BYTES)
    expect(limitFor("image/jpeg")).toBe(MAX_PHOTO_BYTES)
    expect(MAX_UPLOAD_BYTES).toBe(MAX_VIDEO_BYTES)

    expect(refuse({ type: "image/jpeg", size: MAX_PHOTO_BYTES + 1 })).toBe("size")
    expect(refuse({ type: "image/jpeg", size: MAX_PHOTO_BYTES })).toBe(null)
    // The same byte count is fine as video and too large as a still.
    expect(refuse({ type: "video/mp4", size: MAX_PHOTO_BYTES + 1 })).toBe(null)
    expect(refuse({ type: "video/mp4", size: MAX_VIDEO_BYTES + 1 })).toBe("size")
  })

  test("type is judged before size", () => {
    // A .zip of 400 MB is refused for what it is, not for its weight —
    // telling someone to shrink a file we would never open either way
    // sends them off to do pointless work.
    expect(refuse({ type: "application/zip", size: MAX_VIDEO_BYTES * 2 })).toBe("type")
  })
})

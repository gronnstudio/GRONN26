import { NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"

import { head } from "@vercel/blob"

import {
  INTAKE_PREFIX,
  INTAKE_RECORD,
  isMintedReference,
} from "@/lib/intake-reference"
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/intake-uploads"

// Token issuer for intake photographs.
//
// The browser uploads STRAIGHT to Blob storage; the file never passes
// through this function. That is not an optimisation — a serverless
// function body is capped at 4.5 MB on Vercel, and two photographs off a
// modern phone already exceed it. Routing the files through a handler
// would fail on precisely the submissions worth having.
//
// This endpoint is public, because the form it serves is. So the token
// it hands out is deliberately small: images only, one file's worth of
// bytes, and an expiry short enough that a copied token is worth little.
// Those three are the whole defence, and they are enforced by the
// storage service rather than by anything here that could be skipped.

// The ceiling and the type list both come from `intake-uploads.ts`, and
// that is the point of this change rather than a tidy-up.
//
// The browser accepted anything whose type began `image/` or `video/`;
// this route held its own fixed list of eleven. So a visitor could add a
// GIF, an AVIF, a TIFF or a Live Photo, watch it appear in the tray, fill
// in forty questions, and have the upload refused at the very end with
// nothing saying which file or why. One list now, imported by both.
//
// The size ceiling is set by VIDEO. A photograph is capped far lower on
// the client, but this token is what storage actually enforces, and one
// number has to cover the largest thing the form accepts.

const TOKEN_TTL_MS = 60 * 60 * 1000

/**
 * The one misconfiguration that looks like a working store.
 *
 * `@vercel/blob` reaches for credentials in TWO different ways, and only
 * one of them is documented as "link the store and you are done":
 *
 *   · `put`, `head`, `list` go through `resolveBlobAuth`, which accepts
 *     `BLOB_READ_WRITE_TOKEN` *or* Vercel's OIDC identity together with
 *     `BLOB_STORE_ID`.
 *   · `handleUpload` — this route, and nothing else in the codebase —
 *     goes through `getReadWriteBlobTokenFromOptionsOrEnv`, which has no
 *     OIDC path at all. Without `BLOB_READ_WRITE_TOKEN` it throws.
 *
 * So a store linked the modern way answers every server-side write and
 * refuses every browser upload. That is exactly what production did: the
 * submission record was stored (`POST /api/intake` → 200) while all four
 * file attempts were refused (`POST /api/intake/photo` → 400), which
 * reads like a problem with the files and is not one.
 *
 * The SDK's own message ("No read-write token found") is true and still
 * sends you looking in the wrong place, because the store demonstrably
 * works everywhere else. This says the part that was missing.
 */
function readWriteTokenMissing(): string | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) return null
  if (!process.env.BLOB_STORE_ID) {
    return "no Blob store is configured at all (neither BLOB_READ_WRITE_TOKEN nor BLOB_STORE_ID is set)"
  }
  return (
    "BLOB_STORE_ID is set but BLOB_READ_WRITE_TOKEN is not. " +
    "Writing the submission record still works, because put() can use " +
    "Vercel's OIDC identity — but handleUpload() cannot, so every file " +
    "upload is refused. Add BLOB_READ_WRITE_TOKEN for Production and " +
    "Preview."
  )
}

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  // Before the SDK gets a chance to say something less useful.
  const misconfigured = readWriteTokenMissing()
  if (misconfigured) {
    console.error(`[gronn] intake upload token refused — ${misconfigured}`)
    return NextResponse.json(
      { error: "upload refused", reason: "store" },
      { status: 400 }
    )
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        // Everything this endpoint issues is confined to one prefix, so
        // a token can never be turned on the editor's images or on the
        // published content store.
        if (!pathname.startsWith(INTAKE_PREFIX) || pathname.includes("..")) {
          throw new Error("out of scope")
        }
        // And within that prefix, only to a folder the SERVER named.
        //
        // This endpoint is public and has to be — the form it serves is.
        // So until it minted its own references, the folder came from the
        // visitor's project name, which meant anyone could ask for a
        // token scoped to `intake/2026-08-30-jansen-tuin/` and write into
        // a real client's dossier. The owner would then have seen those
        // files as that client's evidence.
        //
        // A minted reference is a date plus 48 random bits. A caller can
        // still invent a conforming one and upload into a folder of their
        // own — which is inert, since no record points at it — but they
        // cannot land in somebody else's.
        const folder = pathname.slice(INTAKE_PREFIX.length).split("/")[0]
        if (!folder) throw new Error("out of scope")
        if (!isMintedReference(folder) && (await claimed(folder))) {
          // An unminted folder is a form that was loaded before the
          // server started naming them — the tab was already open when
          // the deploy landed. Refusing those outright cost a real
          // visitor two files with nothing but "de upload werd geweigerd"
          // to show for it.
          //
          // So an unminted name is allowed only into a folder that does
          // not already hold a submission. That keeps the property this
          // check was added for — nobody writes into an existing dossier
          // by guessing its name — while a form loaded five minutes ago
          // still finishes its own upload.
          throw new Error("folder already claimed")
        }
        return {
          allowedContentTypes: [...ACCEPTED_TYPES],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          validUntil: Date.now() + TOKEN_TTL_MS,
          // Two visitors can send a photograph called IMG_0001.jpg on
          // the same day. Without a suffix the second would overwrite
          // the first, and the studio would open one enquiry holding
          // another's garden.
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // Nothing to record: the submission itself carries the URLs, and
        // this callback does not reach a local dev server anyway.
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    const lower = message.toLowerCase()

    // THE REAL MESSAGE GOES IN THE SERVER LOG, and that line is the
    // whole point of this change.
    //
    // #103 made the browser record why an upload failed, and it worked:
    // it produced "Vercel Blob: Failed to retrieve the client token".
    // But that is the SDK's own sentence for "the token request did not
    // come back", and the SDK never reads the body of our reply — so
    // whatever reason we put in it is discarded before anyone sees it.
    // The visitor's screen and the stored record therefore say the same
    // thing for a refused file type, a wrong folder and a store that is
    // not configured at all.
    //
    // Those are not the same problem. The first two are the visitor's,
    // the third is the studio's, and only the studio can read this log.
    console.error(
      `[gronn] intake upload token refused — ${message || "unknown error"}`
    )

    // A coarse reason for the browser, deliberately: it names the file
    // and the kind of problem, and nothing that describes the store or
    // the token.
    const reason = message.includes("scope") || message.includes("claimed")
      ? "path"
      : lower.includes("content type")
        ? "type"
        : lower.includes("size")
          ? "size"
          // "No read-write token found", and anything else the store
          // says about itself. Separated from the flat "refused" because
          // it means the STUDIO has something to fix, not the visitor —
          // and because a refusal that is really an outage should never
          // read as "your file was not allowed".
          : lower.includes("token") || lower.includes("store")
            ? "store"
            : "refused"
    return NextResponse.json({ error: "upload refused", reason }, { status: 400 })
  }
}

/**
 * Does a submission already live in this folder?
 *
 * `head` rather than a listing: one metadata lookup, and a miss is the
 * common case. Private first, then public, because the record falls back
 * to public where the store refuses a private write.
 */
async function claimed(folder: string): Promise<boolean> {
  const path = `${INTAKE_PREFIX}${folder}/${INTAKE_RECORD}`
  try {
    await head(path)
    return true
  } catch {
    return false
  }
}

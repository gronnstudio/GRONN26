import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

import { getOwnerSession } from "@/lib/auth"

// Photo upload for the editor. Images land in Vercel Blob under
// images/; the returned URL goes into the draft and ships with the next
// publish.
const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

/**
 * The body, or null if it exceeds `limit`.
 *
 * Cancels the stream at the first chunk that crosses the line rather
 * than reading to the end, so an oversized upload costs the limit and
 * not its own size.
 */
async function readLimited(
  request: Request,
  limit: number
): Promise<Blob | null> {
  if (!request.body) return new Blob([])
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > limit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  // A Blob rather than a Uint8Array: it is what put() accepts, and it
  // keeps this free of Node's Buffer so the route stays runtime-neutral.
  return new Blob(chunks as BlobPart[])
}

export async function POST(request: Request) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const type = request.headers.get("content-type") ?? ""
  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "unsupported type" }, { status: 415 })
  }
  // `content-length` is a claim the client makes about itself. It can
  // be omitted entirely (chunked transfer encoding) or simply be
  // wrong — and `Number(null ?? 0)` is 0, which passes. So this header
  // check enforced nothing: a body of any size with no content-length
  // went straight into arrayBuffer() and was buffered whole.
  //
  // It stays as a cheap early-out — refusing an upload that ANNOUNCES
  // itself as oversize saves reading it — but it is no longer the
  // enforcement.
  const claimed = Number(request.headers.get("content-length"))
  if (Number.isFinite(claimed) && claimed > MAX_BYTES) {
    return NextResponse.json({ error: "too large (max 8 MB)" }, { status: 413 })
  }

  const filename = new URL(request.url).searchParams.get("filename") ?? "photo.jpg"
  const safe = filename.toLowerCase().replace(/[^a-z0-9._-]/g, "-")
  const pathname = `images/${Date.now()}-${safe}`

  // The actual enforcement: count the bytes as they arrive and stop the
  // moment the limit is passed. Reading first and measuring after would
  // still buffer the whole body, so a lying client could exhaust memory
  // and only then be told no.
  const bytes = await readLimited(request, MAX_BYTES)
  if (!bytes) {
    return NextResponse.json({ error: "too large (max 8 MB)" }, { status: 413 })
  }

  // Public store: direct CDN URL. Private store: the photo is served
  // through /api/img/<pathname> instead.
  try {
    const blob = await put(pathname, bytes, {
      access: "public",
      addRandomSuffix: false,
      contentType: type,
    })
    return NextResponse.json({ url: blob.url })
  } catch {
    await put(pathname, bytes, {
      access: "private",
      addRandomSuffix: false,
      contentType: type,
    })
    return NextResponse.json({ url: `/api/img/${pathname}` })
  }
}

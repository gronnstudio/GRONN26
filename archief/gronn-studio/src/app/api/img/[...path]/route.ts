import { get } from "@vercel/blob"

// Serves editor-uploaded photos from a PRIVATE Blob store. Upload paths
// are timestamped and never reused, so responses cache immutably at the
// CDN — visitors hit storage once per image, not per view. (When the
// store is public, uploads get direct CDN URLs and this route is idle.)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const pathname = path.join("/")
  if (!pathname.startsWith("images/") || pathname.includes("..")) {
    return new Response("bad path", { status: 400 })
  }

  try {
    const result = await get(pathname, { access: "private" })
    if (!result) return new Response("not found", { status: 404 })
    return new Response(result.stream, {
      headers: {
        "Content-Type":
          (result.blob as { contentType?: string }).contentType ??
          "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("unavailable", { status: 503 })
  }
}

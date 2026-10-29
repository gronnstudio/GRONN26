import { getOwnerSession } from "@/lib/auth"
import { getIntakeBlob, INTAKE_PREFIX } from "@/lib/intake-archive"

// Serves one intake attachment, to the owner and to nobody else.
//
// These are photographs of people's houses and, since #92, cadastral
// drawings with addresses on them. The editor's `/api/img` route is
// deliberately open — it serves the site's own published photography —
// and reusing it here would have put a client's garden on a public URL
// with only an unguessable name between it and the world. So this is a
// separate route with the session check in front of it, and the blobs
// themselves are written PRIVATE.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await getOwnerSession()
  if (!session) return new Response("unauthorized", { status: 401 })

  const { path } = await params
  const pathname = path.join("/")
  // Confined to the prefix, and `..` refused: the path comes from a
  // stored record, but a record is only ever as trustworthy as what
  // wrote it, and this is the last place to check.
  if (!pathname.startsWith(INTAKE_PREFIX) || pathname.includes("..")) {
    return new Response("bad path", { status: 400 })
  }

  try {
    // Private first, then public — `getIntakeBlob`, the same two-step the
    // archive uses to read its own records.
    //
    // This asked for private and nothing else until now. That is not what
    // the archive guarantees: a store that refuses a private write makes
    // both `writeSubmission` and the browser fall back to public, and
    // `filesIn` labels every listed blob private because a listing does
    // not say which side it is on. So the one route that actually serves
    // these files answered 404 over photographs that were sitting in
    // storage — the gallery drew a broken tile and the enquiry looked
    // like it had arrived with nothing attached.
    const result = await getIntakeBlob(pathname)
    if (!result) return new Response("not found", { status: 404 })
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        // Never a shared cache: these are photographs of clients' houses
        // and this response is shaped by who authenticated for it.
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return new Response("unavailable", { status: 503 })
  }
}

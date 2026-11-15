import { get, list } from "@vercel/blob"
import { claudeMag } from "@/lib/crm/claude-sleutel"

// Claude laat Nicks Media (dashboard/media) bekijken om beelden voor de site
// te kiezen (Nick, 15 nov 2026: "kijk in media en zie wat je kunt gebruiken").
// Alleen lezen, alleen onder media/, alleen met CRM_CLAUDE_TOKEN.
// GET            -> lijst (pad, grootte, datum)
// GET ?pad=media/… -> het bestand zelf

export const dynamic = "force-dynamic"
const nee = () => Response.json({ fout: "Geen toegang" }, { status: 401 })

export async function GET(req: Request) {
  if (!claudeMag(req)) return nee()
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ fout: "Opslag staat uit" }, { status: 503 })
  const pad = new URL(req.url).searchParams.get("pad")
  if (pad) {
    if (!pad.startsWith("media/") || pad.includes("..")) return Response.json({ fout: "Ongeldig pad" }, { status: 400 })
    const r = await get(pad, { access: "private" }).catch(() => null)
    if (!r?.stream) return Response.json({ fout: "Niet gevonden" }, { status: 404 })
    return new Response(r.stream, { headers: { "Content-Type": r.blob.contentType ?? "application/octet-stream", "Cache-Control": "no-store" } })
  }
  const blobs: { pad: string; grootte: number; datum: string }[] = []
  for (let cursor: string | undefined, eerst = true; eerst || cursor; eerst = false) {
    const r = await list({ prefix: "media/", limit: 1000, cursor })
    blobs.push(...r.blobs.map((b) => ({ pad: b.pathname, grootte: b.size, datum: b.uploadedAt.toISOString() })))
    cursor = r.hasMore ? r.cursor : undefined
  }
  return Response.json(blobs)
}

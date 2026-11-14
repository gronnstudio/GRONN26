import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { get } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { rol } from "@/lib/crm/toegang"

// Media van de eigenaar (eigenaar, 14 nov 2026: "maak een pagina waar ik content kan uploaden").
// POST geeft de browser een kort geldig uploadtoken, alleen voor de ingelogde eigenaar;
// het bestand gaat daarna rechtstreeks van de browser naar Vercel Blob (privé), zodat
// ook video's groter dan de 4,5 MB-grens van een functie passen.
// GET toont een bestand, ook alleen voor de eigenaar.

const MEDIA_MAP = "media/"
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/gif", "video/mp4", "video/quicktime", "video/webm"]
const MAX = 1024 * 1024 * 1024 // 1 GB per bestand

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HandleUploadBody
  // eerst de deur: zonder eigenaarsessie geen token (de melding na het uploaden ondertekent Vercel zelf)
  if (body.type === "blob.generate-client-token" && (await rol()) !== "eigenaar") return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 })
  try {
    const antwoord = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pad) => {
        if ((await rol()) !== "eigenaar") throw new Error("Niet ingelogd")
        if (!pad.startsWith(MEDIA_MAP) || pad.includes("..")) throw new Error("Ongeldig pad")
        return { allowedContentTypes: TYPES, maximumSizeInBytes: MAX, addRandomSuffix: true }
      },
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(antwoord)
  } catch (fout) {
    return NextResponse.json({ error: (fout as Error).message }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  if ((await rol()) !== "eigenaar") return new NextResponse("Niet ingelogd", { status: 401 })
  const pad = req.nextUrl.searchParams.get("pad") ?? ""
  if (!pad.startsWith(MEDIA_MAP) || pad.includes("..")) return new NextResponse("Ongeldig pad", { status: 400 })
  // video's: byte ranges doorgeven, zodat voorbeeld en zoeken niet steeds het hele bestand halen
  const range = req.headers.get("range")
  const r = await get(pad, { access: "private", ...(range ? { headers: { range } } : {}) }).catch(() => null)
  if (!r?.stream) return new NextResponse("Niet gevonden", { status: 404 })
  const kop = new Headers({ "Content-Type": r.blob.contentType ?? "application/octet-stream", "Cache-Control": "private, max-age=3600", "Accept-Ranges": "bytes" })
  for (const k of ["content-length", "content-range"]) {
    const v = r.headers.get(k)
    if (v) kop.set(k, v)
  }
  return new NextResponse(r.stream, { status: r.headers.get("content-range") ? 206 : 200, headers: kop })
}

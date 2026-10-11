import Anthropic from "@anthropic-ai/sdk"
import { del, get, list, put } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { nieuweId, opslagAan } from "@/lib/beheer/stand"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// "Stuur een foto van je vijver" op Kennismaken (11 okt 2026): een bezoeker
// kiest een foto, de browser verkleint hem tot hooguit 1600px JPG, en hier
// (1) bewaren we hem privé in Vercel Blob (30 dagen), zodat Nick hem via de
// link in de mail kan zien, en (2) geeft Claude een eerste inschatting van een paar
// zinnen. Lukt een van de twee niet, dan gaat het formulier gewoon door.
// GET is alleen voor de ingelogde eigenaar: de foto bekijken.

const MAX_BYTES = 2_500_000
const PER_UUR = 6
const pogingen = new Map<string, number[]>() // per serverinstantie; genoeg om misbruik af te remmen

const OPDRACHT = `Je kijkt mee voor Nick Peters van GRØNN Studio, die vijvers en natuurlijke tuinen maakt en onderhoudt in Stein en omgeving. Een huiseigenaar stuurt een foto van zijn of haar vijver of tuin.
Geef in het Nederlands, in hooguit drie korte zinnen zonder opsommingstekens of markdown, een eerste inschatting: wat je ziet (bijvoorbeeld waterkleur, algen, draadalg, blad, planten, rand, folie) en wat waarschijnlijk de eerste stap is. Schrijf voorzichtig ("lijkt", "waarschijnlijk"), noem geen prijzen en beloof niets; Nick kijkt zelf ook. Is het geen vijver of tuin, of is de foto niet te beoordelen, zeg dat dan vriendelijk in één zin. Eindig niet met een vraag.`

function teVaak(ip: string) {
  const nu = Date.now()
  const recent = (pogingen.get(ip) ?? []).filter((t) => nu - t < 3_600_000)
  recent.push(nu)
  pogingen.set(ip, recent)
  return recent.length > PER_UUR
}

async function inschatting(jpg: Buffer): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  const client = new Anthropic()
  try {
    const antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: jpg.toString("base64") } },
            { type: "text", text: OPDRACHT },
          ],
        },
      ],
    })
    if (antwoord.stop_reason === "refusal") return null
    const tekst = antwoord.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(" ").trim()
    return tekst || null
  } catch (fout) {
    if (fout instanceof Anthropic.APIError) return null
    throw fout
  }
}

/** Foto's ouder dan 30 dagen weg (privacyverklaring); fouten hier houden niets tegen. */
async function ruimOp() {
  const grens = Date.now() - 30 * 24 * 60 * 60 * 1000
  const { blobs } = await list({ prefix: "vijverfotos/", limit: 1000 })
  const oud = blobs.filter((b) => new Date(b.uploadedAt).getTime() < grens).map((b) => b.url)
  if (oud.length) await del(oud)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "onbekend"
  if (teVaak(ip)) return NextResponse.json({ fout: "te-vaak" }, { status: 429 })
  const data = await request.formData().catch(() => null)
  const foto = data?.get("foto")
  if (!(foto instanceof File) || foto.type !== "image/jpeg" || foto.size === 0 || foto.size > MAX_BYTES)
    return NextResponse.json({ fout: "foto" }, { status: 400 })
  const jpg = Buffer.from(await foto.arrayBuffer())

  const id = nieuweId()
  const [bewaard, tekst] = await Promise.all([
    opslagAan()
      ? put(`vijverfotos/${id}.jpg`, jpg, { access: "private", addRandomSuffix: false, contentType: "image/jpeg" }).then(
          () => true,
          () => false,
        )
      : Promise.resolve(false),
    inschatting(jpg),
  ])
  if (bewaard) await ruimOp().catch(() => {})
  return NextResponse.json({ id: bewaard ? id : null, inschatting: tekst })
}

export async function GET(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return new NextResponse("Niet ingelogd", { status: 401 })
  const id = request.nextUrl.searchParams.get("id") ?? ""
  if (!/^[0-9a-f-]{36}$/.test(id) || !opslagAan()) return new NextResponse("Niet gevonden", { status: 404 })
  const r = await get(`vijverfotos/${id}.jpg`, { access: "private" }).catch(() => null)
  if (!r?.stream) return new NextResponse("Niet gevonden", { status: 404 })
  return new NextResponse(r.stream, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" } })
}

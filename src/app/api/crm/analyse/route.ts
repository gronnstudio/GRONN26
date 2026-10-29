import Anthropic from "@anthropic-ai/sdk"
import { revalidatePath } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { gebeurtenis, leesKlanten, wijzigKlanten } from "@/lib/beheer/klanten"
import { leesVragenlijst } from "@/lib/beheer/vragenlijst"
import { leesBestand } from "@/lib/crm/opslag"
import { MAX_FOTOS, SCHEMA, opdracht, schoonBevindingen } from "@/lib/crm/ai/beeld"

// "Analyseer met Claude" bij een tuinopname: de foto's (ook beelden uit een
// video) gaan met de tuin, de zones en de vragen naar Claude; terug komen
// bevindingen als voorstel. Geen klantgegevens in de opdracht. Eén aanroep per
// klik, geen automatische herhaling die geld kost. Elke aanroep komt met het
// aantal tokens in de tijdlijn van de klant.

export const maxDuration = 120
const ID = /^[0-9a-z-]{1,64}$/
const FOTO = /^[0-9a-f-]{36}$/

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

export async function POST(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 })
  const invoer = (await request.json().catch(() => ({}))) as { klant?: unknown; tuin?: unknown; fotos?: unknown }
  const klantId = String(invoer.klant ?? "")
  const tuinId = String(invoer.tuin ?? "")
  if (!ID.test(klantId) || !ID.test(tuinId)) return NextResponse.json({ fout: "Onbekende tuin" }, { status: 400 })
  const [klanten, lijst] = await Promise.all([leesKlanten(), leesVragenlijst()])
  const t = klanten.find((k) => k.id === klantId)?.tuinen.find((x) => x.id === tuinId)
  if (!t) return NextResponse.json({ fout: "Onbekende tuin" }, { status: 404 })
  // Alleen foto's die bij deze tuin horen.
  const gevraagd = new Set(Array.isArray(invoer.fotos) ? invoer.fotos.map(String).filter((f) => FOTO.test(f)) : [])
  const fotos = t.fotos.filter((f) => gevraagd.has(f.id)).slice(0, MAX_FOTOS)
  if (!fotos.length) return NextResponse.json({ fout: "Kies eerst foto's van deze tuin." }, { status: 400 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ fout: "Claude is niet ingesteld." }, { status: 503 })

  const beelden = await Promise.all(
    fotos.map(async (f) => {
      const stroom = await leesBestand(`crm/fotos/${f.id}.jpg`)
      return stroom ? Buffer.from(await new Response(stroom).arrayBuffer()).toString("base64") : null
    }),
  )
  const mee = fotos.filter((_, i) => beelden[i])
  if (!mee.length) return NextResponse.json({ fout: "De foto's zijn niet gevonden." }, { status: 404 })

  const client = new Anthropic()
  let antwoord
  try {
    antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            ...beelden.flatMap((b) => (b ? [{ type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data: b } }] : [])),
            { type: "text", text: opdracht(lijst, t, mee.map((f, i) => ({ nr: i + 1, bijschrift: f.bijschrift, zone: f.zone, tijd: f.tijd }))) },
          ],
        },
      ],
    })
  } catch (fout) {
    if (fout instanceof Anthropic.APIError) {
      console.error("analyse", fout.status, fout.message)
      return NextResponse.json({ fout: "Analyse lukte niet, probeer het opnieuw." }, { status: 502 })
    }
    throw fout
  }
  const tekst = antwoord.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("")
  let ruw: { bevindingen?: unknown } | null = null
  try {
    ruw = antwoord.stop_reason === "refusal" ? null : JSON.parse(tekst)
  } catch {}
  // Weigering of onleesbaar antwoord: een fout, en de foto's blijven nieuw zodat Nick het opnieuw kan proberen.
  if (!ruw || !Array.isArray(ruw.bevindingen)) return NextResponse.json({ fout: "Analyse lukte niet, probeer het opnieuw." }, { status: 502 })
  const bevindingen = schoonBevindingen(ruw, lijst, t, mee.map((f) => f.id), vandaag())
  const tokens = antwoord.usage.input_tokens + antwoord.usage.output_tokens

  await wijzigKlanten((lijstK) =>
    lijstK.map((k) =>
      k.id !== klantId
        ? k
        : {
            ...k,
            tuinen: k.tuinen.map((x) =>
              x.id === tuinId
                ? { ...x, fotos: x.fotos.map((f) => (mee.some((m) => m.id === f.id) ? { ...f, bekeken: true } : f)), bevindingen: [...bevindingen, ...x.bevindingen].slice(0, 200) }
                : x,
            ),
            activiteit: [gebeurtenis("Opname", `${fotoTal(mee.length)} van ${t.naam} bekeken door Claude: ${bevindingen.length} voorstel${bevindingen.length === 1 ? "" : "len"} (${antwoord.model}, ${tokens.toLocaleString("nl-NL")} tokens).`, "Grønn"), ...k.activiteit],
          },
    ),
  )
  revalidatePath("/dashboard/klanten", "layout")
  return NextResponse.json({ aantal: bevindingen.length })
}

const fotoTal = (n: number) => (n === 1 ? "1 foto" : `${n} foto's`)

import Anthropic from "@anthropic-ai/sdk"
import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// Vrije tekst in de calculatie omzetten naar Nicks werkomschrijving (Nick, 2 nov
// 2026). Grønn deelt alleen op in fasen en posten; bedragen neemt hij alleen
// over als ze in de tekst staan. Totalen en termijnen rekent de code
// (opmaakTekst). Alleen voor de ingelogde eigenaar.
const OPDRACHT = `Je zet de werkbeschrijving van Nick Peters (GRØNN Studio, hovenier) om naar een nette werkomschrijving voor de klant.
- Deel op in fasen als de tekst fasen of momenten noemt ("Fase 1 — November 2026"); anders één fase met een lege naam.
- Elke post: een korte titel ("Sloop- en grondwerk") en een toelichting van één of twee zinnen met de maten en hoeveelheden uit de tekst. Verzin geen maten.
- bedrag: alleen een bedrag excl. btw in euro dat letterlijk bij die post in de tekst staat, anders null. Reken niets uit.
- nagaan: true als de tekst zegt dat de post gewijzigd is, een stelpost is of opnieuw beoordeeld moet worden.
- extra: losse onderdelen met eigen uitleg of lijstjes (bijv. "15. Houten muurbekleding — 5 m²") die niet in een tabelregel passen; tekst in markdown met - voor lijstjes.
- voorbehoud: wat de tekst zegt over voorbehoud of nog niet definitieve prijzen, in één of twee zinnen; anders leeg.
Schrijf in helder Nederlands, in de woorden van Nick.`

const SCHEMA = {
  type: "object",
  properties: {
    fasen: {
      type: "array",
      items: {
        type: "object",
        properties: {
          naam: { type: "string" },
          posten: {
            type: "array",
            items: {
              type: "object",
              properties: { titel: { type: "string" }, toelichting: { type: "string" }, bedrag: { type: ["number", "null"] }, nagaan: { type: "boolean" } },
              required: ["titel", "toelichting", "bedrag", "nagaan"],
              additionalProperties: false,
            },
          },
        },
        required: ["naam", "posten"],
        additionalProperties: false,
      },
    },
    extra: { type: "array", items: { type: "object", properties: { titel: { type: "string" }, tekst: { type: "string" } }, required: ["titel", "tekst"], additionalProperties: false } },
    voorbehoud: { type: "string" },
  },
  required: ["fasen", "extra", "voorbehoud"],
  additionalProperties: false,
}

export async function POST(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return new NextResponse("Niet ingelogd", { status: 401 })
  const { beschrijving } = (await request.json()) as { beschrijving?: string }
  if (!beschrijving?.trim()) return NextResponse.json({ fout: "Schrijf eerst wat er moet gebeuren." }, { status: 400 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ fout: "Claude is niet ingesteld." }, { status: 503 })
  const client = new Anthropic()
  try {
    const antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: OPDRACHT,
      messages: [{ role: "user", content: beschrijving.slice(0, 12000) }],
    })
    const tekst = antwoord.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("")
    if (antwoord.stop_reason === "refusal" || !tekst) return NextResponse.json({ fout: "Geen omzetting gekregen, probeer het nog eens." }, { status: 502 })
    return NextResponse.json(JSON.parse(tekst))
  } catch (fout) {
    if (fout instanceof Anthropic.RateLimitError) return NextResponse.json({ fout: "Even te druk, probeer het zo nog eens." }, { status: 429 })
    if (fout instanceof Anthropic.APIError) {
      console.error("werkomschrijving", fout.status, fout.message)
      return NextResponse.json({ fout: "Claude is nu niet bereikbaar." }, { status: 502 })
    }
    throw fout
  }
}

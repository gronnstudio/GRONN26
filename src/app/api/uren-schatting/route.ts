import Anthropic from "@anthropic-ai/sdk"
import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// Urenschatting voor het rekenblad /dashboard/prijs (eigenaar, 29 okt 2026:
// "kun je jezelf hierin inbouwen zodat we aan de hand van een beschrijving een
// uren suggestie kunnen doen?"). Alleen voor de ingelogde eigenaar. Het is een
// voorstel: Nick past het getal aan voordat hij een prijs noemt.
const OPDRACHT = `Je schat hoeveel uur Nick Peters (GRØNN Studio, hovenier, werkt meestal alleen, Stein en omgeving) nodig heeft voor een klus. Reken voor één man, tenzij de beschrijving een helper noemt.
Tel alles mee wat hij echt doet: opmeten en uitzetten, materiaal ophalen of in ontvangst nemen, laden, rijden naar de klus, het werk zelf, opruimen en afvoeren. Tel offertewerk niet mee.

Vuistregels voor één man (pas aan op wat de beschrijving zegt over toegang, grond en hoogteverschil):
- Bestrating opbreken met de hand: 20 tot 30 m² per dag; laden in container erbij.
- Afgraven met minigraver: 15 tot 25 m³ per dag; zonder machine een kwart daarvan.
- Fundering verdelen, op hoogte brengen en trillen: 40 tot 60 m² per dag.
- Klinkers of waaltjes straten in halfsteens of keper: 8 tot 12 m² per dag; visgraat of veel snijwerk 6 tot 8 m².
- Opsluitbanden zetten: 20 tot 30 m per dag. Stapelblokken keermuur: 4 tot 6 m² muurvlak per dag.
- Graszoden: grond losmaken, egaliseren en leggen 40 tot 60 m² per dag.
- Planten in P9 of 1-liter pot: 80 tot 120 per dag inclusief grondverbetering; heesters en klimplanten 20 tot 30 per dag.
- Dubbelstaafmathekwerk: 8 tot 12 m per dag.
- Vijver: leegpompen, slib en vissen eruit is minstens een dag; een renovatie met nieuwe filter en beekloop kostte eerder ruim 120 uur.
Ervaring van Nick: 62 m² parkeervak met grondkering en grassenborder is 6 dagen; 100 m² graszoden met egaliseren is 3 dagen; een achtertuin met sloop, pad, hekwerk, gazon en borders is ongeveer 90 uur.
Een werkdag is 8 uur. Tel 10 procent op voor tegenvallers en rond af op hele uren.
Antwoord in het Nederlands. Noem in aannames kort wat je hebt aangenomen omdat het niet in de beschrijving stond.`

const SCHEMA = {
  type: "object",
  properties: {
    uren: { type: "number", description: "Totaal aantal uur, inclusief de 10 procent marge" },
    posten: {
      type: "array",
      items: {
        type: "object",
        properties: { wat: { type: "string" }, uren: { type: "number" } },
        required: ["wat", "uren"],
        additionalProperties: false,
      },
    },
    aannames: { type: "string" },
  },
  required: ["uren", "posten", "aannames"],
  additionalProperties: false,
}

export async function POST(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return new NextResponse("Niet ingelogd", { status: 401 })
  const { beschrijving } = (await request.json()) as { beschrijving?: string }
  if (!beschrijving?.trim()) return NextResponse.json({ fout: "Beschrijf eerst de klus." }, { status: 400 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ fout: "Claude is niet ingesteld." }, { status: 503 })

  const client = new Anthropic()
  try {
    const antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: OPDRACHT,
      messages: [{ role: "user", content: beschrijving.slice(0, 4000) }],
    })
    const tekst = antwoord.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("")
    if (antwoord.stop_reason === "refusal" || !tekst) return NextResponse.json({ fout: "Geen schatting gekregen, probeer het nog eens." }, { status: 502 })
    return NextResponse.json(JSON.parse(tekst))
  } catch (fout) {
    if (fout instanceof Anthropic.RateLimitError) return NextResponse.json({ fout: "Even te druk, probeer het zo nog eens." }, { status: 429 })
    if (fout instanceof Anthropic.APIError) {
      console.error("uren-schatting", fout.status, fout.message)
      return NextResponse.json({ fout: "Claude is nu niet bereikbaar." }, { status: 502 })
    }
    throw fout
  }
}

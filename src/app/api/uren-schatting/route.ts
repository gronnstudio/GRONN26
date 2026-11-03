import Anthropic from "@anthropic-ai/sdk"
import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { voorClaude } from "@/lib/crm/catalogus"
import { toonEuro } from "@/lib/crm/geld"

// Urenschatting voor het rekenblad /dashboard/prijs (eigenaar, 29 okt 2026:
// "kun je jezelf hierin inbouwen zodat we aan de hand van een beschrijving een
// uren suggestie kunnen doen?"). Alleen voor de ingelogde eigenaar. Het is een
// voorstel: Nick past het getal aan voordat hij een prijs noemt. Sinds dezelfde
// dag vult hij ook machines, containers en materiaal als losse regels in
// ("dat hij automatisch regels maakt ipv alles in 1 regel te knallen").
const OPDRACHT = `Je schat hoeveel uur Nick Peters (GRØNN Studio, ervaren hovenier, werkt meestal alleen, Stein en omgeving) nodig heeft voor een klus, en welke machines, containers en materialen erbij horen. Reken voor één man, tenzij de beschrijving een helper noemt.

Uren: tel het werk zelf, opmeten en uitzetten, en opruimen. Rijden en materiaal in ontvangst nemen tel je samen als één post van hooguit een half uur per werkdag. Tel offertewerk niet mee.
Nick vindt eerdere schattingen te ruim, ook na een eerste correctie (29 okt 2026: "krapper"). Hij werkt snel: neem per post de snelle kant van de vuistregel en rond naar beneden af. Opmeten en uitzetten is hooguit 2 uur. De marge komt er één keer bovenop, niet per post.

Vuistregels voor één man (pas aan op wat de beschrijving zegt over toegang, grond en hoogteverschil):
- Bestrating opbreken: met minigraver 100 tot 150 m² per dag, met de hand 40 tot 60 m² per dag; laden in container zit erin.
- Beplanting rooien: met minigraver 150 tot 200 m² per dag, met de hand 50 tot 70 m².
- Afgraven met minigraver en dumper: 40 tot 60 m³ per dag; met minigraver zonder dumper 25 tot 35 m³; met de hand een kwart daarvan.
- Fundering (korrelmix, zand) verdelen, op hoogte brengen en trillen: met minigraver of dumper 120 tot 160 m² per dag, met de hand 60 tot 80 m².
- Klinkers of waaltjes straten in halfsteens of keper: 20 tot 25 m² per dag; visgraat of veel snijwerk 14 tot 16 m².
- Opsluitbanden zetten: 40 tot 50 m per dag. Stapelblokken keermuur: 6 tot 8 m² muurvlak per dag.
- Graszoden: grond losmaken, egaliseren en leggen 60 tot 80 m² per dag.
- Planten in P9 of 1-liter pot: 150 tot 200 per dag inclusief grondverbetering; heesters en klimplanten 30 tot 40 per dag.
- Dubbelstaafmathekwerk: 15 tot 20 m per dag.
- Vijver: leegpompen, slib en vissen eruit is minstens een dag; een renovatie met nieuwe filter en beekloop kostte eerder ruim 120 uur.
IJk aan wat Nick echt deed: 62 m² parkeervak met opbreken, afgraven, fundering, straten, grondkering en grassenborder in 6 dagen van 8 uur; 100 m² graszoden met egaliseren in 3 dagen; een achtertuin met sloop, pad, hekwerk, gazon en borders ongeveer 90 uur. Vergelijkbare klussen komen daar niet boven uit; reken liever iets onder deze ijkpunten.
Een werkdag is 8 uur. Tel 5 procent op voor tegenvallers en rond af op hele uren.

Regels voor machines en materiaal: maak voor elke machine, container en elk materiaal dat de beschrijving noemt of dat de klus duidelijk nodig heeft een eigen regel, met de inkoop excl. btw als schatting. Reken machinehuur per dag voor het aantal dagen dat hij nodig is volgens je uren, met transport als aparte regel.
Richtprijzen excl. btw: minigraver tot 2 ton € 150 per dag; dumper € 100 per dag; trilplaat € 50 per dag; transport van een machine € 75 per keer heen en terug; puincontainer 6 m³ € 300, grondcontainer 6 m³ € 280, groenafval 6 m³ € 250; korrelmix of menggranulaat € 25 per ton (1 m³ is ongeveer 1,6 ton); straatzand € 30 per m³ los gestort; bezorging los gestort € 60 per vracht; opsluitbanden € 4 per meter; klinkers alleen als de beschrijving een soort of prijs noemt, anders weglaten.
Gebruik voor soort: machine (huur of transport van machines), bezorging (vrachten en transport), afvoer (containers en stortkosten), materiaal (steen, grond, zand, hout, techniek) of planten.
Posten zijn de werkzaamheden zoals ze op de werkomschrijving voor de klant komen: een korte titel ("Sloop- en grondwerk") en een toelichting van één of twee zinnen met maten en hoeveelheden uit de beschrijving. Nummer ze niet.
Fasen: noemt de beschrijving fasen of momenten (bijvoorbeeld "fase 1 in november, de rest in maart"), geef dan elke fase een naam als "Fase 1 — November 2026" en zet bij elke post en elke regel in welke fase hij valt. Zonder fasen is fase overal een lege tekst. Zet bij elke regel ook bij welke post hij hoort, met precies de titel van die post.
Antwoord in het Nederlands. Noem in aannames kort wat je hebt aangenomen omdat het niet in de beschrijving stond, ook laagdiktes en hoeveelheden.`

const SCHEMA = {
  type: "object",
  properties: {
    uren: { type: "number", description: "Totaal aantal uur, inclusief de 5 procent marge" },
    posten: {
      type: "array",
      items: {
        type: "object",
        properties: { wat: { type: "string" }, toelichting: { type: "string" }, uren: { type: "number" }, fase: { type: "string" } },
        required: ["wat", "toelichting", "uren", "fase"],
        additionalProperties: false,
      },
    },
    regels: {
      type: "array",
      description: "Machines, containers en materiaal, elk een eigen regel",
      items: {
        type: "object",
        properties: {
          wat: { type: "string" },
          soort: { type: "string", enum: ["planten", "materiaal", "bezorging", "machine", "afvoer"] },
          inkoop: { type: "number", description: "Inkoop excl. btw in euro" },
          fase: { type: "string" },
          post: { type: "string", description: "Titel van de post waar deze regel bij hoort" },
        },
        required: ["wat", "soort", "inkoop", "fase", "post"],
        additionalProperties: false,
      },
    },
    aannames: { type: "string" },
  },
  required: ["uren", "posten", "regels", "aannames"],
  additionalProperties: false,
}

export async function POST(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return new NextResponse("Niet ingelogd", { status: 401 })
  const { beschrijving } = (await request.json()) as { beschrijving?: string }
  if (!beschrijving?.trim()) return NextResponse.json({ fout: "Beschrijf eerst de klus." }, { status: 400 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ fout: "Claude is niet ingesteld." }, { status: 503 })

  // Nicks eigen prijzen uit de catalogus gaan vóór de richtprijzen hierboven.
  // Met de prijslijsten erin zijn dat er duizenden: alleen eigen items en wat bij de beschrijving past.
  const items = voorClaude(await leesCatalogus(), beschrijving)
  const catalogus = items.length
    ? `\n\nPrijzen uit Nicks catalogus (inkoop excl. btw, gebruik deze vóór de richtprijzen, en dezelfde naam als omschrijving):\n${items.map((i) => `- ${i.naam}: ${toonEuro(i.inkoop)} per ${i.eenheid}`).join("\n")}`
    : ""

  const client = new Anthropic()
  try {
    const antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: `${OPDRACHT}${catalogus}`,
      messages: [{ role: "user", content: beschrijving.slice(0, 12000) }],
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

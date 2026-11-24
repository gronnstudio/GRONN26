import { BUSINESS } from "@/lib/business"
import { STUKKEN } from "@/lib/data/blog"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"
import { diensten } from "@/components/diensten/kies"
import { kortePrijs } from "@/components/diensten/prijs"
import { VIJVER_PAGINAS } from "@/lib/data/vijver-paginas"

// /llms.txt: een korte, platte samenvatting van de site voor AI-assistenten
// (voorstel op llmstxt.org). Alles komt uit dezelfde bronnen als de pagina's:
// business.ts, pricing.ts, werkgebied.ts en het journaal. Geen adres.
export const dynamic = "force-static"

const SITE = "https://gronn.studio"
// Dezelfde diensten, in dezelfde volgorde, als op /vijvers en /tuinen.
const VIJVERS = diensten("pond-survey", "water-systems", "pond-autumn-service", "leaf-net", "winterising", "maintenance-subscription")
const TUINEN = diensten("consultancy", "garden-design", "planting-habitat", "garden-transformation", "implementation")

function regel(s: (typeof VIJVERS)[number], pad: string) {
  const prijs = kortePrijs(s).nl
  const zin = prijs === "Op maat" ? "Prijs: op maat, vooraf vastgelegd in de offerte." : `Prijs: ${prijs} (incl. btw).`
  return `- [${s.title.nl}](${SITE}${pad}): ${s.summary.nl} ${zin}`
}

export function GET() {
  const tekst = `# ${BUSINESS.name}

> Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf. ${BUSINESS.name} is de eenmanszaak van hovenier ${BUSINESS.owner.given} ${BUSINESS.owner.family} (KVK ${BUSINESS.kvk}).

Werkgebied: ${SERVICE_AREA_TOWNS.join(", ")} (Zuid-Limburg, tot ongeveer 30 km rond Stein).
Contact: ${BUSINESS.email}, WhatsApp ${BUSINESS.whatsapp} (stuur een foto van je tuin of vijver). Elke klus krijgt vooraf een vaste prijs.

## Vijvers

${VIJVERS.map((s) => regel(s, "/vijvers")).join("\n")}
${VIJVER_PAGINAS.map((p) => `- [${p.seoTitel}](${SITE}/vijvers/${p.slug}): ${p.beschrijving}`).join("\n")}

## Tuinen

${TUINEN.map((s) => regel(s, "/tuinen")).join("\n")}
- [Borderpakketten](${SITE}/tuinen/borderpakketten): inheemse beplanting per m², aangeplant of opgestuurd.

## Werk

- [Vijverrenovatie in Elsloo](${SITE}/werk/vijverrenovatie): ongeveer 5.000 liter water, twee vijvers, een waterval en een beekloop als één systeem.
- [Terras in Geulle](${SITE}/werk/terras-geulle)

## Over

- [Over Nick](${SITE}/over): wie ik ben en hoe ik werk.
- [Veelgestelde vragen](${SITE}/faq): prijzen, werkgebied, planning en werkwijze.
- [Kennismaken](${SITE}/kennismaken)

## Journaal

${STUKKEN.map((s) => `- [${s.titel}](${SITE}/journaal/${s.slug}): ${s.beschrijving}`).join("\n")}
`
  return new Response(tekst, { headers: { "content-type": "text/plain; charset=utf-8" } })
}

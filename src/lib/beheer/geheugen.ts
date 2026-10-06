import "server-only"
import { PROJECTEN, TODOS } from "@/lib/beheer/data"
import { DOCUMENTEN } from "@/lib/data/legal"

// Wat de assistent weet: dezelfde feiten als de GRØNN Vault (gronn-jarvis.zip,
// 6 okt 2026), plus de live gegevens van het dashboard. Alleen op de server.
const VAST = `
# GRØNN Studio
Eenmanszaak van Nick Peters, Kelderstraat 32, 6171 GB Stein. KvK 42072154, btw NL005473265B04.
Vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.
Facturen en boekhouding in DigiBoox. Geen bedrijfsaansprakelijkheidsverzekering (alleen een fietsverzekering).

# Prijzen en marges (incl. btw)
Vijverdoorlichting €195; najaarsbeurt €250/350/450–650; winterklaar €95–185; bladnet €125/175/250.
Tuin aanleggen vanaf €3.000, omvormen vanaf €5.000. Uurloon ±€55–60 ex btw.
Materiaalopslag 10–15% op grote posten, 15–25% op kleine spullen; geen winkelnamen op offertes.
Offertenummer GR-O // JJJJ-MMDD-01; intern overzicht GR-N met hetzelfde nummer.

# Clannad & Stijn (Sint Cornelisleen 15, Stein)
Offerte GR-O // 2026-1006-01: €11.495,00 incl. btw (€9.500 ex), geldig t/m 31 oktober, termijnen €5.747,50 / €3.448,50 / €2.299,00, ±2 weken werk.
Keermuur ±4 m langs het pad, 0,60–0,80 m, dubbele rij stapelblokken op gewapende betonvoet met drainage. Grondkering langs het gemeenteplantsoen. Kiezelbed 3–4 m², regenwatertank 1000 L, cortenstaal, hekwerk, cottage-borders, gazon.
Eerdere bedragen: €7.475 (8 sep), €9.895 (14 sep). Willen bij voorkeur in maart 2027 beginnen. Intern: ±€4.290 over (raming).
Niet in de offerte: twee meerstammige heesters, houten schotten.

# Kleine letters
Voorwaarden en privacy vastgesteld 6 okt 2026, nog niet door een jurist getoetst. Bij elke particuliere offerte: voorwaarden, herroepingsformulier, fototoestemming. 14 dagen bedenktijd; geen materialen bestellen binnen die termijn.
`

export function geheugen() {
  const projecten = PROJECTEN.map((p) => `- ${p.naam} (${p.wat}${p.plaats ? ", " + p.plaats : ""}): fase ${p.fase}${p.bedrag ? `, € ${p.bedrag.toFixed(2)}` : ""}. Volgende: ${p.volgende}`).join("\n")
  const todos = TODOS.map((t) => `- ${t.wat} — ${t.waarom} Kosten: ${t.kosten}${t.dringend ? " (eerst)" : ""}`).join("\n")
  const docs = DOCUMENTEN.map((d) => `- ${d.doc.title}: ${d.doc.status}, versie ${d.doc.updated}`).join("\n")
  return `${VAST}\n# Projecten nu\n${projecten}\n\n# Te doen\n${todos}\n\n# Documenten\n${docs}`
}

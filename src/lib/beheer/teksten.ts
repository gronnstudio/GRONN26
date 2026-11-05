import "server-only"
import { leesJson, wijzigJson } from "@/lib/crm/opslag"

// Vaste begin- en slottekst op elke nieuwe offerte (idee uit Plancraft,
// "Textvorlagen", 5 nov 2026). {naam} wordt de naam van de klant. Een offerte
// bewaart de tekst bij het maken, dus later aanpassen verandert oude niet.
const PAD = "dashboard/teksten.json"
export type Teksten = { begin: string; slot: string }
export const STANDAARD_TEKSTEN: Teksten = {
  begin: "Beste {naam},\n\nDank je wel voor je aanvraag. Hieronder lees je wat ik voorstel, hoe ik het aanpak en wat het kost. De prijs staat vast.",
  slot: "Vragen of iets anders zien? Bel of app me gerust. Ben je akkoord, dan plannen we samen de start.\n\nGroet,\nNick Peters",
}

export async function leesTeksten(): Promise<Teksten> {
  const d = await leesJson<Partial<Teksten>>(PAD, () => STANDAARD_TEKSTEN)
  return { begin: typeof d.begin === "string" ? d.begin : STANDAARD_TEKSTEN.begin, slot: typeof d.slot === "string" ? d.slot : STANDAARD_TEKSTEN.slot }
}

export async function bewaarTeksten(t: Teksten) {
  await wijzigJson<Teksten>(PAD, () => STANDAARD_TEKSTEN, () => ({ begin: t.begin.slice(0, 2000), slot: t.slot.slice(0, 2000) }))
}

export const metNaam = (tekst: string, naam: string) => tekst.replaceAll("{naam}", naam)

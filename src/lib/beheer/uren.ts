import { leesJson, opslagAan, schrijfJson } from "@/lib/crm/opslag"

// Urenregistratie voor het urencriterium (eigenaar, 15 okt 2026: "een
// uitvoerige urenregistratie" in het dashboard). 1.225 uur per kalenderjaar,
// niet naar rato. Eigen JSON-bestand naast de stand, zonder opschoning: uren
// horen 7 jaar bij de administratie.

export const DOEL = 1225
export const SOORTEN = [
  "Klus bij klant",
  "Offerte en ontwerp",
  "Reistijd",
  "Inkoop en materiaal",
  "Administratie",
  "Acquisitie en netwerk",
  "Social media",
  "Website",
  "Vakkennis",
] as const
export type Soort = (typeof SOORTEN)[number]
export type Regel = { id: string; datum: string; soort: Soort; klant: string; wat: string; uren: number }

// Reconstructie 1 jun–15 okt 2026, opgemaakt 15 okt uit mail, facturen, Drive en
// git. Website, social en vijver zijn Nicks eigen totalen (400, 50, 120), over de
// weken verdeeld; overig is een voorzichtige schatting. Bron en uitleg:
// /mnt/project-files/administratie/urenregistratie-2026.xlsx en de PDF ernaast.
export const RECONSTRUCTIE_TOT = "2026-10-15"
export const RECONSTRUCTIE = [
  { week: 23, maandag: "2026-06-01", website: 0, social: 0, vijver: 0, overig: 12, wat: "Start onderneming: KvK-inschrijving en uittreksel, KvK-startersprogramma, oriëntatie op samenwerkingen (mails GRNFIX en BioKultura)" },
  { week: 24, maandag: "2026-06-08", website: 0, social: 0, vijver: 0, overig: 10, wat: "Belafspraak BioKultura, gesprek GRNFIX, oriëntatie op vakkennis en gereedschap (Plantenkennis)" },
  { week: 25, maandag: "2026-06-15", website: 13, social: 2, vijver: 0, overig: 14, wat: "Voorstel ‘De Steinse Meent’ aan gemeente Stein (brief + plan), eerste logo, mailhandtekening, websitetool, Mollie, DigiBoox-boekhouding, domein bij TransIP, KvK-wijziging, btw-nummer" },
  { week: 26, maandag: "2026-06-22", website: 13, social: 0, vijver: 0, overig: 10, wat: "Administratie op orde (KvK-wijziging verwerkt, incasso), vakstudie ontwerp en prijzen" },
  { week: 27, maandag: "2026-06-29", website: 13, social: 0, vijver: 4, overig: 8, wat: "Account en eerste bestelling vdvelde (materiaal), voorbereiding vijverproject Doornbos: Fase 1 vijverconsult aangeboden" },
  { week: 28, maandag: "2026-07-06", website: 22, social: 0, vijver: 10, overig: 4, wat: "Vijverconsult en technische opname op locatie, voorstel fase 2–4 uitgewerkt, start eigen website" },
  { week: 29, maandag: "2026-07-13", website: 36, social: 0, vijver: 14, overig: 6, wat: "Opdracht vijverrenovatie getekend, voorschotfactuur materiaal, offerte Dirix, fase 2 filterbak, website" },
  { week: 30, maandag: "2026-07-20", website: 34, social: 0, vijver: 16, overig: 6, wat: "Vijverrenovatie uitvoering, bestelling SKS, Qredits-aanvraag gestart, website" },
  { week: 31, maandag: "2026-07-27", website: 37, social: 0, vijver: 12, overig: 6, wat: "Tuinadvies Vaessen (factuur 2026-0003), website" },
  { week: 32, maandag: "2026-08-03", website: 17, social: 0, vijver: 24, overig: 2, wat: "Fase 3 vijver: beekloop, waterval, stenen plaatsen, circulatie en afstelling (factuur 2026-0008)" },
  { week: 33, maandag: "2026-08-10", website: 13, social: 0, vijver: 8, overig: 2, wat: "Factuur fase 3 verstuurd, nazorg vijver" },
  { week: 34, maandag: "2026-08-17", website: 15, social: 0, vijver: 0, overig: 2, wat: "Website, voorbereiding beplantingsplan" },
  { week: 35, maandag: "2026-08-24", website: 38, social: 0, vijver: 10, overig: 8, wat: "Beplantingsvoorstel fase 4 vijver (3 varianten), bestelling vijverbenodigdheden, zakelijk account Toolmax, website" },
  { week: 36, maandag: "2026-08-31", website: 30, social: 0, vijver: 6, overig: 12, wat: "Hoveniersaccount Directplant, bouwbord uitgezocht (Chromio), offerte achtertuin Clannad & Stijn, website" },
  { week: 37, maandag: "2026-09-07", website: 16, social: 0, vijver: 0, overig: 18, wat: "Leveranciers en samenwerkingen (Wienerberger, Op Reij, Makita, RevolutionRace), offerte + eerste termijnfactuur Clannad & Stijn, vragen klant" },
  { week: 38, maandag: "2026-09-14", website: 30, social: 0, vijver: 0, overig: 10, wat: "Vernieuwde offerte Clannad & Stijn, overleg hoogteverschil en schutting, website (conceptbuild)" },
  { week: 39, maandag: "2026-09-21", website: 28, social: 4, vijver: 16, overig: 8, wat: "Vijver fase 5: leidingen, afvoer, teelaarde (laatste factuur), materiaal Hornbach, nieuwsbrief/checklist, socials plannen, website" },
  { week: 40, maandag: "2026-09-28", website: 20, social: 14, vijver: 0, overig: 32, wat: "Merkregistratie (Brndpwr), bestelling Wildkamp, KvK-wijziging, tuin Stephanie: 1 dag graven met minigraver (factuur GR-F 0930-0011), KLIC-aanmelding, eHerkenning, website, SEO, socials, Drive ordenen. Uitzoeken (10 uur): plugins en koppelingen, 30-dagenplan en Google Bedrijfsprofiel opgezet, systeem voor papieren administratie, positionering, DMARC, NotebookLM, permacultuur en voedselbos, Vercel-kosten" },
  { week: 41, maandag: "2026-10-05", website: 4, social: 20, vijver: 0, overig: 35, wat: "Qredits ondernemingsplan en financieel plan, algemene voorwaarden, offertes en facturen, elektra-klus (2 uur gefactureerd), tuin Stephanie: 2 dagen harken en egaliseren, graszoden deel 1 leggen (factuur €800 voor 100 m²), bouwbord (Blueprint), website GRONN26, Instagram-posts. Uitzoeken (3 uur): concurrent Chris Janssen, webshop Dutch Paving Tools, gereedschap voor aanleg, leerpad tuinontwerp" },
  { week: 42, maandag: "2026-10-12", website: 21, social: 10, vijver: 0, overig: 10, wat: "Tindemans graszoden, Hornbach ProfiService, merkregistratie, logo, urenadministratie (t/m do 15 okt). Uitzoeken (2 uur): visitekaartje in Wallet, regelingen en kosten voor starters" },
]
export const weekTotaal = (r: (typeof RECONSTRUCTIE)[number]) => r.website + r.social + r.vijver + r.overig

const PAD = "dashboard/uren.json"
export { opslagAan }

export async function leesUren(): Promise<Regel[]> {
  return (await leesJson<{ regels?: Regel[] }>(PAD, () => ({ regels: [] }))).regels ?? []
}

export async function schrijfUren(regels: Regel[]) {
  regels.sort((a, b) => b.datum.localeCompare(a.datum))
  await schrijfJson(PAD, { regels })
}

/** ISO-weeknummer en maandag van die week, voor het groeperen per week. */
export function weekVan(datum: string) {
  const d = new Date(`${datum}T12:00:00Z`)
  const dag = (d.getUTCDay() + 6) % 7
  const maandag = new Date(d)
  maandag.setUTCDate(d.getUTCDate() - dag)
  const donderdag = new Date(maandag)
  donderdag.setUTCDate(maandag.getUTCDate() + 3)
  const jan1 = new Date(Date.UTC(donderdag.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((donderdag.getTime() - jan1.getTime()) / 86400000 + 1) / 7)
  return { week, maandag: maandag.toISOString().slice(0, 10) }
}

import type { L } from "@/lib/i18n"
import { BORDERPAKKETTEN, type BorderPakket } from "@/lib/data/borderpakketten"

// Plantenkiezer (eigenaar, 21 nov 2026: "ik wil ook zon tool als hun!", over de
// beplantingstool van Tuindirigent). De eenvoudige versie: geen AI, geen
// plantendatabase, geen account. Drie vragen over de plek, één maat, en het
// borderpakket dat het best past, met de plantlijst op jouw maat, een
// bloeikalender en de prijs. De planten zelf komen uit borderpakketten.ts.

export type Licht = "zon" | "half" | "schaduw"
export type Grond = "droog" | "normaal" | "nat"
export type Wens = "bijen" | "weinig-werk" | "eetbaar" | "plukken" | "rustig" | "inheems"

export const LICHT: { id: Licht; label: L; uitleg: L }[] = [
  { id: "zon", label: { nl: "Volle zon", en: "Full sun" }, uitleg: { nl: "6 uur of meer zon", en: "6 hours of sun or more" } },
  { id: "half", label: { nl: "Halfschaduw", en: "Part shade" }, uitleg: { nl: "een deel van de dag zon", en: "sun for part of the day" } },
  { id: "schaduw", label: { nl: "Schaduw", en: "Shade" }, uitleg: { nl: "onder een boom, noordkant", en: "under a tree, north side" } },
]

export const GROND: { id: Grond; label: L; uitleg: L }[] = [
  { id: "droog", label: { nl: "Droog", en: "Dry" }, uitleg: { nl: "zand, grind, droogt snel op", en: "sand, gravel, dries out fast" } },
  { id: "normaal", label: { nl: "Gewoon", en: "Normal" }, uitleg: { nl: "gewone tuingrond", en: "ordinary garden soil" } },
  { id: "nat", label: { nl: "Vochtig of nat", en: "Moist or wet" }, uitleg: { nl: "klei, bij een vijver", en: "clay, by a pond" } },
]

export const WENSEN: { id: Wens; label: L }[] = [
  { id: "bijen", label: { nl: "Bijen en vlinders", en: "Bees and butterflies" } },
  { id: "weinig-werk", label: { nl: "Weinig werk", en: "Little work" } },
  { id: "inheems", label: { nl: "Wilde, inheemse planten", en: "Wild, native plants" } },
  { id: "plukken", label: { nl: "Bloemen plukken", en: "Flowers to pick" } },
  { id: "eetbaar", label: { nl: "Iets te eten", en: "Something to eat" } },
  { id: "rustig", label: { nl: "Rustig, wit en groen", en: "Calm, white and green" } },
]

/** Waar elk pakket thuishoort. Sleutel = slug uit borderpakketten.ts. */
const PLEK: Record<string, { licht: Licht[]; grond: Grond[]; wens: Wens[] }> = {
  vlinderborder: { licht: ["zon"], grond: ["normaal", "droog"], wens: ["bijen"] },
  schaduwborder: { licht: ["half", "schaduw"], grond: ["normaal", "nat"], wens: ["weinig-werk", "rustig"] },
  vijverrand: { licht: ["zon", "half"], grond: ["nat"], wens: ["bijen", "inheems"] },
  "droge-border": { licht: ["zon"], grond: ["droog"], wens: ["weinig-werk", "bijen"] },
  inheemse: { licht: ["zon"], grond: ["droog", "normaal"], wens: ["inheems", "bijen", "weinig-werk"] },
  plukborder: { licht: ["zon"], grond: ["normaal"], wens: ["plukken"] },
  "witte-border": { licht: ["half"], grond: ["normaal", "nat"], wens: ["rustig"] },
  "eetbare-border": { licht: ["zon"], grond: ["normaal"], wens: ["eetbaar"] },
}

/**
 * Maanden (1–12) waarin een plant iets laat zien: bloei, of oogst bij de
 * eetbare planten. Leeg = bladplant. Sleutel = Latijnse naam uit borderpakketten.ts.
 */
export const BLOEI: Record<string, number[]> = {
  "Echinacea purpurea": [7, 8, 9],
  "Salvia nemorosa ‘Caradonna’": [6, 7, 8, 9],
  "Verbena bonariensis": [7, 8, 9, 10],
  "Pennisetum alopecuroides": [8, 9, 10],
  "Nepeta faassenii": [5, 6, 7, 8, 9],
  "Geranium ‘Rozanne’": [6, 7, 8, 9, 10],
  "Dryopteris filix-mas": [],
  "Hosta sieboldiana": [6, 7],
  "Anemone hupehensis": [8, 9, 10],
  "Luzula sylvatica": [4, 5, 6],
  "Geranium macrorrhizum": [5, 6, 7],
  "Amelanchier lamarckii": [4, 5],
  "Iris pseudacorus": [5, 6],
  "Lythrum salicaria": [7, 8, 9],
  "Carex flava": [5, 6],
  "Myosotis scorpioides": [5, 6, 7, 8, 9],
  "Lavandula angustifolia": [6, 7, 8],
  "Eryngium planum": [7, 8],
  "Stipa tenuissima": [6, 7, 8, 9],
  "Hylotelephium spectabile": [8, 9, 10],
  "Thymus serpyllum": [6, 7, 8],
  "Leucanthemum vulgare": [5, 6, 7, 8],
  "Centaurea jacea": [6, 7, 8, 9],
  "Knautia arvensis": [6, 7, 8, 9],
  "Origanum vulgare": [7, 8, 9],
  "Malva moschata": [6, 7, 8, 9],
  "Deschampsia cespitosa": [6, 7, 8],
  "Veronicastrum virginicum": [7, 8, 9],
  "Phlox paniculata": [7, 8, 9],
  "Rudbeckia fulgida": [8, 9, 10],
  "Achillea millefolium": [6, 7, 8, 9],
  "Alchemilla mollis": [6, 7, 8],
  "Anemone ‘Honorine Jobert’": [8, 9, 10],
  "Digitalis purpurea ‘Alba’": [6, 7],
  "Astrantia major": [6, 7, 8],
  "Geranium ‘White-Ness’": [6, 7, 8],
  "Hakonechloa macra": [],
  "Hydrangea arborescens": [7, 8, 9],
  "Salvia officinalis": [6, 7],
  "Allium schoenoprasum": [5, 6, 7],
  "Fragaria vesca": [6, 7, 8],
  "Ribes rubrum": [7],
  "Rheum rhabarbarum": [4, 5, 6],
}

export type Antwoord = { licht: Licht; grond: Grond; wensen: Wens[] }

/** Licht en grond tellen het zwaarst; een wens geeft de doorslag. Hoogste eerst. */
export function kiesPakketten(a: Antwoord): BorderPakket[] {
  const score = (p: BorderPakket) => {
    const plek = PLEK[p.slug]
    if (!plek) return -1
    return (plek.licht.includes(a.licht) ? 4 : 0) + (plek.grond.includes(a.grond) ? 3 : 0) + a.wensen.filter((w) => plek.wens.includes(w)).length
  }
  return BORDERPAKKETTEN.map((p, i) => ({ p, s: score(p), i }))
    .filter((x) => x.s >= 0)
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .map((x) => x.p)
}

/** De plantlijst staat per 5 m²; naar jouw maat, naar boven afgerond. */
export function aantalVoor(aantalPer5: number, m2: number) {
  return Math.max(1, Math.ceil((aantalPer5 * m2) / 5))
}

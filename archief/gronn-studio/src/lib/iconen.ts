import type { L } from "./i18n"

// De iconen van huisstijl Editie 02 (28 sep 2026): drie diensten en acht
// plantgroepen, alle elf uit één bouwsteen — de kwartcirkel uit de Ø van
// het woordmerk. Vier vakken op een raster van 4 × 4, elk een kwartcirkel
// in één van vier standen, het hele vlak of een blad. Twee tonen per
// tegel: 'a' is de inkt, 'b' de tint; de tegel zelf is de grond.
//
// Overgenomen, niet nagetekend: de vormen en kleuren staan hier precies
// zoals op de borden (Diensten: NIVEAUS; Plantgroepen: GROEPEN en
// VOLGORDE), en `vorm`/`vlakken` zijn dezelfde twee functies. Verandert
// een bord, dan verandert dit bestand mee — tests/e2e/iconen.spec.ts
// bewaakt de aantallen, de volgorde en de kleurenset.
//
// Kleuren zijn VASTE MERKCONSTANTEN, in beide thema's gelijk: een tegel is
// een merkobject, net als een foto. Ze komen uit de kleurschaal (vol,
// midden 55 %, licht 12 % met gebroken wit; `--merk-*` in globals.css),
// plus de ene schaduw #566C50 (mosgroen met 15 % antraciet) en het
// Siergrassen-paneel #E8E9E2 (salie-licht). Fel aarde-oranje #DB6923 is
// voor knoppen en acties en staat hier nooit. Geen antraciet in de
// plantgroepen (eigenaar, 28 sep 2026).

/** Hoek van het vierkant waar het middelpunt van de kwartcirkel ligt; `vol` is het hele vak, `blad` de lens van hoek naar hoek. */
export type Stand = "tl" | "tr" | "br" | "bl" | "vol" | "blad"
/** 'a' = inkt, 'b' = tint. */
export type IcoonToon = "a" | "b"
/** `[x, y, maat, stand, toon]` op een raster van 4 × 4. */
export type Vorm = readonly [x: number, y: number, maat: number, stand: Stand, toon: IcoonToon]

export type Vlak = { kleur: string; d: string }

export type DienstId = "ontwerp" | "aanleg" | "onderhoud"

export type DienstIcoon = {
  id: DienstId
  nummer: string
  naam: L
  /** Toon 'a'. */
  inkt: string
  /** Toon 'b'. */
  tint: string
  /** De tegel. */
  grond: string
  /** De naam op de grond (het bord belooft ≥ 4,5:1). */
  tekst: string
  /** De rand van de kaart op het bord: alleen zichtbaar waar hij van de grond verschilt. */
  rand: string
  vormen: readonly Vorm[]
}

export type PlantgroepSlug =
  | "bomen"
  | "heesters"
  | "vaste-planten"
  | "siergrassen"
  | "klimplanten"
  | "bodembedekkers"
  | "bollen-en-knollen"
  | "water-en-oeverplanten"

export type PlantgroepIcoon = {
  slug: PlantgroepSlug
  /** Nummer op tegel en fiche: de volgorde van GROEPEN op het bord, niet die van het dambord. */
  nummer: string
  naam: L
  /** Toon 'a', en de kleur van de naam op de tegel (≥ 4,5:1 op de grond). */
  inkt: string
  /** Toon 'b'. */
  tint: string
  /** De tegel. */
  grond: string
  /** Het lichte vlak op de achterkant van de fiche. */
  paneel: string
  rand: string
  vormen: readonly Vorm[]
}

// Diensten, iconen (bord "Diensten"). Toon op toon: antraciet, gebroken
// wit en de oranjeschaal.
export const DIENST_ICONEN: Record<DienstId, DienstIcoon> = {
  // De gradenboog: twee bogen om één middelpunt.
  ontwerp: {
    id: "ontwerp",
    nummer: "01",
    naam: { nl: "Ontwerp", en: "Design" },
    inkt: "#EFEEEA",
    tint: "#A14312",
    grond: "#202020",
    tekst: "#EFEEEA",
    rand: "#202020",
    vormen: [
      [0, 0, 4, "bl", "a"],
      [0, 2, 2, "bl", "b"],
    ],
  },
  // Opbouw: een blok, daarnaast een hoge boog, als een trap.
  aanleg: {
    id: "aanleg",
    nummer: "02",
    naam: { nl: "Aanleg", en: "Build" },
    inkt: "#C49073",
    tint: "#A14312",
    grond: "#EFEEEA",
    tekst: "#202020",
    rand: "#D6D5D2",
    vormen: [
      [0, 2, 2, "vol", "b"],
      [2, 2, 2, "vol", "a"],
      [2, 0, 2, "bl", "a"],
    ],
  },
  // Kringloop: vier kwarten die om het midden draaien.
  onderhoud: {
    id: "onderhoud",
    nummer: "03",
    naam: { nl: "Onderhoud", en: "Care" },
    inkt: "#A14312",
    tint: "#202020",
    grond: "#E6D9D0",
    tekst: "#A14312",
    rand: "#E6D9D0",
    vormen: [
      [0, 0, 2, "tr", "a"],
      [2, 0, 2, "br", "b"],
      [2, 2, 2, "bl", "a"],
      [0, 2, 2, "tl", "b"],
    ],
  },
}

export const DIENST_VOLGORDE: readonly DienstId[] = ["ontwerp", "aanleg", "onderhoud"]

// Plantgroepen (bord "Plantgroepen", GROEPEN). Betekenis uit richting,
// ritme en gewicht, niet uit een plaatje. Uitzondering: Bodembedekkers is
// een band van kleine kwarten (maat 1), omdat het om veel kleine planten
// gaat.
export const PLANTGROEP_ICONEN: Record<PlantgroepSlug, PlantgroepIcoon> = {
  bomen: {
    slug: "bomen",
    nummer: "01",
    naam: { nl: "Bomen", en: "Trees" },
    inkt: "#B8C5A8",
    tint: "#7F9389",
    grond: "#23483A",
    paneel: "#D7DAD5",
    rand: "#23483A",
    vormen: [
      [0, 0, 2, "br", "a"],
      [2, 0, 2, "bl", "a"],
      [0, 2, 2, "vol", "b"],
      [2, 2, 2, "vol", "b"],
    ],
  },
  heesters: {
    slug: "heesters",
    nummer: "02",
    naam: { nl: "Heesters", en: "Shrubs" },
    inkt: "#EFEEEA",
    tint: "#A0AE9A",
    grond: "#566C50",
    paneel: "#DEE0D9",
    rand: "#566C50",
    vormen: [
      [0, 0, 2, "br", "a"],
      [2, 0, 2, "bl", "a"],
      [0, 2, 2, "tr", "b"],
      [2, 2, 2, "tl", "b"],
    ],
  },
  "vaste-planten": {
    slug: "vaste-planten",
    nummer: "03",
    naam: { nl: "Vaste planten", en: "Perennials" },
    inkt: "#A14312",
    tint: "#C49073",
    grond: "#E6D9D0",
    paneel: "#E6D9D0",
    rand: "#E6D9D0",
    vormen: [
      [0, 0, 2, "tl", "a"],
      [2, 0, 2, "tr", "b"],
      [0, 2, 2, "bl", "b"],
      [2, 2, 2, "br", "a"],
    ],
  },
  siergrassen: {
    slug: "siergrassen",
    nummer: "04",
    naam: { nl: "Siergrassen", en: "Ornamental grasses" },
    inkt: "#23483A",
    tint: "#7F9389",
    grond: "#B8C5A8",
    paneel: "#E8E9E2",
    rand: "#B8C5A8",
    vormen: [
      [0, 0, 2, "bl", "b"],
      [2, 0, 2, "bl", "b"],
      [0, 2, 2, "bl", "a"],
      [2, 2, 2, "bl", "a"],
    ],
  },
  klimplanten: {
    slug: "klimplanten",
    nummer: "05",
    naam: { nl: "Klimplanten", en: "Climbers" },
    inkt: "#23483A",
    tint: "#7F9389",
    grond: "#D7DAD5",
    paneel: "#D7DAD5",
    rand: "#D7DAD5",
    vormen: [
      [0, 0, 4, "blad", "a"],
      [0, 0, 2, "tl", "b"],
      [2, 2, 2, "br", "b"],
    ],
  },
  bodembedekkers: {
    slug: "bodembedekkers",
    nummer: "06",
    naam: { nl: "Bodembedekkers", en: "Ground cover" },
    inkt: "#23483A",
    tint: "#607A59",
    grond: "#DEE0D9",
    paneel: "#DEE0D9",
    rand: "#DEE0D9",
    vormen: [
      [0, 2, 1, "bl", "a"],
      [1, 2, 1, "br", "b"],
      [2, 2, 1, "bl", "a"],
      [3, 2, 1, "br", "b"],
      [0, 3, 1, "vol", "a"],
      [1, 3, 1, "vol", "a"],
      [2, 3, 1, "vol", "a"],
      [3, 3, 1, "vol", "a"],
    ],
  },
  "bollen-en-knollen": {
    slug: "bollen-en-knollen",
    nummer: "07",
    naam: { nl: "Bollen & knollen", en: "Bulbs & tubers" },
    inkt: "#A14312",
    tint: "#C49073",
    grond: "#EFEEEA",
    paneel: "#E6D9D0",
    rand: "#E6D9D0",
    vormen: [
      [0, 0, 2, "bl", "b"],
      [2, 0, 2, "br", "b"],
      [0, 2, 2, "tr", "a"],
      [2, 2, 2, "tl", "a"],
    ],
  },
  "water-en-oeverplanten": {
    slug: "water-en-oeverplanten",
    nummer: "08",
    naam: { nl: "Water- en oeverplanten", en: "Water and marginal plants" },
    inkt: "#EFEEEA",
    tint: "#B8C5A8",
    grond: "#23483A",
    paneel: "#DEE0D9",
    rand: "#23483A",
    vormen: [
      [0, 0, 2, "tr", "a"],
      [2, 0, 2, "tl", "a"],
      [0, 2, 2, "br", "b"],
      [2, 2, 2, "bl", "b"],
    ],
  },
}

/**
 * De volgorde op het overzicht (bord VOLGORDE): een dambord waarin donker
 * en licht afwisselen en de twee oranje tegels schuin van elkaar staan.
 * De nummering (tegel, fiche) volgt GROEPEN, niet deze volgorde.
 */
export const PLANTGROEP_VOLGORDE: readonly PlantgroepSlug[] = [
  "bomen",
  "siergrassen",
  "heesters",
  "vaste-planten",
  "bodembedekkers",
  "water-en-oeverplanten",
  "bollen-en-knollen",
  "klimplanten",
]

/** Kwartcirkel: middelpunt in hoek `t` van het vierkant x..x+s, straal s. `vol` is het hele vierkant. */
export function vorm(t: Exclude<Stand, "blad">, x: number, y: number, s: number): string {
  const a = x + s
  const b = y + s
  return {
    tl: `M${x},${y} L${a},${y} A${s},${s} 0 0 1 ${x},${b} Z`,
    tr: `M${a},${y} L${a},${b} A${s},${s} 0 0 1 ${x},${y} Z`,
    br: `M${a},${b} L${x},${b} A${s},${s} 0 0 1 ${a},${y} Z`,
    bl: `M${x},${b} L${x},${y} A${s},${s} 0 0 1 ${a},${b} Z`,
    vol: `M${x},${y} H${a} V${b} H${x} Z`,
  }[t]
}

/** De vormen als svg-paden met hun kleur. `blad`: de doorsnede van twee kwartcirkels, een lens van hoek naar hoek. */
export function vlakken(vormen: readonly Vorm[], inkt: string, tint: string): Vlak[] {
  return vormen.map(([x, y, s, t, toon]) => {
    const a = x + s
    const b = y + s
    const kleur = toon === "b" ? tint : inkt
    if (t === "blad") return { kleur, d: `M${a},${y} A${s},${s} 0 0 1 ${x},${b} A${s},${s} 0 0 1 ${a},${y} Z` }
    return { kleur, d: vorm(t, x, y, s) }
  })
}

/* ---------- Licht en Donker: waar een tegel een rand nodig heeft ---------- */

/**
 * De ondergronden van Donker (`.bluehour` in globals.css): de grond, het
 * vlak (`--surface`) en de vijf paneeltinten. iconen.spec.ts leest ze
 * daar terug, zodat deze lijst niet van het thema kan afdrijven.
 */
export const DONKER_GRONDEN = [
  "#202020",
  "#2A2A2A",
  "#35261E",
  "#212C28",
  "#282B27",
  "#2B2C2A",
  "#2B2B2B",
] as const

/**
 * De ondergronden van Licht (`.goldenhour` in globals.css): de grond, het
 * vlak (`--surface`) en de vijf paneeltinten — het spiegelbeeld van
 * DONKER_GRONDEN, en net zo teruggelezen door iconen.spec.ts.
 */
export const LICHT_GRONDEN = [
  "#EFEEEA",
  "#F8F7F4",
  "#E6D9D0",
  "#D7DAD5",
  "#DEE0D9",
  "#E8E9E2",
  "#D6D5D2",
] as const

/**
 * Wat een tegel minimaal van zijn ondergrond moet verschillen om als vlak
 * te lezen (opdracht Editie 02: ≥ 1,3:1 tussen rand of tegel en de grond).
 * Geen tekstnorm: een tegel is een beeld, geen letter.
 */
export const RAND_DREMPEL = 1.3

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG-contrast tussen twee #RRGGBB-kleuren. */
export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

/**
 * Of een tegel met deze grond in Donker een rand krijgt: alleen als hij op
 * één van de donkere ondergronden onder de drempel zakt. Nu alleen Ontwerp
 * (antraciet op antraciet, 1,00:1); Bomen en Water- en oeverplanten
 * (bosgroen) halen op de lichtste donkere grond nog 1,38:1.
 */
export function randInDonker(grond: string): boolean {
  return DONKER_GRONDEN.some((g) => contrast(grond, g) < RAND_DREMPEL)
}

/**
 * Of een tegel op één ondergrond wegvalt: zijn grond én zijn rand (de rand
 * van het bord, als die er staat; anders de grond zelf) blijven allebei
 * onder de drempel.
 */
export function valtWegOp(grond: string, rand: string, ondergrond: string): boolean {
  return contrast(grond, ondergrond) < RAND_DREMPEL && contrast(rand, ondergrond) < RAND_DREMPEL
}

/**
 * Het spiegelbeeld van `randInDonker` voor Licht (eigenaar, 29 sep 2026:
 * "alle punten zijn prima!" — de Onderhoud-tegel kwam te weinig los van
 * de lichte grond). Een tegel krijgt in Licht de lijn van 1px in `--line`
 * 20 % als hij op één van de lichte ondergronden onder de drempel zakt,
 * met de rand van het bord meegeteld. Nu Aanleg, Onderhoud en de lichte
 * plantgroepen (Vaste planten, Siergrassen, Klimplanten, Bodembedekkers,
 * Bollen & knollen); Ontwerp, Bomen, Heesters en Water- en oeverplanten
 * zijn donker genoeg.
 */
export function randInLicht(grond: string, rand: string = grond): boolean {
  return LICHT_GRONDEN.some((g) => valtWegOp(grond, rand, g))
}

/**
 * Het paneel `bg-paneel-mos` in beide thema's (globals.css; iconen.spec.ts
 * leest het terug): de ondergrond van de plantgroepen op Beplanting — de
 * lijst op de dienstpagina en, sinds 29 sep 2026, ook het `IcoonVlak` op
 * de kaart. Voor `IcoonTegel ondergrond`, zodat de tegel weet waar hij op
 * staat.
 */
export const PANEEL_MOS = { licht: "#DEE0D9", donker: "#282B27" } as const

/** `bg-paneel-antraciet` in beide thema's (globals.css; iconen.spec.ts leest het terug). */
export const PANEEL_ANTRACIET = { licht: "#D6D5D2", donker: "#2B2B2B" } as const
/** `bg-paneel-salie` in beide thema's. */
export const PANEEL_SALIE = { licht: "#E8E9E2", donker: "#2B2C2A" } as const
/** `bg-paneel-oranje` in beide thema's. */
export const PANEEL_ORANJE = { licht: "#E6D9D0", donker: "#35261E" } as const

export type PaneelNaam = "antraciet" | "salie" | "oranje" | "mos"

/**
 * Het paneel onder de tegel in een `IcoonVlak` van een dienst (eigenaar
 * via de coördinator, 29 sep 2026: in Donker waren de vlakken van
 * Onderhoud, Ontwerp en Aanleg grote lichte platen, "te zwaar"). Zoals het
 * mospaneel van Beplanting: een thema-token, licht in Licht, een donkere
 * tint in Donker, en de tegel staat erop met zijn eigen grond en marge.
 *  - Ontwerp → antraciet: de grond van zijn tegel.
 *  - Aanleg → salie: salie-licht (#E8E9E2) ligt in Licht het dichtst bij
 *    de gebroken witte tegel, en oranje hoort al bij Onderhoud.
 *  - Onderhoud → oranje: in Licht precies de grond van zijn tegel.
 */
export const DIENST_PANEEL: Record<DienstId, { naam: PaneelNaam; licht: string; donker: string }> = {
  ontwerp: { naam: "antraciet", ...PANEEL_ANTRACIET },
  aanleg: { naam: "salie", ...PANEEL_SALIE },
  onderhoud: { naam: "oranje", ...PANEEL_ORANJE },
}

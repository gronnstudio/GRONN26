import { HONDERD_PROCENT, deel, maal, plusProcent, procent, verdeel, verhouding, type Bp, type Centen, type Milli } from "./geld"

// De calculatie: van inkoop en uren naar een verkoopprijs, met wat er
// overblijft (masterprompt CRM, module 06). Puur rekenwerk, geen React en geen
// opslag, zodat het rekenblad, de klantkaart, de offerte en Grønn allemaal
// hetzelfde getal zien. Geld in centen, hoeveelheden in duizendsten,
// percentages in bp (zie geld.ts).
//
// Begrippen, nooit door elkaar:
// - kostprijs   wat jij betaalt (inkoop excl. btw)
// - verkoop     wat de klant betaalt excl. btw
// - opslag      winst / kostprijs  (15 % op € 100 inkoop = € 115 verkoop)
// - marge       winst / verkoop    (diezelfde € 15 is 13,04 % marge)
// - btw         over de verkoop, per tarief, één keer afgerond per tarief
// - totaal      verkoop + btw: wat er op de offerte onderaan staat

/** Kostensoorten met hun standaard opslag en btw. Per regel aan te passen. */
export const SOORTEN = {
  materiaal: { naam: "Steen, grond, hout, techniek", opslag: 1500, btw: 2100 },
  planten: { naam: "Planten", opslag: 2500, btw: 900 },
  machine: { naam: "Machinehuur", opslag: 1000, btw: 2100 },
  bezorging: { naam: "Transport en bezorging", opslag: 1000, btw: 2100 },
  afvoer: { naam: "Afvoer en containers", opslag: 1000, btw: 2100 },
  onderaanneming: { naam: "Onderaanneming", opslag: 1000, btw: 2100 },
  ontwerp: { naam: "Ontwerp en advies", opslag: 0, btw: 2100 },
  overig: { naam: "Overig", opslag: 1500, btw: 2100 },
} as const satisfies Record<string, { naam: string; opslag: Bp; btw: Bp }>
export type Soort = keyof typeof SOORTEN
export const isSoort = (s: string): s is Soort => s in SOORTEN

export const EENHEDEN = ["st", "m²", "m³", "m", "uur", "dag", "kg", "ton", "bos", "BB", "post"] as const

export const BTW_TARIEVEN: Bp[] = [2100, 900, 0]

/** Standaardinstellingen. Het uurtarief en de minima komen uit de analyse "Waar blijft het geld?" (29 okt 2026). */
export const STANDAARD = {
  uurtarief: 5000 as Centen,
  /** Onder dit bedrag per uur blijft er na vaste lasten te weinig over. */
  minimumPerUur: 3700 as Centen,
  /** Apart zetten voor inkomstenbelasting en Zvw. */
  reserveBelasting: 2500 as Bp,
  arbeidBtw: 2100 as Bp,
}

export type Regel = {
  id: string
  soort: Soort
  omschrijving: string
  hoeveelheid: Milli
  eenheid: string
  /** Inkoop per eenheid excl. btw */
  inkoop: Centen
  opslag: Bp
  btw: Bp
  /** Afval of snijverlies: de inkoop- én verkoophoeveelheid gaat met dit percentage omhoog. */
  afval: Bp
  /** Groep op de offerte (fase of werkpakket). */
  groep?: string
  /** Optioneel werk: los geprijsd, niet in het totaal. */
  optioneel?: boolean
  /** Uit de catalogus; de prijs is bij het invoegen gekopieerd, dus een oude calculatie verandert niet mee. */
  catalogusId?: string
  /** Uit de meetstaat van deze zone (Zone.id): "Zet in calculatie" vervangt zulke regels. */
  meetstaat?: string
}

export type Invoer = {
  /** Arbeid in duizendsten uur */
  uren: Milli
  uurtarief: Centen
  regels: Regel[]
  /** Onvoorzien over de verkoop, vóór korting */
  onvoorzien: Bp
  korting: Bp
}

export type RegelUitkomst = Regel & {
  brutoHoeveelheid: Milli
  kostprijs: Centen
  verkoop: Centen
  winst: Centen
}

export type BtwRegel = { tarief: Bp; grondslag: Centen; btw: Centen }

export type Uitkomst = {
  regels: RegelUitkomst[]
  optioneel: RegelUitkomst[]
  arbeid: Centen
  materiaal: Centen
  onvoorzien: Centen
  korting: Centen
  /** Verkoop excl. btw, na onvoorzien en korting */
  verkoop: Centen
  kostprijs: Centen
  winst: Centen
  marge: Bp
  opslag: Bp
  btw: BtwRegel[]
  btwTotaal: Centen
  totaal: Centen
  perUur: Centen
  /** Per kostensoort: kostprijs en verkoop, voor het overzicht en de nacalculatie. */
  perSoort: { soort: Soort | "arbeid"; kostprijs: Centen; verkoop: Centen }[]
}

export function rekenRegel(r: Regel): RegelUitkomst {
  const brutoHoeveelheid = plusProcent(r.hoeveelheid, r.afval)
  const kostprijs = maal(r.inkoop, brutoHoeveelheid)
  const verkoop = maal(plusProcent(r.inkoop, r.opslag), brutoHoeveelheid)
  return { ...r, brutoHoeveelheid, kostprijs, verkoop, winst: verkoop - kostprijs }
}

export function reken(invoer: Invoer, arbeidBtw: Bp = STANDAARD.arbeidBtw): Uitkomst {
  const alle = invoer.regels.map(rekenRegel)
  const regels = alle.filter((r) => !r.optioneel)
  const optioneel = alle.filter((r) => r.optioneel)
  const arbeid = maal(invoer.uurtarief, invoer.uren)
  const materiaal = regels.reduce((t, r) => t + r.verkoop, 0)
  const kostprijs = regels.reduce((t, r) => t + r.kostprijs, 0)

  // Per btw-tarief de grondslag vóór onvoorzien en korting.
  const tarieven = new Map<Bp, Centen>()
  const tel = (tarief: Bp, bedrag: Centen) => tarieven.set(tarief, (tarieven.get(tarief) ?? 0) + bedrag)
  if (arbeid) tel(arbeidBtw, arbeid)
  for (const r of regels) tel(r.btw, r.verkoop)
  const lijst = [...tarieven.entries()].sort((a, b) => b[0] - a[0])
  const bruto = arbeid + materiaal

  // Onvoorzien en korting gaan naar rato over de tarieven, zodat de btw klopt.
  const onvoorzien = procent(bruto, invoer.onvoorzien)
  const korting = procent(bruto + onvoorzien, invoer.korting)
  const gewichten = lijst.map(([, g]) => g)
  const opOnvoorzien = verdeel(onvoorzien, gewichten)
  const opKorting = verdeel(korting, gewichten)
  const btw: BtwRegel[] = lijst.map(([tarief, g], i) => {
    const grondslag = g + opOnvoorzien[i] - opKorting[i]
    return { tarief, grondslag, btw: procent(grondslag, tarief) }
  })
  const verkoop = bruto + onvoorzien - korting
  const btwTotaal = btw.reduce((t, b) => t + b.btw, 0)
  const winst = verkoop - kostprijs

  const soorten = new Map<Soort | "arbeid", { kostprijs: Centen; verkoop: Centen }>()
  if (arbeid) soorten.set("arbeid", { kostprijs: 0, verkoop: arbeid })
  for (const r of regels) {
    const s = soorten.get(r.soort) ?? { kostprijs: 0, verkoop: 0 }
    soorten.set(r.soort, { kostprijs: s.kostprijs + r.kostprijs, verkoop: s.verkoop + r.verkoop })
  }

  return {
    regels,
    optioneel,
    arbeid,
    materiaal,
    onvoorzien,
    korting,
    verkoop,
    kostprijs,
    winst,
    marge: verhouding(winst, verkoop),
    opslag: verhouding(winst, kostprijs),
    btw,
    btwTotaal,
    totaal: verkoop + btwTotaal,
    perUur: invoer.uren ? deel(winst * 1000, invoer.uren) : 0,
    perSoort: [...soorten.entries()].map(([soort, s]) => ({ soort, ...s })),
  }
}

/**
 * Na betaling wegzetten: wat naar leveranciers gaat, wat naar de
 * btw-rekening (verkoop-btw min de btw op je inkoop) en wat je reserveert
 * voor de belasting op wat je overhoudt.
 */
export function wegzetten(u: Uitkomst, reserveBelasting: Bp = STANDAARD.reserveBelasting) {
  const btwInkoop = u.regels.reduce((t, r) => t + procent(r.kostprijs, r.btw), 0)
  const leveranciers = u.kostprijs + btwInkoop
  const btwAfdragen = u.btwTotaal - btwInkoop
  const reserve = procent(Math.max(0, u.winst), reserveBelasting)
  return { leveranciers, btwInkoop, btwAfdragen, reserve, vrij: u.winst - reserve }
}

/** Hoeveel moet de verkoop excl. btw omhoog om het minimum per uur te halen? */
export function tekort(u: Uitkomst, uren: Milli, minimumPerUur: Centen = STANDAARD.minimumPerUur): Centen {
  if (!uren) return 0
  return Math.max(0, maal(minimumPerUur, uren) - u.winst)
}

/** Marge en opslag zijn twee kanten van dezelfde winst; dit is de omrekening. */
export const margeUitOpslag = (opslag: Bp): Bp => deel(opslag * HONDERD_PROCENT, HONDERD_PROCENT + opslag)
export const opslagUitMarge = (marge: Bp): Bp => (marge >= HONDERD_PROCENT ? 0 : deel(marge * HONDERD_PROCENT, HONDERD_PROCENT - marge))

export function nieuweRegel(soort: Soort = "materiaal", velden: Partial<Regel> = {}): Regel {
  return {
    id: crypto.randomUUID(),
    soort,
    omschrijving: "",
    hoeveelheid: 1000,
    eenheid: "st",
    inkoop: 0,
    opslag: SOORTEN[soort].opslag,
    btw: SOORTEN[soort].btw,
    afval: 0,
    ...velden,
  }
}

/** Een opgeslagen regel van onbekende vorm (oude versie, Claude) veilig maken. */
export function schoonRegel(r: Partial<Regel> & Record<string, unknown>): Regel {
  const soort = typeof r.soort === "string" && isSoort(r.soort) ? r.soort : "overig"
  const geheel = (v: unknown, standaard: number, min = 0, max = 1e12) => (Number.isSafeInteger(v) ? Math.min(max, Math.max(min, v as number)) : standaard)
  return {
    id: typeof r.id === "string" && r.id ? r.id.slice(0, 64) : crypto.randomUUID(),
    soort,
    omschrijving: String(r.omschrijving ?? "").slice(0, 200),
    hoeveelheid: geheel(r.hoeveelheid, 1000),
    eenheid: String(r.eenheid ?? "st").slice(0, 12) || "st",
    inkoop: geheel(r.inkoop, 0),
    opslag: geheel(r.opslag, SOORTEN[soort].opslag, 0, 100000),
    btw: BTW_TARIEVEN.includes(r.btw as number) ? (r.btw as number) : SOORTEN[soort].btw,
    afval: geheel(r.afval, 0, 0, 10000),
    groep: r.groep ? String(r.groep).slice(0, 60) : undefined,
    optioneel: r.optioneel === true || undefined,
    catalogusId: typeof r.catalogusId === "string" ? r.catalogusId.slice(0, 64) : undefined,
    meetstaat: typeof r.meetstaat === "string" && r.meetstaat ? r.meetstaat.slice(0, 64) : undefined,
  }
}

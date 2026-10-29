import { BTW_TARIEVEN, SOORTEN, isSoort, type Soort } from "./calculatie"
import { nieuwItem, zetPrijs, type Item } from "./catalogus"
import { leesBp, leesCenten } from "./geld"

// Prijslijsten van leveranciers inlezen (29 okt 2026, Tuinvariant en
// Gardenlux, duizenden regels). Hetzelfde formaat als de CSV-export:
// puntkomma's, UTF-8 met BOM, kolom Groep erbij. Een regel met dezelfde
// leverancier en hetzelfde artikelnummer werkt het bestaande item bij, zodat
// de oude prijs in de historie komt. Opslag, afval en btw van een bestaand
// item blijven zoals Nick ze zette; die komen alleen bij een nieuw item uit
// het bestand.

export const MAX_REGELS = 10000

/** CSV met puntkomma's (of komma's) en aanhalingstekens naar rijen. */
export function leesCsv(tekst: string): string[][] {
  const t = tekst.replace(/^﻿/, "")
  const eerste = t.slice(0, t.search(/\r?\n|$/))
  const scheider = (eerste.match(/;/g)?.length ?? 0) >= (eerste.match(/,/g)?.length ?? 0) ? ";" : ","
  const rijen: string[][] = []
  let rij: string[] = []
  let cel = ""
  let quote = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (quote) {
      if (c === '"' && t[i + 1] === '"') (cel += '"'), i++
      else if (c === '"') quote = false
      else cel += c
    } else if (c === '"') quote = true
    else if (c === scheider) rij.push(cel), (cel = "")
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++
      rij.push(cel), rijen.push(rij), (rij = []), (cel = "")
    } else cel += c
  }
  if (cel || rij.length) rij.push(cel), rijen.push(rij)
  return rijen.filter((r) => r.some((c) => c.trim()))
}

const plat = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
const KOLOMMEN = {
  naam: ["naam", "omschrijving"],
  soort: ["soort"],
  eenheid: ["eenheid"],
  inkoop: ["inkoop excl. btw", "inkoop", "prijs"],
  opslag: ["opslag %", "opslag"],
  btw: ["btw %", "btw"],
  afval: ["afval %", "afval"],
  leverancier: ["leverancier"],
  sku: ["artikelnummer", "sku"],
  link: ["link"],
  bijgewerkt: ["bijgewerkt"],
  groep: ["groep"],
} as const

const soortUit = (s: string): Soort | undefined => {
  const p = plat(s)
  if (isSoort(p)) return p
  return (Object.keys(SOORTEN) as Soort[]).find((k) => plat(SOORTEN[k].naam) === p)
}

/** Sleutel om een regel aan een bestaand item te koppelen. */
export const koppel = (i: Pick<Item, "leverancier" | "sku" | "naam">) =>
  `${plat(i.leverancier)}|${i.sku.trim() ? `#${i.sku.trim().toLowerCase()}` : plat(i.naam)}`

export type ImportUitkomst = { nieuw: number; bijgewerkt: number; gelijk: number; afgewezen: number[]; fout?: string }

/** Past de rijen toe op de catalogus. Puur: geeft de nieuwe lijst en de telling terug. */
export function importeer(items: Item[], rijen: string[][]): { items: Item[]; uitkomst: ImportUitkomst } {
  const uitkomst: ImportUitkomst = { nieuw: 0, bijgewerkt: 0, gelijk: 0, afgewezen: [] }
  const kop = (rijen[0] ?? []).map(plat)
  const kol = Object.fromEntries(Object.entries(KOLOMMEN).map(([k, namen]) => [k, kop.findIndex((h) => (namen as readonly string[]).includes(h))])) as Record<keyof typeof KOLOMMEN, number>
  if (kol.naam < 0 || kol.inkoop < 0) return { items, uitkomst: { ...uitkomst, fout: "De eerste regel mist de kolommen Naam en Inkoop excl. btw." } }
  if (rijen.length - 1 > MAX_REGELS) return { items, uitkomst: { ...uitkomst, fout: `Meer dan ${MAX_REGELS} regels. Splits het bestand.` } }

  // Eerst de regels lezen; staat hetzelfde artikel twee keer in het bestand, dan telt de laatste.
  type Regel = Omit<Item, "id" | "historie" | "opslag" | "btw" | "afval" | "notitie" | "bijgewerkt"> & { opslag: number | null; btw: number | null; afval: number | null; datum: string }
  const regels = new Map<string, Regel>()
  const rauw = new Map<string, { soort: string; eenheid: string }>()
  for (let r = 1; r < rijen.length; r++) {
    const rij = rijen[r]
    const v = (k: keyof typeof KOLOMMEN, n: number) => (kol[k] >= 0 ? (rij[kol[k]] ?? "").trim().slice(0, n) : "")
    const naam = v("naam", 120)
    const inkoop = leesCenten(v("inkoop", 20))
    if (!naam || inkoop === null || inkoop < 0) {
      uitkomst.afgewezen.push(r + 1)
      continue
    }
    const link = v("link", 300)
    const regel: Regel = {
      naam,
      soort: soortUit(v("soort", 40)) ?? "materiaal",
      eenheid: v("eenheid", 12) || "st",
      inkoop,
      leverancier: v("leverancier", 80),
      sku: v("sku", 40),
      link: /^https:\/\//.test(link) ? link : "",
      groep: v("groep", 60) || undefined,
      opslag: leesBp(v("opslag", 10)),
      btw: leesBp(v("btw", 6)),
      afval: leesBp(v("afval", 10)),
      datum: v("bijgewerkt", 10),
    }
    regels.set(koppel(regel), regel)
    rauw.set(koppel(regel), { soort: v("soort", 40), eenheid: v("eenheid", 12) })
  }

  const uit = [...items]
  const index = new Map(uit.map((i, n) => [koppel(i), n]))
  for (const [sleutel, { opslag, btw, afval, datum, inkoop, ...velden }] of regels) {
    const plek = index.get(sleutel)
    if (plek === undefined) {
      uit.push(
        nieuwItem({
          ...velden,
          inkoop,
          opslag: opslag !== null && opslag >= 0 ? opslag : SOORTEN[velden.soort].opslag,
          btw: btw !== null && BTW_TARIEVEN.includes(btw) ? btw : SOORTEN[velden.soort].btw,
          afval: afval !== null && afval >= 0 ? afval : 0,
          geimporteerd: true,
          ...(/^\d{4}-\d{2}-\d{2}$/.test(datum) ? { bijgewerkt: datum } : {}),
        }),
      )
      uitkomst.nieuw++
      continue
    }
    const oud = uit[plek]
    // Een kolom die ontbreekt of leeg is, laat het bestaande veld staan.
    const nieuw: Item = {
      ...zetPrijs(oud, inkoop, velden.leverancier),
      naam: velden.naam,
      soort: kol.soort >= 0 && soortUit(rauw.get(sleutel)?.soort ?? "") ? velden.soort : oud.soort,
      eenheid: rauw.get(sleutel)?.eenheid ? velden.eenheid : oud.eenheid,
      link: velden.link || oud.link,
      groep: velden.groep ?? oud.groep,
      geimporteerd: true,
    }
    if ((Object.keys(nieuw) as (keyof Item)[]).some((k) => nieuw[k] !== oud[k])) {
      uit[plek] = nieuw
      uitkomst.bijgewerkt++
    } else uitkomst.gelijk++
  }
  return { items: uit, uitkomst }
}

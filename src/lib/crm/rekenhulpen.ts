import { deel, maal, plusProcent, type Bp, type Centen, type Milli } from "./geld"

// Rekenhulpen voor hoeveelheden (masterprompt CRM, module 06). Elke hulp
// neemt maten in duizendsten (m, m², mm via `dikte` in mm) en geeft een
// hoeveelheid in duizendsten terug, met de eenheid en de formule erbij, zodat
// het in de calculatie als regel staat en Nick ziet waar het getal vandaan
// komt. Afronden: hoeveelheden half naar boven op 0,001; stuks altijd naar
// boven op hele stuks; bestellen in hele eenheden gebeurt met `bestelBoven`.

export type Hoeveelheid = { hoeveelheid: Milli; eenheid: string; formule: string }

const t = (m: Milli, d = 2) => {
  const s = (m / 1000).toLocaleString("nl-NL", { maximumFractionDigits: d })
  return s
}

/** Naar boven afronden op een besteleenheid (bijv. 500 = per halve m³). */
export const bestelBoven = (m: Milli, stap: Milli): Milli => (stap > 0 ? Math.ceil(m / stap) * stap : m)

/** 1. en 2. Bestrating met snijverlies: 55 m² + 7 % = 58,85 m². */
export function bestrating(oppervlak: Milli, snijverlies: Bp): Hoeveelheid {
  const h = plusProcent(oppervlak, snijverlies)
  return { hoeveelheid: h, eenheid: "m²", formule: `${t(oppervlak)} m² × (1 + ${t(snijverlies * 10)} %) = ${t(h, 3)} m²` }
}

/** 3. Afgraven: oppervlak × diepte. Diepte in mm. */
export function afgraven(oppervlak: Milli, diepteMm: number): Hoeveelheid {
  const h = deel(oppervlak * diepteMm, 1000)
  return { hoeveelheid: h, eenheid: "m³", formule: `${t(oppervlak)} m² × ${diepteMm} mm = ${t(h, 3)} m³ vast` }
}

/** 4. Grond aanvoeren: oppervlak × laagdikte, plus inklinking (los gestorte grond zakt 10–20 %). */
export function grond(oppervlak: Milli, dikteMm: number, inklinking: Bp): Hoeveelheid {
  const vast = deel(oppervlak * dikteMm, 1000)
  const h = plusProcent(vast, inklinking)
  return { hoeveelheid: h, eenheid: "m³", formule: `${t(oppervlak)} m² × ${dikteMm} mm × (1 + ${t(inklinking * 10)} % inklinking) = ${t(h, 3)} m³` }
}

/** 5. Grind, split, fundering: volume én gewicht (soortelijk gewicht in kg per m³). */
export function grind(oppervlak: Milli, dikteMm: number, kgPerM3: number): Hoeveelheid & { ton: Milli } {
  const m3 = deel(oppervlak * dikteMm, 1000)
  const ton = deel(m3 * kgPerM3, 1000)
  return { hoeveelheid: ton, eenheid: "ton", ton, formule: `${t(oppervlak)} m² × ${dikteMm} mm = ${t(m3, 3)} m³ × ${t(kgPerM3)} t/m³ = ${t(ton, 3)} ton` }
}

/** 6. Gazon: graszoden met snijverlies, of zaad in kg (gram per m²). */
export function gazon(oppervlak: Milli, snijverlies: Bp): Hoeveelheid {
  const h = plusProcent(oppervlak, snijverlies)
  return { hoeveelheid: h, eenheid: "m²", formule: `${t(oppervlak)} m² graszoden + ${t(snijverlies * 10)} % = ${t(h, 3)} m²` }
}
export function graszaad(oppervlak: Milli, gramPerM2: number): Hoeveelheid {
  const h = deel(oppervlak * gramPerM2, 1000)
  return { hoeveelheid: h, eenheid: "kg", formule: `${t(oppervlak)} m² × ${gramPerM2} g/m² = ${t(h, 3)} kg` }
}

/** 7. Planten: oppervlak × plantdichtheid per m², altijd naar boven op hele planten. */
export function planten(oppervlak: Milli, perM2: Milli): Hoeveelheid {
  const ruw = deel(oppervlak * perM2, 1000)
  const h = Math.ceil(ruw / 1000) * 1000
  return { hoeveelheid: h, eenheid: "st", formule: `${t(oppervlak)} m² × ${t(perM2)} per m² = ${t(ruw)} → ${h / 1000} st` }
}

/** 8. Mulch en compost: oppervlak × laagdikte. */
export function mulch(oppervlak: Milli, dikteMm: number): Hoeveelheid {
  const h = deel(oppervlak * dikteMm, 1000)
  return { hoeveelheid: h, eenheid: "m³", formule: `${t(oppervlak)} m² × ${dikteMm} mm = ${t(h, 3)} m³` }
}

/** 9. Machinehuur: dagen × dagprijs + transport heen en terug. Geeft een bedrag. */
export function machinehuur(dagen: Milli, dagprijs: Centen, transport: Centen): { bedrag: Centen; formule: string } {
  const bedrag = maal(dagprijs, dagen) + transport
  return { bedrag, formule: `${t(dagen)} dag × € ${t(dagprijs * 10)} + € ${t(transport * 10)} transport = € ${t(bedrag * 10)}` }
}

/** 10. Arbeid: hoeveelheid ÷ dagproductie × 8 uur, naar boven op een half uur. */
export function arbeid(hoeveelheid: Milli, perDag: Milli, urenPerDag = 8): Hoeveelheid {
  if (!perDag) return { hoeveelheid: 0, eenheid: "uur", formule: "Geen dagproductie" }
  const ruw = deel(hoeveelheid * urenPerDag * 1000, perDag)
  const h = Math.ceil(ruw / 500) * 500
  return { hoeveelheid: h, eenheid: "uur", formule: `${t(hoeveelheid)} ÷ ${t(perDag)} per dag × ${urenPerDag} uur = ${t(ruw)} → ${t(h)} uur` }
}

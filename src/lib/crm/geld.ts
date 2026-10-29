// Rekenen met geld en hoeveelheden zonder kommagetallen (masterprompt CRM,
// 29 okt 2026: "Do not use floating-point arithmetic for monetary
// calculations"). Alles is een geheel getal:
//
// - geld in centen (€ 12,34 = 1234)
// - hoeveelheden in duizendsten (58,85 m² = 58850)
// - percentages in honderdsten van een procent, "bp" (7 % = 700, 12,5 % = 1250)
//
// Afronden gebeurt op één plek (`deel`): half naar boven, weg van nul, zoals
// de Belastingdienst btw afrondt. Een getal uit een invulveld gaat via
// `leesDecimaal`, dat de tekst zelf ontleedt, nooit via Number("12,34") * 100.

export type Centen = number
export type Milli = number
export type Bp = number

export const HONDERD_PROCENT: Bp = 10000

/** a / b als geheel getal, half weg van nul afgerond. Alleen gehele getallen in. */
export function deel(teller: number, noemer: number): number {
  if (!Number.isSafeInteger(teller) || !Number.isSafeInteger(noemer) || noemer === 0) throw new RangeError(`deel(${teller}, ${noemer})`)
  const teken = Math.sign(teller) * Math.sign(noemer)
  const t = Math.abs(teller)
  const n = Math.abs(noemer)
  const q = Math.floor(t / n)
  const rest = t - q * n
  return teken * (rest * 2 >= n ? q + 1 : q)
}

/** Bedrag × hoeveelheid: centen per eenheid maal duizendsten, terug naar centen. */
export const maal = (centen: Centen, hoeveelheid: Milli): Centen => deel(centen * hoeveelheid, 1000)

/** Een percentage van een bedrag (of hoeveelheid), afgerond. */
export const procent = (waarde: number, bp: Bp): number => deel(waarde * bp, HONDERD_PROCENT)

/** Waarde plus een percentage: 55 m² + 7 % = 58,85 m². */
export const plusProcent = (waarde: number, bp: Bp): number => deel(waarde * (HONDERD_PROCENT + bp), HONDERD_PROCENT)

/** Verhouding a/b als bp (marge, opslag). 0 als b 0 is. */
export const verhouding = (a: number, b: number): Bp => (b ? deel(a * HONDERD_PROCENT, b) : 0)

/**
 * Tekst uit een invulveld naar een geheel getal met `decimalen` cijfers achter
 * de komma. Leest "1.234,56", "1234.56", "12,5" en "€ 7". Geeft null bij onzin.
 */
export function leesDecimaal(tekst: string, decimalen: number): number | null {
  let s = String(tekst ?? "").replace(/[€\s]/g, "")
  if (!s) return null
  const negatief = s.startsWith("-")
  if (negatief) s = s.slice(1)
  // Laatste komma of punt is het decimaalteken als er hooguit `decimalen`+1
  // cijfers achter staan en het geen duizendtal ("1.234") is.
  const laatste = Math.max(s.lastIndexOf(","), s.lastIndexOf("."))
  let heel = s
  let fractie = ""
  if (laatste >= 0) {
    const na = s.slice(laatste + 1)
    const isDuizendtal = na.length === 3 && s[laatste] === "." && !s.includes(",")
    if (!isDuizendtal) {
      heel = s.slice(0, laatste)
      fractie = na
    }
  }
  heel = heel.replace(/[.,]/g, "")
  if (!/^\d*$/.test(heel) || !/^\d*$/.test(fractie) || (!heel && !fractie)) return null
  // Extra cijfers worden afgerond, niet afgekapt.
  const vol = Number((heel || "0") + fractie.padEnd(decimalen, "0").slice(0, decimalen))
  const volgend = fractie.length > decimalen ? Number(fractie[decimalen]) : 0
  const waarde = vol + (volgend >= 5 ? 1 : 0)
  if (!Number.isSafeInteger(waarde)) return null
  return negatief ? -waarde : waarde
}

export const leesCenten = (t: string) => leesDecimaal(t, 2)
export const leesMilli = (t: string) => leesDecimaal(t, 3)
export const leesBp = (t: string) => leesDecimaal(t, 2)

/** Geheel getal met n decimalen terug naar Nederlandse tekst: 58850, 3 → "58,85". */
export function toonDecimaal(waarde: number, decimalen: number, minimaal = 0): string {
  const negatief = waarde < 0
  const s = String(Math.abs(waarde)).padStart(decimalen + 1, "0")
  const heel = s.slice(0, s.length - decimalen) || "0"
  let fractie = decimalen ? s.slice(s.length - decimalen) : ""
  while (fractie.length > minimaal && fractie.endsWith("0")) fractie = fractie.slice(0, -1)
  const groepen = heel.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${negatief ? "-" : ""}${groepen}${fractie ? `,${fractie}` : ""}`
}

/** € 1.234,56 */
export const toonEuro = (c: Centen) => `€ ${toonDecimaal(c, 2, 2)}`
export const toonMilli = (m: Milli) => toonDecimaal(m, 3)
export const toonBp = (bp: Bp) => `${toonDecimaal(bp, 2)} %`

/** Voor de bestaande schermen die euro's als getal tonen (src/lib/format.ts). */
export const naarEuro = (c: Centen) => c / 100

/**
 * Verdeel `totaal` over delen naar rato van `gewichten`, zodat de som exact
 * klopt (grootste-rest-methode). Voor een korting over regels met
 * verschillende btw-tarieven.
 */
export function verdeel(totaal: number, gewichten: number[]): number[] {
  const som = gewichten.reduce((t, g) => t + g, 0)
  if (!som) return gewichten.map(() => 0)
  const ruw = gewichten.map((g) => Math.floor((Math.abs(totaal) * g) / som))
  let over = Math.abs(totaal) - ruw.reduce((t, x) => t + x, 0)
  const volgorde = gewichten
    .map((g, i) => ({ i, rest: (Math.abs(totaal) * g) % som }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
  for (const { i } of volgorde) {
    if (over <= 0) break
    ruw[i] += 1
    over -= 1
  }
  return ruw.map((x) => (totaal < 0 ? -x : x))
}

// Het weer bij de klusdagen in de planning (Nick, 2 nov 2026: "Weer bij klusdagen"). Eén plek voor
// het hele werkgebied: Stein. Er gaat geen klantadres naar buiten, alleen deze vaste coördinaten.
// Bron: MET Norway (api.met.no, CC BY 4.0, ook voor bedrijven), ongeveer 9 dagen vooruit.
// Geen pakket en geen sleutel; wel een User-Agent met contact, zoals MET vraagt.

export type DagWeer = { mm: number; min: number; max: number }

const STEIN = { lat: 50.97, lon: 5.78 }
const BRON = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${STEIN.lat}&lon=${STEIN.lon}`
const UUR = 60 * 60 * 1000

type Stap = { time: string; data: { instant: { details: { air_temperature?: number } }; next_1_hours?: { details?: { precipitation_amount?: number } }; next_6_hours?: { details?: { precipitation_amount?: number } } } }

const dagNL = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

/** De uurstappen van MET per Nederlandse datum: regen opgeteld, laagste en hoogste temperatuur. */
export function perDag(stappen: Stap[]): Record<string, DagWeer> {
  const uit: Record<string, DagWeer> = {}
  for (const s of stappen) {
    const d = dagNL(s.time)
    const w = (uit[d] ??= { mm: 0, min: Infinity, max: -Infinity })
    const t = s.data.instant.details.air_temperature
    if (typeof t === "number") {
      w.min = Math.min(w.min, t)
      w.max = Math.max(w.max, t)
    }
    // Eerst per uur, verderop per zes uur; nooit allebei optellen.
    w.mm += s.data.next_1_hours?.details?.precipitation_amount ?? s.data.next_6_hours?.details?.precipitation_amount ?? 0
  }
  for (const [d, w] of Object.entries(uit)) {
    if (!Number.isFinite(w.min)) delete uit[d]
    else uit[d] = { mm: Math.round(w.mm * 10) / 10, min: Math.round(w.min), max: Math.round(w.max) }
  }
  return uit
}

/** Kort label en of het een waarschuwing is: vorst gaat voor, daarna regen vanaf 1 mm. */
export function weerLabel(w: DagWeer): { tekst: string; let: boolean } {
  if (w.min <= 0) return { tekst: `Vorst ${String(w.min).replace("-", "−")}°`, let: true }
  if (w.mm >= 1) return { tekst: `Regen ${Math.round(w.mm)} mm`, let: w.mm >= 5 }
  return { tekst: `Droog ${w.max}°`, let: false }
}

let buffer: { tot: number; dagen: Record<string, DagWeer> } | null = null

/** De voorspelling, een uur bewaard per server. Lukt het niet, dan gewoon geen weer. */
export async function voorspelling(): Promise<Record<string, DagWeer>> {
  if (process.env.CRM_LOKAAL === "1") return {}
  if (buffer && buffer.tot > Date.now()) return buffer.dagen
  try {
    const r = await fetch(BRON, { headers: { "User-Agent": "gronn.studio planning (hello@gronn.studio)" }, cache: "no-store", signal: AbortSignal.timeout(4000) })
    if (!r.ok) return buffer?.dagen ?? {}
    const json = (await r.json()) as { properties?: { timeseries?: Stap[] } }
    const dagen = perDag(json.properties?.timeseries ?? [])
    buffer = { tot: Date.now() + UUR, dagen }
    return dagen
  } catch {
    return buffer?.dagen ?? {}
  }
}

/**
 * Voedselbos: het microspelletje op de 404 (eigenaar, 30 sep 2026: "maak
 * hier een microspelletje? simulatie, voedselbossen, maak het onbeperkt
 * speelbaar en gebruik local storage"). Pure functies, geen React: het
 * element `Voedselbos` roept `seizoenVerder` aan op een klok en bewaart
 * de stand onder `VOEDSELBOS_SLEUTEL`.
 *
 * Het spel in het kort. Een perceel van 6 × 6 vakken. Je plant met zaden
 * vijf lagen van een voedselbos: klaver (bodembedekker die stikstof bindt),
 * munt (kruid), bes (struik), appel (lage boom) en walnoot (kruinlaag).
 * Elk seizoen groeit wat staat (behalve in de winter); wat volwassen is,
 * draagt in zijn oogstseizoen en wacht dan tot je plukt. Plukken geeft
 * oogst en nieuwe zaden. De bodem van elk vak loopt van 0 tot 5: klaver
 * verrijkt de buren, kale grond spoelt langzaam uit, afgevallen blad in
 * de herfst voedt, en wat uitgebloeid is wordt compost. Een rijke bodem
 * en veel verschillende buren geven meer oogst. Klaver en munt leven een
 * paar jaar, dus het bos verandert altijd: het houdt nooit op.
 */

export const VOEDSELBOS_SLEUTEL = "gronn-voedselbos"
export const KOLOMMEN = 6
export const RIJEN = 6
export const SEIZOEN_MS = 5000

export type SoortId = "klaver" | "munt" | "bes" | "appel" | "walnoot"

export type Soort = {
  id: SoortId
  naam: string
  laag: string
  /** Zaden om te planten. */
  kost: number
  /** Groeiseizoenen tot volwassen. */
  volwassen: number
  /** Seizoenen waarin hij draagt (0 lente … 3 winter); leeg: nooit. */
  draagt: number[]
  /** Oogst per pluk bij bodem 0 en geen buren. */
  oogst: number
  /** Zaden per pluk. */
  zaden: number
  /** Groeiseizoenen tot hij uitbloeit; 0: blijft. */
  leeftijd: number
}

export const SOORTEN: Soort[] = [
  { id: "klaver", naam: "Klaver", laag: "Bodembedekker", kost: 1, volwassen: 1, draagt: [], oogst: 0, zaden: 0, leeftijd: 12 },
  { id: "munt", naam: "Munt", laag: "Kruid", kost: 1, volwassen: 1, draagt: [1], oogst: 1, zaden: 1, leeftijd: 9 },
  { id: "bes", naam: "Bes", laag: "Struik", kost: 2, volwassen: 3, draagt: [1], oogst: 2, zaden: 1, leeftijd: 0 },
  { id: "appel", naam: "Appel", laag: "Lage boom", kost: 3, volwassen: 6, draagt: [2], oogst: 4, zaden: 2, leeftijd: 0 },
  { id: "walnoot", naam: "Walnoot", laag: "Kruinlaag", kost: 5, volwassen: 9, draagt: [2], oogst: 7, zaden: 3, leeftijd: 0 },
]

export const SOORT: Record<SoortId, Soort> = Object.fromEntries(SOORTEN.map((s) => [s.id, s])) as Record<SoortId, Soort>

export const SEIZOENEN = ["Lente", "Zomer", "Herfst", "Winter"] as const

export type Plant = { soort: SoortId; groei: number; rijp: boolean }
export type Vak = { plant: Plant | null; bodem: number }

export type Stand = {
  v: 1
  vakken: Vak[]
  zaden: number
  oogst: number
  /** Seizoenen sinds het begin: seizoen = tik % 4, jaar = tik / 4 + 1. */
  tik: number
}

export function nieuweStand(): Stand {
  return {
    v: 1,
    vakken: Array.from({ length: KOLOMMEN * RIJEN }, () => ({ plant: null, bodem: 1 })),
    zaden: 4,
    oogst: 0,
    tik: 0,
  }
}

export const seizoenVan = (s: Stand) => s.tik % 4
export const jaarVan = (s: Stand) => Math.floor(s.tik / 4) + 1

export function buren(i: number): number[] {
  const r = Math.floor(i / KOLOMMEN)
  const k = i % KOLOMMEN
  const uit: number[] = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dk = -1; dk <= 1; dk++) {
      if (!dr && !dk) continue
      const rr = r + dr
      const kk = k + dk
      if (rr >= 0 && rr < RIJEN && kk >= 0 && kk < KOLOMMEN) uit.push(rr * KOLOMMEN + kk)
    }
  return uit
}

/** Verschillende soorten rondom een vak, zonder het vak zelf. */
export function burenSoorten(s: Stand, i: number): number {
  return new Set(buren(i).map((b) => s.vakken[b].plant?.soort).filter(Boolean)).size
}

/** Wat een pluk nu oplevert: bodem en diversiteit tellen mee. */
export function opbrengst(s: Stand, i: number): number {
  const plant = s.vakken[i].plant
  if (!plant) return 0
  const soort = SOORT[plant.soort]
  const divers = burenSoorten(s, i) >= 3 ? 1 : 0
  return Math.round(soort.oogst * (1 + s.vakken[i].bodem / 5)) + divers
}

export const isVolwassen = (p: Plant) => p.groei >= SOORT[p.soort].volwassen

const bodem = (n: number) => Math.min(5, Math.max(0, Math.round(n * 100) / 100))

export function plant(s: Stand, i: number, id: SoortId): Stand | null {
  const soort = SOORT[id]
  if (s.vakken[i]?.plant || s.zaden < soort.kost) return null
  const vakken = s.vakken.slice()
  vakken[i] = { ...vakken[i], plant: { soort: id, groei: 0, rijp: false } }
  return { ...s, vakken, zaden: s.zaden - soort.kost }
}

export function pluk(s: Stand, i: number): { stand: Stand; oogst: number; zaden: number } | null {
  const plant = s.vakken[i]?.plant
  if (!plant?.rijp) return null
  const oogst = opbrengst(s, i)
  const zaden = SOORT[plant.soort].zaden
  const vakken = s.vakken.slice()
  vakken[i] = { ...vakken[i], plant: { ...plant, rijp: false } }
  return { stand: { ...s, vakken, oogst: s.oogst + oogst, zaden: s.zaden + zaden }, oogst, zaden }
}

/** Eén seizoen verder. Deterministisch: dezelfde stand geeft dezelfde uitkomst. */
export function seizoenVerder(s: Stand): Stand {
  const tik = s.tik + 1
  const seizoen = tik % 4
  const vakken = s.vakken.map((v) => ({ plant: v.plant ? { ...v.plant } : null, bodem: v.bodem }))
  const extra = new Array(vakken.length).fill(0)

  vakken.forEach((v, i) => {
    const p = v.plant
    if (!p) {
      // Kale grond spoelt uit.
      extra[i] -= 0.1
      return
    }
    const soort = SOORT[p.soort]
    if (seizoen !== 3) p.groei++
    if (p.soort === "klaver") for (const b of buren(i)) extra[b] += 0.15
    // Afgevallen blad in de herfst.
    if (seizoen === 2 && p.soort !== "klaver" && p.soort !== "munt") extra[i] += 0.2
    if (soort.leeftijd && p.groei >= soort.leeftijd) {
      // Uitgebloeid: het wordt compost.
      v.plant = null
      extra[i] += 1
      return
    }
    if (isVolwassen(p) && soort.draagt.includes(seizoen)) p.rijp = true
  })
  vakken.forEach((v, i) => (v.bodem = bodem(v.bodem + extra[i])))

  // In de lente waait er altijd een zaadje aan, zodat je nooit vastzit.
  const zaden = s.zaden + (seizoen === 0 ? 1 : 0)
  return { ...s, vakken, zaden, tik }
}

/** Een bewaarde stand, of null als hij ontbreekt of niet klopt. */
export function leesStand(ruw: string | null): Stand | null {
  if (!ruw) return null
  try {
    const s = JSON.parse(ruw) as Stand
    const goed =
      s?.v === 1 &&
      Array.isArray(s.vakken) &&
      s.vakken.length === KOLOMMEN * RIJEN &&
      [s.zaden, s.oogst, s.tik].every((n) => Number.isFinite(n) && n >= 0) &&
      s.vakken.every(
        (v) =>
          Number.isFinite(v?.bodem) &&
          (v.plant === null || (v.plant && v.plant.soort in SOORT && Number.isFinite(v.plant.groei)))
      )
    return goed ? s : null
  } catch {
    return null
  }
}

/**
 * Doelen, af te lezen uit de stand zelf (niets extra's om te bewaren). Ze
 * geven richting; het spel gaat na het laatste gewoon door.
 */
const gemBodem = (s: Stand) => s.vakken.reduce((som, v) => som + v.bodem, 0) / s.vakken.length
export const soortenVan = (s: Stand) => new Set(s.vakken.map((v) => v.plant?.soort).filter(Boolean)).size

export const DOELEN: { naam: string; gehaald: (s: Stand) => boolean }[] = [
  { naam: "Pluk je eerste oogst", gehaald: (s) => s.oogst >= 1 },
  { naam: "Plant drie lagen", gehaald: (s) => soortenVan(s) >= 3 },
  { naam: "Plant alle vijf de lagen", gehaald: (s) => soortenVan(s) === 5 },
  { naam: "Maak de bodem gemiddeld 3", gehaald: (s) => gemBodem(s) >= 3 },
  { naam: "Oogst 100", gehaald: (s) => s.oogst >= 100 },
  { naam: "Laat vier walnoten volwassen worden", gehaald: (s) => s.vakken.filter((v) => v.plant?.soort === "walnoot" && isVolwassen(v.plant)).length >= 4 },
  { naam: "Haal jaar 10", gehaald: (s) => jaarVan(s) >= 10 },
  { naam: "Oogst 1000", gehaald: (s) => s.oogst >= 1000 },
  { naam: "Maak elk vak bodem 5", gehaald: (s) => s.vakken.every((v) => v.bodem >= 5) },
  { naam: "Oogst 10.000", gehaald: (s) => s.oogst >= 10000 },
]

// Maan en zon, lokaal uitgerekend: geen bibliotheek, geen locatievraag.
// Gebruikt door de rechterbubbel, de voet en de tuinkalender (/calendar).
//
// Maan: de synodische maand vanaf een bekende nieuwe maan (6 jan 2000,
// 18:14 UTC). Nauwkeurig tot op een halve dag, meer dan genoeg voor een
// icoontje van 14px.
//
// Zon: het algoritme van NOAA zoals SunCalc het schrijft (Astronomy
// Answers-reeks), voor één vaste plek: Stein, 51,0 N 5,77 O. Binnen een
// paar minuten van de tabellen.

const DAG = 86_400_000
const J1970 = 2440588
const J2000 = 2451545
const RAD = Math.PI / 180

const julian = (d: Date) => d.getTime() / DAG - 0.5 + J1970
const vanJulian = (j: number) => new Date((j + 0.5 - J1970) * DAG)

// ——— Maan ————————————————————————————————————————————————

export const SYNODISCHE_MAAND = 29.530588853
/** Nieuwe maan van 6 januari 2000, 18:14 UTC, als juliaanse dag. */
const NIEUWE_MAAN_EPOCH = 2451550.1

export type MaanFase = {
  /** 0 = nieuw, 0,5 = vol, naar 1 terug naar nieuw. */
  fase: number
  /** Verlicht deel van de schijf, 0–1. */
  verlicht: number
  wassend: boolean
  naam: { nl: string; en: string }
}

export function maanFase(datum: Date): MaanFase {
  const leeftijd =
    (((julian(datum) - NIEUWE_MAAN_EPOCH) % SYNODISCHE_MAAND) + SYNODISCHE_MAAND) %
    SYNODISCHE_MAAND
  const fase = leeftijd / SYNODISCHE_MAAND
  const verlicht = (1 - Math.cos(2 * Math.PI * fase)) / 2
  const wassend = fase < 0.5
  // Acht vakken, met de vier hoofdstanden als smalle banden eromheen.
  const achtste = Math.round(fase * 8) % 8
  const NAMEN = [
    { nl: "Nieuwe maan", en: "New moon" },
    { nl: "Wassende maan", en: "Waxing crescent" },
    { nl: "Eerste kwartier", en: "First quarter" },
    { nl: "Wassende maan", en: "Waxing gibbous" },
    { nl: "Volle maan", en: "Full moon" },
    { nl: "Afnemende maan", en: "Waning gibbous" },
    { nl: "Laatste kwartier", en: "Last quarter" },
    { nl: "Afnemende maan", en: "Waning crescent" },
  ]
  return { fase, verlicht, wassend, naam: NAMEN[achtste] }
}

/**
 * De eerstvolgende volle of nieuwe maan na `vanaf`, gevonden door
 * `maanFase` per uur vooruit te zetten (hooguit 31 dagen): vol is waar
 * de fase 0,5 passeert, nieuw waar hij van bijna 1 terugvalt naar 0. Zo
 * nauwkeurig als `maanFase` zelf, een halve dag, dus alleen als datum
 * tonen. Gebruikt door de tuinkalender (/calendar).
 */
export function volgendeMaan(vanaf: Date, soort: "vol" | "nieuw"): Date {
  const UUR = 3_600_000
  let vorige = maanFase(vanaf).fase
  for (let u = 1; u <= 31 * 24; u++) {
    const t = new Date(vanaf.getTime() + u * UUR)
    const fase = maanFase(t).fase
    if (soort === "vol" ? vorige < 0.5 && fase >= 0.5 : fase < vorige) return t
    vorige = fase
  }
  // Onbereikbaar: binnen een synodische maand komen beide standen langs.
  return new Date(vanaf.getTime() + SYNODISCHE_MAAND * DAG)
}

// ——— Zon ———————————————————————————————————————————————————

/** Stein, Limburg: de vaste plek van de studio. */
export const STEIN = { lat: 51.0, lng: 5.77 }

const J0 = 0.0009
const SCHUINTE = 23.4397 * RAD

export type ZonTijden = { op: Date; onder: Date; middag: Date } | null

/** Zonsopkomst en -ondergang (−0,833°, rand van de schijf met refractie). */
export function zonTijden(datum: Date, plek = STEIN): ZonTijden {
  const lw = -plek.lng * RAD
  const phi = plek.lat * RAD
  const d = julian(datum) - J2000
  const n = Math.round(d - J0 - lw / (2 * Math.PI))
  const benadering = (ht: number) => J0 + (ht + lw) / (2 * Math.PI) + n
  const ds = benadering(0)
  const M = RAD * (357.5291 + 0.98560028 * ds)
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const L = M + C + RAD * 102.9372 + Math.PI
  const dec = Math.asin(Math.sin(SCHUINTE) * Math.sin(L))
  const transit = (a: number) => J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L)
  const jMiddag = transit(ds)
  const cosW =
    (Math.sin(-0.833 * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec))
  if (cosW < -1 || cosW > 1) return null // poolnacht of middernachtzon; niet in Stein
  const w = Math.acos(cosW)
  const jOnder = transit(benadering(w))
  const jOp = jMiddag - (jOnder - jMiddag)
  return { op: vanJulian(jOp), onder: vanJulian(jOnder), middag: vanJulian(jMiddag) }
}

/** Waar de zon op de boog staat: 0 = op, 1 = onder, null = nacht. */
export function zonStand(nu: Date, tijden: ZonTijden): number | null {
  if (!tijden) return null
  const t = (nu.getTime() - tijden.op.getTime()) / (tijden.onder.getTime() - tijden.op.getTime())
  return t < 0 || t > 1 ? null : t
}

/** Klokschrijfwijze in Nederlandse tijd: de plek staat vast, de tijd dus ook. */
export function klok(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  }).format(d)
}

/** Daglengte in minuten, van op tot onder. */
export function daglengte(tijden: NonNullable<ZonTijden>): number {
  return Math.round((tijden.onder.getTime() - tijden.op.getTime()) / 60_000)
}

/** Een duur in minuten als "12 u 04 min" / "12 h 04 min". */
export function duurTekst(minuten: number, locale: "nl" | "en"): string {
  const u = Math.floor(minuten / 60)
  const min = String(minuten % 60).padStart(2, "0")
  return `${u} ${locale === "nl" ? "u" : "h"} ${min} min`
}

/** Datum in Nederlandse tijd, in de taal van de bezoeker ("vrijdag 2 oktober"). */
export function datumIn(d: Date, locale: "nl" | "en", opties: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", { ...opties, timeZone: "Europe/Amsterdam" }).format(d)
}

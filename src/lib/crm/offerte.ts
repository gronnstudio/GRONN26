import "server-only"
import { reken } from "./calculatie"
import type { Bp, Centen } from "./geld"
import { toonDecimaal } from "./geld"
import type { Calculatie, Klant, Versie } from "./klant"
import { leesJson, wijzigJson } from "./opslag"

// Een offerte met een privélink (eigenaar, 29 okt 2026: "een privélink per
// offerte, waarmee de klant de offerte bekijkt en op Akkoord drukt, zonder in
// te loggen"). Bij het maken wordt een momentopname bewaard met alleen wat de
// klant mag zien: omschrijving, hoeveelheid en prijs. Inkoop, opslag, uren en
// winst gaan er nooit in. Elke offerte is een eigen document onder een
// onraadbare sleutel, zodat de link niets anders kan lezen dan die ene offerte.

export type OffertePost = { omschrijving: string; hoeveelheid: string; bedrag: Centen }

export type Offerte = {
  token: string
  klantId: string
  calculatieId: string
  versie: number
  nummer: string
  datum: string
  geldigTot: string
  klant: string
  adres: string
  titel: string
  beschrijving: string
  posten: OffertePost[]
  optioneel: OffertePost[]
  onvoorzien: Centen
  korting: Centen
  verkoop: Centen
  btw: { tarief: Bp; grondslag: Centen; btw: Centen }[]
  totaal: Centen
  status: "open" | "akkoord" | "ingetrokken"
  akkoord?: { naam: string; op: string }
}

export const GELDIG_DAGEN = 30
const pad = (token: string) => `crm/offertes/${token}.json`
export const isToken = (t: string) => /^[A-Za-z0-9_-]{32}$/.test(t)

export function nieuwToken() {
  const b = crypto.getRandomValues(new Uint8Array(24))
  return Buffer.from(b).toString("base64url")
}

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const plusDagen = (d: string, n: number) => {
  const t = new Date(`${d}T12:00:00Z`)
  t.setUTCDate(t.getUTCDate() + n)
  return t.toISOString().slice(0, 10)
}

/** GR-O // 20261029 0001: per dag doorgeteld over de offertes van deze klant en de rest. */
export function offerteNummer(klanten: Klant[], datum = vandaag()) {
  const dag = datum.replaceAll("-", "")
  const vandaagAl = klanten.flatMap((k) => k.stukken).filter((s) => s.soort === "Offerte" && s.nummer.replace(/\D/g, "").startsWith(dag)).length
  return `GR-O // ${dag}${String(vandaagAl + 1).padStart(4, "0")}`
}

const hoeveel = (milli: number, eenheid: string) => `${toonDecimaal(milli, 3)} ${eenheid}`.trim()

export function maakOfferte(k: Klant, c: Calculatie, v: Versie, nummer: string): Offerte {
  const u = reken({ uren: v.uren, uurtarief: v.uurtarief, regels: v.regels, onvoorzien: v.onvoorzien, korting: v.korting })
  const tuin = k.tuinen.find((t) => t.id === c.tuinId)
  const datum = vandaag()
  return {
    token: nieuwToken(),
    klantId: k.id,
    calculatieId: c.id,
    versie: v.nr,
    nummer,
    datum,
    geldigTot: plusDagen(datum, GELDIG_DAGEN),
    klant: k.bedrijf || k.naam,
    adres: tuin?.adres || k.adres || k.plaats,
    titel: c.titel,
    beschrijving: v.beschrijving,
    posten: [
      ...(u.arbeid ? [{ omschrijving: "Arbeid", hoeveelheid: "", bedrag: u.arbeid }] : []),
      ...u.regels.map((r) => ({ omschrijving: r.omschrijving || "Post", hoeveelheid: hoeveel(r.brutoHoeveelheid, r.eenheid), bedrag: r.verkoop })),
    ],
    optioneel: u.optioneel.map((r) => ({ omschrijving: r.omschrijving || "Post", hoeveelheid: hoeveel(r.brutoHoeveelheid, r.eenheid), bedrag: r.verkoop })),
    onvoorzien: u.onvoorzien,
    korting: u.korting,
    verkoop: u.verkoop,
    btw: u.btw,
    totaal: u.totaal,
    status: "open",
  }
}

export const leesOfferte = (token: string) => (isToken(token) ? leesJson<Offerte | null>(pad(token), () => null) : Promise.resolve(null))

export async function bewaarOfferte(o: Offerte) {
  await wijzigJson<Offerte | null>(pad(o.token), () => null, () => o)
}

/** Pas een bestaande offerte aan; geeft de nieuwe stand terug, of null als hij niet bestaat. */
export async function wijzigOfferte(token: string, f: (o: Offerte) => Offerte) {
  if (!isToken(token)) return null
  return wijzigJson<Offerte | null>(pad(token), () => null, (o) => (o ? f(o) : o))
}

export const verlopen = (o: Offerte) => o.geldigTot < vandaag()

import { schoonPlan, type PlanFase } from "./planning"
import { normaliseerProject, type Project } from "./project"
import { calculatieTitel, schoonRegel, type Regel } from "./calculatie"
import type { Bp, Centen, Milli } from "./geld"
import { INTAKE_SOORTEN, STANDAARD, ZONE_SOORTEN, vraagMap, type IntakeSoort, type Zone } from "./vragenlijst"

// Het klantmodel van het CRM: contact, lead, tuinen, calculaties en een
// tijdlijn, in één document per klant (ADR 0001). Dit bestand is veilig voor
// de browser: alleen typen, vaste lijsten en pure functies. Lezen en schrijven
// staat in src/lib/beheer/klanten.ts.
//
// Uitbreiding van de klantkaart van 29 okt 2026 (PR #148): alle oude velden
// blijven bestaan en `normaliseer` vult de nieuwe aan, dus de bestaande
// klanten in Blob hoeven niet omgezet te worden.

export const KLANT_FASEN = ["Aanvraag", "Opname", "Offerte", "Akkoord", "Gepland", "Uitvoering", "Opgeleverd", "Verloren"] as const
export type KlantFase = (typeof KLANT_FASEN)[number]
/** Fasen waarin een klus nog loopt: niet afgerond en niet verloren. */
/** Stoplicht per fase: rood verloren, oranje nog te doen (aanvraag tot offerte), groen afgesproken tot opgeleverd. */
export const faseKleur = (f: string): "let" | "actie" | "goed" =>
  f === "Verloren" ? "let" : ["Aanvraag", "Opname", "Offerte"].includes(f) ? "actie" : "goed"
export const faseBadge = (f: string) => ({ let: "crm-badge crm-badge-let", actie: "crm-badge", goed: "crm-badge crm-badge-goed" })[faseKleur(f)]
export const isOpen = (f: KlantFase) => f !== "Opgeleverd" && f !== "Verloren"

export const KLANT_SOORTEN = ["Particulier", "Zakelijk", "Leverancier", "Onderaannemer", "Architect", "Tuinontwerper", "Partner"] as const
export type KlantSoort = (typeof KLANT_SOORTEN)[number]

export const BRONNEN = ["Formulier", "WhatsApp", "Telefoon", "Instagram", "Google", "Via via", "Bord", "Anders"] as const
export const VOORKEUREN = ["Telefoon", "WhatsApp", "E-mail"] as const
export const PRIORITEITEN = ["Hoog", "Normaal", "Laag"] as const
export const VERLOREN_REDENEN = ["Te duur", "Koos een ander", "Doet het zelf", "Uitgesteld", "Geen reactie", "Past niet bij GRØNN", "Anders"] as const

export type Stuk = {
  id: string
  soort: "Offerte" | "Factuur"
  nummer: string
  /** Bedrag incl. btw in euro's (oude vorm, uit DigiBoox overgenomen) */
  bedrag: number
  datum: string
  /** Factuur: betaald. Offerte: akkoord. */
  rond?: boolean
  /** Offerte met een privélink: de sleutel van /offerte/[token]. */
  link?: string
}

export type Foto = {
  id: string
  datum: string
  bijschrift: string
  moment: "Opname" | "Voor" | "Tijdens" | "Na"
  /** Zone-id in de tuin */
  zone?: string
  /** Beeld uit een video: de tijdcode, bijv. "0:12" */
  tijd?: string
  /** Al door Claude bekeken */
  bekeken?: boolean
}

/** Wat Claude op de foto's zag: een voorstel tot Nick het bevestigt of afwijst (intake.md §5). */
export type Bevinding = {
  id: string
  datum: string
  zone: string
  tekst: string
  zeker: "zichtbaar" | "vermoed"
  /** Foto-id's waarop het te zien is */
  bron: string[]
  /** Een vraag uit de vragenlijst met een voorgesteld antwoord */
  vraag?: string
  antwoord?: string
  /** Een maat die nog gemeten moet worden */
  meting?: string
  status: "voorstel" | "bevestigd" | "afgewezen"
}

export type Opname = { datum: string; antwoorden: Record<string, string>; diensten: string[]; /** Vraagteksten van toen */ vragen?: Record<string, string> }

/** Een tuin of perceel: blijft bestaan los van een klus, met de geschiedenis van de opname. */
export type Tuin = {
  id: string
  naam: string
  adres: string
  /** Antwoord per vraag-id uit de vragenlijst (src/lib/crm/vragenlijst.ts). */
  antwoorden: Record<string, string>
  /** De vraagtekst zoals hij was toen het antwoord gegeven werd. */
  vragen: Record<string, string>
  /** Eigen aantekening per vraag. */
  notities: Record<string, string>
  /** Vragen die als aandachtspunt gemarkeerd zijn. */
  aandacht: string[]
  diensten: string[]
  /** De soort intake die nu loopt. */
  soort: IntakeSoort
  zones: Zone[]
  /** Eerdere versies van de opname, nieuwste eerst. */
  geschiedenis: Opname[]
  fotos: Foto[]
  bevindingen: Bevinding[]
  aangemaakt: string
  bijgewerkt: string
}

export type Versie = {
  nr: number
  datum: string
  beschrijving: string
  uren: Milli
  uurtarief: Centen
  onvoorzien: Bp
  korting: Bp
  regels: Regel[]
  /** Werkplanning per fase (fase 5); ontbreekt bij oudere versies. */
  planning?: PlanFase[]
  /** Uren per fase, als de klus in delen gaat (Regel.groep is de fase van een regel). */
  fasen?: { naam: string; uren: Milli }[]
  /** Momentopname van de uitkomst, voor lijsten zonder opnieuw te rekenen. */
  totaal: Centen
  winst: Centen
}

export type Calculatie = { id: string; titel: string; tuinId?: string; versies: Versie[]; aangemaakt: string }

export type Gebeurtenis = {
  id: string
  datum: string
  wie: "Nick" | "Formulier" | "Grønn"
  soort: "Notitie" | "Gesprek" | "Bezoek" | "Fase" | "Stuk" | "Opname" | "Calculatie" | "Klant"
  tekst: string
}

export type Klant = {
  id: string
  naam: string
  soort: KlantSoort
  bedrijf: string
  wat: string
  plaats: string
  /** Vrij veld van vóór de splitsing in e-mail en telefoon; blijft zichtbaar zolang het gevuld is. */
  contact: string
  email: string
  telefoon: string
  voorkeur: (typeof VOORKEUREN)[number] | ""
  /** Factuuradres */
  adres: string
  bron: string
  tags: string[]
  fase: KlantFase
  volgende: string
  /** Datum van de volgende opvolging (JJJJ-MM-DD) */
  opvolgen: string
  prioriteit: (typeof PRIORITEITEN)[number]
  /** Geschatte waarde van de lead excl. btw, voordat er een calculatie is */
  waarde: Centen
  /** Kans op opdracht, 0–100 */
  kans: number
  verlorenReden: string
  notities: string
  stukken: Stuk[]
  tuinen: Tuin[]
  calculaties: Calculatie[]
  projecten: Project[]
  activiteit: Gebeurtenis[]
  aangemaakt: string
}

const tekst = (v: unknown, n = 4000) => (typeof v === "string" ? v.slice(0, n) : "")
const uitLijst = <T extends string>(lijst: readonly T[], v: unknown, standaard: T): T => (lijst.includes(v as T) ? (v as T) : standaard)
const geheel = (v: unknown, min: number, max: number) => (Number.isSafeInteger(v) ? Math.min(max, Math.max(min, v as number)) : 0)
const datumOf = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v : "")

const tekstMap = (v: unknown, n: number): Record<string, string> =>
  v && typeof v === "object" ? Object.fromEntries(Object.entries(v as Record<string, unknown>).filter(([, w]) => typeof w === "string" && w).map(([id, w]) => [id.slice(0, 64), (w as string).slice(0, n)])) : {}
const STANDAARD_VRAGEN = vraagMap(STANDAARD)
// Punten van de oude afvinklijst die geen vraag met hetzelfde id kregen. Een
// vinkje daarop blijft bewaard als antwoord "Ja" met de tekst van toen.
const OUDE_PUNTEN: Record<string, string> = {
  "hoe-gebruiken-ze-de-tuin-kinderen-hond-z": "Hoe gebruiken ze de tuin: kinderen, hond, zitten, eten, moestuin?",
  "welke-sfeer-willen-ze-laat-ze-2-of-3-voo": "Welke sfeer willen ze? Laat ze 2 of 3 voorbeelden aanwijzen.",
  "hoeveel-onderhoud-willen-ze-zelf-doen": "Hoeveel onderhoud willen ze zelf doen?",
  "wat-moet-blijven-staan-bomen-terras-schu": "Wat moet blijven staan: bomen, terras, schuur, planten?",
  "budget-welk-bedrag-hebben-ze-in-hun-hoof": "Budget: welk bedrag hebben ze in hun hoofd?",
  "wanneer-willen-ze-het-af-hebben-zijn-er": "Wanneer willen ze het af hebben? Zijn er data waarop het niet kan?",
  "alle-vlakken-in-m2-bestrating-gazon-bord": "Alle vlakken in m²: bestrating, gazon, borders, grind",
  "strekkende-meters-hekwerk-kantopsluiting": "Strekkende meters: hekwerk, kantopsluiting, keermuur",
  "hoogtes-keerhoogte-van-muren-boven-1-m-i": "Hoogtes: keerhoogte van muren (boven 1 m is een berekening nodig), hoogte van het hekwerk",
  "wat-voor-grond-klei-zand-loss-steek-een": "Wat voor grond: klei, zand, löss? Steek een schop in de grond.",
  "blijft-er-water-staan-na-regen": "Blijft er water staan na regen?",
  "waar-zitten-de-regenpijpen-en-de-put": "Waar zitten de regenpijpen en de put?",
  "bomen-in-de-buurt-waarvan-de-wortels-in": "Bomen in de buurt waarvan de wortels in de weg zitten",
  "hoe-breed-is-de-doorgang-naar-de-tuin-pa": "Hoe breed is de doorgang naar de tuin? Past er een minigraver of dumper door?",
  "parkeren-voor-de-bus": "Parkeren voor de bus",
  "planten-sfeer-kleuren-bloeitijd-en-wat-z": "Planten: sfeer, kleuren, bloeitijd, en wat ze absoluut niet willen",
  "hoe-ze-betalen-aanbetaling-of-reserverin": "Hoe ze betalen: aanbetaling of reservering, termijnen",
  "wie-ruimt-wat-op-voor-de-start-spullen-p": "Wie ruimt wat op voor de start: spullen, planten, meubels",
  "wie-geeft-er-water-na-de-oplevering": "Wie geeft er water na de oplevering?",
  "wanneer-stuur-je-de-offerte": "Wanneer stuur je de offerte?",
}

function normaliseerZone(z: Partial<Zone>): Zone {
  return {
    id: tekst(z.id, 64) || crypto.randomUUID(),
    naam: tekst(z.naam, 60) || "Zone",
    soort: uitLijst(ZONE_SOORTEN, z.soort, "Overig"),
    lengte: tekst(z.lengte, 12),
    breedte: tekst(z.breedte, 12),
    oppervlak: tekst(z.oppervlak, 12),
    diepte: tekst(z.diepte, 12),
    notitie: tekst(z.notitie, 1000),
  }
}

function normaliseerTuin(t: Partial<Tuin> & { checklist?: unknown }): Tuin {
  const antwoorden = tekstMap(t.antwoorden, 2000)
  const vragen = tekstMap(t.vragen, 200)
  // Afvinklijst van vóór de vragenlijst (PR #155): een vinkje wordt "Ja".
  if (Array.isArray(t.checklist))
    for (const id of t.checklist) {
      if (typeof id !== "string" || antwoorden[id]) continue
      const oud = STANDAARD_VRAGEN.get(id)?.tekst ?? OUDE_PUNTEN[id]
      if (!oud) continue
      antwoorden[id] = "Ja"
      vragen[id] = oud
    }
  return {
    id: tekst(t.id, 64) || crypto.randomUUID(),
    naam: tekst(t.naam, 80) || "Tuin",
    adres: tekst(t.adres, 200),
    antwoorden,
    vragen,
    notities: tekstMap(t.notities, 2000),
    aandacht: Array.isArray(t.aandacht) ? t.aandacht.filter((x) => typeof x === "string").slice(0, 300) : [],
    diensten: Array.isArray(t.diensten) ? t.diensten.map(String) : [],
    soort: uitLijst(INTAKE_SOORTEN, t.soort, "uitgebreid"),
    zones: (Array.isArray(t.zones) ? t.zones : []).slice(0, 30).map(normaliseerZone),
    geschiedenis: Array.isArray(t.geschiedenis) ? t.geschiedenis.slice(0, 50) : [],
    fotos: Array.isArray(t.fotos) ? t.fotos : [],
    bevindingen: Array.isArray(t.bevindingen) ? t.bevindingen.slice(0, 200) : [],
    aangemaakt: datumOf(t.aangemaakt) || "2026-10-29",
    bijgewerkt: datumOf(t.bijgewerkt) || datumOf(t.aangemaakt) || "2026-10-29",
  }
}

function normaliseerCalculatie(c: Partial<Calculatie>): Calculatie {
  return {
    id: tekst(c.id, 64) || crypto.randomUUID(),
    titel: tekst(c.titel, 120) || "Calculatie",
    tuinId: c.tuinId ? tekst(c.tuinId, 64) : undefined,
    aangemaakt: datumOf(c.aangemaakt) || "2026-10-29",
    versies: (Array.isArray(c.versies) ? c.versies : []).map((v) => ({
      ...v,
      regels: (v.regels ?? []).map((r) => schoonRegel(r as Regel & Record<string, unknown>)),
      ...(v.planning ? { planning: schoonPlan(v.planning) } : {}),
    })),
  }
}

/** Een klant uit opslag (elke versie) naar de huidige vorm. */
export function normaliseer(k: Partial<Klant> & Pick<Klant, "id" | "naam">): Klant {
  return {
    id: k.id,
    naam: tekst(k.naam, 80),
    soort: uitLijst(KLANT_SOORTEN, k.soort, "Particulier"),
    bedrijf: tekst(k.bedrijf, 120),
    wat: tekst(k.wat, 200),
    plaats: tekst(k.plaats, 60),
    contact: tekst(k.contact, 200),
    email: tekst(k.email, 160),
    telefoon: tekst(k.telefoon, 40),
    voorkeur: uitLijst(["", ...VOORKEUREN] as const, k.voorkeur, ""),
    adres: tekst(k.adres, 200),
    bron: tekst(k.bron, 40),
    tags: Array.isArray(k.tags) ? k.tags.map((t) => tekst(t, 30)).filter(Boolean).slice(0, 20) : [],
    fase: uitLijst(KLANT_FASEN, k.fase, "Aanvraag"),
    volgende: tekst(k.volgende, 300),
    opvolgen: datumOf(k.opvolgen),
    prioriteit: uitLijst(PRIORITEITEN, k.prioriteit, "Normaal"),
    waarde: geheel(k.waarde, 0, 1e11),
    kans: geheel(k.kans, 0, 100),
    verlorenReden: tekst(k.verlorenReden, 200),
    notities: tekst(k.notities, 8000),
    stukken: Array.isArray(k.stukken) ? k.stukken : [],
    tuinen: (Array.isArray(k.tuinen) ? k.tuinen : []).map(normaliseerTuin),
    // Oude calculaties zonder eigen titel krijgen er bij het lezen een uit klantnaam en tuin (30 okt 2026).
    calculaties: (Array.isArray(k.calculaties) ? k.calculaties : []).map(normaliseerCalculatie).map((c) =>
      c.titel === "Calculatie" ? { ...c, titel: calculatieTitel(tekst(k.naam, 120) || "Klant", (Array.isArray(k.tuinen) ? k.tuinen : []).find((t) => t?.id === c.tuinId)?.naam, c.versies.at(-1)?.beschrijving ?? "") } : c,
    ),
    projecten: (Array.isArray(k.projecten) ? k.projecten : []).map(normaliseerProject),
    activiteit: Array.isArray(k.activiteit) ? k.activiteit.slice(0, 500) : [],
    aangemaakt: datumOf(k.aangemaakt) || "2026-10-29",
  }
}

/** Gefactureerd, betaald en open in euro's; plus de laatste offerte. */
export function geld(k: Klant) {
  const facturen = k.stukken.filter((s) => s.soort === "Factuur")
  const gefactureerd = facturen.reduce((t, s) => t + s.bedrag, 0)
  const betaald = facturen.filter((s) => s.rond).reduce((t, s) => t + s.bedrag, 0)
  const offertes = k.stukken.filter((s) => s.soort === "Offerte")
  const offerte = offertes.at(-1)?.bedrag
  // Wat de klant heeft goedgekeurd; nog niet gefactureerd is het verschil met wat al op een factuur staat.
  const akkoord = offertes.filter((s) => s.rond).reduce((t, s) => t + s.bedrag, 0)
  const rond = (n: number) => Math.round(n * 100) / 100
  return { akkoord, teFactureren: rond(Math.max(0, akkoord - gefactureerd)), gefactureerd, betaald, open: rond(gefactureerd - betaald), offerte }
}

/** De meest recente calculatieversie van een klant, als die er is. */
export function laatsteCalculatie(k: Klant) {
  let beste: { c: Calculatie; v: Versie } | undefined
  for (const c of k.calculaties) {
    const v = c.versies.at(-1)
    if (v && (!beste || v.datum > beste.v.datum)) beste = { c, v }
  }
  return beste
}

/** Gewogen waarde in de pijplijn: calculatie (of geschatte waarde) × kans. */
export function gewogen(k: Klant): Centen {
  const basis = laatsteCalculatie(k)?.v.totaal ?? k.waarde
  return Math.round((basis * (k.kans || 0)) / 100)
}

/** Hoort een regel uit de urenregistratie bij deze klant? Op een woord uit de naam. */
export function hoortBij(k: Klant, klantVeld: string) {
  const veld = klantVeld.toLowerCase()
  return k.naam
    .toLowerCase()
    .split(/[^a-zà-ÿ]+/)
    .some((w) => w.length > 3 && veld.includes(w))
}

const alleenCijfers = (s: string) => s.replace(/\D/g, "").replace(/^31/, "0").replace(/^0031/, "0")

/**
 * Bestaat deze persoon al? Zelfde e-mail, zelfde telefoonnummer (laatste
 * negen cijfers) of exact dezelfde naam. Voor het omzetten van een aanvraag.
 */
export function zoekDubbel(klanten: Klant[], kandidaat: { naam?: string; email?: string; telefoon?: string; contact?: string }) {
  const mail = (kandidaat.email || (kandidaat.contact?.includes("@") ? kandidaat.contact : "") || "").trim().toLowerCase()
  const tel = alleenCijfers(kandidaat.telefoon || (!kandidaat.contact?.includes("@") ? kandidaat.contact ?? "" : "")).slice(-9)
  const naam = (kandidaat.naam ?? "").trim().toLowerCase()
  return klanten.filter((k) => {
    const kMail = (k.email || (k.contact.includes("@") ? k.contact.match(/\S+@\S+/)?.[0] ?? "" : "")).toLowerCase()
    const kTel = alleenCijfers(k.telefoon || k.contact).slice(-9)
    return (mail && kMail === mail) || (tel.length === 9 && kTel === tel) || (naam && k.naam.trim().toLowerCase() === naam)
  })
}

/**
 * Korte vingerafdruk van opgeslagen gegevens, als `key` op een formulier: na
 * bewaren zet React een formulier terug naar zijn beginwaarden, en een select
 * houdt dan de waarde van vóór het bewaren. Een nieuwe key bouwt het formulier
 * opnieuw op met wat er echt bewaard is.
 */
export function sleutel(waarde: unknown) {
  const s = JSON.stringify(waarde)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

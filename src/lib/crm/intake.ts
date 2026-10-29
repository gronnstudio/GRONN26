import { deel, leesMilli } from "./geld"

// De tuinopname (masterprompt CRM, module 04): één vaste vragenlijst voor
// intake en locatiebezoek, zodat elke tuin op dezelfde manier vastligt en de
// maten rechtstreeks in een calculatie kunnen. De antwoorden staan per tuin
// als { veld-id: tekst }; een nieuw veld toevoegen kan hier zonder omzetten.

export type Veld = {
  id: string
  label: string
  soort: "tekst" | "getal" | "keuze" | "lang" | "datum"
  opties?: readonly string[]
  /** Eenheid achter een getal */
  eenheid?: string
  hulp?: string
}

export type Groep = { id: string; naam: string; velden: Veld[] }

export const INTAKE: Groep[] = [
  {
    id: "wens",
    naam: "Wens en kader",
    velden: [
      { id: "woning", label: "Soort woning", soort: "keuze", opties: ["Rijtjeshuis", "Hoekwoning", "Twee-onder-een-kap", "Vrijstaand", "Appartement", "Bedrijfspand", "Anders"] },
      { id: "situatie", label: "Nieuwbouw of bestaand", soort: "keuze", opties: ["Nieuwbouw", "Bestaande tuin omvormen", "Onderhoud"] },
      { id: "start", label: "Gewenste start", soort: "tekst", hulp: "bijv. maart 2027" },
      { id: "budget", label: "Budget", soort: "keuze", opties: ["Onder € 2.500", "€ 2.500–5.000", "€ 5.000–10.000", "€ 10.000–20.000", "Boven € 20.000", "Nog geen idee"] },
      { id: "doelen", label: "Wat moet de tuin worden?", soort: "lang", hulp: "In de woorden van de klant" },
    ],
  },
  {
    id: "maten",
    naam: "Maten",
    velden: [
      { id: "lengte", label: "Lengte", soort: "getal", eenheid: "m" },
      { id: "breedte", label: "Breedte", soort: "getal", eenheid: "m" },
      { id: "oppervlak", label: "Oppervlak totaal", soort: "getal", eenheid: "m²" },
      { id: "verhard", label: "Bestaande bestrating", soort: "getal", eenheid: "m²" },
      { id: "gazon", label: "Bestaand gazon", soort: "getal", eenheid: "m²" },
      { id: "beplant", label: "Bestaande beplanting", soort: "getal", eenheid: "m²" },
      { id: "hoogteverschil", label: "Hoogteverschil", soort: "getal", eenheid: "m" },
      { id: "metingen", label: "Overige maten", soort: "lang", hulp: "Muren, deuren, putten, bomen, afstanden" },
    ],
  },
  {
    id: "plek",
    naam: "Grond, licht en water",
    velden: [
      { id: "ligging", label: "Ligging tuin", soort: "keuze", opties: ["Noord", "Noordoost", "Oost", "Zuidoost", "Zuid", "Zuidwest", "West", "Noordwest"] },
      { id: "zon", label: "Zon", soort: "keuze", opties: ["Volle zon", "Halfschaduw", "Schaduw", "Wisselend"] },
      { id: "grond", label: "Grondsoort", soort: "keuze", opties: ["Zand", "Leem / löss", "Klei", "Veen", "Puin of ophoging", "Onbekend"] },
      { id: "afwatering", label: "Afwatering", soort: "keuze", opties: ["Goed", "Plassen na regen", "Staat lang nat", "Onbekend"] },
      { id: "water", label: "Water in de tuin", soort: "keuze", opties: ["Buitenkraan", "Geen kraan", "Regenton", "Vijver aanwezig"] },
      { id: "plekNotities", label: "Wat viel op", soort: "lang" },
    ],
  },
  {
    id: "uitvoering",
    naam: "Uitvoering",
    velden: [
      { id: "toegang", label: "Toegang", soort: "keuze", opties: ["Minigraver past (≥ 1 m)", "Alleen kruiwagen", "Door het huis", "Via buren of achterpad"] },
      { id: "toegangBreedte", label: "Smalste doorgang", soort: "getal", eenheid: "m" },
      { id: "leidingen", label: "Kabels en leidingen", soort: "keuze", opties: ["KLIC-melding nodig", "Bekend, ingetekend", "Geen graafwerk"] },
      { id: "afvoer", label: "Grond en puin afvoeren", soort: "keuze", opties: ["Container op straat", "Container op oprit", "Kan blijven liggen", "Niet nodig"] },
      { id: "parkeren", label: "Parkeren en laden", soort: "tekst" },
    ],
  },
  {
    id: "afspraken",
    naam: "Afspraken",
    velden: [
      { id: "eisen", label: "Eisen van de klant", soort: "lang" },
      { id: "risicos", label: "Risico's", soort: "lang", hulp: "Wortels, oude fundering, hoogteverschil, buren" },
      { id: "aannames", label: "Aannames voor de prijs", soort: "lang", hulp: "Komen als uitgangspunten op de offerte" },
    ],
  },
]

export const DIENSTEN = [
  "Tuinontwerp",
  "Complete aanleg",
  "Bestrating",
  "Beplanting",
  "Gazon",
  "Grondverbetering",
  "Drainage",
  "Beregening",
  "Tuinverlichting",
  "Erfafscheiding",
  "Pergola of overkapping",
  "Vijver of waterelement",
  "Onderhoud",
  "Anders",
] as const

export const ALLE_VELDEN = INTAKE.flatMap((g) => g.velden)

/** Opname uit een formulier: alleen bekende velden, ingekort. */
export function leesOpname(d: FormData) {
  const antwoorden: Record<string, string> = {}
  for (const v of ALLE_VELDEN) {
    const waarde = String(d.get(`i_${v.id}`) ?? "").trim().slice(0, v.soort === "lang" ? 2000 : 120)
    if (!waarde) continue
    if (v.opties && !v.opties.includes(waarde)) continue
    antwoorden[v.id] = waarde
  }
  const diensten = d.getAll("dienst").map(String).filter((x) => (DIENSTEN as readonly string[]).includes(x))
  return { antwoorden, diensten }
}

/** Hoeveel van de opname is ingevuld, als telling (geen percentage dat meer belooft dan het is). */
export const ingevuld = (a: Record<string, string>) => ({ gevuld: ALLE_VELDEN.filter((v) => a[v.id]).length, van: ALLE_VELDEN.length })

/** Het oppervlak uit de opname in duizendsten m²: ingevuld, of lengte × breedte. */
export function oppervlakUit(a: Record<string, string>): number | null {
  const opp = a.oppervlak ? leesMilli(a.oppervlak) : null
  if (opp && opp > 0) return opp
  const l = a.lengte ? leesMilli(a.lengte) : null
  const b = a.breedte ? leesMilli(a.breedte) : null
  return l && b && l > 0 && b > 0 ? deel(l * b, 1000) : null
}

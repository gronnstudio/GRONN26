import { nieuweRegel, type Regel, type Soort } from "./calculatie"
import type { Item } from "./catalogus"
import { deel, leesMilli, type Milli } from "./geld"
import * as h from "./rekenhulpen"
import { zoneOppervlak, type Zone } from "./vragenlijst"

// De meetstaat (docs/architecture/intake.md §3, fase 4): uit de maten van de
// zones rekent de code de hoeveelheden uit, met de formule erbij. Claude
// rekent hier niets. De laagdiktes zijn de gangbare maten. Ze staan in elke
// formule, zodat Nick ziet wat er is aangenomen, en hij past de hoeveelheid
// in de calculatie aan als het anders moet. Met "Zet in calculatie" komt dit
// als regels in een nieuwe versie; een oude versie verandert nooit mee.

export type MeetRegel = {
  zone: string
  zoneId: string
  wat: string
  soort: Soort
  hoeveelheid: Milli
  eenheid: string
  formule: string
  /** Woord waarop een catalogusartikel gezocht wordt */
  zoek: string
}

export type ZoneMeting = { zone: string; regels: MeetRegel[]; mist?: string }

const AFGRAVEN_MM: Partial<Record<Zone["soort"], number>> = { Terras: 300, Pad: 250, Oprit: 400 }
const FUNDERING_MM: Partial<Record<Zone["soort"], number>> = { Terras: 200, Pad: 150, Oprit: 300 }

const cm = (t: string) => {
  const m = leesMilli(t)
  return m && m > 0 ? Math.round(m / 100) : null // leesMilli geeft duizendsten cm; ÷ 100 = mm
}

/** Alle meetregels per zone. Zones zonder maat zeggen wat er mist. */
export function meetstaat(zones: Zone[]): ZoneMeting[] {
  return zones.map((z) => {
    const opp = zoneOppervlak(z)
    const r = (wat: string, soort: Soort, uit: h.Hoeveelheid, zoek: string): MeetRegel => ({ zone: z.naam, zoneId: z.id, wat, soort, zoek, ...uit })
    if (!opp) return { zone: z.naam, regels: [], mist: "Vul oppervlak of lengte × breedte in." }
    const lg = leesMilli(z.lengte) ?? 0
    const br = leesMilli(z.breedte) ?? 0
    const regels: MeetRegel[] = []
    switch (z.soort) {
      case "Terras":
      case "Pad":
      case "Oprit": {
        const diep = cm(z.diepte) ?? AFGRAVEN_MM[z.soort]!
        regels.push(r("Afgraven", "afvoer", h.afgraven(opp, diep), "grond afvoer"))
        regels.push(r("Fundering korrelmix", "materiaal", h.mulch(opp, FUNDERING_MM[z.soort]!), "korrelmix"))
        regels.push(r("Straatzand (straatlaag)", "materiaal", h.mulch(opp, 40), "straatzand"))
        regels.push(r("Bestrating", "materiaal", h.bestrating(opp, 500), "klinker"))
        if (lg > 0 && br > 0) {
          const omtrek = 2 * (lg + br)
          regels.push(r("Opsluitband", "materiaal", { hoeveelheid: omtrek, eenheid: "m", formule: `2 × (${lg / 1000} + ${br / 1000} m) = ${omtrek / 1000} m omtrek` }, "opsluitband"))
        }
        break
      }
      case "Gazon":
        regels.push(r("Teelaarde", "materiaal", h.grond(opp, 100, 1500), "teelaarde"))
        regels.push(r("Graszoden", "planten", h.gazon(opp, 500), "graszoden"))
        break
      case "Border":
        regels.push(r("Compost", "materiaal", h.mulch(opp, 50), "compost"))
        regels.push(r("Planten", "planten", h.planten(opp, 5000), "plant"))
        regels.push(r("Mulch", "materiaal", h.mulch(opp, 50), "mulch"))
        break
      case "Vijver": {
        const d = leesMilli(z.diepte) ?? 0 // m
        if (!d) return { zone: z.naam, regels: [], mist: "Vul de diepte van de vijver in (m)." }
        regels.push(r("Uitgraven", "afvoer", h.afgraven(opp, d), "grond afvoer"))
        if (lg > 0 && br > 0) {
          // Folie: lengte en breedte plus twee keer de diepte plus 0,5 m rand aan elke kant.
          const fl = lg + 2 * d + 1000
          const fb = br + 2 * d + 1000
          const m2 = deel(fl * fb, 1000)
          regels.push(r("Vijverfolie", "materiaal", { hoeveelheid: m2, eenheid: "m²", formule: `(${lg / 1000} + 2 × ${d / 1000} + 1) × (${br / 1000} + 2 × ${d / 1000} + 1) m = ${(m2 / 1000).toLocaleString("nl-NL")} m²` }, "vijverfolie"))
        } else regels.push({ zone: z.naam, zoneId: z.id, wat: "Vijverfolie", soort: "materiaal", hoeveelheid: 0, eenheid: "m²", formule: "Vul lengte en breedte in voor de folie.", zoek: "vijverfolie" })
        break
      }
      default:
        return { zone: z.naam, regels: [], mist: z.soort === "Overig" ? undefined : "Voor deze soort zone is er nog geen meetstaat." }
    }
    return { zone: z.naam, regels }
  })
}

const plat = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

/**
 * Een meetregel als calculatieregel. Een catalogusartikel met het zoekwoord
 * in de naam levert de prijs. Staat dat artikel in big bags (BB), dan wordt
 * 1 BB als 1 m³ gerekend, op halve BB naar boven, en dat staat in de omschrijving.
 */
export function naarRegel(m: MeetRegel, catalogus: Item[]): Regel {
  const item = catalogus.find((i) => plat(i.naam).includes(m.zoek) && (i.eenheid === m.eenheid || (i.eenheid === "BB" && m.eenheid === "m³")))
  const basis = { omschrijving: `${m.wat} · ${m.zone}`, eenheid: m.eenheid, hoeveelheid: m.hoeveelheid, groep: m.zone, meetstaat: m.zoneId }
  if (!item) return nieuweRegel(m.soort, basis)
  const bb = item.eenheid === "BB" && m.eenheid === "m³"
  return nieuweRegel(item.soort, {
    ...basis,
    omschrijving: `${item.naam} · ${m.zone}${bb ? " (1 BB = 1 m³)" : ""}`,
    eenheid: item.eenheid,
    hoeveelheid: bb ? h.bestelBoven(m.hoeveelheid, 500) : m.hoeveelheid,
    inkoop: item.inkoop,
    opslag: item.opslag,
    btw: item.btw,
    // Het verlies zit al in de meetstaathoeveelheid; niet nog eens het afval van het artikel.
    afval: 0,
    catalogusId: item.id,
  })
}

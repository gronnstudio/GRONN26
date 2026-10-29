import "server-only"
import { leesJson, opslagAan, wijzigJson } from "@/lib/crm/opslag"
import { geld, isOpen, laatsteCalculatie, normaliseer, type Gebeurtenis, type Klant, type KlantFase } from "@/lib/crm/klant"
import type { Fase, Project } from "./data"

// Klanten en hun klussen: één kaart per klant en een pijplijn van aanvraag tot
// opgeleverd (eigenaar, 29 okt 2026: "bouw dashboard helemaal uit als een
// crm/boekhouding soort van", gekozen: "Klantkaart + pijplijn"). Eén JSON-bestand
// in de privé Blob-store, naast dashboard/stand.json. Het model staat in
// src/lib/crm/klant.ts; dit bestand leest en schrijft. De boekhouding zelf
// (factuurnummers, bewaarplicht, btw-aangifte) blijft in DigiBoox.

export * from "@/lib/crm/klant"
export { opslagAan }

const PAD = "dashboard/klanten.json"

const leeg = (k: Partial<Klant> & Pick<Klant, "id" | "naam">): Klant => normaliseer({ aangemaakt: "2026-10-29", ...k })

// De klanten van vóór de klantkaart, uit de verstuurde offertes en facturen
// (29 okt 2026). Contactgegevens en adressen vult Nick zelf in: die horen niet
// in de code.
const START: Klant[] = [
  leeg({
    id: "clannad-stijn",
    naam: "Clannad & Stijn",
    wat: "Achtertuin: keermuur, pad in waaltjes, hekwerk, gazon, borders",
    plaats: "Stein",
    fase: "Akkoord",
    volgende: "Aanbetaling binnen vóór 4 november; uitvoering maart/april 2027.",
    stukken: [
      { id: "c1", soort: "Offerte", nummer: "GR-O // 202610160001", bedrag: 12321.5, datum: "2026-10-16", rond: true },
      { id: "c2", soort: "Factuur", nummer: "GR-F // 2026-1021-0001", bedrag: 1000, datum: "2026-10-21" },
    ],
  }),
  leeg({
    id: "hairdiel",
    naam: "HairDiel (Diliana Timmermans)",
    wat: "Parkeervak in klinkers, grondkering en grassenborder",
    plaats: "Beek",
    fase: "Gepland",
    volgende: "Stenen bestellen bij Steenrijk; bestraten in november. Factuur GR-F // 2026-1021-03 crediteren.",
    stukken: [
      { id: "h1", soort: "Factuur", nummer: "GR-F // 2026-1021-03", bedrag: 605, datum: "2026-10-21" },
      { id: "h2", soort: "Factuur", nummer: "GR-F // 2026-1025-03", bedrag: 650, datum: "2026-10-25" },
    ],
  }),
  leeg({
    id: "stephanie",
    naam: "Stephanie",
    wat: "Tuin gelijktrekken en 100 m² graszoden",
    fase: "Uitvoering",
    volgende: "Deel 2 graszoden; controleer of GR-F // 2026-1011-03 niet dubbel is met 1011-02.",
    stukken: [
      { id: "s1", soort: "Factuur", nummer: "GR-F // 2026-0930-0011", bedrag: 325, datum: "2026-09-30" },
      { id: "s2", soort: "Factuur", nummer: "GR-F // 2026-1011-02", bedrag: 800, datum: "2026-10-11" },
      { id: "s3", soort: "Factuur", nummer: "GR-F // 2026-1011-03", bedrag: 400, datum: "2026-11-22" },
    ],
  }),
  leeg({
    id: "doornbos",
    naam: "Doornbos",
    wat: "Vijverrenovatie (twee vijvers, één systeem) en elektra",
    fase: "Opgeleverd",
    volgende: "Verdere aanplant voorjaar 2027, cadeau.",
    stukken: [
      { id: "d1", soort: "Factuur", nummer: "Fase 1 t/m 4", bedrag: 4318.65, datum: "2026-08-11", rond: true },
      { id: "d2", soort: "Factuur", nummer: "GR-F // 2026-0923-0009", bedrag: 485, datum: "2026-09-23", rond: true },
      { id: "d3", soort: "Factuur", nummer: "GR-F // 2026-1006-0001", bedrag: 320, datum: "2026-10-06" },
    ],
  }),
  leeg({
    id: "noah-goffin",
    naam: "Noah Goffin",
    wat: "6 opbouwstopcontacten",
    fase: "Offerte",
    volgende: "Akkoord afwachten.",
    stukken: [{ id: "n1", soort: "Offerte", nummer: "GR-O // 2026-1006-02", bedrag: 331.28, datum: "2026-10-06" }],
  }),
  leeg({
    id: "vaessen",
    naam: "Vaessen",
    wat: "Tuinadvies",
    fase: "Opgeleverd",
    stukken: [{ id: "v1", soort: "Factuur", nummer: "2026-0003", bedrag: 60, datum: "2026-08-01", rond: true }],
  }),
]

export async function leesKlanten(): Promise<Klant[]> {
  const ruw = await leesJson<Klant[]>(PAD, () => START)
  return ruw.map((k) => normaliseer(k))
}

/** Lees, pas aan en schrijf terug in één keer (zie wijzigJson). */
export async function wijzigKlanten(f: (k: Klant[]) => Klant[]) {
  return wijzigJson<Klant[]>(PAD, () => START, (ruw) => f(ruw.map((k) => normaliseer(k))))
}

/** Een regel voor de tijdlijn van een klant. */
export const gebeurtenis = (soort: Gebeurtenis["soort"], tekst: string, wie: Gebeurtenis["wie"] = "Nick"): Gebeurtenis => ({
  id: crypto.randomUUID(),
  datum: new Date().toISOString(),
  wie,
  soort,
  tekst: tekst.slice(0, 1000),
})

// De ring en "Volgende stap" op het dashboard rekenen sinds de CRM-bouw met de
// echte klanten in plaats van de vaste lijst in data.ts. Vijf sectoren op de
// ring, dus de acht fasen van de klantkaart vallen samen.
const RING: Record<KlantFase, Fase | null> = {
  Aanvraag: "Aanvraag",
  Opname: "Aanvraag",
  Offerte: "Offerte",
  Akkoord: "Gepland",
  Gepland: "Gepland",
  Uitvoering: "Uitvoering",
  Opgeleverd: "Opgeleverd",
  Verloren: null,
}

export function alsProjecten(klanten: Klant[]): Project[] {
  const nu = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
  return klanten.flatMap((k) => {
    const fase = RING[k.fase]
    if (!fase) return []
    const g = geld(k)
    const c = laatsteCalculatie(k)
    return [
      {
        naam: k.naam,
        wat: k.wat,
        plaats: k.plaats,
        fase,
        bedrag: g.offerte ?? (c ? c.v.totaal / 100 : undefined),
        volgende: k.volgende || (isOpen(k.fase) ? "Geen volgende stap ingevuld." : "Klaar."),
        aandacht: isOpen(k.fase) && ((!!k.opvolgen && k.opvolgen <= nu) || g.open > 0),
        href: `/dashboard/klanten/${k.id}`,
      },
    ]
  })
}

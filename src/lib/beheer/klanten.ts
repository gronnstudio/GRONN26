import { get, put } from "@vercel/blob"

// Klanten en hun klussen: één kaart per klant en een pijplijn van aanvraag tot
// opgeleverd (eigenaar, 29 okt 2026: "bouw dashboard helemaal uit als een
// crm/boekhouding soort van", gekozen: "Klantkaart + pijplijn"). Eén JSON-bestand
// in de privé Blob-store, naast dashboard/stand.json. De boekhouding zelf
// (factuurnummers, bewaarplicht, btw-aangifte) blijft in DigiBoox; hier staat
// alleen wat Nick nodig heeft om het overzicht te houden.

export const KLANT_FASEN = ["Aanvraag", "Opname", "Offerte", "Akkoord", "Gepland", "Uitvoering", "Opgeleverd"] as const
export type KlantFase = (typeof KLANT_FASEN)[number]

export type Stuk = {
  id: string
  soort: "Offerte" | "Factuur"
  nummer: string
  /** Bedrag incl. btw */
  bedrag: number
  datum: string
  /** Factuur: betaald. Offerte: akkoord. */
  rond?: boolean
}

export type Klant = {
  id: string
  naam: string
  wat: string
  plaats: string
  contact: string
  adres: string
  fase: KlantFase
  volgende: string
  notities: string
  stukken: Stuk[]
  aangemaakt: string
}

const PAD = "dashboard/klanten.json"

export const opslagAan = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const leeg = (k: Partial<Klant> & Pick<Klant, "id" | "naam">): Klant => ({
  wat: "",
  plaats: "",
  contact: "",
  adres: "",
  fase: "Aanvraag",
  volgende: "",
  notities: "",
  stukken: [],
  aangemaakt: "2026-10-29",
  ...k,
})

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
  if (!opslagAan()) return START
  try {
    const r = await get(PAD, { access: "private", useCache: false })
    if (!r?.stream) return START
    return ((await new Response(r.stream).json()) as Klant[]).map((k) => leeg(k))
  } catch {
    return START
  }
}

export async function schrijfKlanten(k: Klant[]) {
  await put(PAD, JSON.stringify(k), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json" })
}

/** Wat er op de kaart en in de kolom bovenaan staat: gefactureerd, betaald, open. */
export function geld(k: Klant) {
  const facturen = k.stukken.filter((s) => s.soort === "Factuur")
  const gefactureerd = facturen.reduce((t, s) => t + s.bedrag, 0)
  const betaald = facturen.filter((s) => s.rond).reduce((t, s) => t + s.bedrag, 0)
  const offerte = k.stukken.filter((s) => s.soort === "Offerte").at(-1)?.bedrag
  return { gefactureerd, betaald, open: gefactureerd - betaald, offerte }
}

/** Hoort een regel uit de urenregistratie bij deze klant? Op een woord uit de naam. */
export function hoortBij(k: Klant, klantVeld: string) {
  const veld = klantVeld.toLowerCase()
  return k.naam
    .toLowerCase()
    .split(/[^a-zà-ÿ]+/)
    .some((w) => w.length > 3 && veld.includes(w))
}

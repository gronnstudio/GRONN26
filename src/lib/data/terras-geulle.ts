import type { L } from "@/lib/i18n"

import type { Project } from "./projects"
import type { Foto } from "./vijverrenovatie"

// Het tweede echte project: een terras van 24 m² betontegels in Geulle.
//
// Alles hieronder komt van Nick (24 sep 2026) en uit zijn eigen
// Instagrambericht van 12 augustus 2026 — niets is aangevuld of geschat:
// - de vraag kwam op een kinderfeestje; stratenmakers waren te duur of pas
//   de volgende zomer beschikbaar;
// - de klant had de materialen al; Nick deed het werk;
// - 24 m² betontegels 60 × 60 × 4 cm; het leggen zelf circa 8 uur, het
//   hele werk twee dagen;
// - de werkzaamheden en de zin over het water staan letterlijk in dat
//   bericht (de zin was Engels, hier in Nicks eigen woorden vertaald).
// Plaats: Geulle, Limburg (Nick, 24 sep 2026). Toestemming van de klant
// voor de foto's: ja (Nick, 24 sep 2026). De foto's zijn van 11 en 12
// augustus 2026, verkleind en ZONDER metadata; er staan geen kinderen op.

export const TERRAS_SLUG = "terras-geulle-24-m2-betontegels"

/** ISO-datum waarop de projectpagina live ging. */
export const TERRAS_GEPUBLICEERD = "2026-09-24"

export const TERRAS = {
  titel: "Een terras van 24\u00a0m², gelegd in twee dagen.",
  seoTitel: "Terras van 24 m² betontegels in Geulle — GRØNN Studio",
  omschrijving:
    "24 m² betontegels van 60 × 60 × 4 cm in Geulle, gelegd in twee dagen. Van ontgraven en verdichten tot afschot richting het gras: de voorbereiding bepaalt het resultaat.",
  categorie: "Terrasaanleg",
  auteur: "Nick Peters, GRØNN Studio",
  status: "Afgerond",
  plaats: "Geulle, Limburg",
  wanneer: "Augustus 2026",
  kaarttekst:
    "Stratenmakers waren te duur of pas volgend jaar beschikbaar. De materialen lagen er al; in twee dagen lag er een strak terras van 24\u00a0m².",
  ondertitel: "Van ruwe ondergrond naar een strak terras, met het water de goede kant op.",
  intro: [
    "De vraag kwam op een kinderfeestje. Iemand vroeg naar mijn werk en vertelde over een terras dat er maar niet kwam: stratenmakers waren te duur, of pas de volgende zomer beschikbaar. De materialen lagen er al. Wat ontbrak, was iemand die het deed.",
    "Het werden 24\u00a0m² betontegels van 60 × 60 × 4 cm. Geen tegels erin en klaar: de voorbereiding bepaalt uiteindelijk het resultaat. Het leggen zelf kostte ongeveer 8 uur; met het grondwerk erbij waren het twee dagen.",
  ],
  contactknop: "Bespreek jouw terras",
  en: {
    titel: "A 24\u00a0m² patio, laid in two days.",
    categorie: "Patio construction",
    status: "Completed",
    plaats: "Geulle, Limburg",
    wanneer: "August 2026",
    kaarttekst:
      "Paviours were too expensive or not available until next year. The materials were already there; in two days there was a neat 24\u00a0m² patio.",
    ondertitel: "From rough ground to a neat patio, with the water running the right way.",
    intro: [
      "The question came up at a children's birthday party. Someone asked about my work and told me about a patio that just never happened: paviours were too expensive, or not available until the following summer. The materials were already there. What was missing was someone to do it.",
      "It became 24\u00a0m² of concrete tiles of 60 × 60 × 4 cm. Not just tiles in and done: in the end, the preparation determines the result. The laying itself took about 8 hours; with the groundwork included, it was two days.",
    ],
    contactknop: "Discuss your patio",
  },
} as const

export const TERRAS_UITGELICHT: { waarde: string; eenheid: L; label: L }[] = [
  { waarde: "24", eenheid: { nl: "m²", en: "m²" }, label: { nl: "betontegels", en: "concrete tiles" } },
  { waarde: "60", eenheid: { nl: "cm", en: "cm" }, label: { nl: "tegels van 60 × 60 × 4", en: "tiles of 60 × 60 × 4" } },
  { waarde: "8", eenheid: { nl: "uur", en: "hours" }, label: { nl: "leggen, circa", en: "laying, approx." } },
  { waarde: "2", eenheid: { nl: "", en: "" }, label: { nl: "dagen, alles samen", en: "days, all in all" } },
]

export const TERRAS_CIJFERS: [L, L][] = [
  [{ nl: "Oppervlak", en: "Area" }, { nl: "24 m²", en: "24 m²" }],
  [{ nl: "Tegels", en: "Tiles" }, { nl: "Betontegels 60 × 60 × 4 cm", en: "Concrete tiles 60 × 60 × 4 cm" }],
  [{ nl: "Tijd", en: "Time" }, { nl: "Circa 8 uur leggen; twee dagen in totaal", en: "About 8 hours of laying; two days in total" }],
  [{ nl: "Materialen", en: "Materials" }, { nl: "Aangeleverd door de klant", en: "Supplied by the client" }],
  [{ nl: "Afschot", en: "Fall" }, { nl: "Richting het gras", en: "Towards the lawn" }],
  [{ nl: "Plaats", en: "Location" }, { nl: "Geulle, Limburg", en: "Geulle, Limburg" }],
]

/** De werkzaamheden, in de volgorde van Nicks eigen bericht. */
export const TERRAS_STAPPEN: L[] = [
  { nl: "Ondergrond ontgraven en voorbereiden", en: "Excavating and preparing the ground" },
  { nl: "Ondergrond ophogen en verdichten", en: "Raising and compacting the ground" },
  { nl: "Zandbed aanbrengen en afrijen", en: "Laying and screeding the sand bed" },
  { nl: "Banden stellen en uitlijnen", en: "Setting and aligning the edging" },
  { nl: "Zandbed aantrillen en opnieuw controleren", en: "Compacting the sand bed and checking it again" },
  { nl: "24 m² betontegels leggen", en: "Laying 24 m² of concrete tiles" },
  { nl: "Alles zorgvuldig op afschot richting het gras", en: "Everything carefully laid to fall towards the lawn" },
  { nl: "Afwerken en het geheel controleren", en: "Finishing and checking the whole" },
]

/**
 * De fasen voor de FaseBalk: de acht stappen hierboven in vier groepen,
 * niets erbij — Grondwerk (1–2), Zandbed en banden (3–5), Tegels (6–7:
 * leggen en op afschot), Afwerking (8). Het project is afgerond, dus de
 * balk staat helemaal vol (`klaar`).
 */
export const TERRAS_FASEN: { label: L }[] = [
  { label: { nl: "Grondwerk", en: "Groundwork" } },
  { label: { nl: "Zandbed en banden", en: "Sand bed and edging" } },
  { label: { nl: "Tegels", en: "Paving" } },
  { label: { nl: "Afwerking", en: "Finishing" } },
]

const MAP = "/projecten/terras-geulle"

/** Geschreven NA het bekijken van elke foto: wat zichtbaar is. */
export const TERRAS_FOTOS = {
  hoofd: { src: `${MAP}/T01.jpg`, width: 1000, height: 1333, alt: "Het nieuwe terras van lichte betontegels onder de overkapping, met de opsluitband langs de rand van het zandbed.", fase: "uitvoering", en: { alt: "The new patio of light concrete tiles under the canopy, with the edging along the side of the sand bed." } },
  reeks: [
    { src: `${MAP}/T02.jpg`, width: 1000, height: 1333, alt: "Het smalle pad van betontegels langs de gevel en de schutting, strak uitgelijnd tot achter in de tuin.", fase: "uitvoering", en: { alt: "The narrow path of concrete tiles along the wall and the fence, neatly aligned to the back of the garden." } },
    { src: `${MAP}/T04.jpg`, width: 1000, height: 1333, alt: "Het tegelpad vanaf de andere kant, doorlopend tot aan de achterdeur onder de overkapping.", fase: "uitvoering", en: { alt: "The tiled path from the other side, running up to the back door under the canopy." } },
  ],
  slot: { src: `${MAP}/T03.jpg`, width: 1000, height: 1333, alt: "Nick staat op het nieuwe tegelpad, handen in de zij, met een schop en een waterpas bij de hand.", bijschrift: "Klaar, na twee dagen.", fase: "uitvoering", en: { alt: "Nick stands on the new tiled path, hands on his hips, with a spade and a spirit level at hand.", bijschrift: "Done, after two days." } },
} satisfies { hoofd: Foto; reeks: Foto[]; slot: Foto }

export const TERRAS_CITAAT: { tekst: L; bron: string } = {
  tekst: {
    nl: "Een goed terras ziet er niet alleen waterpas uit. Het weet ook waar het water heen moet.",
    en: "A good patio doesn't just look level. It also knows where the water has to go.",
  },
  bron: "Nick Peters, GRØNN Studio",
}

export const TERRAS_SLOT: { kop: L; alineas: L[] } = {
  kop: { nl: "De basis bepaalt het resultaat", en: "The foundation determines the result" },
  alineas: [
    {
      nl: "Een terras of pad dat al te lang op een vakman wacht? Vertel wat er ligt en wat je wilt; dan kijk ik of en wanneer het past.",
      en: "A patio or path that has been waiting for a professional for too long? Tell me what's there and what you want; then I'll see whether and when it fits.",
    },
  ],
}

/** Zelfde vorm als VIJVER_ALS_PROJECT: voor de menu's en de zoekfunctie. */
export const TERRAS_ALS_PROJECT: Project = {
  slug: TERRAS_SLUG,
  title: { nl: TERRAS.titel, en: TERRAS.en.titel },
  location: TERRAS.plaats,
  category: "gardens",
  objective: { nl: TERRAS.kaarttekst, en: TERRAS.en.kaarttekst },
  intervention: { nl: TERRAS.ondertitel, en: TERRAS.en.ondertitel },
  status: { nl: TERRAS.status, en: TERRAS.en.status },
  imageId: 0,
  image: TERRAS_FOTOS.hoofd.src,
}

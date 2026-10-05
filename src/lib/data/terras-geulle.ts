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
} as const

export const TERRAS_UITGELICHT: { waarde: string; eenheid: string; label: string }[] = [
  { waarde: "24", eenheid: "m²", label: "betontegels" },
  { waarde: "60", eenheid: "cm", label: "tegels van 60 × 60 × 4" },
  { waarde: "8", eenheid: "uur", label: "leggen, circa" },
  { waarde: "2", eenheid: "", label: "dagen, alles samen" },
]

export const TERRAS_CIJFERS: [string, string][] = [
  ["Oppervlak", "24 m²"],
  ["Tegels", "Betontegels 60 × 60 × 4 cm"],
  ["Tijd", "Circa 8 uur leggen; twee dagen in totaal"],
  ["Materialen", "Aangeleverd door de klant"],
  ["Afschot", "Richting het gras"],
  ["Plaats", "Geulle, Limburg"],
]

/** De werkzaamheden, in de volgorde van Nicks eigen bericht. */
export const TERRAS_STAPPEN = [
  "Ondergrond ontgraven en voorbereiden",
  "Ondergrond ophogen en verdichten",
  "Zandbed aanbrengen en afrijen",
  "Banden stellen en uitlijnen",
  "Zandbed aantrillen en opnieuw controleren",
  "24 m² betontegels leggen",
  "Alles zorgvuldig op afschot richting het gras",
  "Afwerken en het geheel controleren",
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
  hoofd: { src: `${MAP}/T01.jpg`, width: 1000, height: 1333, alt: "Het nieuwe terras van lichte betontegels onder de overkapping, met de opsluitband langs de rand van het zandbed.", fase: "uitvoering" },
  reeks: [
    { src: `${MAP}/T02.jpg`, width: 1000, height: 1333, alt: "Het smalle pad van betontegels langs de gevel en de schutting, strak uitgelijnd tot achter in de tuin.", fase: "uitvoering" },
    { src: `${MAP}/T04.jpg`, width: 1000, height: 1333, alt: "Het tegelpad vanaf de andere kant, doorlopend tot aan de achterdeur onder de overkapping.", fase: "uitvoering" },
  ],
  slot: { src: `${MAP}/T03.jpg`, width: 1000, height: 1333, alt: "Nick staat op het nieuwe tegelpad, handen in de zij, met een schop en een waterpas bij de hand.", bijschrift: "Klaar, na twee dagen.", fase: "uitvoering" },
} satisfies { hoofd: Foto; reeks: Foto[]; slot: Foto }

export const TERRAS_CITAAT = {
  tekst: "Een goed terras ziet er niet alleen waterpas uit. Het weet ook waar het water heen moet.",
  bron: "Nick Peters, GRØNN Studio",
}

export const TERRAS_SLOT = {
  kop: "De basis bepaalt het resultaat",
  alineas: [
    "Een terras of pad dat al te lang op een vakman wacht? Vertel wat er ligt en wat je wilt; dan kijk ik of en wanneer het past.",
  ],
}

/** Zelfde vorm als VIJVER_ALS_PROJECT: voor de menu's en de zoekfunctie. */
export const TERRAS_ALS_PROJECT: Project = {
  slug: TERRAS_SLUG,
  title: { nl: TERRAS.titel, en: TERRAS.titel },
  location: TERRAS.plaats,
  category: "gardens",
  objective: { nl: TERRAS.kaarttekst, en: TERRAS.kaarttekst },
  intervention: { nl: TERRAS.ondertitel, en: TERRAS.ondertitel },
  status: { nl: TERRAS.status, en: "Completed" },
  imageId: 0,
  image: TERRAS_FOTOS.hoofd.src,
}

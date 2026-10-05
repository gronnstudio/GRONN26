import type { ServiceKind } from "@/lib/data/services"
import type { L } from "@/lib/i18n"
import { DIENST_ICONEN } from "@/lib/iconen"

// De vier plekken van de site en de ene deur. Een eigen module, want kop
// (client) en voet (server) delen ze: een waarde uit een "use client"-
// bestand komt op de server aan als verwijzing, niet als array.

export const PLEKKEN: { href: string; label: L }[] = [
  { href: "/services", label: { nl: "Diensten", en: "Services" } },
  { href: "/projects", label: { nl: "Projecten", en: "Projects" } },
  { href: "/studio", label: { nl: "Over mij", en: "About me" } },
  { href: "/contact", label: { nl: "Contact", en: "Contact" } },
]

/**
 * De vragenpagina. Bewust niet in PLEKKEN: de menu's blijven de vier
 * plekken; /faq staat in de voet, in de zoekfunctie en bij het
 * contactformulier.
 */
export const VRAGEN_PLEK: { href: string; label: L } = {
  href: "/faq",
  label: { nl: "Veelgestelde vragen", en: "FAQ" },
}

/** De techniekpagina: in het Studio-paneel en in de voet, niet in de dock. */
export const STACK_PLEK: { href: string; label: L } = {
  href: "/stack",
  label: { nl: "Techniek", en: "Tech stack" },
}

export const KENNISMAKING: L ={ nl: "Plan een kennismaking", en: "Book an introduction" }

/**
 * De drie niveaus als korte naam, in beide talen: Ontwerp, Aanleg,
 * Onderhoud (eigenaar, 28 sep 2026). De namen zijn die van de
 * diensticonen, dus ze komen daar vandaan in plaats van ernaast te staan.
 */
export const NIVEAU: Record<ServiceKind, L> = {
  ontwerp: DIENST_ICONEN.ontwerp.naam,
  aanleg: DIENST_ICONEN.aanleg.naam,
  onderhoud: DIENST_ICONEN.onderhoud.naam,
}

/** Het portret van Nick (aangeleverd 23 sep 2026). Alt-tekst na bekijken. */
export const PORTRET = {
  src: "/nick/portret-espresso.jpg",
  width: 1932,
  height: 2576,
  alt: {
    nl: "Nick Peters met een espressokopje op een terras in een Maastrichtse straat, kijkend in de camera.",
    en: "Nick Peters holding an espresso cup at a café table on a Maastricht street, looking into the camera.",
  } as L,
}

/**
 * De twee sfeerbeelden uit de Brand Guide 2026 ("sfeerbeeld van de
 * website"). Ze zijn geen bewijs van uitgevoerd werk — de gids zegt dat
 * zelf — dus ze staan nergens bij een project en dragen het label
 * Sfeerbeeld. Alt-tekst na bekijken.
 */
export const SFEER = {
  grashalm: {
    src: "/sfeer/grashalm.jpg",
    width: 1600,
    height: 1200,
    alt: {
      nl: "Close-up van lange grashalmen voor een onscherpe groene weide met naaldbomen en blauwe lucht.",
      en: "Close-up of long grass blades in front of a blurred green meadow with conifers and blue sky.",
    } as L,
  },
  weide: {
    src: "/sfeer/weide-tegenlicht.jpg",
    width: 1600,
    height: 1200,
    alt: {
      nl: "Een hoge, wilde weide in laag tegenlicht, met kleine witte bloemen op de voorgrond.",
      en: "A tall, wild meadow in low backlight, with small white flowers in the foreground.",
    } as L,
  },
}

/** De merkbelofte en drie pijlers, letterlijk uit de Brand Guide 2026 (p. 2). */
export const MERKBELOFTE: L = { nl: "Een tuin die met je meegroeit.", en: "A garden that grows with you." }
// De merkbasis zegt sinds 3 okt 2026 wat en voor wie (eigenaar: "Vijvers
// en tuinen"), gelijk aan de tekst van het Google-profiel. Ook de
// sitebeschrijving en de JSON-LD lezen hem.
export const MERKBASIS: L = {
  nl: "GRØNN Studio ontwerpt, legt aan en onderhoudt vijvers en tuinen bij particulieren in Stein en omgeving. Planten, water en bodem als één systeem, zodat het gezond blijft met weinig ingrijpen.",
  en: "GRØNN Studio designs, builds and maintains ponds and gardens for homeowners in and around Stein, South Limburg. Plants, water and soil as one system, so it stays healthy with little intervention.",
}
export const PIJLERS: { label: L; kop: L; tekst: L }[] = [
  {
    label: { nl: "Levend", en: "Living" },
    kop: { nl: "Natuur als basis", en: "Nature as the base" },
    tekst: {
      nl: "We kijken naar de samenhang tussen bodem, water en planten. De plek bepaalt de keuzes.",
      en: "We look at how soil, water and plants hang together. The place decides the choices.",
    },
  },
  {
    label: { nl: "Doordacht", en: "Considered" },
    kop: { nl: "Ontwerp met reden", en: "Design with a reason" },
    tekst: {
      nl: "Vorm en functie versterken elkaar. Materialen, details en beplanting passen bij het gebruik.",
      en: "Form and function strengthen each other. Materials, details and planting fit the way it is used.",
    },
  },
  {
    label: { nl: "Persoonlijk", en: "Personal" },
    kop: { nl: "Dicht bij de maker", en: "Close to the maker" },
    tekst: {
      nl: "Direct contact, heldere afspraken en zichtbaar vakwerk. Je weet wie er aan jouw tuin werkt.",
      en: "Direct contact, clear agreements and visible craft. You know who is working on your garden.",
    },
  },
]

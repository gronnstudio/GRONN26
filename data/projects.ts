// Het werk. Alleen echte projecten, met de tekst en de cijfers zoals Nick
// ze aanleverde (gronn-studio: src/lib/data/vijverrenovatie.ts en
// terras-geulle.ts). Niets aanvullen, niets schatten.
//
// Afspraken die meekomen:
// - de vijver noemt geen plaats: er wordt er geen bedacht;
// - waterinhoud, afmetingen en uren blijven "circa";
// - de foto's zijn verkleind en zonder metadata (scripts/check-photo-metadata.mjs);
// - een AI-visualisatie draagt altijd `label` en gaat nooit door voor een foto.

export type Foto = {
  src: string
  width: number
  height: number
  /** Geschreven na het bekijken van de foto: wat zichtbaar is. */
  alt: string
  bijschrift?: string
  /** Op het beeld, voor wat geen foto van het werk is. */
  label?: string
  /** CSS object-position als het beeld wordt bijgesneden. */
  focus?: string
}

export type Project = {
  slug: string
  /** De projectcode: GR / 001, oplopend in volgorde van oplevering. */
  code: string
  titel: string
  categorie: string
  plaats?: string
  jaar: number
  status: string
  /** Korte samenvatting voor overzichten en metadata. */
  samenvatting: string
  intro: string[]
  cover: Foto
}

const VIJVER_MAP = "/projecten/vijverrenovatie"
const TERRAS_MAP = "/projecten/terras-geulle"

export const PROJECTS: Project[] = [
  {
    slug: "vijverrenovatie",
    code: "GR / 001",
    titel: "Twee vijvers. Eén samenhangend watersysteem.",
    categorie: "Vijverrenovatie",
    jaar: 2026,
    status: "In afronding",
    samenvatting:
      "Twee vijvers, een waterval en een beekloop verbonden tot één watersysteem. Een renovatie met aandacht voor techniek, onderhoud en natuurlijke afwerking.",
    intro: [
      "Circa 5.000 liter water, twee vijvers, een waterval en een beekloop. Voor GRØNN Studio kwamen ze samen in een eerste vijverrenovatie waarin bijna ieder onderdeel invloed heeft op de rest. Van de route van een ondergrondse leiding tot de plek van een plantmand: achter het uiteindelijke beeld gaat veel uitzoekwerk, afstemming en aandacht schuil.",
      "Inmiddels is ongeveer 120 uur besteed aan de voorbereiding en uitvoering. Het project bevindt zich in de afrondende fase. De basis krijgt zijn definitieve vorm; de beplanting zal het geheel daarna verder laten groeien.",
    ],
    cover: {
      src: `${VIJVER_MAP}/F01.jpg`,
      width: 2000,
      height: 1500,
      alt: "Overzicht van de tuin tijdens de afronding: een klinkerpad, een treurwilg, ronde stapstenen in de vijver en borders met keien en jonge beplanting.",
      focus: "82% 55%",
    },
  },
  {
    slug: "terras-geulle",
    code: "GR / 002",
    titel: "Een terras van 24 m², gelegd in twee dagen.",
    categorie: "Terrasaanleg",
    plaats: "Geulle",
    jaar: 2026,
    status: "Afgerond",
    samenvatting:
      "Stratenmakers waren te duur of pas volgend jaar beschikbaar. De materialen lagen er al; in twee dagen lag er een strak terras van 24 m².",
    intro: [
      "De vraag kwam op een kinderfeestje. Iemand vroeg naar mijn werk en vertelde over een terras dat er maar niet kwam: stratenmakers waren te duur, of pas de volgende zomer beschikbaar. De materialen lagen er al. Wat ontbrak, was iemand die het deed.",
      "Het werden 24 m² betontegels van 60 × 60 × 4 cm. Geen tegels erin en klaar: de voorbereiding bepaalt uiteindelijk het resultaat. Het leggen zelf kostte ongeveer 8 uur; met het grondwerk erbij waren het twee dagen.",
    ],
    cover: {
      src: `${TERRAS_MAP}/T01.jpg`,
      width: 1000,
      height: 1333,
      alt: "Het nieuwe terras van lichte betontegels onder de overkapping, met de opsluitband langs de rand van het zandbed.",
    },
  },
]

/** De waterval: het openingsbeeld van de site. */
export const OPENINGSBEELD: Foto = {
  src: `${VIJVER_MAP}/F10.jpg`,
  width: 2000,
  height: 1500,
  alt: "De waterval stroomt over natuursteen de vijver in, met een rood bloeiende canna ervoor en de leidingen met een kogelkraan erachter.",
  focus: "50% 60%",
}

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug)

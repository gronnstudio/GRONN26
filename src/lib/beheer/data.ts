// Wat het dashboard (/beheer) laat zien. Alleen echte gegevens (eigenaar, 6 okt
// 2026: "een jarvis achtig dashboard waar alles in samenkomt"); pas dit bestand
// aan als een project een fase verder is. Bedragen incl. btw.

export const FASEN = ["Aanvraag", "Offerte", "Gepland", "Uitvoering", "Opgeleverd"] as const
export type Fase = (typeof FASEN)[number]

export type Project = {
  naam: string
  wat: string
  plaats: string
  fase: Fase
  bedrag?: number
  volgende: string
  /** Moet ik iets doen? */
  aandacht?: boolean
}

export const PROJECTEN: Project[] = [
  {
    naam: "Clannad & Stijn",
    wat: "Achtertuin, cottage-tuin met keermuur",
    plaats: "Stein",
    fase: "Offerte",
    bedrag: 11495,
    volgende: "Offerte GR-O // 2026-1006-01 versturen met voorwaarden en herroepingsformulier. Geldig t/m 31 oktober.",
    aandacht: true,
  },
  {
    naam: "Noah Goffin",
    wat: "6 opbouwstopcontacten",
    plaats: "",
    fase: "Offerte",
    bedrag: 331.28,
    volgende: "Akkoord afwachten.",
  },
  {
    naam: "Vijverrenovatie",
    wat: "Twee vijvers, één watersysteem",
    plaats: "",
    fase: "Uitvoering",
    volgende: "In afronding; verdere aanplant voorjaar 2027.",
  },
  {
    naam: "Terras Geulle",
    wat: "Terras van 24 m²",
    plaats: "Geulle",
    fase: "Opgeleverd",
    volgende: "Klaar.",
  },
]

export type Todo = { wat: string; waarom: string; kosten: string; dringend?: boolean }

// Kosten zijn schattingen (6 okt 2026): verzekering volgens Knab/mijnzzp/ZZP
// Nederland, de rest een gangbare marktprijs. Controleer vóór je beslist.
export const TODOS: Todo[] = [
  {
    wat: "Bedrijfsaansprakelijkheidsverzekering afsluiten",
    waarom: "Vóór je bij Clannad & Stijn graaft en de keermuur bouwt. Nu heb je er geen.",
    kosten: "± € 150–700 per jaar",
    dringend: true,
  },
  {
    wat: "Voorwaarden en privacy één keer laten toetsen",
    waarom: "Door een jurist, vooral bedenktijd en aansprakelijkheid.",
    kosten: "± € 250–750 eenmalig",
  },
  {
    wat: "Google Cloud-proefperiode nagaan",
    waarom: "Je inloggen loopt via Google; controleer of dat blijft werken na de proef.",
    kosten: "€ 0 (inloggen is gratis)",
  },
  {
    wat: "Formulier ooit via eigen mailbox",
    waarom: "FormSubmit biedt geen verwerkersovereenkomst.",
    kosten: "€ 0 zelf, of ± € 10 per maand voor een dienst met overeenkomst",
  },
]

export const KOPPELINGEN = [
  { naam: "Offertes", uitleg: "GR-O en GR-N", href: "/offertes" },
  { naam: "Gmail", uitleg: "hello@gronn.studio", href: "https://mail.google.com" },
  { naam: "Drive", uitleg: "Kleine letters", href: "https://drive.google.com/drive/folders/1HoVxEuLOvKWKrYLGKMj9IGkpr0WW6v5S" },
  { naam: "DigiBoox", uitleg: "Facturen en btw", href: "https://account.digiboox.app" },
  { naam: "Vercel", uitleg: "De site", href: "https://vercel.com/gronn/gronn26" },
  { naam: "Website", uitleg: "gronn.studio", href: "/" },
] as const

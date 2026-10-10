// Wat het dashboard (/dashboard) laat zien. Alleen echte gegevens (eigenaar, 6 okt
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
    volgende: "Nieuwe offerte versturen met voorwaarden en herroepingsformulier, geldig t/m 31 oktober. Let op: nummer GR-O // 2026-1006-01 is al gebruikt (Steffie).",
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
    wat: "Aansprakelijkheidsverzekering: acceptatie afwachten",
    waarom: "Aangevraagd bij NN via Zicht (7 okt). Dekking pas na acceptatie, antwoord rond 21 okt; niet graven vóór die tijd.",
    kosten: "€ 33,06 per maand",
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

// Zakelijke accounts bij leveranciers, met de stand uit de mail (7 okt 2026).
export type Stand = "actief" | "wacht" | "uit"
export const LEVERANCIERS: { naam: string; uitleg: string; stand: Stand; href: string }[] = [
  { naam: "Directplant", uitleg: "Planten · 20% korting", stand: "actief", href: "https://www.directplant.nl/customer/account/login/" },
  { naam: "Bomenbezorgd", uitleg: "Bomen", stand: "actief", href: "https://www.bomenbezorgdtobusiness.nl/inloggen" },
  { naam: "Biovijver", uitleg: "Vijver", stand: "actief", href: "https://biovijver.nl/" },
  { naam: "ToolMax", uitleg: "Gereedschap", stand: "actief", href: "https://www.toolmax.nl/" },
  { naam: "Wovar", uitleg: "IJzerwaren · B2B", stand: "actief", href: "https://www.wovar.nl/Customer/Login/" },
  { naam: "Wildkamp", uitleg: "Tuinmaterialen · zakelijk niet bevestigd", stand: "wacht", href: "https://www.wildkamp.nl/" },
  { naam: "Dutch Paving Tools", uitleg: "Bestratingsgereedschap · nog geen account", stand: "uit", href: "https://www.dutchpavingtools.com/my-account/" },
  { naam: "Fenceweb", uitleg: "Hekwerk · in controle", stand: "wacht", href: "https://www.fenceweb.com/nl/customer/account/login/" },
]

// Facturen uit de mail (7 okt 2026). "Te ontvangen" = mijn facturen via DigiBoox;
// betaald zie ik alleen als Mollie het uitbetaalt (online betaald). Een
// overschrijving naar de bank zie ik niet: die vink je in DigiBoox af.
export type Factuur = { nummer: string; aan: string; bedrag?: number; vervalt: string; stand: string; betaald?: boolean }

export const TE_ONTVANGEN: Factuur[] = [
  { nummer: "GR-F // 2026-0908-0010", aan: "Clannad & Stijn, 1e termijn", bedrag: 3737.5, vervalt: "2026-09-22", stand: "Geen betaling gezien" },
  { nummer: "GR-F // 2026-0923-0009", aan: "Vijverrenovatie, laatste factuur", bedrag: 485, vervalt: "2026-10-07", stand: "Betaald via Mollie (uitbetaald 24 sep)", betaald: true },
  { nummer: "GR-F // 2026-0930-0011", aan: "Minigraver en dumper", bedrag: 325, vervalt: "2026-10-14", stand: "Open; lijkt dubbel met GR-F // 2026-1006-01" },
  { nummer: "GR-F // 2026-1006-0001", aan: "Elektra, materiaal en 2 uur", bedrag: 320, vervalt: "2026-10-20", stand: "Open" },
  { nummer: "GR-F // 2026-1006-01", aan: "Minigraver en dumper", bedrag: 325, vervalt: "2026-10-20", stand: "Open" },
]

export const TE_BETALEN: Factuur[] = [
  { nummer: "in3 · Deryan", aan: "Termijnbetaling", vervalt: "2026-10-03", stand: "Derde herinnering" },
  { nummer: "Billink · Jorny", aan: "Vijverspullen", vervalt: "2026-10-01", stand: "Aanmaning" },
  { nummer: "Elektramat 110682614", aan: "Bestelling", vervalt: "2026-10-06", stand: "Nog niet betaald" },
  { nummer: "TransIP F0000.2609.0006.4951", aan: "Domein en hosting", bedrag: 73.8, vervalt: "2026-09-23", stand: "Incasso mislukt" },
  { nummer: "Simpel F2611494739", aan: "Telefoon", bedrag: 5, vervalt: "2026-10-02", stand: "Incasso mislukt" },
  { nummer: "Vercel", aan: "Hosting", vervalt: "2026-09-29", stand: "Kaart geweigerd" },
  { nummer: "DigiBoox 202608-030244", aan: "Boekhouding augustus", bedrag: 19.97, vervalt: "2026-09-16", stand: "Achterstand" },
]

// Offertes uit de mail (DigiBoox, 7 okt 2026). "betaald" betekent hier
// geaccepteerd; "vervalt" is geldig tot.
export const OFFERTES: Factuur[] = [
  { nummer: "GR-O // 2026-0905-0001", aan: "Clannad & Stijn, achtertuin", bedrag: 11495, vervalt: "2026-10-05", stand: "Herzien 14 sep, nog geen akkoord; zij willen maart 2027" },
  { nummer: "GR-O // 2026-1006-02", aan: "Noah Goffin, 6 opbouwstopcontacten", bedrag: 331.28, vervalt: "2026-11-06", stand: "Verstuurd 6 okt, akkoord afwachten" },
  { nummer: "GR-O // 2026-1006-01", aan: "Steffie, minigraver en dumper", bedrag: 325, vervalt: "2026-11-06", stand: "Geaccepteerd 6 okt, gefactureerd", betaald: true },
]

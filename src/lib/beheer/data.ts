// Vaste lijsten voor het systeem (/dashboard) die niet uit de klantkaarten komen:
// je eigen to-do's, de links en wat je zelf nog moet betalen. Klanten, offertes en
// facturen staan sinds 29 okt 2026 op de klantkaarten (src/lib/beheer/klanten.ts).

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

// Eigen gereedschapspagina's op de site, die nergens in een menu staan
// (eigenaar, 21 okt 2026: "alles waar we links voor hebben gemaakt kun je in
// dashboard makkelijk bereikbaar maken").
export const EIGEN_PAGINAS = [
  { naam: "Handtekening", uitleg: "Voor Gmail", href: "/handtekening" },
  { naam: "Downloads", uitleg: "Merkbestanden", href: "/downloads" },
  { naam: "Linkpagina", uitleg: "Voor Instagram", href: "/links" },
  { naam: "Merk", uitleg: "Brand Guide", href: "/merk" },
  { naam: "Social", uitleg: "Posts en captions", href: "/dashboard/social" },
  { naam: "Uren", uitleg: "Urenregistratie", href: "/dashboard/uren" },
] as const

// Wat je zelf nog moet betalen, uit de mail (7 okt 2026).
export type Factuur = { nummer: string; aan: string; bedrag?: number; vervalt: string; stand: string; betaald?: boolean }

export const TE_BETALEN: Factuur[] = [
  { nummer: "in3 · Deryan", aan: "Termijnbetaling", vervalt: "2026-10-03", stand: "Derde herinnering" },
  { nummer: "Billink · Jorny", aan: "Vijverspullen", vervalt: "2026-10-01", stand: "Aanmaning" },
  { nummer: "Elektramat 110682614", aan: "Bestelling", vervalt: "2026-10-06", stand: "Nog niet betaald" },
  { nummer: "TransIP F0000.2609.0006.4951", aan: "Domein en hosting", bedrag: 73.8, vervalt: "2026-09-23", stand: "Incasso mislukt" },
  { nummer: "Simpel F2611494739", aan: "Telefoon", bedrag: 5, vervalt: "2026-10-02", stand: "Incasso mislukt" },
  { nummer: "Vercel", aan: "Hosting", vervalt: "2026-09-29", stand: "Kaart geweigerd" },
  { nummer: "DigiBoox 202608-030244", aan: "Boekhouding augustus", bedrag: 19.97, vervalt: "2026-09-16", stand: "Achterstand" },
]

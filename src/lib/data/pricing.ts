import type { L } from "@/lib/i18n"

// Published prices, keyed by service slug.
//
// Deliberately NOT a field on `Service`: the editor's popover
// (`src/editor/toolbar.tsx`) only edits `{en, nl}` values, so a number put
// on the content document would publish into Blob and strand there as
// half-editable. Prices are business decisions — they belong in a commit
// and a review, not in a live inline editor. The copy *around* a price
// (what you get, what you don't) stays fully editable, because that is `L`.
//
// Every figure below comes from the studio's own rate work: standardised
// seasonal jobs carry a fixed price. Design has NO entry here, on
// purpose: every design is quoted (owner, 23 Sep 2026: "altijd
// offerte"). The fixed design fees that used to stand here were
// withdrawn from the site; a slug without an entry renders as "op maat"
// on every card, table, menu, search hit, JSON-LD block and /faq
// answer. What still holds for a design — the verrekenregel — lives in
// `QUOTE_OFFSETS` below, because it names no amount. The
// amounts are INCLUSIVE of btw — that is the figure a particulier sees.
// Note the asymmetry with `src/lib/documents.ts`, where /admin line items
// are ex btw and `vatRate` is applied to the subtotal.

export type PriceTier = {
  label: L
  amount: number
  /** Set only when the tier is honestly a range rather than a figure. */
  amountMax?: number
  note?: L
}

export type Pricing = {
  /** How the figure should be read: a set price, a floor, or per month. */
  basis: "fixed" | "from" | "monthly"
  /** Consumer prices are quoted incl. btw. Kept explicit so nothing drifts. */
  vatIncluded: true
  tiers: PriceTier[]
  /** The verrekenregel — what comes off a later invoice. */
  offset?: L
}

export const PRICING: Record<string, Pricing> = {
  "leaf-net": {
    basis: "fixed",
    vatIncluded: true,
    tiers: [
      { label: { en: "Up to 15 m²", nl: "Tot 15 m²" }, amount: 125 },
      { label: { en: "15 to 35 m²", nl: "15 tot 35 m²" }, amount: 175 },
      { label: { en: "More than 35 m²", nl: "Meer dan 35 m²" }, amount: 250 },
    ],
    offset: {
      en: "Includes taking the net back off in December — booked into the calendar on the day it goes on, not left as “I'll call you”. Want it every year? Then it stays in the calendar: on every autumn, off in December, at the same price. Cancel any year until 1 September.",
      nl: "Inclusief het ophalen in december — meteen ingepland op de dag dat het net erop gaat, niet als “ik bel nog”. Wil je het elk jaar? Dan staat het vast in de agenda: elk najaar erop, in december eraf, voor dezelfde prijs. Opzeggen kan elk jaar tot 1 september.",
    },
  },

  "pond-autumn-service": {
    basis: "fixed",
    vatIncluded: true,
    tiers: [
      {
        label: { en: "Small, lightly kept", nl: "Klein, licht onderhouden" },
        amount: 250,
      },
      { label: { en: "Average", nl: "Gemiddeld" }, amount: 350 },
      {
        label: { en: "Neglected", nl: "Verwaarloosd" },
        amount: 450,
        amountMax: 650,
        note: {
          en: "Quoted after a look, never blind — a pond nobody has touched in years is the one case where a guessed price costs someone a day.",
          nl: "Prijs pas na een blik ter plaatse, nooit blind — een vijver waar jaren niets aan gedaan is, is precies het geval waarin een gegokte prijs iemand een dag kost.",
        },
      },
    ],
  },

  winterising: {
    basis: "fixed",
    vatIncluded: true,
    tiers: [
      { label: { en: "Basic", nl: "Basis" }, amount: 95 },
      {
        label: { en: "With leaf net collection", nl: "Met bladnet ophalen" },
        amount: 135,
      },
      {
        label: { en: "With ice-free keeper", nl: "Met ijsvrijhouder" },
        amount: 150,
      },
      { label: { en: "Everything", nl: "Alles" }, amount: 185 },
    ],
  },

  "pond-survey": {
    basis: "fixed",
    vatIncluded: true,
    tiers: [
      { label: { en: "Pond survey", nl: "Vijverdoorlichting" }, amount: 195 },
      {
        label: { en: "Garden scan", nl: "Tuinscan" },
        amount: 175,
        note: {
          en: "Soil, planting and water management.",
          nl: "Bodem, beplanting en waterhuishouding.",
        },
      },
      { label: { en: "Both", nl: "Beide" }, amount: 295 },
    ],
    offset: {
      en: "I offset it in full against any job over €750. If the survey leads to work, the survey was free.",
      nl: "Ik verreken hem volledig bij een opdracht boven €750. Leidt de doorlichting tot werk, dan was de doorlichting gratis.",
    },
  },

  "maintenance-subscription": {
    basis: "monthly",
    vatIncluded: true,
    tiers: [
      {
        label: { en: "Basic", nl: "Basis" },
        amount: 45,
        note: {
          en: "Two visits a year — spring start-up, autumn close-down.",
          nl: "Twee bezoeken per jaar — voorjaar opstarten, najaar afsluiten.",
        },
      },
      {
        label: { en: "Standard", nl: "Standaard" },
        amount: 85,
        note: {
          en: "Four visits a year. The one that is right for most ponds.",
          nl: "Vier bezoeken per jaar. Voor de meeste vijvers is dit de juiste.",
        },
      },
      {
        label: { en: "Complete", nl: "Compleet" },
        amount: 165,
        note: {
          en: "Six visits a year, garden maintenance included.",
          nl: "Zes bezoeken per jaar, inclusief tuinonderhoud.",
        },
      },
    ],
  },
  // Vanafprijzen voor de tuindiensten (5 okt 2026; eigenaar: "bedenk zelf
  // prijzen" op basis van de echte offertes in Drive): offerte achtertuin Stein
  // (GR-O 202609140002: € 9.895 incl. btw voor ~50 m²; borders ~€ 75/m²) en de
  // offerte Fase 1 consult (€ 175 excl. btw). Alle bedragen incl. btw.
  consultancy: {
    basis: "from",
    vatIncluded: true,
    tiers: [{ label: { en: "Visit with written advice", nl: "Bezoek met schriftelijk advies" }, amount: 195 }],
  },
  "garden-design": {
    basis: "from",
    vatIncluded: true,
    tiers: [{ label: { en: "Design for a small garden", nl: "Ontwerp voor een kleine tuin" }, amount: 450 }],
    offset: {
      en: "Have me build it? Then I offset half the design fee against the first invoice. Never all of it — a design that becomes free teaches everyone that the thinking was worth nothing.",
      nl: "Laat je het door mij aanleggen? Dan verreken ik de helft van het ontwerpbedrag met de eerste factuur. Nooit alles — een ontwerp dat gratis wordt, leert iedereen dat het denkwerk niets waard was.",
    },
  },
  "planting-habitat": {
    basis: "from",
    vatIncluded: true,
    tiers: [{ label: { en: "Per m² of border, plants included", nl: "Per m² border, planten inbegrepen" }, amount: 75 }],
  },
  "garden-transformation": {
    basis: "from",
    vatIncluded: true,
    tiers: [{ label: { en: "Reworking part of a garden", nl: "Een deel van de tuin omvormen" }, amount: 2500 }],
  },
  implementation: {
    basis: "from",
    vatIncluded: true,
    tiers: [{ label: { en: "Building a small garden or terrace", nl: "Een kleine tuin of terras aanleggen" }, amount: 1500 }],
  },
}

/**
 * The verrekenregel of a service that has no published price: it is
 * always quoted, but what comes off a later invoice is still a promise
 * worth showing. Deliberately separate from `PRICING`, so a quote-only
 * service can never be read as priced by `pricingFor` or `priceHint`.
 */
export const QUOTE_OFFSETS: Record<string, L> = {}

export function quoteOffsetFor(slug: string): L | undefined {
  return QUOTE_OFFSETS[slug]
}

export function pricingFor(slug: string): Pricing | undefined {
  return PRICING[slug]
}

/**
 * The one-line price hint used wherever a service is listed rather than
 * detailed: the lowest tier, and whether it is a monthly figure. Kept here
 * so the services page and the header's mega menu cannot drift on which
 * number counts as "from".
 */
export function priceHint(
  slug: string
): { from: number; monthly: boolean } | null {
  const pricing = pricingFor(slug)
  if (!pricing) return null
  return {
    from: Math.min(...pricing.tiers.map((tier) => tier.amount)),
    monthly: pricing.basis === "monthly",
  }
}

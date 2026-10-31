// Money formatting, shared by the owner's document builder (/admin) and the
// public price surfaces. It lives here rather than in `documents.ts` so the
// marketing pages can format a euro without importing the invoice model.
//
// Two shapes, deliberately: an invoice line is always two decimals, and a
// published consumer price is always whole euros. "€ 350,00" on a service
// page reads like a quotation; "€350" reads like a price.

/** Invoice/quote amounts — always two decimals. */
export function euro(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value))
    return "—"
  return `€ ${value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Published consumer prices — whole euros, no decimals, no space. */
export function priceLabel(value: number): string {
  return `€${Math.round(value).toLocaleString("nl-NL")}`
}

/**
 * A tier's price as the visitor reads it: a single figure, or a range when
 * the work genuinely cannot be quoted blind (a neglected pond is looked at
 * first, then priced).
 */
export function priceRangeLabel(from: number, to?: number): string {
  return to ? `${priceLabel(from)}–${priceLabel(to)}` : priceLabel(from)
}

/**
 * A published consumer price in the visitor's own language: "€ 175" in
 * Dutch, "€175" in English, whole euros. The one formatter behind the
 * price cards and tables of the public site and the answers on /faq, so
 * a figure reads the same wherever it stands.
 */
export function consumerPrice(value: number, locale: "en" | "nl"): string {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

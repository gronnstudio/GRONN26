import { billable, totals, type StudioDocument } from "@/lib/documents"
import type { IntakeSubmission } from "@/lib/intake-archive"

// What the administration can honestly be asked.
//
// Pure functions over data the panel already reads, in a module with no
// React and no storage, so the numbers can be tested directly rather
// than eyeballed on a page. That matters more here than anywhere else in
// this project: a wrong figure on a dashboard is not visibly wrong.
//
// ONE THING IS DELIBERATELY ABSENT. Revenue per service would be the
// most useful number of all — it is the only one that says where the
// money comes from — and it cannot be computed. A `StudioDocument`
// carries line items with free-text descriptions and no service slug, so
// there is no link between an invoice and the catalogue. Guessing by
// matching words against service titles would produce a chart that looks
// authoritative and is arithmetic on a coincidence.
//
// It becomes possible the day a document knows which service it answers.
// Until then the panel says nothing rather than something plausible.

const DAY = 24 * 60 * 60 * 1000

/** Column 0 is the single price, or variant A. */
function value(doc: StudioDocument): number {
  return totals(doc).gross[0] ?? 0
}

/* --------------------------------------------------------------- money */

export type MonthPoint = { key: string; label: string; value: number }

const MONTH_LABELS = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
]

/**
 * Invoiced per month, oldest first, including the months with nothing in
 * them — a gap is a fact about the year and dropping it would draw a
 * flattering line through the quiet months.
 */
export function revenueByMonth(
  documents: StudioDocument[],
  months: number,
  today: Date
): MonthPoint[] {
  const invoices = billable(documents).filter((d) => d.kind === "factuur")
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (months - 1 - i), 1)
    )
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    return {
      key,
      label: MONTH_LABELS[d.getUTCMonth()],
      value: invoices
        .filter((doc) => (doc.dateISO || "").startsWith(key))
        .reduce((sum, doc) => sum + value(doc), 0),
    }
  })
}

/** The average quote, and how many it averages over. */
export function averageQuote(documents: StudioDocument[]): {
  average: number
  count: number
} {
  const quotes = billable(documents).filter((d) => d.kind === "offerte" && value(d) > 0)
  if (quotes.length === 0) return { average: 0, count: 0 }
  const sum = quotes.reduce((n, d) => n + value(d), 0)
  return { average: Math.round(sum / quotes.length), count: quotes.length }
}

/* ------------------------------------------------------------ the funnel */

/**
 * How many enquiries got as far as a quote.
 *
 * The link is `intakeRef`, set by `draftFromIntake`. An intake answered
 * by a quote typed from scratch is invisible here, and that is stated
 * rather than corrected for: the alternative is matching on client names,
 * which is how an invoice ends up attached to the wrong household.
 */
export function quotedShare(
  submissions: IntakeSubmission[],
  documents: StudioDocument[]
): { quoted: number; total: number } {
  const real = submissions.filter((s) => s.receivedAt)
  const answered = new Set(
    documents.map((d) => d.intakeRef).filter((r): r is string => Boolean(r))
  )
  return {
    quoted: real.filter((s) => answered.has(s.reference)).length,
    total: real.length,
  }
}

/**
 * Quotes that became an invoice.
 *
 * `toInvoice` copies the whole document, so an invoice keeps the
 * `intakeRef` its quote carried — which is the only thread between the
 * two. A quote with no intake behind it cannot be followed, so it is
 * excluded from both halves rather than counted as a loss.
 */
export function acceptedShare(documents: StudioDocument[]): {
  accepted: number
  total: number
} {
  const quoteRefs = new Set(
    documents
      .filter((d) => !d.annex && d.kind === "offerte" && d.intakeRef)
      .map((d) => d.intakeRef as string)
  )
  const invoicedRefs = new Set(
    documents
      .filter((d) => !d.annex && d.kind === "factuur" && d.intakeRef)
      .map((d) => d.intakeRef as string)
  )
  let accepted = 0
  for (const ref of quoteRefs) if (invoicedRefs.has(ref)) accepted += 1
  return { accepted, total: quoteRefs.size }
}

/**
 * Days from an enquiry arriving to its first quote.
 *
 * The median, not the mean: one enquiry answered six months late would
 * drag an average into uselessness, and with a handful of projects a
 * year that single outlier is likely rather than exotic.
 */
export function leadTimeDays(
  submissions: IntakeSubmission[],
  documents: StudioDocument[]
): { median: number; count: number } {
  const firstQuote = new Map<string, string>()
  for (const d of documents) {
    if (d.kind !== "offerte" || !d.intakeRef) continue
    const stamp = d.dateISO || d.updatedAt.slice(0, 10)
    if (!stamp) continue
    const held = firstQuote.get(d.intakeRef)
    if (!held || stamp < held) firstQuote.set(d.intakeRef, stamp)
  }

  const spans: number[] = []
  for (const s of submissions) {
    if (!s.receivedAt) continue
    const quoted = firstQuote.get(s.reference)
    if (!quoted) continue
    const from = new Date(s.receivedAt.slice(0, 10)).getTime()
    const to = new Date(quoted).getTime()
    if (Number.isNaN(from) || Number.isNaN(to)) continue
    const days = Math.round((to - from) / DAY)
    // A quote dated before its own enquiry is a typed date, not a
    // negative wait. Dropped rather than folded in as a zero.
    if (days >= 0) spans.push(days)
  }

  if (spans.length === 0) return { median: 0, count: 0 }
  spans.sort((a, b) => a - b)
  const mid = Math.floor(spans.length / 2)
  const median =
    spans.length % 2 === 0
      ? Math.round((spans[mid - 1] + spans[mid]) / 2)
      : spans[mid]
  return { median, count: spans.length }
}

/** Invoices marked paid, over invoices that exist. */
export function paidShare(documents: StudioDocument[]): {
  paid: number
  total: number
} {
  const invoices = billable(documents).filter((d) => d.kind === "factuur")
  return { paid: invoices.filter((d) => d.paid).length, total: invoices.length }
}

/* ------------------------------------------------------ the money summary */

export type OpenDocument = {
  id: string
  kind: "offerte" | "factuur"
  number: string
  /** The first line of the client block: a name, never an address. */
  client: string
  title: string
  value: number
  deadlineISO: string
  /** Whole days to the deadline; negative once it has passed. */
  daysLeft: number | null
  intakeRef?: string
}

export type MoneySummary = {
  invoicedThisYear: number
  invoicedThisMonth: number
  /** Invoices not marked paid, whatever their due date. */
  owed: number
  overdue: OpenDocument[]
  overdueTotal: number
  /** Unpaid invoices, soonest due first. */
  unpaid: OpenDocument[]
  /** Quotes still valid, soonest to lapse first. */
  openQuotes: OpenDocument[]
  months: MonthPoint[]
}

/** Whole days from today to an ISO date; negative once it is past. */
export function daysUntil(iso: string, today: Date): number | null {
  if (!iso) return null
  const t = new Date(`${iso}T00:00:00Z`).getTime()
  if (Number.isNaN(t)) return null
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((t - now) / DAY)
}

/**
 * The dashboard's headline money figures, as one pure function, so /os
 * shows the same numbers as /dashboard and a test can hold both to it.
 *
 * Same rules as the dashboard page: `active` documents only (the caller
 * passes those), `billable` for every sum, paid and unpaid both count as
 * invoiced, overdue = unpaid past its deadline.
 */
export function moneySummary(documents: StudioDocument[], today: Date): MoneySummary {
  const year = String(today.getUTCFullYear())
  const month = `${year}-${String(today.getUTCMonth() + 1).padStart(2, "0")}`
  const open = (d: StudioDocument): OpenDocument => ({
    id: d.id,
    kind: d.kind,
    number: d.number,
    client: (d.client.split("\n")[0] || "").trim(),
    title: d.title,
    value: value(d),
    deadlineISO: d.deadlineISO,
    daysLeft: daysUntil(d.deadlineISO, today),
    intakeRef: d.intakeRef,
  })
  const bySoonest = (a: OpenDocument, b: OpenDocument) =>
    (a.deadlineISO || "9999").localeCompare(b.deadlineISO || "9999")

  const invoices = billable(documents).filter((d) => d.kind === "factuur")
  const unpaid = invoices.filter((d) => !d.paid).map(open).sort(bySoonest)
  const overdue = unpaid.filter((d) => d.daysLeft !== null && d.daysLeft < 0)
  const invoicedIn = (prefix: string) =>
    invoices.filter((d) => (d.dateISO || "").startsWith(prefix)).reduce((s, d) => s + value(d), 0)
  const invoicedRefs = new Set(invoices.map((d) => d.intakeRef).filter(Boolean))
  const quotes = billable(documents).filter((d) => d.kind === "offerte")
  const openQuotes = quotes
    .filter((d) => !(d.intakeRef && invoicedRefs.has(d.intakeRef)))
    .map(open)
    .filter((d) => d.daysLeft === null || d.daysLeft >= 0)
    .sort(bySoonest)

  return {
    invoicedThisYear: invoicedIn(year),
    invoicedThisMonth: invoicedIn(month),
    owed: unpaid.reduce((s, d) => s + d.value, 0),
    overdue,
    overdueTotal: overdue.reduce((s, d) => s + d.value, 0),
    unpaid,
    openQuotes,
    months: revenueByMonth(documents, 12, today),
  }
}

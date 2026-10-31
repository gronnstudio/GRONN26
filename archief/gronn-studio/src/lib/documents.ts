// Studio documents — quotes (offertes) and invoices (facturen).
//
// The owner's own single-file quote/invoice builder, brought into the
// site's admin dashboard so it lives behind the same Google gate as the
// editor and inherits the brand's type and colour system.
//
// Everything here is pure data + arithmetic, deliberately free of React,
// so the money maths can be reasoned about (and later tested) on its own.

/** A quote is a proposal; an invoice is a demand for payment. */
export type DocKind = "offerte" | "factuur"

export type LineItem = {
  id: string
  description: string
  /** Optional second line under the description, in the fine print. */
  detail: string
  /** Shown as "inbegrepen" with no price, and excluded from the totals. */
  included: boolean
  /** One amount per variant column; null = an empty cell ("—"). */
  amounts: (number | null)[]
}

export type TextBlock = {
  id: string
  heading: string
  /** Blank lines separate paragraphs. */
  body: string
  /** Renders as an ember-ruled note instead of a plain section. */
  callout: boolean
}

/**
 * Which identity the sheet carries. The full logo already contains the
 * name and the tagline, so printing it beside the typeset wordmark says
 * everything twice — hence a choice rather than a stack.
 */
export type Masthead = "logo" | "mark" | "wordmark"

/** One price per line, or two/three variants side by side. */
export type ColumnCount = 1 | 2 | 3

export type StudioDocument = {
  id: string
  kind: DocKind
  masthead: Masthead
  number: string
  /** What is printed. Free text, so "in overleg" is always possible. */
  date: string
  /** What the date picker shows, when a real date was chosen. */
  dateISO: string
  /** "Geldig tot" on a quote, "Vervaldatum" on an invoice. */
  deadline: string
  deadlineISO: string
  client: string
  extraLabel: string
  extraValue: string
  title: string
  intro: string
  blocksBefore: TextBlock[]
  blocksAfter: TextBlock[]
  /** 1 = one price per line, 3 = three variants side by side. */
  columns: ColumnCount
  variantNames: string[]
  vatRate: number
  amountsHeading: string
  items: LineItem[]
  /** Never printed — a reminder to self, kept with the document. */
  note: string
  /** Invoices only; shown in the document list, never on the sheet. */
  paid: boolean
  /**
   * The intake this document answers, by its archive reference.
   *
   * Optional, and absent on everything written before the two halves of
   * the panel knew about each other. It is what lets the dashboard ask
   * the only question that matters about a pile of enquiries — which of
   * them never got a quote — and it is never printed: the client knows
   * what they sent.
   */
  intakeRef?: string
  /**
   * Out of the way, still on the books.
   *
   * There is no delete for a document and there should not be: art. 52
   * AWR requires seven years of retention, so a button that removes a
   * sent invoice is a button that can damage the bookkeeping. This drops
   * it out of the lists instead. The record stays, the numbering stays
   * unbroken, and the filter brings it back.
   *
   * Optional, like `intakeRef`, so every document written before this
   * field existed loads untouched — `isDocument` never learns about it.
   */
  archivedAt?: string
  /**
   * Een specificatie bij andermans factuur, geen factuur.
   *
   * De boekhouding draait in Digiboox: dat pakket mint het factuurnummer,
   * doet de btw-aangifte en zet de iDEAL-link in de mail. Wat dit paneel
   * dan nog toevoegt is de uitsplitsing — wat er in dat ene bedrag zit —
   * en die gaat als bijlage mee.
   *
   * Zo'n vel draagt dus wél bedragen en géén schuld. Het mag daarom nooit
   * in een omzetcijfer belanden: dan staat dezelfde € 3.737,50 twee keer
   * in de jaaromzet. `billable()` hieronder is de enige plek waar dat
   * onderscheid wordt gemaakt, en elk geldcijfer loopt daardoorheen.
   *
   * Optioneel, net als `intakeRef` en `archivedAt`, zodat elk document dat
   * vóór dit veld is opgeslagen ongewijzigd blijft laden — `isDocument`
   * leert er niets over.
   */
  annex?: boolean
  updatedAt: string
}

export const MAX_COLUMNS = 3

/* ---------------------------------------------------------------- money */

/** Round to whole cents — floats must never reach a printed total. */
const cents = (n: number) => Math.round(n * 100) / 100

export type Totals = {
  subtotals: number[]
  vat: number[]
  gross: number[]
}

/**
 * VAT is charged on the subtotal, not per line — the Dutch invoice
 * convention, and the only way the printed VAT figure matches what the
 * bookkeeping computes from the same subtotal. Lines marked `included`
 * carry no price and are skipped.
 */
export function totals(doc: StudioDocument): Totals {
  const subtotals = Array.from({ length: doc.columns }, () => 0)
  for (const item of doc.items) {
    if (item.included) continue
    for (let k = 0; k < doc.columns; k++) {
      const value = item.amounts[k]
      if (typeof value === "number" && Number.isFinite(value)) {
        subtotals[k] += value
      }
    }
  }
  const rounded = subtotals.map(cents)
  const vat = rounded.map((sub) => cents((sub * doc.vatRate) / 100))
  const gross = rounded.map((sub, i) => cents(sub + vat[i]))
  return { subtotals: rounded, vat, gross }
}

// Dutch currency formatting moved to `src/lib/format.ts` when the public
// price surfaces needed it too. Re-exported here so every existing
// `import { euro } from "@/lib/documents"` keeps working.
export { euro } from "@/lib/format"

/* -------------------------------------------------------------- factory */

let counter = 0
/** Ids only need to be unique within a document, never across devices. */
export function uid(prefix = "id"): string {
  counter += 1
  return `${prefix}-${counter}-${Math.random().toString(36).slice(2, 8)}`
}

export function emptyItem(): LineItem {
  return {
    id: uid("line"),
    description: "",
    detail: "",
    included: false,
    amounts: [null, null, null],
  }
}

export function emptyBlock(): TextBlock {
  return { id: uid("block"), heading: "", body: "", callout: false }
}

/** Local-time ISO (yyyy-mm-dd) — what <input type="date"> speaks. */
export function toISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Picked date to printed date. Split by hand rather than `new Date(iso)`:
 * that parses as UTC midnight and can print the day before west of
 * Greenwich.
 */
export function isoToDutch(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return ""
  return dutchDate(new Date(y, m - 1, d))
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const next = new Date(y, m - 1, d)
  next.setDate(next.getDate() + days)
  return toISO(next)
}

/** A quote holds 30 days; an invoice is due in 14. */
export const TERM_DAYS: Record<DocKind, number> = { offerte: 30, factuur: 14 }

/** "24 augustus 2026" — the format the printed sheet uses. */
export function dutchDate(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function defaultDeadline(kind: DocKind, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + TERM_DAYS[kind])
  return dutchDate(d)
}

/**
 * Next number in the `YYYY-NNNN` series, continuing the highest number
 * already used this year so a new document never silently reuses one.
 */
export function nextNumber(existing: StudioDocument[], now = new Date()): string {
  const year = now.getFullYear()
  const highest = existing.reduce((max, doc) => {
    const match = /^(\d{4})-(\d+)$/.exec(doc.number.trim())
    if (!match || Number(match[1]) !== year) return max
    return Math.max(max, Number(match[2]))
  }, 0)
  return `${year}-${String(highest + 1).padStart(4, "0")}`
}

export function blankDocument(
  kind: DocKind,
  existing: StudioDocument[] = []
): StudioDocument {
  const now = new Date()
  const today = toISO(now)
  return {
    id: uid("doc"),
    kind,
    masthead: "logo",
    number: nextNumber(existing, now),
    date: dutchDate(now),
    dateISO: today,
    deadline: defaultDeadline(kind, now),
    deadlineISO: addDaysISO(today, TERM_DAYS[kind]),
    client: "",
    extraLabel: "",
    extraValue: "",
    title: "",
    intro: "",
    blocksBefore: [],
    blocksAfter: [],
    columns: 1,
    variantNames: ["A", "B", "C"],
    vatRate: 21,
    amountsHeading: kind === "factuur" ? "Specificatie" : "Investering",
    items: [emptyItem()],
    note: "",
    paid: false,
    updatedAt: now.toISOString(),
  }
}

/**
 * An accepted quote becomes the invoice for it: same client, same words,
 * same lines — but one price column (the variant that was accepted), a
 * fresh number, today's date and the invoice term. The quote itself is
 * left untouched, so what was offered stays on file.
 */
/**
 * A quote that starts where the enquiry left off.
 *
 * The client's name, how to reach them and what they called the project
 * are already written down; retyping them off the screen next to you is
 * the kind of work software is supposed to remove. `intakeRef` is the
 * link back, and it is what takes this enquiry off the dashboard's
 * "waiting for a quote" list the moment the draft exists.
 */
export function draftFromIntake(
  existing: StudioDocument[],
  intake: { reference: string; name: string; contact: string; project: string }
): StudioDocument {
  const base = blankDocument("offerte", existing)
  return {
    ...base,
    intakeRef: intake.reference,
    // Name on the first line, contact under it: the same shape the
    // client block is typed in by hand, so the sheet reads identically
    // whether it started here or in the form.
    client: [intake.name, intake.contact].filter(Boolean).join("\n"),
    title: intake.project,
  }
}

export function toInvoice(
  doc: StudioDocument,
  variant: number,
  existing: StudioDocument[]
): StudioDocument {
  const now = new Date()
  const today = toISO(now)
  return {
    ...doc,
    id: uid("doc"),
    kind: "factuur",
    number: nextNumber(existing, now),
    date: dutchDate(now),
    dateISO: today,
    deadline: defaultDeadline("factuur", now),
    deadlineISO: addDaysISO(today, TERM_DAYS.factuur),
    columns: 1,
    amountsHeading: "Specificatie",
    paid: false,
    items: doc.items.map((item) => ({
      ...item,
      id: uid("line"),
      amounts: [item.amounts[variant] ?? null, null, null],
    })),
    blocksBefore: doc.blocksBefore.map((b) => ({ ...b, id: uid("block") })),
    blocksAfter: doc.blocksAfter.map((b) => ({ ...b, id: uid("block") })),
    updatedAt: now.toISOString(),
  }
}

/** A copy to work from, with its own number and today's date. */
export function duplicate(
  doc: StudioDocument,
  existing: StudioDocument[]
): StudioDocument {
  const now = new Date()
  const today = toISO(now)
  return {
    ...doc,
    id: uid("doc"),
    number: nextNumber(existing, now),
    date: dutchDate(now),
    dateISO: today,
    deadline: defaultDeadline(doc.kind, now),
    deadlineISO: addDaysISO(today, TERM_DAYS[doc.kind]),
    paid: false,
    items: doc.items.map((item) => ({ ...item, id: uid("line") })),
    blocksBefore: doc.blocksBefore.map((b) => ({ ...b, id: uid("block") })),
    blocksAfter: doc.blocksAfter.map((b) => ({ ...b, id: uid("block") })),
    updatedAt: now.toISOString(),
  }
}

/**
 * Fill in fields added after a document was saved, so a document stored
 * by an older version of the panel keeps working instead of rendering
 * blanks.
 */
export function normalize(doc: StudioDocument): StudioDocument {
  const columns: ColumnCount =
    doc.columns === 2 || doc.columns === 3 ? doc.columns : 1
  return {
    ...doc,
    masthead: doc.masthead ?? "logo",
    columns,
    dateISO: doc.dateISO ?? "",
    deadlineISO: doc.deadlineISO ?? "",
    note: doc.note ?? "",
    paid: doc.paid ?? false,
    variantNames: doc.variantNames ?? ["A", "B", "C"],
  }
}

/**
 * Hoe een document heet als bestand.
 *
 * Puur, en hier omdat het uit het document volgt en niet uit de knop die
 * het aanbiedt — de builder, een bulkexport en straks een afdrukvenster
 * moeten alle drie dezelfde naam kiezen.
 *
 * De vorm volgt de conventie van de studio: `GR_O_<Klant>` voor een
 * offerte, `GR_F_<Klant>` voor een factuur, met `_Specificatie` erbij als
 * het een bijlage is. Het nummer sluit de naam af, want twee facturen aan
 * dezelfde klant zijn de regel en niet de uitzondering — zonder dat stuk
 * overschrijft de tweede download de eerste.
 *
 * `client` is meerregelig (naam, straat, plaats). Alleen de eerste regel
 * gaat mee: de rest is een adres, en een adres hoort niet in een
 * bestandsnaam die per mail rondgaat.
 */
export function documentBaseName(doc: StudioDocument): string[] {
  const who = (doc.client || "").split("\n")[0]?.trim() || "Naamloos"
  // Uit `GR-F // 2026-0908-0010` blijft `2026-0908-0010` over: de letters
  // staan al in het voorvoegsel, en de scheidingstekens zijn geen naam.
  const digits = (doc.number || "").replace(/[^0-9-]/g, "").replace(/^-+|-+$/g, "")
  return [
    "GR",
    doc.kind === "factuur" ? "F" : "O",
    who,
    doc.annex ? "Specificatie" : "",
    digits,
  ].filter(Boolean)
}

/* ---------------------------------------------------------------- guards

   Storage itself no longer lives here. Documents are kept server-side
   in the studio's Blob store and read through src/lib/document-store.ts;
   this module stayed the pure half — types, money and the shape checks
   that both ends validate against. Keeping it free of React and of
   `window` is what lets the API route import the same `isDocument` the
   panel uses, so the two can never disagree about what a document is. */

/** Structural check for anything read back from storage or a file. */
export function isDocument(value: unknown): value is StudioDocument {
  if (!value || typeof value !== "object") return false
  const d = value as Partial<StudioDocument>
  return (
    typeof d.id === "string" &&
    (d.kind === "offerte" || d.kind === "factuur") &&
    typeof d.number === "string" &&
    Array.isArray(d.items)
  )
}

/** Out of the lists, still in the archive. */
export function archive(doc: StudioDocument, now: string): StudioDocument {
  return { ...doc, archivedAt: now }
}

export function unarchive(doc: StudioDocument): StudioDocument {
  const next = { ...doc }
  delete next.archivedAt
  return next
}

/**
 * The working set: what the panel shows unless asked otherwise.
 *
 * One function rather than a filter at each call site. There are four of
 * those, and the one that forgot would put an archived invoice back in a
 * total.
 */
export function active(docs: StudioDocument[]): StudioDocument[] {
  return docs.filter((d) => !d.archivedAt)
}

/**
 * Wat geld voorstelt: alles behalve de bijlagen.
 *
 * Dezelfde reden als `active()`, één trede scherper. Een bijlage draagt de
 * bedragen van een factuur die elders is uitgeschreven; tellen wij hem
 * mee, dan staat hetzelfde bedrag twee keer in de omzet — en een omzet die
 * te hoog is, is niet zichtbaar fout. Dat is de fout waar `analytics.ts`
 * in zijn kop al voor waarschuwt: een verkeerd getal op een dashboard ziet
 * er niet verkeerd uit.
 *
 * Elk cijfer dat geld betreft loopt hierdoorheen. Een `kind === "factuur"`
 * los in een filter is daarmee een fout, en de test controleert dat.
 */
export function billable(docs: StudioDocument[]): StudioDocument[] {
  return docs.filter((d) => !d.annex)
}

/** Upsert by id, newest first. */
export function upsert(
  docs: StudioDocument[],
  doc: StudioDocument
): StudioDocument[] {
  const stamped = { ...doc, updatedAt: new Date().toISOString() }
  const rest = docs.filter((d) => d.id !== doc.id)
  return [stamped, ...rest]
}

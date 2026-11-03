import { expect, test } from "@playwright/test"

import {
  acceptedShare,
  averageQuote,
  leadTimeDays,
  moneySummary,
  paidShare,
  quotedShare,
  revenueByMonth,
} from "@/lib/analytics"
import type { StudioDocument } from "@/lib/documents"
import type { IntakeSubmission } from "@/lib/intake-archive"

// The arithmetic behind the Cijfers page, checked directly.
//
// This is the one screen in the panel where being wrong is invisible.
// A broken list shows you it is broken; a figure that is off by a third
// looks exactly like a figure that is right, and the owner would price
// work against it. So the module is pure — no React, no storage — for
// the sole purpose of being testable here rather than eyeballed there.

/** One line, one column. Amounts are in cents, as everywhere else. */
function line(amount: number) {
  return {
    id: "i1",
    description: "Werk",
    detail: "",
    included: false,
    amounts: [amount],
  }
}

function doc(over: Partial<StudioDocument> = {}): StudioDocument {
  return {
    id: "d1",
    kind: "factuur",
    number: "2026-0001",
    client: "Familie Jansen",
    title: "Voortuin",
    columns: 1,
    vatRate: 21,
    items: [line(100000)],
    blocksBefore: [],
    blocksAfter: [],
    dateISO: "2026-08-10",
    updatedAt: "2026-08-10T09:00:00.000Z",
    ...over,
  } as StudioDocument
}

function intake(over: Partial<IntakeSubmission> = {}): IntakeSubmission {
  return {
    reference: "2026-08-01-aaaaaaaaaaaa",
    receivedAt: "2026-08-01T09:00:00.000Z",
    name: "Jansen",
    contact: "jansen@example.com",
    project: "Voortuin",
    transcript: "",
    files: [],
    filesFailed: 0,
    relay: "none",
    ...over,
  } as IntakeSubmission
}

test.describe("revenue by month", () => {
  const today = new Date("2026-08-15T12:00:00.000Z")

  test("keeps the empty months instead of drawing through them", () => {
    const months = revenueByMonth([doc({ dateISO: "2026-08-03" })], 12, today)
    expect(months).toHaveLength(12)
    // A gap is a fact about the year. Dropping it would draw a
    // flattering line through the quiet months.
    expect(months.filter((m) => m.value === 0)).toHaveLength(11)
    expect(months[11].key).toBe("2026-08")
  })

  test("counts invoices only, never quotes", () => {
    const months = revenueByMonth(
      [doc({ dateISO: "2026-08-03" }), doc({ id: "d2", kind: "offerte", dateISO: "2026-08-04" })],
      12,
      today
    )
    // One document's worth, not two: a quote is not money.
    const august = months.find((m) => m.key === "2026-08")
    expect(august?.value).toBe(121000)
  })

  test("the window ends on the current month and reaches back exactly N", () => {
    const months = revenueByMonth([], 12, today)
    expect(months[0].key).toBe("2025-09")
    expect(months[11].key).toBe("2026-08")
    // Oldest first — the chart reads left to right.
    expect(months.map((m) => m.key)).toEqual([...months.map((m) => m.key)].sort())
  })
})

test.describe("average quote", () => {
  test("averages quotes, and says how many it averaged over", () => {
    const quotes = [
      doc({ id: "a", kind: "offerte" }),
      doc({ id: "b", kind: "offerte", items: [line(300000)] }),
    ] as StudioDocument[]
    const { average, count } = averageQuote(quotes)
    expect(count).toBe(2)
    expect(average).toBe(242000)
  })

  test("a zero-value draft does not drag the average down", () => {
    // An empty quote is a document someone started, not a cheap job.
    const quotes = [
      doc({ id: "a", kind: "offerte" }),
      doc({ id: "b", kind: "offerte", items: [] }),
    ] as StudioDocument[]
    expect(averageQuote(quotes)).toEqual({ average: 121000, count: 1 })
  })

  test("no quotes is zero over zero, not a division", () => {
    expect(averageQuote([])).toEqual({ average: 0, count: 0 })
    expect(Number.isNaN(averageQuote([]).average)).toBe(false)
  })
})

test.describe("the funnel", () => {
  test("an enquiry counts as answered only through intakeRef", () => {
    const s = intake()
    const answered = doc({ kind: "offerte", intakeRef: s.reference })
    expect(quotedShare([s], [answered])).toEqual({ quoted: 1, total: 1 })
    // Same client, same name, no link: not counted. Matching on names is
    // how an invoice ends up attached to the wrong household.
    expect(quotedShare([s], [doc({ kind: "offerte" })])).toEqual({
      quoted: 0,
      total: 1,
    })
  })

  test("an orphan stub is not an enquiry", () => {
    // A folder of files with no submission has no receivedAt. Counting
    // it would put a permanent unanswerable row in the denominator.
    expect(quotedShare([intake({ receivedAt: "" })], [])).toEqual({
      quoted: 0,
      total: 0,
    })
  })

  test("a quote with no enquiry behind it is in neither half", () => {
    // Excluded rather than counted as a loss: it cannot be followed, so
    // calling it "not accepted" would be inventing a fact.
    const quote = doc({ id: "q", kind: "offerte" })
    expect(acceptedShare([quote])).toEqual({ accepted: 0, total: 0 })
  })

  test("a quote counts as accepted when an invoice carries its reference", () => {
    const ref = "2026-08-01-aaaaaaaaaaaa"
    const quote = doc({ id: "q", kind: "offerte", intakeRef: ref })
    const invoice = doc({ id: "i", kind: "factuur", intakeRef: ref })
    expect(acceptedShare([quote, invoice])).toEqual({ accepted: 1, total: 1 })
  })

  test("two quotes on one enquiry are one enquiry, not two", () => {
    const ref = "2026-08-01-aaaaaaaaaaaa"
    const a = doc({ id: "q1", kind: "offerte", intakeRef: ref })
    const b = doc({ id: "q2", kind: "offerte", intakeRef: ref })
    // Deduped by reference — a revised quote must not double the total.
    expect(acceptedShare([a, b])).toEqual({ accepted: 0, total: 1 })
  })
})

test.describe("lead time", () => {
  const ref = "2026-08-01-aaaaaaaaaaaa"

  test("the median, not the mean", () => {
    // Three waits of 1, 2 and 300 days. The mean is 101; the median is
    // 2, and 2 is the honest answer about how long people usually wait.
    const submissions = [1, 2, 300].map((_, i) =>
      intake({ reference: `r${i}`, receivedAt: "2026-01-01T09:00:00.000Z" })
    )
    const quotes = [1, 2, 300].map((days, i) =>
      doc({
        id: `q${i}`,
        kind: "offerte",
        intakeRef: `r${i}`,
        dateISO: new Date(Date.UTC(2026, 0, 1 + days)).toISOString().slice(0, 10),
      })
    )
    expect(leadTimeDays(submissions, quotes)).toEqual({ median: 2, count: 3 })
  })

  test("the FIRST quote counts, not the latest revision", () => {
    const s = intake({ reference: ref, receivedAt: "2026-08-01T09:00:00.000Z" })
    const late = doc({ id: "q2", kind: "offerte", intakeRef: ref, dateISO: "2026-08-31" })
    const early = doc({ id: "q1", kind: "offerte", intakeRef: ref, dateISO: "2026-08-03" })
    // Order in the array must not change the answer.
    expect(leadTimeDays([s], [late, early]).median).toBe(2)
    expect(leadTimeDays([s], [early, late]).median).toBe(2)
  })

  test("a quote dated before its own enquiry is dropped, not folded in as zero", () => {
    const s = intake({ reference: ref, receivedAt: "2026-08-10T09:00:00.000Z" })
    const impossible = doc({ id: "q", kind: "offerte", intakeRef: ref, dateISO: "2026-08-01" })
    // A typed date, not a negative wait. Counting it as 0 would pull the
    // median toward a speed nobody achieved.
    expect(leadTimeDays([s], [impossible])).toEqual({ median: 0, count: 0 })
  })

  test("an even count averages the two middle waits", () => {
    const submissions = [0, 1].map((i) =>
      intake({ reference: `r${i}`, receivedAt: "2026-01-01T09:00:00.000Z" })
    )
    const quotes = [2, 5].map((days, i) =>
      doc({
        id: `q${i}`,
        kind: "offerte",
        intakeRef: `r${i}`,
        dateISO: new Date(Date.UTC(2026, 0, 1 + days)).toISOString().slice(0, 10),
      })
    )
    expect(leadTimeDays(submissions, quotes)).toEqual({ median: 4, count: 2 })
  })
})

test.describe("paid share", () => {
  test("counts invoices only", () => {
    const docs = [
      doc({ id: "a", paid: true }),
      doc({ id: "b", paid: false }),
      doc({ id: "c", kind: "offerte" }),
    ] as StudioDocument[]
    expect(paidShare(docs)).toEqual({ paid: 1, total: 2 })
  })

  test("no invoices is zero over zero", () => {
    expect(paidShare([doc({ kind: "offerte" })])).toEqual({ paid: 0, total: 0 })
  })
})

test.describe("a specification is not a second invoice", () => {
  // De boekhouding draait in Digiboox: dat pakket mint het factuurnummer
  // en int het geld. Wat dit paneel er dan bij levert is de uitsplitsing —
  // wat er in dat ene bedrag zit — en die draagt dus dezelfde bedragen
  // zonder dezelfde schuld.
  //
  // Precies daarom is dit de gevaarlijkste soort fout die dit bestand
  // kent: telt zo'n bijlage mee, dan staat dezelfde € 3.737,50 twee keer
  // in de jaaromzet, en een omzet die te hoog is ziet er niet verkeerd
  // uit. De kop van analytics.ts zegt het al: een verkeerd getal op een
  // dashboard is niet zichtbaar verkeerd.

  const today = new Date("2026-08-15T12:00:00.000Z")

  test("an annex carrying the same amount is not counted twice", () => {
    const invoice = doc({ id: "f1", dateISO: "2026-08-03" })
    const annex = doc({ id: "b1", dateISO: "2026-08-03", annex: true })

    const alone = revenueByMonth([invoice], 12, today)
    const withAnnex = revenueByMonth([invoice, annex], 12, today)

    const august = (points: ReturnType<typeof revenueByMonth>) =>
      points.find((p) => p.key === "2026-08")?.value

    expect(august(alone)).toBe(august(withAnnex))
  })

  test("an archive of nothing but annexes reports no revenue", () => {
    const points = revenueByMonth(
      [doc({ id: "b1", dateISO: "2026-08-03", annex: true })],
      12,
      today
    )
    expect(points.every((p) => p.value === 0)).toBe(true)
  })

  test("the average quote ignores annexes too", () => {
    // De bijlage draagt hier een ECHT bedrag, en een ander dan de offerte
    // zelf. Met nul zou hij al door de `value(d) > 0`-zeef vallen en zou
    // deze test slagen zonder de regel te raken die hij beweert te
    // bewaken — een test die niets meet is erger dan geen test.
    const real = doc({ id: "o1", kind: "offerte", items: [line(200000)] })
    const annex = doc({ id: "o2", kind: "offerte", annex: true, items: [line(600000)] })
    expect(averageQuote([real, annex])).toEqual(averageQuote([real]))
    expect(averageQuote([real, annex])).toEqual({ average: 242000, count: 1 })
  })

  test("every money filter goes through billable, none on its own", async () => {
    const { readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    const source = readFileSync(join(process.cwd(), "src/lib/analytics.ts"), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")

    // Elke selectie op soort moet óf door billable() zijn gegaan, óf zelf
    // op !d.annex controleren. Een kale `kind === "factuur"` op de rauwe
    // lijst is de manier waarop dit stilletjes terugkomt.
    for (const match of source.matchAll(/^.*kind === "(factuur|offerte)".*$/gm)) {
      const line = match[0]
      const guarded = line.includes("billable(") || line.includes("!d.annex")
      expect(guarded, `ongedekte geldselectie: ${line.trim()}`).toBe(true)
    }
  })
})

test.describe("moneySummary, the figures /os and /dashboard share", () => {
  const today = new Date("2026-09-30T12:00:00Z")

  test("sums invoices, splits owed from overdue, skips annexes", () => {
    const paid = doc({ id: "a", paid: true, dateISO: "2026-09-02", items: [line(1000)] })
    const late = doc({ id: "b", paid: false, dateISO: "2026-08-01", deadlineISO: "2026-08-15", items: [line(500)] })
    const due = doc({ id: "c", paid: false, dateISO: "2026-09-20", deadlineISO: "2026-10-04", items: [line(200)] })
    const annex = doc({ id: "d", annex: true, paid: false, dateISO: "2026-09-20", deadlineISO: "2026-08-01", items: [line(9999)] })
    const lastYear = doc({ id: "e", paid: true, dateISO: "2025-12-01", items: [line(700)] })
    const m = moneySummary([paid, late, due, annex, lastYear], today)
    expect(m.invoicedThisYear).toBe(1210 + 605 + 242)
    expect(m.invoicedThisMonth).toBe(1210 + 242)
    expect(m.owed).toBe(605 + 242)
    expect(m.overdue.map((d) => d.id)).toEqual(["b"])
    expect(m.overdue[0].daysLeft).toBe(-46)
    expect(m.unpaid.map((d) => d.id)).toEqual(["b", "c"])
    expect(m.months).toHaveLength(12)
  })

  test("a quote that became an invoice, or has lapsed, is not open", () => {
    const quoted = doc({ id: "q1", kind: "offerte", intakeRef: "r1", deadlineISO: "2026-10-20" })
    const invoiced = doc({ id: "f1", kind: "factuur", intakeRef: "r1", deadlineISO: "2026-10-20" })
    const open = doc({ id: "q2", kind: "offerte", deadlineISO: "2026-10-10" })
    const lapsed = doc({ id: "q3", kind: "offerte", deadlineISO: "2026-09-01" })
    const m = moneySummary([quoted, invoiced, open, lapsed], today)
    expect(m.openQuotes.map((d) => d.id)).toEqual(["q2"])
    expect(m.openQuotes[0].client).toBe("Familie Jansen")
  })
})

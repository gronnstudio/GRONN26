import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, PlusIcon } from "lucide-react"

import { readDocuments } from "@/lib/document-archive"
import { seasonBoard } from "@/lib/data/seasons"
import { euro } from "@/lib/format"
import { active, totals, type StudioDocument, billable} from "@/lib/documents"
import { readArchive, type IntakeSubmission } from "@/lib/intake-archive"
import {
  buttonPrimary,
  buttonSecondary,
  card,
  cardPad,
  cardTitle,
  emptyState,
  label,
  rows,
} from "@/app/dashboard/ui"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { getPanelViewer } from "@/lib/panel-viewer"
import { readDossier } from "@/lib/client-dossier"
import { ClientOverview } from "@/app/dashboard/client-overview"
import { DocumentsTable } from "./documents-table"
import { SeasonYear } from "./season-year"
import { MonthBars, Gauge, type MonthBar } from "./charts"
import { StatCard, StatusPill, delta } from "./tiles"
import { clientNav, ownerNav, ownerPhoneNav } from "./nav"
import { panelSearchItems } from "./search-items"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

// Both archives are read on every load: what is new since this morning
// is the entire reason anyone opens this page.
export const dynamic = "force-dynamic"

const DAY = 24 * 60 * 60 * 1000
const MONTH_LABELS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]

function dutchDate(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
}

/** Whole days from today to an ISO date; negative once it is past. */
function daysUntil(iso: string, today: Date): number | null {
  if (!iso) return null
  const t = new Date(`${iso}T00:00:00Z`).getTime()
  if (Number.isNaN(t)) return null
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return Math.round((t - now) / DAY)
}

/** What a document is worth. Column 0 is the single price, or variant A. */
function value(doc: StudioDocument): number {
  return totals(doc).gross[0] ?? 0
}

// One address, two dashboards.
//
// The studio gets the panel below. A client gets `ClientOverview` — a
// different, shorter set of surfaces built from their own dossier, not
// this page with things hidden. That is a security decision before it is
// a design one: styling the studio's figures out for a client would put
// every household's name and every amount into the markup of a page a
// client can open, one devtools panel away from being read. What a
// viewer may not see is not rendered.
//
// The two are told apart once, by `getPanelViewer`, and the union type
// makes it impossible to reach the owner's branch on a client session.
export default async function DashboardPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />

  if (viewer.kind === "client") {
    // Nothing owner-side is read on this path. The dossier comes back
    // through row-level security, holding the visitor's own token.
    const dossier = await readDossier()
    return (
      <DashboardShell
        user={viewer.user.email}
        groups={clientNav()}
        signOutHref="/api/clients/auth/signout"
        // The client's side is three screens and no tables. It reads
        // fine on a phone, and refusing it there was collateral damage
        // from a rule written for the studio's panel.
        phoneReady
      >
        <ClientOverview dossier={dossier} email={viewer.user.email ?? null} />
      </DashboardShell>
    )
  }

  const [intakes, archive] = await Promise.all([readArchive(), readDocuments()])
  const submissions = intakes.submissions
  const documents = active(archive.documents)
  const archived = archive.documents.filter((d) => d.archivedAt)
  const today = new Date()
  const nowMs = today.getTime()

  // The season board is a discriminated union, so the countdown is
  // resolved here once rather than narrowed again at every use.
  const board = seasonBoard(today)
  const next = (() => {
    for (const entry of board) {
      if (entry.season.status === "open") {
        return {
          service: entry.service,
          mode: "open" as const,
          days: entry.season.closesInDays,
        }
      }
    }
    let soonest: { service: (typeof board)[number]["service"]; mode: "opening"; days: number } | null =
      null
    for (const entry of board) {
      if (entry.season.status !== "opening") continue
      if (!soonest || entry.season.opensInDays < soonest.days) {
        soonest = {
          service: entry.service,
          mode: "opening",
          days: entry.season.opensInDays,
        }
      }
    }
    return soonest
  })()

  // Bijlagen dragen bedragen maar geen schuld — zie billable() in
  // lib/documents.ts. Zonder deze zeef staat hetzelfde bedrag twee keer in
  // "gefactureerd dit jaar".
  const money = billable(documents)
  const quotes = money.filter((d) => d.kind === "offerte")
  const invoices = money.filter((d) => d.kind === "factuur")
  const unpaid = invoices.filter((d) => !d.paid)

  const year = today.getUTCFullYear()
  const month = String(today.getUTCMonth() + 1).padStart(2, "0")
  const prevMonthDate = new Date(Date.UTC(year, today.getUTCMonth() - 1, 1))
  const prevMonthKey = `${prevMonthDate.getUTCFullYear()}-${String(
    prevMonthDate.getUTCMonth() + 1
  ).padStart(2, "0")}`

  // Invoiced: paid and unpaid both count — it is what the studio billed,
  // not what has landed.
  const invoicedThisYear = invoices
    .filter((d) => (d.dateISO || "").startsWith(String(year)))
    .reduce((sum, d) => sum + value(d), 0)
  const invoicedThisMonth = invoices
    .filter((d) => (d.dateISO || "").startsWith(`${year}-${month}`))
    .reduce((sum, d) => sum + value(d), 0)
  const invoicedPrevMonth = invoices
    .filter((d) => (d.dateISO || "").startsWith(prevMonthKey))
    .reduce((sum, d) => sum + value(d), 0)

  const owed = unpaid.reduce((sum, d) => sum + value(d), 0)
  const overdue = unpaid.filter((d) => {
    const days = daysUntil(d.deadlineISO, today)
    return days !== null && days < 0
  })
  const overdueTotal = overdue.reduce((sum, d) => sum + value(d), 0)

  const inWindow = (s: { receivedAt: string }, fromDaysAgo: number, toDaysAgo: number) => {
    const t = new Date(s.receivedAt).getTime()
    if (Number.isNaN(t)) return false
    return t <= nowMs - toDaysAgo * DAY && t > nowMs - fromDaysAgo * DAY
  }
  const intakesThisWeek = submissions.filter((s) => inWindow(s, 7, 0))
  const intakesLastWeek = submissions.filter((s) => inWindow(s, 14, 7))

  // The question nobody could ask before the two halves were linked.
  const answered = new Set(documents.map((d) => d.intakeRef).filter(Boolean))
  const awaitingQuote = submissions.filter(
    (s) => s.receivedAt && !answered.has(s.reference)
  )

  // Seven months back, so the chart has the reference's shape without
  // inventing a weekday rhythm a one-person studio does not have.
  const months: MonthBar[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(year, today.getUTCMonth() - (6 - i), 1))
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    return {
      key,
      label: MONTH_LABELS[d.getUTCMonth()],
      value: invoices
        .filter((doc) => (doc.dateISO || "").startsWith(key))
        .reduce((sum, doc) => sum + value(doc), 0),
    }
  })

  const paidShare = invoices.length > 0 ? invoices.filter((d) => d.paid).length / invoices.length : 0

  // Everything with a date attached, soonest first — the reference's
  // project list, filled with the only dated things this studio has.
  const dated = [...quotes, ...unpaid]
    .filter((d) => d.deadlineISO)
    .sort((a, b) => a.deadlineISO.localeCompare(b.deadlineISO))
    .slice(0, 5)

  const recent = submissions.filter((s) => s.receivedAt).slice(0, 4)

  const attentionCount = overdue.length + intakes.orphans.length
  const counts = {
    intakes: awaitingQuote.length,
    overdue: overdue.length,
    drain: intakes.deleted.length,
  }

  return (
    <DashboardShell
      user={viewer.email}
      groups={ownerNav(counts)}
      phoneGroups={ownerPhoneNav(counts)}
      // The owner on his phone, 25 Sep 2026: the overview first of all.
      // Below `xl` every row is one column, the KPI tiles go two-up from
      // `sm`, and the one table keeps its sideways scroll inside its card.
      phoneReady
      search={panelSearchItems(submissions, documents)}
      attention={
        attentionCount > 0
          ? {
              count: attentionCount,
              href: overdue.length > 0 ? "/dashboard/offertes" : "/dashboard/intakes",
              title:
                overdue.length > 0
                  ? `${overdue.length} factuur/facturen over de vervaldatum`
                  : `${intakes.orphans.length} aanvragen missen hun bestanden`,
            }
          : undefined
      }
    >
      <main className="w-full px-4 py-7 sm:px-6">
        {/* Title row */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <h1 className="font-heading text-[2rem] font-semibold leading-none tracking-tight">
              Dashboard
            </h1>
            <p className="mt-2.5 text-sm text-muted">
              Wat er binnenkwam, wat er open staat en wat er aan zit te komen.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/offertes" className={buttonPrimary}>
              <PlusIcon size={16} aria-hidden />
              Nieuwe offerte
            </Link>
            <Link href="/dashboard/intakes" className={buttonSecondary}>
              Bekijk intakes
            </Link>
          </div>
        </div>

        {intakes.status === "unavailable" && (
          <p className="mt-6 rounded-lg border border-gronn-ember bg-gronn-ember/5 p-4 text-[13px] leading-relaxed text-[color:var(--ember-text)]">
            De intake-opslag antwoordde niet. De cijfers hieronder gaan alleen
            over de administratie — dit betekent niet dat er geen aanvragen zijn.
          </p>
        )}

        {/* KPI row */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            filled
            title="Gefactureerd dit jaar"
            value={euro(invoicedThisYear)}
            href="/dashboard/offertes"
            delta={delta(invoicedThisMonth, invoicedPrevMonth)}
            note={`${invoices.length} factu${invoices.length === 1 ? "ur" : "ren"}`}
          />
          <StatCard
            title="Nog te ontvangen"
            value={euro(owed)}
            href="/dashboard/offertes"
            note={`${unpaid.length} openstaande factu${unpaid.length === 1 ? "ur" : "ren"}`}
          />
          <StatCard
            title="Over de vervaldatum"
            value={euro(overdueTotal)}
            href="/dashboard/offertes"
            note={
              overdue.length === 0
                ? "Niets te laat"
                : `${overdue.length} factu${overdue.length === 1 ? "ur" : "ren"}`
            }
          />
          <StatCard
            title="Intakes deze week"
            value={String(intakesThisWeek.length)}
            href="/dashboard/intakes"
            delta={delta(intakesThisWeek.length, intakesLastWeek.length)}
            deltaLabel="t.o.v. vorige week"
            note={
              awaitingQuote.length === 0
                ? "Niets wacht op een offerte"
                : `${awaitingQuote.length} wacht${awaitingQuote.length === 1 ? "" : "en"} op een offerte`
            }
          />
        </div>

        {/* Middle row */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr_1fr]">
          <section className={cardPad}>
            <h2 className={cardTitle}>Facturatie per maand</h2>
            <p className={cn(label, "mt-1 normal-case tracking-normal text-[11px]")}>
              De laatste zeven maanden, inclusief btw
            </p>
            <div className="mt-5">
              <MonthBars months={months} />
            </div>
          </section>

          <section className={cardPad}>
            <h2 className={cardTitle}>Eerstvolgende</h2>
            {next ? (
              <>
                <p className="mt-4 font-heading text-xl font-semibold leading-snug text-accent">
                  {next.service.title.nl}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {next.mode === "open"
                    ? `Loopt nu — nog ${next.days} dagen open.`
                    : `Opent over ${next.days} dagen.`}
                </p>
                <Link
                  href={`/services/${next.service.slug}`}
                  className={cn(buttonPrimary, "mt-5")}
                >
                  Bekijk de dienst
                  <ArrowRightIcon size={15} aria-hidden />
                </Link>
              </>
            ) : (
              <p className={cn(emptyState, "mt-4")}>
                Geen venster in zicht. De seizoensdiensten liggen tussen december
                en maart stil.
              </p>
            )}
          </section>

          <section className={card}>
            <div className="flex items-center justify-between gap-3 border-b border-line/12 px-5 py-4">
              <h2 className={cardTitle}>Loopt af</h2>
              <Link
                href="/dashboard/offertes"
                className="tap-target font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-gronn-ember"
              >
                Alles
              </Link>
            </div>
            {dated.length === 0 ? (
              <p className={cn(emptyState, "m-5")}>
                Niets met een datum eraan. Een offerte krijgt een &ldquo;geldig
                tot&rdquo;, een factuur een vervaldatum.
              </p>
            ) : (
              <ul className={cn(rows, "px-5")}>
                {dated.map((d) => {
                  const days = daysUntil(d.deadlineISO, today)
                  const late = days !== null && days < 0
                  return (
                    <li key={d.id} className="flex items-center gap-3 py-3">
                      <span
                        aria-hidden
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          late ? "bg-gronn-ember" : "bg-gronn-green"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-foreground">
                          {d.client.split("\n")[0] || d.title || d.number}
                        </span>
                        <span className="block truncate font-mono text-[10.5px] text-muted">
                          {d.number} · {dutchDate(d.deadlineISO)}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[12px] tabular-nums text-foreground">
                        {euro(value(d))}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Lower row */}
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr_1fr]">
          <section className={card}>
            <div className="flex items-center justify-between gap-3 border-b border-line/12 px-5 py-4">
              <h2 className={cardTitle}>Laatste aanvragen</h2>
              <Link
                href="/dashboard/intakes"
                className="tap-target font-mono text-[10px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-gronn-ember"
              >
                Alles
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className={cn(emptyState, "m-5")}>
                Nog geen aanvragen binnengekomen via het intakeformulier.
              </p>
            ) : (
              <ul className={cn(rows, "px-5")}>
                {recent.map((s: IntakeSubmission) => {
                  const waiting = !answered.has(s.reference)
                  return (
                    <li key={s.reference} className="flex items-center gap-3 py-3">
                      <span
                        aria-hidden
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-gronn-green/12 font-mono text-[11px] font-medium text-accent"
                      >
                        {(s.name || s.project || "?").slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-foreground">
                          {s.project || s.reference}
                        </span>
                        <span className="block truncate text-[11.5px] text-muted">
                          {s.name || "naam onbekend"} ·{" "}
                          {s.files.length === 0
                            ? "geen bestanden"
                            : `${s.files.length} bestand${s.files.length === 1 ? "" : "en"}`}
                        </span>
                      </span>
                      <StatusPill tone={waiting ? "warn" : "ok"}>
                        {waiting ? "Wacht op offerte" : "Offerte gemaakt"}
                      </StatusPill>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className={cardPad}>
            <h2 className={cardTitle}>Betaald</h2>
            <div className="mt-5">
              <Gauge
                share={paidShare}
                caption="van de facturen"
                subCaption={
                  invoices.length === 0
                    ? "Nog geen facturen om te tellen."
                    : `${invoices.filter((d) => d.paid).length} van ${invoices.length} afgevinkt als betaald.`
                }
              />
            </div>
          </section>

          {/* Where the reference has a stopwatch. This project's own rules
              forbid stating hours — the owner keeps his time registration
              elsewhere — so the dark card carries the one number that is
              genuinely counting down: the season. */}
          <section className="rounded-xl bg-gronn-green p-5 text-gronn-white">
            <h2 className="font-heading text-base font-semibold tracking-tight text-gronn-white">
              Seizoensklok
            </h2>
            {next ? (
              <>
                <p className="mt-6 font-heading text-[2.4rem] font-semibold leading-none tabular-nums text-gronn-white">
                  {next.days}
                  <span className="ml-2 text-base font-medium">dagen</span>
                </p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-gronn-white">
                  {next.mode === "open"
                    ? `tot ${next.service.title.nl.toLowerCase()} sluit`
                    : `tot ${next.service.title.nl.toLowerCase()} opent`}
                </p>
              </>
            ) : (
              <p className="mt-6 text-[13px] leading-relaxed text-gronn-white">
                Geen venster open of in aantocht.
              </p>
            )}
          </section>
        </div>

        {/* The year, as one picture. */}
        <section className={cn(cardPad, "mt-4")}>
          <h2 className={cardTitle}>Het jaar</h2>
          <p className={cn(label, "mt-1 normal-case tracking-normal text-[11px]")}>
            Waar de verkoopbare vensters vallen, en waar vandaag zit
          </p>
          <div className="mt-5">
            <SeasonYear board={board} today={today} />
          </div>
        </section>

        <div className="mt-4">
          {/* The table is the ONE place that gets the whole archive,
              archived rows included. Everywhere else on this page —
              tiles, figures, the agenda, the search — reads `documents`,
              which is `active()`, because a figure that quietly counts
              something the owner filed away is worse than no figure. */}
          <DocumentsTable documents={documents} archived={archived} />
        </div>
      </main>
    </DashboardShell>
  )
}

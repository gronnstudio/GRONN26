import "server-only"

import { moneySummary, type OpenDocument } from "@/lib/analytics"
import { readDocuments } from "@/lib/document-archive"
import { active, totals, type StudioDocument } from "@/lib/documents"
import { readArchive, type IntakeSubmission } from "@/lib/intake-archive"
import { listProjects, type AdminProjectRow } from "@/lib/project-admin"
import { serviceClient } from "@/lib/supabase"
import type { Phase } from "@/lib/werkbank"
import {
  POND_TASKS,
  PROJECTS,
  STALE_AFTER_DAYS,
  type Activity,
  type Lead,
  type NextAction,
  type OsProject,
  type Stage,
} from "@/lib/os/data"
import type { Locale } from "@/lib/i18n"
import { days, shortDate as dateIn, tr } from "@/lib/os/i18n"
import type { OsView } from "@/lib/os/view"

// The live side of /os: the studio's own records, read on gronn.studio
// only, and only after `canOpenOs()` has established the owner.
//
// Nothing here invents a figure. Where a source has no answer the view
// says so (`problems`, a null) instead of falling back to a demo number,
// because a plausible number on this screen is worse than a blank one.
//
// Sources, all of which /dashboard already reads:
//   intakes          Vercel Blob, `readArchive`
//   quotes/invoices  Vercel Blob, `readDocuments`
//   projects, hours  Supabase, service role (`project-admin.ts`)

const DAY = 86_400_000

/** Real projects with photographs and a page on the site. Always shown. */
const SITE_PROJECTS = PROJECTS

const PROJECT_STAGE: Partial<Record<Phase, Stage>> = {
  akkoord: "Approved",
  uitvoering: "Execution",
  opgeleverd: "Completed",
  onderhoud: "Completed",
}

const LEAD_STAGE: Partial<Record<Phase, Lead["stage"]>> = {
  aanvraag: "New lead",
  intake: "Intake",
  offerte: "Quotation",
}

const daysSince = (iso: string | undefined | null, now: number) => {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : Math.max(0, Math.floor((now - t) / DAY))
}


const docValue = (d: StudioDocument) => totals(d).gross[0] ?? 0

/** Minutes typed into the hours register this month, as hours. */
async function hoursThisMonth(today: Date): Promise<number | null> {
  const db = serviceClient()
  if (!db) return null
  const first = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`
  const { data, error } = await db.from("hours").select("minutes").gte("worked_on", first)
  if (error) return null
  const minutes = (data as { minutes: number }[]).reduce((s, r) => s + r.minutes, 0)
  return Math.round(minutes / 6) / 10
}

function projectFromRow(row: AdminProjectRow & { client_name: string | null }): OsProject {
  const stage = PROJECT_STAGE[row.phase] ?? "Planning"
  return {
    slug: row.id,
    name: row.client_name ?? row.name,
    kind: row.name,
    stage,
    status: row.phase === "onderhoud" ? "Maintenance" : stage,
    progress: null,
    value: row.value_cents !== null ? row.value_cents / 100 : null,
    hours: null,
    health: stage === "Completed" ? "done" : "healthy",
    note: row.next_action ?? "No next step recorded.",
  }
}

/**
 * The pipeline, from three places, each lead once:
 *   1. Supabase projects still in a sales phase (the richest record);
 *   2. enquiries with no project yet, moved along by their own quote
 *      and invoice (linked through `intakeRef`, never by name);
 *   3. quotes that answer no enquiry.
 */
function buildLeads(
  rows: (AdminProjectRow & { client_name: string | null })[],
  submissions: IntakeSubmission[],
  documents: StudioDocument[],
  quotes: OpenDocument[],
  now: number,
  locale: Locale
): Lead[] {
  const leads: Lead[] = []
  const covered = new Set<string>()

  for (const row of rows) {
    const stage = LEAD_STAGE[row.phase]
    if (!stage || row.archived_at) continue
    if (row.intake_ref) covered.add(row.intake_ref)
    leads.push({
      id: `p-${row.id}`,
      name: row.client_name ?? row.name,
      kind: row.name,
      place: row.address?.split(",").pop()?.trim() || "—",
      stage,
      value: (row.value_cents ?? 0) / 100,
      probability: row.chance,
      lastContactDays: daysSince(row.created_at, now),
      next: row.next_action ?? "—",
    })
  }

  for (const s of submissions) {
    if (!s.receivedAt || covered.has(s.reference) || s.projectId) continue
    const mine = documents.filter((d) => d.intakeRef === s.reference && !d.annex)
    const invoice = mine.find((d) => d.kind === "factuur")
    const quote = mine.find((d) => d.kind === "offerte")
    // A won lead leaves the board 90 days after its invoice.
    if (invoice && daysSince(invoice.dateISO || invoice.updatedAt, now) > 90) continue
    const lastIso = invoice?.dateISO || quote?.dateISO || quote?.updatedAt || s.receivedAt
    leads.push({
      id: `i-${s.id ?? s.reference}`,
      name: s.project || s.name,
      kind: "Enquiry",
      place: "—",
      stage: invoice ? "Won" : quote ? "Quotation" : "New lead",
      value: invoice ? docValue(invoice) : quote ? docValue(quote) : 0,
      probability: invoice ? 100 : null,
      lastContactDays: daysSince(lastIso, now),
      next: invoice ? "Invoiced" : quote ? "Wait for the decision" : "Write the quote",
      href: "/dashboard/intakes",
    })
    covered.add(s.reference)
  }

  for (const q of quotes) {
    if (q.intakeRef) continue
    leads.push({
      id: `q-${q.id}`,
      name: q.client || q.title || q.number,
      kind: q.title || "Quotation",
      place: "—",
      stage: "Quotation",
      value: q.value,
      probability: null,
      lastContactDays: daysSince(documents.find((d) => d.id === q.id)?.dateISO, now),
      next: q.deadlineISO
        ? tr(locale, `Valid until ${dateIn(locale, q.deadlineISO)}`, `Geldig tot ${dateIn(locale, q.deadlineISO)}`)
        : "Wait for the decision",
      href: "/dashboard/offertes",
    })
  }
  return leads
}

export async function liveView(today: Date, locale: Locale): Promise<OsView> {
  const t = (en: string, nl: string) => tr(locale, en, nl)
  const now = today.getTime()
  const [intakes, archive, rows, hours] = await Promise.all([
    readArchive(),
    readDocuments(),
    listProjects(),
    hoursThisMonth(today),
  ])
  const problems: string[] = []
  if (intakes.status !== "ok") problems.push(t("The intake archive did not answer.", "Het intake-archief gaf geen antwoord."))
  if (archive.status !== "ok")
    problems.push(t("The quote and invoice archive did not answer.", "Het archief met offertes en facturen gaf geen antwoord."))
  if (rows === null) problems.push(t("The project database did not answer.", "De projectdatabase gaf geen antwoord."))

  const submissions = intakes.submissions
  const documents = active(archive.documents)
  const money = moneySummary(documents, today)

  // Projects: the two real site projects, then every Supabase project past
  // the sales phases. A database row for the pond or the terrace is the
  // same project, so the site's richer record wins.
  const siteNames = SITE_PROJECTS.map((p) => p.name.toLowerCase())
  const dbProjects = (rows ?? [])
    .filter((r) => !r.archived_at && PROJECT_STAGE[r.phase])
    .map(projectFromRow)
    .filter((p) => !siteNames.some((n) => p.name.toLowerCase().includes(n)))
  const projects = [...SITE_PROJECTS, ...dbProjects]

  const leads = buildLeads(rows ?? [], submissions, documents, money.openQuotes, now, locale)
  const open = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost")
  const stale = open.filter((l) => l.lastContactDays >= STALE_AFTER_DAYS)

  const answered = new Set(documents.map((d) => d.intakeRef).filter(Boolean))
  const awaitingQuote = submissions
    .filter((s) => s.receivedAt && !answered.has(s.reference))
    .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
  const newThisWeek = submissions.filter((s) => s.receivedAt && now - new Date(s.receivedAt).getTime() < 7 * DAY)
  const lapsing = money.openQuotes.filter((q) => q.daysLeft !== null && q.daysLeft <= 7)

  // The one sentence at the top: the most pressing thing, or nothing.
  const firstOverdue = money.overdue[0]
  const oldestWaiting = awaitingQuote[0]
  const insight = firstOverdue
    ? {
        text: t(
          `Invoice ${firstOverdue.number}${firstOverdue.client ? ` for ${firstOverdue.client}` : ""} is ${days(locale, -firstOverdue.daysLeft!)} overdue.`,
          `Factuur ${firstOverdue.number}${firstOverdue.client ? ` voor ${firstOverdue.client}` : ""} is ${days(locale, -firstOverdue.daysLeft!)} over de vervaldatum.`
        ),
        action: t("Open invoices", "Facturen openen"),
        href: "/os/finance#unpaid",
      }
    : oldestWaiting && daysSince(oldestWaiting.receivedAt, now) >= STALE_AFTER_DAYS
      ? {
          text: t(
            `${oldestWaiting.project || oldestWaiting.name}'s enquiry has waited ${days(locale, daysSince(oldestWaiting.receivedAt, now))} for a quote.`,
            `De aanvraag ${oldestWaiting.project || oldestWaiting.name} wacht al ${days(locale, daysSince(oldestWaiting.receivedAt, now))} op een offerte.`
          ),
          action: t("Open intakes", "Intakes openen"),
          href: "/dashboard/intakes",
        }
      : stale[0]
        ? {
            text: t(
              `${stale[0].name} has had no activity for ${days(locale, stale[0].lastContactDays)}.`,
              `${stale[0].name} heeft al ${days(locale, stale[0].lastContactDays)} geen activiteit.`
            ),
            action: t("Open pipeline", "Pijplijn openen"),
            href: "/os/pipeline#stale",
          }
        : {
            text: t(
              "Nothing is waiting on you. No overdue invoices, no enquiries left unanswered.",
              "Er wacht niets op je. Geen verlopen facturen, geen onbeantwoorde aanvragen."
            ),
          }

  const deadlines = [...money.unpaid, ...money.openQuotes]
    .filter((d) => d.deadlineISO && d.daysLeft !== null && d.daysLeft >= 0)
    .sort((a, b) => a.deadlineISO.localeCompare(b.deadlineISO))
    .slice(0, 4)
    .map((d) => ({
      time: d.daysLeft === 0 ? t("Today", "Vandaag") : dateIn(locale, d.deadlineISO),
      what:
        (d.kind === "factuur"
          ? t(`Invoice ${d.number} due`, `Factuur ${d.number} vervalt`)
          : t(`Quote ${d.number} lapses`, `Offerte ${d.number} verloopt`)) + (d.client ? ` · ${d.client}` : ""),
      href: "/os/finance",
    }))

  const nextActions: NextAction[] = [
    ...money.overdue.slice(0, 2).map((d) => ({
      what: t(`Chase invoice ${d.number}`, `Factuur ${d.number} navragen`),
      project: d.client || d.title,
      href: "/os/finance#unpaid",
    })),
    ...awaitingQuote.slice(0, 2).map((s) => ({
      what: "Write the quote",
      project: s.project || s.name,
      href: "/dashboard/intakes",
    })),
    ...POND_TASKS.filter((t) => !t.done)
      .slice(0, 3)
      .map((t) => ({ what: t.what, project: "Vijverklant", href: "/os/projects/vijverklant#tasks" })),
  ].slice(0, 5)

  const activity: Activity[] = [
    ...submissions
      .filter((s) => s.receivedAt)
      .map((s) => ({ at: s.receivedAt, what: "Enquiry received", project: s.project || s.name })),
    ...documents.map((d) => ({
      at: d.updatedAt,
      what: d.kind === "factuur" ? t(`Invoice ${d.number} saved`, `Factuur ${d.number} opgeslagen`) : t(`Quote ${d.number} saved`, `Offerte ${d.number} opgeslagen`),
      project: (d.client.split("\n")[0] || "").trim() || undefined,
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5)
    .map((a) => ({
      time:
        new Date(a.at).toDateString() === today.toDateString()
          ? new Date(a.at).toLocaleTimeString(locale === "nl" ? "nl-NL" : "en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })
          : dateIn(locale, a.at),
      what: a.what,
      project: a.project,
    }))

  return {
    mode: "live",
    projects,
    leads,
    telemetry: {
      activeProjects: projects.filter((p) => p.stage !== "Completed" && p.stage !== "Archived").length,
      leads: open.length,
      pipeline: open.reduce((s, l) => s + l.value, 0),
      hoursThisMonth: hours,
    },
    today: {
      counts: [
        {
          label: newThisWeek.length === 1 ? t("new enquiry this week", "nieuwe aanvraag deze week") : t("new enquiries this week", "nieuwe aanvragen deze week"),
          n: newThisWeek.length,
          href: "/dashboard/intakes",
        },
        { label: t("waiting for a quote", "wacht op een offerte"), n: awaitingQuote.length, href: "/dashboard/intakes" },
        {
          label: money.overdue.length === 1 ? t("invoice overdue", "factuur verlopen") : t("invoices overdue", "facturen verlopen"),
          n: money.overdue.length,
          href: "/os/finance#unpaid",
        },
        {
          label: lapsing.length === 1 ? t("quote lapses this week", "offerte verloopt deze week") : t("quotes lapse this week", "offertes verlopen deze week"),
          n: lapsing.length,
          href: "/os/finance#quotes",
        },
      ],
      schedule: deadlines,
      insight,
    },
    activity,
    nextActions,
    finance: money,
    problems,
  }
}

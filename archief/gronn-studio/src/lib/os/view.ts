import type { MoneySummary } from "@/lib/analytics"
import type { Locale } from "@/lib/i18n"
import { tr } from "@/lib/os/i18n"
import {
  POND_TASKS,
  PROJECTS,
  type Activity,
  type Briefing,
  type Lead,
  type NextAction,
  type OsProject,
  type Telemetry,
} from "@/lib/os/data"

// Everything an /os screen shows, in one shape, from one of two places.
//
// - "live": gronn.studio, behind the owner's sign-in. Read from the same
//   archives /dashboard reads (intakes, quotes, invoices) and from
//   Supabase (projects, hours). See `live.ts`.
// - "preview": Vercel previews and local development. They open without
//   a sign-in (docs/gronn-os D-03), so they never read the books. They
//   show the real site projects and nothing else: no example figures
//   (owner, 30 Sep 2026: "only real data"). The empty parts say where the
//   real figures are.
//
// The screens only ever read an `OsView`.

export type OsView = {
  mode: "live" | "preview"
  projects: OsProject[]
  leads: Lead[]
  telemetry: Telemetry
  today: Briefing
  activity: Activity[]
  nextActions: NextAction[]
  finance: MoneySummary
  /** Sources that did not answer, in words, shown rather than hidden. */
  problems: string[]
}

const EMPTY_MONEY: MoneySummary = {
  invoicedThisYear: 0,
  invoicedThisMonth: 0,
  owed: 0,
  overdue: [],
  overdueTotal: 0,
  unpaid: [],
  openQuotes: [],
  months: [],
}

export function previewView(locale: Locale): OsView {
  const nextActions: NextAction[] = POND_TASKS.filter((t) => !t.done)
    .slice(0, 5)
    .map((t) => ({ what: t.what, project: "Vijverklant", href: "/os/projects/vijverklant#tasks" }))
  return {
    mode: "preview",
    projects: PROJECTS,
    leads: [],
    telemetry: {
      activeProjects: PROJECTS.filter((p) => p.stage !== "Completed" && p.stage !== "Archived").length,
      leads: 0,
      pipeline: 0,
      hoursThisMonth: null,
    },
    today: {
      counts: [],
      schedule: [],
      insight: {
        text: tr(
          locale,
          "This preview cannot read the books. Enquiries, quotes, invoices and hours appear on gronn.studio/os once you are signed in.",
          "Deze preview kan de boekhouding niet lezen. Aanvragen, offertes, facturen en uren verschijnen op gronn.studio/os zodra je bent ingelogd."
        ),
        action: tr(locale, "Open gronn.studio/os", "gronn.studio/os openen"),
        href: "https://gronn.studio/os",
      },
    },
    activity: [],
    nextActions,
    finance: EMPTY_MONEY,
    problems: [],
  }
}

import type { Metadata } from "next"

import { redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { readDocuments } from "@/lib/document-archive"
import { readArchive } from "@/lib/intake-archive"
import { SEASON_WINDOWS } from "@/lib/data/seasons"
import { SERVICES } from "@/lib/data/services"
import { euro } from "@/lib/format"
import { active, totals } from "@/lib/documents"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { panelSearchItems } from "../search-items"
import { ownerNav, ownerPhoneNav } from "../nav"
import { MonthGrid, type AgendaMark, type AgendaWindow } from "./month-grid"

export const metadata: Metadata = {
  title: "Agenda",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// The calendar the business actually runs on.
//
// Every date here already existed and none of them were visible in one
// place: the season windows come from the Verdienmodellen document via
// `seasons.ts`, the "geldig tot" from a quote and the due date from an
// invoice. A studio whose leaf-net season is worthless by mid-November
// needs to see that as a shape, not as a list sorted by number.
export default async function AgendaPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  // A signed-in client has a dashboard of their own. Showing them the
  // gate here would ask them to log in while they already are, and this
  // surface holds every household's work, not just theirs.
  if (viewer.kind === "client") redirect("/dashboard")

  const [intakes, archive] = await Promise.all([readArchive(), readDocuments()])
  const documents = active(archive.documents)

  // Midnight today in UTC, as the grid's single source of "now" — passed
  // down rather than read in the client, so the server render and the
  // first client paint cannot disagree about which square is today.
  const now = new Date()
  const todayISO = now.toISOString().slice(0, 10)

  const windows: AgendaWindow[] = Object.entries(SEASON_WINDOWS)
    .map(([slug, w]) => {
      const service = SERVICES.find((s) => s.slug === slug)
      return service ? { slug, title: service.title.nl, from: w.from, to: w.to } : null
    })
    .filter((w): w is AgendaWindow => w !== null)

  const marks: AgendaMark[] = documents
    .filter((d) => d.deadlineISO)
    .map((d) => {
      const late =
        d.deadlineISO < todayISO && !(d.kind === "factuur" && d.paid)
      return {
        date: d.deadlineISO,
        kind: d.kind === "factuur" ? ("invoice" as const) : ("quote" as const),
        label: d.client.split("\n")[0] || d.title || d.number,
        sub: `${d.number} · ${euro(totals(d).gross[0] ?? 0)}`,
        href: "/dashboard/offertes",
        late,
      }
    })

  // Intakes are marked on the day they arrived: it is the one date that
  // says how long an enquiry has been sitting unanswered.
  for (const s of intakes.submissions) {
    if (!s.receivedAt) continue
    marks.push({
      date: s.receivedAt.slice(0, 10),
      kind: "intake",
      label: s.project || s.reference,
      sub: s.name || "naam onbekend",
      href: "/dashboard/intakes",
    })
  }

  return (
    <DashboardShell
      user={viewer.email}
      groups={ownerNav({ drain: intakes.deleted.length })}
      phoneGroups={ownerPhoneNav({ drain: intakes.deleted.length })}
      // Phone-ready since 25 Sep 2026. The month and the chosen day stack
      // below `xl`; the seven-column grid keeps squares of 30px and more
      // down to a 320px screen.
      phoneReady
      search={panelSearchItems(intakes.submissions, documents)}
    >
      <main className="w-full px-4 py-7 sm:px-6">
        <h1 className="font-heading text-[2rem] font-semibold leading-none tracking-tight">
          Agenda
        </h1>
        <p className="mt-2.5 text-sm text-muted">
          Wanneer de vensters open staan, en wat er afloopt.
        </p>

        <div className="mt-7">
          <MonthGrid marks={marks} windows={windows} todayISO={todayISO} />
        </div>
      </main>
    </DashboardShell>
  )
}

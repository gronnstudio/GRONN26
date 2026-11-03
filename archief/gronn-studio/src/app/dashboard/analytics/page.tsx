import type { Metadata } from "next"

import { redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { readDocuments } from "@/lib/document-archive"
import { readArchive } from "@/lib/intake-archive"
import { active } from "@/lib/documents"
import { euro } from "@/lib/format"
import {
  acceptedShare,
  averageQuote,
  leadTimeDays,
  paidShare,
  quotedShare,
  revenueByMonth,
} from "@/lib/analytics"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { card, cardPad, cardTitle, emptyState, label } from "@/app/dashboard/ui"
import { panelSearchItems } from "../search-items"
import { ownerNav, ownerPhoneNav } from "../nav"
import { MonthBars, Gauge } from "../charts"
import { StatCard } from "../tiles"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Cijfers",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// The questions the administration can honestly answer.
//
// Every figure here is computed in `src/lib/analytics.ts`, which is pure
// and directly tested — a wrong number on a dashboard is not visibly
// wrong, and this is the one screen where that matters most.
//
// What is absent is stated on the page rather than quietly left out. See
// the note at the foot: revenue per service would be the most useful
// number here and cannot be computed, because a document carries free
// text and no service slug.
export default async function AnalyticsPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  // A signed-in client has a dossier of their own. These are the
  // studio's figures over every household, which is the one thing this
  // surface must never show to one of them.
  if (viewer.kind === "client") redirect("/dashboard")

  const [intakes, archive] = await Promise.all([readArchive(), readDocuments()])
  // `active()`, not the raw list: a figure that quietly counts an
  // invoice the owner filed away is worse than no figure. The whole
  // point of this page is that its numbers can be trusted.
  const documents = active(archive.documents)
  const submissions = intakes.submissions
  const today = new Date()

  const months = revenueByMonth(documents, 12, today)
  const quoted = quotedShare(submissions, documents)
  const accepted = acceptedShare(documents)
  const lead = leadTimeDays(submissions, documents)
  const paid = paidShare(documents)
  const avg = averageQuote(documents)

  const yearTotal = months.reduce((n, m) => n + m.value, 0)

  return (
    <DashboardShell
      user={viewer.email}
      groups={ownerNav({ drain: intakes.deleted.length })}
      phoneGroups={ownerPhoneNav({ drain: intakes.deleted.length })}
      // Phone-ready since 25 Sep 2026 (the owner: the dashboard on his
      // phone, not a notice). One column below `xl`, tiles two-up from
      // `sm`, and the twelve bars tighten their gaps so each keeps a
      // readable month label at 320px.
      phoneReady
      search={panelSearchItems(submissions, documents)}
    >
      <main className="w-full px-4 py-7 sm:px-6">
        <h1 className="font-heading text-[2rem] font-semibold leading-none tracking-tight">
          Cijfers
        </h1>
        <p className="mt-2.5 text-sm text-muted">
          Wat er binnenkwam, hoe lang het duurde, en wat ervan doorging.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            filled
            title="Gefactureerd, 12 maanden"
            value={euro(yearTotal)}
            note={`over ${documents.filter((d) => d.kind === "factuur").length} facturen`}
          />
          <StatCard
            title="Gemiddelde offerte"
            value={avg.count > 0 ? euro(avg.average) : "—"}
            note={
              avg.count > 0
                ? `over ${avg.count} offerte${avg.count === 1 ? "" : "s"}`
                : "nog geen offerte met een bedrag"
            }
          />
          <StatCard
            title="Wachttijd op een offerte"
            value={lead.count > 0 ? `${lead.median} dagen` : "—"}
            note={
              lead.count > 0
                ? `mediaan over ${lead.count} aanvra${lead.count === 1 ? "ag" : "gen"}`
                : "nog geen aanvraag met een offerte erop"
            }
          />
          <StatCard
            title="Aanvragen beantwoord"
            value={quoted.total > 0 ? `${quoted.quoted} van ${quoted.total}` : "—"}
            note={
              quoted.total === 0
                ? "nog geen aanvragen"
                : quoted.quoted === quoted.total
                  ? "alles heeft een offerte"
                  : `${quoted.total - quoted.quoted} wacht nog`
            }
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr_1fr]">
          <section className={cardPad}>
            <h2 className={cardTitle}>Twaalf maanden</h2>
            <p className={cn(label, "mt-1 text-[11px] normal-case tracking-normal")}>
              Gefactureerd per maand, inclusief btw. Gearceerd is een maand
              zonder facturen — geen ontbrekende meting.
            </p>
            <div className="mt-5">
              <MonthBars months={months} />
            </div>
          </section>

          <section className={cardPad}>
            <h2 className={cardTitle}>Offertes doorgegaan</h2>
            <div className="mt-5">
              <Gauge
                share={accepted.total > 0 ? accepted.accepted / accepted.total : 0}
                caption="werd een factuur"
                subCaption={
                  accepted.total === 0
                    ? "Nog geen offerte die aan een aanvraag hangt."
                    : `${accepted.accepted} van ${accepted.total} offertes met een aanvraag erachter.`
                }
              />
            </div>
          </section>

          <section className={cardPad}>
            <h2 className={cardTitle}>Betaald</h2>
            <div className="mt-5">
              <Gauge
                share={paid.total > 0 ? paid.paid / paid.total : 0}
                caption="van de facturen"
                subCaption={
                  paid.total === 0
                    ? "Nog geen facturen om te tellen."
                    : `${paid.paid} van ${paid.total} afgevinkt als betaald.`
                }
              />
            </div>
          </section>
        </div>

        {/* What this page cannot tell you, said out loud. */}
        <section className={cn(card, "mt-4 p-5")}>
          <h2 className={cardTitle}>Wat hier niet staat</h2>
          <p className="mt-2.5 max-w-[75ch] text-[13px] leading-relaxed text-muted">
            <strong className="font-medium text-foreground">
              Omzet per dienst
            </strong>{" "}
            zou het nuttigste getal van deze pagina zijn — het is het enige dat
            zegt waar het geld vandaan komt. Het kan niet berekend worden: een
            offerte of factuur bestaat uit regels met vrije tekst en draagt
            nergens welke dienst hij beantwoordt. Matchen op woorden tegen de
            dienstentitels zou een grafiek opleveren die gezaghebbend oogt en
            rekenkunde op een toevalligheid is.
          </p>
          <p className="mt-3 max-w-[75ch] text-[13px] leading-relaxed text-muted">
            Het wordt mogelijk zodra een document weet welke dienst eronder zit.
            Tot die tijd staat het er niet, in plaats van er aannemelijk te
            staan.
          </p>
          <p className={cn(emptyState, "mt-4")}>
            Twee cijfers hierboven leunen op de koppeling tussen een aanvraag en
            de offerte die eruit volgde. Een offerte die je zelf hebt ingetikt
            zonder vanuit de intake te beginnen, telt daar niet in mee — dat is
            geen fout in het cijfer maar de grens ervan.
          </p>
        </section>
      </main>
    </DashboardShell>
  )
}

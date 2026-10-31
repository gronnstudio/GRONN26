import type { Metadata } from "next"
import Link from "next/link"

import { getPanelViewer } from "@/lib/panel-viewer"
import { LanguageProvider } from "@/components/language-provider"
import { DeepIntake } from "@/components/intake/deep-intake"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { clientNav, ownerNav, ownerPhoneNav } from "../../nav"

export const metadata: Metadata = {
  title: "Nieuwe intake",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// The intake sheet, filled in by the studio.
//
// Until now an intake could only enter the archive one way: a visitor
// submitting the public form. Everything the studio learned on the phone
// had to be retyped into it afterwards, or kept somewhere else entirely.
// This is the same questionnaire — the same 36 questions, the same photo
// trays, the same `lib/data/intake.ts` — mounted for someone who is
// already signed in.
//
// The `LanguageProvider` wrap is not decoration. `/dashboard` has no
// layout of its own, so it inherits the root one, whose provider carries
// no locale and therefore defaults to English. Without this the sheet
// would render in English inside a panel whose every other word is
// Dutch — and worse, `transcript()` depends on `t`, so the ARCHIVED text
// would have been English too, sitting beside Dutch submissions in the
// same list.
export default async function NewIntakePage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />

  const studio = viewer.kind === "owner"

  return (
    <DashboardShell
      user={studio ? viewer.email : viewer.user.email}
      groups={studio ? ownerNav() : clientNav()}
      // Two separate strips, never one list with things removed: the
      // owner's full panel, or the client's own two screens (nav.ts).
      phoneGroups={studio ? ownerPhoneNav() : undefined}
      signOutHref={studio ? undefined : "/api/clients/auth/signout"}
      // The intake itself was made to work on a phone in #121 — 16px
      // fields, draggable sliders, reachable buttons. Then the long
      // sheet moved behind the dashboard, and the dashboard refused
      // below 1024px, so the one thing a client most wants to do on a
      // phone became the one thing they could not.
      //
      // For the studio it was kept a large-screen tool ("typed with a
      // client on the phone, at a desk") until 25 Sep 2026, when the
      // owner asked for the whole dashboard on his phone. The sheet's own
      // intro already says "aan de telefoon of op locatie" — on location
      // is exactly where a desk is not.
      phoneReady
    >
      <div className="doc-chrome border-b border-line/15 px-4 py-4 sm:px-6">
        <Link
          href={studio ? "/dashboard/intakes" : "/dashboard"}
          className="tap-target font-mono text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
        >
          {studio ? "‹ Alle aanvragen" : "‹ Mijn dossier"}
        </Link>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted">
          {studio
            ? "Dezelfde intake als op de site, maar door jou ingevuld — aan de telefoon of op locatie. Hij komt in hetzelfde archief terecht als een binnengekomen aanvraag. Er gaat geen mail uit: je bent zelf degene die hem invult."
            : "Vertel ons over je tuin, vijver of terrein. Je kunt tussendoor stoppen — wat je invult blijft in deze browser bewaard tot je verstuurt."}
        </p>
      </div>
      <LanguageProvider locale="nl">
        {/* Who is typing decides whether a bell rings. The studio filling
            this in for somebody needs no notification — it would be
            e-mailing itself about its own typing. A CLIENT filling it in
            is exactly the case the doorbell exists for, so they take the
            visitor path, which archives and then announces. */}
        <DeepIntake mode={studio ? "studio" : "visitor"} />
      </LanguageProvider>
    </DashboardShell>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { ClientOverview } from "@/app/dashboard/client-overview"
import { clientNav } from "@/app/dashboard/nav"
import type { Dossier } from "@/lib/client-dossier"

export const metadata: Metadata = {
  title: "Dossier preview",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// The client's own dashboard, on a bench — so that a phone can finally
// be pointed at it.
//
// WHY THIS EXISTS. The rule that the panel needs a large screen is the
// STUDIO's rule; a signed-in client has always been meant to reach their
// dossier on a phone. Nobody had ever checked. The test that claimed to
// (`mobile-reach.spec.ts`) visits /dashboard SIGNED OUT, which renders
// `PanelGate` — a screen that never carried the large-screen notice,
// before or after the change it was written for. Its own comment admits
// as much.
//
// CI has no Supabase and no client session, so the real page cannot be
// driven there. Same shape of problem as the printed sheet, and the same
// answer the repo already uses twice: a local-only workbench rendering
// the REAL components with invented data.
//
// `process.env.VERCEL` is set on every Vercel build and runtime, and
// cannot be unset from project settings, so this page cannot exist in
// the deployed application. It holds no session check because it reaches
// nothing that needs one — the dossier below is a literal, and no route,
// archive or database is touched.
//
// The figures are deliberately not round: a household with one running
// garden and one finished one, an active subscription and a paused one,
// is where the tiles, the status pills and the two lists all have
// something to say at once.
const DOSSIER: Dossier = {
  client: {
    id: "preview-client",
    name: "Familie Voorbeeld",
    email: "preview@local",
    phone: null,
    activated_at: "2026-03-02",
  },
  projects: [
    {
      id: "p1",
      name: "Achtertuin met vijver",
      address: "Voorbeeldstraat 12, Nijmegen",
      created_at: "2026-03-14",
      archived_at: null,
    },
    {
      id: "p2",
      name: "Voortuin, beplantingsplan",
      address: null,
      created_at: "2025-09-01",
      archived_at: "2026-01-20",
    },
  ],
  subscriptions: [
    {
      id: "s1",
      project_id: "p1",
      service_slug: "maintenance-subscription",
      status: "active",
      started_at: "2026-04-01",
      renews_at: "2027-04-01",
      ended_at: null,
    },
    {
      id: "s2",
      project_id: "p1",
      service_slug: "pond-autumn-service",
      status: "paused",
      started_at: "2025-10-01",
      renews_at: null,
      ended_at: null,
    },
  ],
  status: "ok",
  unlinked: false,
}

export default function DossierPreviewPage() {
  if (process.env.VERCEL) notFound()
  return (
    <DashboardShell
      user={DOSSIER.client?.email}
      groups={clientNav()}
      signOutHref="/api/clients/auth/signout"
      phoneReady
    >
      <ClientOverview dossier={DOSSIER} email={DOSSIER.client?.email ?? null} />
    </DashboardShell>
  )
}

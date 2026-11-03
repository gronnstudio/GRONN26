import type { Metadata } from "next"

import { redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { studioIban } from "@/lib/business-private"
import { readDocuments } from "@/lib/document-archive"
import { active } from "@/lib/documents"
import { readArchive } from "@/lib/intake-archive"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { ownerNav, ownerPhoneNav } from "../nav"
import { panelSearchItems } from "../search-items"
import { DocumentBuilder } from "../document-builder"

export const metadata: Metadata = {
  title: "Offertes & facturen",
  robots: { index: false, follow: false },
}

// Reads both archives to fill the top-bar search, so it must not be
// prerendered — the same reason the other panel pages carry this.
export const dynamic = "force-dynamic"

// The administration itself. It used to live at /admin, which is now the
// overview — the dashboard needed a front door, and a tool this wide is
// not one. The tab row carries anyone who typed the old address.
export default async function OffertesPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  // A signed-in client has a dashboard of their own. Showing them the
  // gate here would ask them to log in while they already are, and this
  // surface holds every household's work, not just theirs.
  if (viewer.kind === "client") redirect("/dashboard")
  const [archive, intakes] = await Promise.all([readDocuments(), readArchive()])
  // The account number is read HERE, on the server, after the session
  // check — so it travels only in an authenticated response and never in
  // a JavaScript chunk anyone can request. See lib/business-private.
  return (
    <DashboardShell
      user={viewer.email}
      groups={ownerNav({ drain: intakes.deleted.length })}
      phoneGroups={ownerPhoneNav({ drain: intakes.deleted.length })}
      // The builder on a phone, since 25 Sep 2026 — the one surface the
      // owner named first. It was already one column below `lg` (the
      // form, then the A4 sheet scaled to the width); what stood in the
      // way was the wall, a toolbar that stuck under the phone strip, and
      // fields that made iOS zoom. See document-builder.tsx and
      // document-toolbar/. Three price columns side by side are roomier on
      // a laptop, but they work here too, so no notice is needed.
      phoneReady
      search={panelSearchItems(intakes.submissions, active(archive.documents))}
    >
      <DocumentBuilder iban={studioIban()} />
    </DashboardShell>
  )
}

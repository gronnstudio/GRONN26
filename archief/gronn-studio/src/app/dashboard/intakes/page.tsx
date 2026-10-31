import type { Metadata } from "next"

import { redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { readArchive } from "@/lib/intake-archive"
import { readDocuments } from "@/lib/document-archive"
import { active } from "@/lib/documents"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { ownerNav, ownerPhoneNav } from "../nav"
import { panelSearchItems } from "../search-items"
import { IntakeWorkspace } from "./intake-workspace"

export const metadata: Metadata = {
  title: "Intakes",
  robots: { index: false, follow: false },
}

// Always read fresh: an enquiry that arrived a minute ago is the whole
// reason anyone opens this page.
export const dynamic = "force-dynamic"

// The archive of submitted intakes, behind the same Google sign-on as
// the rest of the owner panel. The session check is server-side, so an
// unauthenticated request never receives a client's answers at all —
// not the markup, not the file list, nothing.
export default async function IntakesPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  // A signed-in client has a dashboard of their own. Showing them the
  // gate here would ask them to log in while they already are, and this
  // surface holds every household's work, not just theirs.
  if (viewer.kind === "client") redirect("/dashboard")
  const [archive, documents] = await Promise.all([
    readArchive(),
    readDocuments(),
  ])
  return (
    <DashboardShell
      user={viewer.email}
      groups={ownerNav({ drain: archive.deleted.length })}
      phoneGroups={ownerPhoneNav({ drain: archive.deleted.length })}
      // Phone-ready since 25 Sep 2026. The workspace already showed one
      // pane at a time below `lg` — the list, or the enquiry with a way
      // back — it simply never got the chance behind the wall.
      phoneReady
      search={panelSearchItems(archive.submissions, active(documents.documents))}
    >
      <IntakeWorkspace
        submissions={archive.submissions}
        status={archive.status}
        orphans={archive.orphans}
      />
    </DashboardShell>
  )
}

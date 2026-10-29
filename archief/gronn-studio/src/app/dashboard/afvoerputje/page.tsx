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
import { DrainList } from "./drain-list"

export const metadata: Metadata = {
  title: "Afvoerputje",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// The drain, owner only.
//
// Same gate as the archive it draws from, and for a stronger reason: the
// records here still hold every answer and every photograph, and this is
// the surface from which they can be destroyed. A client session is sent
// to its own dossier rather than shown a gate it has already passed.
export default async function DrainPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
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
      // Phone-ready since 25 Sep 2026: a list of cards whose buttons wrap.
      phoneReady
      search={panelSearchItems(archive.submissions, active(documents.documents))}
    >
      {/* The page's own gutter. The list used to sit straight against the
          rail — and on a phone, against the glass edge — because nothing
          between the shell and the list set one. */}
      <main className="w-full px-4 py-7 sm:px-6">
        <DrainList deleted={archive.deleted} />
      </main>
    </DashboardShell>
  )
}

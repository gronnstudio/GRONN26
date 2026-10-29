import type { Metadata } from "next"

import { redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { readDocuments } from "@/lib/document-archive"
import { active } from "@/lib/documents"
import { readArchive } from "@/lib/intake-archive"
import { LEGAL_DOCUMENTS, openCount } from "@/lib/data/legal"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { ownerNav, ownerPhoneNav } from "../nav"
import { panelSearchItems } from "../search-items"
import { SmallPrint } from "./small-print"

export const metadata: Metadata = {
  title: "Kleine letters",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// De juridische documenten, van de kant van de eigenaar.
//
// Wat deze pagina toont en de publieke pagina niet: wat er nog open staat.
// Elk document draagt zijn eigen lijst met wat Nick moet invullen, kiezen
// of laten toetsen, plus de plekken waar de lopende tekst letterlijk nog
// een gat heeft. Die twee zijn niet hetzelfde en worden apart geteld — een
// document kan een openstaande vraag hebben zonder gat, en een gat zonder
// vraag zou een vergissing zijn.
//
// De teksten worden hier NIET bewerkt. Dat is een bewuste beperking: een
// juridische tekst die vanaf een telefoon te wijzigen is, is een tekst die
// vanaf een telefoon gewijzigd wordt. Ze staan in de repo, ze gaan door
// een commit, en dat is de review die ze verdienen.
//
// Dit scherm is `phoneReady` sinds #123 — juist omdat er niets te
// bewerken valt. Toen kreeg het ook een eigen, korte `phoneGroups`,
// omdat de rest van het paneel op een telefoon nog op de
// grootschermmelding doodliep. Sinds 25 sep 2026 werkt het hele paneel op
// een telefoon (de eigenaar wil het dashboard daar gebruiken, niet de
// melding lezen), en is de strip hier dezelfde volle strip als overal —
// met dezelfde tellers als de rail.
export default async function KleineLettersPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  if (viewer.kind === "client") redirect("/dashboard")

  const [archive, intakes] = await Promise.all([readDocuments(), readArchive()])
  const counts = { drain: intakes.deleted.length, letters: openCount() }

  return (
    <DashboardShell
      phoneGroups={ownerPhoneNav(counts)}
      user={viewer.email}
      groups={ownerNav(counts)}
      search={panelSearchItems(intakes.submissions, active(archive.documents))}
      phoneReady
    >
      <SmallPrint documents={LEGAL_DOCUMENTS} />
    </DashboardShell>
  )
}

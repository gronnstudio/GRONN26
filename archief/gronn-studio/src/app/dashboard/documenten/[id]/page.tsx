import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { studioIban } from "@/lib/business-private"
import { readDocuments } from "@/lib/document-archive"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { DocumentPrint } from "./document-print"

export const metadata: Metadata = {
  title: "Document — afdrukken",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// Eén offerte of factuur, klaar om als pdf te bewaren of te delen.
//
// Bewust géén DashboardShell eromheen, precies zoals het juridische vel
// ernaast: dit scherm heeft één taak. Dat het geen shell heeft is ook
// waarom het al op een telefoon werkte terwijl de lijst ervoor dat niet
// deed — de muur zit in de shell, niet in de pagina.
//
// Het rekeningnummer wordt HIER gelezen, op de server, ná de
// sessiecontrole, zodat het alleen in een geauthenticeerd antwoord
// meereist en nooit in een JavaScript-bundel die iedereen kan opvragen.
// Zie lib/business-private.
export default async function DocumentPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  if (viewer.kind === "client") redirect("/dashboard")

  const { id } = await params
  const archive = await readDocuments()
  // Een leesfout is geen "bestaat niet". 404 antwoorden op een document
  // dat er wel is, omdat de blob even niet meewerkte, stuurt de eigenaar
  // op zoek naar iets dat hij niet kwijt is.
  if (archive.status !== "ok") {
    return <DocumentPrint doc={null} iban="" unreadable />
  }
  const doc = archive.documents.find((d) => d.id === id)
  if (!doc) notFound()

  return <DocumentPrint doc={doc} iban={studioIban()} />
}

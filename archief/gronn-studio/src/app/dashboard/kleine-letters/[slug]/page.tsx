import type { Metadata } from "next"

import { notFound, redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { legalBySlug } from "@/lib/data/legal"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { LegalPrint } from "./legal-print"

export const metadata: Metadata = {
  title: "Kleine letters — afdrukken",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// Eén juridisch document, klaar om als pdf te bewaren.
//
// Bewust géén DashboardShell eromheen. De rail, de zoekbalk en de
// navigatiestrip zijn `doc-chrome` en verdwijnen bij het afdrukken, maar
// ze moeten dan wel eerst geladen worden — en dit scherm heeft één taak:
// het vel tonen en de afdrukdialoog openen. Terug naar het overzicht gaat
// via de knop op het vel.
export default async function LegalPrintPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  if (viewer.kind === "client") redirect("/dashboard")

  const { slug } = await params
  const doc = legalBySlug(slug)
  if (!doc) notFound()

  return <LegalPrint doc={doc} />
}

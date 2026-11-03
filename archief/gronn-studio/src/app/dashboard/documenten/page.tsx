import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getPanelViewer } from "@/lib/panel-viewer"
import { readDocuments } from "@/lib/document-archive"
import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { PanelGate } from "@/app/dashboard/owner-gate"
import { ownerNav, ownerPhoneNav } from "../nav"
import { DocumentShelf } from "./document-shelf"

export const metadata: Metadata = {
  title: "Documenten",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// De plank: elke offerte en factuur, om te lezen en door te sturen.
//
// WAAROM DIT NAAST DE OFFERTEBOUWER STAAT EN HEM NIET VERVANGT. De
// bouwer op /dashboard/offertes is gereedschap — regels slepen, bedragen
// rekenen, varianten naast elkaar — en dat is werk voor een groot
// scherm. Dit is de andere helft van dezelfde stapel: teruglezen wat er
// al ligt, en het eruit halen. Dat is precies wat de eigenaar op zijn
// telefoon nodig heeft, staand in andermans tuin: "welke prijs stond er
// ook alweer in", of "ik stuur het je nu meteen".
//
// Er wordt hier niets geschreven. Geen bewerkknop, geen archiveren, geen
// betaald-vinkje. Een leesscherm dat stiekem ook kan schrijven is een
// bouwer met minder knoppen.
//
// Sinds 25 sep 2026 werkt de bouwer zelf ook op een telefoon (de eigenaar
// wil het hele dashboard daar gebruiken). De plank blijft: lezen en
// doorsturen is op een telefoon nog steeds sneller dan een A4 bouwen, en
// in de telefoonstrip staat hij direct naast de bouwer.
//
// Het archief wordt in zijn geheel gelezen, inclusief wat gearchiveerd
// is: een oude offerte opvragen is juist de reden dat je hem bewaart.
export default async function DocumentenPage() {
  const viewer = await getPanelViewer()
  if (!viewer) return <PanelGate />
  // Een ingelogde klant heeft een eigen dashboard. Dit scherm draagt het
  // werk van élk huishouden, niet dat van hen.
  if (viewer.kind === "client") redirect("/dashboard")

  const archive = await readDocuments()

  return (
    <DashboardShell
      user={viewer.email}
      groups={ownerNav()}
      phoneGroups={ownerPhoneNav()}
      phoneReady
    >
      <DocumentShelf documents={archive.documents} status={archive.status} />
    </DashboardShell>
  )
}

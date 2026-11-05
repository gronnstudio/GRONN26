import type { Metadata } from "next"
import { DocumentenLijst } from "@/components/crm/documenten-lijst"

// Facturen van alle klanten in één lijst (Plancraft, 5 nov 2026).
export const metadata: Metadata = { title: "Facturen" }
export const dynamic = "force-dynamic"

export default async function Facturen({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; jaar?: string }> }) {
  return <DocumentenLijst soort="Factuur" filter={await searchParams} />
}

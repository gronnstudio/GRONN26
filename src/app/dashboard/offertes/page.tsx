import type { Metadata } from "next"
import { DocumentenLijst } from "@/components/crm/documenten-lijst"

// Offertes van alle klanten in één lijst (Plancraft, 5 nov 2026).
export const metadata: Metadata = { title: "Offertes" }
export const dynamic = "force-dynamic"

export default async function Offertes({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; jaar?: string }> }) {
  return <DocumentenLijst soort="Offerte" filter={await searchParams} />
}

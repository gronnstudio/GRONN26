import { redirect } from "next/navigation"

// Het projectdeel is weg (Nick, 2 nov 2026: "voegt niks toe"). Oude links gaan naar de klantkaart.
export default async function ProjectPagina({ params }: { params: Promise<{ id: string; pid: string }> }) {
  const { id } = await params
  redirect(`/dashboard/klanten/${id}`)
}

import type { Metadata } from "next"
import { ProjectWizard } from "@/components/handoff/wizard"
import "@/components/handoff/handoff.css"

export const metadata: Metadata = {
  title: "Start een project",
  // Nog niet openbaar: alleen via het ontwikkelaarsmenu (12 nov 2026).
  robots: { index: false, follow: false },
  description: "Vertel in zes korte stappen over je tuin of vijver: projecttype, situatie, budget, planning, foto's en contact. We bekijken elke aanvraag persoonlijk.",
}

export default function StartEenProject() {
  return <ProjectWizard />
}

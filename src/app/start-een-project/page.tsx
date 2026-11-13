import type { Metadata } from "next"
import { ProjectWizard } from "@/components/handoff/wizard"
import "@/components/handoff/handoff.css"

export const metadata: Metadata = {
  title: "Start een project",
  description: "Vertel in vier korte stappen over je tuin of vijver: wat je wilt, hoe het er nu uitziet, budget en planning, en hoe ik je bereik. Ik bekijk elke aanvraag zelf.",
}

export default function StartEenProject() {
  return <ProjectWizard />
}

import type { Metadata } from "next"
import { HandoffVoorpagina } from "@/components/handoff/voorpagina"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// De voorpagina volgens de handoff "GRØNN Studio Website 2027" (eigenaar koos
// "Handoff precies volgen", 12 nov 2026). De Tuinplan-layout doet hier niet
// mee: de handoff kent één ontwerp.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Tuin- en vijverrenovatie in Limburg` },
  description:
    "Een tuin om in thuis te komen. Een vijver die weer tot leven komt. GRØNN Studio vernieuwt buitenruimtes in Limburg en omgeving, met aandacht voor vorm, natuur en techniek.",
}

export default function Voorpagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema()).replace(/</g, "\\u003c") }} />
      <HandoffVoorpagina />
    </>
  )
}

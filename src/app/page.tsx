import type { Metadata } from "next"
import { HandoffVoorpagina } from "@/components/handoff/voorpagina"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// De voorpagina volgens de handoff "GRØNN Studio Website 2027" (eigenaar koos
// "Handoff precies volgen", 12 nov 2026). De Tuinplan-layout doet hier niet
// mee: de handoff kent één ontwerp.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en natuurlijke tuinen in Stein` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf. Plan nu, dan begin ik in maart.",
}

export default function Voorpagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema()).replace(/</g, "\\u003c") }} />
      <HandoffVoorpagina />
    </>
  )
}

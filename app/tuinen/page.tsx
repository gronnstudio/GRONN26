import type { Metadata } from "next"

import { PageIntro } from "@/components/PageIntro"

export const metadata: Metadata = { title: "Tuinen" }

// Fase 1: alleen de plek in het menu. De pagina zelf volgt.
export default function Page() {
  return (
    <PageIntro label="Tuinen" titel="Tuinen">
      <p>Natuurlijke tuinen, ontwerp en aanleg. Deze pagina wordt in fase 3 gebouwd.</p>
    </PageIntro>
  )
}

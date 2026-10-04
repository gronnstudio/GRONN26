import type { Metadata } from "next"

import { PageIntro } from "@/components/PageIntro"

export const metadata: Metadata = { title: "Vijvers" }

// Fase 1: alleen de plek in het menu. De pagina zelf volgt.
export default function Page() {
  return (
    <PageIntro label="Vijvers" titel="Vijvers">
      <p>Renovatie, aanleg en onderhoud van vijvers en watersystemen. Deze pagina wordt in fase 3 gebouwd.</p>
    </PageIntro>
  )
}

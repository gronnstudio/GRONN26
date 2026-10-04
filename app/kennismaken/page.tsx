import type { Metadata } from "next"

import { PageIntro } from "@/components/PageIntro"

export const metadata: Metadata = { title: "Kennismaken" }

// Fase 1: alleen de plek in het menu. De pagina zelf volgt.
export default function Page() {
  return (
    <PageIntro label="Kennismaken" titel="Kennismaken">
      <p>Het contactformulier komt in fase 3.</p>
    </PageIntro>
  )
}

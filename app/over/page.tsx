import type { Metadata } from "next"

import { PageIntro } from "@/components/PageIntro"

export const metadata: Metadata = { title: "Over" }

// Fase 1: alleen de plek in het menu. De pagina zelf volgt.
export default function Page() {
  return (
    <PageIntro label="Over" titel="Over">
      <p>Het verhaal van Nick en GRØNN Studio. Deze pagina wordt in fase 3 gebouwd.</p>
    </PageIntro>
  )
}

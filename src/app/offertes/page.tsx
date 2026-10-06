import type { Metadata } from "next"
import { OfferteMaker } from "@/components/offertes/maker"

// gronn.studio/offertes: offertes opstellen in de huisstijl en als PDF printen
// (eigenaar, 6 okt 2026). Alleen voor de eigenaar, achter Google-login (zie
// src/proxy.ts); noindex, niet in de sitemap, zonder menu en voet. Facturen
// blijven in DigiBoox: die regelt nummering, bewaarplicht en btw-aangifte.
export const metadata: Metadata = {
  title: { absolute: "Offertes · GRØNN Studio" },
  robots: { index: false, follow: false },
}

export default function Offertes() {
  return (
    <div data-links>
      <OfferteMaker />
    </div>
  )
}

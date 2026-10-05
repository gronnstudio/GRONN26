import type { Metadata } from "next"
import { Verder } from "@/components/wereld/verder"
import { Atelier } from "@/components/voorpagina/atelier"
import { Beweging } from "@/components/voorpagina/beweging"
import { WatIkDoe } from "@/components/voorpagina/wat-ik-doe"
import { Werkwijze } from "@/components/voorpagina/werkwijze"
import "@/components/voorpagina/voorpagina.css"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// De voorpagina (eigenaar, 5 okt 2026): een samenstelling van wireframes.
// 1 WF-058 opening t/m fotocollage (altijd donker), 2 Zo werk ik uit WF-059,
// 3 Wat ik doe uit WF-057, 4 Kennismaken. Geen werk/projecten, wel foto's.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
}


export default function Voorpagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema()).replace(/</g, "\\u003c") }} />
      <div data-voorpagina className="vp-wortel">
        <Atelier />
        <Werkwijze />
        <WatIkDoe />
      </div>

      <Verder voor="Benieuwd naar" nadruk="het werk" na="zelf?" href="/werk" label="Naar Werk" />
      <Beweging />
    </>
  )
}

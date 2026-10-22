import type { Metadata } from "next"
import { Verder } from "@/components/wereld/verder"
import { Atelier } from "@/components/voorpagina/atelier"
import { Beweging } from "@/components/voorpagina/beweging"
import { WatIkDoe } from "@/components/voorpagina/wat-ik-doe"
import { Vragen } from "@/components/voorpagina/vragen"
import "@/components/voorpagina/voorpagina.css"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// De voorpagina (eigenaar, 5 okt 2026): een samenstelling van wireframes.
// 1 WF-058 opening, het uitgelichte project en de fotocollage, 2 Wat ik doe
// uit WF-057 (de kerndiensten), 3 Kennismaken. Korter sinds 11 okt 2026: de
// werkwijze staat op Over, alle diensten op Vijvers en Tuinen.
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
        <WatIkDoe />
      </div>
      <Vragen />

      <Verder
        voor={{ nl: "Zullen we", en: "Shall we" }}
        nadruk={{ nl: "kennismaken", en: "meet" }}
        na="?"
        href="/kennismaken"
        label={{ nl: "Naar Kennismaken", en: "To Get in touch" }}
      />
      <Beweging />
    </>
  )
}

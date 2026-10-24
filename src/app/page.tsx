import type { Metadata } from "next"
import { Verder } from "@/components/wereld/verder"
import { Atelier } from "@/components/voorpagina/atelier"
import { Uitgelicht } from "@/components/voorpagina/uitgelicht"
import { WatIkDoe } from "@/components/voorpagina/wat-ik-doe"
import "@/components/voorpagina/voorpagina.css"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// De voorpagina, versimpeld (24 okt 2026): opening, wie ik ben, wat ik doe,
// één echt project en Kennismaken. De vragen staan op /faq, de werkwijze op Over.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
}

export default function Voorpagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema()).replace(/</g, "\\u003c") }} />
      <div className="vp-wortel">
        <Atelier />
        <WatIkDoe />
        <Uitgelicht />
      </div>

      <Verder
        voor={{ nl: "Zullen we", en: "Shall we" }}
        nadruk={{ nl: "kennismaken", en: "meet" }}
        na="?"
        href="/kennismaken"
        label={{ nl: "Naar Kennismaken", en: "To Get in touch" }}
      />
    </>
  )
}

import type { Metadata } from "next"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { WERK } from "@/components/werk/projecten"
import { WerkOverzicht } from "@/components/werk/werk-overzicht"

const BESCHRIJVING =
  "Echt werk van GRØNN Studio: een vijverrenovatie met twee vijvers, een waterval en een beekloop, en een terras van 24\u00a0m² in Geulle."

export const metadata: Metadata = {
  title: "Werk",
  description: BESCHRIJVING,
  alternates: { canonical: "/werk" },
  openGraph: {
    title: "Werk · GRØNN Studio",
    description: BESCHRIJVING,
    url: "/werk",
    images: [{ url: "/projecten/vijverrenovatie/F01.jpg", width: 2000, height: 1500 }],
  },
}

const ZIN = {
  nl: BESCHRIJVING,
  en: "Real work by GRØNN Studio: a pond renovation with two ponds, a waterfall and a stream, and a 24\u00a0m² patio in Geulle.",
}

export default function WerkPagina() {
  return (
    <>
      <Opening
        label={{ nl: `Werk · ${WERK.length} projecten`, en: `Work · ${WERK.length} projects` }}
        titel={{ nl: "Werk", en: "Work" }}
        zin={<T t={ZIN} />}
      />
      <div className="wrap">
        <WerkOverzicht />
      </div>
    </>
  )
}

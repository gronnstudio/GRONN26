import type { Metadata } from "next"
import { WerkOverzicht } from "@/components/werk/werk-overzicht"

const BESCHRIJVING =
  "Echt werk van GRØNN Studio: een vijverrenovatie met twee vijvers, een waterval en een beekloop, en een terras van 24 m² in Geulle."

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

export default function WerkPagina() {
  return (
    <div className="wrap">
      <WerkOverzicht />
    </div>
  )
}

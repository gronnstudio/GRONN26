import type { Metadata } from "next"
import { JuridischDocument } from "@/components/juridisch/document"
import { VOORWAARDEN_CONSUMENT } from "@/lib/data/legal/voorwaarden-consument"

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: "De voorwaarden voor particuliere opdrachtgevers van GRØNN Studio.",
  alternates: { canonical: "/voorwaarden" },
}

export default function Pagina() {
  return <JuridischDocument doc={VOORWAARDEN_CONSUMENT} titel={"Algemene\nvoorwaarden"} />
}

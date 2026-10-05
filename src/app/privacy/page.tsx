import type { Metadata } from "next"
import { JuridischDocument } from "@/components/juridisch/document"
import { PRIVACY } from "@/lib/data/legal/privacy"

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Wat GRØNN Studio met je gegevens doet: wat ik verwerk, waarvoor, hoe lang, met wie ik het deel en wat je rechten zijn.",
  alternates: { canonical: "/privacy" },
}

export default function Pagina() {
  return <JuridischDocument doc={PRIVACY} titel={"Privacy-\nverklaring"} />
}

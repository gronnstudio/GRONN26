import type { Metadata } from "next"
import { JuridischDocument } from "@/components/juridisch/document"
import { HERROEPING } from "@/lib/data/legal/herroeping"

export const metadata: Metadata = {
  title: "Modelformulier voor herroeping",
  description: "Het modelformulier waarmee je een overeenkomst met GRØNN Studio binnen de bedenktijd ontbindt.",
  alternates: { canonical: "/herroeping" },
}

export default function Pagina() {
  return <JuridischDocument doc={HERROEPING} titel={{ nl: "Herroeping", en: "Withdrawal" }} />
}

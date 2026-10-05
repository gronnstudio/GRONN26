import type { Metadata } from "next"
import { KennismakenFormulier } from "@/components/kennismaken/formulier"
import { PaginaKop } from "@/components/over/pagina-kop"
import { KENNISMAKING_VRIJBLIJVEND } from "@/lib/data/teksten"

// WF-023 Kennismaken, met de staten na verzenden uit WF-034.
export const metadata: Metadata = {
  title: "Kennismaken",
  description: KENNISMAKING_VRIJBLIJVEND.nl,
}

export default function Kennismaken() {
  return (
    <div className="wrap">
      <PaginaKop label="Contact" titel="Kennismaken" inleiding="Ik reageer meestal binnen twee werkdagen." />
      <KennismakenFormulier />
    </div>
  )
}

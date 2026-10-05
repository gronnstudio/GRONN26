import type { Metadata } from "next"
import { KennismakenFormulier } from "@/components/kennismaken/formulier"
import { Opening } from "@/components/wereld/opening"
import { KENNISMAKING_VRIJBLIJVEND } from "@/lib/data/teksten"

// WF-023 Kennismaken, met de staten na verzenden uit WF-034. De opening in
// de taal van de voorpagina; het formulier zelf blijft rustig.
export const metadata: Metadata = {
  title: "Kennismaken",
  description: KENNISMAKING_VRIJBLIJVEND.nl,
}

export default function Kennismaken() {
  return (
    <>
      {/* Eén lang woord: op de telefoon iets kleiner, zodat het past. */}
      <div className="max-md:[&_.w-reus]:text-[12vw]!">
        <Opening label="Contact" titel="Kennismaken" zin="Ik reageer meestal binnen twee werkdagen." />
      </div>
      <div className="wrap">
        <KennismakenFormulier />
      </div>
    </>
  )
}

import type { Metadata } from "next"
import { KennismakenFormulier } from "@/components/kennismaken/formulier"
import { Opening } from "@/components/wereld/opening"
import Link from "next/link"
import { T } from "@/components/taal"
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
        <Opening
          label="Contact"
          titel={{ nl: "Kennismaken", en: "Get in touch" }}
          zin={<T t={{ nl: "Ik reageer meestal binnen twee werkdagen.", en: "I usually reply within two working days." }} />}
        />
      </div>
      <div className="wrap">
        {/* wie al weet wat hij wil, gaat meteen door naar de aanvraag (eigenaar, 14 nov 2026) */}
        <p className="mb-[clamp(32px,4vw,56px)] max-w-[46ch] text-gedempt">
          <T t={{ nl: "Weet je al wat je wilt laten maken?", en: "Already know what you want built?" }} />{" "}
          <Link href="/start-een-project" transitionTypes={["schuif"]} className="text-inkt underline decoration-1 underline-offset-4">
            <T t={{ nl: "Start meteen een project", en: "Start a project right away" }} />
          </Link>
        </p>
        <KennismakenFormulier />
      </div>
    </>
  )
}

import Link from "next/link"
import type { ComponentProps } from "react"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import type { L } from "@/lib/i18n"

// Een tekstlink met één omcirkeld woord in een afwijkende kleur, in plaats van
// een omlijnde knop onder een tekst (eigenaar, 22 nov 2026: "die knoppen onder
// teksten weghalen en iets met een afwijkende kleur doen en een omcirkeld
// woord. Behalve met de kennismaken knop in oranje die blijft").
export function CirkelLink({ voor, woord, ...rest }: { voor: L; woord: L } & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link {...rest} className={`ls-cirkellink ${rest.className ?? ""}`}>
      <span><T t={voor} /> <span className="ls-cirkel"><T t={woord} />
        <svg viewBox="0 0 120 50" preserveAspectRatio="none" aria-hidden>
          <path d="M14 30C6 16 38 4 70 5c28 1 46 10 44 22-2 13-31 19-60 18C26 44 4 37 7 23 9 14 22 8 40 6" pathLength="1" />
        </svg>
      </span></span>
      <Pijl richting="e" className="ls-cirkellink-pijl" />
    </Link>
  )
}

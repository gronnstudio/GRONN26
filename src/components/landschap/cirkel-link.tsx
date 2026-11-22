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
      <span><T t={voor} /> <span className="ls-cirkel"><T t={woord} /></span></span>
      <Pijl richting="e" className="ls-cirkellink-pijl" />
    </Link>
  )
}

// Dezelfde vorm als tekst binnen een grotere link (projectkaarten): geen eigen
// link, de ring vult zich als de hele kaart wordt aangewezen.
export function CirkelWoord({ voor, woord }: { voor: L; woord: L }) {
  return (
    <span className="ls-cirkellink">
      <span><T t={voor} /> <span className="ls-cirkel"><T t={woord} /></span></span>
      <Pijl richting="e" className="ls-cirkellink-pijl" />
    </span>
  )
}

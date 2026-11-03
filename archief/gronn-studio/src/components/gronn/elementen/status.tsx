import type { ReactNode } from "react"

import { accentTekst, type Toon } from "./toon"

/** De oranje stip van `Status`, los — ook voor de huidige fase in `FaseBalk`. */
export function StatusStip() {
  return <span aria-hidden className="size-[6px] shrink-0 rounded-full bg-[var(--gronn-ember)]" />
}

/** Een ember-stip met een korte status ("In afronding"). */
export function Status({ children, toon = "grond" }: { children: ReactNode; toon?: Toon }) {
  return (
    <span className={`inline-flex items-center gap-2 ${accentTekst(toon)}`}>
      <StatusStip />
      {children}
    </span>
  )
}

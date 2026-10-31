import type { ReactNode } from "react"

import { BREEDTE } from "./breedte"
import { Kop } from "./kop"
import { Label } from "./label"
import { LeesTekst } from "./lees-tekst"

/**
 * Een homepage-achtige sectie: label + kop links, korte intro rechts,
 * inhoud eronder. `id` geeft ook de kop zijn id (`${id}-kop`). De kop
 * schuift regel voor regel in als hij in beeld komt (`Kop`). Een intro als
 * tekst leest mee (`LeesTekst`; eigenaar, 3 okt 2026: "Kunnen we dit
 * effect overal toepassen op tekst?").
 */
export function Sectie({
  id,
  label,
  kop,
  intro,
  children,
  vlak = false,
  className = "",
}: {
  id: string
  label?: ReactNode
  kop: ReactNode
  intro?: ReactNode
  children?: ReactNode
  /** Zet de sectie op het lichtere `surface`-vlak. */
  vlak?: boolean
  className?: string
}) {
  return (
    <section data-element="Sectie" id={id} aria-labelledby={`${id}-kop`} className={`py-20 sm:py-28 ${vlak ? "border-y border-line/10 bg-surface" : ""} ${className}`}>
      <div className={BREEDTE}>
        <div className="g-in grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end">
          <div>
            {label && <Label>{label}</Label>}
            <Kop id={`${id}-kop`} className="tekst-h2 mt-4 max-w-[20ch]">
              {kop}
            </Kop>
          </div>
          {intro && <Intro className="tekst-body max-w-[60ch] text-foreground/80">{intro}</Intro>}
        </div>
        {children && <div className="mt-12 sm:mt-16">{children}</div>}
      </div>
    </section>
  )
}

/** Een intro als tekst leest mee; iets anders (opmaak, links) blijft een gewone alinea. */
function Intro({ children, className }: { children: ReactNode; className: string }) {
  return typeof children === "string" ? <LeesTekst className={className}>{children}</LeesTekst> : <p className={className}>{children}</p>
}

/** De kop van een binnenpagina: label, h1, één alinea, optioneel iets eronder.
 * De h1 staat boven de vouw en schuift dus meteen bij het laden in (`Kop direct`). */
export function PaginaKop({
  boven,
  label,
  titel,
  intro,
  children,
}: {
  /** Boven het label, bijv. een kruimelpad. */
  boven?: ReactNode
  label: ReactNode
  titel: ReactNode
  intro?: ReactNode
  children?: ReactNode
}) {
  return (
    <header data-element="PaginaKop" className={`${BREEDTE} pt-12 pb-12 sm:pt-20 sm:pb-16`}>
      {boven && <div className="mb-6">{boven}</div>}
      <Label>{label}</Label>
      <Kop as="h1" direct className="tekst-h1 mt-5 max-w-[18ch]">
        {titel}
      </Kop>
      {intro && <Intro className="tekst-body mt-6 max-w-[60ch] text-foreground/80">{intro}</Intro>}
      {children}
    </header>
  )
}

/** Een kleinere kop binnen een pagina (h2). Geen nummer erboven: de
 * inhoudsopgave ernaast nummert en wijst aan waar je bent (eigenaar,
 * 23 sep 2026). */
export function Kop2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <Kop id={id} className="tekst-h2 max-w-[22ch]">
      {children}
    </Kop>
  )
}

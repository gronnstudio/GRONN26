import Image from "next/image"
import type { ReactNode } from "react"

import { ConceptLabel } from "./concept-label"

/**
 * Een productkaart voor de winkel (concept, docs/shop-plan.md fase 1).
 * Geen link: een product heeft (nog) geen eigen pagina. Beeld bovenaan —
 * een plaatshouder uit `public/ph` of, zonder `beeld`, een vlak met een
 * dun lijnicoon — ALTIJD met een zichtbaar label, want een productfoto die
 * er niet is mag nergens doorgaan voor echt werk. Nooit een projectfoto of
 * sfeerbeeld.
 *
 * Eén oranje accent per compositie: de kaart zelf draagt geen oranje; de
 * knop is een rand-knop en UITGESCHAKELD (`disabled` + `aria-disabled`):
 * in het concept betaalt niets en er is geen Mollie-link. Alle chroom in
 * px, 16px radius, geen beweging.
 */
export function ProductKaart({
  beeld,
  icoon = "blad",
  labelTekst,
  titel,
  tekst,
  prijs,
  details,
  knop,
}: {
  beeld?: string
  icoon?: "blad" | "document" | "zaad" | "bon"
  /** "Plaatshouder" / "Placeholder". */
  labelTekst: string
  titel: ReactNode
  tekst?: ReactNode
  prijs: ReactNode
  /** Verplichte informatie of een levernotitie, als korte regels. */
  details?: ReactNode[]
  knop: string
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[16px] border border-line/10 bg-background">
      <div data-product-beeld="" className="relative block overflow-hidden" style={{ aspectRatio: "16/10" }}>
        {beeld ? (
          <Image src={beeld} alt="" fill sizes="(min-width: 1024px) 28vw, 90vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-surface text-foreground/40">
            <Icoon soort={icoon} />
          </div>
        )}
        <ConceptLabel tekst={labelTekst} />
      </div>
      <div className="flex flex-1 flex-col p-[20px]">
        <h3 className="tekst-h3">{titel}</h3>
        {tekst && <p className="mt-[8px] flex-1 text-[14px] leading-relaxed text-foreground/75">{tekst}</p>}
        <div className="mt-[16px] border-t border-line/10 pt-[12px]">
          <div className="font-heading text-[18px]">{prijs}</div>
          {details && details.length > 0 && (
            <ul className="mt-[8px] grid gap-[4px] font-mono text-[12px] text-muted">
              {details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          disabled
          aria-disabled="true"
          data-bestellen=""
          className="tekst-knop mt-[16px] inline-flex min-h-[44px] cursor-not-allowed items-center justify-center rounded-full border border-current/30 px-[16px] text-foreground/70"
        >
          {knop}
        </button>
      </div>
    </article>
  )
}

/** Dunne lijnicoontjes voor een plaatshouder zonder foto (decoratief). */
function Icoon({ soort }: { soort: "blad" | "document" | "zaad" | "bon" }) {
  const pad = {
    blad: "M12 40 C12 20 26 10 40 8 C38 24 30 38 12 40 Z M12 40 L28 22",
    document: "M14 8 H30 L38 16 V40 H14 Z M30 8 V16 H38 M19 24 H33 M19 30 H33",
    zaad: "M24 40 V22 M24 22 C24 14 30 10 36 10 C36 18 30 22 24 22 M24 28 C24 22 18 18 12 18 C12 25 18 28 24 28",
    bon: "M8 16 H40 V32 H8 Z M20 16 V32 M8 24 H20",
  }[soort]
  return (
    <svg aria-hidden="true" width="64" height="64" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
      <path d={pad} />
    </svg>
  )
}

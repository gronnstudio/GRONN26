"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, type ReactNode } from "react"

import { ConceptLabel } from "./concept-label"

// Qi's "interactive link showcase", zelf gebouwd: grote regels die elk
// ergens heen leiden. Met een muis zweeft er een kaart mee — beeld plus
// uitleg — die de cursor volgt; op touch staat de uitleg onder de regel.
// Het enige script: de cursorpositie als twee CSS-variabelen, zonder
// state en zonder re-render.
//
// Op de telefoon (onder sm) worden de regels kaarten die over elkaar
// schuiven, net als de Stapel van "Zo werk ik" (eigenaar, 24 sep 2026).
// Elke kaart plakt RAND lager dan de vorige, genoeg om van een
// ondergeschoven kaart de tegel en "01 · Ontwerp" te blijven zien. Met
// 14px bleven er lege randen over en las de stapel als ingeklapt
// (eigenaar, 3 okt 2026: "Wat gebeurt hier met inklappen?"). Alleen CSS;
// zonder sticky is het gewoon een lijst.

/** Wat er van een ondergeschoven kaart zichtbaar blijft: 24px rand, de rij van 32px, 8px lucht. */
const RAND = 64

export type ShowcaseRij = {
  href: string
  nummer: string
  soort: string
  kop: string
  uitleg: string
  /** De foto op de zwevende kaart; of `vlak`, een ander beeld in 4:3 (een `IcoonVlak`). */
  beeld?: string
  vlak?: ReactNode
  /** Klein boven "01 · soort": de tegel van het niveau (decoratief). */
  icoon?: ReactNode
  /** Klein label op de foto van de zwevende kaart (bijv. Eigen werk). */
  beeldLabel?: string
  /** Klein, rechts naast de pijl (bijv. "vanaf € 95"). */
  rechts?: string
  /** Het beeld is een plaatshouder: zet het conceptlabel erop. */
  concept?: boolean
}

export function LinkShowcase({ rijen, conceptTekst }: { rijen: ShowcaseRij[]; conceptTekst?: string }) {
  const lijst = useRef<HTMLUListElement>(null)
  return (
    <ul data-element="LinkShowcase"
      ref={lijst}
      className="relative grid gap-5 sm:block sm:gap-0 sm:border-t sm:border-line/15 sm:pb-0"
      onPointerMove={(e) => {
        const el = lijst.current
        if (!el || e.pointerType !== "mouse") return
        const r = el.getBoundingClientRect()
        el.style.setProperty("--g-x", `${e.clientX - r.left}px`)
        el.style.setProperty("--g-y", `${e.clientY - r.top}px`)
      }}
    >
      {rijen.map((r, i) => (
        <li
          key={r.nummer}
          data-showcase-kaart=""
          className="sticky top-[var(--kaart-top)] rounded-[16px] border border-line/10 bg-surface shadow-[0_-20px_40px_-32px_rgb(0_0_0/0.45)] sm:static sm:rounded-none sm:border-0 sm:border-b sm:border-line/15 sm:bg-transparent sm:shadow-none"
          style={{ "--kaart-top": `${96 + i * RAND}px` } as React.CSSProperties}
        >
          <Link
            href={r.href}
            className="g-rij group grid gap-3 p-6 outline-offset-4 sm:grid-cols-[128px_minmax(0,1fr)_auto] sm:items-center sm:px-0 sm:py-10"
          >
            {/* Op de telefoon tegel en nummer naast elkaar: die ene rij is
                wat er van een ondergeschoven kaart te zien blijft. */}
            <span className="flex items-center gap-[12px] sm:flex-col sm:items-start">
              {r.icoon}
              <span className="tekst-annotatie whitespace-nowrap text-muted uppercase">
                {r.nummer} · {r.soort}
              </span>
            </span>
            <span className="g-rij-kop tekst-h1 block">
              {r.kop}
            </span>
            <span className="flex items-center gap-4 sm:justify-end">
              {r.rechts && (
                <span className="font-mono text-[12px] tracking-[0.06em] text-muted">{r.rechts}</span>
              )}
              <span
                aria-hidden
                className="grid size-[48px] place-items-center rounded-full border border-line/25 text-xl text-[var(--ember-text)] transition-colors group-hover:border-[var(--gronn-ember)]"
              >
                →
              </span>
            </span>
            {/* Touch: de uitleg in de regel. Met een muis: alleen voor
                schermlezers, want de zwevende kaart toont hem al. */}
            <span className="max-w-2xl text-[15px] leading-relaxed text-foreground/75 sm:col-start-2 [@media(hover:hover)]:sr-only">
              {r.uitleg}
            </span>
            <span
              aria-hidden
              className="g-zweef pointer-events-none absolute z-10 hidden w-[20rem] overflow-hidden rounded-[16px] bg-surface shadow-[0_30px_70px_-30px_rgb(0_0_0/0.5)] sm:block"
              style={{ left: "var(--g-x, 70%)", top: "var(--g-y, 50%)" }}
            >
              {r.vlak ?? (r.beeld && (
                <span className="relative block aspect-[4/3]">
                  <Image src={r.beeld} alt="" fill sizes="320px" className="object-cover" />
                  {r.concept && <ConceptLabel tekst={conceptTekst} />}
                  {r.beeldLabel && (
                    <span className="absolute left-[12px] top-[12px] rounded-full bg-black/55 px-[10px] py-[4px] font-mono text-[11px] uppercase tracking-[0.04em] text-white">{r.beeldLabel}</span>
                  )}
                </span>
              ))}
              <span className="block p-5 text-[14px] leading-relaxed">{r.uitleg}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

"use client"

import type { ReactNode } from "react"

/**
 * Printen: opent het printvenster van de browser. De printopmaak staat in
 * globals.css ("De checklist op papier"). Omlijnd, want hij staat naast
 * de primaire download (`PdfKnop`); zelf niet te zien op papier
 * (`data-print="hide"`).
 *
 * Tot 24 sep 2026 was dit de enige knop en heette hij "Download als PDF".
 * Nick: "op mobiel gaat dat vaak niet goed" — "Opslaan als PDF" in het
 * printvenster zit op een telefoon diep of ontbreekt. Daarom nu twee
 * knoppen: een echt PDF-bestand, en deze voor wie wil printen.
 */
export function PrintKnop({ children }: { children: ReactNode }) {
  return (
    <button data-element="PrintKnop"
      type="button"
      data-print="hide"
      onClick={() => window.print()}
      className="tekst-knop inline-flex min-h-[52px] items-center justify-between gap-6 rounded-full border border-current/30 px-5 transition-colors hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
    >
      {children}
    </button>
  )
}

/**
 * De checklist als echt PDF-bestand: een gewone link met `download`, dus
 * geen printvenster, ook niet op een telefoon. Het bestand staat in
 * public/pdf/ en wordt gemaakt met `npm run checklist:pdf` — uit
 * dezelfde pagina en dezelfde printopmaak. `nieuwsbrief.spec.ts` bewaakt
 * dat het nog klopt met de tekst op de site.
 */
export function PdfKnop({ href, bestandsnaam, children }: { href: string; bestandsnaam: string; children: ReactNode }) {
  return (
    <a data-element="PdfKnop"
      href={href}
      download={bestandsnaam}
      type="application/pdf"
      data-print="hide"
      data-pdf=""
      className="tekst-knop inline-flex min-h-[52px] items-center justify-between gap-6 rounded-full bg-gronn-ember px-5 text-gronn-black transition-colors hover:bg-[#e57a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
    >
      {children}
      <span aria-hidden>↓</span>
    </a>
  )
}

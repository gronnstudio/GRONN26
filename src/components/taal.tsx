import type { ReactNode } from "react"
import type { L } from "@/lib/i18n"

// Twee talen (eigenaar, 5 okt 2026: "ik wil de hele website twee talig").
// De taal kies je in Weergave; het voorverf-script zet html.en en lang="en"
// vóór de eerste verf. Tekst staat in BEIDE talen in de pagina, in
// <span lang> met display: contents; CSS verbergt de andere taal. Zo is er
// geen flits, geen hydratieverschil, en werkt het ook zonder JS.
// Alleen voor attributen (aria-label, alt, placeholder) is JS nodig: useTaal()
// in taal-klant.ts.

export type Tekst = string | L
export type Taal = "nl" | "en"

/** De tekst in één taal (voor attributen en code). */
export function kies(t: Tekst, taal: Taal): string {
  return typeof t === "string" ? t : t[taal]
}

/** Tekst in beide talen; de andere taal is verborgen. */
export function T({ t }: { t: Tekst }) {
  if (typeof t === "string") return <>{t}</>
  return <Beide nl={t.nl} en={t.en} />
}

/** Willekeurige inhoud per taal (voor zinnen met opmaak of links erin). */
export function Beide({ nl, en }: { nl: ReactNode; en: ReactNode }) {
  return (
    <>
      <span lang="nl" className="t-nl">{nl}</span>
      <span lang="en" className="t-en">{en}</span>
    </>
  )
}

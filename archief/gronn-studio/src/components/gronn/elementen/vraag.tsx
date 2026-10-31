import type { ReactNode } from "react"

/**
 * Eén vraag die openklapt: native `<details>`/`<summary>`, dus zonder
 * JavaScript, met Enter en spatie te bedienen, door een schermlezer als
 * uitklapbaar gemeld, en door Chrome vanzelf geopend wanneer "zoeken op
 * pagina" of een #anker erin landt. De vraag is een echte kop (h2), zodat
 * wie met koppen navigeert de lijst ook zo kan lezen.
 *
 * Kaart 16px; het plus-teken zit in een ronde knop (alle knoppen rond,
 * eigenaar 23 sep 2026) en draait naar een kruis als de vraag open is.
 * Maten in px. De draai valt weg bij minder beweging.
 */
export function Vraag({
  id,
  vraag,
  open = false,
  children,
  na,
  kop: KopTag = "h2",
}: {
  id: string
  vraag: ReactNode
  open?: boolean
  /** Het antwoord. */
  children: ReactNode
  /** Onder het antwoord, buiten de antwoordtekst: bijv. een PijlLink. */
  na?: ReactNode
  /** Het kopniveau van de vraag: h2 op /faq, h3 onder een sectiekop (home). */
  kop?: "h2" | "h3"
}) {
  return (
    <details data-element="Vraag" id={id} open={open} className="group scroll-mt-[112px] rounded-[16px] border border-line/15 bg-surface">
      <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 rounded-[16px] px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
        <KopTag className="font-heading text-[19px] leading-[26px] font-semibold tracking-tight sm:text-[21px] sm:leading-[28px]">{vraag}</KopTag>
        <span
          aria-hidden
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-line/25 text-[20px] leading-none text-[var(--ember-text)] group-open:rotate-45 motion-safe:transition-transform"
        >
          +
        </span>
      </summary>
      <div className="px-5 pb-6 sm:px-6">
        <div data-antwoord className="grid max-w-[68ch] gap-4 text-[16px] leading-relaxed text-foreground/85">
          {children}
        </div>
        {na && <div className="mt-4">{na}</div>}
      </div>
    </details>
  )
}

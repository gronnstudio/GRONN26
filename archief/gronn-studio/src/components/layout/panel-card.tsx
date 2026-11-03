"use client"

import { useRef, type ReactNode } from "react"
import { motion } from "framer-motion"

import { EASE_REVEAL } from "@/lib/motion"
import { BREEDTE } from "@/components/gronn/elementen/breedte"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { useScrollFade } from "@/lib/use-scroll-fade"

// The floating card both bar variants hang from the header, extracted so
// the two cannot drift apart on radius, shadow, scroll behaviour or the
// one detail that is easy to get wrong: it is `fixed`, not `absolute`.
// The bar is a positioned ancestor with its own max-width and padding, so
// anchoring to it insets the card twice. top-20 sits flush under the
// h-20 bar.
//
// Every panel in the bar is a DISCLOSURE, never a dialog — no focus trap.
// Tab walks through the card and then out of the bar, closing it on the
// way; Escape closes and hands focus back to its trigger. The owning
// component wires that up, because it owns the trigger.
//
// The card scrolls (`max-h` + `overflow-y-auto`) and used to give no
// sign of it. That is the same complaint the phone sheet got — "services
// is niet duidelijk dat dat scrollbaar is" — and this card is where a
// phone lands the moment it is ROTATED: every current phone in landscape
// is wider than the 768px `md` breakpoint, so it leaves the dock and
// arrives here, in a viewport under 420px tall. At that height the
// clipping is worse than it ever was in portrait.
//
// Smaller clearance than the dock's: nothing floats over this card, so
// the softening can start close to its own bottom edge.

export function PanelCard({
  id,
  children,
  footer,
}: {
  id: string
  children: ReactNode
  /** Recessed strip along the floor of the card — the way out. */
  footer?: ReactNode
}) {
  const reduced = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(cardRef)

  return (
    <motion.div
      id={id}
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduced ? 0 : 0.28, ease: EASE_REVEAL }}
      className="pointer-events-none fixed inset-x-0 top-20 z-40"
    >
      {/* Op de paginabreedte (BREEDTE), met 16px lucht tussen de balk en
          het paneel (eigenaar, 28 sep 2026: "laat negatieve ruimte boven
          mega menu, maar zorg dat paneel open blijft met hoveren over open
          ruimte"). De brug vult die lucht onzichtbaar: hij hoort bij het
          paneel en dus bij de container van de knoppen, zodat de muis de
          boom nooit verlaat op weg naar beneden en er geen sluittimer
          start. */}
      <div className={`${BREEDTE} pt-[16px]`}>
        <div className="relative">
          <div aria-hidden data-menu-brug="" className="pointer-events-auto absolute inset-x-0 -top-[16px] h-[16px]" />
          <div
            ref={cardRef}
            data-paneel-scroller=""
            onScroll={fade.onScroll}
            style={fade.style}
            className="pointer-events-auto max-h-[calc(100svh-128px)] w-full overflow-y-auto overscroll-contain rounded-[16px] border border-line/15 bg-background shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)]"
          >
            {children}
            {footer && (
              <div className="border-t border-line/10 bg-surface/50 px-7 py-3.5 sm:px-9">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

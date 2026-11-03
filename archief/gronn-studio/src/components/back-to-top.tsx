"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type Lenis from "lenis"

import { useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Desktop back-to-top: a glass button pinned bottom-right that joins
// the page once you have scrolled a viewport deep — the same pulsing
// ember ring the mobile dock's slot uses (phones keep that slot; this
// renders from md up only).
export function BackToTop() {
  const t = useT()
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.1)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toTop = () => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
    if (lenis && !reduced) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={toTop}
          aria-label={t({ en: "Back to top", nl: "Terug naar boven" })}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: EASE_REVEAL }}
          className="glass fixed z-40 hidden size-12 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-gronn-ember focus-visible:text-gronn-ember active:text-gronn-ember md:flex"
          // md still reaches iPads, which have a home indicator in
          // landscape; the 1.5rem floor is what every other device had.
          style={{
            bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.5rem))",
            right: "max(1.5rem, env(safe-area-inset-right))",
          }}
        >
          <span
            aria-hidden
            className="ring-pulse absolute inset-1.5 rounded-full border-2 border-gronn-ember"
          />
          <span
            aria-hidden
            className="absolute inset-1.5 rounded-full border border-gronn-ember/45"
          />
          <svg aria-hidden width="15" height="15" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 12V2M7 2 2.5 6.5M7 2l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

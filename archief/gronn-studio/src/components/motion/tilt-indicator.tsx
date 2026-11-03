"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion"

import { useT } from "@/components/language-provider"
import { CURSOR_LABELS } from "@/lib/motion"
import { useDeviceTilt } from "@/lib/use-device-tilt"
import { useHydrated } from "@/lib/use-hydrated"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// CONCEPT — not mounted anywhere. Owner verdict 21 Jul 2026: the tilt
// interaction "does not work great" in practice, parked until the idea
// matures. To revive, render <TiltIndicator /> in site-shell.tsx.
//
// The touch-screen counterpart of the desktop cursor pill: phones have
// no pointer, so the ember VIEW/READ chip floats over the card nearest
// the viewport centre and left-right phone tilt steers it across the
// card — tilt is the cursor. Renders only on coarse-pointer devices;
// the desktop Cursor component keeps pointer duty, and reduced motion
// shows nothing (the cards' own text links carry the affordance).

// Vocabulary is shared with the desktop Cursor (@/lib/motion). Only the
// view/read keys can ever surface here — the query below selects nothing
// else — so the shared record's extra entries are inert by construction.

const EDGE = 88 // px a card must clear from the viewport edges to hold the chip

export function TiltIndicator() {
  const t = useT()
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const hydrated = useHydrated()
  const [label, setLabel] = useState<string | null>(null)

  const tilt = useDeviceTilt(reduced)
  const baseX = useMotionValue(0) // card centre
  const baseY = useMotionValue(0) // centre of the card's visible slice
  const range = useMotionValue(0) // tilt travel: a share of the card width
  const x = useTransform<number, number>([tilt, baseX, range], ([v, b, r]) => b + v * r)
  const springX = useSpring(x, { stiffness: 140, damping: 22, mass: 0.5 })

  const enabled =
    hydrated && !reduced && window.matchMedia("(pointer: coarse)").matches

  useEffect(() => {
    if (!enabled) return

    let raf = 0
    const update = () => {
      const cards = document.querySelectorAll('[data-cursor="view"], [data-cursor="read"]')
      const viewportCentre = window.innerHeight / 2
      let best: { el: Element; rect: DOMRect; distance: number } | null = null
      for (const el of cards) {
        const rect = el.getBoundingClientRect()
        if (rect.bottom < EDGE || rect.top > window.innerHeight - EDGE) continue
        if (rect.width < 140 || rect.height < 120) continue
        const visibleCentre =
          (Math.max(rect.top, 0) + Math.min(rect.bottom, window.innerHeight)) / 2
        const distance = Math.abs(visibleCentre - viewportCentre)
        if (!best || distance < best.distance) best = { el, rect, distance }
      }
      if (best) {
        baseX.set(best.rect.left + best.rect.width / 2)
        baseY.set(
          (Math.max(best.rect.top, 0) + Math.min(best.rect.bottom, window.innerHeight)) / 2
        )
        range.set(best.rect.width * 0.28)
        setLabel(best.el.getAttribute("data-cursor"))
      } else {
        setLabel(null)
      }
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [enabled, pathname, baseX, baseY, range])

  if (!enabled) return null

  return (
    <AnimatePresence>
      {label && CURSOR_LABELS[label] && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          style={{ x: springX, y: baseY }}
          className="pointer-events-none fixed left-0 top-0 z-[55] md:hidden"
        >
          <span className="flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-gronn-ember-strong px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gronn-white shadow-[0_6px_18px_-6px_rgba(249,90,8,0.55)]">
            {t(CURSOR_LABELS[label])}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

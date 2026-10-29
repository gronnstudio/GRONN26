"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

import { useT } from "@/components/language-provider"
import { CURSOR_LABELS } from "@/lib/motion"
import { useHydrated } from "@/lib/use-hydrated"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Organic custom cursor: a solid ember seed that tracks the pointer
// directly, and a soft trailing ring on a spring. Over elements carrying a
// data-cursor attribute the ring becomes a speaking pill ("View", "Read",
// "Drag" — the vocabulary lives in @/lib/motion, shared with the
// touch-side TiltIndicator); over other interactive elements it simply
// blooms. The native cursor stays visible (accessibility); nothing renders
// on touch devices or under reduced-motion.

export function Cursor() {
  const t = useT()
  const reduced = useReducedMotion()
  const hydrated = useHydrated()
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.6 })

  // Derived, not set in an effect: pointer capability is stable per device.
  const enabled =
    hydrated && !reduced && window.matchMedia("(pointer: fine)").matches

  useEffect(() => {
    if (!enabled) return

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const el = e.target as Element | null
      const spoken = el?.closest?.("[data-cursor]")
      const value = spoken?.getAttribute("data-cursor") ?? null
      setLabel(value && CURSOR_LABELS[value] ? value : null)
      setHovering(
        !!el?.closest?.(
          'a, button, [role="button"], input, textarea, label, [data-cursor]'
        )
      )
    }
    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerover", over, { passive: true })
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerover", over)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      {/* seed */}
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[80] size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gronn-ember"
      />
      {/* trailing ring — blooms over interactive elements, speaks over
          data-cursor targets */}
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{
          width: label ? 64 : hovering ? 44 : 26,
          height: label ? 28 : hovering ? 44 : 26,
          opacity: label ? 1 : hovering ? 0.9 : 0.5,
        }}
        transition={{ duration: 0.25 }}
        className={
          "pointer-events-none fixed left-0 top-0 z-[80] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full " +
          (label
            ? "border-0 bg-gronn-ember"
            : "border border-gronn-ember bg-transparent")
        }
      >
        {label && (
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.15em] text-gronn-white">
            {t(CURSOR_LABELS[label])}
          </span>
        )}
      </motion.div>
    </>
  )
}

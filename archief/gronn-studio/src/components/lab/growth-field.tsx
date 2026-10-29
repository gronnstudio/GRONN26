"use client"

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Field Lab experiment 02 — growth follows you. Wherever the pointer (or a
// finger) travels across the field, a fine-line sprout draws itself and
// slowly disappears again. Pure SVG strokes in the theme's scene-life
// color; capped so the field never overgrows.

type Sprout = {
  id: number
  x: number
  y: number
  angle: number
  scale: number
}

const MAX_SPROUTS = 36
const MIN_DISTANCE = 64
const LIFETIME_MS = 5000

export function GrowthField() {
  const t = useT()
  const reduced = useReducedMotion()
  const [sprouts, setSprouts] = useState<Sprout[]>([])
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const nextId = useRef(0)

  const plant = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const last = lastPos.current
    if (last && Math.hypot(x - last.x, y - last.y) < MIN_DISTANCE) return
    lastPos.current = { x, y }

    const id = nextId.current++
    // Deterministic per-sprout variation, no Math.random in render paths.
    const angle = ((id * 37) % 24) - 12
    const scale = 0.75 + ((id * 13) % 10) / 20

    setSprouts((prev) => [...prev.slice(-(MAX_SPROUTS - 1)), { id, x, y, angle, scale }])
    window.setTimeout(() => {
      setSprouts((prev) => prev.filter((s) => s.id !== id))
    }, LIFETIME_MS)
  }

  return (
    <div
      onPointerMove={plant}
      className="relative h-105 w-full cursor-crosshair touch-none overflow-hidden rounded-lg border border-line/15 bg-surface/40"
      aria-label={t({
        en: "Interactive field: growth appears where you move",
        nl: "Interactief veld: groei verschijnt waar je beweegt",
      })}
    >
      <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-mono text-[11px] uppercase tracking-[0.3em] text-muted/70">
        {t({
          en: "Move across the field — growth follows",
          nl: "Beweeg over het veld — groei volgt",
        })}
      </p>

      <AnimatePresence>
        {sprouts.map((sprout) => (
          <motion.svg
            key={sprout.id}
            width="40"
            height="48"
            viewBox="0 0 40 48"
            aria-hidden
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 1.2 } }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            className="pointer-events-none absolute"
            style={{
              left: sprout.x - 20,
              top: sprout.y - 44,
              rotate: `${sprout.angle}deg`,
              scale: sprout.scale,
              transformOrigin: "20px 44px",
            }}
          >
            {/* Stem and two leaves, drawn as strokes in the scene's life color */}
            {["M20 44 C20 34 20 27 20 17", "M20 27 C14 25 10 20 9 13 C16 14 20 19 20 27Z", "M20 22 C26 20 30 15 31 8 C24 9 20 15 20 22Z"].map(
              (d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--scene-life)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { duration: 0.9, delay: i * 0.15, ease: EASE_REVEAL }
                  }
                />
              )
            )}
          </motion.svg>
        ))}
      </AnimatePresence>
    </div>
  )
}

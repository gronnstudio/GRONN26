"use client"

import type { ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

import { useReducedMotion } from "@/lib/use-reduced-motion"

// Een kaart kantelt licht naar de muis (eigenaar, 23 sep 2026:
// "Kaarten"). Aangepast van components/motion/tilt.tsx:
//   - het perspectief staat op de BUITENSTE laag, niet als
//     `transformPerspective` op de kaart zelf. Anders schrijft framer
//     nooit meer `transform: none` ("perspective(900px) rotateX(0deg)")
//     en blijft de kaart in rust een 3D-voorouder — precies wat de
//     photo-glass-laag niet wil (CLAUDE.md). Nu is de transform in rust
//     `none`.
//   - meten en luisteren op de buitenste laag, die niet draait: meten op
//     het draaiende vlak liet de randen trillen.
//   - alleen een muis; op touch en bij minder beweging staat hij stil.

export function Kanteling({
  children,
  className,
  max = 4,
}: {
  children: ReactNode
  className?: string
  /** Hoeveel graden hooguit. Een grote kaart heeft minder nodig. */
  max?: number
}) {
  const reduced = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 20 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 20 })

  return (
    <div
      className={className}
      style={{ perspective: "900px" }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
    >
      <motion.div data-kanteling="" className="h-full" style={reduced ? undefined : { rotateX: rx, rotateY: ry }}>
        {children}
      </motion.div>
    </div>
  )
}

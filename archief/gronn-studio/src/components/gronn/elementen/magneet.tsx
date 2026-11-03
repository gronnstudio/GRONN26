"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

import { useReducedMotion } from "@/lib/use-reduced-motion"

// De knop trekt licht naar de muis toe en veert terug bij verlaten — de
// "magnetic" van de oude site (components/motion/magnetic.tsx), bijgesteld
// voor V5 (eigenaar, 23 sep 2026: "Knoppen en cursor"):
//   - klein: 0,2 van de afstand tot het midden, nooit meer dan 6px. De
//     oude 0,4 schoof een brede knop 40px op; dat is geen knop meer.
//   - alleen een MUIS. Een tik op de telefoon stuurt ook een muisbeweging
//     en liet de knop dan scheef staan tot je ergens anders tikte.
//   - bij minder beweging geen stijl: de transform blijft `none`.

const KRACHT = 0.2
const MAX = 6

const klem = (v: number) => Math.max(-MAX, Math.min(MAX, v))

export function Magneet({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const veerX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.2 })
  const veerY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.2 })

  return (
    <motion.span
      ref={ref}
      data-magneet=""
      className="inline-flex"
      style={reduced ? undefined : { x: veerX, y: veerY }}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        x.set(klem((e.clientX - (r.left + r.width / 2)) * KRACHT))
        y.set(klem((e.clientY - (r.top + r.height / 2)) * KRACHT))
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}

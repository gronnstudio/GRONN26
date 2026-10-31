"use client"

import { useRef, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

import { useReducedMotion } from "@/lib/use-reduced-motion"

// Per-item parallax drift for grids: each wrapped card floats at its own
// speed while scrolling through the viewport, so a grid moves like a
// canopy instead of a slab. `amount` should vary per item (index-derived,
// deterministic — no Math.random, SSR stays stable).
export function Drift({
  children,
  amount = 24,
  className,
}: {
  children: ReactNode
  amount?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount])

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

// Deterministic drift amounts, cycled by grid index.
export const DRIFT_AMOUNTS = [18, 34, 10, 28, 14, 38]

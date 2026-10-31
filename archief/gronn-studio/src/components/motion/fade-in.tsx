"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Scroll-triggered fade-and-rise for section content. The workhorse reveal:
// anything below the fold enters through this unless it has bespoke motion.
export function FadeIn({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode
  delay?: number
  className?: string
  y?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: EASE_REVEAL, delay }}
    >
      {children}
    </motion.div>
  )
}

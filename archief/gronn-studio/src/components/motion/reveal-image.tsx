"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Framer-style image entrance: the image starts oversized and softly
// blurred, settling sharp as it crosses into view. Mount inside an
// overflow-hidden frame — the frame clips the overscale.
export function RevealImage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ scale: 1.12, filter: "blur(10px)", opacity: 0.6 }}
      whileInView={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 1.1, ease: EASE_REVEAL }}
    >
      {children}
    </motion.div>
  )
}

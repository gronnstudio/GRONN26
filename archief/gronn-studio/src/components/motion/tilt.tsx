"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// Perspective tilt toward the cursor — the classic Framer card feel.
// Springs back level on leave; inert under reduced-motion (and effectively
// on touch, where no pointermove hovers occur).
export function Tilt({
  children,
  className,
  max = 5,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), {
    stiffness: 180,
    damping: 20,
  })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), {
    stiffness: 180,
    damping: 20,
  })

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  function handleLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  )
}

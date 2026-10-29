"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView } from "framer-motion"

import { useReducedMotion } from "@/lib/use-reduced-motion"

// Counts the first number in a string up from zero when it enters view;
// prefix/suffix text ("≈ ", " m³", "% of excavated stone") stays intact.
// Values without a number render as-is.
export function CountUp({
  value,
  format,
}: {
  value: string
  /**
   * Renders the animated number. Needed for grouped figures: the parser
   * below reads `63,905` as a Dutch decimal and counts to 63.9, which
   * is how the project-figures panel first shipped a wrong number on a
   * page whose whole claim is that its numbers are measured.
   *
   * Pass the bare digits as `value` and do the grouping here.
   */
  format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: "-10%" })

  const match = value.match(/\d+(?:[.,]\d+)?/)
  const target = match ? parseFloat(match[0].replace(",", ".")) : null
  const decimals = match && /[.,]\d+/.test(match[0]) ? 1 : 0

  const shown = format && target !== null ? format(target) : value
  const [display, setDisplay] = useState(reduced || !match ? shown : null)

  useEffect(() => {
    if (reduced || !match || target === null) return
    if (!inView) return
    const prefix = value.slice(0, match.index)
    const suffix = value.slice((match.index ?? 0) + match[0].length)
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) =>
        setDisplay(
          `${prefix}${format ? format(v) : v.toFixed(decimals)}${suffix}`
        ),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value])

  // Before the animation starts, hold layout with the final value hidden.
  return (
    <span ref={ref}>
      {display ?? <span className="opacity-0">{shown}</span>}
    </span>
  )
}

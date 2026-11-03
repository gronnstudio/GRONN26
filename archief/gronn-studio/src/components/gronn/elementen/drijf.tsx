"use client"

import { useRef, useSyncExternalStore, type ReactNode } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

import { DRIFT_AMOUNTS } from "@/components/motion/drift"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Kaarten in een raster drijven elk in hun eigen tempo mee bij scrollen,
// zodat een raster beweegt als een bladerdak en niet als één plaat
// (eigenaar, 23 sep 2026: "Kaarten"). Aangepast van
// components/motion/drift.tsx:
//   - de hoeveelheid komt uit het index (DRIFT_AMOUNTS), nooit uit
//     Math.random: server en browser tekenen hetzelfde.
//   - alleen waar het ECHT een raster is: vanaf 640px (`sm`), waar de
//     dienstenlijst twee kolommen krijgt. Op de telefoon is het één
//     kolom; kaarten die daar onder elkaar verschillend schuiven, zijn
//     geen raster maar een haperende lijst.
//   - de ref hangt altijd aan het element, ook bij minder beweging, zodat
//     useScroll nooit een los doel heeft; dan krijgt hij alleen geen stijl.

const RASTER = "(min-width: 640px)"

function abonneer(callback: () => void) {
  const mql = window.matchMedia(RASTER)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function Drijf({ index, children, className }: { index: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const raster = useSyncExternalStore(abonneer, () => window.matchMedia(RASTER).matches, () => false)
  const amount = DRIFT_AMOUNTS[index % DRIFT_AMOUNTS.length]
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount])

  return (
    <motion.div ref={ref} data-drijf="" className={className} style={raster && !reduced ? { y } : undefined}>
      {children}
    </motion.div>
  )
}

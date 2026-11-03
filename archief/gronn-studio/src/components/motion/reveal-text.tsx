"use client"

import { Fragment } from "react"
import { motion } from "framer-motion"

import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Editorial line-mask reveal: text sits in overflow-hidden strips and slides
// up from behind them. Mount-triggered by default (for above-the-fold
// headlines); pass `inView` for anything further down the page. `byWord`
// staggers word by word instead of line by line — for the big brand
// statements that earn extra drama.
//
// The in-view observer lives on the parent element and drives the masked
// spans through variant propagation — the spans themselves start fully
// clipped by their overflow-hidden strips, so observing them directly would
// never fire (a clipped element reports zero intersection).
const parentVariants = {
  hidden: {},
  visible: {},
}

const maskVariants = { hidden: { y: "110%" }, visible: { y: "0%" } }

export function RevealText({
  lines,
  as = "h2",
  className,
  delay = 0,
  inView = false,
  byWord = false,
}: {
  lines: readonly string[]
  as?: "h1" | "h2" | "p"
  className?: string
  delay?: number
  inView?: boolean
  byWord?: boolean
}) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Plain = as
    return (
      <Plain className={className}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Plain>
    )
  }

  const transition = (index: number) => ({
    duration: 0.8,
    ease: EASE_REVEAL,
    delay: delay + index * (byWord ? 0.05 : 0.08),
  })

  let wordIndex = 0

  return (
    <Tag
      className={className}
      variants={parentVariants}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-10%" } }
        : { animate: "visible" })}
    >
      {lines.map((line, i) => (
        <span key={line} className={byWord ? "block" : "block overflow-hidden"}>
          {byWord ? (
            line.split(" ").map((word, w) => (
              <Fragment key={`${word}-${w}`}>
                <span className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    className="inline-block"
                    variants={maskVariants}
                    transition={transition(wordIndex++)}
                  >
                    {word}
                  </motion.span>
                </span>{" "}
              </Fragment>
            ))
          ) : (
            <motion.span
              className="block"
              variants={maskVariants}
              transition={transition(i)}
            >
              {line}
            </motion.span>
          )}
        </span>
      ))}
    </Tag>
  )
}

"use client"

import { motion } from "framer-motion"

import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import { EASE_REVEAL } from "@/lib/motion"
import { useInCenter } from "@/lib/use-in-center"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"
import type { HomeContent } from "@/lib/content-types"
import type { L } from "@/lib/i18n"

// Oversized statements, doubly scroll-linked: each line reveals through its
// mask on first entry, and the line crossing the viewport's centre band
// glows at full strength while the others recede — reading position is
// literally tied to scroll.
function PrincipleLine({
  principle,
  index,
  reduced,
}: {
  principle: L
  index: number
  reduced: boolean
}) {
  const t = useT()
  const { ref, inCenter } = useInCenter<HTMLLIElement>()

  return (
    <motion.li
      ref={ref}
      className={index % 2 === 1 ? "sm:pl-[12vw]" : undefined}
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      <span className="block overflow-hidden">
        <motion.span
          variants={{ hidden: { y: "110%" }, visible: { y: "0%" } }}
          transition={{ duration: 0.8, ease: EASE_REVEAL }}
          className={cn(
            "block font-heading text-[clamp(1.7rem,4.5vw,3.6rem)] font-semibold leading-tight tracking-tight transition-colors duration-500",
            inCenter || reduced ? "text-foreground" : "text-foreground/25"
          )}
        >
          <span
            className={cn(
              "mr-6 align-middle font-mono text-sm font-normal tracking-[0.25em] transition-colors duration-500",
              inCenter || reduced ? "text-accent" : "text-muted/40"
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          {t(principle)}
        </motion.span>
      </span>
    </motion.li>
  )
}

export function Principles({ home }: { home: HomeContent }) {
  const t = useT()
  const reduced = useReducedMotion()
  const editing = !!useEditor()?.editing

  return (
    <section className="border-y border-line/10 bg-surface/60 py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <SectionLabel index="08">
          {t({ en: "Principles", nl: "Principes" })}
        </SectionLabel>
        <ol className="mt-16 space-y-6">
          {editing
            ? // Edit mode: plain lines instead of the mask/center-band
              // animation, each one clickable.
              home.principles.map((principle, i) => (
                <li
                  key={i}
                  className={cn(
                    "font-heading text-[clamp(1.7rem,4.5vw,3.6rem)] font-semibold leading-tight tracking-tight",
                    i % 2 === 1 && "sm:pl-[12vw]"
                  )}
                >
                  <span className="mr-6 align-middle font-mono text-sm font-normal tracking-[0.25em] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <EditableText
                    path={`home.principles.${i}`}
                    value={principle}
                  />
                </li>
              ))
            : home.principles.map((principle, i) => (
                <PrincipleLine
                  key={principle.en}
                  principle={principle}
                  index={i}
                  reduced={reduced}
                />
              ))}
        </ol>
      </div>
    </section>
  )
}

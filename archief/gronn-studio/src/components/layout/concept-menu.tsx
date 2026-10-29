"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { PrivacyToggle } from "@/components/privacy-toggle"
import { DefaultThemeToggle } from "@/components/default-theme-toggle"
import { useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { ConceptTrigger } from "@/components/layout/header-controls"
import {
  ContrastChoice,
  MotionChoice,
  ResumeChoice,
  ShortcutChoice,
  TextScaleChoice,
  UnderlineChoice,
} from "@/components/a11y-choices"

// Everything about display that is NOT a daily decision. Sun/moon and
// the language flag handle the two people actually use; this holds Auto,
// the eight concept palettes, and the accessibility preferences.
//
// The accessibility group is the part that earns the panel. Reduced
// motion here overrides the operating system in BOTH directions —
// someone can calm this one site without changing a system setting, and
// someone whose OS says "reduce" can still choose to watch the terrain
// move. "Underline every link" exists because of a real failure on this
// site: menu headings and menu links shared a face and a size, and the
// owner could not tell which rows were clickable. That was fixed in the
// menu; this fixes it everywhere at once, permanently, for anyone who
// needs it.

/** One labelled group in the panel. */
function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-3">
        {children}
      </div>
    </div>
  )
}

export function ConceptMenu() {
  const t = useT()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click: this panel is small and anchored, so a
  // stray click elsewhere should dismiss it the way a menu does.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <ConceptTrigger id="concept-menu" open={open} onClick={() => setOpen((v) => !v)} />

      <AnimatePresence>
        {open && (
          <motion.div
            id="concept-menu"
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.24, ease: EASE_REVEAL }}
            className="absolute right-0 top-full z-40 mt-3 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-line/15 bg-background p-5 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)]"
          >
            <Group label={t({ en: "Light and dark", nl: "Licht en donker" })}>
              {/* Auto lives here, not in the sun/moon switch: a
                  three-state control cannot be one honest glyph. */}
              <DefaultThemeToggle />
            </Group>

            {/* Dezelfde knoppen als in het telefoonwiel, uit
                `a11y-choices.tsx`. Ze stonden hier privé; toen het wiel
                ze ook ging aanbieden werd dat een tweede kopie, en twee
                kopieën lopen uit elkaar. */}
            <Group label={t({ en: "Accessibility", nl: "Toegankelijkheid" })}>
              <TextScaleChoice />
              <ContrastChoice />
              <MotionChoice />
              <UnderlineChoice />
              <ShortcutChoice />
              <PrivacyToggle />
            </Group>

            <Group label={t({ en: "Getting around", nl: "Navigeren" })}>
              <ResumeChoice />
            </Group>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

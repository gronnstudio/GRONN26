"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { FadeIn } from "@/components/motion/fade-in"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"
import type { HomeContent } from "@/lib/content-types"

// Client voices (idea audited from Qi Addons' testimonial widgets,
// rebuilt in the site's own field-note register): one quote at a time,
// a quiet crossfade, and two labelled controls — no autoplay carousel
// dots, no swiping mystery. Rotation advances by itself at reading
// pace, pauses while the pointer or focus is inside, and stands still
// entirely under reduced motion. Quotes are placeholder fiction until
// real clients exist, the same rule the projects follow.
export function Testimonials({ home }: { home: HomeContent }) {
  const t = useT()
  const reduced = useReducedMotion()
  const items = home.testimonials
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (reduced || paused || items.length < 2) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, 9000)
    return () => clearInterval(id)
  }, [reduced, paused, items.length])

  if (!items?.length) return null
  const current = items[index]

  const arrow = (dir: -1 | 1) => () =>
    setIndex((i) => (i + dir + items.length) % items.length)

  const control =
    "tap-target flex h-9 w-9 items-center justify-center rounded-full border border-line/25 text-muted transition-colors duration-300 hover:border-gronn-ember/60 hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] active:border-gronn-ember/60 active:text-gronn-ember"

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <FadeIn>
        <SectionLabel index="09">{t(home.testimonialsTitle)}</SectionLabel>
      </FadeIn>
      <FadeIn>
        <div
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="mt-10 max-w-3xl"
        >
          {/* aria-live so a screen reader hears the quote change the
              same way a sighted visitor sees it. */}
          <div aria-live="polite" className="min-h-44 sm:min-h-40">
            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote
                key={index}
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: EASE_REVEAL }}
              >
                <p className="font-heading text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
                  &ldquo;{t(current.quote)}&rdquo;
                </p>
                <footer className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  <span className="text-[color:var(--ember-text)]">
                    {current.name}
                  </span>
                  <span aria-hidden> — </span>
                  {t(current.context)}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              aria-label={t({ en: "Previous quote", nl: "Vorig citaat" })}
              onClick={arrow(-1)}
              className={control}
            >
              <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2 4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="font-mono text-xs tracking-[0.2em] text-muted">
              {String(index + 1).padStart(2, "0")}
              <span aria-hidden> / </span>
              {String(items.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              aria-label={t({ en: "Next quote", nl: "Volgend citaat" })}
              onClick={arrow(1)}
              className={cn(control)}
            >
              <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

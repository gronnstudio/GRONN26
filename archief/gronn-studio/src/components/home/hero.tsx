"use client"

import { motion, useScroll, useTransform } from "framer-motion"

import { AvailabilityBadge } from "@/components/availability-badge"
import { CtaLink } from "@/components/cta-link"
import { Stamp } from "@/components/stamp"
import { Terrain } from "@/components/three/terrain"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import type { SiteCopy } from "@/lib/content-types"

// Clean single-viewport hero: the procedural topographic field breathes
// behind oversized typography — nothing illustrative competing with it.
// (The earlier scroll-grown SVG ecosystem was cut: too diagrammatic for
// the rest of the site's restraint.)
export function Hero({ copy }: { copy: SiteCopy }) {
  const t = useT()
  const editing = !!useEditor()?.editing
  const reduced = useReducedMotion()

  // Depth on exit: the copy lags behind the scroll while fading, so the
  // headline separates from the terrain layer as you leave the hero.
  const { scrollY } = useScroll()
  const copyY = useTransform(scrollY, [0, 700], [0, 140])
  const copyOpacity = useTransform(scrollY, [0, 550], [1, 0])

  return (
    <section
      aria-label="Intro"
      className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-background"
    >
      <Terrain className="absolute inset-0 opacity-70" />

      {/* Legibility scrim behind the headline */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-background/80 via-background/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/40 to-transparent"
      />

      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pt-28 motion-reduce:!translate-y-0 motion-reduce:!opacity-100 sm:px-6"
      >
        {editing ? (
          <h1 className="max-w-4xl font-heading text-[clamp(2.4rem,6.5vw,5rem)] font-semibold leading-[1.05] tracking-tight">
            <EditableText path="siteCopy.heroTitle.0" value={copy.heroTitle[0]} />
            <br />
            <EditableText path="siteCopy.heroTitle.1" value={copy.heroTitle[1]} />
          </h1>
        ) : (
          /* The LCP element: CSS-animated (not framer) so it paints
             before hydration — see the hero-* keyframes in globals.css */
          <h1 className="max-w-4xl font-heading text-[clamp(2.4rem,6.5vw,5rem)] font-semibold leading-[1.05] tracking-tight">
            {copy.heroTitle.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <span
                  className="hero-line"
                  style={{ animationDelay: `${0.3 + i * 0.08}s` }}
                >
                  {t(line)}
                </span>
              </span>
            ))}
          </h1>
        )}
        <p
          className="hero-enter mt-8 max-w-xl text-lg leading-relaxed text-foreground/80"
          style={{ animationDelay: "0.9s" }}
        >
          <EditableText path="siteCopy.heroSubtitle" value={copy.heroSubtitle} />
        </p>
        <div
          className="hero-enter mt-10 flex flex-wrap gap-4"
          style={{ animationDelay: "1.1s" }}
        >
          <CtaLink href="/projects">
            {t({ en: "Explore Our Work", nl: "Bekijk ons werk" })}
          </CtaLink>
          <CtaLink href="/contact" variant="outline">
            {t({ en: "Start a Project", nl: "Start een project" })}
          </CtaLink>
        </div>
      </motion.div>

      {/* Rotating brand stamp, floating over the field */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 1.4 }}
        // Anchored to the CONTENT column, not the window. It used to sit
        // right-6/right-12 from the viewport edge while everything else
        // on the page — including the row directly beneath it — lives in
        // a centred max-w-7xl. Past about 1400px the two drifted apart
        // and the stamp floated off on its own margin. Same wrapper as
        // that row, so the right edges line up at every width.
        className="pointer-events-none absolute inset-x-0 bottom-24 hidden md:block"
      >
        <div className="mx-auto flex w-full max-w-7xl justify-end px-4 sm:px-6">
          <div className="pointer-events-auto text-[#212529] dark:text-gronn-light">
            <Stamp />
          </div>
        </div>
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 pb-10 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <AvailabilityBadge
            label={copy.availability}
            editPath="siteCopy.availability"
          />
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted md:block">
            <EditableText path="siteCopy.heroLocation" value={copy.heroLocation} />
          </p>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 1.6 }}
          className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-muted sm:block"
        >
          {t({ en: "Scroll", nl: "Scrol" })} ↓
        </motion.p>
      </div>
    </section>
  )
}

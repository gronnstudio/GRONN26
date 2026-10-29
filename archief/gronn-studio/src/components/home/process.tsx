"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

import { CtaLink } from "@/components/cta-link"
import { FadeIn } from "@/components/motion/fade-in"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import type { HomeContent } from "@/lib/content-types"
import type { L } from "@/lib/i18n"

// Chapter 05 — The GRØNN method as a continuous ecological sequence
// (Milestone 2 §4): six stages joined by a hand-drawn root line that draws
// itself as the section scrolls through view, so the process reads as one
// unbroken growth rather than six boxes.
const PROCESS_STAGES: { index: string; title: L; text: L }[] = [
  {
    index: "01",
    title: { en: "Observe", nl: "Observeren" },
    text: {
      en: "Study the landscape before introducing change.",
      nl: "Bestudeer het landschap voordat je iets verandert.",
    },
  },
  {
    index: "02",
    title: { en: "Map", nl: "In kaart brengen" },
    text: {
      en: "Identify patterns, constraints, flows and opportunities.",
      nl: "Breng patronen, beperkingen, stromen en kansen in kaart.",
    },
  },
  {
    index: "03",
    title: { en: "Connect", nl: "Verbinden" },
    text: {
      en: "Create relationships between soil, water, planting, habitat and people.",
      nl: "Leg relaties tussen bodem, water, beplanting, habitat en mensen.",
    },
  },
  {
    index: "04",
    title: { en: "Design", nl: "Ontwerpen" },
    text: {
      en: "Translate ecological intelligence into a clear spatial system.",
      nl: "Vertaal ecologische intelligentie naar een helder ruimtelijk systeem.",
    },
  },
  {
    index: "05",
    title: { en: "Establish", nl: "Vestigen" },
    text: {
      en: "Build, plant, monitor and guide the landscape through its early development.",
      nl: "Bouw, beplant, monitor en begeleid het landschap door zijn eerste ontwikkeling.",
    },
  },
  {
    index: "06",
    title: { en: "Evolve", nl: "Evolueren" },
    text: {
      en: "Allow the landscape to mature and adapt over time.",
      nl: "Laat het landschap rijpen en zich aanpassen in de loop van de tijd.",
    },
  },
]

// Meanders through a 3×2 grid of cards (viewBox is stretched to the grid).
const ROOT_LINE =
  "M60 90 C240 40 400 140 600 90 C800 40 960 140 1140 90 C1180 200 1060 240 940 270 C700 340 400 220 180 300 C120 320 80 360 140 420 C300 480 500 380 700 430 C900 480 1060 400 1150 440"

export function Process({ home }: { home: HomeContent }) {
  const t = useT()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  // Stage order/indexes are code; titles and texts are content.
  const stages = PROCESS_STAGES.map((stage, i) => ({
    ...stage,
    title: home.processStages[i]?.title ?? stage.title,
    text: home.processStages[i]?.text ?? stage.text,
  }))

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  })
  const growth = useSpring(scrollYProgress, { stiffness: 90, damping: 25 })

  return (
    <section className="border-y border-line/10 bg-surface/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index="05">
              {t({ en: "Method", nl: "Methode" })}
            </SectionLabel>
            <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              <EditableText path="home.processTitle" value={home.processTitle} />
            </h2>
          </div>
          <CtaLink href="/approach" variant="outline">
            {t({ en: "Discover Our Approach", nl: "Ontdek onze aanpak" })}
          </CtaLink>
        </div>

        <div ref={ref} className="relative mt-16">
          {/* The connecting root — draws with scroll behind the stages */}
          {!reduced && (
            <svg
              aria-hidden
              viewBox="0 0 1200 520"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            >
              <path
                d={ROOT_LINE}
                fill="none"
                stroke="var(--muted)"
                strokeOpacity="0.12"
                strokeWidth="1.5"
              />
              <motion.path
                d={ROOT_LINE}
                fill="none"
                stroke="#197b4f"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{ pathLength: growth }}
              />
            </svg>
          )}

          <ol className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map((stage, i) => (
              <li key={stage.index}>
                <FadeIn
                  delay={Math.min(i * 0.06, 0.3)}
                  className="h-full rounded-lg border border-line/10 bg-background/85 p-7 backdrop-blur-sm"
                >
                  <p className="font-heading text-3xl font-semibold text-gronn-green">
                    {stage.index}
                  </p>
                  <h3 className="mt-5 font-heading text-lg font-semibold">
                    <EditableText
                      path={`home.processStages.${i}.title`}
                      value={stage.title}
                    />
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    <EditableText
                      path={`home.processStages.${i}.text`}
                      value={stage.text}
                    />
                  </p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

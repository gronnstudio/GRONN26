"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"

import { CtaLink } from "@/components/cta-link"
import { Drift, DRIFT_AMOUNTS } from "@/components/motion/drift"
import { ProjectCard } from "@/components/project-card"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import type { Project } from "@/lib/data/projects"

// One survey index for the whole section. Three renderings exist (phone
// track, pinned desktop gallery, reduced-motion grid) but only ever one is
// in the DOM, so they must all carry the same number in the homepage
// sequence — keep it here rather than repeating the literal three times.
const INDEX = "04"

// Selected projects as a pinned horizontal gallery: on large screens the
// section pins while vertical scroll drives the card track sideways — the
// page gains a horizontal axis without hijacking native scroll. A thin
// green progress root underlines the track. Small screens and
// reduced-motion get the drifting grid instead.
function HorizontalGallery({ projects }: { projects: Project[] }) {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [shift, setShift] = useState(0)

  const measure = useCallback(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (track && viewport) {
      setShift(Math.max(0, track.scrollWidth - viewport.clientWidth))
    }
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  const eased = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  })
  const x = useTransform(eased, (v) => -v * shift)
  const rootScale = useTransform(scrollYProgress, [0, 1], [0.05, 1])

  return (
    <section ref={sectionRef} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel index={INDEX}>
                {t({ en: "Selected Projects", nl: "Geselecteerde projecten" })}
              </SectionLabel>
              <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {t({
                  en: "From isolated elements to functioning systems",
                  nl: "Van losse elementen naar functionerende systemen",
                })}
              </h2>
            </div>
            <CtaLink href="/projects" variant="outline">
              {t({ en: "Explore All Projects", nl: "Bekijk alle projecten" })}
            </CtaLink>
          </div>
        </div>

        <div ref={viewportRef} data-cursor="drag" className="mt-14 overflow-hidden">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex w-max gap-8 pl-[max(1rem,calc((100vw-80rem)/2+1.5rem))] pr-16"
          >
            {projects.map((project) => (
              <div
                key={project.slug}
                className="w-[min(80vw,380px)] shrink-0"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll progress underline for the track */}
        <div className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6">
          <div className="h-px w-full bg-line/10">
            <motion.div
              style={{ scaleX: rootScale, transformOrigin: "left" }}
              className="h-px bg-gronn-green"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// Phones: vertical scroll drives the cards sideways, mirroring the
// desktop gallery — but only the track pins. The heading scrolls away
// first and the CTA follows after, so the pinned frame holds just the
// card row and its progress underline, which is what fits a phone
// viewport (pinning the whole column is what used to clip).
function MobileGallery({ projects }: { projects: Project[] }) {
  const t = useT()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [shift, setShift] = useState(0)

  const measure = useCallback(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (track && viewport) {
      setShift(Math.max(0, track.scrollWidth - viewport.clientWidth))
    }
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [measure])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  })
  // Scroll-scrubbed, so it runs under reduced motion too (the visitor
  // drives every frame; nothing self-animates) — reduced just drops
  // the spring inertia for a direct 1:1 mapping.
  const eased = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  })
  const x = useTransform(reduced ? scrollYProgress : eased, (v) => -v * shift)
  const rootScale = useTransform(scrollYProgress, [0, 1], [0.05, 1])

  return (
    <div className="md:hidden">
      <div className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
        <SectionLabel index={INDEX}>
          {t({ en: "Selected Projects", nl: "Geselecteerde projecten" })}
        </SectionLabel>
        <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight">
          {t({
            en: "From isolated elements to functioning systems",
            nl: "Van losse elementen naar functionerende systemen",
          })}
        </h2>
      </div>

      <section ref={sectionRef} className="relative h-[220vh]">
        {/* pb keeps the pinned row centred in the space above the dock */}
        <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pb-16">
          <div ref={viewportRef} className="overflow-hidden">
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex w-max gap-5 pl-4 pr-16"
            >
              {projects.map((project) => (
                <div
                  key={project.slug}
                  className="w-[82vw] max-w-[360px] shrink-0"
                >
                  <ProjectCard project={project} />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="mt-8 px-4">
            <div className="h-px w-full bg-line/10">
              <motion.div
                style={{ scaleX: rootScale, transformOrigin: "left" }}
                className="h-px bg-gronn-green"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6">
        <CtaLink href="/projects" variant="outline">
          {t({ en: "Explore All Projects", nl: "Bekijk alle projecten" })}
        </CtaLink>
      </div>
    </div>
  )
}

function GridFallback({
  projects,
  className,
}: {
  projects: Project[]
  className?: string
}) {
  const t = useT()

  return (
    <section className={className}>
      <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index={INDEX}>
              {t({ en: "Selected Projects", nl: "Geselecteerde projecten" })}
            </SectionLabel>
            <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {t({
                en: "From isolated elements to functioning systems",
                nl: "Van losse elementen naar functionerende systemen",
              })}
            </h2>
          </div>
          <CtaLink href="/projects" variant="outline">
            {t({ en: "Explore All Projects", nl: "Bekijk alle projecten" })}
          </CtaLink>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {projects.slice(0, 6).map((project, i) => (
            <Drift
              key={project.slug}
              amount={DRIFT_AMOUNTS[i % DRIFT_AMOUNTS.length]}
              className="h-full"
            >
              <ProjectCard project={project} delay={i * 0.06} />
            </Drift>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SelectedProjects({ projects }: { projects: Project[] }) {
  const reduced = useReducedMotion()

  // Phones: vertical scroll drives the cards sideways (only the track
  // pins — pinning the whole column is what used to clip). The glide
  // is scroll-scrubbed, so it serves reduced motion too (sans spring).
  // md+ keeps the scroll-driven gallery with the static grid as its
  // reduced-motion fallback.
  return (
    <>
      <MobileGallery projects={projects} />
      <div className="hidden md:block">
        {reduced ? (
          <GridFallback projects={projects} />
        ) : (
          <HorizontalGallery projects={projects} />
        )}
      </div>
    </>
  )
}

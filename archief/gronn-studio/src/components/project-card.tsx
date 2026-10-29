"use client"

import { useRef, type MouseEvent } from "react"
import { useRouter } from "next/navigation"

import { LocaleLink as Link } from "@/components/locale-link"

import { FadeIn } from "@/components/motion/fade-in"
import { Photo } from "@/components/photo"
import { RevealImage } from "@/components/motion/reveal-image"
import { Tilt } from "@/components/motion/tilt"
import { useLanguage, useT } from "@/components/language-provider"
import { localePath } from "@/lib/locale"
import { projectImage } from "@/lib/placeholder"
import { startProjectTransition } from "@/lib/view-transition"
import { cn } from "@/lib/utils"
import { CATEGORY_LABELS, type Project } from "@/lib/data/projects"

// Shared project tile (home + projects index). Equal-height by contract:
// the card stretches to its grid cell, the objective is clamped, and the
// footer link pins to the bottom — so a row of cards always closes on one
// line. The picsum photo is pulled into the brand palette by a green
// `photo-glass` screen (see globals.css), the same treatment every
// photograph on the site carries.
export function ProjectCard({
  project,
  delay = 0,
  priority = false,
}: {
  project: Project
  delay?: number
  /** Set on the first cards of a grid — they are the LCP candidates. */
  priority?: boolean
}) {
  const t = useT()
  const { locale } = useLanguage()
  const router = useRouter()
  const imageRef = useRef<HTMLDivElement>(null)
  const inProgress = project.status.en !== "Completed"
  const href = `/projects/${project.slug}`

  // Card → case study rides a native view transition where the browser
  // supports one (src/lib/view-transition.ts): the clicked card's photo
  // is named as the shared element — only on click, never on the whole
  // grid, because duplicate names void the API — and the router push
  // runs inside document.startViewTransition. When that path declines
  // (no support, reduced motion, modified click) the <Link> navigates
  // untouched and the route curtain plays exactly as before.
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    const image = imageRef.current
    if (!image) return
    const navigate = () => router.push(localePath(locale, href))
    if (startProjectTransition(image, navigate)) {
      event.preventDefault()
    }
  }

  return (
    <FadeIn delay={delay} className="h-full">
      <Tilt className="h-full">
        <Link
          href={href}
          onClick={handleClick}
          data-cursor="view"
          className="group flex h-full flex-col overflow-hidden rounded-lg border border-line/10 bg-surface transition-all duration-500 hover:-translate-y-1 hover:border-gronn-green/60 hover:shadow-[0_24px_60px_-24px_rgba(25,123,79,0.45)]"
        >
          <div
            ref={imageRef}
            className="relative aspect-[4/3] shrink-0 overflow-hidden"
          >
            <RevealImage className="absolute inset-0">
              <Photo
                src={projectImage(project)}
                alt=""
                priority={priority}
                // Two-up from sm, single column on phones; the card
                // never exceeds ~620px in the widest grid.
                sizes="(min-width: 1024px) 620px, (min-width: 640px) 50vw, 92vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div aria-hidden className="photo-glass absolute inset-0" />
            </RevealImage>
            <span className="absolute left-4 top-4 rounded-full bg-gronn-black/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-gronn-light backdrop-blur-sm">
              {t(CATEGORY_LABELS[project.category])}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-gronn-green">
              {t(project.title)}
            </h3>
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
              {project.location}
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  inProgress ? "bg-gronn-ember" : "bg-gronn-green"
                )}
              />
              {t(project.status)}
            </p>
            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground/70">
              {t(project.objective)}
            </p>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-gronn-ember">
              <span className="underline-draw">
                {t({ en: "View project", nl: "Bekijk project" })} →
              </span>
            </p>
          </div>
        </Link>
      </Tilt>
    </FadeIn>
  )
}

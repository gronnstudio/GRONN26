"use client"

import { CtaLink } from "@/components/cta-link"
import { FadeIn } from "@/components/motion/fade-in"
import { Photo } from "@/components/photo"
import { RevealImage } from "@/components/motion/reveal-image"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { projectImage } from "@/lib/placeholder"
import { CATEGORY_LABELS, type Project } from "@/lib/data/projects"
import type { L } from "@/lib/i18n"

const STORY: L[] = [
  { en: "Existing situation", nl: "Bestaande situatie" },
  { en: "Main problem", nl: "Kernprobleem" },
  { en: "Design concept", nl: "Ontwerpconcept" },
  { en: "Water circulation", nl: "Watercirculatie" },
  { en: "Biofiltration", nl: "Biofiltratie" },
  { en: "Planting and habitat", nl: "Beplanting en habitat" },
  { en: "Construction phases", nl: "Bouwfasen" },
  { en: "Ecological development", nl: "Ecologische ontwikkeling" },
]

export function FeaturedProject({ projects }: { projects: Project[] }) {
  const t = useT()
  const project = projects.find((p) => p.featured) ?? projects[0]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
      <SectionLabel index="03">
        {t({ en: "Featured Project", nl: "Uitgelicht project" })}
      </SectionLabel>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <FadeIn>
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <RevealImage className="absolute inset-0">
              <Photo
                src={projectImage(project)}
                alt={t(project.title)}
                sizes="(min-width: 1024px) 620px, 92vw"
                className="object-cover"
              />
              <div aria-hidden className="photo-glass absolute inset-0" />
            </RevealImage>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gronn-black/90 to-transparent p-6 pt-16">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-gronn-light">
                {t(CATEGORY_LABELS[project.category])} — {project.location}
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="flex flex-col justify-center">
          <FadeIn>
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {t(project.title)}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/75">
              {t(project.objective)}
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <ol className="mt-10 grid grid-cols-2 gap-x-8 gap-y-3">
              {STORY.map((step, i) => (
                <li
                  key={step.en}
                  className="flex items-baseline gap-3 text-sm text-foreground/75"
                >
                  <span className="font-mono text-xs text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {t(step)}
                </li>
              ))}
            </ol>
          </FadeIn>

          <FadeIn delay={0.25} className="mt-12">
            <CtaLink href={`/projects/${project.slug}`}>
              {t({ en: "View the Full Project", nl: "Bekijk het volledige project" })}
            </CtaLink>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

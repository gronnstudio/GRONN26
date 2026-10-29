"use client"

import { useRef } from "react"
import { LocaleLink as Link } from "@/components/locale-link"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"

import { CtaLink } from "@/components/cta-link"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { Photo } from "@/components/photo"
import { EditableImage } from "@/editor/editable-image"
import { serviceImage } from "@/lib/placeholder"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import type { Service } from "@/lib/data/services"

// Stacking service cards: each card pins beneath the header while the next
// slides up over it; covered cards ease back in scale so the pile reads as
// depth. Works at every viewport size; under reduced-motion the cards
// simply flow as a list (sticky and scale disabled).
function ServiceCard({
  service,
  index,
  total,
  progress,
  reduced,
}: {
  service: Service
  index: number
  total: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const t = useT()
  // Shrink slightly while being covered by the next card.
  const scale = useTransform(
    progress,
    [index / total, (index + 1) / total],
    [1, 0.94]
  )

  return (
    <div
      className={reduced ? "" : "sticky"}
      style={reduced ? undefined : { top: `calc(7rem + ${index * 1.5}rem)` }}
    >
      <motion.div
        style={reduced ? undefined : { scale, transformOrigin: "center top" }}
        className="mb-6 overflow-hidden rounded-xl border border-line/15 bg-surface shadow-[0_24px_60px_-30px_rgba(10,21,16,0.35)]"
      >
        <div className="grid sm:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col p-7 sm:p-10">
            <p className="font-mono text-sm text-[color:var(--ember-text)]">
              {service.index} / {String(total).padStart(2, "0")}
            </p>
            <h3 className="mt-4 font-heading text-2xl font-semibold tracking-tight sm:text-4xl">
              {t(service.title)}
            </h3>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              {t(service.summary)}
            </p>
            <ul className="mt-6 hidden flex-wrap gap-2 sm:flex">
              {service.includes.slice(0, 4).map((item) => (
                <li
                  key={item.en}
                  className="rounded-full border border-line/15 px-3 py-1.5 text-xs text-foreground/75"
                >
                  {t(item)}
                </li>
              ))}
            </ul>
            <Link
              href={`/services/${service.slug}`}
              // Same 16px caption, same fix — see services-content.tsx.
              className="tap-target group mt-auto pt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-gronn-ember active:text-gronn-ember"
            >
              <span className="underline-draw">
                {t({ en: "View service", nl: "Bekijk dienst" })} →
              </span>
            </Link>
          </div>
          <div className="relative min-h-44 sm:min-h-80">
            <EditableImage
              path={`services.slug:${service.slug}.image`}
              src={serviceImage(service)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              renderImage={({ src, alt }) => (
                <Photo
                  src={src}
                  alt={alt}
                  sizes="(min-width: 1024px) 55vw, 92vw"
                  className="object-cover"
                />
              )}
            />
            <div aria-hidden className="photo-glass absolute inset-0" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function ServicesOverview({ services }: { services: Service[] }) {
  const t = useT()
  const reduced = useReducedMotion()
  const stackRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  })

  return (
    <section className="border-y border-line/10 bg-surface/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index="06">
              {t({ en: "Services", nl: "Diensten" })}
            </SectionLabel>
            <h2 className="mt-6 max-w-xl font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {t({
                en: "Ecological design for living landscapes",
                nl: "Ecologisch ontwerp voor levende landschappen",
              })}
            </h2>
          </div>
          <CtaLink href="/services" variant="outline">
            {t({ en: "View All Services", nl: "Bekijk alle diensten" })}
          </CtaLink>
        </div>

        <div ref={stackRef} className="mt-16">
          {services.map((service, i) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={i}
              total={services.length}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

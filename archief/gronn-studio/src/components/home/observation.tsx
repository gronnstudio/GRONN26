"use client"

import { motion } from "framer-motion"

import { FadeIn } from "@/components/motion/fade-in"
import { RevealImage } from "@/components/motion/reveal-image"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { Photo } from "@/components/photo"
import { EditableImage } from "@/editor/editable-image"
import { EditableText } from "@/editor/editable-text"
import { ph } from "@/lib/placeholder"
import type { HomeContent } from "@/lib/content-types"

// Chapter 01 — Observation (Milestone 2 §4). A macro landscape image read
// like a field survey: annotation pins stagger in over the photo, each
// marking what the studio looks for before touching anything. The pins are
// positioned in % so they scale with the image.
// `side` controls which way the label flows from its dot, so pins near an
// edge always keep their label inside the frame.
// Pin positions stay code (they belong to the photograph's composition);
// the labels come from the content document.
const PIN_POSITIONS: { x: number; y: number; side: "left" | "right" }[] = [
  { x: 16, y: 72, side: "right" },
  { x: 56, y: 62, side: "right" },
  { x: 34, y: 20, side: "right" },
  { x: 84, y: 38, side: "left" },
  { x: 10, y: 44, side: "right" },
]

export function Observation({ home }: { home: HomeContent }) {
  const t = useT()
  const pins = PIN_POSITIONS.map((pos, i) => ({
    ...pos,
    label: home.observationPins[i] ?? { en: "", nl: "" },
  }))

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col justify-center">
          <SectionLabel index="01">
            {t({ en: "Observation", nl: "Observatie" })}
          </SectionLabel>
          <FadeIn>
            <h2 className="mt-8 font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <EditableText
                path="home.observationTitle"
                value={home.observationTitle}
              />
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/75">
              <EditableText
                path="home.observationBody"
                value={home.observationBody}
              />
            </p>
          </FadeIn>
        </div>

        <FadeIn>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <RevealImage className="absolute inset-0">
              <EditableImage
                path="home.observationImage"
                src={home.observationImage ?? ph(18)}
                alt={t({
                  en: "Macro landscape photograph annotated like a field survey",
                  nl: "Macro-landschapsfoto geannoteerd als een veldopname",
                })}
                className="absolute inset-0 h-full w-full object-cover"
                renderImage={({ src, alt }) => (
                  <Photo
                    src={src}
                    alt={alt}
                    sizes="(min-width: 1024px) 620px, 92vw"
                    className="object-cover"
                  />
                )}
              />
              <div aria-hidden className="photo-glass absolute inset-0" />
            </RevealImage>

            {/* Field annotations */}
            {pins.map((pin, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.25 }}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className={
                  "absolute flex -translate-y-1/2 items-center gap-2 " +
                  (pin.side === "left" ? "-translate-x-full flex-row-reverse" : "")
                }
              >
                {/* The label chip carries its own scrim; the dot does not,
                    and it is the one thing on the site whose legibility used
                    to rest entirely on the photo being darkened by the old
                    green film. Now the glass screen is subtle, so the dot
                    brings its own separation: a tight ink ring and a short
                    drop, in the same gronn-black the chip uses. It stays 6 px
                    — a survey mark reads by precision, not by size. */}
                <span className="relative flex size-3 shrink-0 items-center justify-center">
                  <span className="absolute size-3 rounded-full bg-gronn-light/40 motion-safe:animate-ping" />
                  <span className="relative size-1.5 rounded-full bg-gronn-light shadow-[0_0_0_1.5px_rgba(10,21,16,0.55),0_1px_3px_rgba(10,21,16,0.7)]" />
                </span>
                <span className="whitespace-nowrap rounded-full bg-gronn-black/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gronn-light backdrop-blur-sm">
                  <EditableText
                    path={`home.observationPins.${i}`}
                    value={pin.label}
                  />
                </span>
              </motion.span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

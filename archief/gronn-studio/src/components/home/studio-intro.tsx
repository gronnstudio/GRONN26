"use client"

import { CtaLink } from "@/components/cta-link"
import { FadeIn } from "@/components/motion/fade-in"
import { RevealText } from "@/components/motion/reveal-text"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import type { HomeContent } from "@/lib/content-types"

export function StudioIntro({ home }: { home: HomeContent }) {
  const t = useT()
  const editing = !!useEditor()?.editing

  const titleClass =
    "mt-8 font-heading text-[clamp(2.2rem,5vw,4.2rem)] font-semibold leading-[1.05] tracking-tight"

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-32 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <SectionLabel index="11">
            {t({ en: "Studio", nl: "Studio" })}
          </SectionLabel>
          {editing ? (
            <h2 className={titleClass}>
              <EditableText
                path="home.studioIntroTitle.0"
                value={home.studioIntroTitle[0]}
              />
              <br />
              <EditableText
                path="home.studioIntroTitle.1"
                value={home.studioIntroTitle[1]}
              />
            </h2>
          ) : (
            <RevealText
              inView
              lines={[t(home.studioIntroTitle[0]), t(home.studioIntroTitle[1])]}
              className={titleClass}
            />
          )}
        </div>
        <FadeIn className="flex flex-col justify-center">
          <p className="text-lg leading-relaxed text-foreground/80">
            <EditableText
              path="home.studioIntroBody"
              value={home.studioIntroBody}
            />
          </p>
          <p className="mt-6 font-heading text-xl font-semibold text-accent">
            <EditableText
              path="home.studioIntroTag"
              value={home.studioIntroTag}
            />
          </p>
          <div className="mt-10">
            <CtaLink href="/studio" variant="outline">
              {t({ en: "Meet the Studio", nl: "Maak kennis met de studio" })}
            </CtaLink>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

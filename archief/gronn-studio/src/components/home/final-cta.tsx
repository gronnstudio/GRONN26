"use client"

import { CtaLink } from "@/components/cta-link"
import { FadeIn } from "@/components/motion/fade-in"
import { Magnetic } from "@/components/motion/magnetic"
import { RevealText } from "@/components/motion/reveal-text"
import { Terrain } from "@/components/three/terrain"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import type { SiteCopy } from "@/lib/content-types"

// Closing invitation — deliberately unnumbered, like the hero: the survey
// sequence runs 01–10 between them, and this is the signature on the
// drawing rather than another chapter. The topographic field from the hero
// returns in its mature state (denser, greener) behind the closing
// statement, completing the ecological narrative arc.
export function FinalCta({ copy }: { copy: SiteCopy }) {
  const t = useT()
  const editing = !!useEditor()?.editing

  return (
    <section className="relative flex min-h-[90svh] items-center overflow-hidden border-t border-line/10">
      <Terrain mature className="absolute inset-0 opacity-80" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,123,79,0.18),transparent_65%)]"
      />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-32 text-center sm:px-6">
        {editing ? (
          <h2 className="font-heading text-[clamp(2rem,5vw,4.2rem)] font-semibold leading-[1.1] tracking-tight">
            <EditableText path="siteCopy.ctaTitle.0" value={copy.ctaTitle[0]} />
            <br />
            <EditableText path="siteCopy.ctaTitle.1" value={copy.ctaTitle[1]} />
          </h2>
        ) : (
          <RevealText
            inView
            byWord
            lines={[t(copy.ctaTitle[0]), t(copy.ctaTitle[1])]}
            className="font-heading text-[clamp(2rem,5vw,4.2rem)] font-semibold leading-[1.1] tracking-tight"
          />
        )}
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-foreground/75">
            <EditableText path="siteCopy.ctaSubtitle" value={copy.ctaSubtitle} />
          </p>
        </FadeIn>
        <FadeIn
          delay={0.3}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
        >
          <CtaLink href="/contact">
            {t({ en: "Start a Project", nl: "Start een project" })}
          </CtaLink>
          <Magnetic>
            <a
              href="mailto:hello@gronn.studio"
              data-sensitive
              // 18px tall as drawn, and it is the e-mail address on the
              // home page's closing call to action — the last thing a
              // visitor is offered. The footer's copy of this link has
              // carried `tap-target` for a while; this one was missed.
              className="tap-target underline-draw font-mono text-sm tracking-wide text-foreground/85 transition-colors hover:text-foreground active:text-foreground"
            >
              hello@gronn.studio
            </a>
          </Magnetic>
        </FadeIn>
      </div>
    </section>
  )
}

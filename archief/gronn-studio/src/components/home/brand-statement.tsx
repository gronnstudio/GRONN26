"use client"

import { FadeIn } from "@/components/motion/fade-in"
import { RevealText } from "@/components/motion/reveal-text"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import type { HomeContent } from "@/lib/content-types"

export function BrandStatement({ home }: { home: HomeContent }) {
  const t = useT()
  const editing = !!useEditor()?.editing

  const titleClass =
    "mt-10 font-heading text-[clamp(2rem,5.5vw,4.4rem)] font-semibold leading-[1.1] tracking-tight text-foreground"

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 sm:py-44">
      <SectionLabel index="07">
        {t({ en: "Philosophy", nl: "Filosofie" })}
      </SectionLabel>
      {editing ? (
        <h2 className={titleClass}>
          <EditableText path="home.brandTitle.0" value={home.brandTitle[0]} />
          <br />
          <EditableText path="home.brandTitle.1" value={home.brandTitle[1]} />
        </h2>
      ) : (
        <RevealText
          inView
          byWord
          lines={[t(home.brandTitle[0]), t(home.brandTitle[1])]}
          className={titleClass}
        />
      )}
      <FadeIn delay={0.2} className="mt-10 max-w-2xl">
        <p className="text-lg leading-relaxed text-foreground/75">
          <EditableText path="home.brandBody" value={home.brandBody} />
        </p>
      </FadeIn>
    </section>
  )
}

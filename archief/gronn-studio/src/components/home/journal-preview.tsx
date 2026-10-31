"use client"

import { LocaleLink as Link } from "@/components/locale-link"

import { CtaLink } from "@/components/cta-link"
import { FadeIn } from "@/components/motion/fade-in"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import type { Article } from "@/lib/data/journal"

export function JournalPreview({ articles }: { articles: Article[] }) {
  const t = useT()

  return (
    <section className="border-y border-line/10 bg-surface/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-28 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index="10">
              {t({ en: "Field Notes", nl: "Veldnotities" })}
            </SectionLabel>
            <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {t({ en: "From the journal", nl: "Uit het journaal" })}
            </h2>
          </div>
          <CtaLink href="/journal" variant="outline">
            {t({ en: "Read the Journal", nl: "Lees het journaal" })}
          </CtaLink>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line/10 bg-line/10 md:grid-cols-3">
          {articles.slice(0, 3).map((article, i) => (
            <FadeIn key={article.slug} delay={i * 0.08} className="bg-background">
              <Link
                href={`/journal/${article.slug}`}
                className="group flex h-full flex-col p-8"
              >
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
                  {t(article.category)}
                </p>
                <h3 className="mt-4 font-heading text-2xl font-semibold leading-snug text-foreground transition-colors group-hover:text-gronn-green">
                  {t(article.title)}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {t(article.excerpt)}
                </p>
                <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors group-hover:text-gronn-ember">
                  <span className="underline-draw">
                    {t({ en: "Read note", nl: "Lees notitie" })} →
                  </span>
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { ArrowUpRightIcon } from "lucide-react"

import { FadeIn } from "@/components/motion/fade-in"
import { SectionLabel } from "@/components/section-label"
import { useT } from "@/components/language-provider"
import {
  CONCEPTS,
  CONCEPT_CAUTIONS,
  CONCEPT_SOURCE,
  type Concept,
} from "@/lib/data/concepts"
import { cn } from "@/lib/utils"

// Section 05 — what has NOT been built.
//
// The three sections above say what this site runs on; Evolution says
// how it got here. This says what somebody thought was still missing,
// which is the part a stack page normally leaves out because it is the
// part that is not finished.
//
// Everything here is marked as a proposal and dated, and where the
// source's claim did not survive a read of the codebase, the correction
// stands next to it rather than replacing it. See the note at the top of
// `lib/data/concepts.ts` — that rule is the reason this is publishable
// at all.

const TIER_LABEL: Record<1 | 2 | 3, { en: string; nl: string }> = {
  1: { en: "First — the ones that earn", nl: "Eerst — die geld opleveren" },
  2: { en: "Then — trust and findability", nl: "Dan — vertrouwen en vindbaarheid" },
  3: { en: "If there is time", nl: "Als er tijd over is" },
}

export function Concepts() {
  const t = useT()
  const tiers: (1 | 2 | 3)[] = [1, 2, 3]

  return (
    <section className="border-t border-line/10">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionLabel index="05">
              {t({ en: "Conceptual", nl: "Conceptueel" })}
            </SectionLabel>
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              {CONCEPT_SOURCE.when}
            </p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
              {t(CONCEPT_SOURCE.what)}
            </p>
          </div>

          <FadeIn>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              {t({
                en: "Not built, and said out loud",
                nl: "Niet gebouwd, en hardop gezegd",
              })}
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              {t(CONCEPT_SOURCE.intro)}
            </p>
            {/* The status is on the page, not implied by the heading.
                A list of intentions that reads like a changelog is how a
                stack page starts lying about what it ships. */}
            <p className="mt-4 max-w-2xl text-[13px] leading-relaxed text-muted">
              {t({
                en: "None of this is a commitment. It is a proposal with a date and a source on it, kept where the built things are because a list of intentions nobody can see is a list nobody is accountable to.",
                nl: "Niets hiervan is een toezegging. Het is een voorstel met een datum en een bron, bewaard waar het gebouwde staat — want een lijst met voornemens die niemand kan zien is een lijst waar niemand op is aan te spreken.",
              })}
            </p>

            {tiers.map((tier) => {
              const inTier = CONCEPTS.filter((c) => c.tier === tier)
              if (!inTier.length) return null
              return (
                <div key={tier} className="mt-14">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                    {t(TIER_LABEL[tier])}
                  </p>
                  <div className="mt-6 space-y-10">
                    {inTier.map((c) => (
                      <ConceptBlock key={c.id} concept={c} />
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="mt-14 grid gap-px border border-line/15 bg-line/15 sm:grid-cols-2">
              {CONCEPT_CAUTIONS.map((n) => (
                <div key={n.title.en} className="bg-background p-5">
                  <h3 className="font-heading text-[15px] font-semibold">
                    {t(n.title)}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {t(n.body)}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function ConceptBlock({ concept }: { concept: Concept }) {
  const t = useT()
  return (
    <article className="border-t border-line/15 pt-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-heading text-lg font-semibold">{t(concept.title)}</h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {t(concept.where)}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {t({ en: "Now", nl: "Nu" })}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">
            {t(concept.now)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ember-text)]">
            {t({ en: "Gap", nl: "Gat" })}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">
            {t(concept.gap)}
          </p>
        </div>
      </div>

      {/* The correction, where there is one. An ember rule rather than a
          colour swap: this is the paragraph that says the claim above it
          did not hold, and it should read as an annotation on the
          finding rather than as a fourth column of the same weight. */}
      {concept.verdict && (
        <div className="mt-4 border-l-2 border-gronn-ember pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ember-text)]">
            {t({ en: "Checked", nl: "Nagekeken" })}
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">
            {t(concept.verdict)}
          </p>
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {concept.picks.map((p) => (
          <li key={p.href} className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
            <div>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "tap-target inline-flex items-center gap-1 text-[14px] transition-colors hover:text-gronn-ember active:text-gronn-ember",
                  p.lead ? "font-semibold text-foreground" : "text-foreground/85"
                )}
              >
                {p.name}
                <ArrowUpRightIcon size={13} aria-hidden className="shrink-0" />
              </a>
              <span className="block font-mono text-[10.5px] tracking-[0.06em] text-muted">
                {p.author}
              </span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted">
              {p.lead && (
                <span className="font-medium text-foreground/85">
                  {t({ en: "The pick. ", nl: "De keuze. " })}
                </span>
              )}
              {t(p.why)}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}

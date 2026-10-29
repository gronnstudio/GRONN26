"use client"

import { CountUp } from "@/components/motion/count-up"
import { FadeIn } from "@/components/motion/fade-in"
import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import type { Outcome } from "@/lib/data/projects"

// Outcome data as layout (campaign Phase 2): each result is a full-width
// row whose measured value is the largest thing on it — before in muted,
// an ember survey arrow, after counting up at display scale. The rows
// share the site's field-annotation language: mono label, thin rule,
// quiet note. Values are placeholder fiction until the owner's real
// project data lands (owner decision 2 Aug 2026); the layout is the
// deliverable.
export function Outcomes({
  outcomes,
  basePath,
}: {
  outcomes: Outcome[]
  basePath: string
}) {
  const t = useT()
  return (
    <div className="mt-8 border-t border-line/10">
      {outcomes.map((outcome, i) => (
        <FadeIn key={outcome.label.en}>
          <div className="flex flex-col gap-4 border-b border-line/10 py-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
            <div className="max-w-sm">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <EditableText
                  path={`${basePath}.outcomes.${i}.label`}
                  value={outcome.label}
                />
              </p>
              {outcome.note && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <EditableText
                    path={`${basePath}.outcomes.${i}.note`}
                    value={outcome.note}
                  />
                </p>
              )}
            </div>
            <p className="flex shrink-0 items-baseline gap-3 font-heading font-semibold leading-none">
              {outcome.before && (
                <>
                  <span className="text-xl text-muted sm:text-2xl">
                    {t(outcome.before)}
                  </span>
                  {/* The arrow is a marker, so it carries ember; a
                      screen reader gets "to" instead of a glyph. */}
                  <span aria-hidden className="text-xl text-gronn-ember sm:text-2xl">
                    →
                  </span>
                  <span className="sr-only">{t({ en: "to", nl: "naar" })}</span>
                </>
              )}
              <span className="text-5xl tracking-tight text-accent sm:text-6xl">
                <CountUp value={t(outcome.after)} />
              </span>
            </p>
          </div>
        </FadeIn>
      ))}
    </div>
  )
}

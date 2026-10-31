"use client"

import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import type { HomeContent } from "@/lib/content-types"

// A slim ecological ticker between chapters — quiet, mono, annotation-like.
// One slow line, seamless loop (content duplicated once, track translates
// -50%); frozen under reduced-motion. In edit mode the loop pauses and a
// single editable line shows instead.
export function Marquee({ home }: { home: HomeContent }) {
  const t = useT()
  const editing = !!useEditor()?.editing
  const line = t(home.ticker)

  if (editing) {
    return (
      <section className="overflow-hidden border-y border-line/10 py-5">
        <p className="text-center font-mono text-xs uppercase tracking-[0.35em] text-accent/85">
          <EditableText path="home.ticker" value={home.ticker} />
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label={line.trim()}
      className="overflow-hidden border-y border-line/10 py-5"
    >
      <div className="flex">
        <div
          aria-hidden
          className="flex shrink-0 motion-safe:animate-[marquee_60s_linear_infinite] motion-reduce:animate-none"
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className="whitespace-pre font-mono text-xs uppercase tracking-[0.35em] text-accent/85"
            >
              {line.repeat(6)}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

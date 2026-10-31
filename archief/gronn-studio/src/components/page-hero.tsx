"use client"

import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { useT } from "@/components/language-provider"
import { RevealText } from "@/components/motion/reveal-text"
import { SectionLabel } from "@/components/section-label"
import { EditableText } from "@/editor/editable-text"
import { useEditor } from "@/editor/editor-context"
import type { L } from "@/lib/i18n"
import type { Crumb } from "@/lib/nav"

// Shared editorial header for inner pages: annotation label + oversized
// Syne headline over the page background. All copy is Localized. When
// `editBase` is provided the headline/intro become editable in edit
// mode (paths `<editBase>.heroTitle.<i>` / `<editBase>.heroIntro`).
export function PageHero({
  label,
  lines,
  intro,
  editBase,
  trail,
}: {
  label: L
  lines: readonly L[]
  intro?: L
  editBase?: string
  /** Detail pages only: the path this page hangs from. */
  trail?: Crumb[]
}) {
  const t = useT()
  const editing = !!useEditor()?.editing

  const headlineClass =
    "mt-8 max-w-4xl font-heading text-[clamp(2.2rem,5.5vw,4.4rem)] font-semibold leading-[1.06] tracking-tight"

  return (
    <header className="mx-auto w-full max-w-7xl px-4 pb-20 pt-40 sm:px-6 sm:pt-48">
      {trail && (
        <div className="mb-8">
          <Breadcrumbs trail={trail} />
        </div>
      )}
      <SectionLabel>{t(label)}</SectionLabel>
      {editing && editBase ? (
        <h1 className={headlineClass}>
          {lines.map((line, i) => (
            <span key={i} className="block">
              <EditableText path={`${editBase}.heroTitle.${i}`} value={line} />
            </span>
          ))}
        </h1>
      ) : (
        <RevealText
          as="h1"
          lines={lines.map(t)}
          delay={0.15}
          className={headlineClass}
        />
      )}
      {intro && (
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/75">
          {editBase ? (
            <EditableText path={`${editBase}.heroIntro`} value={intro} />
          ) : (
            t(intro)
          )}
        </p>
      )}
    </header>
  )
}

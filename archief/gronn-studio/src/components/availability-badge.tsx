"use client"

import { LocaleLink as Link } from "@/components/locale-link"

import { useT } from "@/components/language-provider"
import { EditableText } from "@/editor/editable-text"
import { cn } from "@/lib/utils"
import type { L } from "@/lib/i18n"

// Availability signal with a breathing dot — links straight to the intake.
// Copy stays generic (no invented capacity numbers). The label can come
// from editable site content; the literal below is the fallback.
export function AvailabilityBadge({
  label,
  editPath,
  className,
}: {
  label?: L
  /** Content-document path; makes the label editable in edit mode. */
  editPath?: string
  className?: string
}) {
  const t = useT()

  return (
    <Link
      href="/contact"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full border border-line/20 py-2 pl-3 pr-4 transition-colors hover:border-gronn-green",
        className
      )}
    >
      <span className="relative flex size-2.5 items-center justify-center">
        <span className="absolute size-2.5 rounded-full bg-gronn-green/40 motion-safe:animate-ping" />
        <span className="relative size-1.5 rounded-full bg-gronn-green" />
      </span>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/80 transition-colors group-hover:text-foreground">
        {label && editPath ? (
          <EditableText path={editPath} value={label} />
        ) : (
          t(
            label ?? {
              en: "Taking new projects",
              nl: "Ruimte voor nieuwe projecten",
            }
          )
        )}
      </span>
    </Link>
  )
}

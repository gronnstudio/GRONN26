import { cn } from "@/lib/utils"

// Field-annotation style section marker: "01 / Observation" — small, spaced
// mono caps, like a label pinned to a survey drawing. Colors ride the
// semantic tokens: `accent` is each palette's readable brand green (raw
// gronn-green is 3.4:1 on Nocturne — fails WCAG for 12px text), and the
// index uses the ember-text token, deepened on light themes for the same
// reason.
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.25em] text-accent",
        className
      )}
    >
      {index && (
        <span className="text-[color:var(--ember-text)]">{index}</span>
      )}
      <span aria-hidden className="h-px w-8 bg-accent/50" />
      {children}
    </p>
  )
}

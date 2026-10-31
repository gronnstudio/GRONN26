import Link from "next/link"
import { ArrowUpRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { buttonArrow, card, cardFilled, figure, label } from "@/app/dashboard/ui"
import { cn } from "@/lib/utils"

// The KPI row, and the honesty rule inside it.
//
// These were module-private helpers in the old overview page, so nothing
// else could use them and a second dashboard would have retyped the one
// part worth keeping: `delta` refuses to invent a percentage. That is not
// fussiness. "+∞%" from a zero baseline and "0% vs 0" are the two lies
// every dashboard tells in its first month, and this studio's first month
// is now.

export type Delta = { pct: number; up: boolean } | { fresh: true } | null

/**
 * Period against period.
 *
 * `null` when there is nothing to compare in either direction, and
 * `fresh` when the previous period was empty but this one is not —
 * because dividing by zero to get a percentage is how a dashboard starts
 * lying to the person who depends on it.
 */
export function delta(now: number, before: number): Delta {
  if (now === 0 && before === 0) return null
  if (before === 0) return { fresh: true }
  const pct = ((now - before) / before) * 100
  return { pct: Math.abs(Math.round(pct)), up: pct >= 0 }
}

export function DeltaChip({
  delta: d,
  label: text,
  onFill = false,
}: {
  delta: Delta
  label: string
  /** Inside the filled green card, where ember is 1.63:1 and unusable. */
  onFill?: boolean
}) {
  if (!d) return null
  if ("fresh" in d) {
    return (
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-[0.1em]",
          // White at any opacity below 100% fails AA on brand green
          // (white/90 is already 4.28:1), so the filled card differs by
          // size and weight, never by transparency.
          onFill ? "text-gronn-white" : "text-accent"
        )}
      >
        nieuw {text}
      </span>
    )
  }
  const Icon = d.up ? TrendingUpIcon : TrendingDownIcon
  return (
    <span
      className={cn(
        "flex items-center gap-1 font-mono text-[10.5px] tabular-nums",
        onFill
          ? "text-gronn-white"
          : d.up
            ? "text-accent"
            : "text-[color:var(--ember-text)]"
      )}
    >
      <Icon size={12} aria-hidden />
      {d.up ? "+" : "−"}
      {d.pct}%{" "}
      <span className={onFill ? "text-gronn-white" : "text-muted"}>{text}</span>
    </span>
  )
}

/**
 * One figure, its name, and where it goes when clicked.
 *
 * `filled` is the reference's first card: brand green under white text,
 * which is one of exactly two fills in this system that CI guarantees at
 * AA. It needs no border — green separates from every one of the ten
 * palette grounds by at least 3:1.
 */
export function StatCard({
  title,
  value,
  note,
  href,
  delta: d,
  deltaLabel = "t.o.v. vorige maand",
  filled = false,
}: {
  title: string
  value: string
  note?: string
  href?: string
  delta?: Delta
  deltaLabel?: string
  filled?: boolean
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-[13px] font-medium leading-tight",
            filled ? "text-gronn-white" : "text-foreground"
          )}
        >
          {title}
        </p>
        {href && (
          <span
            aria-hidden
            className={cn(
              buttonArrow,
              filled
                ? "border-gronn-white/40 text-gronn-white group-hover:bg-gronn-white group-hover:text-gronn-green"
                : "border-line/20 text-muted group-hover:border-gronn-ember group-hover:text-gronn-ember"
            )}
          >
            <ArrowUpRightIcon size={15} />
          </span>
        )}
      </div>
      <p className={cn(figure, "mt-6", filled && "text-gronn-white")}>{value}</p>
      <div className="mt-3 flex min-h-[1.1rem] items-center gap-2">
        {d ? (
          <DeltaChip delta={d} label={deltaLabel} onFill={filled} />
        ) : note ? (
          <span
            className={cn(
              "text-[11.5px] leading-tight",
              filled ? "text-gronn-white" : "text-muted"
            )}
          >
            {note}
          </span>
        ) : null}
      </div>
    </>
  )

  const shell = cn(
    "group block p-5 transition-colors",
    filled ? cardFilled : card,
    href && !filled && "hover:border-gronn-ember/40"
  )

  return href ? (
    <Link
      href={href}
      className={cn(
        shell,
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  )
}

/* ------------------------------------------------------------------ chip */

export type PillTone = "ok" | "warn" | "quiet"

/** The status vocabulary, matching the documents table's existing chips. */
export function StatusPill({
  children,
  tone = "quiet",
}: {
  children: React.ReactNode
  tone?: PillTone
}) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full border px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
        tone === "ok" && "border-accent text-accent",
        tone === "warn" && "border-gronn-ember text-[color:var(--ember-text)]",
        tone === "quiet" && "border-line/25 text-muted"
      )}
    >
      {children}
    </span>
  )
}

export { label }

"use client"

import { motion } from "framer-motion"

import { useReducedMotion } from "@/lib/use-reduced-motion"
import { euro } from "@/lib/format"
import { cn } from "@/lib/utils"

// Two charts, no chart library.
//
// AGENTS.md forbids adding one, and `season-year.tsx` already showed
// what the house answer looks like: divs, percentages, an `sr-only`
// sentence per row and a mono legend. These are the same recipe standing
// up instead of lying down.
//
// The reference's seven weekday bars have no honest source here — a
// one-person studio does not invoice on a weekday rhythm, and a trend
// line through two points says whatever you want it to. What IS real is
// the month, so these are the last months, and a month with nothing in
// it is hatched rather than drawn as a zero: a missing bar and a bar
// worth nothing look identical otherwise.

export type MonthBar = { key: string; label: string; value: number }

export function MonthBars({ months }: { months: MonthBar[] }) {
  const reduced = useReducedMotion()
  const peak = Math.max(...months.map((m) => m.value), 0)
  const anyValue = peak > 0

  return (
    <div>
      {/* Tighter gaps and no letter-spacing on a phone: twelve bars at
          320px leave about 17px each, and "JAN" spaced at 0.1em is 19. */}
      <div className="flex h-44 items-end gap-[6px] sm:gap-2.5">
        {months.map((m, i) => {
          const share = peak > 0 ? m.value / peak : 0
          const empty = m.value <= 0
          const last = i === months.length - 1
          return (
            <div key={m.key} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="relative flex w-full flex-1 items-end">
                {empty ? (
                  <div
                    aria-hidden
                    className="hatch h-full w-full rounded-full border border-line/10"
                  />
                ) : (
                  <motion.div
                    aria-hidden
                    className={cn(
                      "w-full rounded-full",
                      last ? "bg-gronn-green" : "bg-accent/45"
                    )}
                    // The house fallback: the final state as the initial
                    // state, never a removed element.
                    initial={reduced ? { height: `${Math.max(share * 100, 6)}%` } : { height: 0 }}
                    animate={{ height: `${Math.max(share * 100, 6)}%` }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }
                    }
                  />
                )}
              </div>
              <span className="mt-2 block w-full truncate text-center font-mono text-[9px] uppercase tracking-normal text-muted sm:tracking-[0.1em]">
                {m.label}
              </span>
              <span className="sr-only">
                {m.label}: {empty ? "niets gefactureerd" : euro(m.value)}
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-gronn-green" /> deze maand
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-accent/45" /> eerder
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="hatch size-2 rounded-full border border-line/20" />{" "}
          niets
        </span>
      </p>
      {!anyValue && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
          Nog niets gefactureerd. Zodra er een factuur met een datum staat,
          verschijnt hij hier — dit is geen voorbeeld, het is leeg.
        </p>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- gauge */

/**
 * One share, as an arc.
 *
 * Two stacked circles rather than one with a dash pattern: framer drives
 * `pathLength` by writing `stroke-dasharray`, so an animated arc cannot
 * also carry a static dashed track — `lost-marker.tsx:221` documents the
 * same trap. The track is its own circle, and the hatched remainder its
 * own again.
 */
export function Gauge({
  share,
  caption,
  subCaption,
}: {
  /** 0–1. */
  share: number
  caption: string
  subCaption: string
}) {
  const reduced = useReducedMotion()
  const clamped = Math.max(0, Math.min(1, share))
  const pct = Math.round(clamped * 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[15rem]">
        <svg viewBox="0 0 120 120" className="w-full -rotate-90" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="var(--line)"
            strokeOpacity="0.14"
            strokeWidth="14"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="var(--gronn-green)"
            strokeWidth="14"
            strokeLinecap="round"
            initial={reduced ? { pathLength: clamped } : { pathLength: 0 }}
            animate={{ pathLength: clamped }}
            transition={reduced ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="font-heading text-[2.1rem] font-semibold leading-none tabular-nums text-foreground">
            {pct}%
          </p>
          <p className="mt-1 text-[12px] text-muted">{caption}</p>
        </div>
      </div>
      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted">
        {subCaption}
      </p>
    </div>
  )
}

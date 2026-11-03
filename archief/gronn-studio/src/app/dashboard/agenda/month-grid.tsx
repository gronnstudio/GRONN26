"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { card, cardTitle, label } from "@/app/dashboard/ui"
import { cn } from "@/lib/utils"

// The year the studio actually works in.
//
// A garden business does not run on a rolling backlog; it runs on short
// windows that open and shut. The leaf net is worthless by mid-November
// and winterising has to happen before the first frost, so "what is due"
// is a question about the calendar and nothing else could answer it.
//
// Everything on this grid already existed as data — the season windows
// from the Verdienmodellen document, the "geldig tot" on a quote, the
// due date on an invoice. Nothing was invented to fill a square.
//
// Plain divs and a seven-column grid. No calendar library, for the same
// reason there is no chart library.

export type AgendaMark = {
  /** ISO date, YYYY-MM-DD. */
  date: string
  kind: "quote" | "invoice" | "intake"
  label: string
  sub: string
  href: string
  /** Past its date and still not settled. */
  late?: boolean
}

export type AgendaWindow = {
  slug: string
  title: string
  /** MM-DD, inclusive. */
  from: string
  to: string
}

const DAY_NAMES = ["ma", "di", "wo", "do", "vr", "za", "zo"]
const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
]

const KIND_LABEL = { quote: "Offerte", invoice: "Factuur", intake: "Intake" } as const

/** Monday-first index, because a Dutch week starts on Monday. */
function weekday(d: Date): number {
  return (d.getUTCDay() + 6) % 7
}

function iso(y: number, m: number, day: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Is `MM-DD` inside the window? Windows may wrap past new year. */
function inWindow(monthDay: string, w: AgendaWindow): boolean {
  return w.from <= w.to
    ? monthDay >= w.from && monthDay <= w.to
    : monthDay >= w.from || monthDay <= w.to
}

export function MonthGrid({
  marks,
  windows,
  todayISO,
}: {
  marks: AgendaMark[]
  windows: AgendaWindow[]
  /** Passed in rather than read here, so the server and the first client
      paint agree on which square is today. */
  todayISO: string
}) {
  const [year, month] = (() => {
    const [y, m] = todayISO.split("-").map(Number)
    return [y, m - 1]
  })()
  const [view, setView] = useState({ year, month })
  const [picked, setPicked] = useState<string | null>(todayISO)

  const first = new Date(Date.UTC(view.year, view.month, 1))
  const days = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const lead = weekday(first)

  const byDate = new Map<string, AgendaMark[]>()
  for (const m of marks) {
    const list = byDate.get(m.date)
    if (list) list.push(m)
    else byDate.set(m.date, [m])
  }

  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => iso(view.year, view.month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const step = (delta: number) => {
    const d = new Date(Date.UTC(view.year, view.month + delta, 1))
    setView({ year: d.getUTCFullYear(), month: d.getUTCMonth() })
    setPicked(null)
  }

  const openWindows = (date: string) =>
    windows.filter((w) => inWindow(date.slice(5), w))

  const pickedMarks = picked ? (byDate.get(picked) ?? []) : []
  const pickedWindows = picked ? openWindows(picked) : []

  return (
    <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
      <section className={cn(card, "p-5")}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={cardTitle}>
            {MONTHS[view.month]} {view.year}
          </h2>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Vorige maand"
              className="tap-target rounded-lg border border-line/20 p-1.5 text-muted transition-colors hover:border-gronn-ember hover:text-foreground"
            >
              <ChevronLeftIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Volgende maand"
              className="tap-target rounded-lg border border-line/20 p-1.5 text-muted transition-colors hover:border-gronn-ember hover:text-foreground"
            >
              <ChevronRightIcon size={15} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <span
              key={d}
              className="pb-1 text-center font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted"
            >
              {d}
            </span>
          ))}

          {cells.map((date, i) => {
            if (!date) return <span key={`pad-${i}`} />
            const day = Number(date.slice(8))
            const open = openWindows(date)
            const items = byDate.get(date) ?? []
            const isToday = date === todayISO
            const isPicked = date === picked
            return (
              <button
                key={date}
                type="button"
                onClick={() => setPicked(date)}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg border text-[13px] tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]",
                  open.length > 0 ? "bg-gronn-green/10" : "bg-transparent",
                  isPicked
                    ? "border-gronn-green text-foreground"
                    : isToday
                      ? "border-gronn-ember text-foreground"
                      : "border-transparent text-muted hover:border-line/25"
                )}
              >
                <span className={cn(isToday && "font-semibold text-foreground")}>
                  {day}
                </span>
                {items.length > 0 && (
                  <span className="mt-1 flex gap-0.5" aria-hidden>
                    {items.slice(0, 3).map((m, n) => (
                      <span
                        key={n}
                        className={cn(
                          "size-1.5 rounded-full",
                          m.late ? "bg-gronn-ember" : "bg-accent"
                        )}
                      />
                    ))}
                  </span>
                )}
                <span className="sr-only">
                  {day} {MONTHS[view.month]}
                  {open.length ? `, ${open.map((w) => w.title).join(", ")}` : ""}
                  {items.length ? `, ${items.length} met een datum` : ""}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded bg-gronn-green/25" /> venster open
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-accent" /> loopt af
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-gronn-ember" /> te laat
          </span>
        </p>
      </section>

      <section className={cn(card, "p-5")}>
        <h2 className={cardTitle}>
          {picked
            ? `${Number(picked.slice(8))} ${MONTHS[Number(picked.slice(5, 7)) - 1]}`
            : "Kies een dag"}
        </h2>

        {pickedWindows.length > 0 && (
          <>
            <p className={cn(label, "mt-4")}>Vensters open</p>
            <ul className="mt-2 space-y-1.5">
              {pickedWindows.map((w) => (
                <li key={w.slug} className="flex items-center gap-2 text-[13px] text-foreground">
                  <span aria-hidden className="size-2 shrink-0 rounded-full bg-gronn-green" />
                  {w.title}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className={cn(label, "mt-5")}>Met een datum</p>
        {pickedMarks.length === 0 ? (
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Niets op deze dag.
          </p>
        ) : (
          <ul className="mt-2 space-y-2.5">
            {pickedMarks.map((m, i) => (
              <li key={`${m.href}-${i}`}>
                <Link
                  href={m.href}
                  className="block rounded-lg border border-line/12 p-3 transition-colors hover:border-gronn-ember/40"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        m.late ? "bg-gronn-ember" : "bg-accent"
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                      {m.label}
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted">
                      {KIND_LABEL[m.kind]}
                    </span>
                  </span>
                  <span className="mt-1 block truncate font-mono text-[11px] text-muted">
                    {m.sub}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

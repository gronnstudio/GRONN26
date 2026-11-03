"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRightIcon } from "lucide-react"

import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/i18n"
import type { Lead, OsProject, Stage, Telemetry } from "@/lib/os/data"
import { say, tr } from "@/lib/os/i18n"
import { STALE_AFTER_DAYS, euroShort } from "@/lib/os/data"

// THE GRØNN CORE — the centre of /os.
//
// A living architectural diagram, read from the inside out:
//
//   centre   the four figures that say how the studio is doing
//   ring 1   hours this month against a working month (160 h)
//   ring 2   the pipeline: one arc per open lead, length = its value
//   orbit    every project as a node, placed by its STAGE, so the angle
//            itself says how far along the lifecycle it is (Lead at the
//            top, clockwise to Completed)
//   ring 4   the year, with a mark on today's month
//
// The SVG draws; the HTML layer on top carries every label and every
// control, so the text is real text (selectable, zoomable, read by a
// screen reader) and every node is a real button or link.
//
// Motion: the rings draw themselves once on load, which says "this is
// being measured". After that only one thing moves on its own: a halo on
// a node that needs attention. Hover or focus a node and a dotted line
// ties it to the centre and its card opens beside it.

const SIZE = 600
const C = SIZE / 2
const R_HOURS = 118
const R_PIPE = 142
const R_ORBIT = 200
const R_YEAR = 262
const MONTH_HOURS = 160

const STAGE_ORDER: Stage[] = [
  "Lead",
  "Intake",
  "Design",
  "Quotation",
  "Approved",
  "Planning",
  "Execution",
  "Waiting",
  "Completed",
]
// Stages share the orbit from -90° (top) clockwise over 300°, leaving a
// gap before the top so "Completed" never touches "Lead".
const stageAngle = (s: Stage) => -90 + (STAGE_ORDER.indexOf(s) / (STAGE_ORDER.length - 1)) * 300

// Rounded to 1/100: the server and the browser disagree in the last
// digits of Math.cos, and unrounded coordinates are a hydration mismatch.
const round = (n: number) => Math.round(n * 100) / 100
const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: round(C + r * Math.cos(a)), y: round(C + r * Math.sin(a)) }
}

function arc(r: number, from: number, to: number) {
  const a = polar(r, from)
  const b = polar(r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

export function GronnCore({
  projects,
  leads,
  telemetry,
  month,
  locale,
}: {
  projects: OsProject[]
  leads: Lead[]
  telemetry: Telemetry
  /** 0–11, from the server's clock, so server and client draw the same. */
  month: number
  locale: Locale
}) {
  const t = (en: string, nl: string) => tr(locale, en, nl)
  const s = (text: string) => say(locale, text)
  const reduced = useReducedMotion()
  const [focus, setFocus] = useState<string | null>(null)

  // Two projects on the same stage would sit on top of each other; nudge
  // the second one along the orbit.
  const placed = projects.map((p, i) => {
    const twins = projects.slice(0, i).filter((q) => q.stage === p.stage).length
    const deg = stageAngle(p.stage) + twins * 14
    return { p, deg, ...polar(R_ORBIT, deg) }
  })

  // Only leads with an amount get an arc: a lead nobody has priced has no
  // length to draw, and a zero-length arc is a glitch, not a fact.
  const openLeads = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost" && l.value > 0)
  const pipeTotal = openLeads.reduce((s, l) => s + l.value, 0)
  // Each arc starts where the ones before it end, with a 4° gap.
  const pipeArcs = openLeads.map((l, i) => {
    const start = -90 + openLeads.slice(0, i).reduce((s, x) => s + (x.value / pipeTotal) * 360, 0)
    const span = Math.max((l.value / pipeTotal) * 360 - 4, 1)
    return {
      l,
      d: arc(R_PIPE, start + 2, start + 2 + span),
      mid: polar(R_PIPE, start + 2 + span / 2),
      stale: l.lastContactDays >= STALE_AFTER_DAYS,
    }
  })

  const hoursSpan = Math.min((telemetry.hoursThisMonth ?? 0) / MONTH_HOURS, 1) * 359.9
  const draw = (delay: number) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] as const },
        }

  const focused = placed.find((n) => n.p.slug === focus)

  return (
    <figure className="relative mx-auto aspect-square w-[64%] max-w-[640px] sm:w-full" aria-labelledby="core-caption">
      <figcaption id="core-caption" className="sr-only">
        {t(
          `The GRØNN Core: ${telemetry.activeProjects} active projects, ${telemetry.leads} leads, ${euroShort(telemetry.pipeline)} in the pipeline, ${telemetry.hoursThisMonth ?? "no"} hours this month. Each project is placed around the circle by its stage.`,
          `De GRØNN-kern: ${telemetry.activeProjects} actieve projecten, ${telemetry.leads} leads, ${euroShort(telemetry.pipeline)} in de pijplijn, ${telemetry.hoursThisMonth ?? "geen"} uur deze maand. Elk project staat op de cirkel naar zijn fase.`
        )}
      </figcaption>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full" aria-hidden>
        {/* The year */}
        <circle cx={C} cy={C} r={R_YEAR} className="os-core-ring" />
        {MONTHS.map((m, i) => {
          const deg = -90 + i * 30
          const a = polar(R_YEAR - 5, deg)
          const b = polar(R_YEAR + 5, deg)
          const t = polar(R_YEAR + 18, deg)
          const now = i === month
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="os-core-tick" />
              <text
                x={t.x}
                y={t.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn("font-mono", now ? "os-core-text" : "os-core-text-3")}
                fontSize={11}
              >
                {m}
              </text>
            </g>
          )
        })}
        <motion.path
          d={arc(R_YEAR, -90, -90 + month * 30 + 15)}
          className="os-core-arc"
          {...draw(0.1)}
        />

        {/* The orbit, with a tick for every stage */}
        <circle cx={C} cy={C} r={R_ORBIT} className="os-core-ring" strokeDasharray="1 5" />
        {STAGE_ORDER.map((s) => {
          const a = polar(R_ORBIT - 4, stageAngle(s))
          const b = polar(R_ORBIT + 4, stageAngle(s))
          return <line key={s} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="os-core-tick" />
        })}

        {/* The pipeline: one arc per open lead */}
        <circle cx={C} cy={C} r={R_PIPE} className="os-core-ring" />
        {pipeArcs.map(({ l, d }, i) => (
          <motion.path key={l.id} d={d} className="os-core-arc" {...draw(0.3 + i * 0.08)} />
        ))}
        {/* A stale lead gets a small orange mark on its arc, not an orange
            arc: one accent per composition. */}
        {pipeArcs
          .filter((a) => a.stale)
          .map(({ l, mid }) => (
            <circle key={l.id} cx={mid.x} cy={mid.y} r={3.5} className="os-core-stale" />
          ))}

        {/* Hours this month */}
        <circle cx={C} cy={C} r={R_HOURS} className="os-core-ring" />
        <motion.path d={arc(R_HOURS, -90, -90 + hoursSpan)} className="os-core-arc-strong" {...draw(0.5)} />

        {/* The tie from the centre to whatever is in focus */}
        {placed.map(({ p, x, y }) => (
          <line key={p.slug} x1={C} y1={C} x2={x} y2={y} className="os-core-link" data-on={focus === p.slug} />
        ))}

        {/* Project nodes */}
        {placed.map(({ p, x, y }) => (
          <g key={p.slug} className="os-node" data-health={p.health} data-active={focus === p.slug}>
            {p.health === "attention" && <circle cx={x} cy={y} r={16} className="os-node-halo" />}
            <circle cx={x} cy={y} r={7} className="os-node-dot" />
            {p.progress !== null && p.progress < 100 && (
              <circle
                cx={x}
                cy={y}
                r={12}
                className="os-node-progress"
                strokeDasharray={`${(p.progress / 100) * 2 * Math.PI * 12} ${2 * Math.PI * 12}`}
                transform={`rotate(-90 ${x} ${y})`}
              />
            )}
          </g>
        ))}
      </svg>

      {/* The centre */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-heading text-[15px] tracking-[0.02em] text-os-text sm:text-[22px]">GRØNN</p>
          <dl className="mt-[6px] grid gap-[2px] font-mono text-[8px] uppercase leading-[11px] tracking-[0.08em] sm:mt-[14px] sm:gap-[6px] sm:text-[11px] sm:leading-[14px] sm:tracking-[0.12em]">
            {[
              [String(telemetry.activeProjects).padStart(2, "0"), t("active projects", "actieve projecten")],
              [String(telemetry.leads).padStart(2, "0"), t("leads", "leads")],
              [euroShort(telemetry.pipeline), t("pipeline", "pijplijn")],
              [telemetry.hoursThisMonth === null ? "—" : `${telemetry.hoursThisMonth}h`, t("this month", "deze maand")],
            ].map(([v, l]) => (
              <div key={l} className="flex justify-center gap-[8px]">
                <dt className="order-2 text-os-text-3">{l}</dt>
                <dd className="text-os-text">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Node labels and controls */}
      <ul className="absolute inset-0">
        {placed.map(({ p, deg, x, y }) => {
          const right = Math.cos((deg * Math.PI) / 180) >= -0.05
          const label = (
            <>
              <span className="block max-w-[84px] truncate font-heading text-[11px] leading-[15px] sm:max-w-none sm:text-[14px] sm:leading-[18px] text-os-text">{p.name.toUpperCase()}</span>
              <span className="hidden text-[12px] leading-[16px] text-os-text-2 sm:block">{s(p.kind)}</span>
              <span className="mt-[2px] hidden font-mono sm:block text-[11px] leading-[14px] tracking-[0.08em] text-os-text-3">
                {p.progress !== null && p.progress < 100 ? `${p.progress}% · ` : ""}
                {s(p.status)}
              </span>
            </>
          )
          const common = {
            onMouseEnter: () => setFocus(p.slug),
            onMouseLeave: () => setFocus((f) => (f === p.slug ? null : f)),
            onFocus: () => setFocus(p.slug),
            onBlur: () => setFocus((f) => (f === p.slug ? null : f)),
            className: cn(
              // A ground-coloured plate, so the rings never run through a label.
              "absolute -translate-y-1/2 whitespace-nowrap rounded-[10px] bg-os-ground/85 px-[8px] py-[6px] text-left transition-colors hover:bg-os-surface",
              right ? "" : "-translate-x-full text-right"
            ),
            style: {
              left: `${((x + (right ? 20 : -20)) / SIZE) * 100}%`,
              top: `${(y / SIZE) * 100}%`,
            },
          }
          return (
            <li key={p.slug}>
              {p.hasControlView ? (
                <Link href={`/os/projects/${p.slug}`} {...common} aria-describedby={`core-card-${p.slug}`}>
                  {label}
                </Link>
              ) : (
                <button type="button" {...common} aria-describedby={`core-card-${p.slug}`}>
                  {label}
                </button>
              )}
              <span id={`core-card-${p.slug}`} className="sr-only">
                {s(p.note)}
              </span>
            </li>
          )
        })}
      </ul>

      {/* The context card of the node in focus */}
      {focused && (
        <motion.div
          key={focused.p.slug}
          initial={reduced ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[calc(50%+96px)] w-[260px] -translate-x-1/2 rounded-[14px] border border-os-line bg-os-surface p-[14px]"
        >
          <p className="os-label">{s(focused.p.stage)}</p>
          <p className="mt-[6px] text-[13px] leading-[19px] text-os-text-2">{s(focused.p.note)}</p>
          {focused.p.hasControlView && (
            <p className="mt-[8px] flex items-center gap-[4px] text-[12px] text-os-green">
              {t("Open control view", "Controleweergave openen")} <ArrowUpRightIcon size={12} />
            </p>
          )}
        </motion.div>
      )}
    </figure>
  )
}

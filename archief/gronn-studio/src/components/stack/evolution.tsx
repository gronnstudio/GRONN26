"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { EvolutionFigures } from "@/components/stack/evolution-figures"
import { SectionLabel } from "@/components/section-label"
import { EASE_REVEAL } from "@/lib/motion"
import { STACK_TECH } from "@/lib/stack"
import {
  CATEGORY_LABELS,
  ERAS,
  STATUS_LABELS,
  STATUS_NOTES,
  STEP_COUNT,
  stepsFor,
  TIMEVAULT_ORDER,
  type TimevaultCategory,
  type TimevaultEvent,
} from "@/lib/timevault"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// The Evolution timeline — /stack's second half.
//
// The stack page answers "what is this built with". This answers "how
// did it get here, and why is it like this". They join through the
// technology keys: an event names the same STACK_TECH.key the cards
// above use, so neither page keeps its own list of technology names.
//
// THE COMPOSITION IS A SURVEY LINE, not a roadmap. This brand's whole
// visual language is line-work, contour and survey mark — a theodolite,
// a ground line, a marker peg. So the timeline is drawn as a section
// through the project: one hairline, ticks placed by real date, eras
// measured off beneath it. Milestones sit at their true position in
// time, which is why the gaps are visible: the fortnight of silence in
// August is a fact about this project and it should look like one.
//
// DESKTOP FIRST, by the owner's instruction (27 Aug 2026): establish the
// full experience at 1280–1920+ before translating it downward. Below
// `lg` this renders a plain chronological list instead — see the note on
// `SmallScreenList`. That is a sequencing exception to design rule 5,
// recorded in TIMEVAULT/DECISIONS.md, not a hole.

const FILTERS: (TimevaultCategory | "all")[] = [
  "all",
  "architecture",
  "design",
  "ux",
  "accessibility",
  "performance",
  "technology",
  "research",
]

// A label is 9rem wide. At the narrowest desktop the axis is ~1216px,
// so two labels need at least this much of the axis between them before
// they can share a lane. Taken at the NARROWEST width on purpose: the
// requirement only relaxes as the canvas grows, so one number is safe
// from 1280 to 1920 and beyond.
const LABEL_CLEARANCE = 144 / 1216

/**
 * Where each event sits on the axis (0–1, by real elapsed days) and
 * which lane its label goes in.
 *
 * The ticks stay at their true positions — that is the whole point of
 * drawing this as a survey line rather than an even row of cards, and
 * it is why the fortnight of silence in August is visible as a gap. But
 * true positions cluster: five milestones fall inside eight days at the
 * end of August, and their labels overlapped into an unreadable smear.
 *
 * So the labels stack into lanes instead. Greedy, first fit: each label
 * drops into the highest lane where the last label already there is far
 * enough to its left. Chronology is untouched; only the labels move.
 */
function useAxisPositions() {
  return useMemo(() => {
    const times = TIMEVAULT_ORDER.map((e) => new Date(e.date).getTime())
    const first = Math.min(...times)
    const last = Math.max(...times)
    const span = last - first || 1
    // Inset so the first and last ticks are not flush against the ends;
    // a tick hard against the end of its own axis reads as clipped.
    const pad = 0.03
    const laneEnds: number[] = []

    return TIMEVAULT_ORDER.map((event, i) => {
      const left = pad + ((times[i] - first) / span) * (1 - pad * 2)
      // Past this point a left-anchored label would run off the right
      // edge, so it hangs from the tick the other way instead.
      const flip = left > 0.72
      const start = flip ? left - LABEL_CLEARANCE : left
      let lane = laneEnds.findIndex((end) => start >= end)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = start + LABEL_CLEARANCE
      return { event, left, lane, flip }
    })
  }, [])
}

export function Evolution() {
  const t = useT()
  const reduced = useReducedMotion()
  const [selectedId, setSelectedId] = useState(
    TIMEVAULT_ORDER[TIMEVAULT_ORDER.length - 1].id
  )
  const [filter, setFilter] = useState<TimevaultCategory | "all">("all")
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const marks = useAxisPositions()

  const selected =
    TIMEVAULT_ORDER.find((e) => e.id === selectedId) ?? TIMEVAULT_ORDER[0]

  // Filtering DIMS rather than removes. Dropping marks would close the
  // gaps between the survivors and quietly rewrite the chronology, which
  // is the one thing this drawing exists to be honest about.
  const matches = useCallback(
    (event: TimevaultEvent) => filter === "all" || event.category === filter,
    [filter]
  )
  const matchCount = TIMEVAULT_ORDER.filter(matches).length

  /** Arrow keys walk the axis; Home and End jump to its ends. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = TIMEVAULT_ORDER.findIndex((ev) => ev.id === selectedId)
    let next = i
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i + 1
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i - 1
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = TIMEVAULT_ORDER.length - 1
    else return
    e.preventDefault()
    const target = TIMEVAULT_ORDER[Math.max(0, Math.min(next, TIMEVAULT_ORDER.length - 1))]
    setSelectedId(target.id)
    tabRefs.current.get(target.id)?.focus()
  }

  return (
    <section
      id="evolution"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6"
    >
      <SectionLabel index="04">
        {t({ en: "Evolution", nl: "Evolutie" })}
      </SectionLabel>

      <div className="mt-8 grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <h2 className="max-w-3xl font-heading text-[clamp(1.7rem,3vw,2.6rem)] font-semibold leading-[1.1] tracking-tight">
          {t({
            en: "The making of this site, kept rather than remembered.",
            nl: "Hoe deze site gemaakt is, bewaard in plaats van onthouden.",
          })}
        </h2>
        <p className="max-w-md self-end leading-relaxed text-muted">
          {t({
            en: "Everything above is what this is built with. What follows is how it got here — the questions, the decisions and the things that had to be undone.",
            nl: "Alles hierboven is waar dit van gemaakt is. Wat volgt is hoe het zover kwam — de vragen, de beslissingen en de dingen die teruggedraaid moesten worden.",
          })}
        </p>
      </div>

      {/* ── The desktop instrument ─────────────────────────────────── */}
      <div className="hidden lg:block">
        <Filters
          filter={filter}
          setFilter={setFilter}
          matchCount={matchCount}
        />

        <Axis
          marks={marks}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          matches={matches}
          onKeyDown={onKeyDown}
          tabRefs={tabRefs}
        />

        <Detail event={selected} reduced={reduced} />
      </div>

      {/* Below lg the instrument is not translated — it is replaced by
          the same events as a plain chronological list. Not a hole and
          not a shrunken timeline: the desktop interaction model is being
          established first, on purpose, and inventing a half-version now
          would be the thing we would have to undo. */}
      <SmallScreenList />

      {/* The same history, counted. Every figure measured rather than
          typed — see scripts/collect-stats.mjs. */}
      <EvolutionFigures />
    </section>
  )
}

// ── Filters ────────────────────────────────────────────────────────

function Filters({
  filter,
  setFilter,
  matchCount,
}: {
  filter: TimevaultCategory | "all"
  setFilter: (f: TimevaultCategory | "all") => void
  matchCount: number
}) {
  const t = useT()
  return (
    <div className="mt-14 flex flex-wrap items-center gap-x-2 gap-y-2 border-b border-line/10 pb-5">
      {FILTERS.map((key) => {
        const on = filter === key
        return (
          <button
            key={key}
            type="button"
            aria-pressed={on}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
              on
                ? "bg-gronn-green/15 text-accent"
                : "text-muted hover:bg-foreground/[0.06] hover:text-gronn-ember"
            )}
          >
            {key === "all"
              ? t({ en: "All", nl: "Alles" })
              : t(CATEGORY_LABELS[key])}
          </button>
        )
      })}
      <p
        aria-live="polite"
        className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-muted"
      >
        {matchCount}/{TIMEVAULT_ORDER.length}{" "}
        {t({ en: "milestones", nl: "mijlpalen" })} · {STEP_COUNT}{" "}
        {t({ en: "steps", nl: "stappen" })}
      </p>
    </div>
  )
}

// ── The axis ───────────────────────────────────────────────────────

function Axis({
  marks,
  selectedId,
  setSelectedId,
  matches,
  onKeyDown,
  tabRefs,
}: {
  marks: {
    event: TimevaultEvent
    left: number
    lane: number
    flip: boolean
  }[]
  selectedId: string
  setSelectedId: (id: string) => void
  matches: (e: TimevaultEvent) => boolean
  onKeyDown: (e: React.KeyboardEvent) => void
  tabRefs: React.RefObject<Map<string, HTMLButtonElement>>
}) {
  const t = useT()
  const laneCount = Math.max(...marks.map((m) => m.lane)) + 1

  return (
    <div className="relative mt-16 pb-4">
      {/* Era bands, measured off beneath the line the way a section
          drawing dimensions its ground. */}
      <div className="relative mb-6 h-px">
        {ERAS.map((era) => {
          const first = marks.find((m) => m.event.era === era.key)
          const eraMarks = marks.filter((m) => m.event.era === era.key)
          const last = eraMarks[eraMarks.length - 1]
          if (!first || !last) return null
          const left = first.left * 100
          const width = (last.left - first.left) * 100
          return (
            <div
              key={era.key}
              className="absolute top-0"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <span aria-hidden className="block h-px w-full bg-line/25" />
              <span className="mt-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                {t(era.label)}
              </span>
            </div>
          )
        })}
      </div>

      {/* The survey line itself, and the ticks on it. */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        aria-label={t({
          en: "Project milestones, oldest first",
          nl: "Mijlpalen van het project, oudste eerst",
        })}
        onKeyDown={onKeyDown}
        // Height follows the deepest lane the labels actually needed,
        // rather than a guess that clips them when a cluster grows.
        style={{ height: `${4 + laneCount * 3.5}rem` }}
        className="relative mt-16"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-line/40"
        />

        {marks.map(({ event, left, lane, flip }) => {
          const on = event.id === selectedId
          const dim = !matches(event)
          // How far the label sits below the line, and therefore how
          // long its leader has to be to reach back up to the mark.
          const drop = 2.75 + lane * 3.5
          return (
            <button
              key={event.id}
              ref={(el) => {
                if (el) tabRefs.current?.set(event.id, el)
                else tabRefs.current?.delete(event.id)
              }}
              type="button"
              role="tab"
              id={`tv-tab-${event.id}`}
              aria-selected={on}
              aria-controls="tv-detail"
              // Roving tabindex: one stop for the whole axis, then arrow
              // keys inside it. Thirteen tab stops in a row is how you
              // make a keyboard user hate a timeline.
              tabIndex={on ? 0 : -1}
              onClick={() => setSelectedId(event.id)}
              style={{
                left: flip ? undefined : `${left * 100}%`,
                right: flip ? `${(1 - left) * 100}%` : undefined,
                top: `${drop}rem`,
              }}
              // THE LABEL IS THE TARGET, not the tick.
              //
              // The marks were first drawn as a dot on the line with the
              // label positioned absolutely beneath it — which left the
              // button itself zero by zero, operable by keyboard and by
              // nothing else. And 44px hit boxes centred on the ticks
              // could not work either: five milestones fall inside eight
              // days, so their boxes would sit on top of one another.
              //
              // Anchoring the button at its label solves both. The lane
              // algorithm already guarantees labels never overlap, so
              // neither do the targets, and a leader line runs back up
              // to the mark — which is how a survey drawing annotates a
              // point anyway.
              className={cn(
                "group absolute block w-36 rounded-sm text-left outline-none transition-opacity",
                flip && "text-right",
                dim && !on && "opacity-30"
              )}
            >
              {/* The mark on the line, and the leader down to the label. */}
              <span
                aria-hidden
                style={{ height: `${drop - 0.5}rem`, top: `-${drop - 0.5}rem` }}
                // pointer-events-none is load-bearing: a leader from a
                // deep lane crosses the labels in the lanes above it,
                // and as a later sibling it was swallowing their clicks.
                // A 1px line was never meant to be a target anyway.
                className={cn(
                  "pointer-events-none absolute block w-px transition-colors duration-300",
                  flip ? "right-0" : "left-0",
                  on ? "bg-gronn-ember" : "bg-line/35 group-hover:bg-gronn-ember"
                )}
              />
              <span
                aria-hidden
                style={{ top: `-${drop}rem` }}
                // The dot keeps its own pointer events: it sits up on
                // the line, clear of every label, and it is the thing
                // that looks clickable.
                className={cn(
                  "pointer-events-auto absolute block -translate-y-1/2 rounded-full transition-all duration-300",
                  flip ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2",
                  on
                    ? "size-2.5 bg-gronn-ember ring-4 ring-gronn-ember/20"
                    : "size-1.5 bg-line/70 group-hover:size-2.5 group-hover:bg-gronn-ember"
                )}
              />

              <span
                className={cn(
                  "block font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                  on ? "text-[color:var(--ember-text)]" : "text-muted"
                )}
              >
                {formatShort(event.date)}
              </span>
              <span
                className={cn(
                  "mt-1 block font-heading text-[13px] font-semibold leading-tight tracking-tight transition-colors",
                  on
                    ? "text-foreground"
                    : "text-muted group-hover:text-gronn-ember"
                )}
              >
                {t(event.title)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── The detail ─────────────────────────────────────────────────────

function Detail({
  event,
  reduced,
}: {
  event: TimevaultEvent
  reduced: boolean
}) {
  const t = useT()
  return (
    <div
      id="tv-detail"
      role="tabpanel"
      aria-labelledby={`tv-tab-${event.id}`}
      tabIndex={0}
      className="mt-8 rounded-xl border border-line/15 bg-surface/50 outline-none"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={event.id}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: reduced ? 0 : 0.3, ease: EASE_REVEAL }}
          className="p-10 xl:p-14"
        >
          {/* Archive slug: date, category, provenance. */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="text-[color:var(--ember-text)]">
              {formatLong(event.date, event.dateEnd)}
            </span>
            <span aria-hidden className="text-line/50">/</span>
            <span className="text-muted">{t(CATEGORY_LABELS[event.category])}</span>
            <span aria-hidden className="text-line/50">/</span>
            <span className="text-muted" title={t(STATUS_NOTES[event.status])}>
              {t(STATUS_LABELS[event.status])}
            </span>
            {event.prs.length > 0 && (
              <>
                <span aria-hidden className="text-line/50">/</span>
                <span className="text-muted">
                  {event.prs.length === 1
                    ? `PR #${event.prs[0]}`
                    : `${event.prs.length} PR`}
                </span>
              </>
            )}
          </div>

          <h3 className="mt-6 max-w-3xl font-heading text-[clamp(1.6rem,2.4vw,2.2rem)] font-semibold leading-[1.12] tracking-tight">
            {t(event.title)}
          </h3>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">
            {t(event.summary)}
          </p>

          <div className="mt-12 grid gap-x-16 gap-y-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="space-y-10">
              <Block label={{ en: "Context", nl: "Context" }}>
                {t(event.context)}
              </Block>
              {event.investigation && (
                <Block label={{ en: "Investigation", nl: "Onderzocht" }}>
                  {t(event.investigation)}
                </Block>
              )}
              <Block label={{ en: "Implementation", nl: "Uitvoering" }}>
                {t(event.implementation)}
              </Block>
              <Block label={{ en: "Result", nl: "Resultaat" }}>
                {t(event.result)}
              </Block>
            </div>

            <div className="space-y-10">
              {event.research && (
                <ResearchBlock research={event.research} />
              )}
              {event.decision && <DecisionBlock decision={event.decision} />}
              <TechBlock keys={event.tech} />
              {event.entry && (
                <div>
                  <ColLabel>{t({ en: "In the archive", nl: "In het archief" })}</ColLabel>
                  <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-muted">
                    TIMEVAULT/entries/{event.entry}.md
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Full width: the prose above is two columns, but a list of
              ninety-six dated rows is a ledger and wants the whole
              measure. */}
          <StepList id={event.id} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Every pull request behind one milestone, in order.
 *
 * Thirteen marks for sixty-two commits read as a small project, which
 * is not what happened. The marks stay few because a survey line with a
 * hundred labels is unreadable — the depth goes here instead, where the
 * reversals can sit next to the things they reversed. That adjacency is
 * the part worth keeping: a tilt sheen added and removed in one day, an
 * icon set rebuilt and pulled back the same afternoon.
 */
function StepList({ id }: { id: string }) {
  const t = useT()
  const steps = stepsFor(id)
  if (steps.length === 0) return null
  return (
    <div className="mt-12 border-t border-line/10 pt-8">
      <ColLabel>
        {steps.length} {t({ en: "steps", nl: "stappen" })}
      </ColLabel>
      {/* ONE column, deliberately. Two columns of a grid fill row-first,
          so the numbers interleaved — #22, #24, #26 down the left and
          #23, #25, #27 down the right — which is unreadable for
          something whose whole value is being in order. */}
      <ol className="mt-4">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex items-baseline gap-3 border-b border-line/10 py-2 last:border-b-0"
          >
            <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {formatShort(step.date)}
            </span>
            <span
              className={cn(
                "flex-1 text-[13px] leading-relaxed",
                step.reversal ? "text-muted" : "text-foreground/80"
              )}
            >
              {/* Reversals are marked, not hidden. Half of what this
                  project learned, it learned by undoing something. */}
              {step.reversal && (
                <span
                  aria-hidden
                  className="mr-2 font-mono text-[10px] text-[color:var(--ember-text)]"
                >
                  ↺
                </span>
              )}
              {t(step.label)}
              {step.reversal && (
                <span className="sr-only">
                  {t({ en: " (a reversal)", nl: " (teruggedraaid)" })}
                </span>
              )}
            </span>
            {step.pr && (
              <span className="shrink-0 font-mono text-[10px] text-muted">
                #{step.pr}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
      {children}
    </p>
  )
}

function Block({
  label,
  children,
}: {
  label: { en: string; nl: string }
  children: React.ReactNode
}) {
  const t = useT()
  return (
    <div>
      <ColLabel>{t(label)}</ColLabel>
      <p className="mt-3 max-w-2xl leading-relaxed text-foreground/80">
        {children}
      </p>
    </div>
  )
}

function ResearchBlock({
  research,
}: {
  research: NonNullable<TimevaultEvent["research"]>
}) {
  const t = useT()
  return (
    <div className="border-l border-gronn-green/40 pl-6">
      <ColLabel>{t({ en: "Research", nl: "Onderzoek" })}</ColLabel>
      <p className="mt-3 font-heading text-base font-semibold leading-snug tracking-tight">
        {t(research.question)}
      </p>
      <ul className="mt-4 space-y-2">
        {research.investigated.map((line, i) => (
          <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
            <span
              aria-hidden
              className="shrink-0 text-[color:var(--ember-text)]"
            >
              →
            </span>
            {t(line)}
          </li>
        ))}
      </ul>
      <p className="mt-4 leading-relaxed text-foreground/80">
        {t(research.finding)}
      </p>
    </div>
  )
}

function DecisionBlock({
  decision,
}: {
  decision: NonNullable<TimevaultEvent["decision"]>
}) {
  const t = useT()
  return (
    <div className="border-l border-gronn-ember/50 pl-6">
      <ColLabel>{t({ en: "Decision", nl: "Beslissing" })}</ColLabel>
      <p className="mt-3 font-heading text-base font-semibold leading-snug tracking-tight">
        {t(decision.choice)}
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70">
          {t({ en: "Why", nl: "Waarom" })}
        </span>{" "}
        {t(decision.why)}
      </p>
      <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70">
          {t({ en: "Trade-off", nl: "Wat het kost" })}
        </span>{" "}
        {t(decision.tradeoff)}
      </p>
    </div>
  )
}

/**
 * The join with the page above: an event names technologies with the
 * SAME keys the stack cards use, so this needs no list of its own.
 */
function TechBlock({ keys }: { keys: string[] }) {
  const t = useT()
  const named = keys
    .map((key) => STACK_TECH.find((tech) => tech.key === key))
    .filter((tech): tech is (typeof STACK_TECH)[number] => !!tech)
  if (named.length === 0) return null
  return (
    <div>
      <ColLabel>{t({ en: "Technology", nl: "Techniek" })}</ColLabel>
      <div className="mt-3 flex flex-wrap gap-2">
        {named.map((tech) => (
          <a
            key={tech.key}
            href={`#tech-${tech.key}`}
            className="rounded-full border border-line/20 px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:border-gronn-ember hover:text-gronn-ember"
          >
            {tech.name}
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Below lg ───────────────────────────────────────────────────────

/**
 * The same events, as a plain chronological list.
 *
 * Deliberately NOT a small timeline. The desktop interaction model is
 * being established first (owner instruction, 27 Aug 2026), and a
 * half-scale version of it now is exactly the thing that would have to
 * be thrown away. What a reader needs on a phone is the history in
 * order, readable — so that is what this is.
 */
function SmallScreenList() {
  const t = useT()
  return (
    <ol data-timeline="list" className="mt-12 space-y-10 lg:hidden">
      {TIMEVAULT_ORDER.map((event) => (
        <li key={event.id}>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ember-text)]">
            {formatLong(event.date, event.dateEnd)}
          </p>
          <h3 className="mt-2 font-heading text-xl font-semibold tracking-tight">
            {t(event.title)}
          </h3>
          <p className="mt-2 leading-relaxed text-muted">{t(event.summary)}</p>
          <p className="mt-3 leading-relaxed text-foreground/80">
            {t(event.context)}
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            {t(CATEGORY_LABELS[event.category])} ·{" "}
            {t(STATUS_LABELS[event.status])}
          </p>
        </li>
      ))}
    </ol>
  )
}

// ── Dates ──────────────────────────────────────────────────────────

const MONTHS_SHORT = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
]

/** `2026 · 07` — the archive slug on the axis. */
function formatShort(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** `2026 · 08 · 27`, or a span. Digits, not prose — this is a record. */
function formatLong(iso: string, end?: string): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  const d = new Date(iso)
  const head = `${d.getUTCFullYear()} · ${pad(d.getUTCMonth() + 1)} · ${pad(d.getUTCDate())}`
  if (!end) return head
  const e = new Date(end)
  return `${head} — ${pad(e.getUTCMonth() + 1)} · ${pad(e.getUTCDate())}`
}

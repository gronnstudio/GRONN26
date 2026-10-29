/**
 * What the panel should say, computed from plain data.
 *
 * This module imports NOTHING — no database, no session, no React. That
 * is not tidiness, it is the only way this logic gets tested: CI has no
 * Supabase project and no signed-in user, so anything that reaches for a
 * connection can be checked for its shape and never for its answers.
 * `supabase-config.spec.ts` tests `projectUrl` with two dozen inputs
 * because it is pure; everything here is pure for the same reason.
 *
 * So the rule for this file is: the callers fetch, this decides. A route
 * or a page maps its rows into the types below and asks a question. If a
 * new piece of reasoning is worth getting right, it belongs here rather
 * than inline in a component.
 */

export type Phase =
  | "aanvraag"
  | "intake"
  | "offerte"
  | "akkoord"
  | "uitvoering"
  | "opgeleverd"
  | "onderhoud"

/** The phases a deal passes through before it is work. */
export const PIPELINE: Phase[] = ["aanvraag", "intake", "offerte", "akkoord"]

export const PHASE_LABEL: Record<Phase, string> = {
  aanvraag: "Aanvraag",
  intake: "Intake",
  offerte: "Offerte uit",
  akkoord: "Akkoord",
  uitvoering: "Uitvoering",
  opgeleverd: "Opgeleverd",
  onderhoud: "Onderhoud",
}

export type StepStatus = "open" | "bezig" | "klaar"
export type TermStatus = "open" | "gefactureerd" | "betaald"

export type WerkbankStep = {
  label: string
  dueOn: string | null
  status: StepStatus
}

export type WerkbankTerm = {
  label: string
  amountCents: number
  status: TermStatus
  dueOn: string | null
}

export type WerkbankAsk = {
  label: string
  receivedAt: string | null
}

export type WerkbankProject = {
  id: string
  /** The garden's name, which is what the studio calls it. */
  name: string
  /** The household, when there is one to name. */
  clientName: string | null
  phase: Phase
  /** 0–100, or null when nobody has judged it yet. */
  chance: number | null
  /** Cents. Never a float — see the migration's note on money. */
  valueCents: number | null
  nextAction: string | null
  nextActionOn: string | null
  steps: WerkbankStep[]
  terms: WerkbankTerm[]
  asks: WerkbankAsk[]
}

export type WerkbankSubscription = {
  id: string
  label: string
  projectId: string | null
  status: "active" | "paused" | "ended"
  lastVisitOn: string | null
  nextVisitOn: string | null
}

/* ─────────────────────────────────────────────────────────── dates */

/**
 * Whole days from `from` to `to`, both `YYYY-MM-DD`.
 *
 * Parsed by hand rather than through `new Date(s)`, and that is worth a
 * sentence. `new Date("2026-09-04")` is parsed as UTC midnight while
 * `new Date("2026-09-04T00:00")` is parsed as LOCAL midnight — so mixing
 * the two forms shifts a comparison by the timezone offset, and in the
 * Netherlands that is one or two hours, which is exactly enough to make
 * a difference of 0.96 days round to 1. "Due today" would read as "1
 * day late" between midnight and 02:00 in summer.
 *
 * Building both sides as UTC from the digits makes the arithmetic exact:
 * every date is midnight in the same frame, so the difference is a whole
 * number of days before it is rounded, not after.
 */
export function daysBetween(from: string, to: string): number | null {
  const a = utcDay(from)
  const b = utcDay(to)
  if (a === null || b === null) return null
  return Math.round((b - a) / 86_400_000)
}

function utcDay(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? "")
  if (!m) return null
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(t) ? null : t
}

export type Urgency = {
  /** What to print: "3d te laat", "vandaag", "over 5d", "—". */
  label: string
  /** How to colour it. `none` means there is no date at all. */
  tone: "late" | "today" | "soon" | "later" | "none"
  /** Negative when overdue. Null when there is no usable date. */
  days: number | null
}

/** How a date reads on the day you are looking at it. */
export function urgency(today: string, date: string | null): Urgency {
  const days = date ? daysBetween(today, date) : null
  if (days === null) return { label: "—", tone: "none", days: null }
  if (days < 0) {
    const n = Math.abs(days)
    return { label: `${n}d te laat`, tone: "late", days }
  }
  if (days === 0) return { label: "vandaag", tone: "today", days }
  if (days === 1) return { label: "morgen", tone: "soon", days }
  // Three days is the edge of "this is on me now" rather than a number
  // pulled out of the air: it is the window in which a thing can still
  // be reshuffled without telling anybody.
  if (days <= 3) return { label: `over ${days}d`, tone: "soon", days }
  return { label: `over ${days}d`, tone: "later", days }
}

/* ───────────────────────────────────────────────────────── money */

export function euroFromCents(cents: number | null | undefined): string {
  const n = Math.round((cents ?? 0) / 100)
  return `€ ${n.toLocaleString("nl-NL")}`
}

/**
 * Chance × value, over the phases where a deal is not yet work.
 *
 * `akkoord` counts: agreed is not the same as invoiced, and leaving it
 * out makes the number drop on the best day a project has. `uitvoering`
 * and everything after do NOT count — those are revenue, not pipeline,
 * and adding them would let one finished garden hide an empty funnel.
 *
 * A null chance is treated as zero rather than skipped. A deal nobody
 * has judged is worth nothing to a forecast, and quietly excluding it
 * would make the average look better the less you know.
 */
export function weightedCents(projects: WerkbankProject[]): number {
  return projects
    .filter((p) => PIPELINE.includes(p.phase))
    .reduce((sum, p) => sum + ((p.valueCents ?? 0) * (p.chance ?? 0)) / 100, 0)
}

export type PipelineColumn = {
  phase: Phase
  label: string
  projects: WerkbankProject[]
  totalCents: number
}

export function pipeline(projects: WerkbankProject[]): PipelineColumn[] {
  return PIPELINE.map((phase) => {
    const inPhase = projects.filter((p) => p.phase === phase)
    return {
      phase,
      label: PHASE_LABEL[phase],
      projects: inPhase,
      totalCents: inPhase.reduce((s, p) => s + (p.valueCents ?? 0), 0),
    }
  })
}

/**
 * The month's takings as a share of the goal — or null.
 *
 * Null when no goal is set, and that is the designed state rather than a
 * fallback. The owner was asked what his monthly target was and answered
 * "geen idee"; inventing one would have put a number he never chose on
 * his own screen every morning, failing. So the tile shows the amount
 * and no percentage until he says otherwise.
 */
export function goalPct(
  paidCents: number,
  goalCents: number | null | undefined
): number | null {
  if (!goalCents || goalCents <= 0) return null
  return Math.round((paidCents / goalCents) * 100)
}

/* ─────────────────────────────────────────────────────── actions */

export type Action = {
  projectId: string
  /** What to do. */
  what: string
  /** Whose garden. */
  who: string
  /** ISO date, or null when nobody set one. */
  on: string | null
  /** Where it came from, so the list can say "in uitvoering". */
  source: "next" | "step" | "term" | "visit"
}

export type WerkbankInput = {
  /** `YYYY-MM-DD`, the day being looked at. */
  today: string
  projects: WerkbankProject[]
  subscriptions: WerkbankSubscription[]
}

/**
 * One list of what to do, across every project.
 *
 * Four sources, merged and sorted by date. The merge is the point: the
 * panel already showed documents with deadlines and enquiries awaiting a
 * quote, on separate cards, which meant deciding what to do first was a
 * job the reader had to do by eye across three lists.
 *
 * Undated items sort LAST rather than first. An action with no date is
 * not urgent, it is unplanned — and putting it above a thing that is
 * three days late would be the list lying about which matters.
 */
export function actions(input: WerkbankInput): Action[] {
  const out: Action[] = []

  for (const p of input.projects) {
    const who = p.clientName ?? p.name
    if (p.nextAction?.trim()) {
      out.push({
        projectId: p.id,
        what: p.nextAction.trim(),
        who,
        on: p.nextActionOn,
        source: "next",
      })
    }
    // Only steps actually in progress. An "open" step is a plan; a
    // "bezig" one is a thing somebody is standing in.
    for (const s of p.steps) {
      if (s.status === "bezig") {
        out.push({ projectId: p.id, what: s.label, who, on: s.dueOn, source: "step" })
      }
    }
    // An invoiced instalment past its date is an action, not a signal —
    // somebody has to be rung.
    for (const t of p.terms) {
      if (t.status === "gefactureerd" && t.dueOn) {
        const d = daysBetween(t.dueOn, input.today)
        if (d !== null && d > 0) {
          out.push({
            projectId: p.id,
            what: `${t.label} nabellen — ${euroFromCents(t.amountCents)} open`,
            who,
            on: t.dueOn,
            source: "term",
          })
        }
      }
    }
  }

  for (const s of input.subscriptions) {
    if (s.status !== "active" || !s.nextVisitOn) continue
    out.push({
      projectId: s.projectId ?? "",
      what: `Onderhoudsbeurt inplannen — ${s.label}`,
      who: s.label,
      on: s.nextVisitOn,
      source: "visit",
    })
  }

  return out.sort(byDateThenUndatedLast)
}

function byDateThenUndatedLast(a: Action, b: Action): number {
  if (a.on && b.on) return a.on < b.on ? -1 : a.on > b.on ? 1 : 0
  if (a.on) return -1
  if (b.on) return 1
  return 0
}

/* ─────────────────────────────────────────────────────── signals */

export type Signal = {
  projectId: string
  /** Highest first: `bad` is money, `warn` is drift, `note` is an opening. */
  level: "bad" | "warn" | "note"
  /** What is true. */
  what: string
  /** What to do about it — the half a bare count cannot carry. */
  why: string
}

const LEVEL_ORDER: Record<Signal["level"], number> = { bad: 0, warn: 1, note: 2 }

/**
 * What the panel should raise without being asked.
 *
 * Every signal carries a REASON as well as a fact, and that is the whole
 * difference from the bell with a number on it that this replaces. "3"
 * tells the owner to go looking; "Offerte Verhoeven staat 19 dagen open
 * — bellen slaat beter aan dan mailen" tells him what to do in the two
 * minutes he has.
 *
 * Sorted by severity and not by date: money that is late outranks a
 * project that has drifted, which outranks an opportunity nobody has
 * taken yet.
 */
export function signals(input: WerkbankInput): Signal[] {
  const out: Signal[] = []
  const { today } = input

  for (const p of input.projects) {
    const who = p.clientName ?? p.name

    for (const t of p.terms) {
      if (t.status !== "gefactureerd" || !t.dueOn) continue
      const late = daysBetween(t.dueOn, today)
      // Thirty days past the due date, which is the point at which a
      // Dutch invoice stops being "recent" and starts being a debt.
      if (late !== null && late > 30) {
        out.push({
          projectId: p.id,
          level: "bad",
          what: `${euroFromCents(t.amountCents)} open bij ${who}`,
          why: `${t.label} · ${late} dagen over de vervaldatum`,
        })
      }
    }

    if (p.phase === "offerte" && p.nextActionOn) {
      const open = daysBetween(p.nextActionOn, today)
      if (open !== null && open > 14) {
        out.push({
          projectId: p.id,
          level: "warn",
          what: `Offerte ${who} staat ${open} dagen open`,
          why: "Bellen slaat beter aan dan mailen.",
        })
      }
    }

    // A project with no next action is a project that will be
    // remembered when somebody else asks about it.
    if (!p.nextAction?.trim() && p.phase !== "opgeleverd" && p.phase !== "onderhoud") {
      out.push({
        projectId: p.id,
        level: "note",
        what: `${who} heeft geen volgende stap`,
        why: "Zet er één actie op, anders zakt het weg.",
      })
    }

    // The moment to offer maintenance is the week after handover, not
    // the spring after everything has gone wrong.
    if (p.phase === "opgeleverd") {
      out.push({
        projectId: p.id,
        level: "note",
        what: `${who} is opgeleverd`,
        why: "Nu is het moment om onderhoud aan te bieden.",
      })
    }
  }

  for (const s of input.subscriptions) {
    if (s.status !== "active" || !s.nextVisitOn) continue
    const over = daysBetween(s.nextVisitOn, today)
    if (over !== null && over > 0) {
      out.push({
        projectId: s.projectId ?? "",
        level: "warn",
        what: `Onderhoudsbeurt ${s.label} is ${over} dagen over tijd`,
        why: s.lastVisitOn
          ? `Laatste beurt ${s.lastVisitOn}.`
          : "Er staat geen vorige beurt genoteerd.",
      })
    }
  }

  return out.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level])
}

/* ────────────────────────────────────────────── the client's track */

/** The steps a client sees, and which of them they are standing on. */
export const TRACK: string[] = [
  "Intake",
  "Ontwerp",
  "Offerte",
  "Aanleg",
  "Oplevering",
  "Onderhoud",
]

const TRACK_OF: Record<Phase, number> = {
  aanvraag: 0,
  intake: 0,
  offerte: 2,
  akkoord: 2,
  uitvoering: 3,
  opgeleverd: 4,
  onderhoud: 5,
}

/**
 * Where on the track a phase sits.
 *
 * Seven phases collapse to six steps, and two of the joins are
 * deliberate. `aanvraag` and `intake` are both "Intake" because a
 * client who has sent a form is in the intake, whatever the studio calls
 * the state internally. `offerte` and `akkoord` are both "Offerte"
 * because signing is not a phase of the work, it is the end of that one.
 *
 * There is no step for `Ontwerp` to be reached by a phase: it is the
 * gap between intake and quote, and a project sitting in `intake` shows
 * it as still ahead. That is honest — the design happens there, and the
 * client should see it coming rather than see it tick past.
 */
export function trackIndex(phase: Phase): number {
  return TRACK_OF[phase] ?? 0
}

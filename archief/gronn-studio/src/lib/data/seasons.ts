import { levelOf, type Service, SERVICES } from "@/lib/data/services"

// When the seasonal work can actually be sold.
//
// The five seasonal services carried a price and a page but no dates,
// which left the one fact that matters most about them unwritten. This
// is a business with very short windows: the leaf-net season opens on
// 1 September and is worthless by mid-November, and the owner's own
// Verdienmodellen document is blunt about it — "Plaats dit de eerste
// week van september. Niet later. De urgentie verdwijnt zodra het blad
// ligt."
//
// Every window below is quoted from that document rather than guessed:
//
//   leaf-net             "half september begint de bladval, half
//                         november is het te laat en ligt het blad al
//                         op de bodem"
//   pond-autumn-service  "Plan najaarsbeurten in september en oktober,
//                         niet in november" — under 10 °C the koi are
//                         in winter rest and must not be disturbed
//   winterising          the November visit, before the first frost
//   pond-survey          diagnosis travels all year
//   maintenance-…        a subscription has no season
//
// Two services the document also describes — autumn planting and winter
// pruning — have no entry here because they are not services on the site
// yet. When they are, they get a window and appear on the board with no
// other change.

/** A day of the year, as `MM-DD`. Year-agnostic on purpose. */
type MonthDay = string

export type SeasonWindow = {
  from: MonthDay
  to: MonthDay
}

/** Windows by service slug. A slug that is absent is treated as year-round. */
export const SEASON_WINDOWS: Record<string, SeasonWindow> = {
  "leaf-net": { from: "09-01", to: "11-15" },
  "pond-autumn-service": { from: "09-01", to: "10-31" },
  winterising: { from: "11-01", to: "11-30" },
  // Not a seasonal service by `kind` — it is the bespoke practice — but
  // it has the sharpest season of the lot. The document calls design
  // "je belangrijkste winterproduct": weather-independent, the best-paid
  // hour of the year, and the thing that fills the spring diary. It also
  // wraps the turn of the year, which is why the maths below handles a
  // window whose `from` is later than its `to`.
  "garden-design": { from: "12-01", to: "02-28" },
}

export type SeasonStatus =
  /** No window: sold the whole year round. */
  | { status: "year-round" }
  /** Sellable today. */
  | { status: "open"; closesInDays: number }
  /** Shut, but close enough that it is worth preparing for. */
  | { status: "opening"; opensInDays: number }
  /** Shut, and far enough off to be someone else's problem. */
  | { status: "closed"; opensInDays: number }

/**
 * How near "near" is.
 *
 * Three weeks, because that is roughly the lead time on the things a
 * window needs before it opens: nets and pegs ordered, a Reel filmed,
 * the page live. The document's own week-one plan is a fortnight of
 * buying and a week of filming.
 */
const SOON_DAYS = 21

const DAY = 24 * 60 * 60 * 1000

/** Midnight UTC on the given day — comparisons here are in whole days. */
function utcDay(year: number, monthDay: MonthDay): number {
  const [m, d] = monthDay.split("-").map(Number)
  return Date.UTC(year, m - 1, d)
}

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function daysBetween(from: number, to: number): number {
  return Math.round((to - from) / DAY)
}

/**
 * Where a service's season stands on a given day.
 *
 * `today` is a parameter rather than `new Date()` inside, so the whole
 * board can be tested at a fixed date instead of quietly changing its
 * answer every morning — and so a test written in August still passes
 * in December.
 *
 * Windows may wrap the turn of the year (a December-to-February one
 * would), which is why the containment test is a disjunction rather
 * than a range check.
 */
export function seasonStatus(slug: string, today: Date): SeasonStatus {
  const window = SEASON_WINDOWS[slug]
  if (!window) return { status: "year-round" }

  const now = startOfUtcDay(today)
  const year = today.getUTCFullYear()
  const wraps = window.from > window.to

  const opensThisYear = utcDay(year, window.from)
  const closesThisYear = utcDay(year, window.to)

  // Open? For a wrapping window, "inside" is everything at or after the
  // opening OR at or before the closing; for a normal one it is both.
  const open = wraps
    ? now >= opensThisYear || now <= closesThisYear
    : now >= opensThisYear && now <= closesThisYear

  if (open) {
    // A wrapping window opened last year when we are past new year.
    const closes =
      wraps && now >= opensThisYear
        ? utcDay(year + 1, window.to)
        : closesThisYear
    return { status: "open", closesInDays: daysBetween(now, closes) }
  }

  const opens = now < opensThisYear ? opensThisYear : utcDay(year + 1, window.from)
  const opensInDays = daysBetween(now, opens)
  return opensInDays <= SOON_DAYS
    ? { status: "opening", opensInDays }
    : { status: "closed", opensInDays }
}

/**
 * Everything that has a time of year: the hands-in-the-soil practice,
 * plus any service that carries a window (today, just the winter design
 * season).
 *
 * BOTH HALVES ARE LOAD-BEARING, and the second is why this is not simply
 * `servicesInGroup(services, "aanleg")`: a window answers "when", `kind`
 * answers "how is this sold", and `garden-design` is the clearest case
 * of the two coming apart — a bespoke service with the sharpest season
 * of the lot.
 *
 * The first half read `kind === "seasonal"` until the three levels
 * landed, at which point it matched nothing and the board quietly shrank
 * to the four services with windows. `levelOf` is what keeps that from
 * happening again — it still answers for services stored under the old
 * keys.
 *
 * The swap it makes is deliberate: `implementation` joins (groundwork is
 * exactly what frost governs — "met vorst kan ik ook geen grondwerk
 * doen") and `pond-survey` leaves (a survey is the first step of a plan,
 * and you can walk a pond in any weather). Since the split of 28 Sep 2026
 * the seasonal work has its own level, Onderhoud; it counts here just as
 * it did when it still sat inside Aanleg.
 */
export const DATED_SERVICES = SERVICES.filter((s) => {
  const niveau = levelOf(s)
  return niveau === "aanleg" || niveau === "onderhoud" || SEASON_WINDOWS[s.slug] !== undefined
})

export type SeasonEntry = { service: Service; season: SeasonStatus }

/**
 * The seasonal work, ordered by what deserves attention today.
 *
 * Closing soonest first, because a window about to shut is the only one
 * that cannot wait; then what is opening, then the rest. Year-round work
 * sits at the back — it is always available, so it is never news.
 */
export function seasonBoard(today: Date, services = DATED_SERVICES): SeasonEntry[] {
  const rank = (s: SeasonStatus): number =>
    s.status === "open" ? 0 : s.status === "opening" ? 1 : s.status === "closed" ? 2 : 3

  return services
    .map((service) => ({ service, season: seasonStatus(service.slug, today) }))
    .sort((a, b) => {
      const byRank = rank(a.season) - rank(b.season)
      if (byRank !== 0) return byRank
      const days = (s: SeasonStatus) =>
        s.status === "open"
          ? s.closesInDays
          : s.status === "opening" || s.status === "closed"
            ? s.opensInDays
            : Number.MAX_SAFE_INTEGER
      return days(a.season) - days(b.season)
    })
}

/**
 * The one seasonal service to put in front of a visitor right now.
 *
 * The mega menu has carried an "In season now" card since #77 with
 * nothing behind it. This is what it should have been reading.
 */
export function inSeasonNow(today: Date, services = DATED_SERVICES): Service | null {
  const board = seasonBoard(today, services)
  const first = board.find(
    (e) => e.season.status === "open" || e.season.status === "opening"
  )
  return first?.service ?? board[0]?.service ?? null
}

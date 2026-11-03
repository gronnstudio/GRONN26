import { SEASON_WINDOWS, type SeasonEntry } from "@/lib/data/seasons"
import { cn } from "@/lib/utils"

// The year, as one picture.
//
// The obvious chart for a dashboard is revenue over time, and with one
// quote and two intakes that chart would be a lie — a trend line drawn
// through two points says whatever you want it to. This says something
// true on the very first day: where the sellable windows fall, how long
// each one lasts, and where today sits among them.
//
// It is also the only view that shows the shape of the business rather
// than its current contents: four short windows bunched into autumn and
// winter, and a long flat stretch through summer where the only income
// is the subscription. That is the argument the Verdienmodellen document
// makes in twelve pages, in one band.
//
// Drawn with two divs and a percentage. No chart library — AGENTS.md
// forbids adding one, and nothing here needs axes, ticks or a tooltip.

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

/** Where a day falls in the year, 0–100. Leap years are close enough. */
function yearFraction(monthDay: string): number {
  const [m, d] = monthDay.split("-").map(Number)
  const daysBefore = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  return ((daysBefore[m - 1] + d - 1) / 365) * 100
}

function todayFraction(today: Date): number {
  const start = Date.UTC(today.getUTCFullYear(), 0, 1)
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return ((now - start) / (365 * 24 * 60 * 60 * 1000)) * 100
}

export function SeasonYear({
  board,
  today,
}: {
  board: SeasonEntry[]
  today: Date
}) {
  const dated = board.filter((e) => SEASON_WINDOWS[e.service.slug])
  const marker = todayFraction(today)

  return (
    <div>
      {/* Month ruler */}
      <div className="flex pl-[38%] sm:pl-[30%]">
        <div className="relative flex-1">
          <div className="flex">
            {MONTHS.map((m, i) => (
              <span
                key={`${m}-${i}`}
                className="flex-1 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-1.5 space-y-1.5">
        {dated.map(({ service, season }) => {
          const w = SEASON_WINDOWS[service.slug]
          const from = yearFraction(w.from)
          const to = yearFraction(w.to)
          const wraps = from > to
          const open = season.status === "open"
          // Segments, because a window that crosses new year is two bars
          // on a calendar that starts in January.
          const segments = wraps
            ? [
                { left: from, width: 100 - from },
                { left: 0, width: to },
              ]
            : [{ left: from, width: to - from }]

          return (
            <li key={service.slug} className="flex items-center gap-2">
              <span className="w-[38%] shrink-0 truncate text-[12px] leading-tight text-muted sm:w-[30%]">
                {service.title.nl}
              </span>
              <span className="relative h-5 flex-1 overflow-hidden rounded-full bg-line/8">
                {segments.map((seg, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 rounded-full",
                      open ? "bg-gronn-green" : "bg-accent/30"
                    )}
                    style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
                  />
                ))}
                {/* Today. The one ember mark on the band, because it is
                    the only thing here that moves. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-[2px] bg-gronn-ember"
                  style={{ left: `${marker}%` }}
                />
                <span className="sr-only">
                  {service.title.nl}:{" "}
                  {season.status === "open"
                    ? `open, nog ${season.closesInDays} dagen`
                    : season.status === "opening"
                      ? `opent over ${season.opensInDays} dagen`
                      : season.status === "closed"
                        ? `gesloten, opent over ${season.opensInDays} dagen`
                        : "hele jaar"}
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-gronn-green" /> nu open
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-accent/30" /> venster
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-[2px] bg-gronn-ember" /> vandaag
        </span>
      </p>
    </div>
  )
}

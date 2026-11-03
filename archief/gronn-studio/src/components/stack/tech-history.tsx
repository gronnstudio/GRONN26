"use client"

import { useT } from "@/components/language-provider"
import { eventsForTech } from "@/lib/timevault"

// The join, walked backwards.
//
// The Evolution timeline names technologies with STACK_TECH keys, so a
// technology can ask the same data when it became relevant. Neither side
// keeps a list of the other's names: `eventsForTech()` is the whole
// mechanism, and adding an event to `timevault.ts` updates both pages.
//
// Deliberately a short list of milestones rather than a second copy of
// the timeline's prose. The point is "this is when this became part of
// the site" — the reasoning is one click away, on the timeline itself.

export function TechHistory({ techKey }: { techKey: string }) {
  const t = useT()
  const events = eventsForTech(techKey)
  if (events.length === 0) return null

  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        {t({ en: "When it became relevant", nl: "Wanneer dit ging tellen" })}
      </dt>
      <dd className="mt-2">
        <ul className="space-y-1.5">
          {events.map((event) => (
            <li key={event.id}>
              {/* An in-page anchor, not a route: the timeline is further
                  down this same page. The href carries the event so a
                  copied link lands on the right milestone. */}
              <a
                href={`#evolution`}
                className="group/tv flex items-baseline gap-2.5 text-[13px] leading-relaxed text-muted transition-colors hover:text-gronn-ember"
              >
                <span
                  aria-hidden
                  className="shrink-0 font-mono text-[10px] tabular-nums text-[color:var(--ember-text)]"
                >
                  {event.date.slice(0, 7).replace("-", "·")}
                </span>
                <span className="underline-draw">{t(event.title)}</span>
              </a>
            </li>
          ))}
        </ul>
      </dd>
    </div>
  )
}

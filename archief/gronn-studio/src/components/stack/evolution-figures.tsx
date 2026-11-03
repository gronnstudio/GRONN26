"use client"

import { CountUp } from "@/components/motion/count-up"
import { useT } from "@/components/language-provider"
import { useLanguage } from "@/components/language-provider"
import { PROJECT_STATS as S } from "@/lib/project-stats"
import { ALL_THEME_NAMES } from "@/lib/themes"
import { STEPS, STEP_COUNT, TIMEVAULT_ORDER } from "@/lib/timevault"

// The figures under the timeline.
//
// Every number here is MEASURED, never typed: scripts/collect-stats.mjs
// walks the repository and writes src/lib/project-stats.ts, and the two
// counts it deliberately does not try to derive — palettes and steps —
// are read from the arrays that already own them. The same rule /stack
// applies to version numbers, for the same reason: a history page that
// gets its own figures wrong has spent the only thing it has.
//
// The collection date is printed. A stale-but-dated number is honest;
// an undated one is not.
//
// Chosen for what they say, not for how large they are. The one that
// matters most is the third of everything written that was taken back
// out — that, and twelve reversals in ninety-six steps, is the actual
// shape of how this site got built.

const reversals = Object.values(STEPS)
  .flat()
  .filter((step) => step.reversal).length

const code = S.tsx + S.ts + S.css
const removedShare = Math.round((S.deletions / S.insertions) * 100)

/** 63905 → "63.905" in Dutch, "63,905" in English. */
function useNumber() {
  const { locale } = useLanguage()
  return (n: number) => n.toLocaleString(locale === "nl" ? "nl-NL" : "en-GB")
}

export function EvolutionFigures() {
  const t = useT()
  const fmt = useNumber()
  const group = (n: number) => fmt(Math.round(n))

  return (
    <div className="mt-24 border-t border-line/10 pt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h3 className="font-heading text-2xl font-semibold tracking-tight">
          {t({ en: "The same history, counted", nl: "Dezelfde geschiedenis, geteld" })}
        </h3>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          {t({ en: "Measured", nl: "Gemeten" })} {S.collectedAt} ·{" "}
          {t({ en: "not typed", nl: "niet ingetypt" })}
        </p>
      </div>

      {/* The four that carry the story. */}
      <dl className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        <Figure
          value={String(S.mergedPrs)}
          format={group}
          label={{ en: "Pull requests merged", nl: "Pull requests gemerged" }}
          note={{
            en: `Across ${S.activeDays} days that had a commit in them, between ${S.firstCommit} and ${S.lastCommit}.`,
            nl: `Verdeeld over ${S.activeDays} dagen waarop er iets gecommit is, tussen ${S.firstCommit} en ${S.lastCommit}.`,
          }}
        />
        <Figure
          value={String(S.insertions)}
          format={group}
          label={{ en: "Lines written", nl: "Regels geschreven" }}
          note={{
            en: "Every insertion this repository has ever recorded, counted across all commits rather than as a snapshot.",
            nl: "Elke toevoeging die deze repository ooit heeft vastgelegd, opgeteld over alle commits in plaats van als momentopname.",
          }}
        />
        <Figure
          value={String(S.deletions)}
          format={group}
          ember
          label={{ en: "Lines taken back out", nl: "Regels er weer uit" }}
          note={{
            en: `That is ${removedShare}% of everything written. The interesting number on this page: most of what this site is, it is by subtraction.`,
            nl: `Dat is ${removedShare}% van alles wat er geschreven is. Het interessantste getal hier: wat deze site is, is hij vooral door weglaten.`,
          }}
        />
        <Figure
          value={String(code)}
          format={group}
          label={{ en: "Lines standing today", nl: "Regels die er nu staan" }}
          note={{
            en: `${fmt(S.tsx)} of interface, ${fmt(S.ts)} of logic and data, ${fmt(S.css)} of styling.`,
            nl: `${fmt(S.tsx)} interface, ${fmt(S.ts)} logica en data, ${fmt(S.css)} opmaak.`,
          }}
        />
      </dl>

      <WrittenVersusRemoved />

      {/* The rest, at annotation scale. */}
      <dl className="mt-16 grid gap-x-10 gap-y-8 border-t border-line/10 pt-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <Small value={fmt(S.commits)} label={{ en: "Commits", nl: "Commits" }} />
        <Small
          value={fmt(TIMEVAULT_ORDER.length)}
          label={{ en: "Milestones", nl: "Mijlpalen" }}
        />
        <Small value={fmt(STEP_COUNT)} label={{ en: "Steps", nl: "Stappen" }} />
        <Small
          value={fmt(reversals)}
          label={{ en: "Reversals", nl: "Teruggedraaid" }}
        />
        <Small
          value={fmt(S.sourceFiles)}
          label={{ en: "Source files", nl: "Bronbestanden" }}
        />
        <Small
          value={fmt(S.components)}
          label={{ en: "Components", nl: "Componenten" }}
        />
        <Small value={fmt(S.routes)} label={{ en: "Routes", nl: "Routes" }} />
        <Small
          value={fmt(S.services)}
          label={{ en: "Services priced", nl: "Diensten met prijs" }}
        />
        <Small
          value={fmt(ALL_THEME_NAMES.length)}
          label={{ en: "Palettes", nl: "Paletten" }}
        />
        <Small
          value={fmt(S.contrastPairs)}
          label={{ en: "Contrast pairs checked", nl: "Contrastparen gecontroleerd" }}
        />
        <Small
          value={fmt(S.e2eCases)}
          label={{ en: "Browser tests", nl: "Browsertests" }}
        />
        <Small
          value={fmt(S.dependencies)}
          label={{ en: "Dependencies", nl: "Afhankelijkheden" }}
        />
      </dl>

      {/* One line that is worth more than the grid above it. */}
      <p className="mt-12 max-w-3xl leading-relaxed text-muted">
        {t({
          en: `Alongside ${fmt(code)} lines of code sit ${fmt(S.docs)} lines of written record — the day logs, the operations manual and this archive. Close to one line of prose for every three of code, which is the whole reason this timeline could be written at all.`,
          nl: `Naast ${fmt(code)} regels code staan ${fmt(S.docs)} regels geschreven verslag — de dagverslagen, het operationeel handboek en dit archief. Bijna één regel proza op elke drie regels code, en dat is precies waarom deze tijdlijn er überhaupt kon komen.`,
        })}
      </p>
    </div>
  )
}

function Figure({
  value,
  label,
  note,
  ember,
  format,
}: {
  value: string
  label: { en: string; nl: string }
  note: { en: string; nl: string }
  ember?: boolean
  format?: (n: number) => string
}) {
  const t = useT()
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        {t(label)}
      </dt>
      <dd>
        <p
          className={
            ember
              ? "mt-3 font-heading text-[clamp(2.2rem,3.6vw,3.4rem)] font-semibold leading-none tracking-tight text-[color:var(--ember-text)]"
              : "mt-3 font-heading text-[clamp(2.2rem,3.6vw,3.4rem)] font-semibold leading-none tracking-tight tabular-nums"
          }
        >
          <CountUp value={value} format={format} />
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">{t(note)}</p>
      </dd>
    </div>
  )
}

function Small({
  value,
  label,
}: {
  value: string
  label: { en: string; nl: string }
}) {
  const t = useT()
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {t(label)}
      </dt>
      <dd className="mt-1.5 font-heading text-xl font-semibold tabular-nums tracking-tight">
        {value}
      </dd>
    </div>
  )
}

/**
 * One bar, to the same scale: what was written, and how much of it came
 * back out again.
 *
 * A pair of numbers in a grid is two facts. Drawn against each other on
 * one axis it is a single fact about how this project works — and it is
 * the fact the whole timeline has been circling: the tilt sheen, the
 * header, the icon set, the pinned gallery, the second CMS.
 */
function WrittenVersusRemoved() {
  const t = useT()
  const fmt = useNumber()
  const removed = (S.deletions / S.insertions) * 100

  return (
    <figure className="mt-16">
      <figcaption className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        {t({ en: "Written, and unwritten", nl: "Geschreven, en weer weg" })}
      </figcaption>
      <div
        role="img"
        aria-label={t({
          en: `${fmt(S.insertions)} lines written, of which ${fmt(S.deletions)} were later removed — ${Math.round(removed)} percent.`,
          nl: `${fmt(S.insertions)} regels geschreven, waarvan er ${fmt(S.deletions)} later weer weg zijn — ${Math.round(removed)} procent.`,
        })}
        className="mt-4 h-9 w-full overflow-hidden rounded-sm bg-gronn-green/15"
      >
        {/* Ember as a filled surface, so the token that carries white
            text at AA — not the pure line colour. */}
        <div
          className="h-full bg-gronn-ember-strong"
          style={{ width: `${removed}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between font-mono text-[11px] uppercase tracking-[0.16em]">
        <span className="text-[color:var(--ember-text)]">
          {fmt(S.deletions)} {t({ en: "removed", nl: "verwijderd" })}
        </span>
        <span className="text-muted">
          {fmt(S.insertions)} {t({ en: "written", nl: "geschreven" })}
        </span>
      </div>
    </figure>
  )
}

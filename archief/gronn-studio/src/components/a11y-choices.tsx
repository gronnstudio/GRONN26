"use client"

import { useT } from "@/components/language-provider"
import {
  useContrastPref,
  useMotionPref,
  useResumePref,
  useShortcutsPref,
  useTextScale,
  useUnderlinePref,
} from "@/lib/use-a11y-prefs"
import { cn } from "@/lib/utils"

// De voorkeursknoppen, op één plek.
//
// WAAROM DIT BESTAND ER IS. Deze vier stonden privé in
// `concept-menu.tsx`, en dat werkte zolang de desktop het enige
// oppervlak was dat ze aanbood. Het telefoonwiel biedt ze nu ook aan,
// en een tweede kopie is precies de scheefgroei die deze zomer twee keer
// is gebeurd met de navigatie: drie menu's die in de pas moesten blijven
// liepen uit de pas, en niemand zag het tot ze naast elkaar lagen.
//
// Dus: de knoppen naar beneden, de panelen erboven. `concept-menu.tsx`
// en `hoek-paneel.tsx` tekenen dezelfde knoppen, en ze kunnen niet meer
// van elkaar afwijken.
//
// Wat deze knoppen bedienen staat in `use-a11y-prefs.ts` — dáár staat
// waarom deze voorkeuren het besturingssysteem mogen OVERRULEN in beide
// richtingen, en waarom "onderstreep elke link" bestaat.

/** De vorm die elke voorkeursknop draagt. Eén regel, zes afnemers. */
export const PILL =
  "tap-target inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-300"

/** Aan of uit, als een merkteken in plaats van een schuifje. */
export function Dot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 rounded-full",
        on ? "bg-gronn-ember" : "bg-transparent ring-1 ring-inset ring-line/40"
      )}
    />
  )
}

/** De twee standen die elke knop hier kent. */
const on = "border-gronn-ember/50 text-foreground"
const off = "border-line/25 text-muted hover:text-foreground"

/** System → reduced → full, one labelled cycle button. */
export function MotionChoice() {
  const t = useT()
  const [pref, setPref] = useMotionPref()
  const label =
    pref === "system"
      ? t({ en: "Motion: system", nl: "Beweging: systeem" })
      : pref === "full"
        ? t({ en: "Motion: full", nl: "Beweging: volledig" })
        : t({ en: "Motion: reduced", nl: "Beweging: rustig" })

  return (
    <button
      type="button"
      onClick={() =>
        setPref(pref === "system" ? "reduced" : pref === "reduced" ? "full" : "system")
      }
      className={cn(PILL, pref === "system" ? off : on)}
    >
      <Dot on={pref !== "system"} />
      {label}
    </button>
  )
}

export function UnderlineChoice() {
  const t = useT()
  const [underlined, setUnderlined] = useUnderlinePref()
  return (
    <button
      type="button"
      aria-pressed={underlined}
      onClick={() => setUnderlined(!underlined)}
      className={cn(PILL, underlined ? on : off)}
    >
      <Dot on={underlined} />
      {underlined
        ? t({ en: "Links: underlined", nl: "Links: onderstreept" })
        : t({ en: "Underline links", nl: "Links onderstrepen" })}
    </button>
  )
}

export function ShortcutChoice() {
  const t = useT()
  const [live, setLive] = useShortcutsPref()
  return (
    <button
      type="button"
      aria-pressed={live}
      onClick={() => setLive(!live)}
      className={cn(PILL, live ? on : off)}
      // The criterion is about being able to switch these off. Saying
      // which key opens the list is what stops the feature being a
      // secret — a shortcut nobody can discover is one nobody has.
      title={
        live ? t({ en: "Press ? for the list", nl: "Druk op ? voor de lijst" }) : undefined
      }
    >
      <Dot on={live} />
      {live
        ? t({ en: "Shortcuts on · ?", nl: "Sneltoetsen aan · ?" })
        : t({ en: "Shortcuts off", nl: "Sneltoetsen uit" })}
    </button>
  )
}

/**
 * Normaal → groot → groter, één gelabelde cyclusknop.
 *
 * Dezelfde vorm als `MotionChoice`, en dat is geen toeval: CLAUDE.md
 * regel 1 zegt dat elke bediening een zichtbaar label nodig heeft dat een
 * eerste bezoeker begrijpt — drie naamloze A'tjes van oplopend formaat is
 * precies de puzzel die daar is afgewezen.
 *
 * Het percentage zit op `<html>` (zie `globals.css`), dus de hele site
 * schaalt mee en er is geen tweede schaal die kan afwijken.
 */
export function TextScaleChoice() {
  const t = useT()
  const [scale, setScale] = useTextScale()
  const label =
    scale === "normal"
      ? t({ en: "Text: normal", nl: "Tekst: normaal" })
      : scale === "large"
        ? t({ en: "Text: large", nl: "Tekst: groot" })
        : t({ en: "Text: larger", nl: "Tekst: groter" })

  return (
    <button
      type="button"
      onClick={() =>
        setScale(scale === "normal" ? "large" : scale === "large" ? "larger" : "normal")
      }
      className={cn(PILL, scale === "normal" ? off : on)}
    >
      <Dot on={scale !== "normal"} />
      {label}
    </button>
  )
}

/**
 * Extra contrast.
 *
 * Aan/uit en niet een cyclus, want er is geen derde stand: `color-mix`
 * trekt `--muted` en `--line` naar de voorgrond toe, in alle tien de
 * paletten tegelijk, en dat kan per definitie alleen omhoog.
 */
export function ContrastChoice() {
  const t = useT()
  const [pref, setPref] = useContrastPref()
  const more = pref === "more"
  return (
    <button
      type="button"
      aria-pressed={more}
      onClick={() => setPref(more ? "system" : "more")}
      className={cn(PILL, more ? on : off)}
    >
      <Dot on={more} />
      {more
        ? t({ en: "Contrast: extra", nl: "Contrast: extra" })
        : t({ en: "Extra contrast", nl: "Extra contrast" })}
    </button>
  )
}

/** "Verder lezen waar je was" — het laatste hoofdstuk, alleen op dit toestel. */
export function ResumeChoice() {
  const t = useT()
  const [aan, zet] = useResumePref()
  return (
    <button
      type="button"
      aria-pressed={aan}
      onClick={() => zet(!aan)}
      className={cn(PILL, aan ? on : off)}
    >
      <Dot on={aan} />
      {aan
        ? t({ en: "Continue reading: on", nl: "Verder lezen: aan" })
        : t({ en: "Continue where you left off", nl: "Verder lezen waar je was" })}
    </button>
  )
}

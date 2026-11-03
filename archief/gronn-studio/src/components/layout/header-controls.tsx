"use client"

import { useTheme } from "next-themes"

import { LanguageFlag } from "@/components/language-flag"
import { useLanguage, useT } from "@/components/language-provider"
import { useThemeMode } from "@/components/theme-mode-provider"
import { useHydrated } from "@/lib/use-hydrated"
import { useSearch } from "@/components/search/command-palette"
import { DAY_THEME, NIGHT_THEME } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { Komeet } from "@/components/layout/komeet"

// Four controls, each one job, each narrow enough that five section
// triggers and the CTA still fit beside them.
//
// This replaced a single palette button holding everything, then a bar
// carrying every labelled toggle at once. The second version was measured
// at 1280px: logo 123px + right group 1109px = 1232px, exactly the
// content column, so the logo and the nav touched. Labels like "THEMA
// AUTO · LICHT" are long by design — rule 1 says a control carries a
// word — which is precisely why the daily ones are icons with an
// aria-label and the wordy ones live in the concept panel.
//
// The ember comet rides the edge of each: `orbit-ring` is what makes
// search, hours, language and concepts read as one family of site
// controls. It freezes under prefers-reduced-motion (globals.css).

/**
 * One pill holding all four site controls, with ONE ember comet riding
 * its edge.
 *
 * Four separately ringed circles meant four comets orbiting four rings —
 * busy, and it said these were four unrelated things. They are one thing:
 * how this site behaves for you. Same construction as the phone dock's
 * pill, which is the other place the site groups controls this way.
 */
export function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative hidden items-center rounded-full md:flex">
      <Komeet />
      <div className="glass flex items-center gap-0.5 rounded-full p-1">
        {children}
      </div>
    </div>
  )
}

// Inside the pill each control is bare: no glass of its own, no ring.
const CONTROL =
  "tap-target grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] hover:text-gronn-green"

/** The ⌘K trigger. */
export function SearchTrigger() {
  const t = useT()
  const { open } = useSearch()

  return (
    <button
      type="button"
        onClick={open}
        aria-label={t({ en: "Search this site", nl: "Zoek op deze site" })}
        className="tap-target flex h-9 items-center gap-2 rounded-full px-3 text-sm text-foreground transition-colors hover:bg-foreground/[0.06] hover:text-gronn-green"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="shrink-0 text-gronn-green">
          <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
          <path d="m15.4 15.4 4.1 4.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="hidden xl:inline">{t({ en: "Search", nl: "Zoeken" })}</span>
        {/* Shown, not hidden in a tooltip — it is the fastest way in and
            nobody guesses a shortcut. */}
        <kbd className="rounded border border-line/20 px-1.5 py-0.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
    </button>
  )
}

/**
 * Sun ↔ moon: Golden Hour ↔ Blue Hour, the two default palettes.
 *
 * Choosing either writes `manual`, so the clock stops driving — the same
 * contract the full picker has. Auto is not in this switch on purpose: a
 * three-state control cannot be a one-glyph button honestly, and Auto
 * lives one click away in the concept panel.
 */
export function HoursSwitch() {
  const t = useT()
  const { resolvedTheme } = useTheme()
  const { chooseTheme } = useThemeMode()
  // Pas na de hydratie naar het echte thema kijken. De server kent het
  // thema van de bezoeker niet (resolvedTheme is daar undefined, dus
  // "nacht"); de eerste renderronde in de browser las het al uit
  // localStorage — twee verschillende labels, en React gooide de hele kop
  // weg (hydratiefout #418). Tot `mounted` rendert de knop dus precies
  // wat de server rendert.
  const mounted = useHydrated()
  const isNight = mounted ? resolvedTheme !== DAY_THEME : true

  return (
    <button
      type="button"
        onClick={() => chooseTheme(isNight ? DAY_THEME : NIGHT_THEME)}
        aria-label={
          isNight
            ? t({ en: "Switch to light", nl: "Naar licht" })
            : t({ en: "Switch to dark", nl: "Naar donker" })
        }
        className={CONTROL}
      >
        {isNight ? (
          // Sun: click to go light.
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" fill="none" />
            <path
              d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          // Moon: click to go dark.
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M20 14.2A8.4 8.4 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
    </button>
  )
}

/**
 * The flag of the language you are reading, which switches to the other.
 *
 * A flag is a poor label for a language in general — a language is not a
 * country — so the accessible name carries the full language name and
 * says which way the click goes ("Schakel naar Nederlands"). With exactly
 * two locales a toggle beats a dropdown: the g-eog original is a picker
 * because it has eleven. The drawing lives in `language-flag.tsx`, the
 * one place it is drawn; the phone panel's toggle shows the same flags.
 */

export function LanguageSwitch() {
  const t = useT()
  const { locale, setLocale } = useLanguage()
  const next = locale === "nl" ? "en" : "nl"

  return (
    <button
      type="button"
        onClick={() => setLocale(next)}
        aria-label={
          next === "nl"
            ? t({ en: "Switch to Dutch", nl: "Schakel naar Nederlands" })
            : t({ en: "Switch to English", nl: "Schakel naar Engels" })
        }
        // Same size-11 box as the hours and concept buttons. It was a
        // padded pill, which made it visibly shorter than the two circles
        // beside it — the row read as two controls and something else.
        className={CONTROL}
      >
        <LanguageFlag locale={locale} />
    </button>
  )
}

/**
 * The accessibility mark, not a palette.
 *
 * A palette said "colours", and colours are the least of what is behind
 * this button: motion, link underlines and the recording blur all live
 * there too. The universal a11y glyph — a figure with arms out inside a
 * circle — says "this is where the site bends to you", which is the
 * actual promise.
 */
export function ConceptTrigger({
  open,
  onClick,
  id,
}: {
  open: boolean
  onClick: () => void
  id: string
}) {
  const t = useT()
  return (
    <button
      type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onClick}
        aria-label={t({
          en: "Concept palettes and accessibility",
          nl: "Conceptpaletten en toegankelijkheid",
        })}
        className={cn(CONTROL, open && "text-gronn-ember")}
      >
        <ToegankelijkIcoon />
    </button>
  )
}

/**
 * Het bekende toegankelijkheidspoppetje in een cirkel. Eén tekening voor
 * de desktopbalk en de telefoon (hoek-paneel), zodat bezoekers op beide
 * hetzelfde teken herkennen.
 */
export function ToegankelijkIcoon({ size = 20, strokeWidth = 1.8 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} fill="none" />
      <circle cx="12" cy="6.9" r="1.25" fill="currentColor" />
      <path
        d="M6.9 9.6h10.2M12 9.9v4.2M12 14.1 9.7 18.1M12 14.1l2.3 4"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

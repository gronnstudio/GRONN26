import type { L } from "@/lib/i18n"

// The palettes: Golden Hour and Blue Hour, and nothing else.
//
// They follow the visitor's own clock: warm ground by day, deep indigo
// after dark. The visitor can always overrule it.
//
// Until 23 Sep 2026 there was a second set of eight "concept" palettes
// behind its own switcher. The owner retired them ("only golden en blue
// stay"). A visitor who still has one of them stored is moved back to
// Auto by the pre-paint script in layout.tsx.
//
// Swatch values (`bg`, `dot`) are duplicated from globals.css on purpose:
// the switcher paints them before hydration, when the custom properties
// of a theme that is not yet applied cannot be read. Keep them in step
// with the token blocks — `node scripts/check-contrast.mjs` audits the
// tokens, not these.

export type ThemeOption = {
  name: string
  label: L
  bg: string
  dot: string
}

export type ThemeSet = {
  id: string
  /** Names the set on its own switcher, so the two are told apart. */
  label: L
  options: ThemeOption[]
}

/* ---------------- the time-of-day default ---------------- */

/** localStorage flag: has the visitor overruled the clock? */
export const THEME_MODE_KEY = "gronn-theme-mode"
/** next-themes' own storage key — we pre-seed it in the boot script. */
export const THEME_KEY = "theme"

export type ThemeMode = "auto" | "manual"

export const DAY_THEME = "goldenhour"
export const NIGHT_THEME = "bluehour"

// Local clock, not sunrise tables. Working out real sunrise needs the
// visitor's latitude, and asking for location permission to pick a colour
// would be a wildly disproportionate trade. These two boundaries are an
// honest approximation and are the single source of truth — the pre-paint
// boot script in layout.tsx is generated from them.
export const DAY_START_HOUR = 7
export const NIGHT_START_HOUR = 19

/** Which default palette the visitor's own clock calls for. */
export function resolveAutoTheme(now: Date = new Date()): string {
  const hour = now.getHours()
  return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR
    ? DAY_THEME
    : NIGHT_THEME
}

/* ---------------- the two sets ---------------- */

// De bezoeker leest "Licht" en "Donker" (eigenaar, 24 sep 2026: "in feite
// is het licht en donker, en geen goud en blauw meer"). De namen
// `goldenhour`/`bluehour` blijven intern: het zijn de class-namen in
// globals.css en de waarde die in localStorage staat — hernoemen zou de
// keuze van terugkerende bezoekers wissen.
const GOLDEN_HOUR: ThemeOption = {
  name: DAY_THEME,
  label: { en: "Light", nl: "Licht" },
  // Brand Guide 2026: gebroken wit met bosgroen.
  bg: "#efeeea",
  dot: "#23483a",
}

const BLUE_HOUR: ThemeOption = {
  name: NIGHT_THEME,
  label: { en: "Dark", nl: "Donker" },
  // Brand Guide 2026: antraciet met salie.
  bg: "#202020",
  dot: "#b8c5a8",
}

// Set one — what the site actually wears. Day first, then night.
export const DEFAULT_SET: ThemeSet = {
  id: "default",
  label: { en: "Theme", nl: "Thema" },
  options: [GOLDEN_HOUR, BLUE_HOUR],
}

export const THEME_SETS = [DEFAULT_SET]

// Every theme name next-themes needs to know about. Derived, so adding a
// palette to a set above cannot leave the provider out of step.
export const ALL_THEME_NAMES = THEME_SETS.flatMap((set) =>
  set.options.map((option) => option.name)
)

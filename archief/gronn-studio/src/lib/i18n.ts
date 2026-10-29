// Every user-facing string is a Localized pair. The active locale comes
// from the URL (`/projects` is English, `/nl/projects` is Dutch — see
// src/lib/locale.ts and proxy.ts); client components read it with
// useT(), server components with getT(locale).
export type Locale = "en" | "nl"

export type L = { en: string; nl: string }

export function pick(l: L, locale: Locale): string {
  return l[locale]
}

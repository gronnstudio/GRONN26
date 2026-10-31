import { pick, type L, type Locale } from "@/lib/i18n"

// URL-based locales. English keeps the clean paths it was indexed with
// (`/projects`); Dutch lives under `/nl` (`/nl/projects`). Middleware
// rewrites the unprefixed paths onto the `en` segment, so both are the
// same statically generated routes underneath.
export const LOCALES: Locale[] = ["en", "nl"]
export const DEFAULT_LOCALE: Locale = "en"

// ── Whose language is it? ──────────────────────────────────────────
//
// The site follows the VISITOR'S language until the visitor says
// otherwise, and then their choice wins permanently. That is the same
// contract the theme already has — the clock picks Golden or Blue Hour
// until you pick for yourself, after which the clock stops driving —
// and it should not need learning twice on one site.
//
// `gronn-lang-mode=manual` is the switch that stops the guessing, and
// `gronn-lang` is the language that was chosen. The proxy APPLIES that
// choice: an unprefixed navigation (`/` from the home-screen app, a
// bookmark, a typed URL) goes to `/nl` when Dutch was chosen. Until
// 23 Sep 2026 the choice only stopped the guessing and was never
// applied, so choosing Dutch and then opening the app landed in English.
//
// Two stores, each with its own job:
//
//  · The COOKIE is what the server reads. The decision has to be made
//    there, before anything is rendered: doing it in the browser would
//    paint English at a Dutch visitor and then swap, which is the
//    language version of a flash of the wrong theme.
//  · LOCALSTORAGE (`LANG_STORAGE_KEY`, owner: "taal switch onthouden in
//    local storage") is the backup the browser keeps. Cookies get
//    cleared on their own — Safari caps cookies written from script,
//    people clear "cookies" and not "site data", and a home-screen app
//    can hold a cookie jar of its own. When the cookie is gone and the
//    backup is not, `LanguageMemory` in language-provider.tsx writes the
//    cookie back and moves the page to the remembered language once.

export const LANG_COOKIE = "gronn-lang"
export const LANG_MODE_COOKIE = "gronn-lang-mode"
export const LANG_STORAGE_KEY = "gronn-lang"

/**
 * The best match for an `Accept-Language` header.
 *
 * Ordinary quality-value parsing: `nl-NL,nl;q=0.9,en;q=0.8` means Dutch
 * first. Region is dropped — `nl-BE` is still Dutch — and anything the
 * site does not speak is skipped rather than defaulted, so a visitor
 * whose first language is German gets the site's own default rather
 * than whichever of ours happens to appear first in their list.
 */
export function preferredLocale(acceptLanguage: string | null): Locale | null {
  if (!acceptLanguage) return null
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2)
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 }
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const base = tag.split("-")[0]
    if (isLocale(base)) return base
  }
  return null
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value)
}

/** Narrow an unknown route segment to a Locale, falling back to English. */
export function toLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : DEFAULT_LOCALE
}

/** Every locale, for generateStaticParams. */
export function localeParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/**
 * Server-side counterpart of the client `useT()` — resolves a bilingual
 * value without any client JavaScript:
 *   const t = getT(locale); t({ en: "Projects", nl: "Projecten" })
 */
export function getT(locale: Locale) {
  return (value: L) => pick(value, locale)
}

// Routes that live outside the localized tree: the owner tools and the
// API. They must never be given a language prefix — /nl/editor is a 404.
//
// Every top-level directory in `src/app` that is NOT `[locale]` belongs
// here. `/admin` was added to the footer, curtain and dock before it was
// added to this list, so a Dutch visitor clicking it landed on
// /nl/admin — a 404, because `LocaleLink` prefixes anything this array
// does not name. Adding a route to the site's navigation means adding it
// here in the same change.
// Every tree that lives OUTSIDE `[locale]`. Miss one and `localePath`
// prefixes it, so a Dutch visitor clicking it lands on /nl/<path> — a
// 404. That has happened here twice with /admin, and once more when the
// panel moved to /dashboard: the footer link was updated, the list was
// not, and the sweep in behaviors.spec.ts caught it the same afternoon.
const UNLOCALIZED = ["/editor", "/admin", "/dashboard", "/os", "/clients", "/api", "/links", "/handtekening"]

/**
 * Het subdomein van de linkpagina (eigenaar, 27 sep 2026: "kun je op
 * gronn.studio ook een subdomein creëren en een soort bentobox linktree
 * maken?"). `src/proxy.ts` zet `/` op deze host om naar `/links` en
 * stuurt elk ander pagina-pad terug naar het hoofddomein.
 */
export const LINKS_HOST = "links.gronn.studio"

export function isUnlocalized(path: string) {
  return UNLOCALIZED.some((base) => path === base || path.startsWith(`${base}/`))
}

/** Public path for a locale: "/projects" (en) vs "/nl/projects". */
export function localePath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`
  if (isUnlocalized(clean)) return clean
  if (locale === DEFAULT_LOCALE) return clean === "/" ? "/" : clean
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`
}

/** Strip a locale prefix from a pathname, giving the shared route. */
export function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
  }
  return pathname
}

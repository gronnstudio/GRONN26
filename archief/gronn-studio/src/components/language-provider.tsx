"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"

import { pick, type L, type Locale } from "@/lib/i18n"
import {
  DEFAULT_LOCALE,
  isLocale,
  LANG_COOKIE,
  LANG_MODE_COOKIE,
  LANG_STORAGE_KEY,
  localePath,
  stripLocale,
} from "@/lib/locale"

// The locale is part of the URL, not browser state: `/projects` is
// English, `/nl/projects` is Dutch. The server therefore knows the
// language before a single byte of JavaScript runs — which is what makes
// the Dutch site indexable, and what lets copy be resolved server-side.
// Switching languages is a navigation, so the choice is shareable and
// bookmarkable.
//
// The CHOICE is remembered twice (see the note in lib/locale.ts): in a
// cookie, which is what the proxy reads to send `/` to `/nl`, and in
// localStorage, the backup the browser — and the home-screen app — keeps
// for when the cookie has gone.
const LanguageContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Zie `vastPad` op LanguageProvider. */
  vastPad?: boolean
}>({ locale: DEFAULT_LOCALE, setLocale: () => {} })

const YEAR = 60 * 60 * 24 * 365

/**
 * Write the choice where the server reads it. Returns whether it stuck:
 * a browser that refuses cookies accepts the assignment silently, and
 * only reading it back tells you it went nowhere.
 *
 * A year, and Lax: this travels on a top-level navigation, which is
 * exactly when the proxy needs to read it, and never on a cross-site
 * request.
 */
function writeLangCookies(locale: Locale): boolean {
  try {
    document.cookie = `${LANG_MODE_COOKIE}=manual; path=/; max-age=${YEAR}; samesite=lax`
    document.cookie = `${LANG_COOKIE}=${locale}; path=/; max-age=${YEAR}; samesite=lax`
    return readCookieLocale() === locale
  } catch {
    return false
  }
}

/** The chosen locale in the cookie, or null when there is no choice. */
function readCookieLocale(): Locale | null {
  try {
    const jar = new Map(
      document.cookie
        .split(";")
        .map((part) => part.trim().split("=") as [string, string | undefined])
        .map(([name, value]) => [name, value ?? ""])
    )
    const lang = jar.get(LANG_COOKIE)
    return jar.get(LANG_MODE_COOKIE) === "manual" && lang && isLocale(lang)
      ? lang
      : null
  } catch {
    return null
  }
}

// localStorage can throw (Safari private mode, blocked site data), so
// every touch is wrapped. Without it the site still works; it only
// forgets sooner.
function readStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    return stored && isLocale(stored) ? stored : null
  } catch {
    return null
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, locale)
  } catch {
    // Storage refused: the cookie still carries the choice.
  }
}

export function LanguageProvider({
  children,
  locale = DEFAULT_LOCALE,
  vastPad = false,
}: {
  children: ReactNode
  /** Supplied by the server from the URL segment. */
  locale?: Locale
  /**
   * Een pagina zonder taalprefix die de taal uit de cookie leest (de
   * linkpagina, /links). Wisselen schrijft dezelfde twee opslagplekken en
   * laadt dezelfde pagina opnieuw in plaats van naar /en/… te gaan.
   */
  vastPad?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()

  const setLocale = useCallback(
    (next: Locale) => {
      // Choosing stops the guessing, permanently, and from then on the
      // proxy sends unprefixed addresses to this language — the same
      // contract as picking a palette, which stops the clock.
      //
      // Both stores are written BEFORE the navigation, so `LanguageMemory`
      // on the page that follows finds them agreeing and has nothing to
      // restore: an explicit switch is never fought.
      writeLangCookies(next)
      writeStoredLocale(next)
      if (vastPad) {
        router.refresh()
        return
      }
      // Same page, other language — never dump the visitor on the home
      // page for changing language.
      router.push(localePath(next, stripLocale(pathname ?? "/")))
    },
    [pathname, router, vastPad]
  )

  // Zonder taalprefix draait het inline `lang`-script alleen bij het
  // eerste laden; na een refresh in de andere taal zet dit hem goed.
  useEffect(() => {
    if (vastPad) document.documentElement.lang = locale
  }, [locale, vastPad])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, vastPad }}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * Keeps the two stores of the language choice in step, and puts a lost
 * cookie back.
 *
 * Mounted once, in the `[locale]` layout — not in `LanguageProvider`,
 * which the root providers and the dashboard also mount with a locale
 * that is not the URL's.
 *
 *  · Cookie present: it is what the server acted on, so it wins, and the
 *    backup is brought up to date (this also gives every visitor who
 *    chose before the backup existed one).
 *  · Cookie gone, backup present: the cookie is written back, and when
 *    this page is in the other language, the page is REPLACED (not
 *    pushed — the wrong-language page should not sit in the history)
 *    with the same page in the remembered one.
 *
 * It cannot loop. It only navigates when the cookie was missing AND the
 * rewrite demonstrably stuck, so the page it lands on finds a cookie and
 * does nothing; a browser that refuses cookies is never navigated at all
 * (otherwise a Dutch browser that chose English would bounce between the
 * proxy's guess and this correction forever). And it runs once per mount.
 */
export function LanguageMemory() {
  const { locale, vastPad } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const cookie = readCookieLocale()
    if (cookie) {
      if (readStoredLocale() !== cookie) writeStoredLocale(cookie)
      return
    }

    const stored = readStoredLocale()
    if (!stored) return
    if (!writeLangCookies(stored)) return
    if (stored === locale) return
    // Zonder taalprefix (de linkpagina): de server leest de teruggezette
    // cookie bij het opnieuw laden.
    if (vastPad) {
      router.refresh()
      return
    }

    const target = localePath(stored, stripLocale(pathname ?? "/"))
    const { search, hash } = window.location
    router.replace(`${target}${search}${hash}`)
  }, [locale, pathname, router, vastPad])

  return null
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// Resolve a Localized string in the current locale: const t = useT()
export function useT() {
  const { locale } = useContext(LanguageContext)
  return useCallback((l: L) => pick(l, locale), [locale])
}

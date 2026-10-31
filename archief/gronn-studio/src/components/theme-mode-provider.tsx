"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useTheme } from "next-themes"

import {
  THEME_MODE_KEY,
  resolveAutoTheme,
  type ThemeMode,
} from "@/lib/themes"

// Owns the one bit next-themes has no concept of: whether the palette is
// following the visitor's clock or a choice they made themselves.
//
// "auto" is the default — an unset flag means auto, so a first-time
// visitor gets the time-appropriate ground without having asked. The
// moment they pick any palette from either switcher we write "manual" and
// stop touching it. Overruling is permanent until they choose Auto again;
// a site that quietly reverted your choice at 19:00 would be broken.
//
// The pre-paint script in layout.tsx reads the same flag and seeds
// next-themes' storage before first paint, so auto visitors never see a
// flash of the wrong palette. This provider is what keeps it true *after*
// paint — across the 07:00/19:00 boundary while a tab sits open.

type ThemeModeValue = {
  mode: ThemeMode
  /** Follow the clock again, and apply the right palette immediately. */
  enableAuto: () => void
  /** Take a palette by hand; the clock stops driving. */
  chooseTheme: (theme: string) => void
}

const ThemeModeContext = createContext<ThemeModeValue | null>(null)

// The flag lives in localStorage, which is external mutable state, so it
// is read through useSyncExternalStore rather than copied into React
// state inside an effect (this repo lints that pattern out, and rightly:
// it causes a cascading render on every mount).
const listeners = new Set<() => void>()

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  // `storage` covers other tabs; the local set is for this one, since a
  // tab never hears its own storage event.
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

const getSnapshot = (): ThemeMode => {
  try {
    return localStorage.getItem(THEME_MODE_KEY) === "manual" ? "manual" : "auto"
  } catch {
    return "auto"
  }
}

// The server cannot know the flag. "auto" is also the boot script's
// default for an unset flag, so the two agree on a first visit.
const getServerSnapshot = (): ThemeMode => "auto"

const writeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode)
  } catch {}
  listeners.forEach((notify) => notify())
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme()
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // While on auto, keep the palette honest: re-check on a slow interval
  // and whenever the tab comes back, so a page left open overnight is not
  // still wearing daylight. The interval is cheap — setTheme is a no-op
  // when the value is unchanged.
  useEffect(() => {
    // Gate on localStorage read at effect time, NOT on the render-time
    // `mode`. During hydration `mode` is still the server snapshot
    // ("auto", since the server cannot know the flag), so trusting it
    // here fires one sync that overwrites a returning visitor's stored
    // override with the time-of-day palette. The live read is
    // authoritative; `mode` stays in the deps so a click still re-runs.
    if (getSnapshot() !== "auto") return

    const sync = () => {
      if (getSnapshot() !== "auto") return
      setTheme(resolveAutoTheme())
    }
    sync()

    const id = window.setInterval(sync, 60_000)
    const onVisible = () => {
      if (document.visibilityState === "visible") sync()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      window.clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [mode, setTheme])

  const enableAuto = useCallback(() => {
    writeMode("auto")
    setTheme(resolveAutoTheme())
  }, [setTheme])

  const chooseTheme = useCallback(
    (theme: string) => {
      writeMode("manual")
      setTheme(theme)
    },
    [setTheme]
  )

  const value = useMemo(
    () => ({ mode, enableAuto, chooseTheme }),
    [mode, enableAuto, chooseTheme]
  )

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export function useThemeMode(): ThemeModeValue {
  const value = useContext(ThemeModeContext)
  if (!value) {
    throw new Error("useThemeMode must be used inside ThemeModeProvider")
  }
  return value
}

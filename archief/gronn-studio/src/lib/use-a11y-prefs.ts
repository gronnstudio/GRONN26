"use client"

import { useCallback, useSyncExternalStore } from "react"

// Accessibility preferences the visitor sets themselves, stored on the
// device and mirrored onto <html> as data-* attributes so CSS can act on
// them without a re-render.
//
// Two of these deliberately OVERRIDE the operating system rather than
// merely reading it. `prefers-reduced-motion` is an OS-wide switch, and
// someone who wants this one site calmer should not have to change a
// system setting for it — nor should someone whose system says "reduce"
// be unable to see the terrain move if they want to.
//
// `underline` exists because of a real failure on this site: menu
// headings and menu links were set in the same face at nearly the same
// size, and the owner could not tell which rows were clickable. That was
// fixed in the menu, but a permanent "underline every link" is the
// setting that fixes it everywhere at once, for anyone who needs it.

export type MotionPref = "system" | "full" | "reduced"

/**
 * Hoe groot de tekst staat.
 *
 * Als PERCENTAGE op `<html>`, niet als een eigen schaalvariabele: de hele
 * site is in `rem` gezet (Tailwind doet dat van zichzelf), dus één
 * wortelmaat verzet alle tekst tegelijk en er is geen tweede systeem dat
 * kan afwijken.
 *
 * De vaste px-maten blijven staan, en dat is met opzet: de telefoonbalk
 * is uitgerekend op 360px breed en zou bij 125% uit beeld lopen. Tekst
 * groeit, chroom niet.
 */
export type TextScale = "normal" | "large" | "larger"

/**
 * Extra contrast.
 *
 * `more` trekt `--muted` en `--line` naar de voorgrondkleur toe met
 * `color-mix`, dus het werkt in alle tien de paletten tegelijk en het kan
 * per definitie alleen omhoog. Een eigen kleurenblok per thema zou een
 * elfde palet zijn dat kan afwijken.
 */
export type ContrastPref = "system" | "more"

const KEY_MOTION = "gronn-a11y-motion"
const KEY_UNDERLINE = "gronn-a11y-underline"
const KEY_SHORTCUTS = "gronn-a11y-shortcuts"
const KEY_TEXT = "gronn-a11y-text"
const KEY_CONTRAST = "gronn-a11y-contrast"
const EVENT = "gronn-a11y-change"

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Private mode: the choice applies to this page and is not kept.
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Mirror onto <html> so plain CSS can respond without React. */
export function applyA11yPrefs() {
  const root = document.documentElement
  const motion = read(KEY_MOTION)
  if (motion === "full" || motion === "reduced") root.dataset.motion = motion
  else delete root.dataset.motion
  if (read(KEY_UNDERLINE) === "on") root.dataset.underline = "on"
  else delete root.dataset.underline
  const text = read(KEY_TEXT)
  if (text === "large" || text === "larger") root.dataset.text = text
  else delete root.dataset.text
  if (read(KEY_CONTRAST) === "more") root.dataset.contrast = "more"
  else delete root.dataset.contrast
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  // Another tab changing the same preference should not leave this one
  // out of step.
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

export function useMotionPref() {
  const pref = useSyncExternalStore(
    subscribe,
    () => (read(KEY_MOTION) as MotionPref | null) ?? "system",
    () => "system" as MotionPref
  )
  const setPref = useCallback((next: MotionPref) => {
    write(KEY_MOTION, next === "system" ? null : next)
    applyA11yPrefs()
  }, [])
  return [pref, setPref] as const
}

/**
 * Single-key shortcuts, and whether they are live.
 *
 * WCAG 2.1.4 Character Key Shortcuts is a Level A criterion: a shortcut
 * using only a letter, number or punctuation character must be possible
 * to turn off, remap, or confine to focus. This site had `/` opening
 * search with none of the three, which is a plain failure — it guarded
 * against typing in a field, but that is not one of the three things
 * the criterion asks for.
 *
 * Turning them off is the option taken. Remapping is a preferences
 * screen nobody wants for four bindings, and focus-confinement makes a
 * "jump to section" shortcut useless.
 *
 * Chorded shortcuts are NOT covered by this and stay on: ⌘K holds a
 * modifier, so it cannot be triggered by a stray keypress or by speech
 * input dictating a word.
 *
 * Default on. Someone who needs them off can turn them off; defaulting
 * off would hide the feature from everyone to serve nobody.
 */
export function useShortcutsPref() {
  const on = useSyncExternalStore(
    subscribe,
    () => read(KEY_SHORTCUTS) !== "off",
    () => true
  )
  const setOn = useCallback((next: boolean) => {
    write(KEY_SHORTCUTS, next ? null : "off")
  }, [])
  return [on, setOn] as const
}

export function useUnderlinePref() {
  const on = useSyncExternalStore(
    subscribe,
    () => read(KEY_UNDERLINE) === "on",
    () => false
  )
  const setOn = useCallback((next: boolean) => {
    write(KEY_UNDERLINE, next ? "on" : null)
    applyA11yPrefs()
  }, [])
  return [on, setOn] as const
}

export function useTextScale() {
  const scale = useSyncExternalStore(
    subscribe,
    () => (read(KEY_TEXT) as TextScale | null) ?? "normal",
    () => "normal" as TextScale
  )
  const setScale = useCallback((next: TextScale) => {
    write(KEY_TEXT, next === "normal" ? null : next)
    applyA11yPrefs()
  }, [])
  return [scale, setScale] as const
}

export function useContrastPref() {
  const pref = useSyncExternalStore(
    subscribe,
    () => (read(KEY_CONTRAST) as ContrastPref | null) ?? "system",
    () => "system" as ContrastPref
  )
  const setPref = useCallback((next: ContrastPref) => {
    write(KEY_CONTRAST, next === "system" ? null : next)
    applyA11yPrefs()
  }, [])
  return [pref, setPref] as const
}

// ── PALET-OPTIES (25 sep 2026) ──────────────────────────────────────
//
// Twee gemakken die de eigenaar goedkeurde als KEUZE, allebei standaard
// uit: pijlen voor terug en verder halverwege de
// schermrand (telefoon), en verder lezen waar je was
// op een lang projectverhaal. Zelfde opslag en hetzelfde event als de
// voorkeuren hierboven, zodat een tweede tab en het paneel in de pas
// blijven. Ze hoeven niet op <html>: geen CSS reageert erop.

const KEY_PIJLEN = "gronn-pref-pijlen"
const KEY_RESUME = "gronn-pref-resume"

function useAanUit(key: string) {
  const on = useSyncExternalStore(
    subscribe,
    () => read(key) === "on",
    () => false
  )
  const setOn = useCallback(
    (next: boolean) => write(key, next ? "on" : null),
    [key]
  )
  return [on, setOn] as const
}

/** "Pijlen voor terug en verder": twee knoppen halverwege de schermrand. */
export function usePijlenPref() {
  return useAanUit(KEY_PIJLEN)
}

/** "Verder lezen waar je was": het laatste hoofdstuk per project onthouden. */
export function useResumePref() {
  return useAanUit(KEY_RESUME)
}

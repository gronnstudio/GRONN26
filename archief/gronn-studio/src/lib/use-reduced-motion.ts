"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"
const EVENT = "gronn-a11y-change"
const KEY = "gronn-a11y-motion"

// The visitor's own choice beats the operating system in BOTH directions:
// "reduced" calms this site on a machine that says nothing, and "full"
// lets someone whose OS says reduce still watch the terrain move here.
// With no choice stored, the media query decides, exactly as before.
function resolve(): boolean {
  try {
    const pref = window.localStorage.getItem(KEY)
    if (pref === "reduced") return true
    if (pref === "full") return false
  } catch {
    // Fall through to the media query.
  }
  return window.matchMedia(QUERY).matches
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  window.addEventListener(EVENT, callback)
  window.addEventListener("storage", callback)
  return () => {
    mql.removeEventListener("change", callback)
    window.removeEventListener(EVENT, callback)
    window.removeEventListener("storage", callback)
  }
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, resolve, () => false)
}

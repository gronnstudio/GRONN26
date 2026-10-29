"use client"

import { useSyncExternalStore } from "react"

// Is the site running as an installed app (launched from the home
// screen)? This is the gate for "app mode": the browser website keeps
// its current chrome, the installed experience gets the app-like layer
// (labeled tab bar, instant screen transitions). iOS Safari predates the
// display-mode media query's flag and exposes navigator.standalone
// instead, so both are checked.
const QUERY = "(display-mode: standalone)"

export function isStandalone() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia(QUERY).matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

export function useStandalone() {
  return useSyncExternalStore(subscribe, isStandalone, () => false)
}

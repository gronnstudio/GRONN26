"use client"

import { useSyncExternalStore } from "react"
import type { Taal } from "./taal"

function abonneer(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => mo.disconnect()
}

/** De gekozen taal in een clientcomponent (server en hydratie: nl). */
export function useTaal(): Taal {
  return useSyncExternalStore(
    abonneer,
    () => (document.documentElement.classList.contains("en") ? "en" : "nl"),
    () => "nl",
  )
}

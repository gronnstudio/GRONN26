"use client"

import { useSyncExternalStore } from "react"

// True after hydration, false during SSR and the hydration render — the
// canonical mounted-flag without a setState-in-effect (React reads the
// server snapshot while hydrating, then the client snapshot).
const emptySubscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

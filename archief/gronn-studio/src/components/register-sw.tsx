"use client"

import { useEffect } from "react"

// Registers the service worker (public/sw.js): instant repeat opens for
// the installed app and an offline fallback page. Production only — a
// worker caching dev assets makes local work maddening.
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failing (old browser, private mode) just means the
      // site behaves as it always has.
    })
  }, [])
  return null
}

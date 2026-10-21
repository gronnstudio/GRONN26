"use client"

import { useEffect, useState } from "react"
import { useTaal } from "./taal-klant"

// Overgenomen van gronn.studio (eigenaar, 5 okt 2026): de site als app, en
// volledig scherm.
// 1. Service worker (public/sw.js): snelle herhaalde opens, offline-pagina.
//    Installeren kan via het browsermenu; de melding daarvoor is weg (11 okt
//    2026): een nieuwe bezoeker wil de site leren kennen, geen app.
// 2. Volledig scherm: een knop in de hoek (F11 werkt ook); binnen volledig
//    scherm verandert hij in "Verlaten". Niet op iPhone (geen API).

export function App() {
  const [vol, setVol] = useState(false)
  const [kanVol, setKanVol] = useState(false)
  const en = useTaal() === "en"

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {})

    const d = document as Document & { webkitFullscreenEnabled?: boolean }
    const kan = !!(document.fullscreenEnabled || d.webkitFullscreenEnabled) && !/iphone|ipod/i.test(navigator.userAgent)
    const t0 = setTimeout(() => setKanVol(kan), 0) // ná de eerste render (hydration-veilig)
    // Kopieerslot (zie globals.css): geen rechtermuisknop of slepen op beeld, en
    // geen kopiëren buiten formuliervelden. De pagina's van de eigenaar doen niet mee.
    const slot = (e: Event) => {
      const doel = e.target as Element | null
      if (!doel?.closest || document.querySelector("[data-links]") || doel.closest("input, textarea, select, [contenteditable]")) return
      if (e.type === "copy" || doel.closest("img, video, picture, svg")) e.preventDefault()
    }
    for (const t of ["contextmenu", "dragstart", "copy"]) document.addEventListener(t, slot)
    const bijVol = () => setVol(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", bijVol)
    return () => {
      clearTimeout(t0)
      document.removeEventListener("fullscreenchange", bijVol)
      for (const t of ["contextmenu", "dragstart", "copy"]) document.removeEventListener(t, slot)
    }
  }, [])

  const wisselVol = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {})
  }

  if (!kanVol) return null
  return (
    <button
      type="button"
      onClick={wisselVol}
      aria-label={en ? (vol ? "Exit full screen" : "Full screen") : (vol ? "Volledig scherm verlaten" : "Volledig scherm")}
      title={en ? (vol ? "Exit full screen (Esc)" : "Full screen (F11)") : (vol ? "Volledig scherm verlaten (Esc)" : "Volledig scherm (F11)")}
      className="fixed top-5 right-[var(--rand)] z-[60] hidden size-[var(--knop-klein)] opacity-60 hover:opacity-100 cursor-pointer place-items-center rounded-full bg-[rgba(32,32,32,.55)] text-gebroken-wit backdrop-blur-md transition-colors hover:bg-gebroken-wit hover:text-antraciet focus-visible:outline-2 focus-visible:outline-offset-2 lg:grid"
    >
      {vol ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M6 1v5H1M10 1v5h5M6 15v-5H1M10 15v-5h5" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M1 6V1h5M15 6V1h-5M1 10v5h5M15 10v5h-5" /></svg>
      )}
    </button>
  )
}

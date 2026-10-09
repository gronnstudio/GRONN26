"use client"

import { useEffect, useRef, useState } from "react"
import { T } from "./taal"
import { useTaal } from "./taal-klant"

// Overgenomen van gronn.studio (eigenaar, 5 okt 2026): de site als app, en
// volledig scherm.
// 1. Service worker (public/sw.js): snelle herhaalde opens, offline-pagina.
// 2. Installatiemelding: op de telefoon én op desktop (Chrome/Edge op Windows
//    en Mac). Pas na ruim een scherm scrollen, niet in de app zelf, na "Niet
//    nu" veertien dagen niet. Android/desktop-Chrome: één tik installeert
//    (beforeinstallprompt). iOS: de weg via Deel. Anders: via het browsermenu.
// 3. Volledig scherm: een knop in de hoek (F11 werkt ook); binnen volledig
//    scherm verandert hij in "Verlaten". Niet op iPhone (geen API).

const WEG = "gronn-app-weg"
const DAGEN = 14

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> }
type Soort = "installeer" | "ios" | "menu"

const alsApp = () => matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true
const weggeklikt = () => {
  try {
    const t = Number(localStorage.getItem(WEG))
    return t > 0 && Date.now() - t < DAGEN * 864e5
  } catch {
    return false
  }
}

export function App() {
  const [soort, setSoort] = useState<Soort | null>(null)
  const [vol, setVol] = useState(false)
  const [kanVol, setKanVol] = useState(false)
  const uitgesteld = useRef<InstallEvent | null>(null)
  const taal = useTaal()
  const en = taal === "en"

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {})

    const d = document as Document & { webkitFullscreenEnabled?: boolean }
    const kan = !!(document.fullscreenEnabled || d.webkitFullscreenEnabled) && !/iphone|ipod/i.test(navigator.userAgent)
    const t0 = setTimeout(() => setKanVol(kan), 0) // ná de eerste render (hydration-veilig)
    const bijVol = () => setVol(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", bijVol)

    if (alsApp() || weggeklikt()) return () => { clearTimeout(t0); document.removeEventListener("fullscreenchange", bijVol) }
    const ios = /iphone|ipod/i.test(navigator.userAgent) || (/ipad|macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
    const bijPrompt = (e: Event) => {
      e.preventDefault()
      uitgesteld.current = e as InstallEvent
    }
    const bijInstallatie = () => setSoort(null)
    let timer: ReturnType<typeof setTimeout> | undefined
    const bijScroll = () => {
      if (scrollY < innerHeight * 1.2) return
      removeEventListener("scroll", bijScroll)
      timer = setTimeout(() => {
        if (weggeklikt()) return
        // Zonder installatie-API alleen op de telefoon een hint; op desktop
        // zou "open het browsermenu" te vaag zijn.
        if (uitgesteld.current) setSoort("installeer")
        else if (ios) setSoort("ios")
        else if (matchMedia("(pointer: coarse) and (max-width: 767px)").matches) setSoort("menu")
      }, 600)
    }
    addEventListener("beforeinstallprompt", bijPrompt)
    addEventListener("appinstalled", bijInstallatie)
    addEventListener("scroll", bijScroll, { passive: true })
    return () => {
      clearTimeout(t0)
      document.removeEventListener("fullscreenchange", bijVol)
      removeEventListener("beforeinstallprompt", bijPrompt)
      removeEventListener("appinstalled", bijInstallatie)
      removeEventListener("scroll", bijScroll)
      clearTimeout(timer)
    }
  }, [])

  const weg = () => {
    try {
      localStorage.setItem(WEG, String(Date.now()))
    } catch {}
    setSoort(null)
  }
  const installeer = async () => {
    const e = uitgesteld.current
    if (!e) return
    await e.prompt()
    const { outcome } = await e.userChoice
    uitgesteld.current = null
    if (outcome === "accepted") setSoort(null)
    else weg()
  }
  const wisselVol = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {})
  }

  return (
    <>
      {kanVol && (
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
      )}
      {soort && (
        <div role="dialog" aria-labelledby="app-titel" className="fixed inset-x-4 bottom-[90px] z-[58] mx-auto max-w-[420px] rounded-2xl border border-lijn bg-grond p-4 text-inkt shadow-[0_18px_40px_-20px_rgba(0,0,0,.45)] lg:inset-x-auto lg:right-10 lg:bottom-[110px]">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" width={44} height={44} className="size-11 shrink-0 rounded-xl border border-lijn" />
            <div className="min-w-0 flex-1">
              <p id="app-titel" className="syne m-0 text-[17px] leading-tight"><T t={{ nl: "GRØNN als app", en: "GRØNN as an app" }} /></p>
              <p className="mt-1 mb-0 text-sm leading-relaxed text-gedempt">
                {soort === "installeer" && <T t={{ nl: "Installeer de site als app: met één klik open, zonder browserbalk.", en: "Install the site as an app: open in one click, without the browser bar." }} />}
                {soort === "ios" && <T t={{ nl: "Tik onderin op Deel en kies ‘Zet op beginscherm’.", en: "Tap Share at the bottom and choose ‘Add to Home Screen’." }} />}
                {soort === "menu" && <T t={{ nl: "Open het menu van je browser (⋮) en kies ‘App installeren’.", en: "Open your browser menu (⋮) and choose ‘Install app’." }} />}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={weg} className="knop border border-lijn">
              <T t={{ nl: "Niet nu", en: "Not now" }} />
            </button>
            {soort === "installeer" && (
              <button type="button" onClick={installeer} className="knop bg-oranje text-antraciet">
                <T t={{ nl: "Installeer", en: "Install" }} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

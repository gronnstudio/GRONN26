"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"

import { useT } from "@/components/language-provider"
import { type DevOpdracht, useDevOpdracht } from "@/lib/dev-laag"
import type { L } from "@/lib/i18n"

/**
 * "Zet GRØNN op je beginscherm" — alleen op de telefoon, in de browser.
 *
 * Eigenaar, 24 sep 2026: "als de website op mobiel wordt geopend in
 * browser moet er nog een melding komen dat deze ook als app te
 * installeren is." De site ís installeerbaar (manifest.ts + sw.js); de
 * oude melding hing aan de V3-schil en verdween met V5.
 *
 * Wanneer: pas als iemand leest — na ruim een scherm scrollen, nooit bij
 * het openen (de opening is van de kop en de persoon). Niet in de app
 * zelf, niet op desktop, en na "Niet nu" veertien dagen niet.
 *
 * Hoe: Android/Chrome geeft `beforeinstallprompt`, dan installeert één
 * tik. Safari op iOS heeft geen installatie-API: daar staat de weg via
 * de deelknop. Elders de weg via het browsermenu.
 *
 * Boven de dock (die is 58 hoog, 16 van de onderrand), onder zijn scrim:
 * z-[58] < scrim 60 < dock 61. Alle maten in px (CLAUDE.md, telefoon-
 * navigatie punt 1).
 */

export const APP_MELDING_WEG = "gronn-install-dismissed"
const DAGEN = 14
const DREMPEL = 1.2 // schermhoogtes scrollen voordat hij komt

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Soort = "installeer" | "ios" | "menu"

const TITEL: L = { nl: "GRØNN op je beginscherm", en: "GRØNN on your home screen" }

function weggeklikt() {
  try {
    const t = Number(localStorage.getItem(APP_MELDING_WEG))
    return t > 0 && Date.now() - t < DAGEN * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function alsApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function DeelIcoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="inline-block align-[-2px]">
      <path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11H5v10h14V11h-1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AppMelding() {
  const t = useT()
  const titelId = useId()
  const [soort, setSoort] = useState<Soort | null>(null)
  const [binnen, setBinnen] = useState(false)
  const uitgesteld = useRef<InstallEvent | null>(null)

  // DEV-laag (alleen geverifieerde eigenaar): de melding nu tonen.
  useDevOpdracht(
    useCallback((o: DevOpdracht) => {
      if (o.soort === "app-melding") setSoort(uitgesteld.current ? "installeer" : "menu")
    }, []),
  )

  useEffect(() => {
    if (alsApp() || weggeklikt()) return
    if (!window.matchMedia("(pointer: coarse) and (max-width: 767px)").matches) return

    const ua = navigator.userAgent
    const ios = /iphone|ipod/i.test(ua) || (/ipad|macintosh/i.test(ua) && navigator.maxTouchPoints > 1)

    const bijPrompt = (e: Event) => {
      // Chromes eigen balkje niet: deze melding zegt het, op zijn moment.
      e.preventDefault()
      uitgesteld.current = e as InstallEvent
    }
    const bijInstallatie = () => setSoort(null)

    let timer: ReturnType<typeof setTimeout> | undefined
    const bijScroll = () => {
      if (window.scrollY < window.innerHeight * DREMPEL) return
      window.removeEventListener("scroll", bijScroll)
      timer = setTimeout(() => {
        if (weggeklikt()) return
        setSoort(uitgesteld.current ? "installeer" : ios ? "ios" : "menu")
      }, 600)
    }

    window.addEventListener("beforeinstallprompt", bijPrompt)
    window.addEventListener("appinstalled", bijInstallatie)
    window.addEventListener("scroll", bijScroll, { passive: true })
    return () => {
      window.removeEventListener("beforeinstallprompt", bijPrompt)
      window.removeEventListener("appinstalled", bijInstallatie)
      window.removeEventListener("scroll", bijScroll)
      clearTimeout(timer)
    }
  }, [])

  // Eén frame later "binnen", zodat de overgang loopt.
  useEffect(() => {
    if (!soort) return
    const r = requestAnimationFrame(() => setBinnen(true))
    return () => cancelAnimationFrame(r)
  }, [soort])

  const weg = () => {
    try {
      localStorage.setItem(APP_MELDING_WEG, String(Date.now()))
    } catch {
      /* privé-modus: dan alleen voor nu */
    }
    setBinnen(false)
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

  if (!soort) return null

  return (
    <div data-element="AppMelding"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titelId}
      data-app-melding={soort}
      className={`fixed inset-x-[16px] z-[58] mx-auto max-w-[420px] rounded-[16px] border border-line/15 bg-surface p-[16px] text-foreground shadow-[0_18px_40px_-20px_rgb(0_0_0/0.45)] transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none md:hidden ${binnen ? "translate-y-0 opacity-100" : "translate-y-[16px] opacity-0"}`}
      style={{ bottom: "calc(90px + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-start gap-[12px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- 44px-icoon uit /icons, geen optimalisatie nodig */}
        <img src="/icons/icon-192.png" alt="" width={44} height={44} className="size-[44px] shrink-0 rounded-[12px] border border-line/15" />
        <div className="min-w-0 flex-1">
          <p id={titelId} className="font-heading text-[17px] leading-[1.25] font-semibold">
            {t(TITEL)}
          </p>
          <p className="mt-[4px] text-[14px] leading-[1.5] text-foreground/80">
            {soort === "installeer" &&
              t({
                nl: "Installeer de site als app: met één tik open vanaf je beginscherm, zonder browserbalk.",
                en: "Install the site as an app: one tap from your home screen, without the browser bar.",
              })}
            {soort === "ios" && (
              <>
                {t({ nl: "Tik onderin op ", en: "Tap " })}
                <DeelIcoon />
                {t({ nl: " Deel en kies ‘Zet op beginscherm’.", en: " Share and choose ‘Add to Home Screen’." })}
              </>
            )}
            {soort === "menu" &&
              t({
                nl: "Open het menu van je browser (⋮) en kies ‘App installeren’ of ‘Toevoegen aan startscherm’.",
                en: "Open your browser menu (⋮) and choose ‘Install app’ or ‘Add to Home screen’.",
              })}
          </p>
        </div>
      </div>
      <div className="mt-[12px] flex flex-wrap justify-end gap-[8px]">
        <button
          type="button"
          onClick={weg}
          className="inline-flex min-h-[44px] items-center rounded-full border border-current/30 px-[18px] text-[14px] font-semibold transition-colors hover:border-current"
        >
          {t({ nl: "Niet nu", en: "Not now" })}
        </button>
        {soort === "installeer" && (
          <button
            type="button"
            onClick={installeer}
            className="inline-flex min-h-[44px] items-center rounded-full bg-gronn-ember px-[18px] text-[14px] font-semibold text-gronn-black transition-colors hover:bg-[#e57a3a]"
          >
            {t({ nl: "Installeer", en: "Install" })}
          </button>
        )}
      </div>
    </div>
  )
}

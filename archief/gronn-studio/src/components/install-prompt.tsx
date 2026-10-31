"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

const DISMISS_KEY = "gronn-install-dismissed"
const DISMISS_DAYS = 14

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Mobile-only install hint, mirrored from Equilibrium: Android gets a real
// one-tap install via beforeinstallprompt; iOS Safari has no install API,
// so it gets the share → add-to-home-screen instruction. Never shows when
// already running as an installed app; dismissal is remembered for 14 days.
export function InstallPrompt() {
  const t = useT()
  const reduced = useReducedMotion()
  const [mode, setMode] = useState<"ios" | "android" | "menu" | null>(null)
  const deferred = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari's non-standard flag
      (navigator as unknown as { standalone?: boolean }).standalone
    if (standalone) return

    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (
        dismissed &&
        Date.now() - Number(dismissed) < DISMISS_DAYS * 24 * 60 * 60 * 1000
      )
        return
    } catch {
      /* private mode — just show it */
    }

    // phones and tablets only
    if (!window.matchMedia("(pointer: coarse)").matches) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      deferred.current = e as BeforeInstallPromptEvent
      setMode("android")
    }
    window.addEventListener("beforeinstallprompt", onPrompt)

    // iPhone/iPod report themselves; iPadOS masquerades as a Mac with touch
    const ua = navigator.userAgent
    const isIOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)

    // guaranteed fallback: if no install event fires within 7s, show the
    // platform's manual instruction instead of staying silent
    const timer = setTimeout(() => {
      setMode((current) => current ?? (isIOS ? "ios" : "menu"))
    }, 7000)

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* fine */
    }
    setMode(null)
  }

  const install = async () => {
    const event = deferred.current
    if (!event) return
    await event.prompt()
    await event.userChoice
    setMode(null)
  }

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: EASE_REVEAL }}
          role="dialog"
          aria-label={t({
            en: "The GRØNN app",
            nl: "De GRØNN-app",
          })}
          // z-[58], BELOW the dock's scrim at z-[60]. At z-[62] this sat on
          // top of everything — including an open aria-modal dialog, which
          // it covered mid-read. It is page-level chrome, not
          // above-the-modal chrome, so an open sheet should hide it.
          // Ladder: prompt 58 < blur film 59 < scrim 60 < dock 61.
          className="glass-strong fixed inset-x-4 z-[58] mx-auto max-w-sm rounded-2xl p-4 md:hidden"
          style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))" }}
        >
          <div className="flex items-start gap-3">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={40}
              height={40}
              className="mt-0.5 rounded-xl border border-line/15"
            />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-semibold">
                {t({
                  en: "GRØNN, as an app",
                  nl: "GRØNN, als app",
                })}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {mode === "ios"
                  ? t({
                      en: "Tap the share button, then “Add to Home Screen” — full screen, a labeled tab bar, and it works offline.",
                      nl: "Tik op de deelknop en dan op “Zet op beginscherm” — volledig scherm, een tabbalk met labels, en het werkt offline.",
                    })
                  : mode === "menu"
                    ? t({
                        en: "Open your browser menu and choose “Add to Home Screen” — full screen, a labeled tab bar, and it works offline.",
                        nl: "Open het browsermenu en kies “Toevoegen aan startscherm” — volledig scherm, een tabbalk met labels, en het werkt offline.",
                      })
                    : t({
                        en: "One tap installs the app: full screen, a labeled tab bar, instant screens — and it works offline.",
                        nl: "Eén tik en je hebt de app: volledig scherm, een tabbalk met labels, directe schermen — en hij werkt offline.",
                      })}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {mode === "android" && (
                  <button
                    onClick={install}
                    className="tap-target rounded-full bg-gronn-green px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-gronn-white transition-colors hover:bg-gronn-green/85"
                  >
                    {t({ en: "Install", nl: "Installeer" })}
                  </button>
                )}
                <button
                  onClick={dismiss}
                  className="tap-target rounded-full border border-line/20 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-gronn-ember hover:text-gronn-ember"
                >
                  {t({ en: "Not now", nl: "Niet nu" })}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

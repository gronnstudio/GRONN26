"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// The honest cookie banner: this site sets zero tracking cookies, so there
// is nothing to consent to — which frees the banner up to be a bakery
// joke. Scrolling dismisses it (fine here, since no consent is required),
// as does the button. Shows once, remembered in localStorage.
//
// The banner is server-rendered and enters via a CSS animation
// (`cookie-enter` in globals.css) rather than a post-hydration timer: it
// is one of the page's largest text blocks, so when it appeared seconds
// after hydration it became the measured LCP on slow phones. A root
// inline script stamps `cookies-noted` on <html> pre-paint so returning
// visitors never see a flash; React then unmounts it for real.
const STORAGE_KEY = "gronn-cookies-noted"

export function CookieNotice() {
  const t = useT()
  const reduced = useReducedMotion()
  const [show, setShow] = useState(true)

  // Returning visitor: the CSS class already hides it pre-paint, so
  // dropping the node is cleanup, not urgent — deferred a tick to keep
  // the effect from cascading a synchronous re-render.
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setShow(false), 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!show) return
    const start = window.scrollY
    const dismiss = () => {
      localStorage.setItem(STORAGE_KEY, "1")
      setShow(false)
    }
    const onScroll = () => {
      if (Math.abs(window.scrollY - start) > 160) dismiss()
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [show])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1")
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          exit={
            reduced ? { opacity: 0 } : { opacity: 0, y: 24 }
          }
          transition={{ duration: reduced ? 0 : 0.5, ease: EASE_REVEAL }}
          aria-label={t({ en: "Cookie notice", nl: "Cookiemelding" })}
          className="cookie-enter glass-strong fixed bottom-24 left-4 right-4 z-[60] max-w-sm rounded-2xl p-5 sm:right-auto md:bottom-4"
        >
          {/* The live region is the heading only — a live region must not
              contain the interactive controls below it. */}
          <p role="status" className="font-heading text-base font-semibold">
            🍪 {t({ en: "About our cookies", nl: "Over onze koekjes" })}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {t({
              en: "This site uses zero tracking cookies. The only cookies here are vegan, home-baked and entirely imaginary — your data stays in your own garden. Keep scrolling and we'll take that as a warm “fine by me”.",
              nl: "Deze site gebruikt nul tracking-cookies. De enige koekjes hier zijn veganistisch, huisgebakken en volledig denkbeeldig — jouw gegevens blijven in je eigen tuin. Scrol gerust verder, dan zien we dat als een warm “prima”.",
            })}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={accept}
              className="tap-target rounded-full bg-gronn-green px-4 py-2 text-xs font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong hover:text-gronn-white"
            >
              {t({ en: "Sounds delicious", nl: "Klinkt heerlijk" })}
            </button>
            <Link
              href="/privacy"
              onClick={accept}
              className="tap-target underline-draw font-mono text-xs uppercase tracking-wider text-muted hover:text-foreground"
            >
              {t({ en: "The boring version", nl: "De saaie versie" })}
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

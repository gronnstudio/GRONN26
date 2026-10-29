"use client"

import { useEffect, useLayoutEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { motion, useAnimationControls } from "framer-motion"

import { DURATION_CURTAIN, EASE_CURTAIN, EASE_REVEAL } from "@/lib/motion"
import { isProjectTransitionActive } from "@/lib/view-transition"
import { isStandalone } from "@/lib/use-standalone"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Route transition: a green curtain lifts off the incoming page while the
// content rises into place.
//
// ⚠ Next 16 broke the original remount-driven version of this file. A
// template is now keyed by its OWN child segment only — this root
// template keys on `[locale]`, and navigations deeper than that
// (/projects → /studio, i.e. every in-locale navigation on the site) no
// longer remount it (see node_modules/next/dist/docs/01-app/
// 03-api-reference/03-file-conventions/template.md, "Templates during
// navigation and remounting"). The old code played the curtain from a
// fresh mount, so it silently stopped playing everywhere except the
// EN ↔ NL switch. The curtain is therefore driven imperatively off
// `usePathname()` instead: same choreography, but children are never
// remounted, so page/chrome state survives navigation.
//
// It plays ONLY on client-side navigations, never on the initial
// document load. On first load the server-rendered curtain used to sit
// over the whole page until React finished — on a slow phone that was
// seconds of solid green before anything painted, and it buried the
// opening veil, the hero text and the measured LCP with it. The boot
// experience belongs to the preloader veil; the curtain belongs to route
// changes, where the page is already interactive. Both elements render
// inert on the server (curtain at scaleY 0, content at rest), so
// hydration and LCP see the resting page.
//
// The curtain also stands down while a project-card shared-element
// transition drives the navigation (`src/lib/view-transition.ts`): the
// View Transition IS the route animation there, and a full-viewport
// z-[70] panel would cover the morph. The flag is peeked inside the
// effect and cleared by the transition's own `finished` handler.
//
// Module-level so it survives the template's own remounts (locale
// switch): the last pathname this component animated for. `null` means
// "nothing yet" — the very first render of the visit must not play.
let lastPath: string | null = null

// useLayoutEffect fires after the new route's DOM commits but before
// paint — the only slot where the curtain can be snapped to scaleY 1
// without the incoming page flashing first. Swapped for useEffect on the
// server purely to silence React's SSR warning; neither runs there.
const useClientLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

export default function Template({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const pathname = usePathname()
  const curtain = useAnimationControls()
  const content = useAnimationControls()

  useClientLayoutEffect(() => {
    // Same path twice = initial load, StrictMode's double invoke, or a
    // non-navigation re-fire (e.g. the reduced-motion query flipping).
    // Only a real route change plays.
    if (lastPath === pathname) return
    const isNavigation = lastPath !== null
    lastPath = pathname
    if (!isNavigation || reduced) return
    // The Command Center (/os) is a tool, not the website: its screens
    // change in place, with no green curtain between them.
    if (pathname === "/os" || pathname.startsWith("/os/")) return
    if (isProjectTransitionActive()) return
    // App mode (installed, home-screen launch): screens crossfade like
    // tabs in a native app — the theatrical curtain belongs to the
    // browser website, side by side with this.
    if (isStandalone()) {
      content.set({ opacity: 0 })
      void content.start({
        opacity: 1,
        transition: { duration: 0.25, ease: EASE_REVEAL },
      })
      return
    }
    curtain.set({ scaleY: 1 })
    void curtain.start({
      scaleY: 0,
      transition: { duration: DURATION_CURTAIN, ease: EASE_CURTAIN },
    })
    content.set({ opacity: 0, y: 24 })
    void content.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.15, ease: EASE_REVEAL },
    })
  }, [pathname, reduced, curtain, content])

  return (
    <>
      <motion.div
        aria-hidden
        initial={false}
        animate={curtain}
        style={{ transformOrigin: "top", scaleY: 0 }}
        className="pointer-events-none fixed inset-0 z-[70] bg-gronn-green"
      />
      {/* The wrapper mirrors the body's column flex so <main>'s flex-1
          keeps stretching to the viewport through it. */}
      <motion.div
        initial={false}
        animate={content}
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </>
  )
}

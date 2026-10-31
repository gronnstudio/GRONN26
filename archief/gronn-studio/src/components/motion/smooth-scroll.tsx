"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"

import { useReducedMotion } from "@/lib/use-reduced-motion"

// Buttery inertia scroll for the whole site (it is all marketing surface).
// Lenis drives native scrollTop, so framer-motion's useScroll stays accurate
// without any extra wiring. No-ops entirely under reduced-motion.
//
// Lenis clamps the wheel to `scrollHeight - innerHeight`, measured when it
// mounts and re-measured only on a window resize or a ResizeObserver on the
// root element. That makes page height a correctness concern, not a detail:
//   • <html> must stay `height: auto` (see layout.tsx) or the observer is
//     watching a box pinned to the viewport and never fires;
//   • this component mounts once for the whole site, so an App Router
//     navigation swaps the page under a limit measured on the previous one;
//   • the observer is debounced 250ms and only runs after paint, so a fast
//     wheel right after a change can still meet a stale limit.
// The two explicit resizes below cover the last two. Without them the
// symptom is a long page — a case study, /stack — that simply stops
// scrolling partway down.
export function SmoothScroll() {
  const reduced = useReducedMotion()
  const pathname = usePathname()

  useEffect(() => {
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    })
    // Published for imperative scrolls (mobile dock back-to-top) — a
    // window.scrollTo would fight Lenis while it is driving scrollTop.
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    // Web fonts swap after mount and reflow every line of body copy — the
    // largest single height change on a text-heavy page.
    let live = true
    document.fonts?.ready.then(() => {
      if (live) lenis.resize()
    })

    let frame: number
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      live = false
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [reduced])

  // Re-measure once the navigated-to page has laid out. Reading the
  // instance back off the window keeps Lenis out of React state, so a
  // route change never tears down the scroll itself.
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
    if (!lenis) return
    const frame = requestAnimationFrame(() => lenis.resize())
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return null
}

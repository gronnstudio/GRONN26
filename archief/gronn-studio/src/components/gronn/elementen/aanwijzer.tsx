"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

import { useT } from "@/components/language-provider"
import { CURSOR_LABELS } from "@/lib/motion"
import { useHydrated } from "@/lib/use-hydrated"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// De aanwijzer van de oude site, in V5 (eigenaar, 23 sep 2026: "Knoppen
// en cursor"): een oranje zaadje dat de muis direct volgt en een ring die
// op een veer achteraan komt. Boven een element met `data-cursor` wordt
// de ring een pil die zegt wat er gebeurt ("Bekijk", "Lees" — de
// woordenlijst staat in @/lib/motion); boven andere bediening bloeit hij
// alleen op. Aangepast van components/motion/cursor.tsx:
//   - de pil is aarde-oranje met ANTRACIET tekst (4,70:1). De oude had
//     wit op oranje: 2,99:1.
//   - zaadje en ring in `--ember-text`, niet in puur oranje: #DB6923 op
//     gebroken wit haalt de 3:1 voor een grafisch teken niet.
//   - alle maten in px.
// De gewone cursor blijft zichtbaar. Niets op touch (geen fijne wijzer
// die kan zweven) en niets bij minder beweging.

const FIJN = "(hover: hover) and (pointer: fine)"

function abonneer(callback: () => void) {
  const mql = window.matchMedia(FIJN)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

const BEDIENING = 'a, button, [role="button"], input, select, textarea, label, summary, [data-cursor]'

export function Aanwijzer() {
  const t = useT()
  const reduced = useReducedMotion()
  const hydrated = useHydrated()
  const fijn = useSyncExternalStore(abonneer, () => window.matchMedia(FIJN).matches, () => false)
  const aan = hydrated && fijn && !reduced

  const [zichtbaar, setZichtbaar] = useState(false)
  const [boven, setBoven] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 250, damping: 25, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 250, damping: 25, mass: 0.6 })

  useEffect(() => {
    if (!aan) return
    const beweeg = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      x.set(e.clientX)
      y.set(e.clientY)
      setZichtbaar(true)
    }
    const over = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null
      const sleutel = el?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? null
      setLabel(sleutel && CURSOR_LABELS[sleutel] ? sleutel : null)
      setBoven(!!el?.closest(BEDIENING))
    }
    // De muis verlaat het venster: niets laten hangen aan de rand.
    const weg = (e: PointerEvent) => {
      if (!e.relatedTarget) setZichtbaar(false)
    }
    window.addEventListener("pointermove", beweeg, { passive: true })
    window.addEventListener("pointerover", over, { passive: true })
    window.addEventListener("pointerout", weg, { passive: true })
    return () => {
      window.removeEventListener("pointermove", beweeg)
      window.removeEventListener("pointerover", over)
      window.removeEventListener("pointerout", weg)
    }
  }, [aan, x, y])

  if (!aan) return null

  const pil = label !== null
  return (
    <>
      <motion.div
        aria-hidden
        data-aanwijzer="zaadje"
        style={{ x, y, opacity: zichtbaar ? 1 : 0 }}
        className="pointer-events-none fixed left-0 top-0 z-[90] size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ember-text)]"
      />
      <motion.div
        aria-hidden
        data-aanwijzer="ring"
        style={{ x: ringX, y: ringY }}
        initial={false}
        animate={{
          width: pil ? 76 : boven ? 44 : 26,
          height: pil ? 28 : boven ? 44 : 26,
          opacity: zichtbaar ? (pil ? 1 : boven ? 0.9 : 0.55) : 0,
        }}
        transition={{ duration: 0.22 }}
        className={`pointer-events-none fixed left-0 top-0 z-[90] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full ${
          pil ? "bg-gronn-ember" : "border border-[color:var(--ember-text)]"
        }`}
      >
        {pil && (
          <span data-aanwijzer-label="" className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-gronn-black">
            {t(CURSOR_LABELS[label])}
          </span>
        )}
      </motion.div>
    </>
  )
}

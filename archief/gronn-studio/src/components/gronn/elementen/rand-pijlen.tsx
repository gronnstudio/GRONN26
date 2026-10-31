"use client"

import { useEffect, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { useT } from "@/components/language-provider"
import { ICON_STROKE } from "@/components/layout/section-icons"
import { usePijlenPref } from "@/lib/use-a11y-prefs"
import { cn } from "@/lib/utils"

/**
 * "Pijlen voor terug en verder" — twee kleine ronde knoppen halverwege
 * de schermrand: links terug, rechts verder.
 *
 * Een KEUZE in het palet (Weergave → Navigeren), standaard uit. Het
 * verving op 25 sep 2026 "terug met vegen": telefoons vegen zelf al
 * terug (eigenaar). Alleen onder `md`; op desktop heeft de browser zijn
 * eigen knoppen in beeld.
 *
 *  - Hetzelfde glas als de dock (`nav-glass`), dus dezelfde gemeten
 *    leesbaarheid boven foto's; chevron in de lijnstijl van de dock.
 *  - Verborgen als er niets is om heen te gaan, voor zover de browser
 *    dat vertelt (Navigation API: `canGoBack`/`canGoForward`). Zonder
 *    die API: terug alleen bij `history.length > 1`, verder altijd.
 *  - Weg zolang een hoekpaneel open is (`data-hoek-paneel`), zodat ze
 *    nooit over een paneel liggen.
 *  - Alle maten in px; bij minder beweging geen overgangen.
 */

type Nav = {
  canGoBack: boolean
  canGoForward: boolean
  addEventListener: (t: string, cb: () => void) => void
  removeEventListener: (t: string, cb: () => void) => void
}

function leesStand() {
  const nav = (window as unknown as { navigation?: Nav }).navigation
  if (nav && typeof nav.canGoBack === "boolean") {
    return { terug: nav.canGoBack, verder: nav.canGoForward }
  }
  return { terug: window.history.length > 1, verder: true }
}

const KNOP = cn(
  "pointer-events-auto flex size-[44px] items-center justify-center rounded-full",
  "border border-line/15 text-foreground",
  "bg-surface/95 supports-[backdrop-filter]:bg-transparent supports-[backdrop-filter]:nav-glass",
  "shadow-[var(--shadow-dock)]",
  "transition-colors duration-[var(--dur-tap)] motion-reduce:transition-none",
  "hover:border-gronn-ember-strong active:border-gronn-ember-strong"
)

export function RandPijlen() {
  const t = useT()
  const [aan] = usePijlenPref()
  const [stand, zetStand] = useState({ terug: false, verder: false })

  useEffect(() => {
    if (!aan) return
    const lees = () => zetStand(leesStand())
    lees()
    const nav = (window as unknown as { navigation?: Nav }).navigation
    nav?.addEventListener("currententrychange", lees)
    window.addEventListener("popstate", lees)
    return () => {
      nav?.removeEventListener("currententrychange", lees)
      window.removeEventListener("popstate", lees)
    }
  }, [aan])

  if (!aan) return null

  return (
    <div data-element="RandPijlen"
      data-rand-pijlen
      className="pointer-events-none fixed inset-x-[8px] top-1/2 z-[60] flex -translate-y-1/2 justify-between md:hidden [body:has([data-hoek-paneel])_&]:hidden"
    >
      {stand.terug ? (
        <button
          type="button"
          aria-label={t({ nl: "Terug", en: "Back" })}
          onClick={() => window.history.back()}
          className={KNOP}
        >
          <ChevronLeftIcon size={20} strokeWidth={ICON_STROKE} aria-hidden />
        </button>
      ) : (
        <span />
      )}
      {stand.verder && (
        <button
          type="button"
          aria-label={t({ nl: "Verder", en: "Forward" })}
          onClick={() => window.history.forward()}
          className={KNOP}
        >
          <ChevronRightIcon size={20} strokeWidth={ICON_STROKE} aria-hidden />
        </button>
      )}
    </div>
  )
}

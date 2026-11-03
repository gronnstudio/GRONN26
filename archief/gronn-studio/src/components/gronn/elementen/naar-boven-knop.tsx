"use client"

import { useEffect, useState } from "react"

import { useT } from "@/components/language-provider"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

import { ZIJ, ZIJ_ONDER, ZIJ_RECHTS } from "./zij-kolom"

/**
 * NaarBovenKnop: terug naar boven, rechtsonder, alleen vanaf `md`.
 *
 * Eigenaar, 27 sep 2026: "ik zie dat op desktop geen back to top button
 * is te vinden in de rechter onderhoek". Die knop bestond
 * (`components/back-to-top.tsx`, jul 2026), maar hing aan `SiteShell`,
 * en V5 mount die niet meer. Dit is hem opnieuw, in het gezicht van het
 * Omhoog-vak in de dock (`NaarBoven` in `dock-nav.tsx`): hetzelfde glas,
 * dezelfde pijl op `--ember-text` met de emberhalo erachter. Zonder
 * label, alleen de pijl in het midden (eigenaar, 27 sep 2026: "Maak de
 * pijl in midden en laat text weg"); de naam staat daarom in
 * `aria-label`. Op de telefoon doet de dock dit al; daar is deze knop er
 * niet.
 *
 * Pas zichtbaar na ruim een scherm scrollen. Verborgen is hij `inert`,
 * zodat hij niet in de tabvolgorde zit. Alle maten in px (zie CLAUDE.md,
 * de telefoonnavigatie, punt 1).
 *
 * Maat en plaats komen uit `zij-kolom.ts` (eigenaar, 28 sep 2026: "knop
 * voor naar boven is uit de maat met de docks"): 44 breed, ring
 * inbegrepen, op 16 van de rand en 16 van de onderkant, precies onder de
 * HemelBubbel en even breed.
 *
 * De voortgangsring (eigenaar, 28 sep 2026, uit zijn CodePen van 2022:
 * "Voortgangsring om Omhoog"): een cirkel van 2px over de rand die
 * volloopt met de scrollpositie van het document. Pure CSS (`g-ring` in
 * globals.css, `scroll(root block)`), onder dezelfde poort als de
 * leesdraad; bij minder beweging of zonder scroll()-ondersteuning is hij
 * er niet en blijft alleen de pijl.
 */
export function NaarBovenKnop() {
  const t = useT()
  const reduced = useReducedMotion()
  const [zichtbaar, setZichtbaar] = useState(false)

  useEffect(() => {
    const kijk = () => setZichtbaar(window.scrollY > window.innerHeight * 1.1)
    kijk()
    window.addEventListener("scroll", kijk, { passive: true })
    return () => window.removeEventListener("scroll", kijk)
  }, [])

  const naarBoven = () => {
    // Geen Lenis op de V5-site: native scrollen.
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
    // De focus mee naar boven, zoals in de dock; `preventScroll` omdat
    // de focus anders de zachte scroll meteen overschrijft.
    document.getElementById("main")?.focus({ preventScroll: true })
  }

  return (
    <button
      type="button"
      data-element="NaarBovenKnop"
      data-naar-boven="los"
      onClick={naarBoven}
      aria-label={t({ en: "Back to top", nl: "Omhoog" })}
      inert={!zichtbaar}
      aria-hidden={!zichtbaar}
      className={cn(
        "fixed z-40 hidden items-center justify-center md:flex",
        "rounded-full border border-line/15 shadow-[var(--shadow-dock)]",
        "bg-surface/95 supports-[backdrop-filter]:bg-transparent supports-[backdrop-filter]:nav-glass",
        "text-[color:var(--ember-text)]",
        "transition-[opacity,translate] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        zichtbaar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[12px] opacity-0"
      )}
      style={{ bottom: ZIJ_ONDER, right: ZIJ_RECHTS, width: ZIJ.breedte, height: ZIJ.breedte }}
    >
      {/* Pijl 20, halo 30 in 44: dezelfde verhouding als het Omhoog-vak in de dock (halo 40 in 58). */}
      <span className="relative flex size-[20px] shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="ember-halo pointer-events-none absolute -inset-[5px] rounded-full border border-gronn-ember bg-gronn-ember/10"
        />
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          data-pijl=""
          className="relative size-[20px] shrink-0"
        >
          <path d="M12 19.5V5M12 5l-6 6M12 5l6 6" />
        </svg>
      </span>
      {/* Over de rand van 1px heen: 44 buiten, lijn van 2 op straal 21, dus
          binnen de knop en niet breder dan de bubbel erboven. Begint bovenaan. */}
      <svg aria-hidden viewBox="0 0 44 44" data-ring="" className="g-ring pointer-events-none absolute -inset-[1px] size-[44px] -rotate-90">
        <circle cx="22" cy="22" r="21" pathLength={100} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="100" />
      </svg>
    </button>
  )
}

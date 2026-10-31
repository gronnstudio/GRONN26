"use client"

import { useEffect, useState } from "react"

import { useT } from "@/components/language-provider"
import { cn } from "@/lib/utils"

/**
 * ZoekTip: één keer per browser een kleine tip onderin het midden, "Tip:
 * druk ⌘K om te zoeken" (Ctrl K buiten de Mac). Eigenaar, 28 sep 2026,
 * uit zijn CodePen van 2022: "Tip voor nieuwe bezoekers".
 *
 * Alleen vanaf `md` en alleen met een muis (`hover: hover` en `pointer:
 * fine`): zonder toetsenbord is een sneltoets geen tip. "/" noemt hij
 * niet, want die werkt alleen zolang de sneltoetsen aan staan; ⌘K altijd
 * (zie command-palette.tsx).
 *
 * Na 1,8 s (het openingsdoek is dan opgetild) komt hij, na 5 s gaat hij.
 * `gronn-zoektip-gezien` in localStorage houdt hem daarna weg, ook als
 * de bezoeker eerder wegklikt. Zonder localStorage
 * (privévenster met blokkade) toont hij niets — beter geen tip dan elke
 * pagina opnieuw. Bij minder beweging zonder schuiven.
 */
export const ZOEKTIP_SLEUTEL = "gronn-zoektip-gezien"

export function ZoekTip() {
  const t = useT()
  const [staat, setStaat] = useState<"wacht" | "zichtbaar" | "weg">("wacht")
  const [mac, setMac] = useState(true)

  useEffect(() => {
    try {
      if (localStorage.getItem(ZOEKTIP_SLEUTEL)) return
    } catch {
      return
    }
    if (!window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)").matches) return

    const toon = window.setTimeout(() => {
      setMac(/Mac|iPhone|iPad/.test(navigator.userAgent))
      try {
        localStorage.setItem(ZOEKTIP_SLEUTEL, "1")
      } catch {}
      setStaat("zichtbaar")
    }, 1800)
    const weg = window.setTimeout(() => setStaat("weg"), 1800 + 5000)
    return () => {
      window.clearTimeout(toon)
      window.clearTimeout(weg)
    }
  }, [])

  if (staat === "wacht") return null
  const toets = mac ? "⌘K" : "Ctrl K"

  return (
    <p
      role="status"
      data-element="ZoekTip"
      data-zoektip={staat}
      className={cn(
        "tekst-annotatie pointer-events-none fixed bottom-[24px] left-1/2 z-[45] hidden -translate-x-1/2 items-center gap-[8px] md:flex",
        "rounded-full border border-line/15 bg-surface px-[16px] py-[8px] text-foreground shadow-[var(--shadow-dock)]",
        "transition-[opacity,translate] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
        staat === "zichtbaar" ? "translate-y-0 opacity-100" : "translate-y-[12px] opacity-0"
      )}
    >
      {staat === "zichtbaar" && (
        <>
          {/* Echte spaties: de flex-gap is alleen zichtbaar, een schermlezer leest anders "drukCtrl Kom". */}
          <span>{t({ nl: "Tip: druk", en: "Tip: press" })}</span>{" "}
          <kbd className="rounded-full border border-line/25 px-[8px] py-[2px] font-mono text-[11px] leading-[14px]">{toets}</kbd>{" "}
          <span>{t({ nl: "om te zoeken", en: "to search" })}</span>
        </>
      )}
    </p>
  )
}

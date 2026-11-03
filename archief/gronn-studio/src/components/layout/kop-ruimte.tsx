"use client"

import { usePathname } from "next/navigation"

import { stripLocale } from "@/lib/locale"

/**
 * De ruimte onder de vaste kopbalk (80px): de balk is `fixed`, dus de
 * pagina begint pas onder hem. Op home NIET: daar begint de volle
 * openingsfoto op de bovenkant van het scherm en zweeft het menu erover
 * (de pil vanaf md, bovenbalk en dock op de telefoon). Zelfde vraag als
 * de Header stelt (`stripLocale(pathname) === "/"`), zodat de twee niet
 * uit elkaar kunnen lopen. `usePathname` werkt ook op de server, dus de
 * eerste HTML is al goed — geen sprong na de hydratie.
 */
export function KopRuimte() {
  const route = stripLocale(usePathname())
  if (route === "/") return null
  return <div aria-hidden data-kop-ruimte="" className="h-20 shrink-0" />
}

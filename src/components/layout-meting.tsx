"use client"

import { track } from "@vercel/analytics"
import { useEffect } from "react"

// Per layout tellen we in Vercel Analytics de klikken naar Kennismaken,
// WhatsApp en bellen (sinds 27 okt 2026 is Klassiek weer de standaard en kiest
// de bezoeker Blueprint zelf). Geen cookies; dezelfde gegevens als de gewone
// paginatelling.
export function LayoutMeting() {
  useEffect(() => {
    const layout = () => (document.documentElement.classList.contains("plan") ? "blueprint" : "klassiek")
    const klik = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a")
      const href = a?.getAttribute("href") || ""
      const soort = href.startsWith("/kennismaken") ? "kennismaken" : href.includes("wa.me") ? "whatsapp" : href.startsWith("tel:") ? "bellen" : null
      if (soort) track("contact", { soort, layout: layout() })
    }
    addEventListener("click", klik, { capture: true })
    return () => removeEventListener("click", klik, { capture: true })
  }, [])
  return null
}

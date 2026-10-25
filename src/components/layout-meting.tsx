"use client"

import { track } from "@vercel/analytics"
import { useEffect } from "react"

// 50/50 tussen Klassiek en Blueprint (eigenaar, 25 okt 2026): het
// voorverf-script in layout.tsx kiest bij het eerste bezoek één layout en
// bewaart die. Hier tellen we in Vercel Analytics hoeveel bezoekers welke
// layout kregen, en per layout de klikken naar Kennismaken, WhatsApp en
// bellen. Geen cookies; dezelfde gegevens als de gewone paginatelling.
const KEY = "gronn-weergave"

export function LayoutMeting() {
  useEffect(() => {
    const layout = () => (document.documentElement.classList.contains("plan") ? "blueprint" : "klassiek")
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}")
      if (s.toegewezen === 1) {
        track("layout-toegewezen", { layout: layout() })
        localStorage.setItem(KEY, JSON.stringify({ ...s, toegewezen: 2 }))
      }
    } catch {}
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

import type { ReactNode } from "react"

import { accentTekst, type Toon } from "./toon"

/**
 * Het sectielabel: Geist Mono in kapitalen, in de oranje teksttint
 * (brand guide: "01 / LEVEND", "TUINONTWERP / AANLEG / ONDERHOUD").
 * Annotaties verklaren iets; ze zijn geen decoratieve ruis.
 */
export function Label({
  children,
  toon = "grond",
  className = "",
}: {
  children: ReactNode
  toon?: Toon
  className?: string
}) {
  return (
    <p className={`tekst-annotatie flex flex-wrap items-center gap-x-2 gap-y-1 ${accentTekst(toon)} ${className}`}>
      {children}
    </p>
  )
}

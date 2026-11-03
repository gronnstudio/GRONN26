"use client"

import { useEffect, useState } from "react"

/**
 * De klok van de bezoeker, pas na het laden (de server kent hem niet, dus
 * de eerste render is altijd `null` en er is geen hydratieverschil).
 * Tikt eens per minuut. Tests zetten de tijd met Playwrights `page.clock`.
 */
export function useKlok(): Date | null {
  const [nu, setNu] = useState<Date | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- eenmalig na hydratie: de klok bestaat alleen in de browser
    setNu(new Date())
    const id = window.setInterval(() => setNu(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return nu
}

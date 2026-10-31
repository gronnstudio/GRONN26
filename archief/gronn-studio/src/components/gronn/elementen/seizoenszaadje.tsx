"use client"


import { useLanguage } from "@/components/language-provider"
import { SEIZOEN, type Maand } from "@/lib/data/seizoen"
import { useKlok } from "@/lib/use-klok"

/**
 * Seizoenszaadje: de regel uit de tuinkalender voor deze maand. Tot 27
 * sep 2026 een easter egg in de voet; nu informatie, op desktop in de
 * rechterbubbel (`HemelBubbel`), kleiner in de voet. Staat de maand op `null` in `SEIZOEN`,
 * dan rendert er niets. De maand komt pas na het laden (de klok van de
 * bezoeker), dus de eerste render is altijd leeg.
 */
export function seizoensRegel(nu: Date | null, data: typeof SEIZOEN = SEIZOEN) {
  return nu ? data[(nu.getMonth() + 1) as Maand] : null
}

export function Seizoenszaadje({ data = SEIZOEN }: { data?: typeof SEIZOEN }) {
  const nu = useKlok()
  const { locale } = useLanguage()
  const zin = seizoensRegel(nu, data)
  if (!zin) return null
  return (
    <p data-element="Seizoenszaadje" className="tekst-annotatie text-muted">
      {zin[locale]}
    </p>
  )
}

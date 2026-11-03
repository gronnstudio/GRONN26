"use client"

import { daglengte, datumIn, duurTekst, klok, zonTijden } from "@/lib/hemel"
import type { Locale } from "@/lib/i18n"
import { useKlok } from "@/lib/use-klok"

import { Tabel } from "./tabel"

/**
 * Zonsopkomst en -ondergang in Stein op de 1e van elke maand van het jaar
 * van de bezoeker, uitgerekend met `zonTijden` (12:00 Nederlandse tijd
 * als ijkpunt) en getekend met `Tabel`, die op de telefoon per rij
 * stapelt. Het jaar komt van de klok van de bezoeker, dus de server
 * rendert een lege plek van ongeveer dezelfde hoogte.
 */
export function ZonJaarTabel({ locale }: { locale: Locale }) {
  const nu = useKlok()
  const nl = locale === "nl"
  if (!nu) return <div data-element="ZonJaarTabel" className="min-h-[640px]" />
  const jaar = nu.getFullYear()
  const rijen = Array.from({ length: 12 }, (_, i) => {
    // 11:00 UTC is 12:00 of 13:00 in Nederland: ruim binnen dezelfde dag.
    const dag = new Date(Date.UTC(jaar, i, 1, 11))
    const t = zonTijden(dag)
    return [
      datumIn(dag, locale, { day: "numeric", month: "long" }),
      t ? klok(t.op) : "—",
      t ? klok(t.onder) : "—",
      t ? duurTekst(daglengte(t), locale) : "—",
    ]
  })
  return (
    <div data-element="ZonJaarTabel">
      <Tabel
        bijschrift={nl ? `Stein, ${jaar}, in Nederlandse tijd` : `Stein, ${jaar}, Dutch time`}
        kolommen={nl ? ["Datum", "Op", "Onder", "Daglengte"] : ["Date", "Sunrise", "Sunset", "Day length"]}
        rijen={rijen}
        rechts={[1, 2, 3]}
      />
    </div>
  )
}

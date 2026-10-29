"use client"

import type { ReactNode } from "react"

import { daglengte, datumIn, duurTekst, klok, maanFase, volgendeMaan, zonStand, zonTijden } from "@/lib/hemel"
import type { Locale } from "@/lib/i18n"
import { useKlok } from "@/lib/use-klok"

import { MaanIcoon, ZonIcoon } from "./hemel"

const LEEG = "—"

function Kaart({ kop, beeld, children }: { kop: string; beeld: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[24px] rounded-[16px] border border-line/15 bg-surface p-[20px] sm:p-[32px]">
      <h3 className="tekst-h3">{kop}</h3>
      <div className="flex min-h-[96px] flex-col justify-end">{beeld}</div>
      <dl className="grid grid-cols-2 gap-x-[24px] border-t border-line/15">{children}</dl>
    </div>
  )
}

function Rij({ label, waarde, hemel }: { label: string; waarde: ReactNode; hemel: string }) {
  return (
    <div className="flex flex-col gap-[4px] border-b border-line/15 py-[14px]">
      <dt className="tekst-annotatie uppercase text-muted">{label}</dt>
      <dd data-hemel={hemel} className="tekst-body tabular-nums">
        {waarde}
      </dd>
    </div>
  )
}

/**
 * Vandaag in Stein, groot: de zonneboog (`ZonIcoon`, fijn) met opkomst,
 * hoogste stand, ondergang en daglengte, en de maan (`MaanIcoon`) met
 * fase, verlicht deel en de eerstvolgende volle en nieuwe maan
 * (`volgendeMaan`: `maanFase` per uur vooruit). Alles uitgerekend met
 * `src/lib/hemel.ts`, in de browser van de bezoeker; de server kent de
 * klok niet en rendert streepjes op dezelfde plek.
 */
export function HemelVandaag({ locale }: { locale: Locale }) {
  const nu = useKlok()
  const nl = locale === "nl"
  const tijden = nu ? zonTijden(nu) : null
  const m = nu ? maanFase(nu) : null
  const datum = (d: Date) => datumIn(d, locale)
  return (
    <div data-element="HemelVandaag">
      <p data-hemel="vandaag" className="tekst-annotatie mb-[16px] min-h-[18px] uppercase text-muted">
        {nu ? datumIn(nu, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : " "}
      </p>
      <div className="grid gap-[16px] md:grid-cols-2">
        <Kaart
          kop={nl ? "Zon" : "Sun"}
          beeld={
            <div>
              <ZonIcoon t={nu && tijden ? zonStand(nu, tijden) : null} breed={320} fijn className="h-auto w-full max-w-[320px] text-foreground/70" />
              <div aria-hidden className="tekst-annotatie mt-[8px] flex max-w-[320px] justify-between tabular-nums text-muted">
                <span>{tijden ? klok(tijden.op) : LEEG}</span>
                <span>{tijden ? klok(tijden.onder) : LEEG}</span>
              </div>
            </div>
          }
        >
          <Rij hemel="op" label={nl ? "Zonsopkomst" : "Sunrise"} waarde={tijden ? klok(tijden.op) : LEEG} />
          <Rij hemel="onder" label={nl ? "Zonsondergang" : "Sunset"} waarde={tijden ? klok(tijden.onder) : LEEG} />
          <Rij hemel="middag" label={nl ? "Hoogste stand" : "Solar noon"} waarde={tijden ? klok(tijden.middag) : LEEG} />
          <Rij hemel="daglengte" label={nl ? "Daglengte" : "Day length"} waarde={tijden ? duurTekst(daglengte(tijden), locale) : LEEG} />
        </Kaart>
        <Kaart
          kop={nl ? "Maan" : "Moon"}
          beeld={m ? <MaanIcoon m={m} maat={88} fijn className="text-foreground/70" /> : <span aria-hidden className="block size-[88px]" />}
        >
          <Rij hemel="fase" label={nl ? "Fase" : "Phase"} waarde={m ? m.naam[locale] : LEEG} />
          <Rij hemel="verlicht" label={nl ? "Verlicht" : "Illuminated"} waarde={m ? `${Math.round(m.verlicht * 100)}${nl ? " " : ""}%` : LEEG} />
          <Rij hemel="volle-maan" label={nl ? "Volgende volle maan" : "Next full moon"} waarde={nu ? datum(volgendeMaan(nu, "vol")) : LEEG} />
          <Rij hemel="nieuwe-maan" label={nl ? "Volgende nieuwe maan" : "Next new moon"} waarde={nu ? datum(volgendeMaan(nu, "nieuw")) : LEEG} />
        </Kaart>
      </div>
    </div>
  )
}

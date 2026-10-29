"use client"


import { useLanguage } from "@/components/language-provider"
import { klok, maanFase, zonStand, zonTijden, type MaanFase } from "@/lib/hemel"
import type { Locale } from "@/lib/i18n"
import { useKlok } from "@/lib/use-klok"

/**
 * Maan en zon van vandaag, in Stein. Tot 27 sep 2026 waren dit easter
 * eggs in de voet; sindsdien is het gewoon informatie (eigenaar:
 * "verwijder deze easter eggs, we hebben er nog zat"). Op desktop staan
 * ze in de rechterbubbel (`HemelBubbel`), op kleinere schermen nog in de
 * voet, waar de maan bij Donker en de zon bij Licht hoort.
 */

/** De maan in de fase van vandaag, 14px, lijnwerk met gevulde verlichte kant.
 * `maat` schaalt hem op (de tuinkalender); `fijn` houdt de lijn dan 1px. */
export function MaanIcoon({ m, className, maat = 14, fijn = false }: { m: MaanFase; className?: string; maat?: number; fijn?: boolean }) {
  const pct = Math.round(m.verlicht * 100)
  const r = 6
  const rx = r * Math.abs(Math.cos(2 * Math.PI * m.fase))
  const sikkel = m.verlicht < 0.5
  // Verlichte helft: rechts bij wassend, links bij afnemend. De
  // terminator is een halve ellips die naar buiten of binnen buigt.
  const d = m.wassend
    ? `M7 1 A${r} ${r} 0 0 1 7 13 A${rx} ${r} 0 0 ${sikkel ? 0 : 1} 7 1Z`
    : `M7 1 A${r} ${r} 0 0 0 7 13 A${rx} ${r} 0 0 ${sikkel ? 1 : 0} 7 1Z`
  return (
    <svg width={maat} height={maat} viewBox="0 0 14 14" aria-hidden fill="none" data-icoon="" className={className}>
      <circle cx="7" cy="7" r={r} stroke="currentColor" strokeWidth="1" vectorEffect={fijn ? "non-scaling-stroke" : undefined} />
      {pct > 0 && <path d={d} fill="currentColor" />}
    </svg>
  )
}

/**
 * Een fijne boog van zonsopkomst tot -ondergang met een stip waar de zon
 * nu staat (`t` 0…1); `t === null` is nacht: geen stip. `fijn` houdt de
 * lijnen 1px als hij groot staat (de tuinkalender).
 */
export function ZonIcoon({ t, breed = 64, className, fijn = false }: { t: number | null; breed?: number; className?: string; fijn?: boolean }) {
  const ve = fijn ? ("non-scaling-stroke" as const) : undefined
  const x = t === null ? 0 : 32 - 28 * Math.cos(Math.PI * t)
  const y = t === null ? 0 : 18 - 14 * Math.sin(Math.PI * t)
  return (
    <svg width={breed} height={(breed * 22) / 64} viewBox="0 0 64 22" aria-hidden fill="none" data-icoon="" className={className}>
      <path d="M2 18.5H62" stroke="currentColor" strokeWidth="0.75" strokeDasharray={fijn ? "2 4" : "1 2.5"} vectorEffect={ve} />
      <path d="M4 18A28 14 0 0 1 60 18" stroke="currentColor" strokeWidth="1" vectorEffect={ve} />
      {t !== null && <circle data-zon="" cx={x} cy={y} r="2.5" fill="var(--ember-text)" />}
    </svg>
  )
}

export function maanLabel(m: MaanFase, locale: Locale) {
  const pct = Math.round(m.verlicht * 100)
  return locale === "nl" ? `${m.naam.nl}, ${pct} %` : `${m.naam.en}, ${pct}%`
}

export function zonLabel(op: string, onder: string, locale: Locale) {
  return locale === "nl" ? `Zon op ${op}, onder ${onder}` : `Sunrise ${op}, sunset ${onder}`
}

/** Maanfase in de voet: alleen op Blauwe Uur (`dark:`); op Gouden Uur `display: none`. */
export function Maanfase() {
  const nu = useKlok()
  const { locale } = useLanguage()
  if (!nu) return null
  const m = maanFase(nu)
  const label = maanLabel(m, locale)
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      data-element="Maanfase"
      className="hidden items-center gap-[8px] text-muted dark:inline-flex"
    >
      <MaanIcoon m={m} />
      <span aria-hidden className="tekst-annotatie">{Math.round(m.verlicht * 100)} %</span>
    </span>
  )
}

/** Zonneboog in de voet: alleen op Gouden Uur. Uitgerekend met `zonTijden` (NOAA). */
export function Zonneboog() {
  const nu = useKlok()
  const { locale } = useLanguage()
  if (!nu) return null
  const tijden = zonTijden(nu)
  if (!tijden) return null
  const op = klok(tijden.op)
  const onder = klok(tijden.onder)
  const label = zonLabel(op, onder, locale)
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      data-element="Zonneboog"
      className="inline-flex items-center gap-[8px] text-muted dark:hidden"
    >
      <ZonIcoon t={zonStand(nu, tijden)} />
      <span aria-hidden className="tekst-annotatie">
        {op}–{onder}
      </span>
    </span>
  )
}

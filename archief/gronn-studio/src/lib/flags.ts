"use client"

import { useSyncExternalStore } from "react"

import { useDevLaag } from "@/lib/dev-laag"
import { WINKEL_LIVE } from "@/lib/data/winkel"

/**
 * Feature-flags. Iedereen krijgt `standaard`; alleen de eigenaar, met de
 * DEV-laag aan én zijn sessie door de server bevestigd, krijgt zijn eigen
 * override (bewaard in zijn localStorage). Een bezoeker die de override
 * met de hand zet, krijgt nog steeds de standaard.
 *
 * De standaard van `winkel` is `WINKEL_LIVE` (src/lib/data/winkel.ts);
 * de ingeklapte dock leest hem via `useFlag("winkel")`.
 */
export const FLAGS = {
  winkel: { naam: "winkel", omschrijving: "Shop live bekijken", standaard: WINKEL_LIVE },
} as const satisfies Record<string, { naam: string; omschrijving: string; standaard: boolean }>

export type FlagNaam = keyof typeof FLAGS
type Overrides = Partial<Record<FlagNaam, boolean>>

const SLEUTEL = "gronn-dev-flags"
const luisteraars = new Set<() => void>()
let ruw: string | null = null

function lees(): string {
  if (ruw !== null) return ruw
  try {
    ruw = window.localStorage.getItem(SLEUTEL) ?? "{}"
  } catch {
    ruw = "{}"
  }
  return ruw
}

function ontleed(s: string): Overrides {
  try {
    const o = JSON.parse(s)
    return o && typeof o === "object" ? o : {}
  } catch {
    return {}
  }
}

/** Alleen aangeroepen vanuit het DEV-paneel; raakt alleen deze browser. */
export function zetFlag(naam: FlagNaam, waarde: boolean | null) {
  const o = ontleed(lees())
  if (waarde === null) delete o[naam]
  else o[naam] = waarde
  ruw = JSON.stringify(o)
  try {
    window.localStorage.setItem(SLEUTEL, ruw)
  } catch {
    /* alleen voor nu */
  }
  luisteraars.forEach((l) => l())
}

function abonneer(l: () => void) {
  luisteraars.add(l)
  return () => {
    luisteraars.delete(l)
  }
}

/** De override van de eigenaar, of null — ongeacht verificatie (voor het paneel). */
export function useFlagOverride(naam: FlagNaam): boolean | null {
  const s = useSyncExternalStore(abonneer, lees, () => "{}")
  const v = ontleed(s)[naam]
  return typeof v === "boolean" ? v : null
}

export function useFlag(naam: FlagNaam): boolean {
  const { geverifieerd } = useDevLaag()
  const override = useFlagOverride(naam)
  const standaard: boolean = FLAGS[naam].standaard
  if (!geverifieerd || override === null) return standaard
  return override
}

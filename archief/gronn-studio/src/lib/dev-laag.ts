"use client"

import { useEffect, useSyncExternalStore } from "react"

/**
 * DEV-laag — alleen voor de eigenaar, alleen in zijn eigen browser.
 *
 * Twee standen, en alleen de tweede telt:
 * - `aan`: de schakelaar, bewaard in localStorage (gemak, geen gezag).
 * - `geverifieerd`: aan ÉN `/api/dev/sessie` zei `eigenaar: true`, wat
 *   alleen uit de NextAuth-sessie komt. Wie localStorage met de hand zet,
 *   krijgt `aan` maar nooit `geverifieerd` — en dus niets.
 *
 * De laag schrijft nooit data en verandert niets voor bezoekers.
 */

export const DEV_SLEUTEL = "gronn-dev-laag"
export const DEV_EVENT = "gronn:dev"

export type DevOpdracht =
  | { soort: "app-melding" }
  | { soort: "offline"; aan: boolean }
  | { soort: "verder-lezen" }

type Staat = { aan: boolean; eigenaar: boolean | null }

let staat: Staat = { aan: false, eigenaar: null }
const luisteraars = new Set<() => void>()
let gelezen = false
let bezig: Promise<boolean> | null = null

function zet(nieuw: Partial<Staat>) {
  staat = { ...staat, ...nieuw }
  luisteraars.forEach((l) => l())
}

function leesOpslag() {
  if (gelezen || typeof window === "undefined") return
  gelezen = true
  try {
    staat = { ...staat, aan: window.localStorage.getItem(DEV_SLEUTEL) === "aan" }
  } catch {
    /* geblokkeerde opslag: uit */
  }
}

/** Vraagt de server of dit de eigenaar is. Eén verzoek tegelijk. */
export function controleerSessie(opnieuw = false): Promise<boolean> {
  if (!opnieuw && staat.eigenaar !== null) return Promise.resolve(staat.eigenaar)
  if (bezig) return bezig
  bezig = fetch("/api/dev/sessie", { cache: "no-store", credentials: "same-origin" })
    .then((r) => (r.ok ? r.json() : { eigenaar: false }))
    .then((d: { eigenaar?: unknown }) => d.eigenaar === true)
    .catch(() => false)
    .then((e) => {
      bezig = null
      zet({ eigenaar: e })
      return e
    })
  return bezig
}

export function zetDevLaag(aan: boolean) {
  try {
    if (aan) window.localStorage.setItem(DEV_SLEUTEL, "aan")
    else window.localStorage.removeItem(DEV_SLEUTEL)
  } catch {
    /* alleen voor nu */
  }
  zet({ aan })
}

function abonneer(l: () => void) {
  leesOpslag()
  luisteraars.add(l)
  return () => {
    luisteraars.delete(l)
  }
}
const SERVER: Staat = { aan: false, eigenaar: null }
const snapshot = () => {
  leesOpslag()
  return staat
}

export function useDevLaag() {
  const s = useSyncExternalStore(abonneer, snapshot, () => SERVER)
  // Staat de schakelaar aan, dan vraagt de server of het klopt.
  useEffect(() => {
    if (s.aan && s.eigenaar === null) void controleerSessie()
  }, [s.aan, s.eigenaar])
  return { aan: s.aan, eigenaar: s.eigenaar, geverifieerd: s.aan && s.eigenaar === true }
}

/**
 * Luistert naar DEV-opdrachten, maar ALLEEN als de laag geverifieerd is.
 * Voor een bezoeker hangt er geen luisteraar: een zelfgestuurd event doet
 * niets. `bij` moet stabiel zijn (useCallback of een setter).
 */
export function useDevOpdracht(bij: (o: DevOpdracht) => void) {
  const { geverifieerd } = useDevLaag()
  useEffect(() => {
    if (!geverifieerd) return
    const h = (e: Event) => {
      const d = (e as CustomEvent<DevOpdracht>).detail
      if (d && typeof d === "object") bij(d)
    }
    window.addEventListener(DEV_EVENT, h)
    return () => window.removeEventListener(DEV_EVENT, h)
  }, [geverifieerd, bij])
}

export function stuurDev(o: DevOpdracht) {
  window.dispatchEvent(new CustomEvent(DEV_EVENT, { detail: o }))
}

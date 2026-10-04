"use client"

import { useSyncExternalStore } from "react"

import { BEWEGING_KEY, KLEUR_KEY, pasToe, type Beweging, type Kleur } from "@/lib/weergave"

// Weergave: één knop, een klein paneel (native popover, geen eigen
// focusval of klikbuiten-logica). Kleur en beweging, meer niet — wie
// grotere tekst wil, heeft de zoom van de browser.

const KLEUREN: { waarde: Kleur; label: string }[] = [
  { waarde: "auto", label: "Auto" },
  { waarde: "licht", label: "Licht" },
  { waarde: "donker", label: "Donker" },
]
const BEWEGINGEN: { waarde: Beweging; label: string }[] = [
  { waarde: "systeem", label: "Normaal" },
  { waarde: "minder", label: "Minder" },
]

const EVENT = "gronn-weergave"
const lees = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const abonneer = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}
const kleurNu = (): Kleur => {
  const k = lees(KLEUR_KEY)
  return k === "licht" || k === "donker" ? k : "auto"
}
const bewegingNu = (): Beweging => (lees(BEWEGING_KEY) === "minder" ? "minder" : "systeem")

function bewaar(kleur: Kleur, beweging: Beweging) {
  try {
    if (kleur === "auto") localStorage.removeItem(KLEUR_KEY)
    else localStorage.setItem(KLEUR_KEY, kleur)
    if (beweging === "systeem") localStorage.removeItem(BEWEGING_KEY)
    else localStorage.setItem(BEWEGING_KEY, beweging)
  } catch {}
  pasToe(kleur, beweging)
  window.dispatchEvent(new Event(EVENT))
}

export function AppearanceMenu() {
  const kleur = useSyncExternalStore(abonneer, kleurNu, () => "auto" as Kleur)
  const beweging = useSyncExternalStore(abonneer, bewegingNu, () => "systeem" as Beweging)

  return (
    <>
      <button
        type="button"
        popoverTarget="weergave"
        className="tekst-label inline-flex h-[36px] items-center px-[4px] underline-offset-[6px] hover:underline"
      >
        Weergave
      </button>
      <div
        id="weergave"
        popover="auto"
        aria-label="Weergave"
        className="weergave-paneel m-0 w-[248px] rounded-[2px] border border-line/15 bg-background p-[20px] text-foreground shadow-[0_24px_60px_-30px_rgb(0_0_0/0.45)]"
      >
        <Keuze
          naam="Kleur"
          opties={KLEUREN}
          waarde={kleur}
          kies={(k) => bewaar(k, beweging)}
        />
        <Keuze
          naam="Beweging"
          opties={BEWEGINGEN}
          waarde={beweging}
          kies={(b) => bewaar(kleur, b)}
          className="mt-[20px]"
        />
      </div>
    </>
  )
}

function Keuze<T extends string>({
  naam,
  opties,
  waarde,
  kies,
  className = "",
}: {
  naam: string
  opties: { waarde: T; label: string }[]
  waarde: T
  kies: (v: T) => void
  className?: string
}) {
  return (
    <fieldset className={className}>
      <legend className="tekst-label mb-[10px] text-muted">{naam}</legend>
      <div className="flex gap-[6px]">
        {opties.map((o) => (
          <label
            key={o.waarde}
            className="relative flex h-[34px] flex-1 cursor-pointer items-center justify-center rounded-full border border-line/20 text-[13px] font-medium transition-colors has-[:checked]:border-transparent has-[:checked]:bg-gronn-salie has-[:checked]:text-gronn-bos has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)]"
          >
            <input
              type="radio"
              name={naam}
              value={o.waarde}
              checked={waarde === o.waarde}
              onChange={() => kies(o.waarde)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

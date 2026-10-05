"use client"

import { useEffect, useRef, useState } from "react"

// WF-026: één knop met een regelaar-icoon opent Kleur (Auto · Licht · Donker;
// Auto = licht van 07.00 tot 19.00) en Toegankelijkheid. Bewaard in deze
// browser; het voorverf-script in layout.tsx past het toe vóór de eerste verf.
type Stand = { kleur: "auto" | "licht" | "donker"; beweging: boolean; groot: boolean; contrast: boolean; onderstreep: boolean }
const KEY = "gronn-weergave"
const STANDAARD: Stand = { kleur: "auto", beweging: false, groot: false, contrast: false, onderstreep: false }
const SCHAKELAARS: [keyof Omit<Stand, "kleur">, string][] = [
  ["beweging", "Minder beweging"],
  ["groot", "Grotere tekst"],
  ["contrast", "Meer contrast"],
  ["onderstreep", "Links onderstrepen"],
]

function pasToe(s: Stand) {
  const u = new Date().getHours()
  const c = document.documentElement.classList
  c.toggle("donker", s.kleur === "donker" || (s.kleur === "auto" && (u < 7 || u >= 19)))
  c.toggle("stil", s.beweging)
  c.toggle("groot", s.groot)
  c.toggle("contrast", s.contrast)
  c.toggle("onderstreep", s.onderstreep)
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
}

export function Weergave({ knopKlasse = "" }: { knopKlasse?: string }) {
  const [open, setOpen] = useState(false)
  const [stand, setStand] = useState<Stand>(STANDAARD)
  const paneel = useRef<HTMLDivElement>(null)
  const knop = useRef<HTMLButtonElement>(null)

  // Bewaarde stand ophalen ná de eerste render (hydration-veilig).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setStand({ ...STANDAARD, ...JSON.parse(localStorage.getItem(KEY) || "{}") })
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!open) return
    const toets = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), knop.current?.focus())
    const klik = (e: MouseEvent) => {
      const t = e.target as Node
      if (!paneel.current?.contains(t) && !knop.current?.contains(t)) setOpen(false)
    }
    document.addEventListener("keydown", toets)
    document.addEventListener("click", klik)
    return () => {
      document.removeEventListener("keydown", toets)
      document.removeEventListener("click", klik)
    }
  }, [open])

  const zet = (s: Stand) => {
    setStand(s)
    pasToe(s)
  }

  return (
    <>
      <button
        ref={knop}
        type="button"
        aria-label="Weergave en toegankelijkheid"
        aria-expanded={open}
        aria-controls="weergave-paneel"
        onClick={() => setOpen(!open)}
        className={`grid size-10 cursor-pointer place-items-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${knopKlasse}`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3 5h14M3 10h14M3 15h14" />
          <circle cx="7" cy="5" r="2" fill="none" />
          <circle cx="13" cy="10" r="2" fill="none" />
          <circle cx="9" cy="15" r="2" fill="none" />
        </svg>
      </button>
      <div
        ref={paneel}
        id="weergave-paneel"
        role="dialog"
        aria-label="Weergave en toegankelijkheid"
        hidden={!open}
        className="fixed inset-x-3 bottom-[84px] z-[200] rounded-2xl border border-lijn bg-grond p-5 text-sm text-inkt shadow-2xl md:inset-x-auto md:left-1/2 md:w-80 md:-translate-x-1/2 lg:bottom-[110px]"
      >
        <div className="mb-4 flex items-center justify-between">
          <strong className="text-[15px] font-semibold">Weergave</strong>
          <button type="button" aria-label="Sluiten" onClick={() => setOpen(false)} className="grid size-8 cursor-pointer place-items-center rounded-full">
            ✕
          </button>
        </div>
        <fieldset className="m-0 mb-4 border-0 p-0">
          <legend className="lbl mb-2.5 p-0 opacity-70">Kleur</legend>
          <div className="grid grid-cols-3 rounded-full border border-lijn p-[3px]">
            {(["auto", "licht", "donker"] as const).map((k) => (
              <label key={k} className="cursor-pointer rounded-full py-2 text-center text-[13px] font-medium has-checked:bg-inkt has-checked:text-grond has-focus-visible:outline-2">
                <input type="radio" name="kleur" value={k} checked={stand.kleur === k} onChange={() => zet({ ...stand, kleur: k })} className="sr-only" />
                {k[0].toUpperCase() + k.slice(1)}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs opacity-70">Auto: licht overdag, donker vanaf 19.00 uur.</p>
        </fieldset>
        <fieldset className="m-0 border-0 p-0">
          <legend className="lbl mb-2.5 p-0 opacity-70">Toegankelijkheid</legend>
          {SCHAKELAARS.map(([k, t]) => (
            <label key={k} className="flex cursor-pointer items-center justify-between gap-3 border-t border-lijn py-2.5 last:border-b">
              <span>{t}</span>
              <input
                type="checkbox"
                role="switch"
                checked={stand[k]}
                onChange={(e) => zet({ ...stand, [k]: e.target.checked })}
                className="size-5 cursor-pointer accent-[var(--inkt)]"
              />
            </label>
          ))}
        </fieldset>
        <button type="button" onClick={() => zet(STANDAARD)} className="lbl mt-3 cursor-pointer border-b border-current">
          Standaard herstellen
        </button>
      </div>
    </>
  )
}

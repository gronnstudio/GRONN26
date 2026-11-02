import { planDagen } from "./project"
import type { Klant } from "./klant"

// Alle klusdagen uit de planning van elke calculatie (laatste versie), elke werkdag apart,
// met de voornaam van de klant (Nick, 2 nov 2026). Gedeeld door de planningpagina en de agendalink.
const iso = (d: Date) => d.toISOString().slice(0, 10)
const KLEUREN = ["#2f7a4a", "#ff5b04", "#3b6fb6", "#a3487a", "#8a6d1f", "#2a8a8a"]

export type Klusdag = { id: string; datum: string; wie: string; wat: string; kleur: string; href: string }

export function klusdagen(klanten: Klant[]): Klusdag[] {
  return klanten.flatMap((k, ki) =>
    k.calculaties.flatMap((c) => {
      const v = c.versies.at(-1)
      if (!v?.planning?.length) return []
      const wie = k.naam.trim().split(/\s+/)[0] || k.naam
      return planDagen(v.planning, v.planStart ?? "").flatMap((d, i) => {
        const f = v.planning![i]
        const uit: Klusdag[] = []
        for (let x = new Date(`${d.van}T12:00:00Z`); iso(x) <= d.tot; x.setUTCDate(x.getUTCDate() + 1)) {
          if (x.getUTCDay() === 0 || x.getUTCDay() === 6) continue
          uit.push({ id: `${f.id}-${iso(x)}`, datum: iso(x), wie, wat: `${wie}: ${f.naam || "nog invullen"}`, kleur: KLEUREN[ki % KLEUREN.length], href: `/dashboard/klanten/${k.id}/calculatie/${c.id}` })
        }
        return uit
      })
    }),
  )
}

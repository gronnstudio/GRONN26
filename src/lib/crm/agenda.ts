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
          uit.push({ id: `${c.id}-${f.id}-${iso(x)}`, datum: iso(x), wie, wat: `${wie}: ${f.naam || "nog invullen"}`, kleur: KLEUREN[ki % KLEUREN.length], href: `/dashboard/klanten/${k.id}/calculatie/${c.id}` })
        }
        return uit
      })
    }),
  )
}

// Voor de agendalink: e-mailadressen en telefoonnummers uit vrije tekst halen, voor het geval
// ze in "Wat en waar" zijn getypt. De link is geheim, maar hoort geen contactgegevens te dragen.
export function zonderContact(tekst: string) {
  return tekst
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "…")
    .replace(/\+?\d[\d\s-]{7,}\d/g, (m) => (m.replace(/\D/g, "").length >= 9 ? "…" : m))
}

// Vaste onderhoudsklanten (Nick, 2 nov 2026): een klant met de tag "onderhoud" komt elk seizoen
// terug in de planning, op de eerste maandag van maart, juni, oktober en december. Geen eigen
// schema per klant: wie anders wil, plant de echte dag zelf in. Verloren klanten tellen niet mee.
export const SEIZOENEN = [
  { maand: 3, naam: "Voorjaarsbeurt" },
  { maand: 6, naam: "Zomerbeurt" },
  { maand: 10, naam: "Herfstbeurt" },
  { maand: 12, naam: "Winterbeurt" },
] as const

export const isOnderhoud = (k: Klant) => k.fase !== "Verloren" && k.tags.some((t) => t.trim().toLowerCase() === "onderhoud")

export type Beurt = { id: string; datum: string; wie: string; wat: string; href: string }

/** De onderhoudsbeurten tussen van en tot (JJJJ-MM-DD, beide meegeteld). */
export function onderhoudsbeurten(klanten: Klant[], van: string, tot: string): Beurt[] {
  const uit: Beurt[] = []
  for (let jaar = Number(van.slice(0, 4)); jaar <= Number(tot.slice(0, 4)); jaar++)
    for (const s of SEIZOENEN) {
      const d = new Date(Date.UTC(jaar, s.maand - 1, 1, 12))
      while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1)
      const datum = iso(d)
      if (datum < van || datum > tot) continue
      for (const k of klanten.filter(isOnderhoud)) {
        const wie = k.naam.trim().split(/\s+/)[0] || k.naam
        uit.push({ id: `${k.id}-${datum}`, datum, wie, wat: `${s.naam} ${k.naam}`, href: `/dashboard/klanten/${k.id}` })
      }
    }
  return uit
}

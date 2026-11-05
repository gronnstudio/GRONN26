import type { Klusdag } from "./agenda"
import { weekVan } from "./week"

// Het planbord (Plancraft, 5 nov 2026): per klus één rij, per week één kolom (KW), met in elke
// cel hoeveel werkdagen die klus die week heeft. Uit dezelfde klusdagen als de maandkalender.

export type Bordrij = { href: string; wie: string; kleur: string; dagen: number[]; fasen: string[] }

const plus7 = (d: string, n: number) => {
  const x = new Date(`${d}T12:00:00Z`)
  x.setUTCDate(x.getUTCDate() + 7 * n)
  return x.toISOString().slice(0, 10)
}

export function planbord(klus: Klusdag[], vanaf: string, aantal: number) {
  const eerste = weekVan(vanaf).maandag
  const weken = Array.from({ length: aantal }, (_, i) => weekVan(plus7(eerste, i)))
  const index = new Map(weken.map((w, i) => [w.maandag, i]))
  const rijen = new Map<string, Bordrij>()
  for (const d of klus) {
    const i = index.get(weekVan(d.datum).maandag)
    if (i === undefined) continue
    const r = rijen.get(d.href) ?? { href: d.href, wie: d.wie, kleur: d.kleur, dagen: weken.map(() => 0), fasen: [] }
    r.dagen[i]++
    const fase = d.wat.slice(d.wie.length + 2)
    if (!r.fasen.includes(fase)) r.fasen.push(fase)
    rijen.set(d.href, r)
  }
  // Wat het eerst begint, staat bovenaan.
  return { weken, rijen: [...rijen.values()].sort((a, b) => a.dagen.findIndex((n) => n > 0) - b.dagen.findIndex((n) => n > 0)) }
}

import { meetstaat } from "./meetstaat"
import type { Zone } from "./vragenlijst"

// De werkplanning (docs/architecture/intake.md §8, fase 5): uit de meetstaat
// maakt de code een voorstel met fasen, werkdagen, machines en wanneer welk
// materiaal er moet zijn. De dagproducties hieronder zijn een aanname voor
// één man met een machine. Ze staan bij elke fase, en Nick past de dagen aan
// in de calculatie. Claude plant hier niets.

export type PlanFase = { id: string; naam: string; dagen: number; machines: string; levering: string; uitleg?: string }

/** Wat er per dag af kan, in duizendsten van de eenheid. */
const PER_DAG = { afgraven: 20_000, fundering: 50_000, bestrating: 15_000, band: 40_000, grond: 15_000, zoden: 150_000, planten: 150_000, mulch: 10_000 }

const halfBoven = (d: number) => Math.max(0.5, Math.ceil(d * 2) / 2)
const getal = (m: number) => (m / 1000).toLocaleString("nl-NL", { maximumFractionDigits: 1 })

/** Het voorstel. Alleen fasen waar werk in zit, in de volgorde waarin het gebeurt. */
export function werkplan(zones: Zone[]): PlanFase[] {
  const som: Record<string, number> = {}
  let vijvers = 0
  meetstaat(zones).forEach((z, i) => {
    if (zones[i].soort === "Vijver" && z.regels.length) vijvers++
    for (const r of z.regels) som[r.wat] = (som[r.wat] ?? 0) + r.hoeveelheid
  })
  const s = (w: string) => som[w] ?? 0
  const grond = s("Afgraven") + s("Uitgraven")
  const fundering = s("Bestrating") // m², al met snijverlies: goed genoeg om dagen te schatten
  const fasen: Omit<PlanFase, "id">[] = []
  if (grond) fasen.push({ naam: "Afgraven en grond afvoeren", dagen: halfBoven(grond / PER_DAG.afgraven), machines: "Minigraver, kipper", levering: "Container of kipper voor de grond", uitleg: `${getal(grond)} m³ ÷ 20 m³ per dag` })
  if (fundering) fasen.push({ naam: "Fundering en straatlaag", dagen: halfBoven(fundering / PER_DAG.fundering), machines: "Trilplaat", levering: "Korrelmix en straatzand", uitleg: `${getal(fundering)} m² ÷ 50 m² per dag` })
  if (fundering) {
    const d = fundering / PER_DAG.bestrating + s("Opsluitband") / PER_DAG.band
    fasen.push({ naam: "Opsluitbanden en bestraten", dagen: halfBoven(d), machines: "Steenknipper of zaag, trilplaat", levering: "Klinkers en opsluitbanden", uitleg: `${getal(fundering)} m² ÷ 15 m² + ${getal(s("Opsluitband"))} m ÷ 40 m per dag` })
  }
  if (vijvers) fasen.push({ naam: "Vijver: ondervlies, folie en vullen", dagen: vijvers, machines: "", levering: "Vijverfolie en ondervlies", uitleg: `${vijvers} × 1 dag per vijver` })
  if (s("Teelaarde") || s("Graszoden")) {
    const d = s("Teelaarde") / PER_DAG.grond + s("Graszoden") / PER_DAG.zoden
    fasen.push({ naam: "Grond en gazon", dagen: halfBoven(d), machines: "Rupsdumper", levering: "Teelaarde; graszoden op de dag zelf", uitleg: `${getal(s("Teelaarde"))} m³ ÷ 15 m³ + ${getal(s("Graszoden"))} m² ÷ 150 m² per dag` })
  }
  if (s("Planten")) {
    const d = s("Planten") / PER_DAG.planten + (s("Compost") + s("Mulch")) / PER_DAG.mulch
    fasen.push({ naam: "Beplanting", dagen: halfBoven(d), machines: "", levering: "Planten, compost en mulch", uitleg: `${getal(s("Planten"))} st ÷ 150 st + ${getal(s("Compost") + s("Mulch"))} m³ ÷ 10 m³ per dag` })
  }
  if (fasen.length) fasen.push({ naam: "Opruimen en opleveren", dagen: 0.5, machines: "Bladblazer", levering: "", uitleg: "vaste halve dag" })
  return fasen.map((f, i) => ({ id: `fase-${i + 1}`, ...f }))
}

/** Op welke werkdag elke fase begint (1 = eerste dag). Halve dagen tellen mee. */
export const startDagen = (plan: PlanFase[]) => plan.reduce<number[]>((acc, f, i) => [...acc, i ? acc[i - 1] + plan[i - 1].dagen : 1], [])

export const totaalDagen = (plan: PlanFase[]) => plan.reduce((t, f) => t + f.dagen, 0)

const dagTekst = (d: number) => `${d.toLocaleString("nl-NL")} ${d === 1 ? "dag" : "dagen"}`

/** De werkvolgorde als tekst voor de werkomschrijving op de offerte. */
export function alsWerkomschrijving(plan: PlanFase[]) {
  return ["Werkvolgorde:", ...plan.map((f, i) => `${i + 1}. ${f.naam} (${dagTekst(f.dagen)})`), `Samen ongeveer ${dagTekst(totaalDagen(plan))} werk, afhankelijk van het weer.`].join("\n")
}

/** Een planning uit de browser of opslag: wat niet klopt valt weg of wordt begrensd. */
export function schoonPlan(v: unknown): PlanFase[] {
  if (!Array.isArray(v)) return []
  const t = (x: unknown, n: number) => (typeof x === "string" ? x.trim().slice(0, n) : "")
  return v.slice(0, 30).flatMap((f) => {
    const r = (f ?? {}) as Record<string, unknown>
    const naam = t(r.naam, 80)
    const dagen = typeof r.dagen === "number" && Number.isFinite(r.dagen) ? Math.min(60, Math.max(0.5, Math.round(r.dagen * 2) / 2)) : 1
    return naam ? [{ id: t(r.id, 64) || crypto.randomUUID(), naam, dagen, machines: t(r.machines, 120), levering: t(r.levering, 160), ...(t(r.uitleg, 160) ? { uitleg: t(r.uitleg, 160) } : {}) }] : []
  })
}

import { reken } from "./calculatie"
import { deel, type Centen, type Milli } from "./geld"
import type { PlanFase } from "./planning"

// Het project (docs/architecture/intake.md §8, fase 6): na akkoord wordt een
// calculatieversie uitgevoerd. De taken komen uit de planning van die versie,
// Nick vinkt ze af, schrijft uren, noteert meerwerk en houdt een opleverlijst
// bij. De nacalculatie zet begroot naast werkelijk. Puur rekenwerk en
// opschonen, geen opslag.

export type Taak = { id: string; naam: string; dagen: number; klaar: boolean }
export type ProjectUren = { id: string; datum: string; uren: Milli; wat: string }
export type Meerwerk = { id: string; datum: string; omschrijving: string; bedrag: Centen; akkoord: boolean }
export type Punt = { id: string; tekst: string; klaar: boolean }

export type Project = {
  id: string
  titel: string
  calculatieId: string
  versie: number
  gestart: string
  taken: Taak[]
  uren: ProjectUren[]
  meerwerk: Meerwerk[]
  oplevering: Punt[]
  opgeleverd?: string
}

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

export function nieuwProject(c: { id: string; titel: string }, v: { nr: number; planning?: PlanFase[] }): Project {
  return {
    id: crypto.randomUUID(),
    titel: c.titel,
    calculatieId: c.id,
    versie: v.nr,
    gestart: vandaag(),
    taken: (v.planning ?? []).map((f) => ({ id: crypto.randomUUID(), naam: f.naam, dagen: f.dagen, klaar: false })),
    uren: [],
    meerwerk: [],
    oplevering: [],
  }
}

const t = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "")
const geheel = (v: unknown, max: number) => (Number.isSafeInteger(v) ? Math.min(max, Math.max(0, v as number)) : 0)
const datum = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : vandaag())
const lijst = <T>(v: unknown, f: (r: Record<string, unknown>) => T | null, max = 300): T[] =>
  (Array.isArray(v) ? v : []).slice(0, max).flatMap((x) => {
    const r = f((x ?? {}) as Record<string, unknown>)
    return r ? [r] : []
  })
const id = (v: unknown) => t(v, 64) || crypto.randomUUID()

/** Een project uit opslag naar de huidige vorm; wat niet klopt valt weg. */
export function normaliseerProject(p: Partial<Project>): Project {
  return {
    id: id(p.id),
    titel: t(p.titel, 120) || "Project",
    calculatieId: t(p.calculatieId, 64),
    versie: geheel(p.versie, 1000),
    gestart: datum(p.gestart),
    taken: lijst(p.taken, (r) => (t(r.naam, 80) ? { id: id(r.id), naam: t(r.naam, 80), dagen: typeof r.dagen === "number" && r.dagen > 0 ? Math.min(60, r.dagen) : 1, klaar: r.klaar === true } : null), 60),
    uren: lijst(p.uren, (r) => (geheel(r.uren, 24_000) ? { id: id(r.id), datum: datum(r.datum), uren: geheel(r.uren, 24_000), wat: t(r.wat, 200) } : null), 1000),
    meerwerk: lijst(p.meerwerk, (r) => (t(r.omschrijving, 200) ? { id: id(r.id), datum: datum(r.datum), omschrijving: t(r.omschrijving, 200), bedrag: geheel(r.bedrag, 1e10), akkoord: r.akkoord === true } : null), 200),
    oplevering: lijst(p.oplevering, (r) => (t(r.tekst, 200) ? { id: id(r.id), tekst: t(r.tekst, 200), klaar: r.klaar === true } : null), 200),
    ...(p.opgeleverd ? { opgeleverd: datum(p.opgeleverd) } : {}),
  }
}

export type Nacalculatie = {
  urenBegroot: Milli
  urenWerkelijk: Milli
  dagenBegroot: number
  takenKlaar: number
  taken: number
  meerwerkAkkoord: Centen
  meerwerkOpen: Centen
  /** Wat er per uur overblijft: de winst uit de calculatie gedeeld door de begrote en door de werkelijke uren (meerwerk niet meegeteld). */
  perUurWerkelijk: Centen | null
  perUurBegroot: Centen | null
  puntenOpen: number
}

/** Begroot (uit de calculatieversie) tegenover werkelijk (uit het project). */
export function nacalculatie(p: Project, v?: { uren: Milli; uurtarief: Centen; regels: Parameters<typeof reken>[0]["regels"]; onvoorzien: number; korting: number }): Nacalculatie {
  const urenWerkelijk = p.uren.reduce((s, u) => s + u.uren, 0)
  const u = v ? reken(v) : null
  return {
    urenBegroot: v?.uren ?? 0,
    urenWerkelijk,
    dagenBegroot: p.taken.reduce((s, x) => s + x.dagen, 0),
    takenKlaar: p.taken.filter((x) => x.klaar).length,
    taken: p.taken.length,
    meerwerkAkkoord: p.meerwerk.filter((m) => m.akkoord).reduce((s, m) => s + m.bedrag, 0),
    meerwerkOpen: p.meerwerk.filter((m) => !m.akkoord).reduce((s, m) => s + m.bedrag, 0),
    perUurBegroot: u && v && v.uren ? u.perUur : null,
    perUurWerkelijk: u && urenWerkelijk ? deel(u.winst * 1000, urenWerkelijk) : null,
    puntenOpen: p.oplevering.filter((x) => !x.klaar).length,
  }
}

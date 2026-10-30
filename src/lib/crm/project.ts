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
  /** Wanneer dit deel wordt uitgevoerd, in Nicks woorden ("november", "maart 2027"). */
  wanneer?: string
  /** De begroting bij de start, zodat de nacalculatie blijft kloppen als de calculatie later verandert of verdwijnt. */
  begroot: { uren: Milli; winst: Centen }
}

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

/**
 * Fasen die Nick al in de beschrijving zette: genummerde regels ("1. Grondwerk
 * (2 dagen)"), "Fase 2: …" of opsommingstekens. Werkdagen tussen haakjes,
 * anders 1. Zo krijgt een project zonder planning toch zijn taken.
 */
export function takenUitBeschrijving(tekst: string): { naam: string; dagen: number }[] {
  return tekst
    .split("\n")
    .map((r) => r.match(/^\s*(?:\d+\s*[.)]|fase\s*\d+\s*[:.)-]?|[-•*])\s*(.+?)\s*$/i)?.[1] ?? "")
    .filter((n) => n.length > 1)
    .slice(0, 30)
    .map((r) => {
      const d = r.match(/\(?\s*(\d+(?:[.,]\d+)?)\s*(?:werk)?dag(?:en)?\s*\)?/i)
      const naam = (d ? r.replace(d[0], "") : r).replace(/[\s:·,-]+$/, "").trim().slice(0, 80)
      return { naam, dagen: d ? Math.min(60, Math.max(0.5, Number(d[1].replace(",", ".")))) : 1 }
    })
    .filter((x) => x.naam)
}

export function nieuwProject(c: { id: string; titel: string }, v: { nr: number; planning?: PlanFase[]; uren: Milli; winst: Centen; beschrijving?: string }): Project {
  return {
    begroot: { uren: v.uren, winst: v.winst },
    id: crypto.randomUUID(),
    titel: c.titel,
    calculatieId: c.id,
    versie: v.nr,
    gestart: vandaag(),
    taken: (v.planning?.length ? v.planning : takenUitBeschrijving(v.beschrijving ?? "")).map((f) => ({ id: crypto.randomUUID(), naam: f.naam, dagen: f.dagen, klaar: false })),
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
    ...(t(p.wanneer, 40) ? { wanneer: t(p.wanneer, 40) } : {}),
    begroot: { uren: geheel(p.begroot?.uren, 1e9), winst: Number.isSafeInteger(p.begroot?.winst) ? (p.begroot!.winst as number) : 0 },
  }
}

/**
 * Een project in twee delen, zoals grondwerk in november en de rest in maart.
 * De gekozen taken gaan naar een nieuw project; de begroting verdeelt naar
 * werkdagen, zodat beide delen samen nog steeds de calculatie zijn.
 */
export function splitsProject(p: Project, taakIds: string[], wanneer: string): [Project, Project] | null {
  const weg = p.taken.filter((x) => taakIds.includes(x.id))
  if (!weg.length || weg.length === p.taken.length) return null
  const totaal = p.taken.reduce((s, x) => s + x.dagen, 0)
  const aandeel = (n: number) => (totaal ? deel(n * Math.round(weg.reduce((s, x) => s + x.dagen, 0) * 1000), Math.round(totaal * 1000)) : 0)
  const uren = aandeel(p.begroot.uren)
  const winst = aandeel(p.begroot.winst)
  const w = wanneer.trim().slice(0, 40)
  const nieuw: Project = {
    ...p,
    id: crypto.randomUUID(),
    titel: `${p.titel} · ${w || "deel 2"}`.slice(0, 120),
    gestart: vandaag(),
    taken: weg,
    uren: [],
    meerwerk: [],
    oplevering: [],
    opgeleverd: undefined,
    ...(w ? { wanneer: w } : { wanneer: undefined }),
    begroot: { uren, winst },
  }
  const rest: Project = { ...p, taken: p.taken.filter((x) => !taakIds.includes(x.id)), begroot: { uren: p.begroot.uren - uren, winst: p.begroot.winst - winst } }
  return [rest, nieuw]
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

/** Begroot (de momentopname bij de start) tegenover werkelijk (uit het project). */
export function nacalculatie(p: Project): Nacalculatie {
  const urenWerkelijk = p.uren.reduce((s, u) => s + u.uren, 0)
  const { uren, winst } = p.begroot
  return {
    urenBegroot: uren,
    urenWerkelijk,
    dagenBegroot: p.taken.reduce((s, x) => s + x.dagen, 0),
    takenKlaar: p.taken.filter((x) => x.klaar).length,
    taken: p.taken.length,
    meerwerkAkkoord: p.meerwerk.filter((m) => m.akkoord).reduce((s, m) => s + m.bedrag, 0),
    meerwerkOpen: p.meerwerk.filter((m) => !m.akkoord).reduce((s, m) => s + m.bedrag, 0),
    perUurBegroot: uren ? deel(winst * 1000, uren) : null,
    perUurWerkelijk: urenWerkelijk ? deel(winst * 1000, urenWerkelijk) : null,
    puntenOpen: p.oplevering.filter((x) => !x.klaar).length,
  }
}

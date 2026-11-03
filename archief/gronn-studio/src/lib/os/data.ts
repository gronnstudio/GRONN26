import {
  CIJFERS,
  FOTOS,
  HOOFDSTUKKEN,
  PLANTTABEL,
  VIDEOS,
  VIJVER,
  VIJVER_FASEN,
  VIJVER_FASE_NU,
  type Foto,
} from "@/lib/data/vijverrenovatie"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"

// The fixed data behind GRØNN Command Center (/os).
//
// Only real facts (owner, 30 Sep 2026: "only real data"). The project
// files the public site already reads (vijverrenovatie.ts,
// terras-geulle.ts), and what Nick stated in the Command Center brief
// about the pond (Vijverklant, €0.000,00, 120 h, 92 %, "Finalisation",
// 2 ponds / 1 waterfall / 1 stream). Everything that moves (leads,
// money, activity) is read live by `live.ts`; nothing here is an example.

export type Stage =
  | "Lead"
  | "Intake"
  | "Design"
  | "Quotation"
  | "Approved"
  | "Planning"
  | "Execution"
  | "Waiting"
  | "Completed"
  | "Archived"

export type Health = "healthy" | "attention" | "waiting" | "done"

export type OsProject = {
  slug: string
  /** What Nick calls it: the client's first name, or the place. */
  name: string
  kind: string
  stage: Stage
  /** Finer than the stage, in the words Nick uses for it. */
  status: string
  /** 0–100, or null where nobody has said. */
  progress: number | null
  value: number | null
  hours: number | null
  health: Health
  /** Short line for the Core's hover card. */
  note: string
  cover?: Foto
  /** Only projects with a control view get a link. */
  hasControlView?: boolean
}

const cover = (id: keyof typeof FOTOS, i = 0): Foto | undefined => {
  const f = FOTOS[id]
  if (!f) return undefined
  return Array.isArray(f) ? f[i] : f
}

export const PROJECTS: OsProject[] = [
  {
    slug: "vijverklant",
    name: "Vijverklant",
    kind: "Pond renovation",
    stage: "Execution",
    status: "Finalisation",
    progress: 92,
    value: 0,
    hours: 120,
    health: "healthy",
    note: "Clearing, topsoil and replacement plants left; further planting spring 2027.",
    cover: cover("F10"),
    hasControlView: true,
  },
  {
    slug: "terras-geulle",
    name: "Geulle",
    kind: "Terrace, 24 m²",
    stage: "Completed",
    status: TERRAS.wanneer,
    progress: 100,
    value: null,
    hours: null,
    health: "done",
    note: "24 m² of 60 × 60 × 4 cm tiles, laid in two days.",
    cover: TERRAS_FOTOS.hoofd,
  },
]

export type Telemetry = {
  activeProjects: number
  leads: number
  pipeline: number
  /** Null when the hours register did not answer, or is not read here. */
  hoursThisMonth: number | null
}

export type Lead = {
  id: string
  name: string
  kind: string
  place: string
  stage: "New lead" | "Contacted" | "Intake" | "Proposal" | "Quotation" | "Decision" | "Won" | "Lost"
  /** Euros; 0 where no amount has been named yet. */
  value: number
  /** 0–100, or null where nobody has said. Never guessed. */
  probability: number | null
  /** Days since the last recorded activity: the enquiry, the quote, the record. */
  lastContactDays: number
  next: string
  /** Where the lead is worked on, while that is still /dashboard. */
  href?: string
}

export const PIPELINE_STAGES: Lead["stage"][] = [
  "New lead",
  "Contacted",
  "Intake",
  "Proposal",
  "Quotation",
  "Decision",
  "Won",
  "Lost",
]

/** A lead goes stale after this many days without contact. */
export const STALE_AFTER_DAYS = 5

export type Briefing = {
  counts: { label: string; n: number; href?: string }[]
  /** The next dated deadlines: invoices due, quotes lapsing. */
  schedule: { time: string; what: string; href?: string }[]
  insight: { text: string; action?: string; href?: string }
}

export type Activity = { time: string; what: string; project?: string }

export type NextAction = { what: string; project: string; href?: string }

// ─── The pond: the first project with a control view ────────────────────

export const POND = {
  slug: "vijverklant",
  name: "Vijverklant",
  title: "Pond reconstruction",
  status: "Finalisation",
  progress: 92,
  value: 0,
  hours: 120,
  system: [
    { n: 2, what: "ponds" },
    { n: 1, what: "waterfall" },
    { n: 1, what: "stream" },
  ],
  /** Public project text, reused verbatim as the internal brief. */
  intro: VIJVER.intro,
  /** Both languages: the OS shows the one Nick picked. */
  phases: VIJVER_FASEN,
  phaseNow: VIJVER_FASE_NU,
  facts: CIJFERS,
  chapters: HOOFDSTUKKEN,
  plants: PLANTTABEL,
  videos: VIDEOS,
  hero: cover("F01"),
}

export type Task = { what: string; done: boolean; source: string }

// Open tasks: every one is a sentence from the "afronding" and
// "beplanting" chapters, not an invention. Done tasks: the work the
// chapters describe as carried out.
export const POND_TASKS: Task[] = [
  { what: "Remove the remaining wood and rubble", done: false, source: "afronding" },
  { what: "Top up the surrounding beds with topsoil", done: false, source: "afronding" },
  { what: "Replace the pond plants the fish damaged, and protect the new ones", done: false, source: "beplanting" },
  { what: "Walk the owner through the valves and the water split", done: false, source: "afronding" },
  { what: "Photograph the skimmer (F06 is still empty)", done: false, source: "fotoplan" },
  { what: "Further planting around the ponds", done: false, source: "spring 2027" },
  { what: "Lay the 50 mm pressure PVC with 45° bends", done: true, source: "leidingwerk" },
  { what: "Set up the three-chamber filter with bypass", done: true, source: "filter" },
  { what: "Repair the PP filter (2K glue, then RubberSeal)", done: true, source: "filterherstel" },
  { what: "Build the waterfall and stream bed", done: true, source: "waterroute" },
  { what: "Plant the 11 baskets along waterline and stream edge", done: true, source: "beplanting" },
]

export type Material = { what: string; spec: string; status: "Installed" | "To order" | "Planned" }

export const POND_MATERIALS: Material[] = [
  { what: "Pump", spec: "AquaForte DM-10000 Vario S", status: "Installed" },
  { what: "Filter", spec: "3 chambers, with bypass", status: "Installed" },
  { what: "Pressure PVC", spec: "50 mm, rated to 7.5 bar", status: "Installed" },
  { what: "Bends", spec: "2–4 × 90°, rest 45°", status: "Installed" },
  { what: "Fittings", spec: "T-pieces, reducers, threaded unions", status: "Installed" },
  { what: "Valves", spec: "Ball valves on both branches, gate valves on filter drains", status: "Installed" },
  { what: "Skimmer", spec: "1 × surface skimmer", status: "Installed" },
  { what: "Repair", spec: "Two-component glue + RubberSeal", status: "Installed" },
  { what: "Plant baskets", spec: "11 × with clay and substrate", status: "Installed" },
  { what: "Replacement pond plants", spec: "For the ones the fish damaged", status: "To order" },
  { what: "Further planting", spec: "Around the ponds", status: "Planned" },
]

/** Nick's own figures from the brief: the value and the hours. */
export const POND_FINANCE = {
  revenue: 0,
  hours: 120,
}

export const POND_NOTES = [
  "More fittings were needed than planned: a route on paper has to be translated on site into every single connection.",
  "The PP filter repair took two rounds. Two-component glue alone was not enough; RubberSeal finished it.",
  "The fish damaged part of the new planting. Placement and protection of the replacements need thought.",
  "Keep the valves and unions reachable: maintenance was designed in from the start.",
]

/** Photos grouped the way the project control view shows them. */
export function pondPhotos() {
  const all = Object.entries(FOTOS).flatMap(([id, f]) =>
    (Array.isArray(f) ? f : f ? [f] : []).map((foto, i, arr) => ({
      id: arr.length > 1 ? `${id}-${i + 1}` : id,
      ...foto,
    }))
  )
  const groups: { title: string; photos: typeof all }[] = [
    { title: "Existing situation", photos: all.filter((p) => p.fase === "bestaande situatie") },
    { title: "Process", photos: all.filter((p) => p.fase === "proces") },
    { title: "Construction", photos: all.filter((p) => p.fase === "uitvoering") },
    { title: "Visualisations", photos: all.filter((p) => p.label) },
  ]
  return groups.filter((g) => g.photos.length > 0)
}

export const euroFull = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n)

export const euroShort = (n: number) =>
  n >= 1000 ? `€${(n / 1000).toFixed(1)}K` : `€${Math.round(n)}`

import "server-only"

import { serviceClient } from "@/lib/supabase"
import type {
  Phase,
  StepStatus,
  TermStatus,
  WerkbankProject,
} from "@/lib/werkbank"

// The owner's side of a project.
//
// Same posture as `client-admin.ts`, and for the same reason: everything
// here runs on the service role, which bypasses every policy in the
// schema. That is what makes it the owner's hand rather than a client's,
// and it is why no function in this file may be called from a route that
// has not already established the caller is Nick through
// `getOwnerSession`.
//
// `0002_werkbank.sql` has no insert, update or delete policy on any of
// these tables — deliberately. So this file is not merely the convenient
// way to write a phase or a price; it is the only way, and the database
// enforces that rather than trusting a convention.
//
// Every function answers `null` for "there is no database, or it did not
// answer". The route turns that into 503 and never into an empty
// success: "no projects" and "the store is down" reading the same is the
// exact failure `readArchive` was split apart to end.

export type AdminProjectRow = {
  id: string
  client_id: string
  name: string
  address: string | null
  phase: Phase
  chance: number | null
  value_cents: number | null
  next_action: string | null
  next_action_on: string | null
  intake_ref: string | null
  archived_at: string | null
  created_at: string
}

const PROJECT_COLS =
  "id, client_id, name, address, phase, chance, value_cents, next_action, next_action_on, intake_ref, archived_at, created_at"

/** Every project, with the household's name, newest first. */
export async function listProjects(): Promise<
  (AdminProjectRow & { client_name: string | null })[] | null
> {
  const db = serviceClient()
  if (!db) return null
  const { data, error } = await db
    .from("projects")
    .select(`${PROJECT_COLS}, clients ( name )`)
    .order("created_at", { ascending: false })
  if (error) return null
  // `clients` comes back as an ARRAY even though the foreign key makes
  // it at most one row — that is how supabase-js types an embedded
  // relation, and writing `row.clients?.name` compiles against a
  // hand-written type while reading `undefined` at runtime. Take the
  // first, and let the type say so.
  type Joined = AdminProjectRow & { clients: { name: string }[] | null }
  return ((data as unknown as Joined[] | null) ?? []).map(({ clients, ...row }) => ({
    ...row,
    client_name: clients?.[0]?.name ?? null,
  }))
}

/**
 * One project and everything hanging off it.
 *
 * Five queries rather than one nested select, and that is a deliberate
 * trade. A single `select` with four embedded relations returns one
 * object shaped by PostgREST's naming rules, and every one of those
 * lists then has to be re-sorted client-side anyway because embedded
 * rows do not carry the parent's ordering. Five plain queries each say
 * what they order by, which is the part that matters when `position` is
 * the content.
 */
export async function readProject(id: string): Promise<{
  project: AdminProjectRow
  points: { id: string; position: number; body: string }[]
  steps: {
    id: string
    position: number
    label: string
    due_on: string | null
    status: StepStatus
  }[]
  asks: {
    id: string
    position: number
    label: string
    received_at: string | null
  }[]
  terms: {
    id: string
    position: number
    label: string
    amount_cents: number
    status: TermStatus
    due_on: string | null
    document_id: string | null
  }[]
} | null> {
  const db = serviceClient()
  if (!db) return null

  const { data: project, error } = await db
    .from("projects")
    .select(PROJECT_COLS)
    .eq("id", id)
    .maybeSingle()
  if (error || !project) return null

  const [points, steps, asks, terms] = await Promise.all([
    db
      .from("project_points")
      .select("id, position, body")
      .eq("project_id", id)
      .order("position"),
    db
      .from("project_steps")
      .select("id, position, label, due_on, status")
      .eq("project_id", id)
      .order("position"),
    db
      .from("project_asks")
      .select("id, position, label, received_at")
      .eq("project_id", id)
      .order("position"),
    db
      .from("project_terms")
      .select("id, position, label, amount_cents, status, due_on, document_id")
      .eq("project_id", id)
      .order("position"),
  ])

  // Any child query failing means an incomplete project, and an
  // incomplete project rendered as a complete one is a sheet that quietly
  // drops an instalment. Refuse the whole read instead.
  if (points.error || steps.error || asks.error || terms.error) return null

  return {
    project: project as AdminProjectRow,
    points: (points.data ?? []) as { id: string; position: number; body: string }[],
    steps: (steps.data ?? []) as {
      id: string
      position: number
      label: string
      due_on: string | null
      status: StepStatus
    }[],
    asks: (asks.data ?? []) as {
      id: string
      position: number
      label: string
      received_at: string | null
    }[],
    terms: (terms.data ?? []) as {
      id: string
      position: number
      label: string
      amount_cents: number
      status: TermStatus
      due_on: string | null
      document_id: string | null
    }[],
  }
}

export async function createProject(input: {
  clientId: string
  name: string
  address?: string | null
  intakeRef?: string | null
}): Promise<AdminProjectRow | null> {
  const db = serviceClient()
  if (!db) return null
  const { data, error } = await db
    .from("projects")
    .insert({
      client_id: input.clientId,
      name: input.name.trim().slice(0, 200) || "Naamloos",
      address: input.address?.trim().slice(0, 300) || null,
      intake_ref: input.intakeRef?.trim().slice(0, 120) || null,
    })
    .select(PROJECT_COLS)
    .maybeSingle()
  if (error || !data) return null
  return data as AdminProjectRow
}

/**
 * Update the project's own fields.
 *
 * Only the keys actually given are written. A PATCH that sent every
 * column would let a stale browser tab blank a next action somebody set
 * on their phone five minutes ago — the same class of loss
 * `linkSubmission` re-reads the record to avoid.
 */
export async function updateProject(
  id: string,
  patch: {
    name?: string
    address?: string | null
    phase?: Phase
    chance?: number | null
    valueCents?: number | null
    nextAction?: string | null
    nextActionOn?: string | null
    intakeRef?: string | null
    archived?: boolean
  }
): Promise<AdminProjectRow | null> {
  const db = serviceClient()
  if (!db) return null

  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name.trim().slice(0, 200) || "Naamloos"
  if (patch.address !== undefined) row.address = patch.address?.trim().slice(0, 300) || null
  if (patch.phase !== undefined) row.phase = patch.phase
  if (patch.chance !== undefined) row.chance = clampChance(patch.chance)
  if (patch.valueCents !== undefined) row.value_cents = wholeCents(patch.valueCents)
  if (patch.nextAction !== undefined)
    row.next_action = patch.nextAction?.trim().slice(0, 500) || null
  if (patch.nextActionOn !== undefined) row.next_action_on = patch.nextActionOn || null
  if (patch.intakeRef !== undefined)
    row.intake_ref = patch.intakeRef?.trim().slice(0, 120) || null
  if (patch.archived !== undefined)
    row.archived_at = patch.archived ? new Date().toISOString() : null

  if (Object.keys(row).length === 0) return readOwn(db, id)

  const { data, error } = await db
    .from("projects")
    .update(row)
    .eq("id", id)
    .select(PROJECT_COLS)
    .maybeSingle()
  if (error || !data) return null
  return data as AdminProjectRow
}

async function readOwn(
  db: NonNullable<ReturnType<typeof serviceClient>>,
  id: string
): Promise<AdminProjectRow | null> {
  const { data, error } = await db
    .from("projects")
    .select(PROJECT_COLS)
    .eq("id", id)
    .maybeSingle()
  if (error || !data) return null
  return data as AdminProjectRow
}

/**
 * Replace one of a project's lists wholesale.
 *
 * Delete-then-insert rather than a diff, and the reason is `position`:
 * these are hand-ordered lists, so a reorder changes every row's index
 * and a diff would be four writes pretending to be one. Inside a single
 * project this is cheap — a planning is five rows, not five thousand.
 *
 * The delete is scoped to `project_id`, so a bug here can empty one
 * project's planning and can never reach another's.
 */
export async function replaceChildren(
  projectId: string,
  table: "project_points" | "project_steps" | "project_asks" | "project_terms",
  rows: Record<string, unknown>[]
): Promise<boolean> {
  const db = serviceClient()
  if (!db) return false

  const { error: cleared } = await db.from(table).delete().eq("project_id", projectId)
  if (cleared) return false
  if (rows.length === 0) return true

  const { error } = await db
    .from(table)
    .insert(rows.map((r, i) => ({ ...r, project_id: projectId, position: i })))
  return !error
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = serviceClient()
  if (!db) return false
  // The children go with it: every child table declares
  // `on delete cascade`, so this is one statement and not five.
  const { error } = await db.from("projects").delete().eq("id", id)
  return !error
}

/* ─────────────────────────────────────────────────────── helpers */

function clampChance(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value)) return null
  return Math.min(100, Math.max(0, Math.round(value)))
}

/**
 * Cents, as a whole number, always.
 *
 * A browser sends `14500.5` if somebody types euros into a field the
 * form thought held cents, and Postgres would refuse a bigint with a
 * fraction — which surfaces as a failed save with no explanation rather
 * than a rounded amount. Rounding here makes the failure impossible
 * instead of merely unlikely.
 */
function wholeCents(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (!Number.isFinite(value)) return null
  return Math.round(value)
}

/** The shape `werkbank.ts` reasons about, from the rows above. */
export function toWerkbank(
  full: NonNullable<Awaited<ReturnType<typeof readProject>>>,
  clientName: string | null
): WerkbankProject {
  return {
    id: full.project.id,
    name: full.project.name,
    clientName,
    phase: full.project.phase,
    chance: full.project.chance,
    valueCents: full.project.value_cents,
    nextAction: full.project.next_action,
    nextActionOn: full.project.next_action_on,
    steps: full.steps.map((s) => ({
      label: s.label,
      dueOn: s.due_on,
      status: s.status,
    })),
    terms: full.terms.map((t) => ({
      label: t.label,
      amountCents: t.amount_cents,
      status: t.status,
      dueOn: t.due_on,
    })),
    asks: full.asks.map((a) => ({ label: a.label, receivedAt: a.received_at })),
  }
}

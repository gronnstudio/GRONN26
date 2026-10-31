import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import {
  deleteProject,
  readProject,
  replaceChildren,
  updateProject,
} from "@/lib/project-admin"
import type { Phase, StepStatus, TermStatus } from "@/lib/werkbank"

const PHASES: Phase[] = [
  "aanvraag",
  "intake",
  "offerte",
  "akkoord",
  "uitvoering",
  "opgeleverd",
  "onderhoud",
]
const STEP_STATUS: StepStatus[] = ["open", "bezig", "klaar"]
const TERM_STATUS: TermStatus[] = ["open", "gefactureerd", "betaald"]

// A date field is either a `YYYY-MM-DD` string or nothing. Anything else
// is refused here rather than handed to Postgres, so a typo comes back
// as "bad date" instead of a 503 that looks like an outage.
function dateOrNull(v: unknown): string | null | undefined {
  if (v === undefined) return undefined
  if (v === null || v === "") return null
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return undefined
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { id } = await params
  const full = await readProject(id)
  if (!full) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, ...full }, {
    headers: { "Cache-Control": "no-store" },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 })
  }
  const input = body as Record<string, unknown>

  if (input.phase !== undefined && !PHASES.includes(input.phase as Phase)) {
    return NextResponse.json({ ok: false, error: "bad phase" }, { status: 400 })
  }

  const project = await updateProject(id, {
    name: typeof input.name === "string" ? input.name : undefined,
    address: input.address === undefined ? undefined : String(input.address ?? ""),
    phase: input.phase as Phase | undefined,
    chance:
      input.chance === undefined
        ? undefined
        : input.chance === null
          ? null
          : Number(input.chance),
    valueCents:
      input.valueCents === undefined
        ? undefined
        : input.valueCents === null
          ? null
          : Number(input.valueCents),
    nextAction:
      input.nextAction === undefined ? undefined : String(input.nextAction ?? ""),
    nextActionOn: dateOrNull(input.nextActionOn),
    intakeRef: input.intakeRef === undefined ? undefined : String(input.intakeRef ?? ""),
    archived: typeof input.archived === "boolean" ? input.archived : undefined,
  })
  if (!project) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }

  // The lists are replaced wholesale when given, and left alone when
  // absent — so a PATCH that only moves a phase cannot empty a planning
  // it never mentioned.
  if (Array.isArray(input.points)) {
    const rows = (input.points as unknown[])
      .map((p) => String((p as { body?: unknown })?.body ?? "").trim().slice(0, 400))
      .filter(Boolean)
      .map((body) => ({ body }))
    if (!(await replaceChildren(id, "project_points", rows))) {
      return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
    }
  }

  if (Array.isArray(input.steps)) {
    const rows = (input.steps as Record<string, unknown>[])
      .filter((s) => String(s?.label ?? "").trim())
      .map((s) => ({
        label: String(s.label).trim().slice(0, 300),
        due_on: dateOrNull(s.dueOn) ?? null,
        status: STEP_STATUS.includes(s.status as StepStatus)
          ? (s.status as StepStatus)
          : "open",
      }))
    if (!(await replaceChildren(id, "project_steps", rows))) {
      return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
    }
  }

  if (Array.isArray(input.asks)) {
    const rows = (input.asks as Record<string, unknown>[])
      .filter((a) => String(a?.label ?? "").trim())
      .map((a) => ({
        label: String(a.label).trim().slice(0, 300),
        received_at: a.receivedAt ? new Date(String(a.receivedAt)).toISOString() : null,
      }))
    if (!(await replaceChildren(id, "project_asks", rows))) {
      return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
    }
  }

  if (Array.isArray(input.terms)) {
    const rows = (input.terms as Record<string, unknown>[])
      .filter((t) => String(t?.label ?? "").trim())
      .map((t) => ({
        label: String(t.label).trim().slice(0, 300),
        // Rounded here as well as in the lib: Postgres refuses a bigint
        // with a fraction, and that surfaces as a failed save with no
        // explanation rather than a rounded amount.
        amount_cents: Math.round(Number(t.amountCents) || 0),
        status: TERM_STATUS.includes(t.status as TermStatus)
          ? (t.status as TermStatus)
          : "open",
        due_on: dateOrNull(t.dueOn) ?? null,
        document_id: t.documentId ? String(t.documentId).slice(0, 120) : null,
      }))
    if (!(await replaceChildren(id, "project_terms", rows))) {
      return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
    }
  }

  const full = await readProject(id)
  if (!full) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, ...full })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { id } = await params
  if (!(await deleteProject(id))) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}

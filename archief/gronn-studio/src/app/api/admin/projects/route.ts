import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import { createProject, listProjects } from "@/lib/project-admin"

// The owner's projects. Read the list, or start one.
//
// `getOwnerSession` and never `getClientUser` — `client-portal.spec.ts`
// walks every route under /api/admin and asserts exactly that, because a
// presence check ("somebody is signed in") would hand the studio's whole
// pipeline to any client who registered.

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const projects = await listProjects()
  // Null is "no database, or it did not answer" — 503, never an empty
  // list. A panel that says "no projects" during an outage is a panel
  // that lies at the worst possible moment.
  if (projects === null) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, projects }, {
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  if (typeof input?.clientId !== "string" || !input.clientId.trim()) {
    return NextResponse.json({ ok: false, error: "clientId required" }, { status: 400 })
  }
  if (typeof input?.name !== "string" || !input.name.trim()) {
    return NextResponse.json({ ok: false, error: "name required" }, { status: 400 })
  }

  const project = await createProject({
    clientId: input.clientId.trim(),
    name: input.name,
    address: typeof input.address === "string" ? input.address : null,
    intakeRef: typeof input.intakeRef === "string" ? input.intakeRef : null,
  })
  if (!project) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, project })
}

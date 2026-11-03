import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import { createClient, listClients } from "@/lib/client-admin"

// The studio's own list of dossiers, and the way a new one is made.
//
// Owner-gated by `getOwnerSession`, which answers for Nick alone — not
// by a presence check, and never reachable with a client session. What
// sits behind it is every household's name, address and phone number.
//
// A dossier is created HERE and nowhere else: registration cannot make
// one. That asymmetry is the design, not an omission — a form that could
// invent a client row would let an enquiry decide who the studio's
// clients are.

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const clients = await listClients()
  if (!clients) {
    // No database, or it did not answer. Reported as its own state so
    // the panel can say "de database antwoordde niet" rather than
    // drawing an empty list over a studio that has clients.
    return NextResponse.json({ ok: false, error: "no database" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, clients })
}

export async function POST(request: Request) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  let body: { name?: unknown; email?: unknown; phone?: unknown; note?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (!name) {
    return NextResponse.json({ ok: false, error: "name required" }, { status: 400 })
  }

  const client = await createClient({
    name,
    email: typeof body.email === "string" ? body.email : null,
    phone: typeof body.phone === "string" ? body.phone : null,
    note: typeof body.note === "string" ? body.note : null,
  })
  if (!client) {
    return NextResponse.json({ ok: false, error: "create failed" }, { status: 503 })
  }
  return NextResponse.json({ ok: true, client })
}

import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import { linkSubmission } from "@/lib/intake-archive"
import { safeReference } from "@/lib/intake-reference"

// Attach one enquiry to one dossier — the join the archive has carried a
// field for since it was written, with nothing to set it.
//
// It is an owner action and only an owner action. `IntakeSubmission`
// says why in the comment on `clientId`: the contact field is free text
// that often holds a phone number, so nothing can infer this, and
// attaching one household's garden to another is precisely the failure
// the portal exists to prevent. A person decides; this records it.
//
// `clientId: null` detaches, which matters more than it looks — the
// first thing anyone does after a mis-link is undo it.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { reference: raw } = await params
  const reference = safeReference(decodeURIComponent(raw))

  let body: { clientId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 })
  }

  const clientId =
    typeof body.clientId === "string" && body.clientId.trim()
      ? body.clientId.trim()
      : null

  try {
    const record = await linkSubmission(reference, clientId)
    if (!record) {
      // No record under that reference. An orphan folder has files and
      // no submission, and there is nothing there to carry a link.
      return NextResponse.json({ ok: false, error: "no record" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, clientId: record.clientId ?? null })
  } catch {
    return NextResponse.json({ ok: false, error: "link failed" }, { status: 503 })
  }
}

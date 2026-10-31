import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import { deleteSubmission, setDeleted } from "@/lib/intake-archive"
import { safeReference } from "@/lib/intake-reference"

// One enquiry: into the drain, back out of it, or gone for good.
//
// PATCH is the reversible half and the one the panel's button now calls.
// DELETE is the floor of the drain: it removes the record and every
// photograph with it, and there is no undo, because the blobs are the
// only copy the studio has of somebody's garden.
//
// The two are separate verbs on purpose. When the button did the second
// thing, one click stood between a mis-aimed cursor and a client's
// enquiry; now the destructive step is reached only from the drain, in
// front of a count of what it will destroy.

// Into the drain, or back out of it.
//
// Reversible on both sides: the record is rewritten with a timestamp
// added or removed and nothing else, so an enquiry that comes back comes
// back whole — the answers, the file list, the dossier link.
//
// A missing or unreadable body means `deleted: true`, because that is
// what the panel's button sends and a coin-flip default here would be
// the worst of the two.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { reference: raw } = await params
  const reference = safeReference(decodeURIComponent(raw))
  if (!reference) {
    return NextResponse.json({ ok: false, error: "bad reference" }, { status: 400 })
  }

  let deleted = true
  try {
    const body: unknown = await request.json()
    const value = (body as { deleted?: unknown } | null)?.deleted
    if (typeof value === "boolean") deleted = value
  } catch {
    // No body means "into the drain", which is what the button sends.
  }

  try {
    const record = await setDeleted(reference, deleted, new Date().toISOString())
    if (!record) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true, deleted })
  } catch {
    return NextResponse.json({ ok: false, error: "write failed" }, { status: 503 })
  }
}

// Delete one enquiry, record and files together — the floor of the drain.
//
// Reached only from /dashboard/afvoerputje, and only from a row that is
// already out of the list. Three things guard it, because this is the
// single irreversible action in the whole panel:
//
//  · `getOwnerSession`, not "is anyone signed in" — the distinction
//    `lib/auth.ts` exists to keep. A client session must never reach it.
//  · DELETE rather than POST. It is not reachable by a form submit or by
//    a link somebody follows, which matters for an action with no undo.
//  · The reference is normalised here and normalised again inside
//    `deleteSubmission`, which rebuilds the folder from it rather than
//    trusting a path. A caller cannot widen this to a prefix.
//
// There is deliberately no "delete all". Every call names one enquiry.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const { reference: raw } = await params
  const reference = safeReference(decodeURIComponent(raw))
  if (!reference) {
    return NextResponse.json({ ok: false, error: "bad reference" }, { status: 400 })
  }

  try {
    const removed = await deleteSubmission(reference)
    // Nothing there is reported as such rather than as a success. The
    // owner pressing delete on a row that is already gone should be told
    // it was already gone, not shown a confirmation that invents an act.
    return NextResponse.json({ ok: true, removed })
  } catch {
    return NextResponse.json(
      { ok: false, error: "delete failed" },
      { status: 503 }
    )
  }
}

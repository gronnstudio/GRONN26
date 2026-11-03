import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import {
  ArchiveConflict,
  readDocuments,
  writeDocuments,
} from "@/lib/document-archive"
import { isDocument, normalize } from "@/lib/documents"

// The studio's quotes and invoices, read and written by the owner panel.
//
// Gated on the same single-address Google sign-on as everything else
// under /admin, and checked here rather than only in the page: a route
// that trusts the page in front of it is not gated at all. An
// unauthenticated request never receives a document, a client name or an
// amount.

export async function GET() {
  const session = await getOwnerSession()
  if (!session) return new NextResponse("unauthorized", { status: 401 })

  const archive = await readDocuments()
  // A read that failed is a 503, not an empty administration. The panel
  // keeps what it has and says the archive could not be reached, instead
  // of showing the owner a blank list of his own invoices.
  if (archive.status !== "ok") {
    return NextResponse.json(
      { error: "storage unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
  return NextResponse.json(archive, {
    // The panel is the only reader and it wants what is actually stored,
    // not what a CDN remembers from the last tab.
    headers: { "Cache-Control": "no-store" },
  })
}

export async function PUT(request: Request) {
  const session = await getOwnerSession()
  if (!session) return new NextResponse("unauthorized", { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const raw = (body as { documents?: unknown } | null)?.documents
  if (!Array.isArray(raw)) {
    return NextResponse.json({ error: "documents must be an array" }, { status: 400 })
  }

  // Validated before it is written, not after it is read back. A blob
  // that fails the structural check is a blob the panel would silently
  // drop on the next load — better to refuse the write and let the
  // client keep what it has.
  if (!raw.every(isDocument)) {
    return NextResponse.json(
      { error: "one or more documents are malformed" },
      { status: 422 }
    )
  }

  // The version the client read before it started typing. When present
  // the write is conditional: a second tab that saved in the meantime
  // wins, and this one is told to catch up rather than silently
  // replacing work it never saw.
  const version = (body as { version?: unknown } | null)?.version
  const conditional = typeof version === "string" && version ? version : undefined

  // An UNCONDITIONAL write over an archive that already exists is
  // refused. This is the server half of the guard in `writeDocuments`,
  // and it is here because the client half can only protect the clients
  // that carry it — a stale tab, a replayed request or a future caller
  // that forgets is exactly the case worth surviving.
  //
  // A missing version means the writer never successfully read. Letting
  // that through is how one blank draft replaced an entire year of
  // quotes and invoices, with the numbering restarted underneath it.
  // An empty archive still accepts a first write; there is nothing to
  // lose and this is how the very first document gets saved.
  if (!conditional) {
    const existing = await readDocuments()
    if (existing.status === "unavailable") {
      return NextResponse.json({ error: "storage unavailable" }, { status: 503 })
    }
    if (existing.documents.length > 0) {
      return NextResponse.json(
        { error: "archive changed since it was read" },
        { status: 409 }
      )
    }
  }

  try {
    const saved = await writeDocuments(
      raw.map(normalize),
      conditional
    )
    return NextResponse.json({ ok: true, ...saved })
  } catch (error) {
    if (error instanceof ArchiveConflict) {
      return NextResponse.json(
        { error: "archive changed since it was read" },
        { status: 409 }
      )
    }
    // The client keeps its own copy and shows that the save failed, so
    // nothing is lost by answering honestly here.
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 })
  }
}

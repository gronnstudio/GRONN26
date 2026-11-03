import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import { readArchive, reattachOrphan } from "@/lib/intake-archive"

// Reattach files that lost their record.
//
// The browser and the server used to spell an intake's folder name
// differently (see `src/lib/intake-reference.ts`), so for five of every
// nine realistic project names the photographs landed in one folder and
// the submission in another. The record then said "0 bestanden" while
// the files sat intact a directory away.
//
// This repairs that. Nothing is moved and nothing is deleted: the blobs
// stay exactly where they are and only the record's file list grows, so
// the worst case of running it is that it finds nothing to do. The owner
// asks for it explicitly rather than it happening on read, because a
// repair that runs silently is indistinguishable from a bug.
export async function POST(request: Request) {
  const session = await getOwnerSession()
  if (!session) return new NextResponse("unauthorized", { status: 401 })

  let wanted: string | null = null
  try {
    const body: unknown = await request.json()
    const value = (body as { reference?: unknown } | null)?.reference
    if (typeof value === "string") wanted = value
  } catch {
    // No body: repair everything that is repairable.
  }

  const archive = await readArchive()
  if (archive.status !== "ok") {
    return NextResponse.json(
      { ok: false, error: "archive unavailable" },
      { status: 503 }
    )
  }

  const targets = wanted
    ? archive.orphans.filter((o) => o.reference === wanted)
    : archive.orphans
  if (targets.length === 0) {
    return NextResponse.json({ ok: true, repaired: 0, files: 0 })
  }

  const now = new Date().toISOString()
  let repaired = 0
  let files = 0
  for (const orphan of targets) {
    try {
      const record = await reattachOrphan(orphan, now)
      if (record) {
        repaired += 1
        files += orphan.files.length
      }
    } catch {
      // One folder that will not read must not cost the others their
      // repair. The count reported back is what actually happened.
    }
  }

  return NextResponse.json({ ok: true, repaired, files })
}

import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import {
  writeSubmission,
  type IntakeFile,
  type IntakeSubmission,
} from "@/lib/intake-archive"
import { isMintedReference, ownedBy, safeReference } from "@/lib/intake-reference"

// An intake the STUDIO typed, not one a visitor sent.
//
// A sibling of /api/intake rather than a branch inside it, and the
// difference between them is entirely the notification half:
//
//  · No Slack post. The owner just typed this; telling them it arrived
//    is noise, and the link in that message points at the panel they are
//    standing in.
//  · No doorbell e-mail. This is the one that actually mattered. With no
//    webhook configured — today's setup — every visitor submission takes
//    the FormSubmit path, so mounting the visitor form in the panel
//    unchanged would have e-mailed hello@gronn.studio to announce an
//    intake to the person who had just finished typing it. Worse, the
//    archive-failed branch of that path sends the whole transcript, a
//    client's address and 36 answers about their home, to a third party.
//  · `clientId` is accepted here and nowhere else. On the phone the
//    owner knows whose garden this is, which is the one moment that fact
//    is trustworthy — `IntakeSubmission` has carried the field since it
//    was written precisely because it must never be inferred from the
//    free-text contact line.
//
// What it shares with the visitor route is everything that matters for
// the record: the same `writeSubmission`, the same folder arithmetic,
// the same allowlisting of files against the reference. An intake typed
// here is indistinguishable from a submitted one in the archive, which
// is the point — /dashboard/intakes reads them all the same way.

const MAX_FILES = 24

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

/** Only files that actually live under this submission's folder. */
function ownFiles(value: unknown, reference: string): IntakeFile[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map((f) => ({
      pathname: text(f.pathname, 400),
      access: f.access === "public" ? ("public" as const) : ("private" as const),
      url:
        f.access === "public" &&
        typeof f.url === "string" &&
        f.url.startsWith("https://")
          ? f.url.slice(0, 600)
          : undefined,
      name: text(f.name, 200),
      category: text(f.category, 40),
      contentType: text(f.contentType, 100),
      size: typeof f.size === "number" && Number.isFinite(f.size) ? f.size : 0,
    }))
    .filter((f) => ownedBy(f.pathname, reference))
    .slice(0, MAX_FILES)
}

export async function POST(request: Request) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  let payload: Record<string, unknown>
  try {
    payload = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 })
  }

  const sent = text(payload.reference, 120)
  const minted = isMintedReference(sent)
  const reference = minted ? sent : safeReference(sent)
  const transcript = text(payload.transcript, 40_000)
  if (!transcript) {
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 })
  }

  const submission: IntakeSubmission = {
    reference,
    ...(minted ? { id: reference } : {}),
    // Stamped here, like the visitor route. It now means "typed at"
    // rather than "received at", which is the honest reading either way:
    // it is when this became a record.
    receivedAt: new Date().toISOString(),
    name: text(payload.name, 200),
    contact: text(payload.contact, 200),
    project: text(payload.project, 200),
    transcript,
    files: ownFiles(payload.files, reference),
    filesFailed:
      typeof payload.filesFailed === "number" &&
      Number.isFinite(payload.filesFailed)
        ? Math.max(0, Math.min(99, Math.trunc(payload.filesFailed)))
        : 0,
    filesFailedReasons: Array.isArray(payload.filesFailedReasons)
      ? payload.filesFailedReasons
          .filter((r): r is string => typeof r === "string")
          .slice(0, 8)
          .map((r) => r.slice(0, 300))
      : undefined,
    // Nothing was relayed anywhere, and saying "none" is the truth
    // rather than a fallback: there was nobody to tell.
    relay: "none",
    ...(typeof payload.clientId === "string" && payload.clientId.trim()
      ? { clientId: payload.clientId.trim() }
      : {}),
  }

  try {
    await writeSubmission(submission)
  } catch {
    // The panel keeps the draft in localStorage, so the owner's typing is
    // not gone — but they must be told, because unlike a visitor they
    // have no e-mail fallback behind them.
    return NextResponse.json(
      { ok: false, error: "archive failed" },
      { status: 503 }
    )
  }

  return NextResponse.json({ ok: true, reference })
}

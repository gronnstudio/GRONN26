import { NextResponse } from "next/server"

import { SITE_URL } from "@/lib/seo"
import { writeSubmission, type IntakeFile, type IntakeSubmission } from "@/lib/intake-archive"
import { isMintedReference, ownedBy, safeReference } from "@/lib/intake-reference"

// The intake submission: archived first, announced second.
//
// It used to be announcement only. With no Slack webhook configured this
// route answered "nowhere to put this" and the browser mailed the studio
// instead — which worked, but meant a submission existed only as an
// email. Lose the mail and the photographs were still in storage with no
// answers beside them and nothing saying whose garden they were.
//
// So the order is now: write the record, then try to ring the bell. The
// archive is what /dashboard/intakes reads, and it happens whether or not
// anything is configured to notify anyone.
//
// Slack rather than a CRM, and server-side rather than from the browser.
// Both halves matter:
//
//  · A webhook URL is a secret. In the client bundle anyone could read
//    it out and post into the studio's channel — the same class of
//    mistake as the IBAN that shipped in the bundle until #89.
//  · The reason the FormSubmit relay had to be deleted in July does NOT
//    apply here. FormSubmit answers 403 to datacenter IPs, which is why
//    that transport has to run in the visitor's browser. Slack has no
//    such rule, so a server-to-server post is the right shape.
//
// A CRM was considered and is not this. Every free tier ships a tracking
// script that sets its own cookies, and OPERATIONS.md §1 requires the
// cookie notice back before any such embed. That notice is on ice by the
// owner's decision, so a CRM is a decision about the notice first and an
// intake transport second.

const MAX_BODY = 256 * 1024
const MAX_FILES = 24

type Payload = {
  reference?: unknown
  name?: unknown
  contact?: unknown
  project?: unknown
  transcript?: unknown
  files?: unknown
  filesFailed?: unknown
  filesFailedReasons?: unknown
}

/** A string, trimmed and capped. Anything else becomes "". */
function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

/**
 * Only files this deployment actually took, named by pathname.
 *
 * The submission names its own attachments, so an unchecked list would
 * let anyone put arbitrary paths into the studio's archive — and the
 * admin route that serves these reads by pathname, so a `..` here is a
 * way out of the prefix. Both are refused.
 */
function ownFiles(value: unknown, reference: string): IntakeFile[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
    .map((f) => ({
      pathname: text(f.pathname, 400),
      // Only the two values the panel knows how to serve; anything else
      // is treated as the safer one.
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
    // One shared implementation of "does this path belong to this
    // submission", in the module both the browser and the server import.
    // Two subtly different answers to that question is what silently
    // dropped every file on five of nine realistic project names.
    .filter((f) => ownedBy(f.pathname, reference))
    .slice(0, MAX_FILES)
}

export async function POST(request: Request) {
  // `content-length` is a claim the client makes about itself — it can
  // be omitted entirely — so this is an early-out, not the enforcement.
  // The enforcement is the cap on every field below, which holds however
  // large the body turns out to be.
  const claimed = Number(request.headers.get("content-length"))
  if (Number.isFinite(claimed) && claimed > MAX_BODY) {
    return NextResponse.json({ ok: false, error: "too large" }, { status: 413 })
  }

  let payload: Payload
  try {
    payload = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 })
  }

  // A reference minted by /api/intake/start is taken verbatim: it is
  // already a safe path segment, and normalising it again is precisely
  // the second transform that used to disagree with the browser's. A
  // reference from an older bundle still gets slugged, so a form loaded
  // before this deploy keeps working.
  const sent = text(payload.reference, 120)
  const minted = isMintedReference(sent)
  const reference = minted ? sent : safeReference(sent)
  const transcript = text(payload.transcript, 40_000)
  if (!transcript) {
    return NextResponse.json({ ok: false, error: "empty" }, { status: 400 })
  }

  const submission: IntakeSubmission = {
    reference,
    // Only a server-minted reference is an identity; a slug of what the
    // visitor typed is a label that two people can share.
    ...(minted ? { id: reference } : {}),
    // Stamped here, not by the visitor: a device clock can be anything,
    // and the archive sorts on this.
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
    relay: "none",
  }

  const webhook = process.env.SLACK_WEBHOOK_URL
  submission.relay = webhook ? "slack" : "none"

  // The archive first. If this fails the submission did not happen, and
  // the browser needs to know so it can fall back to email rather than
  // tell the visitor their evening's work arrived.
  try {
    await writeSubmission(submission)
  } catch {
    return NextResponse.json(
      { ok: false, error: "archive failed" },
      { status: 503 }
    )
  }

  if (!webhook) {
    // Archived, but nothing will tell the studio it happened. The
    // browser sends the doorbell by email in this case — so it is told
    // plainly rather than left to guess from a bare success.
    return NextResponse.json({ ok: true, relay: "none", reference })
  }

  const inbox = `${SITE_URL}/dashboard/intakes`
  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `Intake — ${reference}`.slice(0, 150) },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: [
            submission.name ? `*${submission.name}*` : "_no name given_",
            submission.contact || "_no contact given_",
            submission.files.length
              ? `${submission.files.length} file${submission.files.length === 1 ? "" : "s"}`
              : "no files",
          ].join("  ·  "),
        },
      ],
    },
    // The transcript is not pasted into Slack. It is forty questions
    // long, Slack caps a section at 3000 characters, and the archive is
    // now the place it lives — so this is a doorbell with a doorway,
    // not a copy of the letter.
    {
      type: "section",
      text: { type: "mrkdwn", text: `<${inbox}|Open it in the owner panel>` },
    },
  ]

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `Intake — ${reference}`, blocks }),
    })
    if (!res.ok) throw new Error("slack_refused")
    return NextResponse.json({ ok: true, relay: "slack", reference })
  } catch {
    // Archived but not announced. Not a failure of the submission, so
    // the visitor is not told one — but the browser should still send
    // the email, which is what `relay: "none"` means to it.
    return NextResponse.json({ ok: true, relay: "none", reference })
  }
}

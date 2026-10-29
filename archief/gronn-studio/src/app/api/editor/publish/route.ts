import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { put, type PutBlobResult } from "@vercel/blob"

import { getOwnerSession } from "@/lib/auth"
import type { SiteContent } from "@/lib/content-types"

// Publish: draft document -> Vercel Blob -> tag revalidation. Live in
// seconds. Every publish also snapshots to backups/<timestamp>.json so
// there is always a history to restore from.
const CONTENT_PATH = "content/site-content.json"

function isL(v: unknown): boolean {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).en === "string" &&
    typeof (v as Record<string, unknown>).nl === "string"
  )
}

function validate(content: SiteContent): string | null {
  if (typeof content !== "object" || content === null) return "not an object"
  const { siteCopy, projects, articles, services } = content
  if (!siteCopy || !isL(siteCopy.heroSubtitle)) return "siteCopy malformed"
  if (!Array.isArray(projects) || projects.length === 0) return "projects missing"
  if (!Array.isArray(articles) || articles.length === 0) return "articles missing"
  if (!Array.isArray(services) || services.length === 0) return "services missing"
  for (const p of projects) {
    if (typeof p.slug !== "string" || !isL(p.title)) return `project malformed: ${p.slug}`
  }
  for (const a of articles) {
    if (typeof a.slug !== "string" || !isL(a.title)) return `article malformed: ${a.slug}`
  }
  for (const s of services) {
    if (typeof s.slug !== "string" || !isL(s.title)) return `service malformed: ${s.slug}`
  }
  return null
}

export async function POST(request: Request) {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  let content: SiteContent
  try {
    content = (await request.json()).content as SiteContent
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const problem = validate(content)
  if (problem) return NextResponse.json({ error: problem }, { status: 422 })

  const body = JSON.stringify(content, null, 2)

  // Public blobs when the store allows them (CDN-served); private
  // otherwise — getContent() reads both.
  const putEither = async (path: string): Promise<PutBlobResult> => {
    try {
      return await put(path, body, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      })
    } catch {
      return await put(path, body, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      })
    }
  }

  const blob = await putEither(CONTENT_PATH)
  // Automatic history — timestamped snapshot per publish.
  await putEither(
    `backups/site-content-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  )

  // Route Handler called from the editor: immediate expiry per Next 16
  // docs (updateTag is Server-Action-only).
  revalidateTag("content", { expire: 0 })

  return NextResponse.json({ ok: true, url: blob.url })
}

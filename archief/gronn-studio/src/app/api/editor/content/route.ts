import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"
import { getContent } from "@/lib/content"

// The editor's draft base: the currently-published content document.
// Auth-gated so the endpoint reveals nothing a visitor couldn't already
// read off the pages — but also costs visitors nothing (never called
// without the sign-in hint).
export async function GET() {
  const session = await getOwnerSession()
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  return NextResponse.json(await getContent(), {
    headers: { "Cache-Control": "no-store" },
  })
}

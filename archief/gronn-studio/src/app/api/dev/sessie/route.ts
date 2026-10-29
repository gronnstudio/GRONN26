import { NextResponse } from "next/server"

import { getOwnerSession } from "@/lib/auth"

// DEV-laag: is deze browser de eigenaar? Het antwoord komt ALLEEN uit de
// NextAuth-sessie (getOwnerSession, src/lib/auth.ts) — nooit uit een
// query, cookie-waarde, body of localStorage. Geeft niets prijs: een
// bezoeker krijgt `{ eigenaar: false }` en verder niets.
export const dynamic = "force-dynamic"

export async function GET() {
  const eigenaar = (await getOwnerSession()) !== null
  return NextResponse.json({ eigenaar }, { headers: { "Cache-Control": "no-store, private" } })
}

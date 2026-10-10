import { NextResponse, type NextRequest } from "next/server"
import { leesStand, nieuweId, opslagAan, schrijfStand } from "@/lib/beheer/stand"

// Het kennismakingsformulier stuurt naast FormSubmit een kopie hierheen, zodat
// de aanvraag in het dashboard staat. Mislukt dit, dan komt de mail nog steeds.
const kort = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n)

export async function POST(request: NextRequest) {
  if (!opslagAan()) return NextResponse.json({ ok: false }, { status: 503 })
  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!b || b.website) return NextResponse.json({ ok: true })
  const naam = kort(b.naam, 80)
  const contact = kort(b.contact, 160)
  const wat = kort(b.wat, 1200)
  if (!naam || !contact) return NextResponse.json({ ok: false }, { status: 400 })
  const s = await leesStand()
  s.aanvragen.unshift({ id: nieuweId(), datum: new Date().toISOString(), naam, contact, wat, bron: "Formulier" })
  await schrijfStand(s)
  return NextResponse.json({ ok: true })
}

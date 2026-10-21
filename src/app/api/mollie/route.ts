import { NextResponse, type NextRequest } from "next/server"
import { leesStand, schrijfStand } from "@/lib/beheer/stand"
import { haalBetaling } from "@/lib/mollie"

// Mollie meldt hier dat een betaling veranderde (alleen een id). De status
// halen we zelf op bij Mollie, zodat niemand een bestelling op betaald kan zetten.
export async function POST(request: NextRequest) {
  const id = String((await request.formData().catch(() => null))?.get("id") ?? "")
  if (!/^tr_\w+$/.test(id)) return new NextResponse(null, { status: 400 })
  const b = await haalBetaling(id)
  if (!b) return new NextResponse(null, { status: 404 })
  const s = await leesStand()
  // Een borderpakket of een cadeaubon; beide houden hun Mollie-id bij.
  const bestelling = s.bestellingen.find((x) => x.mollie === id) ?? s.bonnen.find((x) => x.mollie === id)
  if (!bestelling) return new NextResponse(null, { status: 200 })
  const status = b.status === "paid" ? "betaald" : ["canceled", "expired", "failed"].includes(b.status) ? "mislukt" : "open"
  if (bestelling.status !== status) {
    bestelling.status = status
    await schrijfStand(s)
  }
  return new NextResponse(null, { status: 200 })
}

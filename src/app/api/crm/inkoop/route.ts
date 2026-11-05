import { revalidatePath } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { leesInkoop, wijzigInkoop } from "@/lib/beheer/inkoop"
import { leesKlanten } from "@/lib/beheer/klanten"
import { BESTAND_TYPES, MAX_BESTAND, schoonInkoop } from "@/lib/crm/inkoop"
import { leesCenten, leesBp } from "@/lib/crm/geld"
import { bewaarBestand, leesBestand, opslagAan } from "@/lib/crm/opslag"

// Inkoopfacturen met hun bijlage (PDF of foto). Een route in plaats van een
// server-actie, omdat server-acties bij 1 MB ophouden. Alleen de ingelogde
// eigenaar; bijlagen staan privé onder crm/inkoop/ en gaan nooit openbaar.

const eigenaar = (r: NextRequest) => isEigenaar(r.cookies.get(KOEKJE)?.value)
const MIME = { pdf: "application/pdf", jpg: "image/jpeg", png: "image/png" } as const

export async function POST(request: NextRequest) {
  if (!(await eigenaar(request))) return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 })
  if (!opslagAan()) return NextResponse.json({ fout: "Opslag staat uit" }, { status: 503 })
  const d = await request.formData().catch(() => null)
  if (!d) return NextResponse.json({ fout: "Geen gegevens" }, { status: 400 })
  const v = (k: string) => String(d.get(k) ?? "")

  const bedragInvoer = leesCenten(v("bedrag"))
  const btw = leesBp(v("btw")) ?? 2100
  // Het bedrag komt incl. of excl. btw binnen; bewaard wordt excl. btw (zoals de calculatie).
  const bedrag = bedragInvoer === null ? null : v("metbtw") === "1" ? Math.round((bedragInvoer * 10000) / (10000 + btw)) : bedragInvoer
  const klantId = v("klantId")
  if (klantId && !(await leesKlanten()).some((k) => k.id === klantId)) return NextResponse.json({ fout: "Onbekende klant" }, { status: 400 })

  const bestand = d.get("bestand")
  let bijlage: { ext: "pdf" | "jpg" | "png"; naam: string; inhoud: Buffer } | undefined
  if (bestand instanceof File && bestand.size) {
    const ext = BESTAND_TYPES[bestand.type as keyof typeof BESTAND_TYPES]
    if (!ext || bestand.size > MAX_BESTAND) return NextResponse.json({ fout: "Kies een PDF, JPG of PNG van hooguit 4 MB." }, { status: 400 })
    bijlage = { ext, naam: bestand.name, inhoud: Buffer.from(await bestand.arrayBuffer()) }
  }

  const regel = schoonInkoop({
    id: crypto.randomUUID(),
    datum: v("datum"),
    leverancier: v("leverancier"),
    nummer: v("nummer"),
    omschrijving: v("omschrijving"),
    bedrag,
    btw,
    klantId,
    betaald: v("betaald") === "1",
    vervalt: v("vervalt"),
    ...(bijlage ? { bestand: { ext: bijlage.ext, naam: bijlage.naam } } : {}),
  })
  if (!regel) return NextResponse.json({ fout: "Vul datum, leverancier en bedrag in." }, { status: 400 })
  if (bijlage) await bewaarBestand(`crm/inkoop/${regel.id}.${bijlage.ext}`, bijlage.inhoud, MIME[bijlage.ext])
  await wijzigInkoop((r) => [regel, ...r])
  revalidatePath("/dashboard", "layout")
  return NextResponse.json({ id: regel.id })
}

export async function GET(request: NextRequest) {
  if (!(await eigenaar(request))) return new NextResponse("Niet ingelogd", { status: 401 })
  const id = request.nextUrl.searchParams.get("id") ?? ""
  const regel = (await leesInkoop()).find((r) => r.id === id)
  if (!regel?.bestand) return new NextResponse("Niet gevonden", { status: 404 })
  const stroom = await leesBestand(`crm/inkoop/${regel.id}.${regel.bestand.ext}`)
  if (!stroom) return new NextResponse("Niet gevonden", { status: 404 })
  const naam = regel.bestand.naam.replace(/[^\w.\- ]/g, "_")
  return new NextResponse(stroom, {
    headers: { "Content-Type": MIME[regel.bestand.ext], "Content-Disposition": `inline; filename="${naam}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  })
}

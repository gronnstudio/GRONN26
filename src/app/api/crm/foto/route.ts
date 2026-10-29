import { revalidatePath } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { wijzigKlanten } from "@/lib/beheer/klanten"
import { bewaarBestand, leesBestand, opslagAan } from "@/lib/crm/opslag"

// Foto's bij een tuin (opname, voor, tijdens, na). Privé in Blob onder
// crm/fotos/, alleen te zien en te uploaden door de ingelogde eigenaar. De
// browser verkleint eerst tot hooguit 1600px JPG. Een route in plaats van een
// server-actie, omdat server-acties standaard bij 1 MB ophouden.

const MAX_BYTES = 3_000_000
const ID = /^[0-9a-z-]{1,64}$/
const MOMENTEN = ["Opname", "Voor", "Tijdens", "Na"] as const

const eigenaar = (r: NextRequest) => isEigenaar(r.cookies.get(KOEKJE)?.value)

export async function POST(request: NextRequest) {
  if (!(await eigenaar(request))) return NextResponse.json({ fout: "Niet ingelogd" }, { status: 401 })
  if (!opslagAan()) return NextResponse.json({ fout: "Opslag staat uit" }, { status: 503 })
  const d = await request.formData().catch(() => null)
  const foto = d?.get("foto")
  const klant = String(d?.get("klant") ?? "")
  const tuin = String(d?.get("tuin") ?? "")
  if (!ID.test(klant) || !ID.test(tuin)) return NextResponse.json({ fout: "Onbekende tuin" }, { status: 400 })
  if (!(foto instanceof File) || foto.type !== "image/jpeg" || !foto.size || foto.size > MAX_BYTES)
    return NextResponse.json({ fout: "Kies een foto (JPG, hooguit 3 MB)." }, { status: 400 })
  const momentRuw = String(d?.get("moment") ?? "")
  const moment = (MOMENTEN as readonly string[]).includes(momentRuw) ? (momentRuw as (typeof MOMENTEN)[number]) : "Opname"
  const bijschrift = String(d?.get("bijschrift") ?? "").trim().slice(0, 200)
  const zone = String(d?.get("zone") ?? "")
  // Een beeld uit een video draagt zijn tijdcode (m:ss).
  const tijd = String(d?.get("tijd") ?? "")

  const id = crypto.randomUUID()
  let gevonden = false
  await bewaarBestand(`crm/fotos/${id}.jpg`, Buffer.from(await foto.arrayBuffer()), "image/jpeg")
  await wijzigKlanten((lijst) =>
    lijst.map((k) =>
      k.id !== klant
        ? k
        : {
            ...k,
            tuinen: k.tuinen.map((t) => {
              if (t.id !== tuin) return t
              gevonden = true
              const extra = { ...(t.zones.some((z) => z.id === zone) ? { zone } : {}), ...(/^\d{1,3}:\d{2}$/.test(tijd) ? { tijd } : {}) }
              return { ...t, fotos: [...t.fotos, { id, datum: new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" }), bijschrift, moment, ...extra }] }
            }),
          },
    ),
  )
  if (!gevonden) return NextResponse.json({ fout: "Onbekende tuin" }, { status: 404 })
  revalidatePath("/dashboard/klanten", "layout")
  return NextResponse.json({ id })
}

export async function GET(request: NextRequest) {
  if (!(await eigenaar(request))) return new NextResponse("Niet ingelogd", { status: 401 })
  const id = request.nextUrl.searchParams.get("id") ?? ""
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Niet gevonden", { status: 404 })
  const stroom = await leesBestand(`crm/fotos/${id}.jpg`)
  if (!stroom) return new NextResponse("Niet gevonden", { status: 404 })
  return new NextResponse(stroom, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" } })
}

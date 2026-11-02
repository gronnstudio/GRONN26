import { timingSafeEqual } from "node:crypto"
import { revalidatePath } from "next/cache"
import { leesKlanten } from "@/lib/beheer/klanten"
import { bewaarVersie, type Concept } from "@/lib/crm/bewaar-calculatie"

// Claude laten lezen en calculaties laten bewaren in het CRM (Nick, 2 nov 2026:
// "zorg dat je dingen kan aanpassen"). Alleen met de geheime sleutel
// CRM_CLAUDE_TOKEN (Vercel, minstens 32 tekens); zonder die variabele staat de
// route dicht. Geen telefoon, e-mail of adres in de antwoorden. Schrijven kan
// alleen een nieuwe calculatieversie: oude versies blijven altijd staan.

export const dynamic = "force-dynamic"

function mag(req: Request) {
  const sleutel = process.env.CRM_CLAUDE_TOKEN ?? ""
  const kop = req.headers.get("authorization") ?? ""
  const gegeven = kop.startsWith("Bearer ") ? kop.slice(7) : ""
  if (sleutel.length < 32 || gegeven.length !== sleutel.length) return false
  return timingSafeEqual(Buffer.from(gegeven), Buffer.from(sleutel))
}

const nee = () => Response.json({ fout: "Geen toegang" }, { status: 401 })

export async function GET(req: Request) {
  if (!mag(req)) return nee()
  const klanten = await leesKlanten()
  const id = new URL(req.url).searchParams.get("klant")
  if (id) {
    const k = klanten.find((x) => x.id === id)
    if (!k) return Response.json({ fout: "Klant niet gevonden" }, { status: 404 })
    return Response.json({
      id: k.id,
      naam: k.naam,
      fase: k.fase,
      wat: k.wat,
      tuinen: k.tuinen.map((t) => ({ id: t.id, naam: t.naam })),
      stukken: k.stukken.map((s) => ({ soort: s.soort, nummer: s.nummer, bedrag: s.bedrag, datum: s.datum, rond: !!s.rond })),
      calculaties: k.calculaties.map((c) => ({ id: c.id, titel: c.titel, laatste: c.versies.at(-1) })),
    })
  }
  return Response.json(klanten.map((k) => ({ id: k.id, naam: k.naam, fase: k.fase, calculaties: k.calculaties.map((c) => ({ id: c.id, titel: c.titel, versies: c.versies.length, totaal: c.versies.at(-1)?.totaal })) })))
}

export async function POST(req: Request) {
  if (!mag(req)) return nee()
  const c = (await req.json().catch(() => null)) as Concept | null
  if (!c) return Response.json({ fout: "Geen geldige JSON" }, { status: 400 })
  const uit = await bewaarVersie(c)
  if ("fout" in uit) return Response.json(uit, { status: 400 })
  revalidatePath("/dashboard", "layout")
  return Response.json(uit)
}

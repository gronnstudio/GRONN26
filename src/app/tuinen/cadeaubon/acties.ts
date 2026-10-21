"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { BON_MAX, BON_MIN, bonNummer, geldigTot } from "@/lib/data/cadeaubon"
import { priceLabel } from "@/lib/format"
import { leesStand, nieuweId, opslagAan, schrijfStand } from "@/lib/beheer/stand"
import { maakBetaling, mollieAan } from "@/lib/mollie"

export type Uitkomst = { fout?: string }

const kort = (v: FormDataEntryValue | null, n: number) => String(v ?? "").trim().slice(0, n)

// Het bedrag is een vast bedrag of een eigen bedrag in hele euro's tussen BON_MIN en BON_MAX; het bonnummer geeft de server, op volgorde.
export async function koop(_: Uitkomst, d: FormData): Promise<Uitkomst> {
  if (!mollieAan() || !opslagAan()) return { fout: "Online kopen staat nu uit. App Nick op 06 18 11 80 14 voor een cadeaubon." }
  if (d.get("website")) return {}
  const bedrag = Number(kort(d.get("bedrag"), 6))
  const voor = kort(d.get("voor"), 40)
  const van = kort(d.get("van"), 40)
  const boodschap = kort(d.get("boodschap"), 140)
  const naam = kort(d.get("naam"), 80)
  const email = kort(d.get("email"), 160)
  if (!Number.isInteger(bedrag) || bedrag < BON_MIN || bedrag > BON_MAX) return { fout: `Kies een bedrag tussen ${priceLabel(BON_MIN)} en ${priceLabel(BON_MAX)}, in hele euro's.` }
  if (!voor || !van) return { fout: "Vul in voor wie de bon is en van wie." }
  if (!naam || !/^\S+@\S+\.\S+$/.test(email)) return { fout: "Vul je naam en e-mail in." }
  if (!d.get("akkoord")) return { fout: "Ga akkoord met de voorwaarden om te kopen." }

  const id = nieuweId()
  const nu = new Date()
  const h = await headers()
  const basis = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`
  const lokaal = /localhost|127\.0\.0\.1/.test(basis)
  let checkout: string | undefined
  try {
    const s = await leesStand()
    const jaar = nu.getFullYear()
    const nummer = bonNummer(jaar, s.bonnen.filter((b) => b.nummer.startsWith(`GR-${jaar}-`)).length + 1)
    const b = await maakBetaling({
      bedrag,
      omschrijving: `Cadeaubon ${nummer}`,
      terug: `${basis}/tuinen/cadeaubon/bon?b=${id}`,
      webhook: lokaal ? undefined : `${basis}/api/mollie`,
      bestelling: id,
    })
    checkout = b._links.checkout?.href
    s.bonnen.unshift({ id, nummer, datum: nu.toISOString(), geldigTot: geldigTot(nu), bedrag, voor, van, boodschap, naam, email, mollie: b.id, status: "open" })
    await schrijfStand(s)
  } catch (e) {
    console.error(e)
    return { fout: "Betalen lukt nu niet. Probeer het zo nog eens." }
  }
  if (!checkout) return { fout: "Betalen lukt nu niet. Probeer het zo nog eens." }
  redirect(checkout)
}

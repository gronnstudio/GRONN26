"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { leesStand, nieuweId, opslagAan, schrijfStand } from "@/lib/beheer/stand"
import { maakBetaling, mollieAan } from "@/lib/mollie"

export type Uitkomst = { fout?: string }

const kort = (v: FormDataEntryValue | null, n: number) => String(v ?? "").trim().slice(0, n)

// De prijs rekent de server uit de pakketgegevens; wat de browser stuurt is alleen de keuze.
export async function bestel(_: Uitkomst, d: FormData): Promise<Uitkomst> {
  if (!mollieAan() || !opslagAan()) return { fout: "Online bestellen staat nu uit. Vraag het pakket aan via Kennismaken." }
  if (d.get("website")) return {}
  const pakket = BORDERPAKKETTEN.find((p) => p.slug === d.get("pakket"))
  const maat = Number(d.get("maat"))
  const soort = d.get("soort") === "aangeplant" ? "aangeplant" : "opgestuurd"
  const naam = kort(d.get("naam"), 80)
  const email = kort(d.get("email"), 160)
  const telefoon = kort(d.get("telefoon"), 40)
  const adres = [kort(d.get("straat"), 120), `${kort(d.get("postcode"), 12)} ${kort(d.get("plaats"), 80)}`.trim()].filter(Boolean).join(", ")
  if (!pakket || !(BORDER_MATEN as readonly number[]).includes(maat)) return { fout: "Kies een pakket en een maat." }
  if (!naam || !/^\S+@\S+\.\S+$/.test(email) || !telefoon || !d.get("straat") || !d.get("postcode") || !d.get("plaats")) return { fout: "Vul je naam, e-mail, telefoon en adres in." }
  if (!d.get("akkoord")) return { fout: "Ga akkoord met de voorwaarden om te bestellen." }

  const bedrag = maat * BORDER_PRIJS[soort]
  const id = nieuweId()
  const h = await headers()
  const basis = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`
  // Mollie wil een webhook die het kan bereiken; lokaal is die er niet.
  const lokaal = /localhost|127\.0\.0\.1/.test(basis)
  let checkout: string | undefined
  try {
    const b = await maakBetaling({
      bedrag,
      omschrijving: `${pakket.naam.nl} ${maat} m² ${soort}`,
      terug: `${basis}/tuinen/borderpakketten/bedankt?b=${id}`,
      webhook: lokaal ? undefined : `${basis}/api/mollie`,
      bestelling: id,
    })
    checkout = b._links.checkout?.href
    const s = await leesStand()
    s.bestellingen.unshift({ id, datum: new Date().toISOString(), pakket: pakket.slug, maat, soort, bedrag, naam, email, telefoon, adres, mollie: b.id, status: "open" })
    await schrijfStand(s)
  } catch (e) {
    console.error(e)
    return { fout: "Betalen lukt nu niet. Probeer het zo nog eens, of vraag het pakket aan via Kennismaken." }
  }
  if (!checkout) return { fout: "Betalen lukt nu niet. Probeer het zo nog eens." }
  redirect(checkout)
}

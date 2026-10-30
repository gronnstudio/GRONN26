"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { gebeurtenis, leesKlanten, wijzigKlanten, type Klant } from "@/lib/beheer/klanten"
import { bewaarOfferte, maakOfferte, offerteNummer, wijzigOfferte } from "@/lib/crm/offerte"
import { eisEigenaar } from "@/lib/crm/toegang"
import { faseInvoer, faseTekst } from "@/lib/crm/werkomschrijving"

const log = (k: Klant, tekst: string): Klant => ({ ...k, activiteit: [gebeurtenis("Stuk", tekst), ...k.activiteit].slice(0, 500) })

/** Een offerte met privélink uit één versie van een calculatie. */
/** Met een fase: alleen de regels, uren en tekst van die fase (Nick, 30 okt 2026: "fase 1 en fase 2 splitsen en deel offerte maken"). */
export async function maakOfferteVan(klantId: string, calcId: string, nr: number, fase?: string) {
  await eisEigenaar()
  const klanten = await leesKlanten()
  const k = klanten.find((x) => x.id === klantId)
  const c = k?.calculaties.find((x) => x.id === calcId)
  const v = c?.versies.find((x) => x.nr === nr)
  if (!k || !c || !v) return
  const deel = typeof fase === "string" && fase && v.fasen?.some((f) => f.naam === fase) ? { ...v, ...faseInvoer(v, fase), beschrijving: faseTekst(v.beschrijving, fase) } : v
  const o = maakOfferte(k, fase && deel !== v ? { ...c, titel: `${c.titel} · ${fase}` } : c, deel, offerteNummer(klanten))
  await bewaarOfferte(o)
  await wijzigKlanten((lijst) =>
    lijst.map((x) =>
      x.id === k.id
        ? log({ ...x, fase: x.fase === "Aanvraag" || x.fase === "Opname" ? "Offerte" : x.fase, stukken: [...x.stukken, { id: crypto.randomUUID(), soort: "Offerte", nummer: o.nummer, bedrag: o.totaal / 100, datum: o.datum, link: o.token }] }, `Offerte ${o.nummer} gemaakt uit "${o.titel}" versie ${v.nr}`)
        : x,
    ),
  )
  revalidatePath("/dashboard", "layout")
  redirect(`/dashboard/klanten/${k.id}?tab=stukken`)
}

/** De link werkt daarna niet meer; de klant ziet dat de offerte is ingetrokken. */
export async function trekOfferteIn(klantId: string, token: string) {
  await eisEigenaar()
  const o = await wijzigOfferte(token, (x) => (x.status === "open" ? { ...x, status: "ingetrokken" } : x))
  if (!o || o.klantId !== klantId) return
  await wijzigKlanten((lijst) => lijst.map((x) => (x.id === klantId ? log(x, `Offerte ${o.nummer} ingetrokken`) : x)))
  revalidatePath("/dashboard", "layout")
}

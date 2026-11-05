"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { gebeurtenis, leesKlanten, wijzigKlanten, type Klant } from "@/lib/beheer/klanten"
import { BTW_TARIEVEN } from "@/lib/crm/calculatie"
import { bewaarFactuur, nieuwToken, type Factuur } from "@/lib/crm/factuur"
import { factuurTotaal, termijnRegels, type FactuurRegel } from "@/lib/crm/factuur-reken"
import { leesBp, leesCenten, zonderProcent, type Bp } from "@/lib/crm/geld"
import { leesOfferte } from "@/lib/crm/offerte"
import { eisEigenaar } from "@/lib/crm/toegang"
import { maakBetaallink, mollieAan } from "@/lib/mollie"

const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)
const log = (k: Klant, t: string): Klant => ({ ...k, activiteit: [gebeurtenis("Stuk", t), ...k.activiteit].slice(0, 500) })

/**
 * Een factuur maken (Nick koos "Facturen in het dashboard", 5 nov 2026): een
 * termijn uit een akkoorde offerte (percentage), of een vrije regel. Het
 * nummer is voorgesteld maar aan te passen, zodat het aansluit op DigiBoox.
 */
export async function maakFactuur(klantId: string, d: FormData) {
  await eisEigenaar()
  const klanten = await leesKlanten()
  const k = klanten.find((x) => x.id === klantId)
  const nummer = tekst(d, "nummer", 40)
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(tekst(d, "datum", 10)) ? tekst(d, "datum", 10) : ""
  if (!k || !nummer || !datum) return
  // Hetzelfde nummer twee keer kan niet: een factuurnummer is uniek in de hele administratie.
  if (klanten.some((x) => x.stukken.some((s) => s.soort === "Factuur" && s.nummer.trim().toLowerCase() === nummer.toLowerCase()))) return

  const bron = tekst(d, "bron", 40)
  let regels: FactuurRegel[] = []
  let offerte: Factuur["offerte"]
  let titel = tekst(d, "titel", 120)
  if (bron) {
    const o = await leesOfferte(bron)
    const deel = leesBp(tekst(d, "procent", 8))
    if (!o || o.klantId !== k.id || !deel || deel <= 0 || deel > 10000) return
    regels = termijnRegels(o, deel, tekst(d, "label", 60))
    offerte = { nummer: o.nummer, token: o.token }
    titel ||= o.titel
  } else {
    const ingevoerd = leesCenten(tekst(d, "bedrag", 20))
    const btw = (leesBp(tekst(d, "btw", 4)) ?? 2100) as Bp
    const omschrijving = tekst(d, "omschrijving", 200)
    if (!ingevoerd || !omschrijving || !BTW_TARIEVEN.includes(btw)) return
    regels = [{ omschrijving, bedrag: tekst(d, "metbtw", 1) === "1" ? zonderProcent(ingevoerd, btw) : ingevoerd, btw }]
  }
  if (!regels.length) return
  const som = factuurTotaal(regels)
  if (som.totaal <= 0) return

  const token = nieuwToken()
  const basis = "https://gronn.studio"
  let betaallink: string | undefined
  if (mollieAan()) {
    // Zonder link is de factuur ook goed (IBAN of overmaken); een storing bij Mollie houdt hem niet tegen.
    betaallink = (await maakBetaallink({ bedrag: som.totaal / 100, omschrijving: `Factuur ${nummer} GRØNN Studio`, terug: `${basis}/factuur/${token}?betaald=1` }).catch(() => null)) ?? undefined
  }
  const f: Factuur = {
    token,
    klantId: k.id,
    soort: offerte ? "Termijnfactuur" : "Factuur",
    nummer,
    datum,
    klant: k.bedrijf || k.naam,
    adres: [k.adres, k.plaats].filter(Boolean).join(", "),
    titel: titel || "Werkzaamheden",
    ...(offerte ? { offerte } : {}),
    regels,
    btw: som.btw,
    totaal: som.totaal,
    ...(betaallink ? { betaallink } : {}),
  }
  await bewaarFactuur(f)
  await wijzigKlanten((lijst) =>
    lijst.map((x) =>
      x.id === k.id
        ? log({ ...x, stukken: [...x.stukken, { id: crypto.randomUUID(), soort: "Factuur" as const, nummer, bedrag: som.totaal / 100, datum, factuur: token }].sort((a, b) => a.datum.localeCompare(b.datum)) }, `${f.soort} ${nummer} gemaakt`)
        : x,
    ),
  )
  revalidatePath("/dashboard", "layout")
  redirect(`/dashboard/klanten/${k.id}?tab=stukken`)
}

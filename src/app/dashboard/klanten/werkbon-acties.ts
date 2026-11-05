"use server"

import { revalidatePath } from "next/cache"
import { gebeurtenis, leesKlanten, wijzigKlanten } from "@/lib/beheer/klanten"
import { nieuweWerkbon, werkbonWeg } from "@/lib/beheer/werkbon"
import { nieuwToken } from "@/lib/crm/offerte"
import { eisEigenaar } from "@/lib/crm/toegang"

const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)

/** Een werkbon voor één dag; de klant tekent hem via de link. */
export async function maakWerkbon(klantId: string, d: FormData) {
  await eisEigenaar()
  const k = (await leesKlanten()).find((x) => x.id === klantId)
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(tekst(d, "datum", 10)) ? tekst(d, "datum", 10) : ""
  const werk = tekst(d, "werk", 2000)
  const uren = Number(tekst(d, "uren", 6).replace(",", "."))
  if (!k || !datum || !werk || !Number.isFinite(uren) || uren < 0 || uren > 24) return
  const w = await nieuweWerkbon({
    token: nieuwToken(),
    klantId: k.id,
    datum,
    klant: k.bedrijf || k.naam,
    adres: [k.adres, k.plaats].filter(Boolean).join(", "),
    werk,
    uren: Math.round(uren * 4) / 4,
    materiaal: tekst(d, "materiaal", 2000),
    opmerking: tekst(d, "opmerking", 1000),
  })
  await wijzigKlanten((lijst) => lijst.map((x) => (x.id === k.id ? { ...x, activiteit: [gebeurtenis("Stuk", `Werkbon ${w.nummer} gemaakt`), ...x.activiteit].slice(0, 500) } : x)))
  revalidatePath("/dashboard", "layout")
}

export async function haalWerkbonWeg(token: string) {
  await eisEigenaar()
  await werkbonWeg(token)
  revalidatePath("/dashboard", "layout")
}

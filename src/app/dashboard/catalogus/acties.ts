"use server"

import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"
import { BTW_TARIEVEN, SOORTEN, isSoort } from "@/lib/crm/calculatie"
import { nieuwItem, zetPrijs, type Item } from "@/lib/crm/catalogus"
import { leesBp, leesCenten } from "@/lib/crm/geld"
import { wijzigCatalogus } from "@/lib/beheer/catalogus"
import { importeer, leesCsv, type ImportUitkomst } from "@/lib/crm/catalogus-import"

const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)

function lees(d: FormData): Omit<Item, "id" | "historie" | "bijgewerkt"> | null {
  const naam = tekst(d, "naam", 120)
  if (!naam) return null
  const s = tekst(d, "soort", 20)
  const soort = isSoort(s) ? s : "materiaal"
  const btwTekst = tekst(d, "btw", 5)
  const btw = btwTekst ? Number(btwTekst) : NaN
  return {
    naam,
    soort,
    eenheid: tekst(d, "eenheid", 12) || "st",
    inkoop: Math.max(0, leesCenten(tekst(d, "inkoop", 20)) ?? 0),
    opslag: Math.max(0, leesBp(tekst(d, "opslag", 10)) ?? SOORTEN[soort].opslag),
    btw: BTW_TARIEVEN.includes(btw) ? btw : SOORTEN[soort].btw,
    afval: Math.max(0, leesBp(tekst(d, "afval", 10)) ?? 0),
    leverancier: tekst(d, "leverancier", 80),
    sku: tekst(d, "sku", 40),
    link: /^https:\/\//.test(tekst(d, "link", 300)) ? tekst(d, "link", 300) : "",
    notitie: tekst(d, "notitie", 300),
  }
}

export async function nieuwCatalogusItem(d: FormData) {
  await eisEigenaar()
  const v = lees(d)
  if (!v) return
  await wijzigCatalogus((items) => [...items, nieuwItem(v)])
  revalidatePath("/dashboard", "layout")
}

export async function bewaarCatalogusItem(id: string, d: FormData) {
  await eisEigenaar()
  const v = lees(d)
  if (!v) return
  // De prijs via zetPrijs, zodat de oude in de historie komt.
  await wijzigCatalogus((items) => items.map((i) =>
      i.id === id
        ? {
            ...zetPrijs(i, v.inkoop, v.leverancier),
            ...v,
            // Velden die niet in de tabelrij staan, blijven zoals ze waren.
            sku: d.has("sku") ? v.sku : i.sku,
            link: d.has("link") ? v.link : i.link,
            notitie: d.has("notitie") ? v.notitie : i.notitie,
          }
        : i,
    ))
  revalidatePath("/dashboard", "layout")
}

export async function catalogusItemWeg(id: string) {
  await eisEigenaar()
  await wijzigCatalogus((items) => items.filter((i) => i.id !== id))
  revalidatePath("/dashboard", "layout")
}

/** Een prijslijst (CSV) inlezen: nieuwe items erbij, bestaande bijwerken op leverancier + artikelnummer. */
export async function importeerCatalogus(_vorig: ImportUitkomst | null, d: FormData): Promise<ImportUitkomst> {
  await eisEigenaar()
  const leeg: ImportUitkomst = { nieuw: 0, bijgewerkt: 0, gelijk: 0, afgewezen: [] }
  const bestand = d.get("bestand")
  if (!(bestand instanceof File) || !bestand.size) return { ...leeg, fout: "Kies eerst een CSV-bestand." }
  if (bestand.size > 3_500_000) return { ...leeg, fout: "Het bestand is groter dan 3,5 MB. Splits het in delen." }
  const rijen = leesCsv(await bestand.text())
  let uitkomst = leeg
  try {
    await wijzigCatalogus((items) => {
      const r = importeer(items, rijen)
      uitkomst = r.uitkomst
      return r.items
    })
  } catch {
    return { ...leeg, fout: "Bewaren lukte niet. Probeer het nog eens." }
  }
  revalidatePath("/dashboard", "layout")
  return uitkomst
}

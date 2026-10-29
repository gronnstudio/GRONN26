"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { SOORTEN, leesUren, schrijfUren, type Regel, type Soort } from "@/lib/beheer/uren"

// Alleen de eigenaar mag schrijven; de proxy houdt /dashboard al dicht, dit is de tweede deur.
async function wijzig(f: (r: Regel[]) => Regel[]) {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) throw new Error("Niet ingelogd")
  await schrijfUren(f(await leesUren()))
  revalidatePath("/dashboard", "layout")
}

const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)

export async function nieuweRegel(d: FormData) {
  const datum = tekst(d, "datum", 10)
  const uren = Math.round(Number(String(d.get("uren") ?? "").replace(",", ".")) * 4) / 4
  const soort = tekst(d, "soort", 40) as Soort
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || !(uren > 0 && uren <= 16) || !SOORTEN.includes(soort)) return
  const regel: Regel = { id: crypto.randomUUID(), datum, soort, klant: tekst(d, "klant", 80), wat: tekst(d, "wat", 300), uren }
  await wijzig((r) => [regel, ...r])
}

export async function regelWeg(id: string) {
  await wijzig((r) => r.filter((x) => x.id !== id))
}

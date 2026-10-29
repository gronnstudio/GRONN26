"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { KLANT_FASEN, leesKlanten, schrijfKlanten, type Klant, type KlantFase, type Stuk } from "@/lib/beheer/klanten"

// Alleen de eigenaar mag schrijven; de proxy houdt /dashboard al dicht, dit is de tweede deur.
async function wijzig(f: (k: Klant[]) => Klant[]) {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) throw new Error("Niet ingelogd")
  await schrijfKlanten(f(await leesKlanten()))
  revalidatePath("/dashboard/klanten", "layout")
}

const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)
const fase = (v: string): KlantFase => (KLANT_FASEN.includes(v as KlantFase) ? (v as KlantFase) : "Aanvraag")
const bedrag = (v: string) => Math.round(Number(v.replace(/\./g, "").replace(",", ".")) * 100) / 100 || 0

export async function nieuweKlant(d: FormData) {
  const naam = tekst(d, "naam", 80)
  if (!naam) return
  const id = crypto.randomUUID()
  await wijzig((k) => [
    {
      id,
      naam,
      wat: tekst(d, "wat", 200),
      plaats: tekst(d, "plaats", 60),
      contact: "",
      adres: "",
      fase: "Aanvraag",
      volgende: "",
      notities: "",
      stukken: [],
      aangemaakt: new Date().toISOString().slice(0, 10),
    },
    ...k,
  ])
  redirect(`/dashboard/klanten/${id}`)
}

export async function zetFase(id: string, nieuw: string) {
  await wijzig((k) => k.map((x) => (x.id === id ? { ...x, fase: fase(nieuw) } : x)))
}

export async function bewaarKlant(id: string, d: FormData) {
  await wijzig((k) =>
    k.map((x) =>
      x.id === id
        ? {
            ...x,
            naam: tekst(d, "naam", 80) || x.naam,
            wat: tekst(d, "wat", 200),
            plaats: tekst(d, "plaats", 60),
            contact: tekst(d, "contact", 200),
            adres: tekst(d, "adres", 200),
            fase: fase(tekst(d, "fase", 20)),
            volgende: tekst(d, "volgende", 300),
            notities: tekst(d, "notities", 4000),
          }
        : x,
    ),
  )
}

export async function nieuwStuk(id: string, d: FormData) {
  const nummer = tekst(d, "nummer", 60)
  const b = bedrag(tekst(d, "bedrag", 20))
  const datum = tekst(d, "datum", 10)
  if (!nummer || !b || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return
  const stuk: Stuk = { id: crypto.randomUUID(), soort: tekst(d, "soort", 10) === "Offerte" ? "Offerte" : "Factuur", nummer, bedrag: b, datum }
  await wijzig((k) => k.map((x) => (x.id === id ? { ...x, stukken: [...x.stukken, stuk].sort((a, c) => a.datum.localeCompare(c.datum)) } : x)))
}

export async function stukRond(id: string, stuk: string, rond: boolean) {
  await wijzig((k) => k.map((x) => (x.id === id ? { ...x, stukken: x.stukken.map((s) => (s.id === stuk ? { ...s, rond } : s)) } : x)))
}

export async function stukWeg(id: string, stuk: string) {
  await wijzig((k) => k.map((x) => (x.id === id ? { ...x, stukken: x.stukken.filter((s) => s.id !== stuk) } : x)))
}

export async function klantWeg(id: string) {
  await wijzig((k) => k.filter((x) => x.id !== id))
  redirect("/dashboard/klanten")
}

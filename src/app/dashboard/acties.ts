"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { leesStand, nieuweId, schrijfStand, type Aanvraag, type Stand } from "@/lib/beheer/stand"

// Alleen de eigenaar mag schrijven; de proxy houdt /dashboard al dicht, dit is de tweede deur.
async function wijzig(f: (s: Stand) => void) {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) throw new Error("Niet ingelogd")
  const s = await leesStand()
  f(s)
  await schrijfStand(s)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/social")
}

const tekst = (d: FormData, k: string, n = 300) => String(d.get(k) ?? "").trim().slice(0, n)

export async function zetGepost(map: string, aan: boolean) {
  await wijzig((s) => {
    if (aan) s.gepost[map] = new Date().toISOString().slice(0, 10)
    else delete s.gepost[map]
  })
}

export async function nieuweAanvraag(d: FormData) {
  const naam = tekst(d, "naam", 80)
  if (!naam) return
  await wijzig((s) =>
    s.aanvragen.unshift({
      id: nieuweId(),
      datum: new Date().toISOString(),
      naam,
      contact: tekst(d, "contact", 160),
      wat: tekst(d, "wat", 1200),
      bron: (tekst(d, "bron", 20) || "WhatsApp") as Aanvraag["bron"],
    }),
  )
}

export async function aanvraagKlaar(id: string, klaar: boolean) {
  await wijzig((s) => {
    const a = s.aanvragen.find((x) => x.id === id)
    if (a) a.klaar = klaar
  })
}

export async function nieuwPlan(d: FormData) {
  const datum = tekst(d, "datum", 10)
  const wat = tekst(d, "wat", 160)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || !wat) return
  await wijzig((s) => s.planning.push({ id: nieuweId(), datum, wat }))
}

export async function planWeg(id: string) {
  await wijzig((s) => {
    s.planning = s.planning.filter((p) => p.id !== id)
  })
}

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { gebeurtenis, leesKlanten, wijzigKlanten, type Klant } from "@/lib/beheer/klanten"
import { leesCenten, leesMilli } from "@/lib/crm/geld"
import { normaliseerProject, nieuwProject, type Project } from "@/lib/crm/project"
import { eisEigenaar } from "@/lib/crm/toegang"

// Een project uitvoeren: starten uit een calculatieversie, taken afvinken,
// uren, meerwerk en de opleverlijst. Elke handeling is een gewoon formulier,
// zodat het op de telefoon ook zonder JavaScript werkt.

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const log = (k: Klant, tekst: string): Klant => ({ ...k, activiteit: [gebeurtenis("Fase", tekst), ...k.activiteit].slice(0, 500) })

/** Een project uit één versie van een calculatie. Bestaat het al voor deze calculatie, dan gaat Nick daarheen. */
export async function startProject(klantId: string, calcId: string, nr: number) {
  await eisEigenaar()
  const k = (await leesKlanten()).find((x) => x.id === klantId)
  const c = k?.calculaties.find((x) => x.id === calcId)
  const v = c?.versies.find((x) => x.nr === nr)
  if (!k || !c || !v) return
  const bestaand = k.projecten.find((p) => p.calculatieId === c.id)
  let pid = bestaand?.id
  if (!bestaand) {
    const p = nieuwProject(c, v)
    pid = p.id
    await wijzigKlanten((lijst) => lijst.map((x) => (x.id === k.id ? log({ ...x, fase: ["Akkoord", "Gepland", "Offerte"].includes(x.fase) ? "Uitvoering" : x.fase, projecten: [...x.projecten, p] }, `Project "${c.titel}" gestart uit versie ${v.nr}`) : x)))
    revalidatePath("/dashboard", "layout")
  }
  redirect(`/dashboard/klanten/${k.id}/project/${pid}`)
}

type Soort = "taak" | "uren" | "meerwerk" | "meerwerk-akkoord" | "punt" | "punt-klaar" | "weg" | "opgeleverd"

/** Eén handeling op een project. */
export async function projectActie(klantId: string, pid: string, soort: Soort, d: FormData) {
  await eisEigenaar()
  const veld = (n: string) => String(d.get(n) ?? "").trim()
  const regel = veld("regel")
  const wijzig = (p: Project): Project => {
    switch (soort) {
      case "taak":
        return { ...p, taken: p.taken.map((x) => (x.id === regel ? { ...x, klaar: !x.klaar } : x)) }
      case "uren": {
        const uren = leesMilli(veld("uren")) ?? 0
        return uren > 0 ? { ...p, uren: [{ id: crypto.randomUUID(), datum: veld("datum") || vandaag(), uren, wat: veld("wat") }, ...p.uren] } : p
      }
      case "meerwerk": {
        const omschrijving = veld("omschrijving")
        return omschrijving ? { ...p, meerwerk: [...p.meerwerk, { id: crypto.randomUUID(), datum: vandaag(), omschrijving, bedrag: Math.max(0, leesCenten(veld("bedrag")) ?? 0), akkoord: false }] } : p
      }
      case "meerwerk-akkoord":
        return { ...p, meerwerk: p.meerwerk.map((m) => (m.id === regel ? { ...m, akkoord: !m.akkoord } : m)) }
      case "punt":
        return veld("tekst") ? { ...p, oplevering: [...p.oplevering, { id: crypto.randomUUID(), tekst: veld("tekst"), klaar: false }] } : p
      case "punt-klaar":
        return { ...p, oplevering: p.oplevering.map((x) => (x.id === regel ? { ...x, klaar: !x.klaar } : x)) }
      case "weg":
        return { ...p, uren: p.uren.filter((x) => x.id !== regel), meerwerk: p.meerwerk.filter((x) => x.id !== regel), oplevering: p.oplevering.filter((x) => x.id !== regel) }
      case "opgeleverd":
        return p.opgeleverd ? { ...p, opgeleverd: undefined } : { ...p, opgeleverd: vandaag() }
    }
  }
  await wijzigKlanten((lijst) =>
    lijst.map((k) => {
      if (k.id !== klantId) return k
      const oud = k.projecten.find((p) => p.id === pid)
      if (!oud) return k
      const nieuw = normaliseerProject(wijzig(oud))
      const uit = { ...k, projecten: k.projecten.map((p) => (p.id === pid ? nieuw : p)) }
      return soort === "opgeleverd" && nieuw.opgeleverd ? log({ ...uit, fase: "Opgeleverd" }, `Project "${nieuw.titel}" opgeleverd`) : uit
    }),
  )
  revalidatePath(`/dashboard/klanten/${klantId}`, "layout")
}

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { gebeurtenis, leesKlanten, wijzigKlanten, type Klant } from "@/lib/beheer/klanten"
import { leesCenten, leesMilli } from "@/lib/crm/geld"
import { normaliseerProject, nieuwProject, splitsProject, takenUitBeschrijving, type Project } from "@/lib/crm/project"
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
  const nieuw = nieuwProject(c, v)
  let pid = nieuw.id
  // De controle staat in de wijziging zelf: twee klikken tegelijk maken zo nooit twee projecten.
  await wijzigKlanten((lijst) =>
    lijst.map((x) => {
      if (x.id !== k.id) return x
      const bestaand = x.projecten.find((p) => p.calculatieId === c.id)
      if (bestaand) {
        pid = bestaand.id
        return x
      }
      pid = nieuw.id
      return log({ ...x, fase: ["Akkoord", "Gepland", "Offerte", "Opgeleverd"].includes(x.fase) ? "Uitvoering" : x.fase, projecten: [...x.projecten, nieuw] }, `Project "${c.titel}" gestart uit versie ${v.nr}`)
    }),
  )
  revalidatePath("/dashboard", "layout")
  redirect(`/dashboard/klanten/${k.id}/project/${pid}`)
}

type Soort = "taak" | "taak-erbij" | "uit-beschrijving" | "uren" | "meerwerk" | "meerwerk-akkoord" | "punt" | "punt-klaar" | "weg" | "opgeleverd"

/** Eén handeling op een project. */
export async function projectActie(klantId: string, pid: string, soort: Soort, d: FormData) {
  await eisEigenaar()
  const veld = (n: string) => String(d.get(n) ?? "").trim()
  const regel = veld("regel")
  const wijzig = (p: Project, k: Klant): Project => {
    switch (soort) {
      case "uit-beschrijving": {
        const v = k.calculaties.find((c) => c.id === p.calculatieId)?.versies.find((x) => x.nr === p.versie)
        const nieuw = takenUitBeschrijving(v?.beschrijving ?? "").map((f) => ({ id: crypto.randomUUID(), naam: f.naam, dagen: f.dagen, klaar: false }))
        return nieuw.length ? { ...p, taken: [...p.taken, ...nieuw] } : p
      }
      case "taak-erbij": {
        const naam = veld("naam")
        const dagen = Math.min(60, Math.max(0.5, Number(veld("dagen").replace(",", ".")) || 1))
        return naam ? { ...p, taken: [...p.taken, { id: crypto.randomUUID(), naam, dagen, klaar: false }] } : p
      }
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
        return { ...p, uren: p.uren.filter((x) => x.id !== regel), meerwerk: p.meerwerk.filter((x) => x.id !== regel), oplevering: p.oplevering.filter((x) => x.id !== regel), taken: p.taken.filter((x) => x.id !== regel) }
      case "opgeleverd":
        return p.opgeleverd ? { ...p, opgeleverd: undefined } : { ...p, opgeleverd: vandaag() }
    }
  }
  await wijzigKlanten((lijst) =>
    lijst.map((k) => {
      if (k.id !== klantId) return k
      const oud = k.projecten.find((p) => p.id === pid)
      if (!oud) return k
      const nieuw = normaliseerProject(wijzig(oud, k))
      const uit = { ...k, projecten: k.projecten.map((p) => (p.id === pid ? nieuw : p)) }
      if (soort !== "opgeleverd") return uit
      // De klant is pas klaar als elk project is opgeleverd.
      const allesKlaar = uit.projecten.every((p) => p.opgeleverd)
      return nieuw.opgeleverd ? log(allesKlaar ? { ...uit, fase: "Opgeleverd" } : uit, `Project "${nieuw.titel}" opgeleverd`) : log({ ...uit, fase: "Uitvoering" }, `Project "${nieuw.titel}" weer in uitvoering`)
    }),
  )
  revalidatePath(`/dashboard/klanten/${klantId}`, "layout")
}

/** De gekozen taken worden een eigen deel, met een eigen moment. */
export async function splitsAf(klantId: string, pid: string, d: FormData) {
  await eisEigenaar()
  const ids = d.getAll("taak").map(String)
  const wanneer = String(d.get("wanneer") ?? "")
  let nieuwId = ""
  await wijzigKlanten((lijst) =>
    lijst.map((k) => {
      if (k.id !== klantId) return k
      const oud = k.projecten.find((p) => p.id === pid)
      const uit = oud && splitsProject(oud, ids, wanneer)
      if (!uit) return k
      nieuwId = uit[1].id
      const projecten = k.projecten.flatMap((p) => (p.id === pid ? uit : [p]))
      return log({ ...k, projecten }, `Project "${oud.titel}" gesplitst: "${uit[1].titel}"`)
    }),
  )
  revalidatePath(`/dashboard/klanten/${klantId}`, "layout")
  if (nieuwId) redirect(`/dashboard/klanten/${klantId}/project/${nieuwId}`)
}

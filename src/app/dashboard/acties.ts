"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { leesStand, nieuweId, schrijfStand, type Aanvraag, type Stand } from "@/lib/beheer/stand"
import { gebeurtenis, normaliseer, wijzigKlanten, zoekDubbel } from "@/lib/beheer/klanten"

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

export async function bonIngewisseld(id: string, ingewisseld: boolean) {
  await wijzig((s) => {
    const b = s.bonnen.find((x) => x.id === id)
    if (b) b.ingewisseld = ingewisseld
  })
}

export async function bonVerstuurd(id: string, verstuurd: boolean) {
  await wijzig((s) => {
    const b = s.bonnen.find((x) => x.id === id)
    if (b) b.verstuurd = verstuurd
  })
}

export async function bestellingKlaar(id: string, klaar: boolean) {
  await wijzig((s) => {
    const b = s.bestellingen.find((x) => x.id === id)
    if (b) b.klaar = klaar
  })
}

/**
 * Een aanvraag wordt een klant (lead in fase Aanvraag), met de vraag op de
 * tijdlijn. Bestaat de persoon al (zelfde mail, nummer of naam), dan komt de
 * aanvraag bij die klant en komt er geen tweede kaart. De aanvraag zelf gaat
 * na 30 dagen weg (privacyverklaring); de klantkaart is daarna de administratie.
 */
export async function aanvraagNaarKlant(id: string) {
  if (!(await isEigenaar((await cookies()).get(KOEKJE)?.value))) throw new Error("Niet ingelogd")
  const s = await leesStand()
  const a = s.aanvragen.find((x) => x.id === id)
  if (!a) return
  const isMail = a.contact.includes("@")
  let doel = ""
  await wijzigKlanten((lijst) => {
    const bestaand = zoekDubbel(lijst, { naam: a.naam, contact: a.contact })[0]
    const notitie = gebeurtenis("Klant", `Aanvraag via ${a.bron.toLowerCase()} (${a.datum.slice(0, 10)}): ${a.wat || "geen bericht"}`, a.bron === "Formulier" ? "Formulier" : "Nick")
    if (bestaand) {
      doel = bestaand.id
      return lijst.map((k) => (k.id === bestaand.id ? { ...k, activiteit: [notitie, ...k.activiteit] } : k))
    }
    doel = crypto.randomUUID()
    const morgen = new Date(Date.now() + 86_400_000).toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
    const klant = normaliseer({
      id: doel,
      naam: a.naam,
      email: isMail ? a.contact : "",
      telefoon: isMail ? "" : a.contact,
      wat: a.wat.split("\n")[0].slice(0, 200),
      bron: a.bron,
      fase: "Aanvraag",
      opvolgen: morgen,
      volgende: "Terugbellen en een opname plannen.",
      aangemaakt: new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" }),
      activiteit: [notitie],
    })
    return [klant, ...lijst]
  })
  await wijzig((st) => {
    const x = st.aanvragen.find((y) => y.id === id)
    if (x) x.klaar = true
  })
  redirect(`/dashboard/klanten/${doel}`)
}

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eisEigenaar } from "@/lib/crm/toegang"
import { leesCenten } from "@/lib/crm/geld"
import {
  BRONNEN,
  KLANT_FASEN,
  KLANT_SOORTEN,
  PRIORITEITEN,
  VOORKEUREN,
  gebeurtenis,
  leesKlanten,
  normaliseer,
  wijzigKlanten,
  zoekDubbel,
  type Gebeurtenis,
  type Klant,
  type KlantFase,
  type Stuk,
  type Tuin,
} from "@/lib/beheer/klanten"

// Alleen de eigenaar mag schrijven; de proxy houdt /dashboard al dicht, dit is de tweede deur.
async function wijzig(f: (k: Klant[]) => Klant[]) {
  await eisEigenaar()
  await wijzigKlanten(f)
  revalidatePath("/dashboard", "layout")
}

/** Eén klant aanpassen; `f` geeft de nieuwe klant terug. */
const pasAan = (id: string, f: (k: Klant) => Klant) => wijzig((lijst) => lijst.map((k) => (k.id === id ? f(k) : k)))
const log = (k: Klant, ...g: Gebeurtenis[]): Klant => ({ ...k, activiteit: [...g, ...k.activiteit].slice(0, 500) })

const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)
const uit = <T extends string>(lijst: readonly T[], v: string, standaard: T): T => (lijst.includes(v as T) ? (v as T) : standaard)
const fase = (v: string): KlantFase => uit(KLANT_FASEN, v, "Aanvraag")
const bedrag = (v: string) => (leesCenten(v) ?? 0) / 100
const datum = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "")
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

export async function nieuweKlant(d: FormData) {
  await eisEigenaar()
  const naam = tekst(d, "naam", 80)
  if (!naam) return
  const email = tekst(d, "email", 160)
  const telefoon = tekst(d, "telefoon", 40)
  // Bestaat deze persoon al (zelfde mail, nummer of naam)? Dan geen tweede kaart.
  const dubbel = zoekDubbel(await leesKlanten(), { naam, email, telefoon })[0]
  if (dubbel && d.get("toch") !== "1") redirect(`/dashboard/klanten/${dubbel.id}?bestond=1`)
  const id = crypto.randomUUID()
  const klant = normaliseer({
    id,
    naam,
    wat: tekst(d, "wat", 200),
    plaats: tekst(d, "plaats", 60),
    email,
    telefoon,
    bron: uit(BRONNEN, tekst(d, "bron", 20), "Anders"),
    soort: uit(KLANT_SOORTEN, tekst(d, "soort", 20), "Particulier"),
    aangemaakt: vandaag(),
    activiteit: [gebeurtenis("Klant", "Klant aangemaakt")],
  })
  await wijzig((k) => [klant, ...k])
  redirect(`/dashboard/klanten/${id}`)
}

export async function zetFase(id: string, nieuw: string) {
  await pasAan(id, (k) => (k.fase === fase(nieuw) ? k : log({ ...k, fase: fase(nieuw) }, gebeurtenis("Fase", `${k.fase} → ${fase(nieuw)}`))))
}

export async function bewaarKlant(id: string, d: FormData) {
  await pasAan(id, (x) => {
    const nieuw = fase(tekst(d, "fase", 20))
    const kans = Math.min(100, Math.max(0, Math.round(Number(tekst(d, "kans", 3)) || 0)))
    const k: Klant = {
      ...x,
      naam: tekst(d, "naam", 80) || x.naam,
      soort: uit(KLANT_SOORTEN, tekst(d, "soort", 20), x.soort),
      bedrijf: tekst(d, "bedrijf", 120),
      wat: tekst(d, "wat", 200),
      plaats: tekst(d, "plaats", 60),
      contact: d.has("contact") ? tekst(d, "contact", 200) : x.contact,
      email: tekst(d, "email", 160),
      telefoon: tekst(d, "telefoon", 40),
      voorkeur: uit(["", ...VOORKEUREN] as const, tekst(d, "voorkeur", 20), ""),
      adres: tekst(d, "adres", 200),
      bron: tekst(d, "bron", 40),
      tags: tekst(d, "tags", 300)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 20),
      fase: nieuw,
      volgende: tekst(d, "volgende", 300),
      opvolgen: datum(tekst(d, "opvolgen", 10)),
      prioriteit: uit(PRIORITEITEN, tekst(d, "prioriteit", 10), "Normaal"),
      waarde: leesCenten(tekst(d, "waarde", 20)) ?? 0,
      kans,
      verlorenReden: nieuw === "Verloren" ? tekst(d, "verlorenReden", 200) : "",
      notities: tekst(d, "notities", 8000),
    }
    return nieuw === x.fase ? k : log(k, gebeurtenis("Fase", `${x.fase} → ${nieuw}${k.verlorenReden ? ` (${k.verlorenReden})` : ""}`))
  })
}

export async function nieuweNotitie(id: string, d: FormData) {
  const t = tekst(d, "tekst", 1000)
  if (!t) return
  const soort = uit(["Notitie", "Gesprek", "Bezoek"] as const, tekst(d, "soort", 10), "Notitie")
  await pasAan(id, (k) => log(k, gebeurtenis(soort, t)))
}

export async function nieuwStuk(id: string, d: FormData) {
  const nummer = tekst(d, "nummer", 60)
  const b = bedrag(tekst(d, "bedrag", 20))
  const dt = datum(tekst(d, "datum", 10))
  if (!nummer || !b || !dt) return
  const stuk: Stuk = { id: crypto.randomUUID(), soort: tekst(d, "soort", 10) === "Offerte" ? "Offerte" : "Factuur", nummer, bedrag: b, datum: dt }
  await pasAan(id, (k) => log({ ...k, stukken: [...k.stukken, stuk].sort((a, c) => a.datum.localeCompare(c.datum)) }, gebeurtenis("Stuk", `${stuk.soort} ${nummer} toegevoegd`)))
}

export async function stukRond(id: string, stuk: string, rond: boolean) {
  await pasAan(id, (k) => {
    const s = k.stukken.find((x) => x.id === stuk)
    if (!s) return k
    const wat = s.soort === "Factuur" ? (rond ? "betaald" : "niet betaald") : rond ? "akkoord" : "niet akkoord"
    // Een goedgekeurde offerte zet de klus op Akkoord, als die nog niet verder was.
    const naar: KlantFase = s.soort === "Offerte" && rond && ["Aanvraag", "Opname", "Offerte"].includes(k.fase) ? "Akkoord" : k.fase
    return log({ ...k, fase: naar, stukken: k.stukken.map((x) => (x.id === stuk ? { ...x, rond } : x)) }, gebeurtenis("Stuk", `${s.soort} ${s.nummer} ${wat}`))
  })
}

export async function stukWeg(id: string, stuk: string) {
  await pasAan(id, (k) => {
    const s = k.stukken.find((x) => x.id === stuk)
    return s ? log({ ...k, stukken: k.stukken.filter((x) => x.id !== stuk) }, gebeurtenis("Stuk", `${s.soort} ${s.nummer} weggehaald`)) : k
  })
}

export async function klantWeg(id: string) {
  await wijzig((k) => k.filter((x) => x.id !== id))
  redirect("/dashboard/klanten")
}

// Tuinen en opnames

export async function nieuweTuin(id: string, d: FormData) {
  const naam = tekst(d, "naam", 80) || "Tuin"
  const tuinId = crypto.randomUUID()
  const tuin: Tuin = { id: tuinId, naam, adres: tekst(d, "adres", 200), antwoorden: {}, vragen: {}, notities: {}, aandacht: [], diensten: [], soort: "uitgebreid", zones: [], geschiedenis: [], fotos: [], bevindingen: [], aangemaakt: vandaag(), bijgewerkt: vandaag() }
  await pasAan(id, (k) => log({ ...k, tuinen: [...k.tuinen, tuin] }, gebeurtenis("Opname", `Tuin "${naam}" toegevoegd`)))
  redirect(`/dashboard/klanten/${id}/tuin/${tuinId}`)
}

/** Naam en adres van een tuin; de antwoorden bewaart de intake zelf (intake-acties.ts). `bijgewerkt` blijft staan: die hoort bij de antwoorden en bepaalt de dagversie. */
export async function bewaarTuinKop(id: string, tuinId: string, d: FormData) {
  await pasAan(id, (k) => ({
    ...k,
    tuinen: k.tuinen.map((t) => (t.id === tuinId ? { ...t, naam: tekst(d, "naam", 80) || t.naam, adres: tekst(d, "adres", 200) } : t)),
  }))
}

export async function tuinWeg(id: string, tuinId: string) {
  await pasAan(id, (k) => ({ ...k, tuinen: k.tuinen.filter((t) => t.id !== tuinId) }))
  redirect(`/dashboard/klanten/${id}?tab=tuinen`)
}

export async function fotoWeg(id: string, tuinId: string, fotoId: string) {
  await pasAan(id, (k) => ({ ...k, tuinen: k.tuinen.map((t) => (t.id === tuinId ? { ...t, fotos: t.fotos.filter((f) => f.id !== fotoId) } : t)) }))
}

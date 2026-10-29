"use server"

import { revalidatePath } from "next/cache"
import { eisEigenaar } from "@/lib/crm/toegang"
import { wijzigVragenlijst } from "@/lib/beheer/vragenlijst"
import { VRAAG_SOORTEN, alleVragen, nieuwId, type Vraag, type VraagSoort, type Vragenlijst } from "@/lib/crm/vragenlijst"

// De vragenlijst aanpassen zonder code (ADR 0008). Elke bewaarbeurt verhoogt
// het versienummer. Een vraag gaat nooit echt weg: "vervallen" haalt hem uit
// nieuwe intakes, oude antwoorden blijven met hun vraagtekst bewaard.

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })
const tekst = (d: FormData, k: string, n: number) => String(d.get(k) ?? "").trim().slice(0, n)
const regels = (v: string) => [...new Set(v.split(/\n/).map((x) => x.trim()).filter(Boolean))].slice(0, 30)
const soort = (v: string): VraagSoort => ((VRAAG_SOORTEN as readonly string[]).includes(v) ? (v as VraagSoort) : "tekst")

async function wijzig(f: (l: Vragenlijst) => Vragenlijst) {
  await eisEigenaar()
  await wijzigVragenlijst((l) => ({ ...f(l), versie: l.versie + 1, bijgewerkt: vandaag() }))
  revalidatePath("/dashboard", "layout")
}

/** Alleen bij: de gekozen werkzaamheden (vinkjes), en alleen die bestaan. */
const alleenBij = (d: FormData, k: string, l: Vragenlijst) => {
  const v = d.getAll(k).map(String).filter((x) => l.diensten.includes(x))
  return v.length ? v : undefined
}

function leesVraag(d: FormData, p: string, l: Vragenlijst, basis: Pick<Vraag, "id">): Vraag | null {
  const t = tekst(d, `${p}tekst`, 200)
  if (!t) return null
  const s = soort(tekst(d, `${p}soort`, 10))
  const opties = s === "keuze" ? regels(tekst(d, `${p}opties`, 2000)) : undefined
  return {
    id: basis.id,
    tekst: t,
    soort: s === "keuze" && !opties?.length ? "tekst" : s,
    opties: opties?.length ? opties : undefined,
    eenheid: s === "getal" ? tekst(d, `${p}eenheid`, 12) || undefined : undefined,
    hulp: tekst(d, `${p}hulp`, 200) || undefined,
    toonBij: alleenBij(d, `${p}toonBij`, l),
    snel: d.get(`${p}snel`) === "1" || undefined,
    vervallen: d.get(`${p}vervallen`) === "1" || undefined,
  }
}

/** Eén categorie: naam, wanneer hij geldt, de vragen, en eventueel een nieuwe vraag. */
export async function bewaarCategorie(catId: string, d: FormData) {
  await wijzig((l) => {
    const bestaand = new Set(alleVragen(l).map((v) => v.id))
    return {
      ...l,
      categorieen: l.categorieen.map((c) => {
        if (c.id !== catId) return c
        const vragen = c.vragen.map((v) => leesVraag(d, `v-${v.id}-`, l, v) ?? v)
        const nieuwTekst = tekst(d, "nieuw-tekst", 200)
        if (nieuwTekst) {
          const nieuw = leesVraag(d, "nieuw-", l, { id: nieuwId(nieuwTekst, bestaand) })
          if (nieuw) vragen.push(nieuw)
        }
        return { ...c, naam: tekst(d, "naam", 80) || c.naam, toonBij: alleenBij(d, "toonBij", l), vragen }
      }),
    }
  })
}

export async function nieuweCategorie(d: FormData) {
  const naam = tekst(d, "naam", 80)
  if (!naam) return
  await wijzig((l) => ({ ...l, categorieen: [...l.categorieen, { id: nieuwId(naam, new Set(l.categorieen.map((c) => c.id))), naam, vragen: [] }] }))
}

/** De werkzaamheden, één per regel. Een weggehaalde blijft in oude intakes staan. */
export async function bewaarDiensten(d: FormData) {
  const lijst = regels(tekst(d, "diensten", 3000))
  if (!lijst.length) return
  await wijzig((l) => ({ ...l, diensten: lijst }))
}

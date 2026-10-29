import { SOORTEN, isSoort, nieuweRegel, type Regel, type Soort } from "./calculatie"
import type { Bp, Centen } from "./geld"

// De catalogus: materialen, planten, machines en diensten met hun inkoopprijs
// (masterprompt CRM, module 07; eigenaar: "een calculatiemotor die
// leveranciersprijzen onthoudt"). Een prijswijziging komt in de historie,
// zodat je ziet wat iets vroeger kostte. Een calculatie kopieert de prijs bij
// het invoegen: een oude calculatie verandert dus nooit mee.

export type Prijs = { datum: string; inkoop: Centen; leverancier: string }

export type Item = {
  id: string
  naam: string
  soort: Soort
  eenheid: string
  /** Huidige inkoop excl. btw per eenheid */
  inkoop: Centen
  leverancier: string
  opslag: Bp
  btw: Bp
  afval: Bp
  sku: string
  link: string
  notitie: string
  /** Groep uit de prijslijst van de leverancier, bijv. "OPSLUITBANDEN / MBI" */
  groep?: string
  bijgewerkt: string
  historie: Prijs[]
}

const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

export function nieuwItem(v: Partial<Item> & Pick<Item, "naam">): Item {
  const soort = v.soort && isSoort(v.soort) ? v.soort : "materiaal"
  return {
    id: crypto.randomUUID(),
    soort,
    eenheid: "st",
    inkoop: 0,
    leverancier: "",
    opslag: SOORTEN[soort].opslag,
    btw: SOORTEN[soort].btw,
    afval: 0,
    sku: "",
    link: "",
    notitie: "",
    bijgewerkt: vandaag(),
    historie: [],
    ...v,
  }
}

/** Nieuwe inkoopprijs: de oude gaat de historie in, alleen als hij echt verandert. */
export function zetPrijs(item: Item, inkoop: Centen, leverancier = item.leverancier): Item {
  if (inkoop === item.inkoop && leverancier === item.leverancier) return item
  return {
    ...item,
    inkoop,
    leverancier,
    bijgewerkt: vandaag(),
    historie: [{ datum: item.bijgewerkt, inkoop: item.inkoop, leverancier: item.leverancier }, ...item.historie].slice(0, 50),
  }
}

const plat = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

/** Zoeken op woorden in naam, leverancier, artikelnummer en groep; elk woord moet passen. */
export function zoekItems(items: Item[], q: string): Item[] {
  const woorden = plat(q).split(/\s+/).filter(Boolean)
  if (!woorden.length) return items
  return items.filter((i) => {
    const t = plat(`${i.naam} ${i.leverancier} ${i.sku} ${i.groep ?? ""}`)
    return woorden.every((w) => t.includes(w))
  })
}

/**
 * Wat Claude bij het urenvoorstel van de catalogus te zien krijgt. Met
 * duizenden ingelezen regels gaat niet alles mee: eigen items (zonder groep
 * uit een prijslijst) wel, uit de prijslijsten alleen wat een woord uit de
 * beschrijving deelt, tot `max`.
 */
export function voorClaude(items: Item[], beschrijving: string, max = 80): Item[] {
  const woorden = plat(beschrijving).split(/[^a-z0-9]+/).filter((w) => w.length >= 4)
  // "opsluitbanden" vindt "Opsluitband": het ene woord begint met het andere.
  const past = (w: string) => w.length >= 4 && woorden.some((b) => b.startsWith(w) || w.startsWith(b))
  const eigen = items.filter((i) => !i.groep)
  const passend = items.filter((i) => i.groep && plat(i.naam).split(/[^a-z0-9]+/).some(past))
  return [...eigen, ...passend].slice(0, eigen.length + max)
}

/** Voor het rekenblad in de browser: alleen wat het gebruikt, want met de prijslijsten zijn het duizenden items. */
export const voorRekenblad = (items: Item[]): Item[] =>
  items.map((i) => ({ ...i, historie: [], notitie: "", link: "", sku: "", groep: undefined, bijgewerkt: "" }))

/** Een catalogusitem als regel in een calculatie. */
export const alsRegel = (i: Item, hoeveelheid = 1000): Regel =>
  nieuweRegel(i.soort, { omschrijving: i.naam, eenheid: i.eenheid, inkoop: i.inkoop, opslag: i.opslag, btw: i.btw, afval: i.afval, hoeveelheid, catalogusId: i.id })

// Richtprijzen die Nick al gebruikte in het urenvoorstel (29 okt 2026). Een
// startpunt, geen offerte van een leverancier: controleer ze vóór je ze noemt.
export const START: Item[] = [
  ["Minigraver tot 2 ton", "machine", "dag", 15000, "Bosmans"],
  ["Dumper", "machine", "dag", 10000, ""],
  ["Trilplaat", "machine", "dag", 5000, ""],
  ["Transport machine heen en terug", "bezorging", "post", 7500, ""],
  ["Puincontainer 6 m³", "afvoer", "st", 30000, ""],
  ["Grondcontainer 6 m³", "afvoer", "st", 28000, ""],
  ["Groenafvalcontainer 6 m³", "afvoer", "st", 25000, ""],
  ["Korrelmix / menggranulaat", "materiaal", "ton", 2500, ""],
  ["Straatzand los gestort", "materiaal", "m³", 3000, ""],
  ["Bezorging los gestort", "bezorging", "post", 6000, ""],
  ["Opsluitband", "materiaal", "m", 400, ""],
].map(([naam, soort, eenheid, inkoop, leverancier]) =>
  nieuwItem({ id: `start-${String(naam).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, naam: String(naam), soort: soort as Soort, eenheid: String(eenheid), inkoop: Number(inkoop), leverancier: String(leverancier), notitie: "Richtprijs, controleren", bijgewerkt: "2026-10-29" }),
)

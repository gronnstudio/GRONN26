import "server-only"
import { leesJson, verwijderBestand, wijzigJson } from "@/lib/crm/opslag"
import { isToken } from "@/lib/crm/offerte"
import { kort, volgendWerkbonNummer, type Werkbon, type WerkbonKort } from "@/lib/crm/werkbon"

// Elke werkbon is een eigen document onder een onraadbare sleutel (zoals de
// offerte), met een korte lijst ernaast voor de klantkaart.
const pad = (token: string) => `crm/werkbonnen/${token}.json`
const LIJST = "dashboard/werkbonnen.json"
type Doc = { lijst: WerkbonKort[] }
const leeg = (): Doc => ({ lijst: [] })

export const leesWerkbon = (token: string) => (isToken(token) ? leesJson<Werkbon | null>(pad(token), () => null) : Promise.resolve(null))

export async function leesWerkbonnen(): Promise<WerkbonKort[]> {
  const d = await leesJson<Partial<Doc>>(LIJST, leeg)
  return Array.isArray(d.lijst) ? d.lijst : []
}

/** Een nieuwe werkbon: het nummer wordt in dezelfde schrijf van de lijst gekozen, dus twee tegelijk krijgen nooit hetzelfde (Codex, PR #215). */
export async function nieuweWerkbon(zonder: Omit<Werkbon, "nummer">): Promise<Werkbon> {
  let w: Werkbon = { ...zonder, nummer: "" }
  await wijzigJson<Doc>(LIJST, leeg, (d) => {
    const lijst = Array.isArray(d.lijst) ? d.lijst : []
    w = { ...zonder, nummer: volgendWerkbonNummer(lijst, zonder.datum) }
    return { lijst: [kort(w), ...lijst].sort((a, b) => b.datum.localeCompare(a.datum)) }
  })
  await wijzigJson<Werkbon | null>(pad(w.token), () => null, () => w)
  return w
}

/** Teken alleen als er nog niet getekend is; geeft de getekende werkbon terug, of null. */
export async function tekenWerkbon(token: string, getekend: NonNullable<Werkbon["getekend"]>) {
  if (!isToken(token)) return null
  const w = await wijzigJson<Werkbon | null>(pad(token), () => null, (x) => (x && !x.getekend ? { ...x, getekend } : x))
  if (!w || w.getekend?.op !== getekend.op) return null
  await wijzigJson<Doc>(LIJST, leeg, (d) => ({ lijst: (Array.isArray(d.lijst) ? d.lijst : []).map((x) => (x.token === token ? kort(w) : x)) }))
  return w
}

/** Uit de lijst én het document weg, zodat de oude link ook niets meer toont (Codex, PR #215). */
export async function werkbonWeg(token: string) {
  if (!isToken(token)) return
  await verwijderBestand(pad(token))
  await wijzigJson<Doc>(LIJST, leeg, (d) => ({ lijst: (Array.isArray(d.lijst) ? d.lijst : []).filter((x) => x.token !== token) }))
}

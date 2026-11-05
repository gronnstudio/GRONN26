import "server-only"
import type { BtwRegel } from "./calculatie"
import type { FactuurRegel } from "./factuur-reken"
import type { Centen } from "./geld"
import { leesJson, wijzigJson } from "./opslag"
import { isToken, nieuwToken } from "./offerte"

// Een factuur uit het dashboard (Nick koos "Facturen in het dashboard", 5 nov
// 2026). Net als de offerte een eigen document onder een onraadbare sleutel:
// de link /factuur/<token> toont alleen deze ene factuur. Het bedrag op de
// klantkaart (Stuk) wijst ernaar met `factuur`.

export type Factuur = {
  token: string
  klantId: string
  soort: "Factuur" | "Termijnfactuur"
  nummer: string
  datum: string
  klant: string
  adres: string
  titel: string
  /** Bij een termijn: de offerte waar hij uit komt. */
  offerte?: { nummer: string; token: string }
  regels: FactuurRegel[]
  btw: BtwRegel[]
  totaal: Centen
  /** Mollie-betaallink (verloopt niet), als die er is. */
  betaallink?: string
}

const pad = (token: string) => `crm/facturen/${token}.json`

export { nieuwToken }
export const leesFactuur = (token: string) => (isToken(token) ? leesJson<Factuur | null>(pad(token), () => null) : Promise.resolve(null))
export async function bewaarFactuur(f: Factuur) {
  await wijzigJson<Factuur | null>(pad(f.token), () => null, () => f)
}

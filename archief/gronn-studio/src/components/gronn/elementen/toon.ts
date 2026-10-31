// Twee ondergronden waar elk element op moet kunnen staan: de paletgrond
// (Gouden of Blauwe Uur) en een donker merkvlak (bosgroen of antraciet). Eén type, zodat elk
// element dezelfde vraag stelt: "sta ik op licht of op bos?"
export type Toon = "grond" | "bos"

export const gedempt = (toon: Toon) => (toon === "bos" ? "text-gronn-white/75" : "text-muted")
export const lijn = (toon: Toon) => (toon === "bos" ? "border-gronn-white/20" : "border-line/15")
// Oranje als tekst haalt op bosgroen maar 2,94:1 (donker oranje 1,61:1),
// dus op een donker merkvlak draagt salie het accent (5,7:1 op bosgroen,
// 9,2:1 op antraciet). Oranje blijft daar voor vlakken en tekens.
export const accentTekst = (toon: Toon) => (toon === "bos" ? "text-gronn-light" : "text-[var(--ember-text)]")

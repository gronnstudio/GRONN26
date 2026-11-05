// Posten per fase voor de klant (Nick, 5 nov 2026: "logisch te begrijpen waar kosten vandaan komen").
// Zonder groepen één lijst; regels zonder groep komen als "Overig" achteraan.
export function perGroep<T extends { groep?: string }>(rijen: T[]): { naam: string; rijen: T[] }[] {
  if (!rijen.some((r) => r.groep?.trim())) return [{ naam: "", rijen }]
  const namen = [...new Set(rijen.map((r) => r.groep?.trim() || ""))].sort((a, b) => (a ? (b ? a.localeCompare(b, "nl", { numeric: true }) : -1) : 1))
  return namen.map((naam) => ({ naam: naam || "Overig", rijen: rijen.filter((r) => (r.groep?.trim() || "") === naam) }))
}

// Arbeid verwerkt in de posten (Nick, 5 nov 2026: "niet zo obvious zichtbaar"): elke post krijgt naar
// verhouding een deel, in hele centen; wat overblijft na afronden gaat naar de grootste post. Het totaal
// blijft precies gelijk. Zonder posten met een bedrag blijft de arbeid ongewijzigd (null).
export function metArbeid<T>(rijen: T[], arbeid: number, bedrag: (r: T) => number, zet: (r: T, b: number) => T): T[] | null {
  const basis = rijen.reduce((t, r) => t + Math.max(0, bedrag(r)), 0)
  if (!arbeid) return rijen
  if (basis <= 0) return null
  const delen = rijen.map((r) => Math.floor((arbeid * Math.max(0, bedrag(r))) / basis))
  const rest = arbeid - delen.reduce((t, d) => t + d, 0)
  const grootste = rijen.reduce((g, r, i) => (bedrag(r) > bedrag(rijen[g]) ? i : g), 0)
  delen[grootste] += rest
  return rijen.map((r, i) => zet(r, bedrag(r) + delen[i]))
}

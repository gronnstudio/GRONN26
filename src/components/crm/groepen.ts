// Posten per fase voor de klant (Nick, 5 nov 2026: "logisch te begrijpen waar kosten vandaan komen").
// Zonder groepen één lijst; regels zonder groep komen als "Overig" achteraan.
export function perGroep<T extends { groep?: string }>(rijen: T[]): { naam: string; rijen: T[] }[] {
  if (!rijen.some((r) => r.groep?.trim())) return [{ naam: "", rijen }]
  const namen = [...new Set(rijen.map((r) => r.groep?.trim() || ""))].sort((a, b) => (a ? (b ? a.localeCompare(b, "nl", { numeric: true }) : -1) : 1))
  return namen.map((naam) => ({ naam: naam || "Overig", rijen: rijen.filter((r) => (r.groep?.trim() || "") === naam) }))
}

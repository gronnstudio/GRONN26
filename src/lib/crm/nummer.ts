// Oude nummers met vier cijfers achter de datum tonen we met twee (Nick, 5 nov 2026: "nog steeds 4
// cijfers, fix!"). Alleen voor het oog: wat bewaard is blijft hetzelfde, zodat niets ermee botst.
// GR-O // 202611050001 en GR-O // 2026-1105-0001 worden allebei GR-O // 2026-1105-01.
export function toonNummer(n: string): string {
  const oud = /^(GR-[A-Z]+ \/\/ )(\d{4})(\d{4})(\d{4})$/.exec(n)
  if (oud) return `${oud[1]}${oud[2]}-${oud[3]}-${String(Number(oud[4])).padStart(2, "0")}`
  return n.replace(/^(GR-[A-Z]+ \/\/ \d{4}-\d{4}-)(\d{3,})$/, (_, v: string, nr: string) => `${v}${String(Number(nr)).padStart(2, "0")}`)
}

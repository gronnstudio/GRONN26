import type { ReactNode } from "react"

/**
 * Een tabel die op de telefoon per rij stapelt: elke cel krijgt dan zijn
 * kolomnaam ervoor (via `data-label`), zodat er niets zijwaarts hoeft te
 * scrollen. De eerste kolom is de rijkop.
 */
export function Tabel({
  bijschrift,
  kolommen,
  rijen,
  totaal,
  rechts = [],
}: {
  bijschrift: string
  kolommen: string[]
  rijen: ReactNode[][]
  totaal?: ReactNode[]
  /** Indexen van kolommen die rechts uitlijnen (getallen). */
  rechts?: number[]
}) {
  const cel = (i: number) =>
    `py-3 pr-4 align-top max-sm:flex max-sm:justify-between max-sm:gap-6 max-sm:py-1.5 max-sm:pr-0 max-sm:before:font-mono max-sm:before:text-[11px] max-sm:before:uppercase max-sm:before:tracking-[0.12em] max-sm:before:text-muted max-sm:before:content-[attr(data-label)] ${rechts.includes(i) ? "tabular-nums sm:text-right" : ""}`
  const rij = (cellen: ReactNode[], key: string, extra = "") => (
    <tr key={key} className={`border-b border-line/15 max-sm:block max-sm:py-3 ${extra}`}>
      {cellen.map((c, i) =>
        i === 0 ? (
          <th key={i} scope="row" data-label={kolommen[0]} className={`${cel(i)} font-medium`}>{c}</th>
        ) : (
          <td key={i} data-label={kolommen[i]} className={cel(i)}>{c}</td>
        )
      )}
    </tr>
  )
  return (
    <table data-element="Tabel" className="my-8 w-full border-collapse text-left text-sm">
      <caption className="mb-3 text-left tekst-annotatie text-muted uppercase">{bijschrift}</caption>
      <thead className="max-sm:sr-only">
        <tr className="border-b border-line/15 tekst-annotatie text-muted uppercase">
          {kolommen.map((k, i) => (
            <th key={k} scope="col" className={`py-3 pr-4 font-normal ${rechts.includes(i) ? "text-right" : ""}`}>{k}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rijen.map((r, i) => rij(r, String(i)))}</tbody>
      {totaal && <tfoot>{rij(totaal, "totaal", "font-semibold")}</tfoot>}
    </table>
  )
}


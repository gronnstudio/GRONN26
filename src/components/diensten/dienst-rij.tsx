import type { Service } from "@/lib/data/services"
import { kortePrijs, prijsblok } from "./prijs"

// Rij-raster uit WF-019/WF-031: nr · dienst · wat · prijs · +/−.
const RIJ =
  "grid grid-cols-[32px_minmax(0,1fr)_14px] gap-x-[12px] gap-y-[6px] md:grid-cols-[60px_minmax(0,4fr)_minmax(0,5fr)_minmax(0,2fr)_20px] md:gap-x-[32px] md:gap-y-0"

// Lange samenstellingen breken anders niet af (Chrome kent geen Nederlandse
// afbreekregels): een zacht afbreekstreepje op de naad.
const NAAD: Record<string, string> = { Onderhoudsabonnement: "Onderhouds\u00ADabonnement" }
const afbreekbaar = (t: string) => t.split(" ").map((w) => NAAD[w] ?? w).join(" ")

/** De kolomkoppen boven de rijen; alleen vanaf md, zoals in het wireframe. */
export function DienstKolommen() {
  return (
    <div aria-hidden="true" className={`${RIJ} lbl hidden py-[10px] text-gedempt md:grid`}>
      <span>Nr</span>
      <span>Dienst</span>
      <span>Wat</span>
      <span className="text-right">Prijs incl. btw</span>
      <span />
    </div>
  )
}

function Lijst({ kop, items, gedempt = false }: { kop: string; items: string[]; gedempt?: boolean }) {
  return (
    <div className="min-w-0">
      <h3 className="lbl m-0 mb-[12px] font-normal text-gedempt">{kop}</h3>
      <ul className="m-0 list-none p-0">
        {items.map((i) => (
          <li key={i} className={`border-t border-lijn py-[8px] text-[15px] leading-normal ${gedempt ? "text-gedempt" : ""}`}>
            {i}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Eén dienst als openklapbare rij (WF-031): dicht de naam, één zin en de
 * prijs; open wat erbij hoort, wat niet, en alle prijzen. Native
 * <details>, dus geen JavaScript en vanzelf bedienbaar met het toetsenbord.
 */
export function DienstRij({ nr, dienst }: { nr: string; dienst: Service }) {
  const prijs = prijsblok(dienst)
  return (
    <details className="group border-t border-lijn last:border-b">
      <summary
        className={`${RIJ} cursor-pointer list-none items-baseline py-[20px] md:py-[26px] [&::-webkit-details-marker]:hidden`}
      >
        <span className="lbl">{nr}</span>
        <span className="syne col-start-2 row-start-1 min-w-0 text-[clamp(22px,2.3vw,32px)] leading-[1.1] tracking-[-.02em] [overflow-wrap:anywhere]">
          {afbreekbaar(dienst.title.nl)}
        </span>
        <span className="col-start-2 row-start-2 leading-[1.6] text-gedempt md:col-start-3 md:row-start-1">{dienst.summary.nl}</span>
        <span className="lbl col-start-2 row-start-3 tabular-nums md:col-start-4 md:row-start-1 md:text-right">{kortePrijs(dienst)}</span>
        <span aria-hidden="true" className="col-start-3 row-start-1 text-right text-gedempt md:col-start-5">
          <span className="group-open:hidden">+</span>
          <span className="hidden group-open:inline">−</span>
        </span>
      </summary>
      <div className="pb-[28px] pl-[44px] md:grid md:grid-cols-[60px_minmax(0,1fr)] md:gap-x-[32px] md:pb-[36px] md:pl-0">
        <div className="grid gap-[32px] md:col-start-2 md:grid-cols-2 lg:grid-cols-3">
          <Lijst kop="Wat erbij hoort" items={dienst.includes.map((i) => i.nl)} />
          {dienst.excludes?.length ? <Lijst kop="Wat niet" items={dienst.excludes.map((i) => i.nl)} gedempt /> : null}
          <div className="min-w-0">
            <h3 className="lbl m-0 mb-[12px] font-normal text-gedempt">{prijs.kop}</h3>
            <ul className="m-0 list-none p-0">
              {prijs.regels.map((r) => (
                <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[16px] border-t border-lijn py-[8px] text-[15px] leading-normal">
                  <span>{r.label}</span>
                  <span className="lbl tabular-nums">{r.prijs}</span>
                  {r.noot ? <span className="col-span-2 mt-[4px] text-[13px] text-gedempt">{r.noot}</span> : null}
                </li>
              ))}
            </ul>
            {prijs.verreken ? <p className="m-0 mt-[12px] text-[13px] leading-[1.6] text-gedempt">{prijs.verreken}</p> : null}
          </div>
        </div>
      </div>
    </details>
  )
}

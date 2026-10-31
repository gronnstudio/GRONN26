import type { ReactNode } from "react"

import { lijn, type Toon } from "./toon"

/**
 * Een trefwoord met een dunne lijn — voor rollen en uitgangspunten.
 * 8px radius: de pilvorm is volgens de brand guide voor compacte
 * bediening, en dit is geen knop.
 */
export function Pil({ children, toon = "grond" }: { children: ReactNode; toon?: Toon }) {
  return <span className={`inline-flex rounded-full border px-3 py-2 text-[14px] ${lijn(toon)}`}>{children}</span>
}

/** Een rij pillen als lijst. */
export function PilLijst({ items, toon = "grond", className = "" }: { items: ReactNode[]; toon?: Toon; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item, i) => (
        <li key={i}>
          <Pil toon={toon}>{item}</Pil>
        </li>
      ))}
    </ul>
  )
}

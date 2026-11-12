import type { CSSProperties } from "react"
import { T } from "@/components/taal"
import type { L } from "@/lib/i18n"

// Hoekhaken op een foto, stil (Veldboek, 9 nov 2026): het herkenbare teken
// van de site. Elk kader wijst iets aan wat echt op die foto staat. De
// beweegbare versie met uitleg per kader is ObservatieFoto; deze is voor de
// opening, waar de foto één ding moet zeggen.

export type Haak = {
  /** Kader in procenten van het beeld: links, boven, breedte, hoogte. */
  x: number
  y: number
  b: number
  h: number
  wat: L
  /** Het ene punt dat het verhaal draagt: oranje. */
  kern?: boolean
  /** Label onder het kader in plaats van erboven. */
  onder?: boolean
}

export function Haken({ haken }: { haken: Haak[] }) {
  return (
    <div className="vb-haken" aria-hidden="true">
      {haken.map((k, i) => (
        <span
          key={i}
          className={`vb-haak${k.kern ? " vb-haak-kern" : ""}${k.onder ? " vb-haak-onder" : ""}`}
          style={{ left: `${k.x}%`, top: `${k.y}%`, width: `${k.b}%`, height: `${k.h}%`, "--i": i } as CSSProperties}
        >
          <span className="vb-haak-label"><T t={k.wat} /></span>
        </span>
      ))}
    </div>
  )
}

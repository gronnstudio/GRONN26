import type { CSSProperties } from "react"

// De Weergave-knop (11 okt 2026): dicht de schuifjes, open een waterlelie.
// Ook gebruikt als demo op /techniek. De beweging staat in globals.css (.lelie-*).

/** De schuifjes: een streepje als knop, zonder bolletjes (eigenaar, 10 okt 2026). */
export const SCHUIF = "M3 5.5h3M9 5.5h10M7.5 3v5M3 11h10M16 11h3M14.5 8.5v5M3 16.5h5.5M11.5 16.5H19M10 14v5"

/** Een waterlelie van vijf bladen op het water, op het raster van de menu-iconen (22, lijn 1,8). */
export function LelieBloem() {
  return (
    <g className="lelie-bloem">
      {[-64, -32, 0, 32, 64].map((hoek, n) => (
        <path key={hoek} className="lelie-blad" style={{ "--hoek": `${hoek}deg`, "--n": n } as CSSProperties} d="M11 15c-1.6-2.8-1.4-6.2 0-8.6 1.4 2.4 1.6 5.8 0 8.6Z" />
      ))}
      <path className="lelie-water" d="M3.5 17.5c2.6 1.5 12.4 1.5 15 0" />
    </g>
  )
}

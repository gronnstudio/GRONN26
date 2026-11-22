import { T } from "@/components/taal"

import { FAMILIE } from "@/lib/familie"

// GRØNN Earth, de tuinencyclopedie (was GRØNN Atlas). Adres in src/lib/familie.ts.
export const EARTH_URL = FAMILIE[0].href

// Een flapje links midden aan de rand naar GRØNN Earth (eigenaar, 22 nov
// 2026). Het spiegelbeeld van het Sneltoetsen-lipje rechts; op de telefoon
// staat de knop in de voet.
export function AtlasFlap() {
  return (
    <nav aria-label="GRØNN Earth">
    <a href={EARTH_URL} className="snel-tab atlas-flap">
      <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5h5.5a2 2 0 0 1 1.5.7 2 2 0 0 1 1.5-.7H18v13h-5.5a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0-1.5-1.5H4z" />
        <path d="M11 5.2V19" />
      </svg>
      <span className="snel-tab-tekst">Earth</span>
      <span className="sr-only"><T t={{ nl: ", de tuinencyclopedie", en: ", the garden encyclopedia" }} /></span>
    </a>
    </nav>
  )
}

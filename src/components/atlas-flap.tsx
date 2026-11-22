import { T } from "@/components/taal"

// Een flapje links midden aan de rand naar GRØNN Atlas, de tuinencyclopedie
// (eigenaar, 22 nov 2026: "maak op gronn.studio links nog een flapje met een
// link naar ATLAS"). Het spiegelbeeld van het Sneltoetsen-lipje rechts.
export function AtlasFlap() {
  return (
    <a href="https://gronn-atlas.vercel.app" className="snel-tab atlas-flap">
      <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4.5h5.5a2 2 0 0 1 1.5.7 2 2 0 0 1 1.5-.7H18v13h-5.5a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0-1.5-1.5H4z" />
        <path d="M11 5.2V19" />
      </svg>
      <span className="snel-tab-tekst">Atlas</span>
      <span className="sr-only"><T t={{ nl: ", de tuinencyclopedie", en: ", the garden encyclopedia" }} /></span>
    </a>
  )
}

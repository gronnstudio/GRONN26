// De zin op het doek, per bestemming. Geen nieuwe slogans: de voorpagina
// krijgt de kop van de opening, elke andere pagina haar eigen paginatitel
// (de `title` uit haar metadata; bij de twee projecten de seoTitel uit
// src/lib/data zonder " — GRØNN Studio").

// De openingszin, met "die gezond" in salie (WF-055).
export const OPENINGSZIN = "Een vijver en tuin <em>die gezond</em> blijven."

const TITELS: Record<string, string> = {
  "/vijvers": "Vijvers",
  "/tuinen": "Tuinen",
  "/werk": "Werk",
  "/werk/vijverrenovatie": "Vijverrenovatie met waterval en beekloop",
  "/werk/terras-geulle": "Terras van 24 m² betontegels in Geulle",
  "/over": "Over mij",
  "/kennismaken": "Kennismaken",
  "/faq": "Veelgestelde vragen",
  "/privacy": "Privacyverklaring",
}

/** HTML voor de zin op het doek; alleen vaste teksten uit dit bestand. */
export function zinVoor(pad: string): string {
  if (pad === "/") return OPENINGSZIN
  return TITELS[pad] ?? "GRØNN Studio"
}

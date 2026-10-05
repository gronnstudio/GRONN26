import type { Taal } from "@/components/taal"

// De zin op het doek, per bestemming. Geen nieuwe slogans: de voorpagina
// krijgt de kop van de opening, elke andere pagina haar eigen paginatitel
// (de `title` uit haar metadata; bij de twee projecten de seoTitel uit
// src/lib/data zonder " — GRØNN Studio"). In twee talen; het doek kiest de
// taal op het moment dat het begint (html.en).

// De openingszin, met "die gezond" in salie (WF-055).
const OPENINGSZIN: Record<Taal, string> = {
  nl: "Een vijver en tuin <em>die gezond</em> blijven.",
  en: "A pond and garden <em>that stay</em> healthy.",
}

const TITELS: Record<string, Record<Taal, string>> = {
  "/vijvers": { nl: "Vijvers", en: "Ponds" },
  "/tuinen": { nl: "Tuinen", en: "Gardens" },
  "/werk": { nl: "Werk", en: "Work" },
  "/werk/vijverrenovatie": { nl: "Vijverrenovatie met waterval en beekloop", en: "Pond renovation with waterfall and stream" },
  "/werk/terras-geulle": { nl: "Terras van 24 m² betontegels in Geulle", en: "A 24 m² terrace of concrete tiles in Geulle" },
  "/over": { nl: "Over mij", en: "About me" },
  "/kennismaken": { nl: "Kennismaken", en: "Get in touch" },
  "/faq": { nl: "Veelgestelde vragen", en: "Frequently asked questions" },
  "/privacy": { nl: "Privacyverklaring", en: "Privacy statement" },
}

/** De taal van de pagina nu (html.en), op het moment dat het doek begint. */
export function taalNu(): Taal {
  return document.documentElement.classList.contains("en") ? "en" : "nl"
}

/** HTML voor de openingszin; alleen vaste teksten uit dit bestand. */
export function openingszin(taal: Taal = taalNu()): string {
  return OPENINGSZIN[taal]
}

/** HTML voor de zin op het doek; alleen vaste teksten uit dit bestand. */
export function zinVoor(pad: string, taal: Taal = taalNu()): string {
  if (pad === "/") return OPENINGSZIN[taal]
  return TITELS[pad]?.[taal] ?? "GRØNN Studio"
}

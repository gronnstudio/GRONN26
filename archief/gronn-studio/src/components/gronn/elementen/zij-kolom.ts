/**
 * De zijkolommen op desktop: één maat voor de zijbubbels (`zij-bubbels.tsx`)
 * en wat eronder hangt (`NaarBovenKnop`).
 *
 * Eigenaar, 28 sep 2026: "knop voor naar boven is uit de maat met de
 * docks". De bubbel was 40 breed op 16 van de rand, de knop 56 breed op
 * 24: 16px uit het midden en 16px breder. Nu staan ze in één kolom:
 *
 *   rand     16  — van de schermrand tot de kolom, rechts, links én onder
 *   breedte  44  — bubbel en knop (met ring) even breed; 44 is ook het
 *                  aanklikbare minimum en de hoogte van de kopbalkpil
 *   tussen   16  — van de knop tot de bubbel erboven, gelijk aan de rand
 *
 Verticaal staan beide bubbels in het midden van het scherm (eigenaar,
 * 29 sep 2026: "de zijbalken centreren in midden aan de randen"): links
 * en rechts op dezelfde middellijn, de kolom (rand, breedte) blijft die
 * van de knop. Boven en onder houdt een bubbel even veel vrij: de kopbalk
 * (80) plus `tussen`, 96 — daarmee blijft hij onder ook ruim boven de knop
 * (rand + breedte + tussen = 76). Past hij niet in de hoogte min 2 × 96,
 * dan laat de rechter eerst de tekst van de kalender weg en verdwijnt hij
 * anders helemaal (`useZijPast` in zij-bubbels.tsx). Nooit over de knop of
 * de kopbalk.
 *
 * Alle maten in px (CLAUDE.md, de telefoonnavigatie, punt 1).
 */
export const ZIJ = {
  rand: 16,
  breedte: 44,
  tussen: 16,
  /** De vaste kopbalk op desktop (`h-20` in `[locale]/layout.tsx`). */
  kop: 80,
} as const

/** Van de onderkant van het scherm tot de bovenkant van de naar-bovenknop plus de tussenmaat. */
export const ZIJ_KNOP_VRIJ_PX = ZIJ.rand + ZIJ.breedte + ZIJ.tussen

/**
 * Wat een gecentreerde zijbubbel boven én onder vrijhoudt: de kopbalk plus
 * de tussenmaat. Onder is dat meer dan de knop nodig heeft.
 */
export const ZIJ_BOVEN_VRIJ_PX = ZIJ.kop + ZIJ.tussen

// Als CSS-waarden, met de veilige zones (iPad in liggend formaat met een
// externe muis, of een venster achter een notch) erbij.
export const ZIJ_RECHTS = `max(${ZIJ.rand}px, calc(env(safe-area-inset-right) + 8px))`
export const ZIJ_LINKS = `max(${ZIJ.rand}px, calc(env(safe-area-inset-left) + 8px))`
export const ZIJ_ONDER = `max(${ZIJ.rand}px, calc(env(safe-area-inset-bottom) + 8px))`

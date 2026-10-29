/**
 * De emberkomeet: een dunne boog die de rand van een pil rondgaat.
 *
 * Eén bron voor elke balk die hem draagt — de desktopgroep
 * (`ControlGroup`), de bovenbalk op de telefoon, en de dock in beide
 * standen. Eigenaar, 25 sep 2026: "De comet wil ik ook op de bovenste
 * dock, en de vijf iconen in ingeklapte modus maak dat ook maar een dock
 * met een comet, dan is het gewoon overal hetzelfde."
 *
 * De vorm en de beweging staan in `.orbit-ring` (globals.css), inclusief
 * de stilstand bij minder beweging. Deze component is alleen het
 * element: puur decoratief, buiten de toegankelijkheidsboom, niet
 * aanklikbaar. De ouder moet gepositioneerd en `rounded-full` zijn —
 * staat de boog er los van, dan loopt hij op de hoeken naast de rand.
 */
export function Komeet() {
  return (
    <span
      aria-hidden
      data-komeet
      className="orbit-ring pointer-events-none absolute inset-0 rounded-full"
    />
  )
}

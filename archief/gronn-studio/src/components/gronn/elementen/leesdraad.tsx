/**
 * De leesdraad: een lijn van 2px bovenaan het scherm die van links naar
 * rechts volloopt terwijl je een pagina leest. Eerst alleen op de
 * vijverpagina; sinds 28 sep 2026 één keer in `[locale]/layout.tsx`,
 * dus op elke pagina (eigenaar, uit zijn CodePen: "Voortgangsbalk
 * bovenaan"). De linkpagina valt buiten die layout en heeft hem niet.
 * Pure CSS (`g-leesdraad` in globals.css): `scale` op
 * `animation-timeline: scroll(root block)`, geen JS, geen
 * scrollluisteraar.
 *
 * Alleen onder dezelfde poort als g-in (geen minder beweging, systeem of
 * `data-motion="reduced"`) én met ondersteuning voor scroll(). Anders is
 * hij er helemaal niet (`display: none`): een stilstaande lijn betekent
 * niets. Decoratie — de voortgang staat ook in de scrollbalk — dus
 * `aria-hidden` en `pointer-events: none`.
 *
 * Bosgroen op licht, salie op Blauwe Uur (zoals Stappenlijn en FaseBalk):
 * het ene oranje accent van de pagina blijft bij de inhoud.
 */
export function Leesdraad() {
  return <div aria-hidden data-leesdraad className="g-leesdraad" />
}

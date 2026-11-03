/** @jsxImportSource react */
// ↑ Zoals in vertrouwen.tsx: de testrunner van Playwright zet JSX anders om,
// en tests/e2e/iconen.spec.ts rendert dit element met react-dom/server.
import { pick, type Locale } from "@/lib/i18n"
import {
  DIENST_ICONEN,
  PLANTGROEP_ICONEN,
  randInDonker,
  randInLicht,
  valtWegOp,
  vlakken,
  type DienstId,
  type PlantgroepSlug,
} from "@/lib/iconen"

import type { Toon } from "./toon"

type Gemeen = {
  locale: Locale
  /** Zijde in px (standaard 64). */
  maat?: number
  /** Toont de naam naast de tegel; de tegel zelf wordt dan decoratief. */
  label?: boolean
  /**
   * De naam staat al zichtbaar in de buurt (een kaartkop, een lijstregel):
   * de tegel is dan `aria-hidden` en herhaalt hem niet voor de schermlezer.
   */
  decoratief?: boolean
  /** Ondergrond van het label: paletgrond of een donker merkvlak. */
  toon?: Toon
  /**
   * De randen van de tegel (standaard aan): die van het bord, en de lijn
   * van 1px in `--line` (20 %) voor een tegel die te weinig van de pagina
   * verschilt (< 1,3:1): in Donker `randInDonker` (nu alleen Ontwerp), in
   * Licht `randInLicht` (Aanleg, Onderhoud en de lichte plantgroepen).
   * Uit in een `IcoonVlak` van een dienst: daar is de tegel zijn eigen grond.
   */
  rand?: boolean
  /**
   * Waar de tegel op staat, als dat niet de paginagrond is maar een vlak
   * met een eigen tint (een `bg-paneel-*`-kaart; zie `PANEEL_MOS`). Dan
   * krijgt de tegel de lijn ook op dat vlak, in het thema waarin zijn rand
   * daar onder 1,3:1 zakt: een tegel op een even licht (of even donker)
   * paneel liet anders alleen zwevende vormen zien.
   */
  ondergrond?: { licht: string; donker: string }
  className?: string
}

export type IcoonTegelProps =
  | ({ soort: "dienst"; id: DienstId } & Gemeen)
  | ({ soort: "plantgroep"; id: PlantgroepSlug } & Gemeen)

/**
 * Een icoon van huisstijl Editie 02 als tegel: de drie diensten en de acht
 * plantgroepen uit `src/lib/iconen.ts`. Het icoon zelf is 4 × 4 (de
 * kwartcirkels), met rondom `MARGE` van zijn eigen grond: ruimer gesneden,
 * zoals op de plant- en dienstfiches, zodat de achtergrond meedoet
 * (eigenaar, 29 sep 2026: "je moet de iconen groter snijden zodat de
 * achtergrond er ook deels bij zit"). De vormen blijven exact die van de
 * borden; alleen het kader is groter.
 *
 * De kleuren zijn vaste merkconstanten (in beide thema's gelijk; een tegel
 * is een merkobject, net als een foto) en staan daarom als `fill`-
 * ATTRIBUUT op de paden, nooit in een style-prop: framer-motion cachet
 * SVG-styles (CLAUDE.md, living-system.tsx). Altijd vierkant, zonder
 * afronding: een ronde hoek snijdt in de kwartcirkels van het icoon
 * (eigenaar, 29 sep 2026: "de iconen aub niet afronden, dat doet afbreuk
 * aan"). De 16px van kaarten en foto's geldt dus niet voor een icoon.
 * Waar de rand van het bord van de grond verschilt (Aanleg, Bollen &
 * knollen: een lichte tegel die anders op gebroken wit verdwijnt), tekent
 * hij een lijn van 1px. Komt de tegel dan nog niet los van de pagina
 * (< 1,3:1), dan komt daar de lijn in `--line` 20 % bij: in Donker voor
 * Ontwerp, in Licht voor de lichte tegels (eigenaar, 29 sep 2026: "alle
 * punten zijn prima!" — Onderhoud verdween op de lichte grond). Geen
 * beweging.
 *
 * Toegankelijkheid: met `label` of `decoratief` is de tegel `aria-hidden`
 * (de naam staat er al); anders `role="img"` met de naam als aria-label.
 */
/**
 * Grond rondom het icoon, in rastereenheden (het icoon is 4 breed): 0,75
 * per kant, dus het icoon beslaat 4 / 5,5 ≈ 73 % van de tegel.
 */
export const MARGE = 0.75
const KADER = 4 + 2 * MARGE
const VIEWBOX = `${-MARGE} ${-MARGE} ${KADER} ${KADER}`

export function IcoonTegel(props: IcoonTegelProps) {
  const { locale, maat = 64, label = false, decoratief = false, toon = "grond", rand = true, ondergrond, className = "" } = props

  const icoon = props.soort === "dienst" ? DIENST_ICONEN[props.id] : PLANTGROEP_ICONEN[props.id]
  const naam = pick(icoon.naam, locale)
  // De lijn in `--line` 20 %: per thema waar de tegel op de pagina
  // wegvalt, en op een gegeven ondergrond. De rand van het bord telt mee
  // als hij er staat en zelf genoeg verschilt.
  const bordRand = icoon.rand.toLowerCase() !== icoon.grond.toLowerCase()
  const zichtbareRand = bordRand ? icoon.rand : icoon.grond
  const valtWeg = (g: string) => valtWegOp(icoon.grond, zichtbareRand, g)
  const lijnDonker = randInDonker(icoon.grond) || (!!ondergrond && valtWeg(ondergrond.donker))
  const lijnLicht = randInLicht(icoon.grond, zichtbareRand) || (!!ondergrond && valtWeg(ondergrond.licht))
  const lijnKlasse = lijnDonker && lijnLicht ? "" : lijnDonker ? "hidden dark:inline" : "dark:hidden"
  const paden = vlakken(icoon.vormen, icoon.inkt, icoon.tint)

  const verborgen = label || decoratief

  const tegel = (
    <svg
      viewBox={VIEWBOX}
      width={maat}
      height={maat}
      className={`block shrink-0 ${label ? "" : className}`}
      data-element={label ? undefined : "IcoonTegel"}
      data-icoon={`${props.soort}:${props.id}`}
      focusable="false"
      {...(verborgen ? { "aria-hidden": true } : { role: "img", "aria-label": naam })}
    >
      <rect x={-MARGE} y={-MARGE} width={KADER} height={KADER} fill={icoon.grond} />
      {paden.map((v, i) => (
        <path key={i} d={v.d} fill={v.kleur} />
      ))}
      {rand && bordRand && (
        // Op de rand gecentreerd en half weggeknipt: 1px zichtbaar, binnen de tegel.
        <rect
          x={-MARGE}
          y={-MARGE}
          width={KADER}
          height={KADER}
          fill="none"
          stroke={icoon.rand}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {rand && (lijnDonker || lijnLicht) && (
        // Per thema (`dark:`): antraciet op antraciet in Donker, een
        // lichte tegel op de lichte grond in Licht. Kleur uit het token
        // (`--line`: gebroken wit in Donker, antraciet in Licht), dus als
        // klasse en niet als attribuut; iconen.spec.ts rekent en
        // diensten-tegels.spec.ts meet ≥ 1,3:1 op de grond. De naam
        // `data-donkerrand` is van vóór de Licht-regel en blijft, zodat de
        // specs hem blijven vinden.
        <rect
          data-donkerrand=""
          x={-MARGE}
          y={-MARGE}
          width={KADER}
          height={KADER}
          fill="none"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          className={`${lijnKlasse} stroke-line/20`.trim()}
        />
      )}
    </svg>
  )

  if (!label) return tegel

  return (
    <span data-element="IcoonTegel" className={`inline-flex items-center gap-[12px] ${className}`}>
      {tegel}
      <span
        className={`tekst-knop uppercase tracking-[0.12em] ${toon === "bos" ? "text-gronn-white" : "text-foreground"}`}
      >
        {naam}
      </span>
    </span>
  )
}

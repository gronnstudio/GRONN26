/** @jsxImportSource react */
// ↑ Zoals icoon-tegel.tsx: tests/e2e/iconen.spec.ts rendert dit element
// met react-dom/server, en de testrunner zet JSX anders om.
import type { CSSProperties } from "react"

import type { Locale } from "@/lib/i18n"
import { DIENST_PANEEL, PANEEL_MOS, randInDonker, randInLicht, type DienstId, type PaneelNaam, type PlantgroepSlug } from "@/lib/iconen"

import { IcoonTegel } from "./icoon-tegel"

/** Zijde van de diensttegel en van het blok van 2 × 2, in px. */
const MAAT = 88
/** Eén plantgroeptegel: (88 − 8) / 2. */
const PLANT_MAAT = 40
const PLANT_GAT = 8

type Gemeen = {
  locale: Locale
  /** Verhouding van het vlak, zoals het beeld dat het vervangt (16/10). */
  ratio?: string
  /**
   * Het vlak van het grote blok in een `MetroRaster` (eigenaar, 29 sep
   * 2026: "een groot blok, twee kleine ernaast"): vanaf `lg` vult het de
   * vrije hoogte van de kaart (`flex-1`, geen vaste verhouding) en is de
   * tegel φ keer zo groot (88 → 142px), geschaald als vector. Eronder
   * gewoon het vlak in `ratio`.
   */
  groot?: boolean
  className?: string
}

export type IcoonVlakProps =
  | ({ soort: "dienst"; id: DienstId } & Gemeen)
  | ({ soort: "plantgroepen"; ids: readonly [PlantgroepSlug, PlantgroepSlug, PlantgroepSlug, PlantgroepSlug] } & Gemeen)

/** De paneelklassen, voluit geschreven zodat Tailwind ze vindt. */
const PANEEL_KLASSE: Record<PaneelNaam, string> = {
  antraciet: "bg-paneel-antraciet",
  salie: "bg-paneel-salie",
  oranje: "bg-paneel-oranje",
  mos: "bg-paneel-mos",
}

/**
 * Het beeldvlak van een kaart zonder eigen foto (huisstijl Editie 02,
 * 28 sep 2026: conceptfoto's worden icoontegels). De tegel staat
 * gecentreerd op 44 % van de hoogte, zoals de voorkant van de dienstfiche:
 * iets boven het midden, want een vlak dat onder zijn eigen midden hangt
 * leest als gezakt.
 *
 * De grond is een PANEEL dat met het thema meegaat, geen vaste merkkleur:
 * licht in Licht, een donkere tint in Donker. Voor een dienst dat van zijn
 * niveau (`DIENST_PANEEL`: Ontwerp antraciet, Aanleg salie, Onderhoud
 * oranje) — tot 29 sep 2026 was het de grond van de tegel zelf, en dat
 * waren in Donker grote lichte platen ("te zwaar", coördinator namens de
 * eigenaar). De tegel staat erop met zijn eigen grond en marge, zoals op
 * Beplanting.
 *
 * `soort="plantgroepen"` zet vier plantgroeptegels in een raster van
 * 2 × 2 (40px, tussenruimte 8px: samen even groot als één diensttegel) op
 * het mospaneel, `bg-paneel-mos` — voor Beplanting: mosgroen licht
 * (#DEE0D9) in Licht, de donkere mostint (#282B27) in Donker (eigenaar,
 * 29 sep 2026: "alle punten zijn prima!").
 *
 * Het paneel volgt het thema, dus het is een token-klasse en geen
 * style-prop. De tegels krijgen het paneel als `ondergrond` en daarmee de
 * lijn van 1px waar ze erop onder 1,3:1 zakken (Onderhoud in Licht,
 * Ontwerp in Donker). Het vlak zelf komt in geen van beide thema's los van
 * de kaart (elk paneel ligt op de lichtheid van de grond), dus onderaan
 * altijd een lijn van 1px in `--line` 20 %.
 *
 * Decoratief: `aria-hidden`, en nooit een conceptlabel, want het is geen
 * foto en doet zich ook niet zo voor. Geen beweging.
 */
export function IcoonVlak(props: IcoonVlakProps) {
  const { locale, ratio = "16/10", groot = false, className = "" } = props
  // De grond is altijd een paneel dat met het thema meegaat: dat van het
  // niveau (DIENST_PANEEL), of het mospaneel voor de plantgroepen.
  const paneel = props.soort === "dienst" ? DIENST_PANEEL[props.id] : { naam: "mos" as const, ...PANEEL_MOS }
  const ondergrond = { licht: paneel.licht, donker: paneel.donker }
  const lijnDonker = randInDonker(paneel.donker)
  const lijnLicht = randInLicht(paneel.licht)
  const lijn =
    lijnDonker && lijnLicht
      ? "border-b border-line/20"
      : lijnDonker
        ? "dark:border-b dark:border-line/20"
        : lijnLicht
          ? "border-b border-line/20 dark:border-b-0"
          : ""

  return (
    <span
      aria-hidden
      data-element="IcoonVlak"
      data-vlak={props.soort === "dienst" ? `dienst:${props.id}` : "plantgroepen"}
      data-paneel={paneel.naam}
      className={`relative block overflow-hidden ${groot ? "aspect-(--vlak-ratio) lg:aspect-auto lg:flex-1" : ""} ${PANEEL_KLASSE[paneel.naam]} ${lijn} ${className}`}
      // Het grote blok krijgt de verhouding als variabele: een style-prop
      // wint van elke klasse, en vanaf lg moet hij uit.
      style={(groot ? { "--vlak-ratio": ratio } : { aspectRatio: ratio }) as CSSProperties}
    >
      <span
        className={`absolute top-[44%] left-1/2 block -translate-x-1/2 -translate-y-1/2 ${groot ? "lg:scale-[1.618]" : ""}`}
        style={{ width: MAAT, height: MAAT }}
      >
        {props.soort === "dienst" ? (
          <IcoonTegel soort="dienst" id={props.id} maat={MAAT} decoratief ondergrond={ondergrond} locale={locale} />
        ) : (
          <span className="grid grid-cols-2" style={{ gap: PLANT_GAT }}>
            {props.ids.map((id) => (
              <IcoonTegel key={id} soort="plantgroep" id={id} maat={PLANT_MAAT} decoratief ondergrond={ondergrond} locale={locale} />
            ))}
          </span>
        )}
      </span>
    </span>
  )
}

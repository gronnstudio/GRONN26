import type { CSSProperties, ReactNode } from "react"

import { guldenSpiraal, metroIndeling, metroKolommen, PHI, type MetroPlek } from "@/lib/metro"
import { cn } from "@/lib/utils"

// Het metroraster (eigenaar, 29 sep 2026, over de dienstkaarten: "waarom
// zit hier hoogte verschil? we kunnen metro aanhouden als dat mooi
// uitziet, een groot blok, twee kleine ernaast, beetje golden ratio
// principe aanhouden en daar op de achtergrond ook zo'n curve
// achterzetten"). Later die dag stuurde hij het plaatje erbij: de gulden
// rechthoek, verdeeld in vierkanten, met de spiraal erdoor.

/** De sporen vanaf lg: blok : klein = φ : 1, links of rechts (`metroKolommen`). */
const KOLOMMEN = metroKolommen(16)

/** De spiraal in eenheden van 1000: viewBox 1618,034 × 1000. */
const SPIRAAL = guldenSpiraal()

/** Waar de grens tussen het grote vierkant en de strook in de viewBox ligt, als deel van de breedte (1/φ ≈ 61,8 %). */
const GRENS = SPIRAAL.hoogte / SPIRAAL.breedte

/** 1/φ en 1/φ², voor de grens binnen de eenheid (zie `Spiraal`). */
const EEN_DOOR_PHI = (1 / PHI).toFixed(6)
const EEN_DOOR_PHI2 = (1 / (PHI * PHI)).toFixed(6)

/**
 * De gulden spiraal achter één eenheid, in fijne lijnen (1px, de
 * lijntaal van de site: maatlijnen, geen vlak). Hij hangt in het grote
 * blok en is even hoog als de eenheid; het grote vierkant ligt achter het
 * blok, de grens met de strook precies in de tussenruimte van 16px, de
 * strook achter de twee kleine kaarten. Een eenheid is hoger dan haar
 * breedte gedeeld door φ, dus de spiraal (φ × de hoogte) is breder dan
 * het raster en de bogen steken aan beide kanten uit — daar, in de marge
 * en in de tussenruimtes van 16px, zie je hem. De sectie knipt hem af
 * (`overflow-clip`).
 *
 * Twee lagen:
 *  - de bogen (`--line` 28 %), vrij, ook in de marge;
 *  - de snedes tussen de vierkanten (`--line` 12 %), zonder de buitenrand
 *    van de rechthoek en geknipt tot de eenheid zelf (coördinator namens
 *    de eigenaar, 29 sep 2026: de bovenrand liep als een losse liniaal
 *    door de marge). Daarvoor een laag zo groot als de eenheid, met
 *    `overflow-hidden`: het blok is 100 %, de eenheid φ × het blok + 16px.
 *
 * Geometrisch waar: de viewBox is φ : 1 en de breedte volgt uit de hoogte
 * (`aspect-ratio`), nooit `preserveAspectRatio="none"`. Gespiegeld als
 * het blok rechts staat. Decoratief (`aria-hidden`, geen klik), stil:
 * geen beweging, dus ook niets voor minder beweging. In Licht antraciet,
 * in Donker gebroken wit; geen oranje, het ene accent van de pagina is
 * elders.
 */
function Spiraal({ gespiegeld }: { gespiegeld: boolean }) {
  const viewBox = `0 0 ${SPIRAAL.breedte} ${SPIRAAL.hoogte}`
  const verhouding = `${SPIRAAL.breedte} / ${SPIRAAL.hoogte}`
  const svgKlasse = "pointer-events-none absolute top-0 h-full w-auto max-w-none overflow-visible"
  // Bogen, ten opzichte van het blok. Normaal: de grens (61,8 % van de
  // breedte) op 8px rechts van het blok. Gespiegeld: omgeklapt ligt de
  // grens op 38,2 %, 8px links van het blok.
  const bogen: CSSProperties = gespiegeld
    ? { left: -8, translate: `${-(1 - GRENS) * 100}% 0`, scale: "-1 1" }
    : { left: "calc(100% + 8px)", translate: `${-GRENS * 100}% 0` }
  // Snedes, ten opzichte van de eenheid (breedte E = φ × blok + 16): het
  // blok is (E − 16)/φ breed, de kleine kolom (E − 16)/φ².
  const snedes: CSSProperties = gespiegeld
    ? { left: `calc((100% - 16px) * ${EEN_DOOR_PHI2} + 8px)`, translate: `${-(1 - GRENS) * 100}% 0`, scale: "-1 1" }
    : { left: `calc((100% - 16px) * ${EEN_DOOR_PHI} + 8px)`, translate: `${-GRENS * 100}% 0` }
  return (
    <>
      <span
        aria-hidden
        data-metro-snedes=""
        className={`pointer-events-none absolute top-0 -z-10 hidden h-full overflow-hidden lg:block ${gespiegeld ? "right-0" : "left-0"}`}
        style={{ width: `calc(100% * ${PHI.toFixed(6)} + 16px)` }}
      >
        <svg aria-hidden focusable="false" viewBox={viewBox} className={svgKlasse} style={{ ...snedes, aspectRatio: verhouding }}>
          <path d={SPIRAAL.snedes} fill="none" strokeWidth={1} vectorEffect="non-scaling-stroke" className="stroke-line/12" />
        </svg>
      </span>
      <svg
        aria-hidden
        focusable="false"
        data-metro-spiraal=""
        viewBox={viewBox}
        className={`${svgKlasse} -z-10 hidden lg:block`}
        style={{ ...bogen, aspectRatio: verhouding }}
      >
        <path d={SPIRAAL.boog} fill="none" strokeWidth={1} vectorEffect="non-scaling-stroke" className="stroke-line/28" />
      </svg>
    </>
  )
}

/**
 * Een lijst kaarten als metroraster. Vanaf `lg` twee kolommen in de gulden
 * snede (φ : 1, tussenruimte 16px; drie sporen, zodat het brede spoor van
 * kant kan wisselen) en per drie kaarten één eenheid: een
 * groot blok van twee rijen met twee kleine kaarten ernaast, om en om
 * links en rechts, met de gulden spiraal erachter. Eén kaart over wordt
 * een brede, liggende kaart; twee kaarten over een paar in dezelfde
 * kolommen (`metroIndeling` in `src/lib/metro.ts`). Omdat alles in één
 * raster staat en elke kaart de hoogte van haar vak vult, liggen boven-
 * en onderkanten van een eenheid precies op dezelfde lijnen.
 *
 * Onder `lg` geen metro: één kolom, vanaf `sm` twee, zoals elke lijst
 * kaarten. `voorkeur` kiest per eenheid het grote blok (anders de eerste);
 * `vak` tekent de kaart en krijgt haar plek mee (`plek.rol`), zodat de
 * pagina de kaart de juiste `vorm` kan geven.
 *
 * Elke `<li>` is `relative` (voor een laag als Sneeuw) en draagt
 * `data-metro-rol`, `data-metro-eenheid` en, gespiegeld,
 * `data-metro-gespiegeld`; de lijst is `isolate`, zodat de spiraal (−z)
 * boven de grond van de sectie en onder de kaarten ligt.
 */
export function MetroRaster<T>({
  items,
  sleutel,
  voorkeur,
  vak,
  className,
}: {
  items: readonly T[]
  sleutel: (item: T) => string
  voorkeur?: (item: T) => boolean
  vak: (item: T, plek: MetroPlek<T>) => ReactNode
  className?: string
}) {
  const plekken = metroIndeling(items, voorkeur)
  return (
    <ul
      data-element="MetroRaster"
      data-phi={PHI.toFixed(3)}
      className={cn("relative isolate grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:[grid-template-columns:var(--metro-kolommen)]", className)}
      style={{ "--metro-kolommen": KOLOMMEN } as CSSProperties}
    >
      {plekken.map((p) => (
        <li
          key={sleutel(p.item)}
          data-metro-rol={p.rol}
          data-metro-eenheid={p.eenheid}
          data-metro-gespiegeld={p.gespiegeld ? "" : undefined}
          className="relative lg:[grid-column:var(--metro-kolom)] lg:[grid-row:var(--metro-rij)]"
          style={{ "--metro-kolom": p.kolom, "--metro-rij": p.rij } as CSSProperties}
        >
          {p.rol === "groot" && <Spiraal gespiegeld={p.gespiegeld} />}
          {vak(p.item, p)}
        </li>
      ))}
    </ul>
  )
}

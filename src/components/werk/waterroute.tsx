"use client"

import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import type { L } from "@/lib/i18n"

// De waterroute van de vijverrenovatie, getekend zoals in WF-021 en alleen uit
// de projecttekst: B → pomp → driekamerfilter → splitsing in twee regelbare
// takken → vijver A en de waterval; waterval → beekloop → B; A → afvoer en
// overloop → B. De route staat er nog eens als lijst onder, omdat de tekening
// op een telefoon te klein is om te lezen, en voor schermlezers.

// Een clientcomponent alleen voor het aria-label in de gekozen taal; de
// woorden in de tekening staan er in beide talen (tspan met t-nl/t-en).

const STAPPEN: L[] = [
  { nl: "Vijver B is het vertrekpunt van het opgepompte water.", en: "Pond B is where the pumped water starts." },
  { nl: "Via de pomp gaat het water naar het driekamerfilter.", en: "Through the pump, the water goes to the three-chamber filter." },
  {
    nl: "Na de filtratie wordt het verdeeld over twee takken: één richting vijver A en één richting de waterval.",
    en: "After filtration it is divided over two branches: one towards pond A and one towards the waterfall.",
  },
  { nl: "Het water van de waterval loopt via de beekloop terug naar vijver B.", en: "The water from the waterfall runs back to pond B via the stream." },
  { nl: "Vijver A voert via de afvoer- en overloopverbinding terug naar vijver B.", en: "Pond A drains back to pond B via the outlet and overflow connection." },
]

/** Een woord in de tekening in beide talen. */
function W({ nl, en }: { nl: string; en: string }) {
  return (
    <>
      <tspan className="t-nl">{nl}</tspan>
      <tspan className="t-en">{en}</tspan>
    </>
  )
}

export function Waterroute() {
  const taal = useTaal()
  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 640 460"
        role="img"
        aria-label={
          taal === "en"
            ? "The water route: from pond B through pump and filter to pond A and the waterfall, and back to pond B via the stream."
            : "De waterroute: van vijver B via pomp en filter naar vijver A en de waterval, en via de beekloop terug naar vijver B."
        }
        className="mx-auto block h-auto w-full max-w-[900px] font-sans text-inkt"
      >
        <g className="fill-none stroke-current" strokeWidth={1}>
          <path d="M120 380 V300 H200" />
          <path d="M260 300 H330" />
          <path d="M410 300 H450 V190" />
          <path d="M450 190 V110 H510" />
          <path d="M450 190 H330 V130" />
          <path d="M555 130 V400 H200" strokeDasharray="4 4" />
          <path d="M230 105 H150 V366" strokeDasharray="4 4" />
        </g>
        <g className="fill-salie stroke-current dark:fill-mos">
          <ellipse cx="120" cy="400" rx="80" ry="34" />
          <ellipse cx="300" cy="105" rx="70" ry="28" />
        </g>
        <g className="fill-grond stroke-current">
          <rect x="200" y="285" width="60" height="30" />
          <rect x="330" y="280" width="80" height="40" />
          <rect x="510" y="90" width="90" height="40" />
        </g>
        <circle cx="450" cy="190" r="4" className="fill-current" />
        <g className="fill-current text-[11px] tracking-[.06em]">
          <text x="82" y="404"><W nl="VIJVER B" en="POND B" /></text>
          <text x="212" y="304"><W nl="POMP" en="PUMP" /></text>
          <text x="344" y="304">FILTER</text>
          <text x="462" y="194"><W nl="SPLITSING" en="SPLIT" /></text>
          <text x="264" y="109"><W nl="VIJVER A" en="POND A" /></text>
          <text x="522" y="114"><W nl="WATERVAL" en="WATERFALL" /></text>
        </g>
        <g className="fill-gedempt text-[10px] tracking-[.06em]">
          <text x="565" y="300"><W nl="BEEKLOOP" en="STREAM" /></text>
          <text x="200" y="272">AQUAFORTE DM-10000 VARIO S</text>
          <text x="330" y="340"><W nl="3 KAMERS · BYPASS" en="3 CHAMBERS · BYPASS" /></text>
          <text x="340" y="182"><W nl="50 MM DRUK-PVC" en="50 MM PRESSURE PVC" /></text>
          <text x="462" y="212"><W nl="2 TAKKEN" en="2 BRANCHES" /></text>
          <text x="462" y="226"><W nl="REGELBAAR" en="ADJUSTABLE" /></text>
        </g>
      </svg>
      <figcaption className="mt-8 max-w-[900px]">
        <ol className="lbl m-0 list-none p-0 normal-case">
          {STAPPEN.map((s, i) => (
            <li key={s.nl} className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 border-t border-lijn py-2.5 last:border-b md:grid-cols-[60px_minmax(0,1fr)] md:gap-x-8">
              <span className="text-gedempt">{String(i + 1).padStart(2, "0")}</span>
              <span><T t={s} /></span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}

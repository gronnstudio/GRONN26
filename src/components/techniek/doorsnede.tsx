"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { T } from "@/components/taal"
import { ZONES } from "@/lib/data/techniek"

// De site als vijver in doorsnede (/techniek, 11 okt 2026). Een lijntekening
// in de taal van een bestek: gearceerde grond, het peil met een driehoekje,
// genummerde punten. Kies een deel (de knoppen onder de tekening of de punten
// erin) en het licht oranje op; eronder staat wat het in een vijver doet, wat
// het op de site doet, en het gereedschap dat erbij hoort.

const PUNTEN: Record<string, [number, number]> = {
  oever: [150, 96],
  oppervlak: [540, 222],
  water: [520, 350],
  instroom: [150, 336],
  filter: [1050, 92],
  peil: [722, 140],
}

const KOM = "M262 200C330 200 352 320 420 396C486 468 690 482 762 418C832 356 850 200 900 200"

export function Doorsnede() {
  const [kies, setKies] = useState("oppervlak")
  const zone = ZONES.find((z) => z.id === kies) ?? ZONES[0]
  const aan = (id: string) => (id === kies ? "aan" : undefined)
  const kader = useRef<HTMLDivElement>(null)

  // op de telefoon schuift de tekening naar het gekozen deel
  useEffect(() => {
    const k = kader.current
    if (!k || k.scrollWidth <= k.clientWidth) return
    const x = (PUNTEN[kies][0] / 1200) * k.scrollWidth - k.clientWidth / 2
    k.scrollTo({ left: x, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }, [kies])

  return (
    <div className="dz">
      <div className="dz-tekening" ref={kader}>
        <svg viewBox="0 0 1200 520" role="img" aria-label="Doorsnede van een vijver met oever, oppervlak, waterkolom, instroom, filter en peilschaal" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <pattern id="dz-arcering" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="14" className="dz-arcering" />
            </pattern>
            <clipPath id="dz-kom">
              <path d={`${KOM}Z`} />
            </clipPath>
            <clipPath id="dz-onder-peil">
              <rect x="0" y="222" width="1200" height="300" />
            </clipPath>
          </defs>

          {/* grond, met de kom eruit */}
          <path d={`M0 200H262${KOM.slice(KOM.indexOf("C"))}H1200V520H0Z`} fill="url(#dz-arcering)" stroke="none" />
          <path d={`M0 200H262M900 200H1200`} />

          {/* waterkolom: het water in de kom, onder het peil */}
          <g data-zone="water" className={aan("water")}>
            <path d={`${KOM}Z`} className="dz-vlak dz-water" stroke="none" clipPath="url(#dz-onder-peil)" />
            <g clipPath="url(#dz-kom)" className="dz-golfjes">
              {[262, 300, 340, 380, 420].map((y) => (
                <path key={y} d={`M300 ${y}h${560 - (y - 262)}`} strokeDasharray="2 14" className="dz-dun" />
              ))}
            </g>
            <path d={KOM} className="dz-vorm" />
          </g>

          {/* oppervlak: het peil, een lelieblad en riet */}
          <g data-zone="oppervlak" className={aan("oppervlak")}>
            <path d="M286 222H880" strokeDasharray="10 8" className="dz-vorm" />
            <path className="dz-rimpel dz-vorm" d="M380 222c10-6 20-6 30 0s20 6 30 0M600 222c10-6 20-6 30 0s20 6 30 0" />
            <ellipse cx="470" cy="221" rx="34" ry="6" className="dz-vlak dz-vorm" />
            <path d="M470 221l18-4" />
            <path d="M836 222V150M846 222V132M856 222V160M828 222V170" className="dz-vorm" />
            <path d="M846 132c-4 0-6 4-6 10s2 10 6 10 6-4 6-10-2-10-6-10Z" className="dz-vlak dz-vorm" />
            <path d="M300 212l8 10 8-10Z" className="dz-vorm" />
            <text x="324" y="212" className="dz-tekst">PEIL 0</text>
          </g>

          {/* oever: telefoon op een statiefje */}
          <g data-zone="oever" className={aan("oever")}>
            <path d="M150 200l-16-48M150 200l16-48M150 200v-48" className="dz-vorm" />
            <rect x="134" y="120" width="32" height="32" rx="4" className="dz-vlak dz-vorm" />
            <circle cx="150" cy="136" r="7" className="dz-vorm" />
            <path d="M184 136h60" strokeDasharray="2 6" className="dz-dun" />
          </g>

          {/* instroom: een leiding door de linkerwand */}
          <g data-zone="instroom" className={aan("instroom")}>
            <path d="M0 330h372M0 344h382" className="dz-vorm" />
            <path d="M0 330v14" />
            <path d="M386 337l18 0M394 329l12 8-12 8" className="dz-vorm" />
          </g>

          {/* filter: een bak op de oever, met een waterval terug de vijver in */}
          <g data-zone="filter" className={aan("filter")}>
            <rect x="990" y="120" width="124" height="80" rx="6" className="dz-vlak dz-vorm" />
            <path d="M1006 140h92M1006 156h92M1006 172h92" strokeDasharray="4 6" className="dz-dun" />
            <path d="M990 150H912c-6 0-10 4-10 10v12" className="dz-vorm" />
            <path d="M902 180c0 14-4 26-10 38" strokeDasharray="3 5" className="dz-vorm" />
            <path d="M1114 180h40v40" className="dz-vorm" />
          </g>

          {/* peilschaal */}
          <g data-zone="peil" className={aan("peil")}>
            <rect x="712" y="160" width="20" height="270" rx="2" className="dz-vlak dz-vorm" />
            {Array.from({ length: 13 }, (_, i) => (
              <path key={i} d={`M712 ${176 + i * 20}h${i % 2 ? 8 : 14}`} className="dz-vorm" />
            ))}
          </g>

          {/* maatlijn: diepte van peil tot bodem, als in een bestek */}
          <g aria-hidden="true">
            <path d="M650 226V472M642 226h16M642 472h16" className="dz-dun" />
            <text x="662" y="350" className="dz-tekst">120 CM</text>
            <text x="40" y="190" className="dz-tekst">MAAIVELD</text>
            <text x="40" y="500" className="dz-tekst">DOORSNEDE A–A · 1:50</text>
          </g>

          {/* de genummerde punten; de knoppen eronder zijn het toegankelijke deel */}
          <g aria-hidden="true">
            {ZONES.map((z, i) => {
              const [x, y] = PUNTEN[z.id]
              return (
                <g key={z.id} className={`dz-punt ${aan(z.id) ?? ""}`} onClick={() => setKies(z.id)} transform={`translate(${x} ${y})`}>
                  <circle r="22" />
                  <text y="5.5" textAnchor="middle">{String(i + 1).padStart(2, "0")}</text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="dz-knoppen" role="group" aria-label="Kies een deel van de vijver">
        {ZONES.map((z, i) => (
          <button key={z.id} type="button" aria-pressed={z.id === kies} onClick={() => setKies(z.id)} className="knop-klein dz-knop">
            <span aria-hidden="true" className="tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
            <T t={z.naam} />
          </button>
        ))}
      </div>

      <div className="dz-uitleg" aria-live="polite" key={zone.id}>
        <div className="dz-uitleg-kop">
          <p className="lbl m-0 text-gedempt">
            {String(ZONES.indexOf(zone) + 1).padStart(2, "0")} · {zone.delen.length} <T t={{ nl: "onderdelen", en: "parts" }} />
          </p>
          <h2 className="syne m-0 text-[clamp(40px,6vw,88px)] leading-[.95] tracking-[-.04em]">
            <T t={zone.naam} />
          </h2>
          <dl className="dz-twee">
            <div>
              <dt className="lbl text-gedempt"><T t={{ nl: "In een vijver", en: "In a pond" }} /></dt>
              <dd><T t={zone.vijver} /></dd>
            </div>
            <div>
              <dt className="lbl text-oranje-tekst"><T t={{ nl: "Op de site", en: "On the site" }} /></dt>
              <dd><T t={zone.site} /></dd>
            </div>
          </dl>
        </div>
        <ul className="dz-delen m-0 list-none p-0">
          {zone.delen.map((d, i) => (
            <li key={d.naam} style={{ "--i": i } as CSSProperties}>
              <span className="syne dz-naam">{d.naam}</span>
              <span className="lbl text-gedempt"><T t={d.soort} /></span>
              <span className="dz-wat"><T t={d.wat} /></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

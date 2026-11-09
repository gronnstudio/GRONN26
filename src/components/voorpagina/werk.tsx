import Link from "next/link"
import { Foto } from "@/components/foto"
import { Figuur, LijnLink, Maatlijn, Markering } from "@/components/ontwerp"
import { T } from "@/components/taal"
import { TERRAS, TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { VIJVER } from "@/lib/data/vijverrenovatie"
import { F01, F02_2, F11 } from "./beelden"

// 03 Werk: de vijverrenovatie als korte reeks, op het diepe vlak. Ervoor
// (staand), nu (liggend, verschoven), tijdens (Nick bij de beekloop) en de
// maten uit de projectdata, als op een tekening. Elk getal staat in
// src/lib/data/vijverrenovatie.ts; hier wordt niets bijgeschat.
// Daaronder het tweede project als één regel.

const SPEC = [
  { k: { nl: "Vijvers", en: "Ponds" }, w: { nl: "2, één systeem", en: "2, one system" } },
  { k: { nl: "Open water", en: "Open water" }, w: { nl: "± 5.000 l", en: "± 5,000 l" } },
  { k: { nl: "Leidingwerk", en: "Pipework" }, w: { nl: "50 mm druk-pvc", en: "50 mm pressure PVC" } },
  { k: { nl: "Filter", en: "Filter" }, w: { nl: "3 kamers", en: "3 chambers" } },
  { k: { nl: "Werk", en: "Work" }, w: { nl: "± 120 uur", en: "± 120 hours" } },
]

export function Werk() {
  return (
    <section className="donker vlak-diep sectie-ruim" aria-labelledby="h-werk">
      <div className="wrap">
        <Markering nr="03" naam={{ nl: "Werk", en: "Work" }} />
        <div className="raster werk-reeks">
          <div className="werk-kopblok">
            <p className="meta m-0 text-gedempt">
              GR/001 · <T t={{ nl: VIJVER.categorie, en: VIJVER.en.categorie }} /> · 2026 · <T t={{ nl: VIJVER.status, en: VIJVER.en.status }} />
            </p>
            <h2 id="h-werk" className="t-h2 werk-kop opkomst">
              <T t={{ nl: VIJVER.titel, en: VIJVER.en.titel }} />
            </h2>
          </div>
          <Figuur
            foto={F02_2}
            sizes="(min-width: 768px) 30vw, 50vw"
            vorm="aspect-[3/5]"
            bijschrift={{ nl: "Ervoor: de oude vijver tegen de muur", en: "Before: the old pond against the wall" }}
            className="werk-ervoor opkomst"
          />
          <Figuur
            foto={F11}
            sizes="(min-width: 768px) 25vw, 50vw"
            vorm="aspect-[4/5]"
            bijschrift={{ nl: "Tijdens: de beekloop in aanbouw, juli", en: "During: the stream under construction, July" }}
            className="werk-tijdens opkomst"
          />
          <div className="werk-nu opkomst">
            <Maatlijn><T t={{ nl: "Waterlijn ± 12 m", en: "Waterline ± 12 m" }} /></Maatlijn>
            <Figuur
              foto={F01}
              sizes="(min-width: 768px) 60vw, 100vw"
              vorm="aspect-[4/3]"
              bijschrift={{ nl: "Nu: de tuin tijdens de afronding", en: "Now: the garden during finishing" }}
              code="F01"
              className="mt-3"
            />
          </div>
          <div className="werk-spec opkomst">
            <dl className="spec">
              {SPEC.map((s, i) => (
                <div key={i}>
                  <dt className="meta"><T t={s.k} /></dt>
                  <dd><T t={s.w} /></dd>
                </div>
              ))}
            </dl>
            <LijnLink href="/werk/vijverrenovatie" className="meta mt-6">
              <T t={{ nl: "Bekijk het project", en: "See the project" }} />
            </LijnLink>
          </div>
        </div>

        <Link href="/werk/terras-geulle" className="werk-volgend">
          <Foto foto={TERRAS_FOTOS.hoofd} sizes="160px" className="werk-volgend-beeld" />
          <span className="meta text-gedempt">GR/002 · <T t={{ nl: TERRAS.categorie, en: TERRAS.en.categorie }} /> · Geulle</span>
          <span className="t-h3"><T t={{ nl: TERRAS.titel, en: TERRAS.en.titel }} /></span>
          <span className="werk-volgend-pijl" aria-hidden>→</span>
        </Link>
        <LijnLink href="/werk" className="meta mt-4">
          <T t={{ nl: "Al het werk", en: "All work" }} />
        </LijnLink>
      </div>
    </section>
  )
}

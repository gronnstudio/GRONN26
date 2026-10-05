import type { CSSProperties } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { OVER_MIJ } from "@/lib/data/teksten"
import { F01, F04_2, F05, F07_1, F08_2, F10, F11, T01, T02 } from "./beelden"

// WF-058 (Uncode "portfolio-atelier"), van de opening tot en met de onderkant
// van de fotocollage. Volgt licht/donker. De beweging zit in beweging.tsx; zonder
// JS of met minder beweging staat alles stil en is alles zichtbaar.

export const KOP = "Een vijver en tuin die gezond blijven."
export const ZIN =
  "Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf."
const LABEL = "Vijvers en tuinen · Stein en omgeving"

const i = (n: number) => ({ "--i": n }) as CSSProperties

/** Tekst in losse woorden, zodat ze één voor één kunnen oplichten. */
function Woorden({ tekst }: { tekst: string }) {
  return (
    <>
      {tekst
        .split(/(\s+)/)
        .filter(Boolean)
        .map((d, n) =>
          /^\s+$/.test(d) ? (
            " "
          ) : (
            <span key={n} className="vp-wd">
              {d}
            </span>
          ),
        )}
    </>
  )
}

type Stuk = { foto: FotoData; vorm: "staand" | "vierkant" | "liggend"; v: number; top: string; left: string }

// Posities en snelheden zoals in het wireframe (gemeten op de demo).
const COLLAGE_A: Stuk[] = [
  { foto: F01, vorm: "staand", v: 0.5, top: "0", left: "5%" },
  { foto: T02, vorm: "vierkant", v: 3, top: "10.61%", left: "56.74%" },
  { foto: F10, vorm: "liggend", v: 0, top: "39.21%", left: "20.83%" },
  { foto: F05, vorm: "staand", v: 0.5, top: "70.51%", left: "52.5%" },
]
const COLLAGE_B: Stuk[] = [
  { foto: F11, vorm: "vierkant", v: 3, top: "0", left: "9.24%" },
  { foto: F04_2, vorm: "liggend", v: 0, top: "31.95%", left: "20.83%" },
  { foto: T01, vorm: "staand", v: 0.5, top: "66.97%", left: "5%" },
  { foto: F07_1, vorm: "vierkant", v: 3, top: "78.89%", left: "56.74%" },
]

const SIZES = { staand: "(min-width: 768px) 43vw, 43vw", vierkant: "34vw", liggend: "59vw" }

function Collage({ stukken, klasse }: { stukken: Stuk[]; klasse: string }) {
  return (
    <div className={`vp-collage ${klasse}`}>
      {stukken.map((s) => (
        <figure key={s.foto.src} className={`vp-stuk vp-${s.vorm}`} data-v={s.v} style={{ top: s.top, left: s.left }}>
          <Foto foto={s.foto} sizes={SIZES[s.vorm]} className="h-full w-full" />
        </figure>
      ))}
    </div>
  )
}

export function Atelier() {
  return (
    <div className="vp-atelier">
      <section className="vp-held" aria-label="Opening">
        <p className="vp-held-titel vp-licht" aria-hidden="true">
          <span className="vp-r">
            <span className="vp-w" style={i(0)}>
              GRØNN
            </span>
          </span>
          <span className="vp-r">
            <span className="vp-w" style={i(1)}>
              Studio
            </span>
          </span>
        </p>
        <p className="lbl vp-lbl-tel">{LABEL}</p>
        <div className="vp-held-foto" data-held-foto>
          <Foto foto={F08_2} priority sizes="100vw" className="vp-held-beeld" />
        </div>
        <p className="vp-verticaal vp-links" data-verticaal aria-hidden="true">
          Vijvers en tuinen
        </p>
        <p className="vp-verticaal vp-rechts" data-verticaal aria-hidden="true">
          Stein en omgeving
        </p>
      </section>

      <section className="vp-onthul" data-onthul aria-labelledby="kop">
        <p className="sr-only">{LABEL}</p>
        <h1 id="kop">
          <Woorden tekst={KOP} />
        </h1>{" "}
        <p>
          <Woorden tekst={`${ZIN} ${OVER_MIJ[1].nl}`} />
        </p>
        <br />
        <Link className="lnk vp-meer" href="/over">
          Meer over mij →
        </Link>
      </section>

      <section className="vp-vel" aria-label="Foto's">
        <p className="vp-reuswoord vp-licht" aria-hidden="true">
          <span className="vp-spoor" data-spoor>
            {[0, 1, 2].map((n) => (
              <span key={n}>Vijvers&nbsp;&nbsp;Tuinen&nbsp;&nbsp;</span>
            ))}
          </span>
        </p>
        <Collage stukken={COLLAGE_A} klasse="vp-a" />
      </section>
      <Collage stukken={COLLAGE_B} klasse="vp-b" />

    </div>
  )
}

import type { CSSProperties } from "react";
import Link from "next/link";
import { Foto } from "@/components/foto";
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie";
import { Beide, T, type Tekst } from "@/components/taal";
import type { L } from "@/lib/i18n";
import { F01, F04_2, F05, F07_1, F08_2, F10, F11, T01, T02 } from "./beelden";

// WF-058 (Uncode "portfolio-atelier"), van de opening tot en met de onderkant
// van de fotocollage. Volgt licht/donker. De beweging zit in beweging.tsx; zonder
// JS of met minder beweging staat alles stil en is alles zichtbaar.

export const KOP: L = {
  nl: "Een vijver en tuin die gezond blijven.",
  en: "A pond and garden that stay healthy.",
};
export const ZIN: L = {
  nl: "Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf.",
  en: "I’m Nick. I renovate and maintain ponds and build natural gardens, for homeowners in Stein and the surrounding area. Where possible with a fixed price agreed up front.",
};
const LABEL: L = {
  nl: "Vijvers en tuinen · Stein en omgeving",
  en: "Ponds and gardens · Stein and surrounding area",
};

const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** Tekst in losse woorden, zodat ze één voor één kunnen oplichten. */
function Woorden({ tekst }: { tekst: Tekst }) {
  if (typeof tekst !== "string")
    return (
      <Beide
        nl={<Woorden tekst={tekst.nl} />}
        en={<Woorden tekst={tekst.en} />}
      />
    );
  return (
    <>
      <span className="sr-only">{tekst}</span>
      <span aria-hidden="true">
        {tekst
          .split(/(\s+)/)
          .filter(Boolean)
          .map((d, n) =>
            /^\s+$/.test(d) ? (
              " "
            ) : (
              <span key={n} className="vp-wd">
                {[...d].map((c, i) => (
                  <span key={i} className="w-lt">
                    {c}
                  </span>
                ))}
              </span>
            ),
          )}
      </span>
    </>
  );
}

type Stuk = {
  foto: FotoData;
  vorm: "staand" | "vierkant" | "liggend";
  v: number;
  top: string;
  left: string;
};

// Posities en snelheden zoals in het wireframe (gemeten op de demo).
const COLLAGE_A: Stuk[] = [
  { foto: F01, vorm: "staand", v: 0.5, top: "0", left: "0%" },
  { foto: T02, vorm: "vierkant", v: 3, top: "10.61%", left: "56.74%" },
  { foto: F10, vorm: "liggend", v: 0, top: "39.21%", left: "20.83%" },
  { foto: F05, vorm: "staand", v: 0.5, top: "70.51%", left: "52.5%" },
];
const COLLAGE_B: Stuk[] = [
  { foto: F11, vorm: "vierkant", v: 3, top: "0", left: "9.24%" },
  { foto: F04_2, vorm: "liggend", v: 0, top: "31.95%", left: "20.83%" },
  { foto: T01, vorm: "staand", v: 0.5, top: "66.97%", left: "0%" },
  { foto: F07_1, vorm: "vierkant", v: 3, top: "78.89%", left: "56.74%" },
];

const SIZES = {
  staand: "(min-width: 768px) 43vw, 43vw",
  vierkant: "34vw",
  liggend: "59vw",
};

function Collage({ stukken, klasse }: { stukken: Stuk[]; klasse: string }) {
  return (
    <div className={`vp-collage ${klasse}`}>
      {stukken.map((s) => (
        <figure
          key={s.foto.src}
          className={`vp-stuk vp-${s.vorm}`}
          data-v={s.v}
          style={{ top: s.top, left: s.left }}
        >
          <Foto foto={s.foto} sizes={SIZES[s.vorm]} className="h-full w-full" />
        </figure>
      ))}
    </div>
  );
}

export function Atelier() {
  return (
    <div className="vp-atelier">
      <section className="vp-held" aria-labelledby="kop">
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
        <p className="lbl vp-lbl-tel">
          <T t={LABEL} />
        </p>
        <div className="vp-held-foto" data-held-foto>
          <Foto foto={F08_2} priority sizes="100vw" className="vp-held-beeld" />
        </div>
        <p className="vp-verticaal vp-links" data-verticaal aria-hidden="true">
          <T t={{ nl: "Vijvers en tuinen", en: "Ponds and gardens" }} />
        </p>
        <p className="vp-verticaal vp-rechts" data-verticaal aria-hidden="true">
          <T
            t={{ nl: "Stein en omgeving", en: "Stein and surrounding area" }}
          />
        </p>
      </section>

      <section className="vp-onthul" data-onthul aria-labelledby="kop">
        <p className="sr-only">
          <T t={LABEL} />
        </p>
        <h1 id="kop">
          <Woorden tekst={KOP} />
        </h1>{" "}
        <p>
          <Woorden
            tekst={{
              nl: ZIN.nl,
              en: ZIN.en,
            }}
          />
        </p>
        <br />
        <Link className="lnk vp-meer" href="/over">
          <T t={{ nl: "Meer over mij →", en: "More about me →" }} />
        </Link>
      </section>

      <section className="vp-vel" aria-label="Foto's">
        <p className="vp-reuswoord vp-licht" aria-hidden="true">
          <span className="vp-spoor" data-spoor>
            {[0, 1, 2].map((n) => (
              <span key={n}>
                <T
                  t={{
                    nl: "Vijvers\u00a0\u00a0Tuinen\u00a0\u00a0",
                    en: "Ponds\u00a0\u00a0Gardens\u00a0\u00a0",
                  }}
                />
              </span>
            ))}
          </span>
        </p>
        <Collage stukken={COLLAGE_A} klasse="vp-a" />
      </section>
      <Collage stukken={COLLAGE_B} klasse="vp-b" />
    </div>
  );
}

import type { CSSProperties } from "react";
import Link from "next/link";
import { Foto } from "@/components/foto";
import { Beide, T, type Tekst } from "@/components/taal";
import type { L } from "@/lib/i18n";
import { F08_2, F10 } from "./beelden";
import { Diepte } from "@/components/werk/diepte";
import { Uitgelicht } from "./uitgelicht";
import { SnelContact } from "@/components/snel-contact";

// WF-058 (Uncode "portfolio-atelier"), van de opening tot en met de onderkant
// van de fotocollage. Volgt licht/donker. De beweging zit in beweging.tsx; zonder
// JS of met minder beweging staat alles stil en is alles zichtbaar.

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
                {d}
              </span>
            ),
          )}
      </span>
    </>
  );
}

function KopRegels({ regels }: { regels: string[] }) {
  return (
    <>
      <span className="sr-only">{regels.join(" ")}</span>
      {regels.map((r, n) => (
        <span key={n} className="vp-r" aria-hidden="true">
          <span className="vp-w" style={i(n)}>
            {r}
          </span>
        </span>
      ))}
    </>
  );
}

export function Atelier() {
  return (
    <div className="vp-atelier">
      {/* De vijver als opening (eigenaar koos "Vijver als opening", 11 okt
          2026): de waterval schermvullend, het water rimpelt onder je vinger,
          en scrollend duik je erin (de foto groeit en lost op in de grond). */}
      <section className="vp-vijver" aria-labelledby="kop">
        <div className="vp-vijver-plak">
          <Foto foto={F10} priority sizes="100vw" rimpel="vanzelf" className="vp-vijver-beeld" />
          <div className="vp-vijver-waas" aria-hidden="true" />
          <div className="vp-vijver-tekst">
            <p className="lbl m-0"><T t={LABEL} /></p>
            <h1 id="kop" className="vp-vijver-titel">
              <Beide
                nl={<KopRegels regels={["Een vijver en tuin", "die gezond blijven."]} />}
                en={<KopRegels regels={["A pond and garden", "that stay healthy."]} />}
              />
            </h1>
            <p className="lbl vp-vijver-tip m-0" aria-hidden="true">
              <T t={{ nl: "Raak het water aan", en: "Touch the water" }} />
            </p>
          </div>
        </div>
      </section>

      <div className="vp-onthul" data-onthul>
        <div>
          <p className="sr-only">
            <T t={LABEL} />
          </p>
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
        </div>
        <Foto foto={F08_2} sizes="(min-width: 1024px) 30vw, 60vw" className="vp-portret" />
      </div>

      {/* eerst wie, dan snel contact (eigenaar, 18 okt 2026) */}
      <SnelContact className="px-[var(--vp-rand)] pt-[56px]" />

      <Uitgelicht />

      {/* De foto's komen op je af terwijl je scrolt (eigenaar, 18 okt 2026:
          "ik wil dit op de eerste pagina op home"); verving de fotocollage. */}
      <Diepte />
    </div>
  );
}

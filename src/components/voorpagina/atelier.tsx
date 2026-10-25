import Link from "next/link";
import { Foto } from "@/components/foto";
import { T } from "@/components/taal";
import type { L } from "@/lib/i18n";
import { F08_2, F10 } from "./beelden";

// De opening van de voorpagina, versimpeld (24 okt 2026): de waterval met
// label, kop, één zin en één knop, daaronder wie Nick is met zijn portret.
// Geen rimpel, geen duik, geen woorden die oplichten: alles staat stil.

const ZIN: L = {
  nl: "Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf.",
  en: "I’m Nick. I renovate and maintain ponds and build natural gardens, for homeowners in Stein and the surrounding area. Where possible with a fixed price agreed up front.",
};
const LABEL: L = {
  nl: "Vijvers en tuinen · Stein en omgeving",
  en: "Ponds and gardens · Stein and surrounding area",
};
const HELD_ZIN: L = {
  nl: "Voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
  en: "For homeowners in Stein and the surrounding area, with a fixed price up front.",
};

export function Atelier() {
  return (
    <>
      <section className="vp-vijver" aria-labelledby="kop">
        <Foto foto={F10} priority sizes="100vw" className="vp-vijver-beeld" />
        <div className="vp-vijver-waas" aria-hidden="true" />
        <div className="vp-vijver-tekst">
          <p className="lbl m-0"><T t={LABEL} /></p>
          <h1 id="kop" className="vp-vijver-titel">
            <T t={{ nl: "Een vijver en tuin die gezond blijven.", en: "A pond and garden that stay healthy." }} />
          </h1>
          <p className="vp-vijver-zin m-0"><T t={HELD_ZIN} /></p>
          <Link href="/kennismaken" className="knop vp-vijver-knop bg-oranje text-antraciet">
            <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
          </Link>
        </div>
      </section>

      <section className="vp-wie">
        <div>
          <p className="vp-wie-zin"><T t={ZIN} /></p>
          <Link className="lnk vp-meer" href="/over">
            <T t={{ nl: "Meer over mij →", en: "More about me →" }} />
          </Link>
        </div>
        <Foto foto={F08_2} sizes="(min-width: 1024px) 30vw, 60vw" className="vp-portret" />
      </section>
    </>
  );
}

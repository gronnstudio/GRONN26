import Link from "next/link"
import { Figuur, Regels } from "@/components/ontwerp"
import { T } from "@/components/taal"
import { BUSINESS } from "@/lib/business"
import { F10 } from "./beelden"

// De opening (9 nov 2026, Master Brief): diep antraciet, de kop over de hele
// breedte in drie regels, daaronder links de positioneringszin met één knop en
// rechts de waterval tot aan de schermrand. Het beeld steekt over de rand naar
// de crème sectie eronder: de overgang van donker naar licht is één beweging.
// Geen tekst-links-beeld-rechts naast elkaar, geen tweede knop.

export const FOTO_WHATSAPP = `${BUSINESS.whatsapp}?text=${encodeURIComponent("Hoi Nick, hierbij een foto van mijn vijver of tuin.")}`

export function Opening() {
  return (
    <section className="donker vlak-diep opening" aria-labelledby="kop">
      <div className="wrap">
        <div className="opening-balk">
          <Link href="/" className="opening-logo" aria-label="GRØNN Studio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/woordmerk-primair.svg" alt="" width="120" height="22" />
          </Link>
          <p className="meta m-0 text-gedempt">Stein, NL · 50°58′N 5°46′E</p>
        </div>

        <p className="meta m-0 opening-label na-opening">
          <T t={{ nl: "Vijvers en natuurlijke tuinen · Stein en omgeving", en: "Ponds and natural gardens · Stein and surroundings" }} />
        </p>
        <div className="opening-kop-raster">
        <h1 id="kop" className="t-display opening-kop">
          <Regels
            regels={[
              { nl: "Vijvers", en: "Ponds" },
              { nl: "en natuurlijke", en: "and natural" },
              { nl: "tuinen.", en: "gardens." },
            ]}
          />
        </h1>
          <div className="opening-tekst na-opening">
            <p className="t-lead m-0">
              <T
                t={{
                  nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
                  en: "I build and maintain ponds and natural gardens for homeowners in Stein and the surrounding area, with a fixed price up front.",
                }}
              />
            </p>
            <div className="opening-acties">
              <Link href="/kennismaken" className="knop bg-oranje text-antraciet">
                <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
              </Link>
              <a href={FOTO_WHATSAPP} className="lijnlink meta">
                <span><T t={{ nl: "Of app een foto", en: "Or send a photo" }} /></span>
                <span className="pijl" aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="raster opening-onder">
          <Figuur
            foto={F10}
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            vorm="aspect-[4/5] md:aspect-[3/2]"
            code="GR/001 · F10"
            bijschrift={{ nl: "Waterval, vijverrenovatie, 2026", en: "Waterfall, pond renovation, 2026" }}
            className="opening-beeld"
            beeldKlasse="beeld-open"
          />
        </div>
      </div>
    </section>
  )
}

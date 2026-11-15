import Link from "next/link"
import { Foto } from "@/components/foto"
import { F04_2, F08_1, F10, F11 } from "@/components/voorpagina/beelden"
import { TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { SFEER } from "@/lib/data/sfeer"
import { T } from "@/components/taal"
import { TelLink } from "@/components/handoff/klant"
import { Pijl } from "@/components/pijl"
import type { L } from "@/lib/i18n"
import "../ar/ar.css"
import "./arch.css"

// Voorpagina "architectuur" (eigenaar, 15 nov 2026: "aachen met bartosz kruisen …
// meer architectonisch als hoveniers site, niet standaard, teksten met een oranje
// punt"). Van Aachen: het reuzenwoord met klein beeld en kantlijn, de intro als
// lange zin met drie kleine beelden, diensten als uitklaplijst naast een beeld,
// de donkere strook met werk. Van Bartosz: kop boven, grote stellingen, rust.
// Alleen echte foto's en prijzen; uitklappen is <details>, geen script.

const NICK = { src: "/nick/zaagtafel-lach.jpg", width: 720, height: 1280, alt: "Nick lacht met een net gezaagde steen in zijn handen" }
const Punt = () => <b className="x-punt" aria-hidden>.</b>

const DIENSTEN: { naam: L; zin: L; prijs: L; href: string }[] = [
  { naam: { nl: "Nieuwe vijver", en: "New pond" }, zin: { nl: "Een vijver met een filter dat werkt, ontworpen op jouw plek, water en licht.", en: "A pond with a filter that works, designed for your place, water and light." }, prijs: { nl: "vanaf € 2.500", en: "from € 2,500" }, href: "/vijvers" },
  { naam: { nl: "Vijverrenovatie", en: "Pond renovation" }, zin: { nl: "Groen of troebel water wordt weer helder: nieuwe folie, filter, beekloop of waterval.", en: "Green or murky water turns clear again: new liner, filter, stream or waterfall." }, prijs: { nl: "vanaf € 4.500", en: "from € 4,500" }, href: "/vijvers" },
  { naam: { nl: "Tuinaanleg", en: "Garden build" }, zin: { nl: "Van grondwerk en bestrating tot de laatste plant, door één persoon.", en: "From groundwork and paving to the last plant, by one person." }, prijs: { nl: "vanaf € 7.000", en: "from € 7,000" }, href: "/tuinen" },
  { naam: { nl: "Tuinontwerp", en: "Garden design" }, zin: { nl: "Een plan op papier dat past bij je huis en je bodem, met een vaste prijs voor de aanleg.", en: "A plan on paper that suits your house and soil, with a fixed price for the build." }, prijs: { nl: "vanaf € 2.500", en: "from € 2,500" }, href: "/tuinen" },
  { naam: { nl: "Onderhoud", en: "Maintenance" }, zin: { nl: "Twee keer per jaar langs, zodat vijver en tuin blijven werken.", en: "Two visits a year, so pond and garden keep working." }, prijs: { nl: "€ 45 per maand", en: "€ 45 a month" }, href: "/vijvers" },
]

const WERK = [
  { foto: F11, titel: { nl: "Vijverrenovatie", en: "Pond renovation" }, soort: { nl: "Waterval en beekloop", en: "Waterfall and stream" }, href: "/werk/vijverrenovatie" },
  { foto: TERRAS_FOTOS.hoofd, titel: { nl: "Terras Geulle", en: "Terrace Geulle" }, soort: { nl: "Bestrating", en: "Paving" }, href: "/werk/terras-geulle" },
  { foto: F04_2, titel: { nl: "Vijverrenovatie", en: "Pond renovation" }, soort: { nl: "Filter en folie", en: "Filter and liner" }, href: "/werk/vijverrenovatie" },
  { foto: TERRAS_FOTOS.reeks[0], titel: { nl: "Terras Geulle", en: "Terrace Geulle" }, soort: { nl: "Tegelpad", en: "Paved path" }, href: "/werk/terras-geulle" },
]

export function ArchVoorpagina() {
  return (
    <div className="ar x">
      {/* Opening: het reuzenwoord, klein beeld, kantlijn */}
      <section className="ar-raster x-opening" aria-labelledby="x-titel">
        <h1 id="x-titel" className="x-reus">
          <span className="x-reus-r"><T t={{ nl: "Vijvers", en: "Ponds" }} /></span>
          <span className="x-reus-r x-reus-in"><T t={{ nl: "& tuinen", en: "& gardens" }} /><Punt /></span>
        </h1>
        <p className="ar-lbl x-onder"><T t={{ nl: "Ontwerp, aanleg en onderhoud", en: "Design, build and maintenance" }} /><br />Stein <T t={{ nl: "en omgeving", en: "and surroundings" }} /></p>
        <div className="x-opening-beeld"><Foto foto={F10} sizes="(min-width: 1024px) 40vw, 92vw" priority /></div>
        <div className="x-kantlijn">
          <p className="ar-lbl"><T t={{ nl: "Vaste prijs vooraf", en: "Fixed price up front" }} /></p>
          <p><T t={{ nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.", en: "I build and maintain ponds and natural gardens for homeowners in and around Stein, with a fixed price up front." }} /></p>
          <TelLink href="/kennismaken" gebeurtenis="cta_project" plek="opening" className="ar-knop ar-knop-oranje"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></TelLink>
        </div>
      </section>

      {/* Stelling met drie beelden */}
      <section className="ar-raster x-blok x-stelling-blok" aria-labelledby="x-stelling">
        <h2 id="x-stelling" className="x-stelling"><T t={{ nl: "Een tuin is geen product maar een plek. Ik ontwerp hem, reken hem door en leg hem zelf aan", en: "A garden isn't a product but a place. I design it, cost it and build it myself" }} /><Punt /></h2>
        <ul className="x-drie">
          <li><Foto foto={NICK} sizes="(min-width: 1024px) 16vw, 30vw" /><p className="ar-lbl"><T t={{ nl: "De maker", en: "The maker" }} /></p></li>
          <li><Foto foto={SFEER.waterval} sizes="(min-width: 1024px) 16vw, 30vw" /><p className="ar-lbl"><T t={{ nl: "Water", en: "Water" }} /></p></li>
          <li><Foto foto={F08_1} sizes="(min-width: 1024px) 16vw, 30vw" /><p className="ar-lbl"><T t={{ nl: "Beplanting", en: "Planting" }} /></p></li>
        </ul>
      </section>

      {/* Diensten als uitklaplijst naast een beeld */}
      <section className="ar-raster x-blok x-diensten" aria-labelledby="x-diensten">
        <div className="x-diensten-beeld"><Foto foto={TERRAS_FOTOS.reeks[1]} sizes="(min-width: 1024px) 40vw, 92vw" /></div>
        <div>
          <h2 id="x-diensten" className="x-kop"><T t={{ nl: "Wat ik doe", en: "What I do" }} /><Punt /></h2>
          <div className="x-lijst">
            {DIENSTEN.map((d) => (
              <details key={d.naam.nl} className="x-rij">
                <summary><span><T t={d.naam} /></span><span className="x-plus" aria-hidden /></summary>
                <div className="x-rij-in">
                  <p><T t={d.zin} /></p>
                  <p className="x-prijs"><T t={d.prijs} /> <span className="ar-lbl">incl. btw</span></p>
                  <Link href={d.href} className="ar-lbl ar-lijnlink" transitionTypes={["schuif"]}><T t={{ nl: "Meer", en: "More" }} /></Link>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Donkere strook met werk */}
      <section className="ar-inv x-werk" aria-labelledby="x-werk">
        <div className="ar-raster x-werk-kop">
          <h2 id="x-werk" className="x-kop"><T t={{ nl: "Met zorg gemaakt, in Zuid-Limburg", en: "Made with care, in South Limburg" }} /><Punt /></h2>
          <Link href="/werk" className="ar-lbl x-alles" transitionTypes={["schuif"]}><T t={{ nl: "Al het werk", en: "All work" }} /> <Pijl richting="e" /></Link>
        </div>
        <ul className="x-strook">
          {WERK.map((w, i) => (
            <li key={i}><Link href={w.href} transitionTypes={["schuif"]}>
              <Foto foto={{ ...w.foto, alt: "" }} sizes="(min-width: 1024px) 34vw, 80vw" />
              <p><T t={w.titel} /> <span className="ar-lbl"><T t={w.soort} /></span></p>
            </Link></li>
          ))}
        </ul>
        <div className="ar-raster x-werk-voet">
          <p className="x-stelling x-klein"><T t={{ nl: "Elk project begint bij water, bodem en licht van jouw plek", en: "Every project starts with the water, soil and light of your place" }} /><Punt /></p>
          <div className="x-feiten">
            <div><p className="x-getal">1<Punt /></p><p className="ar-lbl"><T t={{ nl: "Aanspreekpunt, van schets tot plant", en: "Point of contact, sketch to plant" }} /></p></div>
            <div><p className="x-getal">30 km<Punt /></p><p className="ar-lbl"><T t={{ nl: "Rond Stein", en: "Around Stein" }} /></p></div>
          </div>
        </div>
      </section>

    </div>
  )
}

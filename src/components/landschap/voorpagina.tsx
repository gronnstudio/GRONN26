import Link from "next/link"
import { ViewTransition } from "react"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import { TelLink } from "@/components/handoff/klant"
import { WERK } from "@/components/werk/projecten"
import type { L } from "@/lib/i18n"
import { Beeld } from "./beeld"
import { HeroLandschap } from "./hero"
import { Opkomst } from "./opkomst"
import {
  BEPLANTING, PAD_BORDERS, ZITMUUR, MAANPOORT, MATERIALEN, NICK, NICK_WERK,
  TERRAS, VIJVERRENOVATIE, VIJVERRENOVATIE_OVERZICHT, VIJVER_SFEER,
} from "./beelden"
import "./landschap.css"

// De voorpagina volgens de visuele bouwbrief "Van landschap naar detail" (Nick,
// 21 nov 2026): één doorlopende wandeling in zeven momenten (opening,
// standpunt, werk, routes, werkwijze, studio, contact), met de beelden 05, 08
// en 09 als verdieping binnen standpunt en routes. Het contactmoment is het
// gedeelde slot onderaan elke pagina (voet.tsx). Copy uit de brief; de
// werkwijze is de bestaande, door Nick vastgestelde (14 nov 2026).

const ROUTES: { href: string; naam: L; zin: L }[] = [
  { href: "/tuinen#fase-ontwerpen", naam: { nl: "Ontwerp & advies", en: "Design & advice" }, zin: { nl: "Eerst helder krijgen wat past bij je tuin, je gebruik en je wensen.", en: "First getting clear on what suits your garden, how you use it and what you want." } },
  { href: "/tuinen", naam: { nl: "Tuinen & renovatie", en: "Gardens & renovation" }, zin: { nl: "Een bestaande buitenruimte opnieuw inrichten, van plan tot uitvoering.", en: "Redesigning an existing outdoor space, from plan to build." } },
  { href: "/vijvers", naam: { nl: "Vijvers & water", en: "Ponds & water" }, zin: { nl: "Aandacht voor aanleg, renovatie en het samenspel van water, planten en techniek.", en: "Building, renovation and the interplay of water, plants and technology." } },
  { href: "/tuinen/borderpakketten", naam: { nl: "Zelf aan de slag", en: "Do it yourself" }, zin: { nl: "Een duidelijk plan en gerichte hulp als je zelf wilt aanleggen.", en: "A clear plan and focused help if you want to build it yourself." } },
]

const STAPPEN: [L, L][] = [
  [{ nl: "Kennismaken", en: "Get in touch" }, { nl: "Stuur een foto via WhatsApp of bel. Binnen een dag hoor je of ik kan helpen.", en: "Send a photo via WhatsApp or call. Within a day you'll know whether I can help." }],
  [{ nl: "Bezoek", en: "Visit" }, { nl: "Ik kom kijken, meet op en test bodem of water. Leidt het tot werk, dan verreken ik het bezoek.", en: "I come and look, measure up and test soil or water. If it leads to work, the visit is deducted." }],
  [{ nl: "Plan en vaste prijs", en: "Plan and fixed price" }, { nl: "Een plan op papier en een prijs die vaststaat, met wat er wel en niet in zit.", en: "A plan on paper and a price that's fixed, with what is and isn't included." }],
  [{ nl: "Aanleg", en: "Build" }, { nl: "Ik doe het werk zelf, van grondwerk tot de laatste plant.", en: "I do the work myself, from groundwork to the last plant." }],
  [{ nl: "Oplevering en nazorg", en: "Handover and aftercare" }, { nl: "We lopen samen alles na. Daarna onderhoud ik het als je wilt, zodat het blijft werken.", en: "We check everything together. After that I maintain it if you like, so it keeps working." }],
]

const [VIJ, TER] = WERK

export function LandschapVoorpagina() {
  return (
    <div className="ls">
      <Opkomst />

      {/* 01 · Opening */}
      <HeroLandschap>
        <div className="ls-raster ls-hero-tekst">
          <div className="ls-hero-links">
            <p className="ls-label"><T t={{ nl: "Vijvers en tuinen · Stein", en: "Ponds and gardens · Stein" }} /></p>
            <h1 id="ls-titel" className="ls-display"><T t={{ nl: "Een tuin die met je meegroeit.", en: "A garden that grows with you." }} /></h1>
          </div>
          <div className="ls-hero-rechts">
            <p className="ls-body ls-hero-zin">
              <T t={{ nl: "Ik ontwerp, maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving.", en: "I design, build and maintain ponds and natural gardens for homeowners in and around Stein." }} />
            </p>
            <p className="ls-annotatie" lang="en">Designing Living Ecosystems</p>
            <div className="ls-knoppen">
              <TelLink href="/kennismaken" gebeurtenis="cta_kennismaken" plek="opening" className="ls-knop ls-knop-actie">
                <T t={{ nl: "Kennismaken", en: "Get in touch" }} /> <Pijl richting="ne" />
              </TelLink>
              <Link href="/werk" className="ls-knop ls-knop-lijn"><T t={{ nl: "Bekijk het werk", en: "See the work" }} /> <Pijl richting="e" /></Link>
            </div>
          </div>
        </div>
      </HeroLandschap>

      {/* 02 · Standpunt (beeld 04) */}
      <section className="ls-raster ls-sectie ls-standpunt" aria-labelledby="ls-standpunt">
        <div className="ls-standpunt-tekst ls-op">
          <p className="ls-label"><T t={{ nl: "Standpunt", en: "Point of view" }} /></p>
          <h2 id="ls-standpunt" className="ls-h1"><T t={{ nl: "Een tuin is nooit af. En dat is precies de bedoeling.", en: "A garden is never finished. And that is exactly the point." }} /></h2>
          <p className="ls-body ls-lees">
            <T t={{ nl: "Planten, water en bodem werken samen. Ik ontwerp en maak buitenruimtes die met de seizoenen veranderen. Met aandacht voor hoe je de tuin gebruikt én hoe hij zich ontwikkelt.", en: "Plants, water and soil work together. I design and build outdoor spaces that change with the seasons, with attention to how you use the garden and how it develops." }} />
          </p>
          <a href="#werkwijze" className="ls-tekstlink"><T t={{ nl: "Zo werk ik", en: "How I work" }} /> <Pijl richting="e" /></a>
        </div>
        <Beeld beeld={BEPLANTING} sizes="(min-width: 1024px) 40vw, 100vw" className="ls-standpunt-beeld ls-op" labelRechts />
      </section>

      {/* Van landschap naar detail (beeld 05): verschil in schaal, geen decoratie */}
      <section className="ls-raster ls-sectie ls-schaal" aria-labelledby="ls-schaal">
        <Beeld beeld={MATERIALEN} sizes="(min-width: 1024px) 64vw, 100vw" className="ls-schaal-groot" />
        <div className="ls-schaal-tekst ls-op">
          <p className="ls-label"><T t={{ nl: "Bodem · water · beplanting", en: "Soil · water · planting" }} /></p>
          <p className="ls-body"><T t={{ nl: "Het grote geheel klopt pas als de details samenwerken.", en: "The whole only works when the details work together." }} /></p>
        </div>
        <h2 id="ls-schaal" className="ls-display ls-schaal-kop ls-op"><T t={{ nl: "Van landschap naar detail.", en: "From landscape to detail." }} /></h2>
        <Beeld beeld={ZITMUUR} sizes="(min-width: 1024px) 28vw, 70vw" className="ls-schaal-klein ls-op" />
      </section>

      {/* 03 · Werk (beeld 06): alleen eigen werk, met toestemming */}
      <section className="ls-raster ls-sectie ls-werk" aria-labelledby="ls-werk">
        <div className="ls-sectiekop ls-op">
          <div>
            <p className="ls-label"><T t={{ nl: "Werk", en: "Work" }} /></p>
            <h2 id="ls-werk" className="ls-h1"><T t={{ nl: "Van eerste idee naar buiten.", en: "From first idea to outside." }} /></h2>
          </div>
          <Link href="/werk" className="ls-knop ls-knop-lijn"><T t={{ nl: "Bekijk al het werk", en: "See all the work" }} /> <Pijl richting="e" /></Link>
        </div>
        <div className="ls-werkraster">
          <Link href={VIJ.href} className="ls-werkkaart ls-werkkaart-groot ls-op" transitionTypes={["schuif"]}>
            <ViewTransition name={VIJ.morph} share="morph" default="none">
              <Beeld beeld={VIJVERRENOVATIE} sizes="(min-width: 1024px) 58vw, 100vw" className="ls-werkbeeld" decoratief />
            </ViewTransition>
            <span className="ls-h3 ls-werknaam"><T t={VIJ.titel} /> <Pijl richting="e" /></span>
            <span className="ls-annotatie"><T t={VIJ.type} /> · <T t={VIJ.status} /></span>
          </Link>
          <Link href={TER.href} className="ls-werkkaart ls-werkkaart-klein ls-op" transitionTypes={["schuif"]}>
            <ViewTransition name={TER.morph} share="morph" default="none">
              <Beeld beeld={TERRAS} sizes="(min-width: 1024px) 34vw, 100vw" className="ls-werkbeeld" decoratief />
            </ViewTransition>
            <span className="ls-h3 ls-werknaam"><T t={TER.titel} /> <Pijl richting="e" /></span>
            <span className="ls-annotatie"><T t={TER.type} /> · {TER.plaats}</span>
          </Link>
          <figure className="ls-werkkaart ls-werkkaart-breed ls-op">
            <Beeld beeld={VIJVERRENOVATIE_OVERZICHT} sizes="100vw" className="ls-werkbeeld" />
            <figcaption className="ls-annotatie"><T t={{ nl: "Vijverrenovatie, de tuin tijdens de afronding", en: "Pond renovation, the garden during completion" }} /></figcaption>
          </figure>
        </div>
        <p className="ls-annotatie ls-werk-noot"><T t={{ nl: "Uitsluitend eigen projectfotografie, met toestemming van de klant.", en: "Only my own project photography, with the client's permission." }} /></p>
      </section>

      {/* 04 · Routes (beeld 07) */}
      <section className="ls-raster ls-sectie ls-routes" aria-labelledby="ls-routes">
        <div className="ls-routes-kop ls-op">
          <p className="ls-label"><T t={{ nl: "Aanbod", en: "Services" }} /></p>
          <h2 id="ls-routes" className="ls-h1"><T t={{ nl: "Wat heeft jouw buitenruimte nodig?", en: "What does your outdoor space need?" }} /></h2>
          <Beeld beeld={PAD_BORDERS} sizes="(min-width: 1024px) 34vw, 100vw" className="ls-routes-beeld" />
        </div>
        <ul className="ls-routes-lijst">
          {ROUTES.map((r) => (
            <li key={r.href} className="ls-op">
              <Link href={r.href} className="ls-route" transitionTypes={["schuif"]}>
                <span className="ls-h2 ls-route-naam"><T t={r.naam} /></span>
                <span className="ls-body ls-route-zin"><T t={r.zin} /></span>
                <Pijl richting="e" className="ls-route-pijl" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Vijvers en watersystemen (beeld 08) */}
      <section className="ls-raster ls-sectie ls-water" aria-labelledby="ls-water">
        <p className="ls-label"><T t={{ nl: "Vijvers & water", en: "Ponds & water" }} /></p>
        <Beeld beeld={VIJVER_SFEER} sizes="100vw" className="ls-water-beeld" labelRechts />
        <div className="ls-water-tekst ls-op">
          <h2 id="ls-water" className="ls-display"><T t={{ nl: "Water dat werkt.", en: "Water that works." }} /></h2>
          <div className="ls-water-rechts">
            <p className="ls-body"><T t={{ nl: "Ik bekijk de vijver als geheel: water, techniek en beplanting.", en: "I look at the pond as a whole: water, technology and planting." }} /></p>
            <Link href="/vijvers" className="ls-knop ls-knop-lijn" transitionTypes={["schuif"]}><T t={{ nl: "Meer over vijvers", en: "More about ponds" }} /> <Pijl richting="e" /></Link>
          </div>
        </div>
      </section>

      {/* Zelf aan de slag (beeld 09) */}
      <section className="ls-raster ls-sectie ls-zelf" aria-labelledby="ls-zelf">
        <div className="ls-zelf-tekst ls-op">
          <p className="ls-label"><T t={{ nl: "Zelf aan de slag", en: "Do it yourself" }} /></p>
          <h2 id="ls-zelf" className="ls-h1"><T t={{ nl: "Zelf doen. Met een goed plan.", en: "Do it yourself. With a good plan." }} /></h2>
          <p className="ls-body ls-lees"><T t={{ nl: "Een beplantingsplan en duidelijke stappen voor wie zelf wil aanleggen.", en: "A planting plan and clear steps for anyone who wants to build it themselves." }} /></p>
          <ul className="ls-lijnlijst">
            <li><Link href="/tuinen/borderpakketten" transitionTypes={["schuif"]}><T t={{ nl: "Borderpakketten", en: "Border packages" }} /> <Pijl richting="e" /></Link></li>
            <li><Link href="/tuinen/materialen" transitionTypes={["schuif"]}><T t={{ nl: "Materialen", en: "Materials" }} /> <Pijl richting="e" /></Link></li>
          </ul>
        </div>
        <Beeld beeld={MAANPOORT} sizes="(min-width: 1024px) 40vw, 100vw" className="ls-zelf-beeld" labelRechts />
      </section>

      {/* 05 · Werkwijze (beeld 11) */}
      <LandschapWerkwijze />

      {/* 06 · Studio (beeld 10): Nick zelf, geen gegenereerde vervanger */}
      <section className="ls-raster ls-sectie ls-studio" aria-labelledby="ls-studio">
        <div className="ls-studio-tekst ls-op">
          <p className="ls-label">Studio</p>
          <h2 id="ls-studio" className="ls-h1"><T t={{ nl: "Van ontwerp tot uitvoering: één aanspreekpunt.", en: "From design to build: one point of contact." }} /></h2>
          <p className="ls-body ls-lees">
            <T t={{ nl: "Ik ben Nick Peters, ontwerper en hovenier achter GRØNN Studio. Ik kijk naar het geheel en werk het buiten uit: van water en beplanting tot de aansluiting van materialen.", en: "I'm Nick Peters, the designer and gardener behind GRØNN Studio. I look at the whole and work it out on site: from water and planting to how the materials meet." }} />
          </p>
          <Link href="/over" className="ls-tekstlink" transitionTypes={["schuif"]}><T t={{ nl: "Meer over mij", en: "More about me" }} /> <Pijl richting="e" /></Link>
        </div>
        <Beeld beeld={NICK} sizes="(min-width: 1024px) 30vw, 100vw" className="ls-studio-portret ls-op" />
        <Beeld beeld={NICK_WERK} sizes="(min-width: 1024px) 18vw, 50vw" className="ls-studio-werk ls-op" />
      </section>
    </div>
  )
}

/** De werkwijze in vijf stappen; ook op Studio. */
export function LandschapWerkwijze() {
  return (
    <section id="werkwijze" className="ls-raster ls-sectie ls-werkwijze" aria-labelledby="ls-werkwijze">
      <div className="ls-werkwijze-kop ls-op">
        <p className="ls-label"><T t={{ nl: "Zo werk ik", en: "How I work" }} /></p>
        <h2 id="ls-werkwijze" className="ls-h1"><T t={{ nl: "Eerst kijken. Dan keuzes maken.", en: "First look. Then make choices." }} /></h2>
      </div>
      <ol className="ls-stappen">
        {STAPPEN.map(([kop, zin], i) => (
          <li key={kop.nl} className="ls-op">
            <div>
              <h3 className="ls-h3"><T t={kop} /></h3>
              <p className="ls-body"><T t={zin} /></p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

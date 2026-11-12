import Link from "next/link"
import { Foto } from "@/components/foto"
import { F01, F07_2, F08_1, F09_2, T02 } from "@/components/voorpagina/beelden"
import { WERK } from "@/components/werk/projecten"
import { Onthul, PlakCta, Vraag } from "./klant"

// De voorpagina volgens de handoff "GRØNN Studio Website 2027" (eigenaar koos
// "Handoff precies volgen", 12 nov 2026). Volgorde en tekst uit de handoff,
// pagina 09 en 10: hero, filosofie, drie specialismen, projecten, werkwijze,
// studio, FAQ, eind-CTA. De handoff zegt zelf dat conceptbeelden voor
// livegang eigen foto's worden; hier staan dus alleen eigen foto's.

const SPECIALISMEN = [
  {
    id: "tuinrenovatie",
    nr: "01 / Tuinen",
    kop: "Tuinrenovatie",
    sub: "Een nieuwe toekomst voor je tuin.",
    tekst:
      "Een bestaande tuin verdient soms een frisse blik. We brengen structuur, sfeer en natuurlijke materialen samen tot een buitenruimte die aansluit bij jouw leven. Van gerichte vernieuwing tot een complete transformatie.",
    link: { href: "/tuinen", label: "Ontdek tuinrenovatie" },
    foto: T02,
  },
  {
    id: "vijvers",
    nr: "02 / Water",
    kop: "Vijvers & watersystemen",
    sub: "Breng het water weer in balans.",
    tekst:
      "Een mooie vijver begint onder het wateroppervlak. We combineren kennis van filtering, circulatie en waterkwaliteit met een natuurlijke vormgeving. Voor vijvers die mooi ogen en technisch goed functioneren.",
    link: { href: "/vijvers", label: "Ontdek vijverrenovatie" },
    foto: F08_1,
  },
  {
    id: "ontwerp-advies",
    nr: "03 / Advies",
    kop: "Ontwerp & specialistisch advies",
    sub: "Een goed resultaat begint met inzicht.",
    tekst:
      "Soms is niet meteen een renovatie nodig, maar eerst een helder plan. We helpen met tuinconcepten, beplantingsadvies, vijverinspecties en technische verbeteringen. Praktisch, doordacht en afgestemd op jouw situatie.",
    link: { href: "/start-een-project?type=advies", label: "Vraag ontwerp of advies aan" },
    foto: F07_2,
  },
]

const STAPPEN = [
  { kop: "Vertel ons over je plannen", tekst: "Deel wat je wilt veranderen, locatie, budget en bij voorkeur foto's." },
  { kop: "We onderzoeken de mogelijkheden", tekst: "We bespreken je wensen en bepalen of inspectie, advies, ontwerp of renovatie past." },
  { kop: "Je ontvangt een duidelijk voorstel", tekst: "Je krijgt inzicht in werkzaamheden, materiaalkeuzes, investering en planning." },
  { kop: "We brengen het plan tot leven", tekst: "GRØNN Studio voert de kern uit en schakelt waar nodig passende vakpartners in." },
]

const VRAGEN = [
  {
    v: "In welk gebied werkt GRØNN Studio?",
    a: "Primair in Limburg en omgeving. Deel je postcode in de aanvraag; dan beoordelen we snel of je project binnen het werkgebied valt.",
  },
  {
    v: "Kunnen jullie een bestaande tuin deels vernieuwen?",
    a: "Ja. We bekijken welke onderdelen behouden kunnen blijven en waar een gerichte ingreep het meeste verschil maakt.",
  },
  {
    v: "Helpen jullie ook alleen met vijverproblemen?",
    a: "Ja. Een inspectie of technisch advies kan de juiste eerste stap zijn bij waterkwaliteit, circulatie of filtering.",
  },
  {
    v: "Wat kost een traject?",
    a: "Dat hangt af van schaal, bestaande situatie, materiaal en techniek. De intake vraagt om een bandbreedte, waarna we een passende vervolgstap voorstellen.",
  },
  {
    v: "Hoe snel kunnen jullie starten?",
    a: "Beschikbaarheid wisselt per seizoen en project. Geef je gewenste planning door; na beoordeling ontvang je een realistische indicatie.",
  },
]

export function HandoffVoorpagina() {
  const [groot, klein] = WERK
  return (
    <div className="ho">
      {/* 01 · Hero */}
      <section className="ho-held" id="ho-held" aria-labelledby="ho-titel">
        <div className="ho-kolom ho-held-raster">
          <div>
            <p className="ho-lbl">Tuinrenovatie · Vijvers · Ontwerp &amp; advies</p>
            <h1 id="ho-titel" className="ho-titel">
              Buitenruimte die <em>natuurlijk</em> aanvoelt.
            </h1>
          </div>
          <div className="ho-held-zij">
            <p>
              Een tuin om in thuis te komen. Een vijver die weer tot leven komt. Met aandacht voor vorm, natuur en techniek vernieuwt GRØNN
              Studio buitenruimtes in Limburg en omgeving.
            </p>
            <Link href="/start-een-project" className="ho-knop ho-knop-bos">
              Start een project <span aria-hidden>↗</span>
            </Link>
            <a href="#projecten" className="ho-pijl">
              Ontdek ons werk <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
        <div className="ho-kolom">
          <Foto foto={F01} priority sizes="(min-width: 1440px) 1344px, 94vw" className="ho-held-beeld" />
          <div className="ho-held-onder ho-lbl">
            <span>01 / Natuurlijk vernieuwen</span>
            <span>Limburg · Nederland</span>
          </div>
        </div>
      </section>

      {/* 02 · Filosofie */}
      <Onthul className="ho-blok ho-porselein" aria-labelledby="ho-filosofie">
        <div className="ho-kolom ho-twee">
          <p className="ho-lbl">De filosofie</p>
          <div>
            <h2 id="ho-filosofie" className="ho-h2">Een buitenruimte is meer dan wat je ziet.</h2>
            <div className="ho-tekst">
              <p>Een plek waar je tot rust komt. Waar materialen mooi verouderen, beplanting zich ontwikkelt en water beweging brengt.</p>
              <p>
                Bij GRØNN Studio kijken we verder dan alleen de aanleg. We onderzoeken wat een bestaande tuin of vijver nodig heeft en brengen
                esthetiek, functionaliteit en techniek samen.
              </p>
              <p className="ho-sterk">Met aandacht ontworpen. Met vakmanschap uitgevoerd.</p>
            </div>
          </div>
        </div>
      </Onthul>

      {/* 03 · Specialismen */}
      <Onthul className="ho-blok" id="specialismen" aria-labelledby="ho-specialismen">
        <div className="ho-kolom">
          <div className="ho-sectiekop">
            <div>
              <p className="ho-lbl">Drie specialismen</p>
              <h2 id="ho-specialismen" className="ho-h2">Drie routes naar een plek die klopt.</h2>
            </div>
            <p className="ho-sectiekop-zij">Van gerichte vernieuwing tot technisch herstel of een helder plan. Kies de route die bij jouw situatie past.</p>
          </div>
          <ul className="ho-diensten">
            {SPECIALISMEN.map((s) => (
              <li key={s.id} id={s.id} className="ho-dienst">
                <Link href={s.link.href} className="ho-dienst-beeld" tabIndex={-1} aria-hidden>
                  <Foto foto={s.foto} sizes="(min-width: 1024px) 50vw, 94vw" className="ho-dienst-foto" />
                </Link>
                <div className="ho-dienst-tekst">
                  <p className="ho-lbl">{s.nr}</p>
                  <h3 className="ho-h3">{s.kop}</h3>
                  <p className="ho-sterk">{s.sub}</p>
                  <p>{s.tekst}</p>
                  <Link href={s.link.href} className="ho-pijl">
                    {s.link.label} <span aria-hidden>↗</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Onthul>

      {/* 04 · Gerealiseerd werk */}
      <Onthul className="ho-blok" id="projecten" aria-labelledby="ho-projecten">
        <div className="ho-kolom">
          <div className="ho-sectiekop">
            <div>
              <p className="ho-lbl">Gerealiseerd werk</p>
              <h2 id="ho-projecten" className="ho-h2">Elke plek heeft een eigen verhaal.</h2>
            </div>
            <p className="ho-sectiekop-zij">
              Van de eerste uitdaging tot het laatste detail. Ontdek hoe bestaande tuinen en vijvers veranderen met een doordachte aanpak.
            </p>
          </div>
          <ul className="ho-werk">
            {[groot, klein].map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="ho-werk-kaart">
                  <Foto foto={p.foto} sizes="(min-width: 1024px) 60vw, 94vw" className="ho-werk-foto" />
                  <p className="ho-lbl">{p.type.nl}{p.plaats !== "—" ? ` · ${p.plaats}` : ""} · {p.jaar}</p>
                  <h3 className="ho-h3">{p.titel.nl}</h3>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/werk" className="ho-knop ho-knop-lijn">
            Bekijk projecten <span aria-hidden>↗</span>
          </Link>
        </div>
      </Onthul>

      {/* 05 · Werkwijze */}
      <Onthul className="ho-blok" id="werkwijze" aria-labelledby="ho-werkwijze">
        <div className="ho-kolom">
          <p className="ho-lbl">Van eerste idee tot eindresultaat</p>
          <h2 id="ho-werkwijze" className="ho-h2">Een helder proces. Een persoonlijk resultaat.</h2>
          <ol className="ho-stappen">
            {STAPPEN.map((s, i) => (
              <li key={s.kop}>
                <span className="ho-lbl">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.kop}</h3>
                <p>{s.tekst}</p>
              </li>
            ))}
          </ol>
        </div>
      </Onthul>

      {/* 06 · Studio */}
      <Onthul className="ho-blok" aria-labelledby="ho-studio">
        <div className="ho-kolom ho-studio">
          <Foto foto={F09_2} sizes="(min-width: 1024px) 45vw, 94vw" className="ho-studio-foto" />
          <div className="ho-studio-tekst">
            <p className="ho-lbl">Over GRØNN Studio</p>
            <h2 id="ho-studio" className="ho-h2">Klein in schaal. Groot in aandacht.</h2>
            <p>
              GRØNN Studio is een zelfstandige studio voor tuin- en vijverrenovatie, met een persoonlijke en betrokken werkwijze. Geen onnodig
              ingewikkeld proces of standaardoplossingen. Wel direct contact, aandacht voor details en een sterke combinatie van uitvoering en
              technische kennis.
            </p>
            <p>Omdat goed buitenwerk begint bij begrijpen wat een plek nodig heeft.</p>
            <Link href="/over" className="ho-pijl">
              Meer over de studio <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </Onthul>

      {/* 07 · FAQ */}
      <Onthul className="ho-blok" aria-labelledby="ho-faq">
        <div className="ho-kolom ho-twee">
          <div>
            <p className="ho-lbl">Veelgestelde vragen</p>
            <h2 id="ho-faq" className="ho-h2">Vragen voordat je begint.</h2>
          </div>
          <div className="ho-vragen">
            {VRAGEN.map((q) => (
              <Vraag key={q.v} vraag={q.v}>
                <p>{q.a}</p>
              </Vraag>
            ))}
          </div>
        </div>
      </Onthul>

      {/* 08 · Eind-CTA */}
      <section className="ho-eind" id="ho-eind" aria-labelledby="ho-eind-kop">
        <div className="ho-kolom">
          <p className="ho-lbl">Start een project</p>
          <h2 id="ho-eind-kop" className="ho-eind-kop">Er begint iets moois buiten.</h2>
          <p>Een tuin die niet meer bij je past? Een vijver die aandacht nodig heeft? Vertel ons over je plannen.</p>
          <Link href="/start-een-project" className="ho-knop ho-knop-bos">
            Start jouw project <span aria-hidden>↗</span>
          </Link>
        </div>
      </section>

      <PlakCta />
    </div>
  )
}

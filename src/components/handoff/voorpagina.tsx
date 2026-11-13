import Link from "next/link"
import { Fragment, ViewTransition, type CSSProperties } from "react"
import { Foto } from "@/components/foto"
import { euro } from "@/components/diensten/prijs"
import { F01, F02_2, F07_2, F08_1, F09_2, F10, T02 } from "@/components/voorpagina/beelden"
import { WERK } from "@/components/werk/projecten"
import { BUSINESS } from "@/lib/business"
import { pricingFor } from "@/lib/data/pricing"
import { KLANT_CITAAT } from "@/lib/data/vijverrenovatie"
import { Onthul, TelLink, Vraag, VoorNu } from "./klant"

// De voorpagina volgens de handoff "GRØNN Studio Website 2027" (eigenaar koos
// "Handoff precies volgen", 12 nov 2026). Volgorde en tekst uit de handoff,
// pagina 09 en 10: hero, filosofie, drie specialismen, projecten, werkwijze,
// studio, FAQ, eind-CTA. De handoff zegt zelf dat conceptbeelden voor
// livegang eigen foto's worden; hier staan dus alleen eigen foto's.

const prijs = (slug: string) => pricingFor(slug)?.tiers[0]?.amount ?? 0

// "Stuur een foto" gaat via WhatsApp met een ingevulde eerste zin.
export const WHATSAPP_FOTO = `${BUSINESS.whatsapp}?text=${encodeURIComponent("Hoi Nick, hier een foto van mijn tuin/vijver. Kun je even meekijken?")}`

const SPECIALISMEN = [
  {
    id: "tuinrenovatie",
    nr: "01 / Tuinen",
    kop: "Tuinrenovatie",
    sub: "Een nieuwe toekomst voor je tuin.",
    tekst:
      "Een bestaande tuin verdient soms een frisse blik. Ik breng structuur, sfeer en natuurlijke materialen samen tot een buitenruimte die aansluit bij jouw leven. Van gerichte vernieuwing tot een complete transformatie.",
    prijs: `Kleine tuin of terras vanaf ${euro(prijs("implementation"))}, vaste prijs vooraf`,
    link: { href: "/tuinen", label: "Ontdek tuinrenovatie" },
    foto: T02,
  },
  {
    id: "vijvers",
    nr: "02 / Water",
    kop: "Vijvers & watersystemen",
    sub: "Breng het water weer in balans.",
    tekst:
      "Een mooie vijver begint onder het wateroppervlak. Ik combineer kennis van filtering, circulatie en waterkwaliteit met een natuurlijke vormgeving. Voor vijvers die mooi ogen en technisch goed functioneren.",
    prijs: `Vijveronderhoud vanaf ${euro(prijs("maintenance-subscription"))} per maand`,
    link: { href: "/vijvers", label: "Ontdek vijverrenovatie" },
    foto: F08_1,
  },
  {
    id: "ontwerp-advies",
    nr: "03 / Advies",
    kop: "Ontwerp & specialistisch advies",
    sub: "Een goed resultaat begint met inzicht.",
    tekst:
      "Soms is niet meteen een renovatie nodig, maar eerst een helder plan. Ik help met tuinconcepten, beplantingsadvies, vijverinspecties en technische verbeteringen. Praktisch, doordacht en afgestemd op jouw situatie.",
    prijs: `Vijverdoorlichting ${euro(prijs("pond-survey"))}, verrekend bij een opdracht`,
    link: { href: "/start-een-project?type=advies", label: "Vraag ontwerp of advies aan" },
    foto: F07_2,
  },
]

const STAPPEN = [
  { kop: "Vertel me over je plannen", tekst: "Wat je wilt veranderen, waar, je budget en het liefst een paar foto's." },
  { kop: "Ik kom kijken", tekst: "We bespreken je wensen op de plek zelf en ik zeg eerlijk of inspectie, advies, ontwerp of renovatie past." },
  { kop: "Je krijgt een vaste prijs", tekst: "Een helder voorstel met werkzaamheden, materialen, planning en één prijs vooraf. Geen verrassingen achteraf." },
  { kop: "Ik voer het zelf uit", tekst: "Ik doe het werk zelf en schakel alleen waar nodig een vakpartner in die ik ken." },
]

const VRAGEN = [
  {
    v: "In welk gebied werk je?",
    a: "In Stein en omgeving, tot zo'n 30 kilometer: van Maastricht en Sittard-Geleen tot Heerlen en Kerkrade. Zet je postcode in de aanvraag, dan zeg ik meteen of het past.",
  },
  {
    v: "Kun je een bestaande tuin deels vernieuwen?",
    a: "Ja. Ik kijk wat kan blijven en waar een gerichte ingreep het meeste verschil maakt.",
  },
  {
    v: "Help je ook alleen met een vijverprobleem?",
    a: "Ja. Bij groen water, een lekkende vijver of een filter dat niet werkt is een vijverdoorlichting vaak de beste eerste stap. Stuur gerust eerst een foto via WhatsApp.",
  },
  {
    v: "Wat kost een traject?",
    a: "Dat hangt af van de schaal, de bestaande situatie en de materialen. Je krijgt altijd een vaste prijs vooraf, dus je weet waar je aan toe bent voordat ik begin.",
  },
  {
    v: "Wanneer kun je beginnen?",
    a: "Het voorjaar loopt het snelst vol. Wie nu plant, kan in maart beginnen. Geef je gewenste planning door, dan krijg je een eerlijke datum.",
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
            <p className="ho-lbl">Voorjaar 2027 · Stein en omgeving</p>
            <h1 id="ho-titel" className="ho-titel">
              {/* per woord omhoog bij het laden; zie .ho-woord in handoff.css */}
              {["Buitenruimte", "die", "natuurlijk", "aanvoelt."].map((w, i) => (
                <Fragment key={w}>
                  <span className="ho-woord" style={{ "--i": i } as CSSProperties}>
                    <span>{w === "natuurlijk" ? <em>{w}</em> : w}</span>
                  </span>{" "}
                </Fragment>
              ))}
            </h1>
          </div>
          <div className="ho-held-zij">
            <p>
              Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.
            </p>
            <p className="ho-haak">Plan nu, dan begin ik in maart.</p>
            <div className="ho-knoppen">
              <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="hero" className="ho-knop ho-knop-oranje">
                Start een project <span aria-hidden>↗</span>
              </TelLink>
              <TelLink href={WHATSAPP_FOTO} gebeurtenis="cta_whatsapp_foto" plek="hero" className="ho-knop ho-knop-lijn">
                Stuur een foto <span aria-hidden>↗</span>
              </TelLink>
            </div>
            <a href="#projecten" className="ho-pijl">
              Bekijk mijn werk <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
        <div className="ho-kolom">
          <div className="ho-held-raam">
            <div data-v="1">
              <Foto foto={F10} priority sizes="(min-width: 1440px) 1344px, 94vw" className="ho-held-beeld" />
            </div>
          </div>
          <div className="ho-held-onder ho-lbl">
            <span>01 / Natuurlijk vernieuwen</span>
            <span>Stein · Limburg</span>
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
                Ik kijk verder dan alleen de aanleg. Eerst onderzoek ik wat een bestaande tuin of vijver nodig heeft, daarna breng ik vorm, natuur
                en techniek samen.
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
                <Link transitionTypes={["schuif"]} href={s.link.href} className="ho-dienst-beeld" tabIndex={-1} aria-hidden>
                  <Foto foto={s.foto} sizes="(min-width: 1024px) 50vw, 94vw" className="ho-dienst-foto" />
                </Link>
                <div className="ho-dienst-tekst">
                  <p className="ho-lbl">{s.nr}</p>
                  <h3 className="ho-h3">{s.kop}</h3>
                  <p className="ho-sterk">{s.sub}</p>
                  <p>{s.tekst}</p>
                  <p className="ho-prijs">{s.prijs}</p>
                  <Link transitionTypes={["schuif"]} href={s.link.href} className="ho-pijl">
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
              Alleen eigen werk, met eigen foto&apos;s. Zo zag de vijverrenovatie in Stein eruit, en nu, en dit zegt de opdrachtgever erover.
            </p>
          </div>
          <figure className="ho-voorna">
            <VoorNu voor={F02_2} nu={F01} sizes="(min-width: 1024px) 60vw, 94vw" />
            <blockquote className="ho-citaat">
              <p>“{KLANT_CITAAT.tekst.nl}”</p>
              <footer className="ho-lbl">{KLANT_CITAAT.bron}</footer>
            </blockquote>
          </figure>
          <ul className="ho-werk">
            {[groot, klein].map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="ho-werk-kaart">
                  <ViewTransition name={p.morph} share="morph" default="none">
                    <Foto foto={p.foto} sizes="(min-width: 1024px) 60vw, 94vw" className="ho-werk-foto" />
                  </ViewTransition>
                  <p className="ho-lbl">{p.type.nl}{p.plaats !== "—" ? ` · ${p.plaats}` : ""} · {p.jaar}</p>
                  <h3 className="ho-h3">{p.titel.nl}</h3>
                </Link>
              </li>
            ))}
          </ul>
          <Link transitionTypes={["schuif"]} href="/werk" className="ho-knop ho-knop-lijn">
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
          <div className="ho-studio-raam">
            <div data-v="0.6">
              <Foto foto={F09_2} sizes="(min-width: 1024px) 45vw, 94vw" className="ho-studio-foto" />
            </div>
          </div>
          <div className="ho-studio-tekst">
            <p className="ho-lbl">Over GRØNN Studio</p>
            <h2 id="ho-studio" className="ho-h2">Klein in schaal. Groot in aandacht.</h2>
            <p>
              Ik ben Nick, en GRØNN Studio is mijn eenmanszaak voor tuinen en vijvers in Stein en omgeving. Geen ingewikkeld proces en geen
              standaardoplossingen. Wel één aanspreekpunt van eerste gesprek tot oplevering, aandacht voor details en technische kennis van water.
            </p>
            <p>Omdat goed buitenwerk begint bij begrijpen wat een plek nodig heeft.</p>
            <Link transitionTypes={["schuif"]} href="/over" className="ho-pijl">
              Meer over mij <span aria-hidden>↗</span>
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
          <p>Een tuin die niet meer bij je past? Een vijver die aandacht nodig heeft? Vertel me over je plannen. Plan je nu, dan begin ik in maart.</p>
          <div className="ho-knoppen">
            <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="eind" className="ho-knop ho-knop-oranje">
              Start jouw project <span aria-hidden>↗</span>
            </TelLink>
            <TelLink href={WHATSAPP_FOTO} gebeurtenis="cta_whatsapp_foto" plek="eind" className="ho-knop ho-knop-lijn">
              Stuur een foto <span aria-hidden>↗</span>
            </TelLink>
          </div>
        </div>
      </section>

    </div>
  )
}

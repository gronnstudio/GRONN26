import type { CSSProperties } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T, type Tekst } from "@/components/taal"
import { ObservatieFoto } from "@/components/observatie/observatie"
import { WATERVAL } from "@/lib/data/observaties"
import { WERK } from "@/components/werk/projecten"
import { F08_2, F10, T01 } from "@/components/voorpagina/beelden"
import { fotosVoor, type Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"
import { Haken, type Haak } from "./haken"
import "./veldboek.css"

// De voorpagina als veldboek (9 nov 2026, Website Master Brief; zie
// docs/website/BLUEPRINT.md en ART-DIRECTION.md). Zes delen, elk met een
// eigen compositie: opening, index, observatie, dossiers, werkwijze, slot.
// Papier en plaat wisselen elkaar af. Alles is echte inhoud: echte foto's,
// echte projecten, geen cijfers of reviews die er niet zijn.

/* ── 00 Opening ─────────────────────────────────────────────────────────── */

const KOP: L[] = [
  { nl: "Eerst water,", en: "First water," },
  { nl: "bodem en licht.", en: "soil and light." },
  { nl: "Dan pas de planten.", en: "Then the plants." },
]

// Een hand zet een jonge vijverplant in een mand met grind: het moment waar
// de kop naartoe loopt. Alleen wat op de foto te zien is.
const AANPLANT = fotosVoor("F09")[0] as FotoData
const AANPLANT_HAKEN: Haak[] = [
  { x: 37, y: 41, b: 17, h: 11, wat: { nl: "Jonge vijverplant", en: "Young pond plant" }, kern: true },
  { x: 70, y: 70, b: 27, h: 24, wat: { nl: "Grind in de mand", en: "Gravel in the basket" }, onder: true },
]

export function Opening() {
  return (
    <section className="vb-opening" aria-labelledby="kop">
      <p className="vb-regel vb-in" style={{ "--i": 0 } as CSSProperties}>
        <span>GRØNN Studio</span>
        <span><T t={{ nl: "Vijvers en natuurlijke tuinen", en: "Ponds and natural gardens" }} /></span>
        <span className="vb-regel-plek">Stein · 50,97° N 5,77° O</span>
      </p>

      <h1 id="kop" className="vb-display">
        {KOP.map((r, i) => (
          <span key={i} className="vb-kopregel">
            <span style={{ "--i": i } as CSSProperties}><T t={r} /></span>
          </span>
        ))}
      </h1>

      <div className="vb-opening-onder">
        <figure className="vb-opening-beeld m-0">
          <div className="vb-beeldvak">
            <Foto foto={AANPLANT} priority sizes="(min-width: 1024px) 34vw, 100vw" className="vb-vul" />
            <Haken haken={AANPLANT_HAKEN} />
          </div>
          <figcaption className="vb-bijschrift">
            <span>GR / 001</span>
            <span><T t={{ nl: "Aanplant, vijverrenovatie", en: "Planting, pond renovation" }} /></span>
          </figcaption>
        </figure>

        <div className="vb-opening-tekst">
          <p className="vb-lead m-0">
            <T t={{
              nl: "Ik ben Nick. Ik ontwerp, maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
              en: "I’m Nick. I design, build and maintain ponds and natural gardens for homeowners in Stein and the surrounding area, with a fixed price up front.",
            }} />
          </p>
          <div className="vb-acties">
            <Link href="/kennismaken" className="knop bg-oranje text-antraciet">
              <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
            </Link>
            <a href={BUSINESS.whatsapp} className="knop vb-knop-lijn">WhatsApp</a>
          </div>
          <dl className="vb-feiten">
            <div><dt><T t={{ nl: "Werkgebied", en: "Area" }} /></dt><dd><T t={{ nl: "Stein + ± 30 km", en: "Stein + ± 30 km" }} /></dd></div>
            <div><dt><T t={{ nl: "Prijs", en: "Price" }} /></dt><dd><T t={{ nl: "Vast, vooraf", en: "Fixed, up front" }} /></dd></div>
            <div><dt><T t={{ nl: "Wie", en: "Who" }} /></dt><dd><T t={{ nl: "Eén persoon, begin tot eind", en: "One person, start to finish" }} /></dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ── 01 Index: wat ik doe ───────────────────────────────────────────────── */

type Regel = { href: string; naam: Tekst; zin: Tekst; delen: Tekst; foto: FotoData }

const REGELS: Regel[] = [
  {
    href: "/vijvers",
    naam: { nl: "Vijvers", en: "Ponds" },
    zin: { nl: "Water dat zijn weg vindt, schoon blijft en bij de tuin hoort.", en: "Water that finds its way, stays clear and belongs to the garden." },
    delen: { nl: "Diagnose · Renovatie · Aanleg · Onderhoud", en: "Diagnosis · Renovation · Build · Care" },
    foto: F10,
  },
  {
    href: "/tuinen",
    naam: { nl: "Tuinen", en: "Gardens" },
    zin: { nl: "Natuurlijke tuinen die met de seizoenen meegroeien.", en: "Natural gardens that grow with the seasons." },
    delen: { nl: "Ontwerp · Aanleg · Beplanting · Onderhoud", en: "Design · Build · Planting · Care" },
    foto: T01,
  },
  {
    href: "/tuinen/borderpakketten",
    naam: { nl: "Border­pakketten", en: "Border packages" },
    zin: { nl: "Een complete border met plantlijst en plan, of een op maat.", en: "A complete border with plant list and plan, or a custom one." },
    delen: { nl: "8 pakketten · 5, 10 of 15 m² · Op maat", en: "8 packages · 5, 10 or 15 m² · Custom" },
    foto: {
      src: "/borderpakketten/vlinderborder.jpg",
      width: 1600,
      height: 1200,
      alt: "Een bloeiende border met zonnehoed en siergras.",
      label: "Sfeerbeeld",
      en: { alt: "A flowering border with coneflowers and ornamental grass.", label: "Mood image" },
    },
  },
]

const Sectiekop = ({ nr, t, id }: { nr: string; t: Tekst; id: string }) => (
  <div className="vb-sectiekop">
    <span className="vb-mono">{nr}</span>
    <h2 id={id} className="vb-h2"><T t={t} /></h2>
  </div>
)

export function Index() {
  return (
    <section className="vb-sectie vb-zie" aria-labelledby="h-index">
      <Sectiekop nr="01" id="h-index" t={{ nl: "Wat ik doe", en: "What I do" }} />
      <ol className="vb-index">
        {REGELS.map((r, i) => (
          <li key={r.href}>
            <Link href={r.href} className="vb-indexregel">
              <span className="vb-mono vb-index-nr">{String(i + 1).padStart(2, "0")}</span>
              <span className="vb-index-naam"><T t={r.naam} /></span>
              <span className="vb-index-zin"><T t={r.zin} /></span>
              <span className="vb-mono vb-index-delen"><T t={r.delen} /></span>
              <span className="vb-index-pijl" aria-hidden="true">→</span>
              <span className="vb-index-beeld" aria-hidden="true">
                <Foto foto={r.foto} sizes="240px" className="vb-vul" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ── 02 Observatie 001: wat ik zie ──────────────────────────────────────── */

export function Observatie() {
  return (
    <section className="vb-plaat donker" aria-labelledby="h-obs">
      <div className="vb-plaat-binnen vb-obs">
        <div className="vb-obs-tekst vb-zie">
          <span className="vb-mono">02</span>
          <h2 id="h-obs" className="vb-h2">
            <T t={{ nl: "Wat ik zie als ik naar een vijver kijk.", en: "What I see when I look at a pond." }} />
          </h2>
          <p className="vb-body">
            <T t={{
              nl: "Voordat ik iets ontwerp, kijk ik waar het water vandaan komt, waar het warm wordt en wat er al groeit. Tik op een kader voor de uitleg.",
              en: "Before I design anything, I look at where the water comes from, where it warms up and what already grows. Tap a frame for the explanation.",
            }} />
          </p>
          <Link href="/werk/vijverrenovatie" className="vb-link">
            <T t={{ nl: "Het hele project →", en: "The whole project →" }} />
          </Link>
        </div>
        <div className="vb-obs-beeld">
          <ObservatieFoto obs={WATERVAL} sizes="(min-width: 1024px) 58vw, 100vw" />
        </div>
      </div>
    </section>
  )
}

/* ── 03 Dossiers: echt werk ─────────────────────────────────────────────── */

export function Dossiers() {
  return (
    <section className="vb-sectie" aria-labelledby="h-werk">
      <div className="vb-zie">
        <Sectiekop nr="03" id="h-werk" t={{ nl: "Uitgevoerd werk", en: "Completed work" }} />
      </div>
      <ul className="vb-dossiers">
        {WERK.map((p) => (
          <li key={p.href} className="vb-dossier vb-zie">
            <Link href={p.href} className="vb-dossier-link">
              <div className="vb-dossier-beeld">
                <Foto foto={p.foto} sizes="(min-width: 1024px) 50vw, 100vw" className="vb-vul" />
              </div>
              <p className="vb-bijschrift">
                <span>{p.code}</span>
                <span>{p.jaar}</span>
                <span><T t={p.status} /></span>
              </p>
              <h3 className="vb-h3"><T t={p.titel} /></h3>
              <p className="vb-klein m-0">
                <T t={p.type} />
                {p.plaats === "—" ? null : <> · {p.plaats}</>}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/werk" className="vb-link vb-zie">
        <T t={{ nl: "Alle dossiers →", en: "All case files →" }} />
      </Link>
    </section>
  )
}

/* ── 04 Werkwijze ───────────────────────────────────────────────────────── */

export const WERKWIJZE: L[] = [
  { nl: "Ik ontwerp, leg aan en onderhoud zelf. Eén persoon van het eerste gesprek tot de laatste plant.", en: "I design, build and maintain myself. One person from the first conversation to the last plant." },
  { nl: "Een vaste prijs vooraf, waar het kan. Wat niet blind te prijzen is, bekijk ik eerst ter plaatse.", en: "A fixed price up front, wherever possible. What can’t be priced blind, I look at on site first." },
  { nl: "Ik begin bij water, bodem en licht van jouw plek, en kies daarna pas de planten.", en: "I start with the water, soil and light of your place, and only then choose the plants." },
  { nl: "Werkgebied: Stein en omgeving, tot ongeveer 30 km (Maastricht, Heerlen, Kerkrade).", en: "Area: Stein and surroundings, up to about 30 km (Maastricht, Heerlen, Kerkrade)." },
]

export function Werkwijze() {
  return (
    <section className="vb-sectie vb-werkwijze" aria-labelledby="h-wijze">
      <div className="vb-wijze-tekst vb-zie">
        <Sectiekop nr="04" id="h-wijze" t={{ nl: "Hoe ik werk", en: "How I work" }} />
        <ol className="vb-uitspraken">
          {WERKWIJZE.map((w, i) => (
            <li key={i}>
              <span className="vb-mono">{String(i + 1).padStart(2, "0")}</span>
              <p className="m-0"><T t={w} /></p>
            </li>
          ))}
        </ol>
        <Link href="/over" className="vb-link">
          <T t={{ nl: "Meer over mij →", en: "More about me →" }} />
        </Link>
      </div>
      <figure className="vb-portret m-0 vb-zie">
        <div className="vb-portret-beeld">
          <Foto foto={F08_2} sizes="(min-width: 1024px) 30vw, 80vw" className="vb-vul" />
        </div>
        <figcaption className="vb-bijschrift">
          <span>Nick Peters</span>
          <span><T t={{ nl: "Aan het werk bij GR / 001", en: "At work on GR / 001" }} /></span>
        </figcaption>
      </figure>
    </section>
  )
}

/* ── 05 Slot ────────────────────────────────────────────────────────────── */

export function Slot() {
  return (
    <section className="vb-plaat donker vb-slot" aria-labelledby="h-slot">
      <div className="vb-plaat-binnen vb-zie">
        <span className="vb-mono"><T t={{ nl: "05 · Volgende stap", en: "05 · Next step" }} /></span>
        <h2 id="h-slot" className="vb-slot-kop">
          <T t={{ nl: "Zullen we kennismaken?", en: "Shall we meet?" }} />
        </h2>
        <p className="vb-lead vb-slot-zin">
          <T t={{
            nl: "Vertel wat je nu ziet in je tuin, en wat je er graag zou zien. Dan kijken we samen waar het begint.",
            en: "Tell me what you see in your garden now, and what you would like to see there. Then we look together at where it starts.",
          }} />
        </p>
        <div className="vb-acties">
          <Link href="/kennismaken" className="knop bg-oranje text-antraciet">
            <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
          </Link>
          <a href={BUSINESS.whatsapp} className="knop vb-knop-lijn">WhatsApp</a>
          <a href={BUSINESS.emailHref} className="knop vb-knop-lijn">{BUSINESS.email}</a>
        </div>
      </div>
    </section>
  )
}

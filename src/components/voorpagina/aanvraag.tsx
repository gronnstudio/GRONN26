import Link from "next/link"
import { Foto } from "@/components/foto"
import { T, type Tekst } from "@/components/taal"
import { BUSINESS } from "@/lib/business"
import { pricingFor } from "@/lib/data/pricing"
import { KLANT_CITAAT } from "@/lib/data/vijverrenovatie"
import { euro } from "@/components/diensten/prijs"
import { F01, F02_2, F08_2, F10, T01 } from "./beelden"

// De voorpagina als aanvraagpagina (eigenaar, 11 nov 2026: "iets dat klanten
// aantrekt! Ik wil in maart een volle agenda"). Eén doel: een foto via
// WhatsApp of een kennismaking. Alles staat stil; geen nieuwe effecten.
// Prijzen komen uit pricing.ts, het citaat is Veroniques Google-review.

const wa = (tekst: string) => `${BUSINESS.whatsapp}?text=${encodeURIComponent(tekst)}`
const FOTO_STUREN = wa("Hoi Nick, hier een foto van mijn vijver of tuin. Kun je in het voorjaar?")

/** Laagste bedrag uit pricing.ts, zodat deze pagina nooit een eigen prijs heeft. */
const laagste = (slug: string) => {
  const p = pricingFor(slug)
  return p ? Math.min(...p.tiers.map((t) => t.amount)) : undefined
}
const vanaf = (slug: string, mnd = false): Tekst => {
  const n = laagste(slug)
  if (n === undefined) return { nl: "Op maat", en: "Custom" }
  return { nl: `vanaf ${euro(n)}${mnd ? " /mnd" : ""}`, en: `from ${euro(n, "en")}${mnd ? " /mo" : ""}` }
}
/** De vijverdoorlichting zelf (de eerste regel; de goedkopere tuinscan hoort er niet bij). */
const DOORLICHTING = pricingFor("pond-survey")?.tiers[0]?.amount ?? 195

type Vraag = { kop: Tekst; zin: Tekst; prijs: Tekst; bericht: string; href: string }

const VRAGEN: Vraag[] = [
  {
    kop: { nl: "Mijn vijver is groen of troebel", en: "My pond is green or murky" },
    zin: { nl: "Ik zoek uit waar het misgaat: filter, pomp, planten of de bodem. Dan weet je wat het oplost en wat het kost.", en: "I find out what goes wrong: filter, pump, plants or the bottom. Then you know what fixes it and what it costs." },
    prijs: { nl: `vijverdoorlichting ${euro(DOORLICHTING)}`, en: `pond survey ${euro(DOORLICHTING, "en")}` },
    bericht: "Hoi Nick, mijn vijver is groen of troebel. Hier een foto.",
    href: "/vijvers",
  },
  {
    kop: { nl: "Mijn vijver is oud of lekt", en: "My pond is old or leaking" },
    zin: { nl: "Renoveren of opnieuw aanleggen, met waterval of beekloop als dat past. Zoals bij Veronique hieronder.", en: "Renovate or rebuild, with a waterfall or stream where it fits. Like Veronique’s below." },
    prijs: { nl: "vaste prijs na een bezoek", en: "fixed price after a visit" },
    bericht: "Hoi Nick, mijn vijver is aan renovatie toe. Hier een foto.",
    href: "/werk/vijverrenovatie",
  },
  {
    kop: { nl: "Ik wil een natuurlijke tuin", en: "I want a natural garden" },
    zin: { nl: "Een tuin die met de seizoenen meegroeit, met borders, een terras of een plek voor water.", en: "A garden that grows with the seasons, with borders, a terrace or a place for water." },
    prijs: vanaf("implementation"),
    bericht: "Hoi Nick, ik wil mijn tuin natuurlijker maken. Hier een foto.",
    href: "/tuinen",
  },
  {
    kop: { nl: "Ik wil geen omkijken naar onderhoud", en: "I don’t want to worry about upkeep" },
    zin: { nl: "Een vast aantal bezoeken per jaar, voor vijver of tuin. In het voorjaar opstarten, in het najaar afsluiten.", en: "A set number of visits a year, for pond or garden. Start-up in spring, close-down in autumn." },
    prijs: vanaf("maintenance-subscription", true),
    bericht: "Hoi Nick, ik zoek iemand voor vast onderhoud. Hier een foto.",
    href: "/vijvers",
  },
]

const STAPPEN: { wanneer: Tekst; kop: Tekst; zin: Tekst }[] = [
  {
    wanneer: { nl: "Vandaag", en: "Today" },
    kop: { nl: "Stuur een foto", en: "Send a photo" },
    zin: { nl: "Via WhatsApp of het formulier. Een paar zinnen is genoeg. Ik reageer meestal binnen twee werkdagen.", en: "By WhatsApp or the form. A few sentences are enough. I usually reply within two working days." },
  },
  {
    wanneer: { nl: "Deze winter", en: "This winter" },
    kop: { nl: "Ik kom kijken, jij krijgt een vaste prijs", en: "I come and look, you get a fixed price" },
    zin: { nl: "Ik kijk naar water, bodem en licht en schrijf op wat het wordt. Wat niet blind te prijzen is, bekijk ik eerst ter plaatse.", en: "I look at water, soil and light and write down what it will be. What can’t be priced blind, I look at on site first." },
  },
  {
    wanneer: { nl: "Maart", en: "March" },
    kop: { nl: "Ik leg aan", en: "I build it" },
    zin: { nl: "In het voorjaar slaan planten het beste aan en start een vijver het gezondst op. Jij kiest de week.", en: "In spring plants take best and a pond starts up healthiest. You pick the week." },
  },
]

const ZEKER: Tekst[] = [
  { nl: "Vaste prijs vooraf", en: "Fixed price up front" },
  { nl: "Eén vakman van begin tot eind", en: "One person from start to finish" },
  { nl: "Stein en omgeving, tot ±30 km", en: "Stein and around, up to ±30 km" },
]

const VRAAG_EN_ANTWOORD: { v: Tekst; a: Tekst }[] = [
  {
    v: { nl: "Wat kost een eerste bezoek?", en: "What does a first visit cost?" },
    a: { nl: `Een vijverdoorlichting kost ${euro(DOORLICHTING)}. Leidt die tot een opdracht boven € 750, dan verreken ik hem helemaal. Een foto sturen kost niets.`, en: `A pond survey costs ${euro(DOORLICHTING, "en")}. If it leads to a job over €750, I offset it in full. Sending a photo costs nothing.` },
  },
  {
    v: { nl: "Waar werk je?", en: "Where do you work?" },
    a: { nl: "In Stein en omgeving, tot ongeveer 30 km: ook Maastricht, Sittard-Geleen, Heerlen en Kerkrade.", en: "In Stein and around, up to about 30 km: Maastricht, Sittard-Geleen, Heerlen and Kerkrade too." },
  },
  {
    v: { nl: "En als het tegenvalt tijdens het werk?", en: "And if something turns up during the work?" },
    a: { nl: "Een vaste prijs is een vaste prijs. Zie ik vooraf iets wat ik niet kan inschatten, dan zeg ik dat vóór je tekent, niet erna.", en: "A fixed price is a fixed price. If I see something up front I can’t estimate, I say so before you sign, not after." },
  },
]

function WhatsAppIcoon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z" />
      <path d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Aanvraag() {
  return (
    <div className="ld">
      {/* ── opening: wat, voor wie, wanneer, en de knop ─────────────────── */}
      <section className="ld-held" aria-labelledby="kop">
        <Foto foto={F10} priority sizes="100vw" className="ld-held-beeld" />
        <div className="ld-held-waas" aria-hidden="true" />
        <div className="ld-held-tekst">
          <p className="lbl m-0"><T t={{ nl: "Voorjaar 2027 · Stein en omgeving", en: "Spring 2027 · Stein and surroundings" }} /></p>
          <h1 id="kop" className="ld-held-titel">
            <T t={{ nl: "Je vijver en tuin klaar voor het voorjaar.", en: "Your pond and garden ready for spring." }} />
          </h1>
          <p className="ld-held-zin m-0">
            <T t={{ nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf. Plan nu, dan begin ik in maart.", en: "I build and maintain ponds and natural gardens for homeowners in Stein and the surrounding area, with a fixed price up front. Plan now, and I start in March." }} />
          </p>
          <div className="ld-knoppen">
            <a href={FOTO_STUREN} className="knop bg-oranje text-antraciet">
              <WhatsAppIcoon />
              <T t={{ nl: "Stuur een foto", en: "Send a photo" }} />
            </a>
            <Link href="/kennismaken" className="knop ld-knop-licht">
              <T t={{ nl: "Plan een kennismaking", en: "Book a first meeting" }} />
            </Link>
          </div>
          <ul className="ld-zeker" aria-label="Zekerheden">
            {ZEKER.map((z, i) => <li key={i}><span className="ld-vink" aria-hidden="true">✓</span> <T t={z} /></li>)}
          </ul>
        </div>
      </section>

      {/* ── waar loop je tegenaan: elk probleem is een ingang ─────────── */}
      <section className="ld-blok ld-kolom" aria-labelledby="h-vragen">
        <p className="lbl ld-kicker m-0"><T t={{ nl: "Waar loop je tegenaan?", en: "What are you dealing with?" }} /></p>
        <h2 id="h-vragen" className="ld-kop">
          <T t={{ nl: "Kies wat het meest lijkt op jouw tuin.", en: "Pick what looks most like your garden." }} />
        </h2>
        <ul className="ld-vragen">
          {VRAGEN.map((v, i) => (
            <li key={i} className="ld-vraag">
              <h3><T t={v.kop} /></h3>
              <p className="m-0"><T t={v.zin} /></p>
              <p className="ld-prijs m-0"><T t={v.prijs} /></p>
              <div className="ld-vraag-acties">
                <a href={wa(v.bericht)} className="knop-klein ld-vraag-wa">
                  <WhatsAppIcoon />
                  <T t={{ nl: "Stuur foto", en: "Send photo" }} />
                </a>
                <Link href={v.href} className="lnk ld-vraag-meer"><T t={{ nl: "Meer lezen →", en: "Read more →" }} /></Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="ld-noot m-0"><T t={{ nl: "Alle prijzen inclusief btw.", en: "All prices include VAT." }} /></p>
      </section>

      {/* ── bewijs: echt werk en wat de klant zei ─────────────────────── */}
      <section className="ld-blok ld-kolom" aria-labelledby="h-bewijs">
        <p className="lbl ld-kicker m-0"><T t={{ nl: "Echt werk · Vijverrenovatie", en: "Real work · Pond renovation" }} /></p>
        <h2 id="h-bewijs" className="ld-kop"><T t={{ nl: "Van een vijver tegen de muur naar één watersysteem.", en: "From a pond against the wall to one water system." }} /></h2>
        <Link href="/werk/vijverrenovatie" className="ld-voorna">
          <figure className="m-0">
            <Foto foto={F02_2} sizes="(min-width: 768px) 40vw, 50vw" className="ld-voorna-foto" />
            <figcaption className="lbl"><T t={{ nl: "Ervoor", en: "Before" }} /></figcaption>
          </figure>
          <figure className="m-0">
            <Foto foto={F01} sizes="(min-width: 768px) 40vw, 50vw" className="ld-voorna-foto" />
            <figcaption className="lbl"><T t={{ nl: "Erna", en: "After" }} /></figcaption>
          </figure>
        </Link>
        <blockquote className="ld-citaat">
          <p className="m-0">“<T t={KLANT_CITAAT.tekst} />”</p>
          <footer className="lbl">
            <span className="ld-sterren" role="img" aria-label="5 van 5 sterren">★★★★★</span> {KLANT_CITAAT.bron}
          </footer>
        </blockquote>
        <div className="ld-ook">
          <Foto foto={T01} sizes="(min-width: 768px) 20vw, 40vw" className="ld-ook-foto" />
          <p className="m-0">
            <T t={{ nl: "Ook gemaakt: een terras in Geulle.", en: "Also built: a terrace in Geulle." }} />{" "}
            <Link href="/werk" className="lnk ld-alles"><T t={{ nl: "Bekijk al het werk →", en: "See all work →" }} /></Link>
          </p>
        </div>
      </section>

      {/* ── zo gaat het: van foto naar maart ─────────────────────────── */}
      <section className="ld-blok ld-kolom" aria-labelledby="h-stappen">
        <p className="lbl ld-kicker m-0"><T t={{ nl: "Zo gaat het", en: "How it works" }} /></p>
        <h2 id="h-stappen" className="ld-kop"><T t={{ nl: "Drie stappen naar een tuin die in maart begint.", en: "Three steps to a garden that starts in March." }} /></h2>
        <ol className="ld-stappen">
          {STAPPEN.map((s, i) => (
            <li key={i}>
              <span className="lbl ld-wanneer">{String(i + 1).padStart(2, "0")} · <T t={s.wanneer} /></span>
              <h3><T t={s.kop} /></h3>
              <p className="m-0"><T t={s.zin} /></p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── wie: Nick zelf ───────────────────────────────────────────── */}
      <section className="ld-blok ld-kolom ld-wie" aria-labelledby="h-wie">
        <Foto foto={F08_2} sizes="(min-width: 1024px) 30vw, 70vw" className="ld-portret" />
        <div>
          <p className="lbl ld-kicker m-0"><T t={{ nl: "Wie er komt", en: "Who turns up" }} /></p>
          <h2 id="h-wie" className="ld-kop"><T t={{ nl: "Ik ben Nick. Ik doe het werk zelf.", en: "I’m Nick. I do the work myself." }} /></h2>
          <p className="ld-tekst m-0">
            <T t={{ nl: "Geen verkoper en geen ploeg die je nooit eerder zag. Ik kom kijken, ik maak de prijs en ik sta in je tuin met de schop. Omdat ik alleen werk, past er in het voorjaar maar een beperkt aantal klussen in mijn agenda. Wie nu plant, kiest zelf de week.", en: "No salesperson and no crew you’ve never met. I come to look, I make the price and I’m the one in your garden with the spade. Because I work alone, only a limited number of jobs fit into my spring. Plan now and you pick the week." }} />
          </p>
          <Link href="/over" className="lnk ld-meer"><T t={{ nl: "Meer over mij →", en: "More about me →" }} /></Link>
        </div>
      </section>

      {/* ── korte vragen ─────────────────────────────────────────────── */}
      <section className="ld-blok ld-kolom" aria-labelledby="h-faq">
        <h2 id="h-faq" className="ld-kop"><T t={{ nl: "Wat mensen eerst vragen", en: "What people ask first" }} /></h2>
        <div className="ld-faq">
          {VRAAG_EN_ANTWOORD.map((q, i) => (
            <details key={i}>
              <summary><T t={q.v} /></summary>
              <p className="m-0"><T t={q.a} /></p>
            </details>
          ))}
        </div>
        <Link href="/faq" className="lnk ld-meer"><T t={{ nl: "Alle vragen →", en: "All questions →" }} /></Link>
      </section>

      {/* ── slot: één vraag, drie manieren ───────────────────────────── */}
      <section className="ld-slot" aria-labelledby="h-slot">
        <div className="ld-kolom">
          <h2 id="h-slot" className="ld-slot-kop">
            <T t={{ nl: "Stuur een foto. Dan plannen we jouw tuin voor het voorjaar.", en: "Send a photo. Then we plan your garden for spring." }} />
          </h2>
          <p className="ld-tekst m-0"><T t={{ nl: "Een foto en een paar zinnen is genoeg. Ik reageer meestal binnen twee werkdagen.", en: "A photo and a few sentences are enough. I usually reply within two working days." }} /></p>
          <div className="ld-knoppen">
            <a href={FOTO_STUREN} className="knop bg-oranje text-antraciet">
              <WhatsAppIcoon />
              <T t={{ nl: "WhatsApp een foto", en: "WhatsApp a photo" }} />
            </a>
            <a href={BUSINESS.phoneHref} className="knop ld-knop-licht tabular-nums">{BUSINESS.phone}</a>
            <Link href="/kennismaken" className="knop ld-knop-licht"><T t={{ nl: "Formulier", en: "Form" }} /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}

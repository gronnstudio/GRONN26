import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { Stapel } from "@/components/stapel"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { BODEMPAKKETTEN, BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN, type BorderPakket } from "@/lib/data/borderpakketten"
import { priceLabel } from "@/lib/format"
import { opslagAan } from "@/lib/beheer/stand"
import { mollieAan } from "@/lib/mollie"
import "./stapel.css"

export const metadata: Metadata = {
  title: "Borderpakketten",
  description: "Kant-en-klare borders voor zon, schaduw, vijverrand of droge grond, met plan van boven. Aangeplant in Stein en omgeving of opgestuurd.",
  alternates: { canonical: "/tuinen/borderpakketten" },
}

// Borderpakketten (eigenaar, 9 okt 2026). Eén foto per pakket (sfeerbeeld,
// met label), de prijs per maat en één knop die het pakket meegeeft aan
// Kennismaken, zodat Nick in de mail ziet welk pakket iemand zoekt.
// Plan en doorsnede zijn tekeningen op licht papier, ook in Donker.

const PRIJSKAART = [
  { naam: { nl: "Opgestuurd", en: "Shipped" }, prijs: BORDER_PRIJS.opgestuurd, vanaf: false, kort: { nl: "Zelf planten", en: "You plant" } },
  { naam: { nl: "Aangeplant", en: "Planted" }, prijs: BORDER_PRIJS.aangeplant, vanaf: false, kort: { nl: "Ik plant hem", en: "I plant it" } },
  { naam: { nl: "Op maat", en: "Custom" }, prijs: BORDER_PRIJS.opgestuurd, vanaf: true, kort: { nl: "Voor jouw plek", en: "For your spot" }, href: "#op-maat" },
]

// Stapelkaarten (eigenaar, 18 okt 2026: "maak deze stapelbaar ... zodat de 8 kleine
// tegels die dubbelop zijn weg kunnen"). Eén kaart per pakket die bij het scrollen
// blijft plakken; de volgende schuift eroverheen. Dicht toont een kaart alleen
// nummer, naam en foto ("To much text on cards, leave that for when people open
// the cards"). Open gaat zo:
// - telefoon en tablet: een tik op de kaart opent het pakket onder de stapel (:target);
// - desktop met een muis: de kaart is groter en het pakket schuift over de foto
//   zodra je eroverheen beweegt ("bij hover ofzo op desktop"). Zie stapel.css.
function Kaart({ p, nr }: { p: BorderPakket; nr: number }) {
  const id = `pakket-${p.slug}`
  return (
    <li>
      <article aria-labelledby={id} className="bp-kaart relative overflow-hidden rounded-[16px] border border-lijn bg-vlak">
        <a href={`#open-${p.slug}`} className="flex flex-col no-underline text-inherit focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-inkt lg:h-[min(640px,calc(100svh-160px))]">
          <span className="flex items-baseline gap-4 p-5 sm:p-8">
            <span className="lbl text-oranje-tekst">{String(nr).padStart(2, "0")}</span>
            <span id={id} className="syne text-[clamp(28px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={p.naam} /></span>
          </span>
          <Foto
            foto={{ src: `/borderpakketten/${p.slug}.jpg`, width: 1600, height: 1200, alt: p.alt.nl, label: "Sfeerbeeld", en: { alt: p.alt.en, label: "Mood image" } }}
            sizes="(min-width: 1024px) 1200px, 100vw"
            className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-0 lg:flex-1"
          />
        </a>
        <div className="bp-paneel absolute inset-x-0 bottom-0 top-[112px] bg-vlak px-8 pb-8">
          <Inhoud p={p} />
        </div>
      </article>
    </li>
  )
}

/** Alles wat bij een geopend pakket hoort: plek, zin, prijs, knop, plan en plantlijst. */
function Inhoud({ p }: { p: BorderPakket }) {
  // Online bestellen (21 okt 2026) zodra Mollie en de opslag aanstaan; anders de aanvraag.
  const online = mollieAan() && opslagAan()
  const m = BORDER_MATEN[0]
  const totaal = p.planten.reduce((t, x) => t + x.aantal, 0)
  return (
    <div className="grid gap-8 lg:h-full lg:grid-cols-2 lg:gap-10">
      <div className="flex min-w-0 flex-col gap-4">
        <p className="lbl m-0 leading-[1.6] text-gedempt">{p.tags.map((t, i) => <span key={t.nl}>{i > 0 && " · "}<T t={t} /></span>)}</p>
        <p className="m-0 max-w-[52ch] text-[16px] leading-[1.5] sm:text-[17px]"><T t={p.zin} /></p>
        <p className="m-0 text-[15px] tabular-nums">
          <T t={{ nl: `${m} m²: ${priceLabel(m * BORDER_PRIJS.opgestuurd)} opgestuurd · ${priceLabel(m * BORDER_PRIJS.aangeplant)} aangeplant`, en: `${m} m²: ${priceLabel(m * BORDER_PRIJS.opgestuurd)} shipped · ${priceLabel(m * BORDER_PRIJS.aangeplant)} planted` }} />
        </p>
        {online ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={`/tuinen/borderpakketten/bestellen?pakket=${p.slug}`}
              className="knop bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
            >
              <T t={{ nl: "Bestellen →", en: "Order →" }} />
            </Link>
            <Link href={`/kennismaken?pakket=${p.slug}`} className="lnk text-[15px]">
              <T t={{ nl: "Eerst een vraag?", en: "A question first?" }} />
            </Link>
          </div>
        ) : (
          <Link
            href={`/kennismaken?pakket=${p.slug}`}
            className="knop mt-2 self-start bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
          >
            <T t={{ nl: `Vraag ${p.naam.nl.toLowerCase()} aan →`, en: `Ask about the ${p.naam.en.toLowerCase()} →` }} />
          </Link>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {/* Tekening op licht papier: de lijnen zijn antraciet, ook in Donker. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG-tekening, geen foto */}
        <img src={`/borderpakketten/plan-${p.slug}.svg`} alt={`Beplantingsplan van boven, ${p.naam.nl}, 5 m²`} loading="lazy" className="block h-auto w-full rounded-[12px] bg-gebroken-wit p-2" />
        <p className="lbl m-0 text-gedempt"><T t={{ nl: `${totaal} planten per 5 m²`, en: `${totaal} plants per 5 m²` }} /></p>
        <ul className="m-0 grid list-none grid-cols-2 gap-x-6 p-0 text-[14px] leading-[1.35]">
          {p.planten.map((x, n) => (
            <li key={x.lat} style={{ "--n": n } as React.CSSProperties} className="bp-plant flex justify-between gap-2 border-b border-lijn py-2">
              <span className="min-w-0 truncate"><T t={x.naam} /></span>
              <span className="tabular-nums text-gedempt">{x.aantal}×</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Het geopende pakket onder de stapel, voor telefoon en tablet (en een klik op desktop). */
function Open({ p }: { p: BorderPakket }) {
  const id = `open-${p.slug}-kop`
  return (
    <section id={`open-${p.slug}`} aria-labelledby={id} className="hidden scroll-mt-[24px] border-t border-lijn pt-[clamp(40px,5vw,72px)] target:block">
      <p className="lbl m-0 flex justify-end">
        <a href="#pakketten" className="lnk text-gedempt"><T t={{ nl: "← Alle pakketten", en: "← All packages" }} /></a>
      </p>
      <h3 id={id} className="syne mt-2 mb-6 text-[clamp(30px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={p.naam} /></h3>
      <Inhoud p={p} />
    </section>
  )
}

export default function BorderpakkettenPagina() {
  return (
    <>
      <Opening
        label={{ nl: "Tuinen · borderpakketten", en: "Gardens · border packages" }}
        titel={{ nl: "Border-\npakketten", en: "Border\npackages" }}
        zin={
          <T
            t={{
              nl: "Een kant-en-klare border voor jouw plek: kies op zon en grond, kies de maat. Ik plant hem aan, of stuur de planten met het plan naar je op.",
              en: "A ready-made border for your spot: choose by sun and soil, choose the size. I plant it, or send the plants with the plan to you.",
            }}
          />
        }
      />

      <div className="wrap mt-[clamp(64px,8vw,120px)]">
        {/* Prijskaart (eigenaar, 18 okt 2026): drie vakken naast elkaar, ook op de telefoon. */}
        <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:gap-4">
          {PRIJSKAART.map((k) => {
            const binnen = (
              <>
                <span className="lbl block text-[10px] text-gedempt sm:text-[11px]"><T t={k.naam} /></span>
                <span className="mt-3 block text-[13px] text-gedempt">{k.vanaf ? <T t={{ nl: "vanaf", en: "from" }} /> : "\u00a0"}</span>
                <span className="syne block text-[clamp(24px,6vw,44px)] leading-none tracking-[-.02em] tabular-nums">{priceLabel(k.prijs)}</span>
                <span className="mt-1 block text-[13px] text-gedempt"><T t={{ nl: "per m²", en: "per m²" }} /></span>
                <span className="mt-3 block text-[13px] leading-[1.35] sm:text-[15px]"><T t={k.kort} /></span>
              </>
            )
            const vak = "flex h-full flex-col rounded-[16px] bg-vlak p-3 sm:p-6"
            return (
              <li key={k.naam.nl}>
                {k.href ? (
                  <a href={k.href} className={`${vak} no-underline text-inherit focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt`}>{binnen}</a>
                ) : (
                  <div className={vak}>{binnen}</div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-4 mb-0 max-w-[70ch] text-[14px] leading-[1.55] text-gedempt">
          <T
            t={{
              nl: "Opgestuurd: de planten in P9-pot met het plan van boven, thuisbezorgd in Nederland en België. Aangeplant: ik maak de grond los, plant volgens plan en leg er compost over, in Stein en omgeving. Alle prijzen inclusief btw; de foto’s zijn sfeerbeelden.",
              en: "Shipped: the plants in 9 cm pots with the planting plan, delivered in the Netherlands and Belgium. Planted: I loosen the soil, plant to the plan and add compost, in and around Stein. All prices include VAT; the photos are mood images.",
            }}
          />
        </p>

        <h2 id="pakketten" className="lbl mt-[clamp(56px,7vw,96px)] mb-5 scroll-mt-[24px] text-gedempt md:scroll-mt-[112px]"><T t={{ nl: `${BORDERPAKKETTEN.length} pakketten`, en: `${BORDERPAKKETTEN.length} packages` }} /></h2>
        <Stapel className="flex flex-col gap-6 [--stapel-top:16px] md:[--stapel-top:24px]">
          {BORDERPAKKETTEN.map((p, i) => (
            <Kaart key={p.slug} p={p} nr={i + 1} />
          ))}
        </Stapel>

        <div className="mt-[clamp(48px,6vw,96px)]">
          {BORDERPAKKETTEN.map((p) => (
            <Open key={p.slug} p={p} />
          ))}
        </div>

        {/* Compost en schors (eigenaar, 18 okt 2026: "maak ook nog een custom pakket met compost
            en houtschors in twee varianten, dennenschors en franse schors"). Prijs volgt van Nick. */}
        <section id="bodem" aria-labelledby="bodem-kop" className="mt-[clamp(72px,9vw,140px)] scroll-mt-[96px]">
          <p className="lbl m-0 text-gedempt"><T t={{ nl: "Bodempakket", en: "Soil package" }} /></p>
          <h2 id="bodem-kop" className="syne mt-4 mb-0 text-[clamp(30px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={{ nl: "Compost en schors", en: "Compost and bark" }} /></h2>
          <p className="mt-5 mb-0 max-w-[60ch] text-[17px] leading-[1.55]">
            <T t={{ nl: "Een laag compost voedt de bodem, een laag schors erover houdt vocht vast en onkruid weg. Bij een nieuwe border of los, voor een border die je al hebt.", en: "A layer of compost feeds the soil, a layer of bark on top keeps moisture in and weeds out. With a new border, or on its own for a border you already have." }} />
          </p>
          <ul className="mt-8 mb-0 grid list-none gap-4 p-0 sm:grid-cols-2 sm:gap-6">
            {BODEMPAKKETTEN.map((b) => (
              <li key={b.slug} className="flex flex-col gap-4 rounded-[16px] bg-vlak p-6 sm:p-8">
                <Foto
                  foto={{ src: `/borderpakketten/${b.slug}.jpg`, width: 1600, height: 1200, alt: b.alt.nl, label: "Sfeerbeeld", en: { alt: b.alt.en, label: "Mood image" } }}
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="aspect-[4/3]"
                />
                <h3 className="syne m-0 text-[clamp(22px,2.4vw,30px)] leading-[1.1] tracking-[-.015em]"><T t={b.naam} /></h3>
                <p className="m-0 text-[16px] leading-[1.5]"><T t={b.zin} /></p>
                <p className="m-0 text-[15px] text-gedempt"><T t={{ nl: "Prijs op aanvraag", en: "Price on request" }} /></p>
                <Link
                  href={`/kennismaken?pakket=${b.slug}`}
                  className="knop mt-auto self-start bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
                >
                  <T t={{ nl: "Vraag aan →", en: "Ask about it →" }} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Cadeaubon (eigenaar, 21 okt 2026): ook in de shop. */}
        <section aria-labelledby="cadeau-kop" className="mt-[clamp(72px,9vw,140px)] flex flex-col gap-6 rounded-[16px] bg-oranje p-[clamp(24px,4vw,56px)] text-antraciet sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="lbl m-0"><T t={{ nl: "Cadeaubon", en: "Gift card" }} /></p>
            <h2 id="cadeau-kop" className="syne mt-4 mb-0 text-[clamp(30px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={{ nl: "Geef een tuin cadeau", en: "Give a garden" }} /></h2>
            <p className="mt-4 mb-0 max-w-[52ch] text-[17px] leading-[1.55]"><T t={{ nl: "Vanaf € 50, voor een vijverbeurt, een border of een voorjaarsbeurt. Met een eigen bonnummer, direct klaar om te printen.", en: "From € 50, for a pond service, a border or a spring tidy-up. With its own number, ready to print right away." }} /></p>
          </div>
          <Link href="/tuinen/cadeaubon" className="knop shrink-0 self-start bg-antraciet text-gebroken-wit focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-antraciet sm:self-auto">
            <T t={{ nl: "Cadeaubon kopen →", en: "Buy a gift card →" }} />
          </Link>
        </section>

        <section id="op-maat" aria-labelledby="op-maat-kop" className="mt-[clamp(72px,9vw,140px)] scroll-mt-[96px] rounded-[16px] bg-vlak p-[clamp(24px,4vw,56px)]">
          <p className="lbl m-0 text-gedempt"><T t={{ nl: "Op maat", en: "Made to measure" }} /></p>
          <h2 id="op-maat-kop" className="syne mt-4 mb-0 text-[clamp(30px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={{ nl: "Border op maat", en: "A border made to measure" }} /></h2>
          <p className="mt-5 mb-0 max-w-[60ch] text-[17px] leading-[1.55]">
            <T
              t={{
                nl: "Een lange smalle strook, een hoek met wortels van de buurboom, of alleen blauw? Ik kom kijken, meet op en stel een border samen die op die plek past. Je krijgt het plan op papier, en ik plant hem aan of stuur hem op.",
                en: "A long narrow strip, a corner full of the neighbour’s tree roots, or only blue? I come and look, measure up and put together a border that suits that spot. You get the plan on paper, and I plant it or ship it.",
              }}
            />
          </p>
          <Link
            href="/kennismaken?pakket=op-maat"
            className="knop mt-8 inline-flex bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
          >
            <T t={{ nl: "Vraag een border op maat aan →", en: "Ask for a made-to-measure border →" }} />
          </Link>
        </section>
      </div>

      <Verder
        voor={{ nl: "Liever", en: "Rather" }}
        nadruk={{ nl: "een hele tuin", en: "a whole garden" }}
        na="?"
        href="/tuinen"
        label={{ nl: "Naar Tuinen", en: "To Gardens" }}
      />
    </>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN, type BorderPakket } from "@/lib/data/borderpakketten"
import { priceLabel } from "@/lib/format"

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

/** Een zacht afbreekstreepje vóór "border" ("Schaduw-border"): een smalle tegel breekt daar, niet midden in een woord. */
const afbreek = (naam: string) => naam.replace(/(\p{L})border/u, "$1\u00adborder")

function Prijzen({ p }: { p: BorderPakket }) {
  return (
    <table className="w-full border-collapse text-[15px] tabular-nums">
      <caption className="sr-only">
        <T t={{ nl: `Prijzen ${p.naam.nl}`, en: `Prices ${p.naam.en}` }} />
      </caption>
      <thead>
        <tr className="border-b border-inkt">
          <th scope="col" className="lbl py-2 text-left font-semibold text-gedempt"><T t={{ nl: "Maat", en: "Size" }} /></th>
          <th scope="col" className="lbl py-2 text-right font-semibold text-gedempt"><T t={{ nl: "Opgestuurd", en: "Shipped" }} /></th>
          <th scope="col" className="lbl py-2 text-right font-semibold text-gedempt"><T t={{ nl: "Aangeplant", en: "Planted" }} /></th>
        </tr>
      </thead>
      <tbody>
        {BORDER_MATEN.map((m) => (
          <tr key={m} className="border-b border-lijn">
            <th scope="row" className="py-3 text-left font-medium">{m} m²</th>
            <td className="py-3 text-right">{priceLabel(m * BORDER_PRIJS.opgestuurd)}</td>
            <td className="syne py-3 text-right text-[18px]">{priceLabel(m * BORDER_PRIJS.aangeplant)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Pakket({ p, nr }: { p: BorderPakket; nr: number }) {
  const id = `pakket-${p.slug}`
  const totaal = p.planten.reduce((t, x) => t + x.aantal, 0)
  return (
    <section id={p.slug} aria-labelledby={id} className="hidden scroll-mt-[96px] border-t border-lijn pt-[clamp(40px,5vw,72px)] target:block">
      <div className="grid gap-x-8 gap-y-8 md:grid-cols-12">
        <div className="md:col-span-6">
          <Foto
            foto={{ src: `/borderpakketten/${p.slug}.jpg`, width: 1600, height: 1200, alt: p.alt.nl, label: "Sfeerbeeld", en: { alt: p.alt.en, label: "Mood image" } }}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[4/3] rounded-[16px]"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-5 md:col-span-5 md:col-start-8">
          <p className="lbl m-0 flex justify-between gap-4 text-gedempt">
            <span><T t={{ nl: "Pakket", en: "Package" }} /> {String(nr).padStart(2, "0")}</span>
            <a href="#pakketten" className="lnk"><T t={{ nl: "← Alle pakketten", en: "← All packages" }} /></a>
          </p>
          <h2 id={id} className="syne m-0 text-[clamp(30px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"><T t={p.naam} /></h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {p.tags.map((t) => (
              <li key={t.nl} className="lbl rounded-full border border-lijn px-3 py-1.5"><T t={t} /></li>
            ))}
          </ul>
          <p className="m-0 max-w-[52ch] text-[17px] leading-[1.55]"><T t={p.zin} /></p>
          <Prijzen p={p} />
          <Link
            href={`/kennismaken?pakket=${p.slug}`}
            aria-describedby={id}
            className="knop self-start bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
          >
            <T t={{ nl: "Vraag dit pakket aan →", en: "Ask about this package →" }} />
          </Link>
        </div>
      </div>

      <details className="group mt-8">
        <summary className="lbl cursor-pointer py-2 text-gedempt marker:content-none">
          <span className="group-open:hidden"><T t={{ nl: `+ Plan en plantlijst · ${totaal} planten per 5 m²`, en: `+ Plan and plant list · ${totaal} plants per 5 m²` }} /></span>
          <span className="hidden group-open:inline"><T t={{ nl: "− Plan en plantlijst", en: "− Plan and plant list" }} /></span>
        </summary>
        <div className="mt-4 grid gap-8 md:grid-cols-12">
          <ul className="m-0 list-none p-0 text-[15px] md:col-span-4">
            {p.planten.map((x) => (
              <li key={x.lat} className="flex justify-between gap-4 border-b border-lijn py-2.5">
                <span>
                  <T t={x.naam} /> <i className="text-gedempt">{x.lat}</i>
                </span>
                <span className="tabular-nums">{x.aantal}×</span>
              </li>
            ))}
          </ul>
          <div className="flex min-w-0 flex-col gap-4 md:col-span-8">
            {/* Tekeningen op licht papier: de lijnen zijn antraciet, ook in Donker. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG-tekening, geen foto */}
            <img src={`/borderpakketten/plan-${p.slug}.svg`} alt={`Beplantingsplan van boven, ${p.naam.nl}, 5 m²`} loading="lazy" className="block h-auto w-full rounded-[16px] bg-gebroken-wit p-3" />
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG-tekening, geen foto */}
            <img src={`/borderpakketten/doorsnede-${p.slug}.svg`} alt={`Doorsnede van de ${p.naam.nl.toLowerCase()}: hoe hoog elke plant wordt`} loading="lazy" className="block h-auto w-full rounded-[16px] bg-gebroken-wit p-3" />
          </div>
        </div>
      </details>
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

        {/* Tegels (eigenaar, 18 okt 2026): twee naast elkaar op de telefoon, elk naar zijn uitleg verderop. */}
        <h2 id="pakketten" className="lbl mt-[clamp(56px,7vw,96px)] mb-5 scroll-mt-[96px] text-gedempt"><T t={{ nl: `${BORDERPAKKETTEN.length} pakketten`, en: `${BORDERPAKKETTEN.length} packages` }} /></h2>
        {/* Kaartstijl (eigenaar, 18 okt 2026: "beter verdeeld, meer negatieve ruimte"): tekst bovenin met ruime marge, foto tot de rand onderaan. */}
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
          {BORDERPAKKETTEN.map((p, i) => (
            // Alleen naam en foto (eigenaar, 18 okt 2026: "anders is het dubbelop"); de rest staat in het pakket zelf, na een tik.
            // Subgrid: de namen en foto's van één rij staan op dezelfde lijn, ook als een naam op twee regels breekt.
            <li key={p.slug} className="row-span-2 grid grid-rows-subgrid gap-0">
              <a href={`#${p.slug}`} className="row-span-2 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[16px] bg-vlak no-underline text-inherit focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">
                <span className="syne block px-4 pt-4 pb-4 text-[clamp(17px,2.2vw,26px)] leading-[1.1] tracking-[-.015em] sm:px-6 sm:pt-6 sm:pb-6"><T t={{ nl: afbreek(p.naam.nl), en: afbreek(p.naam.en) }} /></span>
                <Foto
                  foto={{ src: `/borderpakketten/${p.slug}.jpg`, width: 1600, height: 1200, alt: "", label: "Sfeerbeeld", en: { alt: "", label: "Mood image" } }}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="aspect-[4/3]"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(64px,8vw,120px)]">
          {BORDERPAKKETTEN.map((p, i) => (
            <Pakket key={p.slug} p={p} nr={i + 1} />
          ))}
        </div>

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

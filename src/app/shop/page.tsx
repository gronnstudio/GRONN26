import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Voorkant } from "@/components/cadeaubon/kaart"
import { BODEMPAKKETTEN, BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { BON_BEDRAGEN } from "@/lib/data/cadeaubon"
import { priceLabel } from "@/lib/format"
import { opslagAan } from "@/lib/beheer/stand"
import { mollieAan } from "@/lib/mollie"
import "./shop.css"

export const metadata: Metadata = {
  title: "Shop",
  description: "Borderpakketten, bodempakketten en cadeaubonnen van GRØNN Studio. Opgestuurd in Nederland en België, of aangeplant in Stein en omgeving.",
  alternates: { canonical: "/shop" },
}

// De shop (eigenaar, 21 okt 2026: "de webshop heeft nu meer dan borderpakketten
// alleen, maak een deftige shop die bij de stijl van gronn past"). Eén overzicht
// van alles wat te koop is; elk product houdt zijn eigen pagina en bestelroute.

const knop = "knop bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
const kop = "syne m-0 text-[clamp(30px,3.4vw,48px)] leading-[1.05] tracking-[-.025em]"

const SECTIES = [
  { id: "borders", naam: { nl: "Borderpakketten", en: "Border packages" }, aantal: BORDERPAKKETTEN.length },
  { id: "bodem", naam: { nl: "Bodem", en: "Soil" }, aantal: BODEMPAKKETTEN.length },
  { id: "cadeau", naam: { nl: "Cadeaubon", en: "Gift card" }, aantal: 1 },
]

export default function Shop() {
  const online = mollieAan() && opslagAan()
  const vanaf = BORDER_MATEN[0] * BORDER_PRIJS.opgestuurd
  return (
    <>
      <Opening
        label={{ nl: "GRØNN · shop", en: "GRØNN · shop" }}
        titel={{ nl: "Shop", en: "Shop" }}
        zin={<T t={{ nl: "Planten, bodem en cadeaus, uitgezocht zoals ik het in mijn eigen tuinen doe. Opgestuurd in Nederland en België, of door mij aangeplant in Stein en omgeving.", en: "Plants, soil and gifts, chosen the way I do in my own gardens. Shipped in the Netherlands and Belgium, or planted by me in and around Stein." }} />}
      />

      <div className="wrap mt-[clamp(56px,7vw,104px)]">
        <nav aria-label="Shop" className="flex flex-wrap gap-2">
          {SECTIES.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="inline-flex min-h-[var(--knop-klein)] items-center gap-2 rounded-full border border-gedempt px-4 text-[14px] no-underline text-inkt hover:border-inkt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt">
              <T t={s.naam} /> <span className="tabular-nums text-gedempt">{s.aantal}</span>
            </a>
          ))}
        </nav>

        {/* Borderpakketten: het hart van de shop. */}
        <section id="borders" aria-labelledby="borders-kop" className="mt-[clamp(48px,6vw,88px)] scroll-mt-[96px]">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h2 id="borders-kop" className={kop}><T t={{ nl: "Borderpakketten", en: "Border packages" }} /></h2>
            <p className="m-0 text-[15px] text-gedempt"><T t={{ nl: `Per ${BORDER_MATEN.join(", ").replace(/, (\d+)$/, " of $1")} m² · opgestuurd of aangeplant`, en: `Per ${BORDER_MATEN.join(", ").replace(/, (\d+)$/, " or $1")} m² · shipped or planted` }} /></p>
          </div>
          <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-x-3 gap-y-10 p-0 sm:gap-x-5 lg:grid-cols-4">
            {BORDERPAKKETTEN.map((p) => (
              <li key={p.slug} className="shop-product flex flex-col">
                <Link href={`/tuinen/borderpakketten#open-${p.slug}`} className="group flex flex-col no-underline text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-inkt rounded-[16px]">
                  <Foto
                    foto={{ src: `/borderpakketten/${p.slug}.jpg`, width: 1600, height: 1200, alt: p.alt.nl, label: "Sfeerbeeld", en: { alt: p.alt.en, label: "Mood image" } }}
                    sizes="(min-width: 1024px) 300px, 50vw"
                    className="shop-foto aspect-[4/5] rounded-[16px]"
                  />
                  <span className="syne mt-3 text-[18px] leading-[1.15] tracking-[-.015em] sm:mt-4 sm:text-[22px]"><T t={p.naam} /></span>
                  <span className="mt-1 text-[13px] leading-[1.4] text-gedempt sm:text-[14px]"><T t={p.tags[0]} /><span className="max-sm:hidden"> · <T t={p.tags[1]} /></span></span>
                </Link>
                <div className="mt-auto flex flex-col items-start gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="text-[15px] tabular-nums"><T t={{ nl: "vanaf ", en: "from " }} /><b className="font-semibold">{priceLabel(vanaf)}</b></span>
                  <Link href={online ? `/tuinen/borderpakketten/bestellen?pakket=${p.slug}` : `/kennismaken?pakket=${p.slug}`} className="knop-klein bg-inkt text-grond focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt">
                    <T t={online ? { nl: "Bestellen", en: "Order" } : { nl: "Aanvragen", en: "Ask" }} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Bodem en maatwerk: prijs op aanvraag, dus via Kennismaken. */}
        <section id="bodem" aria-labelledby="bodem-kop" className="mt-[clamp(72px,9vw,140px)] scroll-mt-[96px]">
          <h2 id="bodem-kop" className={kop}><T t={{ nl: "Bodem en maatwerk", en: "Soil and custom" }} /></h2>
          <ul className="m-0 mt-8 grid list-none gap-5 p-0 md:grid-cols-3">
            {BODEMPAKKETTEN.map((b) => (
              <li key={b.slug} className="flex flex-col gap-4 rounded-[16px] bg-vlak p-6 sm:p-8">
                <p className="lbl m-0 text-gedempt"><T t={{ nl: "Bodempakket", en: "Soil package" }} /></p>
                <h3 className="syne m-0 text-[24px] leading-[1.1] tracking-[-.015em]"><T t={b.naam} /></h3>
                <p className="m-0 text-[15px] leading-[1.5]"><T t={b.zin} /></p>
                <Link href={`/kennismaken?pakket=${b.slug}`} className="lnk mt-auto self-start text-[15px]"><T t={{ nl: "Prijs op aanvraag →", en: "Price on request →" }} /></Link>
              </li>
            ))}
            <li className="flex flex-col gap-4 rounded-[16px] border border-lijn p-6 sm:p-8">
              <p className="lbl m-0 text-gedempt"><T t={{ nl: "Op maat", en: "Custom" }} /></p>
              <h3 className="syne m-0 text-[24px] leading-[1.1] tracking-[-.015em]"><T t={{ nl: "Border op maat", en: "A border made to measure" }} /></h3>
              <p className="m-0 text-[15px] leading-[1.5]"><T t={{ nl: "Een lastige hoek of een eigen kleurenschema? Ik kom kijken en stel een border samen voor precies die plek.", en: "An awkward corner or your own colour scheme? I come and look and put together a border for exactly that spot." }} /></p>
              <Link href="/kennismaken?pakket=op-maat" className="lnk mt-auto self-start text-[15px]"><T t={{ nl: `Vanaf ${priceLabel(BORDER_PRIJS.opgestuurd)} per m² →`, en: `From ${priceLabel(BORDER_PRIJS.opgestuurd)} per m² →` }} /></Link>
            </li>
          </ul>
        </section>

        {/* Cadeaubon: donker vlak met de kaart zelf, schuin, zoals hij in het doosje ligt. */}
        <section id="cadeau" aria-labelledby="cadeau-kop" className="mt-[clamp(72px,9vw,140px)] grid scroll-mt-[96px] items-center gap-10 overflow-hidden rounded-[16px] border border-transparent bg-bos p-[clamp(24px,5vw,72px)] text-[#f0e9dc] dark:border-lijn lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="lbl m-0 opacity-75"><T t={{ nl: "Cadeaubon", en: "Gift card" }} /></p>
            <h2 id="cadeau-kop" className={`${kop} mt-4`}><T t={{ nl: "Geef een tuin cadeau", en: "Give a garden" }} /></h2>
            <p className="mt-5 mb-0 max-w-[46ch] text-[17px] leading-[1.55] opacity-90">
              <T t={{ nl: `Vanaf ${priceLabel(BON_BEDRAGEN[0])} of een eigen bedrag, voor een vijverbeurt, een border of een voorjaarsbeurt. Digitaal met eigen bonnummer, of als kaart in een luxe doosje per post.`, en: `From ${priceLabel(BON_BEDRAGEN[0])} or an amount of your choice, for a pond service, a border or a spring tidy-up. Digital with its own number, or as a card in a gift box by post.` }} />
            </p>
            <Link href="/tuinen/cadeaubon" className={`${knop} mt-8 inline-flex`}><T t={{ nl: "Cadeaubon samenstellen →", en: "Make a gift card →" }} /></Link>
          </div>
          <div className="shop-bon mx-auto w-full max-w-[460px]" aria-hidden="true">
            <div className="relative aspect-[1.6] [container-type:inline-size]">
              <Voorkant bedrag={BON_BEDRAGEN[1]} voor="jou" />
            </div>
          </div>
        </section>

        <ul className="m-0 mt-[clamp(56px,7vw,96px)] grid list-none grid-cols-2 gap-x-6 gap-y-5 border-t border-lijn p-0 pt-8 text-[14px] leading-[1.45] lg:grid-cols-4">
          {[
            { k: { nl: "Betalen", en: "Payment" }, v: { nl: "iDEAL, Wero, Visa of Mastercard via Mollie", en: "iDEAL, Wero, Visa or Mastercard via Mollie" } },
            { k: { nl: "Opgestuurd", en: "Shipped" }, v: { nl: "Thuisbezorgd in Nederland en België", en: "Delivered in the Netherlands and Belgium" } },
            { k: { nl: "Aangeplant", en: "Planted" }, v: { nl: "Door mij, in Stein en omgeving", en: "By me, in and around Stein" } },
            { k: { nl: "Vragen", en: "Questions" }, v: { nl: "App 06 18 11 80 14", en: "WhatsApp +31 6 18 11 80 14" } },
          ].map((r) => (
            <li key={r.k.nl}>
              <span className="lbl block text-gedempt"><T t={r.k} /></span>
              <span className="mt-1 block"><T t={r.v} /></span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

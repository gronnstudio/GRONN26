import type { Metadata } from "next"
import Link from "next/link"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { Voorkant } from "@/components/cadeaubon/kaart"
import { BODEMPAKKETTEN, BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { BON_BEDRAGEN } from "@/lib/data/cadeaubon"
import { priceLabel } from "@/lib/format"
import { opslagAan } from "@/lib/beheer/stand"
import { mollieAan } from "@/lib/mollie"
import { Producten, type Product } from "./producten"
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

export default function Shop() {
  const online = mollieAan() && opslagAan()
  const vanaf = priceLabel(BORDER_MATEN[0] * BORDER_PRIJS.opgestuurd)
  const producten: Product[] = [
    ...BORDERPAKKETTEN.map((p): Product => ({
      id: p.slug,
      soort: "border",
      naam: p.naam,
      sub: { nl: `${p.tags[0].nl} · ${p.tags[1].nl}`, en: `${p.tags[0].en} · ${p.tags[1].en}` },
      foto: { src: `/borderpakketten/${p.slug}.jpg`, alt: p.alt },
      prijs: { nl: `vanaf ${vanaf}`, en: `from ${vanaf}` },
      href: `/tuinen/borderpakketten#open-${p.slug}`,
      knop: online
        ? { href: `/tuinen/borderpakketten/bestellen?pakket=${p.slug}`, label: { nl: "Bestellen", en: "Order" } }
        : { href: `/kennismaken?pakket=${p.slug}`, label: { nl: "Aanvragen", en: "Ask" } },
    })),
    ...BODEMPAKKETTEN.map((b): Product => ({
      id: b.slug,
      soort: "bodem",
      naam: b.naam,
      sub: { nl: "Bodempakket · compost met schors", en: "Soil package · compost with bark" },
      foto: { src: `/borderpakketten/${b.slug}.jpg`, alt: b.alt },
      prijs: { nl: "Prijs op aanvraag", en: "Price on request" },
      href: "/tuinen/borderpakketten#bodem",
      knop: { href: `/kennismaken?pakket=${b.slug}`, label: { nl: "Aanvragen", en: "Ask" } },
    })),
    {
      id: "op-maat",
      soort: "bodem",
      naam: { nl: "Border op maat", en: "A border made to measure" },
      sub: { nl: "Ik kom kijken en stel hem samen", en: "I come and look and put it together" },
      prijs: { nl: `vanaf ${priceLabel(BORDER_PRIJS.opgestuurd)}/m²`, en: `from ${priceLabel(BORDER_PRIJS.opgestuurd)}/m²` },
      href: "/tuinen/borderpakketten#op-maat",
      knop: { href: "/kennismaken?pakket=op-maat", label: { nl: "Aanvragen", en: "Ask" } },
    },
  ]
  return (
    <>
      <Opening
        label={{ nl: "GRØNN · shop", en: "GRØNN · shop" }}
        titel={{ nl: "Shop", en: "Shop" }}
        zin={<T t={{ nl: "Planten, bodem en cadeaus, uitgezocht zoals ik het in mijn eigen tuinen doe. Opgestuurd in Nederland en België, of door mij aangeplant in Stein en omgeving.", en: "Plants, soil and gifts, chosen the way I do in my own gardens. Shipped in the Netherlands and Belgium, or planted by me in and around Stein." }} />}
      />

      <div className="shop-start wrap">
        {/* Producten links in twee kolommen, de cadeaubon ernaast (eigenaar, 21 okt 2026). */}
        <div className="grid gap-x-[clamp(24px,4vw,64px)] gap-y-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section id="borders" aria-label="Producten" className="scroll-mt-[96px]">
            <p className="m-0 mb-5 text-[15px] text-gedempt"><T t={{ nl: `Borders per ${BORDER_MATEN.join(", ").replace(/, (\d+)$/, " of $1")} m² · opgestuurd of aangeplant`, en: `Borders per ${BORDER_MATEN.join(", ").replace(/, (\d+)$/, " or $1")} m² · shipped or planted` }} /></p>
            <Producten producten={producten} />
          </section>

          {/* Cadeaubon: donker vlak met de kaart zelf, schuin, zoals hij in het doosje ligt. */}
          <aside id="cadeau" aria-labelledby="cadeau-kop" className="scroll-mt-[96px] lg:pt-[52px]">
            <div className="flex flex-col gap-6 overflow-hidden rounded-[16px] border border-transparent bg-bos p-[clamp(24px,3vw,36px)] text-[#f0e9dc] dark:border-lijn lg:sticky lg:top-[96px]">
              <div className="shop-bon mx-auto w-full max-w-[360px] py-4" aria-hidden="true">
                <div className="relative aspect-[1.6] [container-type:inline-size]">
                  <Voorkant bedrag={BON_BEDRAGEN[1]} voor="jou" />
                </div>
              </div>
              <div>
                <p className="lbl m-0 opacity-75"><T t={{ nl: "Cadeaubon", en: "Gift card" }} /></p>
                <h2 id="cadeau-kop" className="syne mt-3 mb-0 text-[clamp(26px,2.4vw,34px)] leading-[1.05] tracking-[-.025em]"><T t={{ nl: "Geef een tuin cadeau", en: "Give a garden" }} /></h2>
                <p className="mt-4 mb-0 text-[16px] leading-[1.55] opacity-90">
                  <T t={{ nl: `Vanaf ${priceLabel(BON_BEDRAGEN[0])} of een eigen bedrag. Digitaal met eigen bonnummer, of als kaart in een luxe doosje per post.`, en: `From ${priceLabel(BON_BEDRAGEN[0])} or an amount of your choice. Digital with its own number, or as a card in a gift box by post.` }} />
                </p>
              </div>
              <Link href="/tuinen/cadeaubon" className={`${knop} self-start`}><T t={{ nl: "Cadeaubon samenstellen →", en: "Make a gift card →" }} /></Link>
            </div>
          </aside>
        </div>

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

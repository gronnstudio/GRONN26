import type { Metadata } from "next"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T, type Tekst } from "@/components/taal"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Projectbeelden, Projecttabel } from "@/components/architect/projectindex"
import { F01, F08_2 } from "@/components/voorpagina/beelden"
import { BUSINESS } from "@/lib/business"
import { studioSchema } from "@/lib/schema"

// De voorpagina als bij een architectenbureau (24 okt 2026): één groot beeld
// met onderschrift, de positionering in één alinea, het werk als beelden en
// index, de drie diensten en contact. Geen beweging, veel lucht, kleine tekst.
export const metadata: Metadata = {
  title: { absolute: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
}

const DIENSTEN: { href: string; naam: Tekst; zin: Tekst }[] = [
  {
    href: "/vijvers",
    naam: { nl: "Vijvers", en: "Ponds" },
    zin: { nl: "Diagnose, renovatie, aanleg en onderhoud. Water dat schoon blijft en bij de tuin hoort.", en: "Diagnosis, renovation, build and care. Water that stays clear and belongs to the garden." },
  },
  {
    href: "/tuinen",
    naam: { nl: "Tuinen", en: "Gardens" },
    zin: { nl: "Ontwerp, aanleg, beplanting en onderhoud van natuurlijke tuinen die met de seizoenen meegroeien.", en: "Design, build, planting and care of natural gardens that grow with the seasons." },
  },
  {
    href: "/tuinen/borderpakketten",
    naam: { nl: "Borderpakketten", en: "Border packages" },
    zin: { nl: "Acht complete borders met plantlijst en plan, in 5, 10 of 15 m², of een op maat.", en: "Eight complete borders with plant list and plan, in 5, 10 or 15 m², or a custom one." },
  },
]

const Kop = ({ nr, t }: { nr: string; t: Tekst }) => (
  <div className="mb-8 flex items-baseline justify-between gap-4 text-[14px]">
    <h2 className="m-0 text-[14px] font-normal"><T t={t} /></h2>
    <span className="text-muted-foreground tabular-nums">{nr}</span>
  </div>
)

export default function Voorpagina() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema()).replace(/</g, "\\u003c") }} />

      <section className="wrap pt-[clamp(24px,3vw,40px)]" aria-labelledby="kop">
        <figure className="m-0">
          <Foto foto={F01} priority sizes="(min-width: 1440px) 1328px, 100vw" className="aspect-[4/5] sm:aspect-[16/9]" />
          <figcaption className="mt-3 flex justify-between gap-4 text-[13px] text-muted-foreground">
            <span><T t={{ nl: "Vijverrenovatie, twee vijvers met waterval en beekloop", en: "Pond renovation, two ponds with waterfall and stream" }} /></span>
            <span className="shrink-0 whitespace-nowrap tabular-nums">GR / 001</span>
          </figcaption>
        </figure>

        <div className="mt-[clamp(64px,9vw,140px)] grid gap-10 lg:grid-cols-12">
          <p className="m-0 text-[13px] text-muted-foreground lg:col-span-3">
            <T t={{ nl: "Vijvers en tuinen · Stein en omgeving", en: "Ponds and gardens · Stein and surrounding area" }} />
          </p>
          <div className="lg:col-span-9">
            <h1 id="kop" className="m-0 max-w-[24ch] text-[clamp(28px,3.6vw,52px)] leading-[1.15] font-light tracking-[-.02em]">
              <T t={{ nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.", en: "I build and maintain ponds and natural gardens for homeowners in Stein and the surrounding area, with a fixed price up front." }} />
            </h1>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button asChild className="h-[var(--knop)] bg-oranje px-[var(--knop-binnen)] text-[14px] text-antraciet hover:bg-oranje/90">
                <Link href="/kennismaken"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></Link>
              </Button>
              <Link href="/over" className="flex min-h-[var(--raak)] items-center text-[14px] underline underline-offset-4">
                <T t={{ nl: "Over Nick", en: "About Nick" }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap mt-[clamp(96px,12vw,180px)]" aria-label="Werk">
        <Kop nr="01" t={{ nl: "Werk", en: "Work" }} />
        <Projectbeelden />
        <div className="mt-16">
          <Projecttabel />
        </div>
      </section>

      <section className="wrap mt-[clamp(96px,12vw,180px)]" aria-label="Diensten">
        <Kop nr="02" t={{ nl: "Diensten", en: "Services" }} />
        <Separator />
        <ul className="m-0 grid list-none p-0 md:grid-cols-3">
          {DIENSTEN.map((d) => (
            <li key={d.href} className="border-b border-border py-8 md:border-b-0 md:pr-10">
              <Link href={d.href} className="group block no-underline">
                <h3 className="m-0 text-[clamp(24px,2.4vw,32px)] font-light tracking-[-.01em] group-hover:underline group-hover:underline-offset-[6px]"><T t={d.naam} /></h3>
                <p className="mt-4 mb-0 max-w-[36ch] text-[15px] leading-[1.6] text-muted-foreground"><T t={d.zin} /></p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap mt-[clamp(96px,12vw,180px)]" aria-label="Studio">
        <Kop nr="03" t="Studio" />
        <div className="grid gap-10 md:grid-cols-12">
          <Foto foto={F08_2} sizes="(min-width: 768px) 40vw, 100vw" className="aspect-[4/5] md:col-span-5" />
          <div className="md:col-span-6 md:col-start-7 md:self-end">
            <p className="m-0 text-[clamp(20px,1.8vw,26px)] leading-[1.45] font-light">
              <T t={{ nl: "Ik ben Nick Peters, hovenier en ecologisch ontwerper. Ik werk zelf, van het eerste gesprek tot de laatste plant, en kijk eerst hoe water, bodem en licht op jouw plek samenwerken.", en: "I’m Nick Peters, gardener and ecological designer. I do the work myself, from the first conversation to the last plant, and first look at how water, soil and light work together in your place." }} />
            </p>
            <Link href="/over" className="mt-8 flex min-h-[var(--raak)] w-fit items-center text-[14px] underline underline-offset-4">
              <T t={{ nl: "Meer over de studio", en: "More about the studio" }} />
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap mt-[clamp(96px,12vw,180px)]" aria-label="Contact">
        <Kop nr="04" t="Contact" />
        <Separator />
        <div className="grid gap-10 pt-10 md:grid-cols-12">
          <p className="m-0 text-[clamp(28px,3.6vw,52px)] leading-[1.15] font-light tracking-[-.02em] md:col-span-7">
            <T t={{ nl: "Een vijver of tuin in gedachten? Vertel me waar je aan denkt.", en: "A pond or garden in mind? Tell me what you’re thinking of." }} />
          </p>
          <div className="text-[15px] md:col-span-4 md:col-start-9">
            <a href={BUSINESS.emailHref} className="flex min-h-[var(--raak)] items-center underline underline-offset-4">{BUSINESS.email}</a>
            <a href={BUSINESS.phoneHref} className="flex min-h-[var(--raak)] items-center tabular-nums underline underline-offset-4">{BUSINESS.phone}</a>
            <Button asChild variant="outline" className="mt-6 h-[var(--knop)] px-[var(--knop-binnen)] text-[14px]">
              <Link href="/kennismaken"><T t={{ nl: "Naar het formulier", en: "To the form" }} /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

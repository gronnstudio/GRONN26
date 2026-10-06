import type { Metadata } from "next"
import Link from "next/link"
import { DOCUMENTEN } from "@/lib/data/legal"

// Het dashboard achter de login (eigenaar, 6 okt 2026: "maak er een mooi
// dashboard van"). Alleen voor de eigenaar: src/proxy.ts laat hier niemand
// anders in. Twee dingen: offertes maken, en de kleine letters bij de hand.
export const metadata: Metadata = {
  title: { absolute: "Beheer · GRØNN Studio" },
  robots: { index: false, follow: false },
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

const MEESTUREN = [
  ["De offerte", "Uit de offertemaker, als PDF."],
  ["Algemene voorwaarden particulier", "Vóór of bij het akkoord, anders gelden ze niet."],
  ["Modelformulier herroeping", "Verplicht bij een afspraak op afstand of bij de klant thuis; zonder dit formulier loopt de bedenktijd twaalf maanden."],
  ["Fototoestemming", "Alleen als je foto's wilt gebruiken voor site of Instagram."],
] as const

export default function Beheer() {
  const open = DOCUMENTEN.flatMap((d) => d.doc.open.map((o) => [d.doc.title, o] as const))
  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      <header className="rounded-b-[28px] bg-[#202020] px-5 pb-10 pt-6 text-[#EFEEEA] md:px-12 md:pb-14">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between text-[13px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[26px] w-auto" />
          <div className="flex gap-5">
            <Link href="/" className="w-lijnlink opacity-80">← Naar de site</Link>
            <a href="/api/uitloggen" className="w-lijnlink opacity-80">Uitloggen</a>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-[1180px]">
          <p className="lbl m-0 text-[#DB6923]">Beheer · alleen eigenaar</p>
          <h1 className="syne m-0 mt-2 text-[clamp(36px,6vw,64px)] leading-[1] tracking-[-.02em]">Hoi Nick.</h1>
          <p className="m-0 mt-3 max-w-[52ch] opacity-80">Offertes maken en je kleine letters bij de hand. Alles hier is alleen voor jou.</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1180px] gap-5 px-5 py-10 md:grid-cols-3 md:px-12">
        <Link
          href="/offertes"
          className="group flex flex-col justify-between rounded-[22px] bg-[#DB6923] p-7 text-[#202020]"
        >
          <div>
            <p className="lbl m-0 opacity-80">GR-O · GR-N</p>
            <h2 className="syne m-0 mt-2 text-[30px] leading-[1.05]">Offerte maken</h2>
            <p className="m-0 mt-3 text-[15px]">Posten invullen, bewaarde posten hergebruiken, printen als PDF. Met het interne overzicht van wat je overhoudt.</p>
          </div>
          <span className="mt-10 inline-flex items-center gap-2 font-semibold">
            Naar de offertemaker <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>

        <section className="rounded-[22px] border border-lijn p-7 md:col-span-2">
          <p className="lbl m-0 text-gedempt">Kleine letters</p>
          <h2 className="syne m-0 mt-2 text-[26px]">Je juridische documenten</h2>
          <ul className="m-0 mt-5 list-none divide-y divide-lijn p-0">
            {DOCUMENTEN.map(({ doc, pagina, pdf }) => (
              <li key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <b className="font-semibold">{doc.title}</b>
                  <span className="block text-[13px] text-gedempt">
                    Versie {datum(doc.updated)} ·{" "}
                    <span className={doc.status === "vastgesteld" ? "text-inkt" : "text-oranje-tekst"}>
                      {doc.status === "vastgesteld" ? "vastgesteld" : "concept"}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2 text-[13px]">
                  <Link href={pagina} className="rounded-full border border-lijn px-3 py-1.5">Bekijk</Link>
                  <a href={`/documenten/${pdf}`} download className="rounded-full bg-inkt px-3 py-1.5 text-grond">PDF</a>
                </div>
              </li>
            ))}
            <li className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div>
                <b className="font-semibold">Fototoestemming</b>
                <span className="block text-[13px] text-gedempt">Leeg formulier, project en adres zelf invullen</span>
              </div>
              <a href="/documenten/GRONN-fototoestemming.pdf" download className="rounded-full bg-inkt px-3 py-1.5 text-[13px] text-grond">PDF</a>
            </li>
          </ul>
        </section>

        <section className="rounded-[22px] bg-[#202020] p-7 text-[#EFEEEA] md:col-span-1">
          <p className="lbl m-0 text-[#DB6923]">Bij elke particuliere offerte</p>
          <ol className="m-0 mt-4 list-none space-y-3 p-0">
            {MEESTUREN.map(([t, uitleg], i) => (
              <li key={t} className="flex gap-3">
                <span className="syne text-[#DB6923]">{i + 1}</span>
                <span>
                  <b className="font-semibold">{t}</b>
                  <span className="block text-[13px] opacity-70">{uitleg}</span>
                </span>
              </li>
            ))}
          </ol>
          <a
            href="/documenten/GRONN-bijlagen-particulier.zip"
            download
            className="mt-6 inline-flex rounded-full bg-[#DB6923] px-4 py-2.5 text-[14px] font-semibold text-[#202020]"
          >
            Bijlagen 2 t/m 4 downloaden (zip)
          </a>
        </section>

        <section className="rounded-[22px] border border-dashed border-lijn p-7 md:col-span-2">
          <p className="lbl m-0 text-gedempt">Nog te doen</p>
          <ul className="m-0 mt-4 grid list-none gap-x-8 gap-y-3 p-0 text-[14px] md:grid-cols-2">
            {open.map(([titel, o]) => (
              <li key={o} className="flex gap-3">
                <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-[#DB6923]" />
                <span>
                  {o}
                  <span className="block text-[12px] text-gedempt">{titel}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

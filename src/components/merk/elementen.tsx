import type { CSSProperties } from "react"
import { Beide, T } from "@/components/taal"
import { Kopieer } from "@/components/kopieer"
import { Oplichten } from "@/components/wereld/oplichten"
import type { L } from "@/lib/i18n"

// Stem, beweging en de website-elementen voor /merk (eigenaar, 5 okt 2026:
// "maak de brandguide meer inhoudelijk, voeg website elementen toe, maak er ook
// een leuke pagina van met animatie"). Alles hier is het echte element van de
// site, niet een plaatje ervan; de regels komen uit de afspraken met de eigenaar.

function Kop({ id, label, aantal }: { id: string; label: L; aantal?: L }) {
  return (
    <div className="w-kopregel">
      <h2 id={id} className="lbl m-0 font-normal">
        <T t={label} />
      </h2>
      {aantal ? (
        <span className="lbl text-gedempt">
          <T t={aantal} />
        </span>
      ) : null}
    </div>
  )
}

function Vak({ titel, children, i = 0, className = "" }: { titel: L; children: React.ReactNode; i?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-5 rounded-2xl p-6 ring-1 ring-lijn ${className}`} data-zie style={{ "--i": i } as CSSProperties}>
      <p className="lbl m-0 text-gedempt">
        <T t={titel} />
      </p>
      <div className="flex flex-1 flex-wrap items-center gap-4">{children}</div>
    </div>
  )
}

const PIJL = "M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z"

const STEM: [L, L, L][] = [
  [
    { nl: "Ik, niet wij", en: "I, not we" },
    { nl: "GRØNN Studio is één persoon. De site spreekt in de ik-vorm en zegt je tegen de lezer.", en: "GRØNN Studio is one person. The site speaks in the first person and addresses the reader directly." },
    { nl: "Ik kom kijken, luister naar wat je wilt en zeg eerlijk wat ik zou doen.", en: "I come and look, listen to what you want and tell you honestly what I would do." },
  ],
  [
    { nl: "Eerst wat en voor wie", en: "What and for whom first" },
    { nl: "Eén zin zegt wat ik doe, voor wie en waar, voordat er iets anders komt.", en: "One sentence says what I do, for whom and where, before anything else." },
    { nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.", en: "I build and maintain ponds and natural gardens for homeowners in Stein and the surrounding area, with a fixed price agreed up front." },
  ],
  [
    { nl: "Eerlijk over geld", en: "Honest about money" },
    { nl: "Prijzen staan erbij, inclusief btw. Wat verrekend wordt, staat er ook bij.", en: "Prices are shown, including VAT. What is offset later is shown too." },
    { nl: "Leidt de doorlichting tot werk, dan was de doorlichting gratis.", en: "If the survey leads to work, the survey was free." },
  ],
  [
    { nl: "Alleen wat klopt", en: "Only what is true" },
    { nl: "Geen verzonnen projecten, cijfers of reviews. Een visualisatie heet een visualisatie.", en: "No invented projects, figures or reviews. A visualisation is called a visualisation." },
    { nl: "Visualisatie, geen foto van het resultaat.", en: "Visualisation, not a photo of the result." },
  ],
]

const BEWEGING: [L, L][] = [
  [{ nl: "Rustig", en: "Calm" }, { nl: "Beweging zit in openingen, foto's en grote tekst. Prijzen, formulieren en juridische tekst staan stil.", en: "Motion lives in openings, photos and large type. Prices, forms and legal text stay still." }],
  [{ nl: "Klein en precies", en: "Small and precise" }, { nl: "Fijne lijnen, een dunne komeet, een ring die meeloopt. Niets groots of decoratiefs.", en: "Fine lines, a thin comet, a ring that follows along. Nothing big or decorative." }],
  [{ nl: "Altijd een uitweg", en: "Always a way out" }, { nl: "Wie minder beweging kiest, op het toestel of in Weergave, krijgt alles meteen en stil.", en: "Anyone who chooses less motion, on the device or in Display, gets everything at once and still." }],
  [{ nl: "Ook op de telefoon", en: "On the phone too" }, { nl: "De effecten van desktop draaien ook op mobiel, in een lichtere vorm, nooit verstopt.", en: "The desktop effects also run on mobile, in a lighter form, never hidden." }],
]

export function MerkElementen() {
  return (
    <>
      <section aria-labelledby="h-stem" className="w-sectie" id="stem">
        <Kop id="h-stem" label={{ nl: "Stem", en: "Voice" }} aantal={{ nl: `${STEM.length} afspraken`, en: `${STEM.length} principles` }} />
        <Oplichten
          tekst={{
            nl: "Schrijf zoals ik praat in de tuin: kort, eerlijk en concreet. Eerst wat het is, dan wat het kost, dan hoe je begint.",
            en: "Write the way I talk in the garden: short, honest and concrete. First what it is, then what it costs, then how to start.",
          }}
          className="m-0 max-w-[24ch] text-[clamp(28px,3.4vw,52px)] leading-[1.15] tracking-[-.02em]"
        />
        <ol className="m-0 mt-[clamp(40px,5vw,72px)] list-none border-t border-lijn p-0">
          {STEM.map(([kop, regel, voorbeeld], i) => (
            <li key={i} className="grid gap-3 border-b border-lijn py-6 md:grid-cols-[60px_3fr_4fr_5fr] md:gap-8" data-zie>
              <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="syne m-0 text-[clamp(20px,2vw,26px)] tracking-[-.02em]">
                <T t={kop} />
              </h3>
              <p className="m-0 text-[16px] leading-[1.6] text-gedempt">
                <T t={regel} />
              </p>
              <p className="m-0 border-l-2 border-oranje pl-4 text-[17px] leading-[1.55] italic">
                <T t={voorbeeld} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="h-elementen" className="w-sectie" id="elementen">
        <Kop id="h-elementen" label={{ nl: "Website-elementen", en: "Website elements" }} aantal={{ nl: "echt, niet nagemaakt", en: "real, not mocked up" }} />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Vak titel={{ nl: "Hoofdknop · één per scherm", en: "Primary button · one per screen" }}>
            <a href="/kennismaken" className="group inline-flex items-center gap-9 rounded-full bg-oranje py-[15px] pr-5 pl-6 text-[13px] leading-4 font-bold tracking-[-.01em] text-white uppercase no-underline dark:text-antraciet">
              <span className="block h-4 overflow-hidden">
                <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
                <span aria-hidden className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
              </span>
              <svg viewBox="0 0 11 14" width="11" height="14" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"><path d={PIJL} fill="currentColor" /></svg>
            </a>
          </Vak>
          <Vak titel={{ nl: "Tweede knop · omlijnd", en: "Secondary button · outlined" }} i={1}>
            <a href="/werk" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lijn px-5 text-[13px] font-bold tracking-[.06em] uppercase no-underline transition-colors hover:border-inkt">
              <T t={{ nl: "Bekijk het werk", en: "See the work" }} /> <span aria-hidden>→</span>
            </a>
          </Vak>
          <Vak titel={{ nl: "Tekstlink · lijn groeit aan", en: "Text link · line grows in" }} i={2}>
            <a href="/over" className="w-lijnlink text-[18px]">
              <T t={{ nl: "Meer over mij →", en: "More about me →" }} />
            </a>
          </Vak>
          <Vak titel={{ nl: "Kopieerchip", en: "Copy chip" }}>
            <Kopieer label="HEX" waarde="#DB6923" />
          </Vak>
          <Vak titel={{ nl: "Menu · glazen pil met komeet", en: "Menu · glass pill with comet" }} i={1}>
            <div className="relative flex items-center gap-1 rounded-full bg-[rgba(32,32,32,.55)] p-1 ring-1 ring-gebroken-wit/10" aria-hidden="true">
              <span className="komeet" />
              {["Vijvers", "Tuinen"].map((w) => (
                <span key={w} className="rounded-full px-3 py-2.5 text-[11px] font-bold text-gebroken-wit uppercase">{w}</span>
              ))}
              <span className="rounded-full bg-antraciet px-3 py-2.5 text-[11px] font-bold text-gebroken-wit uppercase dark:bg-white dark:text-antraciet">Werk</span>
            </div>
          </Vak>
          <Vak titel={{ nl: "Pijl met voortgangsring", en: "Arrow with progress ring" }} i={2}>
            <span className="merk-pijl relative grid size-[52px] place-items-center rounded-full bg-oranje text-white dark:text-antraciet" aria-hidden="true">
              <svg viewBox="0 0 40 40" className="ring-voortgang merk-ring"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
              <svg viewBox="0 0 16 16" width="16" height="16"><path d="M8 1.5v12M2.5 8 8 13.5 13.5 8" fill="none" stroke="currentColor" strokeWidth="1.9" /></svg>
            </span>
            <span className="text-[14px] text-gedempt"><T t={{ nl: "De ring loopt vol met het scrollen.", en: "The ring fills as you scroll." }} /></span>
          </Vak>
          <Vak titel={{ nl: "Sectiekop · label en aantal", en: "Section header · label and count" }} className="md:col-span-2">
            <div className="w-full">
              <div className="flex items-baseline justify-between border-t border-lijn pt-3">
                <span className="lbl"><T t={{ nl: "Zo werk ik", en: "How I work" }} /></span>
                <span className="lbl text-gedempt"><T t={{ nl: "6 stappen", en: "6 steps" }} /></span>
              </div>
              <p className="syne m-0 mt-4 text-[clamp(26px,3vw,40px)] tracking-[-.02em]"><T t={{ nl: "Van eerste blik tot onderhoud.", en: "From first look to maintenance." }} /></p>
            </div>
          </Vak>
          <Vak titel={{ nl: "Label", en: "Label" }} i={2}>
            <span className="lbl"><T t={{ nl: "Vijvers en tuinen · Stein", en: "Ponds and gardens · Stein" }} /></span>
            <span className="lbl rounded-full bg-[#202020]/70 px-3 py-1 text-[#EFEEEA]"><T t={{ nl: "Sfeerbeeld", en: "Mood image" }} /></span>
          </Vak>
        </div>
      </section>

      <section aria-labelledby="h-beweging" className="w-sectie" id="beweging">
        <Kop id="h-beweging" label={{ nl: "Beweging", en: "Motion" }} aantal={{ nl: `${BEWEGING.length} regels`, en: `${BEWEGING.length} rules` }} />
        <div className="grid gap-3 md:grid-cols-2">
          {BEWEGING.map(([kop, tekst], i) => (
            <div key={i} className="merk-beweeg rounded-2xl p-6 ring-1 ring-lijn" data-zie style={{ "--i": i } as CSSProperties}>
              <span className="merk-stip" aria-hidden="true" />
              <h3 className="syne m-0 text-[clamp(20px,2vw,26px)] tracking-[-.02em]"><T t={kop} /></h3>
              <p className="m-0 mt-3 text-[16px] leading-[1.6] text-gedempt"><T t={tekst} /></p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
          <Beide
            nl={<>Wat je op deze pagina ziet bewegen, is wat de site gebruikt: tekst die woord voor woord oplicht, blokken die zacht opkomen, de komeet om de pil en het doek tussen pagina&apos;s. Zet in Weergave &lsquo;Minder beweging&rsquo; aan om het stil te zien.</>}
            en={<>What you see moving on this page is what the site uses: text that lights up word by word, blocks that rise softly, the comet around the pill and the curtain between pages. Turn on &lsquo;Less motion&rsquo; in Display to see it still.</>}
          />
        </p>
      </section>
    </>
  )
}

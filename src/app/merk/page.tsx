import type { CSSProperties } from "react"
import type { Metadata } from "next"
import { Opening } from "@/components/wereld/opening"
import { Beide, T } from "@/components/taal"
import { BUSINESS } from "@/lib/business"
import { MERKBASIS, MERKBELOFTE } from "@/lib/data/plekken"
import type { L } from "@/lib/i18n"
import { MerkGids } from "@/components/merk/gids"
import { Kopieer } from "@/components/kopieer"
import { MerkElementen } from "@/components/merk/elementen"
import { Verder } from "@/components/wereld/verder"

export const metadata: Metadata = {
  title: "Merk",
  description: "Het merk GRØNN Studio: naam, woordmerk, kleuren, letters en hoe ze gebruikt worden. Uitgeschreven uit de GRØNN Brand Guide 2026.",
}

// /merk (eigenaar, 5 okt 2026): het merk beschreven en de Brand Guide 2026
// (Editie 01) uitgeschreven. Alleen wat in de gids staat en wat de site echt
// gebruikt; niets erbij verzonnen. Niet in het menu, wel in de voet.

const KLEUREN: { naam: L; hex: string; rol: L; licht?: boolean }[] = [
  { naam: { nl: "Gebroken wit", en: "Off-white" }, hex: "#EFEEEA", rol: { nl: "Grond · 60 %", en: "Ground · 60 %" }, licht: true },
  { naam: { nl: "Antraciet", en: "Anthracite" }, hex: "#202020", rol: { nl: "Tekst en donker · 30 %", en: "Text and dark · 30 %" } },
  { naam: { nl: "Aarde-oranje", en: "Earth orange" }, hex: "#DB6923", rol: { nl: "Het ene accent · 10 %", en: "The one accent · 10 %" } },
  { naam: { nl: "Donker oranje", en: "Dark orange" }, hex: "#A14312", rol: { nl: "Oranje als tekst op licht", en: "Orange as text on light" } },
  { naam: { nl: "Bosgroen", en: "Forest green" }, hex: "#23483A", rol: { nl: "Botanisch, in beeld en drukwerk", en: "Botanical, in imagery and print" } },
  { naam: { nl: "Mosgroen", en: "Moss green" }, hex: "#607A59", rol: { nl: "Botanisch, in beeld en drukwerk", en: "Botanical, in imagery and print" } },
  { naam: { nl: "Salie", en: "Sage" }, hex: "#B8C5A8", rol: { nl: "Botanisch, in beeld en drukwerk", en: "Botanical, in imagery and print" }, licht: true },
]

const REGELS: [L, L][] = [
  [
    { nl: "Eén oranje accent", en: "One orange accent" },
    { nl: "Per compositie één oranje accent, zonder gloed. Oranje is de kleur van actie en herkenning.", en: "One orange accent per composition, without glow. Orange is the colour of action and recognition." },
  ],
  [
    { nl: "Oranje draagt antraciet", en: "Orange carries anthracite" },
    { nl: "Op een oranje vlak staat antraciet tekst (4,70:1). Oranje als tekst op licht is donker oranje #A14312; #DB6923 op gebroken wit is nooit een tekstpaar.", en: "Text on an orange fill is anthracite (4.70:1). Orange as text on light is dark orange #A14312; #DB6923 on off-white is never a text pair." },
  ],
  [
    { nl: "Vlakke kleuren", en: "Flat colours" },
    { nl: "Vlakke kleuren, rust als herkenning. Geen verlopen, geen patronen achter tekst.", en: "Flat colours, calm as recognition. No gradients, no patterns behind text." },
  ],
  [
    { nl: "Rond en zacht", en: "Round and soft" },
    { nl: "Knoppen zijn helemaal rond. Kaarten en foto's hebben zachte hoeken.", en: "Buttons are fully round. Cards and photos have soft corners." },
  ],
  [
    { nl: "Echt werk", en: "Real work" },
    { nl: "Foto's tonen echt werk. Een sfeerbeeld draagt het label Sfeerbeeld en staat nooit bij een project; een AI-visualisatie wordt altijd zo genoemd.", en: "Photos show real work. A mood image carries the label Mood image and never sits with a project; an AI visualisation is always named as such." },
  ],
]

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

export default function Merk() {
  return (
    <>
      <Opening
        label={{ nl: "Brand Guide 2026 · Editie 01", en: "Brand Guide 2026 · Edition 01" }}
        titel={{ nl: "Het merk", en: "The brand" }}
        zin={<T t={MERKBASIS} />}
      />

      <div className="wrap">
        <nav aria-label="Inhoud" className="mt-[clamp(48px,6vw,96px)] flex flex-wrap gap-2">
          {(
            [
              ["#h-naam", { nl: "Naam", en: "Name" }],
              ["#h-logo", { nl: "Woordmerk", en: "Wordmark" }],
              ["#h-kleur", { nl: "Kleur", en: "Colour" }],
              ["#h-letters", { nl: "Letters", en: "Type" }],
              ["#h-schaal", { nl: "Kleurschaal", en: "Colour scale" }],
              ["#h-iconen", { nl: "Iconen", en: "Icons" }],
              ["#h-schaal-type", { nl: "Letterschaal", en: "Type scale" }],
              ["#h-raster", { nl: "Raster", en: "Grid" }],
              ["#h-contrast", { nl: "Contrast", en: "Contrast" }],
              ["#h-beeld", { nl: "Beeld", en: "Imagery" }],
              ["#stem", { nl: "Stem", en: "Voice" }],
              ["#elementen", { nl: "Elementen", en: "Elements" }],
              ["#beweging", { nl: "Beweging", en: "Motion" }],
              ["#h-regels", { nl: "Regels", en: "Rules" }],
              ["/downloads", { nl: "Downloads ↓", en: "Downloads ↓" }],
            ] as [string, L][]
          ).map(([href, naam], i) => (
            <a key={href} href={href} className="rounded-full border border-lijn px-4 py-2 text-[13px] font-medium no-underline transition-colors hover:border-inkt hover:bg-inkt hover:text-grond" data-zie style={{ "--i": i % 6 } as CSSProperties}>
              <T t={naam} />
            </a>
          ))}
        </nav>

        <section aria-labelledby="h-naam" className="w-sectie">
          <Kop id="h-naam" label={{ nl: "Naam en belofte", en: "Name and promise" }} />
          <div className="grid gap-8 md:grid-cols-[5fr_7fr]">
            <p className="syne m-0 text-[clamp(40px,6vw,88px)] leading-[1] tracking-[-.03em]" data-zie>
              {BUSINESS.name}
            </p>
            <div className="text-[clamp(18px,1.5vw,22px)] leading-[1.55]" data-zie>
              <p className="mt-0">
                <Beide
                  nl={<>De naam wordt altijd in hoofdletters geschreven, met de Ø. Achter de naam staat <strong>Studio</strong>: het werk van één ontwerper en hovenier, {BUSINESS.owner.given} {BUSINESS.owner.family}.</>}
                  en={<>The name is always written in capitals, with the Ø. After the name comes <strong>Studio</strong>: the work of one designer and gardener, {BUSINESS.owner.given} {BUSINESS.owner.family}.</>}
                />
              </p>
              <p className="lbl mb-1 text-gedempt"><T t={{ nl: "Belofte", en: "Promise" }} /></p>
              <p className="mt-0"><T t={MERKBELOFTE} /></p>
              <p className="lbl mb-1 text-gedempt"><T t={{ nl: "Ondertitel", en: "Tagline" }} /></p>
              <p className="m-0">{BUSINESS.tagline}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="h-logo" className="w-sectie">
          <Kop id="h-logo" label={{ nl: "Woordmerk", en: "Wordmark" }} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid min-h-[220px] place-items-center rounded-2xl bg-[#202020] p-10" data-zie>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair.svg" alt="GRØNN, het primaire woordmerk op antraciet" className="h-auto w-[min(320px,80%)]" />
            </div>
            <div className="grid min-h-[220px] place-items-center rounded-2xl bg-[#EFEEEA] p-10 ring-1 ring-lijn" data-zie style={{ "--i": 1 } as CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair-antraciet.svg" alt="GRØNN, het primaire woordmerk op gebroken wit" className="h-auto w-[min(320px,80%)]" />
            </div>
          </div>
          <ul className="mt-8 grid list-none gap-4 p-0 text-[17px] leading-[1.6] md:grid-cols-3">
            <li data-zie>
              <T t={{ nl: "Het woordmerk staat in één vlakke kleur; in de R zit de oranje P van Peters.", en: "The wordmark is set in one flat colour; the R holds the orange P of Peters." }} />
            </li>
            <li data-zie style={{ "--i": 1 } as CSSProperties}>
              <T t={{ nl: "Op donker en op foto's het witte woordmerk, op licht het antraciet.", en: "On dark and on photos the white wordmark, on light the anthracite one." }} />
            </li>
            <li data-zie style={{ "--i": 2 } as CSSProperties}>
              <T t={{ nl: "Nooit opnieuw tekenen, vervormen, uitrekken of een andere letter gebruiken.", en: "Never redraw, distort, stretch it or swap the lettering." }} />
            </li>
          </ul>
        </section>

        <section aria-labelledby="h-kleur" className="w-sectie">
          <Kop id="h-kleur" label={{ nl: "Kleur", en: "Colour" }} aantal={{ nl: "60 · 30 · 10", en: "60 · 30 · 10" }} />
          <div className="merk-balk mb-8 flex h-14 overflow-hidden rounded-full ring-1 ring-lijn" aria-hidden="true" data-zie>
            <span className="w-[60%] bg-[#EFEEEA]" />
            <span className="w-[30%] bg-[#202020]" />
            <span className="w-[10%] bg-[#DB6923]" />
          </div>
          <ul className="grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4">
            {KLEUREN.map((k, i) => (
              <li key={k.hex} className="overflow-hidden rounded-2xl ring-1 ring-lijn" data-zie style={{ "--i": i % 4 } as CSSProperties}>
                <div className="h-24" style={{ background: k.hex }} />
                <div className="p-4">
                  <p className="m-0 font-semibold"><T t={k.naam} /></p>
                  <p className="m-0 mt-2 text-[14px]"><Kopieer label="HEX" waarde={k.hex} /></p>
                  <p className="lbl m-0 mt-2 text-gedempt"><T t={k.rol} /></p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
            <T t={{ nl: "60 % licht, 30 % donker, 10 % accent. Op de website staan alleen de eerste drie; groen komt uit de foto's en uit wat ik maak. Licht en donker op de site heten intern Gouden Uur en Blauwe Uur.", en: "60 % light, 30 % dark, 10 % accent. The website uses only the first three; green comes from the photos and from what I make. Internally, light and dark on the site are called Golden Hour and Blue Hour." }} />
          </p>
        </section>

        <section aria-labelledby="h-letters" className="w-sectie">
          <Kop id="h-letters" label={{ nl: "Letters", en: "Type" }} aantal={{ nl: "2 families", en: "2 families" }} />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl p-8 ring-1 ring-lijn" data-zie>
              <p className="lbl m-0 text-gedempt">Syne Bold · <T t={{ nl: "koppen", en: "headings" }} /></p>
              <p className="syne m-0 mt-4 text-[clamp(44px,5vw,72px)] leading-[1] tracking-[-.03em]">Aa Øø</p>
              <p className="syne m-0 mt-4 text-[20px] break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            </div>
            <div className="rounded-2xl p-8 ring-1 ring-lijn" data-zie style={{ "--i": 1 } as CSSProperties}>
              <p className="lbl m-0 text-gedempt">Montserrat · <T t={{ nl: "tekst, labels en knoppen", en: "text, labels and buttons" }} /></p>
              <p className="m-0 mt-4 text-[clamp(44px,5vw,72px)] leading-[1] font-light tracking-[-.02em]">Aa Øø</p>
              <p className="m-0 mt-4 text-[20px] break-all">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p>
            </div>
          </div>
          <p className="mt-6 max-w-[66ch] text-[16px] leading-[1.6] text-gedempt">
            <T t={{ nl: "Alleen deze twee. Koppen in Syne Bold, al het andere in Montserrat: lopende tekst licht, labels in kleine hoofdletters met wat ruimte ertussen, knoppen vet.", en: "Only these two. Headings in Syne Bold, everything else in Montserrat: running text light, labels in small spaced capitals, buttons bold." }} />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["Syne", "https://fonts.google.com/specimen/Syne"],
              ["Montserrat", "https://fonts.google.com/specimen/Montserrat"],
            ].map(([naam, url]) => (
              <a key={naam} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lijn px-5 text-[13px] font-bold tracking-[.06em] uppercase no-underline hover:border-inkt">
                <T t={{ nl: `Download ${naam}`, en: `Download ${naam}` }} />
                <span aria-hidden="true">↓</span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-[14px] text-gedempt">
            <T t={{ nl: "Beide letters zijn vrij te gebruiken (SIL Open Font License) en komen van Google Fonts.", en: "Both typefaces are free to use (SIL Open Font License) and come from Google Fonts." }} />
          </p>
        </section>

        <MerkGids />

        <MerkElementen />

        <section aria-labelledby="h-regels" className="w-sectie">
          <Kop id="h-regels" label={{ nl: "Vorm en gebruik", en: "Form and use" }} aantal={{ nl: `${REGELS.length} regels`, en: `${REGELS.length} rules` }} />
          <ol className="m-0 list-none border-t border-lijn p-0">
            {REGELS.map(([kop, tekst], i) => (
              <li key={i} className="grid gap-2 border-b border-lijn py-6 md:grid-cols-[60px_4fr_8fr] md:gap-8" data-zie>
                <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="syne m-0 text-[clamp(20px,2vw,26px)] tracking-[-.02em]"><T t={kop} /></h3>
                <p className="m-0 text-[17px] leading-[1.6]"><T t={tekst} /></p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[16px] leading-[1.6] text-gedempt">
            <Beide
              nl={<>Het woordmerk of de naam gebruiken in een publicatie? Mail naar <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>.</>}
              en={<>Want to use the wordmark or the name in a publication? Email <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>.</>}
            />
          </p>
        </section>
      </div>
      <Verder voor={{ nl: "En wat er", en: "And what" }} nadruk={{ nl: "onder de motorkap", en: "is under the hood" }} na={{ nl: "zit?", en: "?" }} href="/techniek" label={{ nl: "Naar Techniek", en: "To Technology" }} />
    </>
  )
}

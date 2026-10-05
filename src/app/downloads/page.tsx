import type { CSSProperties } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { T } from "@/components/taal"
import type { L } from "@/lib/i18n"

// /downloads (eigenaar, 5 okt 2026: "een pagina waar ik dit soort dingen
// makkelijk kan downloaden voor als ik het nog eens nodig heb"). Merkbestanden
// en gereedschap op één plek. Niet in het menu of de sitemap, niet in Google;
// wel gelinkt vanaf /merk. Nieuwe bestanden in public/downloads/ en hieronder.

type Stuk = { titel: L; uitleg: L; href: string; download?: string; label: L; voorbeeld?: { src: string; donker?: boolean } }

const STUKKEN: Stuk[] = [
  {
    titel: { nl: "Woordmerk · wit", en: "Wordmark · white" },
    uitleg: { nl: "Voor donkere vlakken en foto's. PNG met doorzichtige achtergrond, 2400 px breed.", en: "For dark surfaces and photos. PNG with transparent background, 2400 px wide." },
    href: "/downloads/gronn-woordmerk-wit.png",
    download: "gronn-woordmerk-wit.png",
    label: { nl: "PNG", en: "PNG" },
    voorbeeld: { src: "/downloads/gronn-woordmerk-wit.png", donker: true },
  },
  {
    titel: { nl: "Woordmerk · antraciet", en: "Wordmark · anthracite" },
    uitleg: { nl: "Voor lichte vlakken. PNG met doorzichtige achtergrond, 2400 px breed.", en: "For light surfaces. PNG with transparent background, 2400 px wide." },
    href: "/downloads/gronn-woordmerk-antraciet.png",
    download: "gronn-woordmerk-antraciet.png",
    label: { nl: "PNG", en: "PNG" },
    voorbeeld: { src: "/downloads/gronn-woordmerk-antraciet.png" },
  },
  {
    titel: { nl: "Woordmerk · vector", en: "Wordmark · vector" },
    uitleg: { nl: "Beide versies als SVG, voor drukwerk en de merkregistratie.", en: "Both versions as SVG, for print and the trademark filing." },
    href: "/downloads/gronn-woordmerk-wit.svg",
    download: "gronn-woordmerk-wit.svg",
    label: { nl: "SVG wit", en: "SVG white" },
  },
  {
    titel: { nl: "Woordmerk · vector antraciet", en: "Wordmark · vector anthracite" },
    uitleg: { nl: "De antraciet versie als SVG.", en: "The anthracite version as SVG." },
    href: "/downloads/gronn-woordmerk-antraciet.svg",
    download: "gronn-woordmerk-antraciet.svg",
    label: { nl: "SVG antraciet", en: "SVG anthracite" },
  },
  {
    titel: { nl: "Instagram-highlights", en: "Instagram highlights" },
    uitleg: { nl: "Vijf covers, 1080 × 1920: Vijvers, Tuinen, Werk, Over, Kennismaken. Antraciet met oranje.", en: "Five covers, 1080 × 1920: Ponds, Gardens, Work, About, Get in touch. Anthracite with orange." },
    href: "/downloads/gronn-instagram-highlights.zip",
    download: "gronn-instagram-highlights.zip",
    label: { nl: "ZIP", en: "ZIP" },
    voorbeeld: { src: "/downloads/highlights-voorbeeld.png" },
  },
  {
    titel: { nl: "Visitekaartje", en: "Business card" },
    uitleg: { nl: "Naam, nummer, mail en adres in één keer in je contacten.", en: "Name, number, email and address into your contacts in one go." },
    href: "/contact.vcf",
    download: "gronn-studio.vcf",
    label: { nl: "VCF", en: "VCF" },
  },
  {
    titel: { nl: "E-mailhandtekening", en: "Email signature" },
    uitleg: { nl: "Kopiëren en plakken in Gmail, met uitleg.", en: "Copy and paste into Gmail, with instructions." },
    href: "/handtekening",
    label: { nl: "Openen", en: "Open" },
  },
  {
    titel: { nl: "Letters", en: "Typefaces" },
    uitleg: { nl: "Syne en Montserrat, vrij te gebruiken (SIL Open Font License).", en: "Syne and Montserrat, free to use (SIL Open Font License)." },
    href: "/merk#h-letters",
    label: { nl: "Naar Merk", en: "To Brand" },
  },
]

export const metadata: Metadata = {
  title: "Downloads",
  description: "Merkbestanden van GRØNN Studio: woordmerk, Instagram-highlights, visitekaartje en e-mailhandtekening.",
  robots: { index: false, follow: false },
}

export default function Downloads() {
  return (
    <>
      <Opening
        label={{ nl: `Downloads · ${STUKKEN.length} stukken`, en: `Downloads · ${STUKKEN.length} items` }}
        titel={{ nl: "Downloads", en: "Downloads" }}
        zin={<T t={{ nl: "Merkbestanden en gereedschap op één plek, voor als je ze nog eens nodig hebt.", en: "Brand files and tools in one place, for when you need them again." }} />}
      />
      <div className="wrap">
        <ul className="m-0 mt-[clamp(56px,7vw,112px)] grid list-none gap-3 p-0 md:grid-cols-2 lg:grid-cols-3">
          {STUKKEN.map((s, i) => {
            const intern = !s.download
            const Kaart = (
              <>
                {s.voorbeeld ? (
                  <span className={`mb-5 grid h-32 place-items-center overflow-hidden rounded-xl p-5 ${s.voorbeeld.donker ? "bg-[#202020]" : "bg-vlak"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.voorbeeld.src} alt="" className="max-h-full w-auto max-w-full rounded-none!" loading="lazy" />
                  </span>
                ) : null}
                <span className="syne block text-[clamp(20px,2vw,26px)] tracking-[-.02em]">
                  <T t={s.titel} />
                </span>
                <span className="mt-2 mb-6 block text-[15px] leading-[1.55] text-gedempt">
                  <T t={s.uitleg} />
                </span>
                <span className="mt-auto inline-flex items-center gap-2 self-start rounded-full bg-oranje px-4 py-2 pt-2 text-[12px] font-bold tracking-[.06em] text-antraciet uppercase">
                  <T t={s.label} /> <span aria-hidden="true">{intern ? "→" : "↓"}</span>
                </span>
              </>
            )
            const klas = "flex h-full flex-col gap-0 rounded-2xl p-6 no-underline ring-1 ring-lijn transition-colors hover:ring-inkt"
            return (
              <li key={s.href} data-zie style={{ "--i": i % 3 } as CSSProperties}>
                {intern ? (
                  <Link href={s.href} className={klas}>{Kaart}</Link>
                ) : (
                  <a href={s.href} download={s.download} className={klas}>{Kaart}</a>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

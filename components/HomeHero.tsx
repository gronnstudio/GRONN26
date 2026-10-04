import Image from "next/image"
import Link from "next/link"

import { Plaat } from "@/components/Plaat"
import { DETAILS, OPENINGSBEELD } from "@/data/projects"
import { OPENING } from "@/data/site"

// De opening als spread, zoals een boek opent: links de foto, schoon,
// zonder tekst erover; rechts het papier met één zin, één weg verder en
// een detail als plaat. Water en techniek naast een hand die plant.
export function HomeHero() {
  const regels = splitsKop(OPENING.kop)
  return (
    <section data-kop-split aria-labelledby="opening-kop" className="opening grid min-h-[100svh] md:grid-cols-12">
      <figure className="relative h-[56svh] overflow-hidden md:col-span-7 md:h-auto md:min-h-[100svh]">
        <Image
          src={OPENINGSBEELD.src}
          alt={OPENINGSBEELD.alt}
          fill
          priority
          sizes="(min-width: 768px) 58vw, 100vw"
          className="opening-beeld foto-toon object-cover"
          style={{ objectPosition: OPENINGSBEELD.focus }}
        />
        {/* Alleen een zachte schaduw onder het woordmerk, niet over het beeld. */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[160px] bg-[linear-gradient(to_bottom,rgb(16_20_18/0.38),transparent)]" />
        <figcaption className="tekst-label absolute bottom-[16px] left-[var(--goot)] text-gronn-wit/85 md:bottom-auto md:left-auto md:right-[24px] md:top-[35px]">
          GR / 001 — De waterval
        </figcaption>
      </figure>

      <div className="flex flex-col justify-between gap-[56px] px-[var(--goot)] pb-[clamp(56px,10vh,120px)] pt-[40px] md:col-span-5 md:pt-[112px]">
        <Plaat
          foto={DETAILS.plantmand}
          sizes="(min-width: 768px) 16vw, 40vw"
          className="hidden w-[min(220px,48%)] self-end md:block"
        />

        <div>
          <p className="tekst-label text-muted">{OPENING.label}</p>
          <h1 id="opening-kop" className="tekst-h1 mt-[20px] max-w-[11ch]">
            {regels.map((regel, i) => (
              <span key={i} className="onthul-regel">
                <span style={{ "--i": i } as React.CSSProperties}>{regel}</span>
              </span>
            ))}
          </h1>
          <div className="onthul-regel mt-[36px]">
            <span className="opening-rest">
              <Link href="/werk" className="group inline-flex items-center gap-[12px] text-[12px] font-semibold uppercase tracking-[0.12em]">
                <span className="border-b border-line/30 pb-[4px] transition-colors group-hover:border-line">Bekijk het werk</span>
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Breekt de kop in drie regels, zodat de onthulling per regel loopt. */
function splitsKop(kop: string) {
  const w = kop.split(" ")
  const n = Math.ceil(w.length / 3)
  return [w.slice(0, n), w.slice(n, n * 2), w.slice(n * 2)].map((r) => r.join(" ")).filter(Boolean)
}

import Image from "next/image"
import Link from "next/link"

import { OPENINGSBEELD } from "@/data/projects"
import { OPENING } from "@/data/site"

// De opening: één foto, één zin, één weg verder. Zoals de eerste
// spread van een boek. Niets anders mag met het beeld concurreren.
export function HomeHero() {
  const regels = splitsKop(OPENING.kop)
  return (
    <section data-kop-licht aria-labelledby="opening-kop" className="opening relative isolate flex min-h-[90svh] flex-col justify-end overflow-hidden text-gronn-wit">
      <Image
        src={OPENINGSBEELD.src}
        alt={OPENINGSBEELD.alt}
        fill
        priority
        sizes="100vw"
        className="opening-beeld -z-10 object-cover"
        style={{ objectPosition: OPENINGSBEELD.focus }}
      />
      {/* Een zachte schaduw boven en onder, alleen waar tekst staat. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(16_20_18/0.45),transparent_22%,transparent_45%,rgb(16_20_18/0.72))]" />

      <div className="raster pb-[clamp(40px,8vh,96px)] pt-[120px]">
        <p className="tekst-label col-span-4 mb-[20px] text-gronn-wit/85 md:col-span-5 md:col-start-6">
          {OPENING.label}
        </p>
        <h1 id="opening-kop" className="tekst-display col-span-4 md:col-span-7 md:col-start-6">
          {regels.map((regel, i) => (
            <span key={i} className="onthul-regel">
              <span style={{ "--i": i } as React.CSSProperties}>{regel}</span>
            </span>
          ))}
        </h1>
        <div className="onthul-regel col-span-4 mt-[32px] md:col-span-5 md:col-start-6">
          <span className="opening-rest">
            <Link href="/werk" className="group inline-flex items-center gap-[12px] text-[13px] font-semibold uppercase tracking-[0.1em]">
              <span className="border-b border-gronn-wit/50 pb-[4px] transition-colors group-hover:border-gronn-wit">Bekijk het werk</span>
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
            </Link>
          </span>
        </div>
      </div>

      <p className="tekst-label absolute bottom-[clamp(40px,8vh,96px)] left-[var(--goot)] hidden text-gronn-wit/75 lg:block">
        GR / 001 — De waterval
      </p>
    </section>
  )
}

/** Breekt de kop na de eerste woorden, zodat de onthulling per regel loopt. */
function splitsKop(kop: string) {
  const woorden = kop.split(" ")
  const helft = Math.ceil(woorden.length / 2)
  return [woorden.slice(0, helft).join(" "), woorden.slice(helft).join(" ")]
}

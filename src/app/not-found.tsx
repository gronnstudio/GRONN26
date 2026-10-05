import type { Metadata } from "next"
import Link from "next/link"
import type { CSSProperties } from "react"
import { Opening } from "@/components/wereld/opening"
import { Zaaien } from "@/components/niet-gevonden/zaaien"

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description: "Deze pagina bestaat niet (meer). Drie wegen terug naar GRØNN Studio.",
}

const WEGEN = [
  { href: "/", naam: "Naar de voorpagina" },
  { href: "/werk", naam: "Werk" },
  { href: "/kennismaken", naam: "Kennismaken" },
]

// WF-035 met de donkere opening van de site: één zin en drie wegen terug.
// Next geeft hier status 404 bij.
export default function NietGevonden() {
  return (
    <>
      <Opening label="404 · Pagina niet gevonden" titel={"Hier groeit\nnog niets."} />

      <div className="wrap">
        <Zaaien />
        <nav aria-label="De weg terug" className="mt-[clamp(64px,8vw,120px)] max-w-[900px] border-t border-lijn">
          {WEGEN.map((w, i) => (
            <Link
              key={w.href}
              href={w.href}
              data-zie
              style={{ "--i": i } as CSSProperties}
              className="group grid grid-cols-[32px_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-lijn py-[22px] no-underline md:grid-cols-[60px_minmax(0,1fr)_auto] md:gap-x-8"
            >
              <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")}</span>
              <span className="syne text-[clamp(22px,2.3vw,32px)] tracking-[-.02em] underline-offset-[6px] group-hover:underline group-focus-visible:underline">
                {w.naam}
              </span>
              <span className="text-[20px] text-gedempt transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

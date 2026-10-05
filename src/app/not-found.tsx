import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description: "Deze pagina bestaat niet (meer). Drie wegen terug naar GRØNN Studio.",
}

const WEGEN = [
  { href: "/", naam: "Naar de voorpagina" },
  { href: "/werk", naam: "Werk" },
  { href: "/kennismaken", naam: "Kennismaken" },
]

// WF-035: één zin en drie wegen terug. Next geeft hier status 404 bij.
export default function NietGevonden() {
  return (
    <div className="wrap">
      <section className="pt-[clamp(72px,12vw,180px)]">
        <p className="lbl m-0 text-gedempt">404 · Pagina niet gevonden</p>
        <h1 className="syne mt-4 mb-0 max-w-[12ch] text-[clamp(44px,8vw,112px)] leading-none tracking-[-.04em]">
          Hier groeit nog niets.
        </h1>
      </section>

      <nav aria-label="De weg terug" className="mt-[clamp(56px,7vw,96px)] max-w-[900px] border-t border-lijn">
        {WEGEN.map((w, i) => (
          <Link
            key={w.href}
            href={w.href}
            className="group grid grid-cols-[32px_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-lijn py-[22px] no-underline md:grid-cols-[60px_minmax(0,1fr)_auto] md:gap-x-8"
          >
            <span className="lbl text-gedempt">{String(i + 1).padStart(2, "0")}</span>
            <span className="syne text-[clamp(22px,2.3vw,32px)] tracking-[-.02em] underline-offset-[6px] group-hover:underline group-focus-visible:underline">
              {w.naam}
            </span>
            <span className="font-mono text-gedempt" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

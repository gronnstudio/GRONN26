import type { CSSProperties } from "react"
import type { Metadata } from "next"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { T } from "@/components/taal"
import { GROEPEN, ONDERDELEN } from "@/lib/data/techniek"
import "./techniek.css"

export const metadata: Metadata = {
  title: "Techniek",
  description: "Het gereedschap achter GRØNN Studio: van de camera op de bouwplaats tot de controles voordat er iets live gaat.",
  alternates: { canonical: "/techniek" },
}

const NAMEN = ONDERDELEN.map((o) => o.naam)

function Band({ omgekeerd = false }: { omgekeerd?: boolean }) {
  // twee keer dezelfde rij, zodat de band naadloos doorloopt
  const rij = (n: number) => (
    <span className="tk-rij" aria-hidden={n > 0 ? "true" : undefined} key={n}>
      {NAMEN.map((naam, i) => (
        <span key={naam} className={i % 2 ? "tk-hol" : undefined}>
          {naam}
          <span className="tk-stip" aria-hidden="true" />
        </span>
      ))}
    </span>
  )
  return (
    <div className={`tk-band ${omgekeerd ? "tk-terug" : ""}`} aria-hidden="true">
      <div className="tk-spoor">{[0, 1].map(rij)}</div>
    </div>
  )
}

export default function Techniek() {
  return (
    <>
      <Opening
        label={{ nl: `Techniek · ${ONDERDELEN.length} onderdelen`, en: `Technology · ${ONDERDELEN.length} parts` }}
        titel={{ nl: "Techniek", en: "Technology" }}
        zin={<T t={{ nl: "Van de camera op de bouwplaats tot de controles voordat er iets live gaat. Alleen wat ik echt gebruik.", en: "From the camera on site to the checks before anything goes live. Only what I actually use." }} />}
      />

      <div className="tk-banden">
        <Band />
        <Band omgekeerd />
      </div>

      <div className="wrap">
        <ul className="tk-cijfers m-0 list-none p-0">
          {(
            [
              [String(ONDERDELEN.length), { nl: "onderdelen", en: "parts" }],
              [String(GROEPEN.length), { nl: "lagen", en: "layers" }],
              ["2", { nl: "talen", en: "languages" }],
              ["0", { nl: "trackers", en: "trackers" }],
            ] as const
          ).map(([n, w], i) => (
            <li key={i} data-zie style={{ "--i": i } as CSSProperties}>
              <span className="tk-getal">{n}</span>
              <span className="lbl text-gedempt">
                <T t={w} />
              </span>
            </li>
          ))}
        </ul>

        {GROEPEN.map((g, gi) => {
          const delen = ONDERDELEN.filter((o) => o.groep === g.id)
          return (
            <section key={g.id} aria-labelledby={`tk-${g.id}`} className="tk-groep">
              <header className="tk-kop">
                <span className="tk-nr" aria-hidden="true">
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <h2 id={`tk-${g.id}`} className="syne m-0 text-[clamp(26px,2.6vw,40px)] tracking-[-.02em]">
                  <T t={g.label} />
                </h2>
                <p className="m-0 mt-3 max-w-[34ch] text-[16px] leading-[1.6] text-gedempt">
                  <T t={g.uitleg} />
                </p>
              </header>
              <ol className="tk-lijst m-0 list-none p-0">
                {delen.map((o, i) => (
                  <li key={o.naam} className="tk-rij-item" data-zie style={{ "--i": i } as CSSProperties}>
                    <span className="tk-naam syne">{o.naam}</span>
                    <span className="tk-meta">
                      <span className="lbl text-gedempt">
                        <T t={o.soort} />
                      </span>
                      <span className="tk-wat">
                        <T t={o.wat} />
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )
        })}
      </div>

      <Verder voor={{ nl: "En hoe het", en: "And how it" }} nadruk={{ nl: "eruitziet", en: "looks" }} na="?" href="/merk" label={{ nl: "Naar het merk", en: "To the brand" }} />
    </>
  )
}

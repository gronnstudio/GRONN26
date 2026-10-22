import type { CSSProperties } from "react"
import { WERKWIJZE, WERKWIJZE_KOP } from "@/lib/data/teksten"
import { Beide, T } from "@/components/taal"

// WF-059 (Uncode "Creative Freelance"): de zes stappen als raster van 3×2,
// per kolom 200 ms na elkaar opkomend. Volgt het thema.
export function Werkwijze() {
  return (
    <section className="vp-blok" aria-labelledby="h-stappen" id="werkwijze">
      <div className="vp-inhoud">
        <h2 className="lbl vp-zes-kop" id="h-stappen">
          <Beide nl={`${WERKWIJZE_KOP.nl} · ${WERKWIJZE.length} stappen`} en={`${WERKWIJZE_KOP.en} · ${WERKWIJZE.length} steps`} />
        </h2>
        <ol className="vp-zes">
          {WERKWIJZE.map((s, n) => (
            <li key={n} className="vp-alpha" data-zie style={{ "--i": n % 3 } as CSSProperties}>
              <span className="lbl">{String(n + 1).padStart(2, "0")}</span>
              <h3 className="syne"><T t={s.titel} /></h3>
              <p><T t={s.tekst} /></p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

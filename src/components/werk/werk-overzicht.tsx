import { ViewTransition, type CSSProperties } from "react"
import Link from "next/link"
import { T } from "@/components/taal"
import { Doorkijk } from "./delen"
import { WERK } from "./projecten"

// WF-012: het werk als lijst, groot en beeldend in de taal van de collage op
// de voorpagina (foto's die meebewegen, blokken die zacht opkomen). De keuze
// lijst/raster is weg (11 okt 2026): met twee projecten voegde hij niets toe;
// hij kan terug als er een stuk of zes zijn.
// Een klik wisselt zonder doek (data-morph): de foto groeit door naar de
// grote foto bovenaan de projectpagina (View Transition met dezelfde naam).

const volg = (n: number) => ({ "--i": n }) as CSSProperties

export function WerkOverzicht() {
  return (
    <div className="pt-[clamp(56px,7vw,112px)]">
      <div className="w-kopregel">
        <h2 className="lbl m-0"><T t={{ nl: "Alle projecten", en: "All projects" }} /></h2>
      </div>

      <ul className="m-0 list-none p-0">
        {WERK.map((p, i) => (
          <li key={p.href} className="border-b border-lijn first:border-t" data-zie style={volg(i)}>
            <Link
              href={p.href}
              data-morph
              className="group grid grid-cols-1 items-center gap-x-8 gap-y-5 py-[clamp(24px,3vw,40px)] no-underline md:grid-cols-12"
            >
              <span className="flex flex-col gap-4 md:col-span-7">
                <span className="lbl flex gap-4 tabular-nums text-gedempt">
                  <span>{p.jaar}</span>
                  <span>{p.code}</span>
                </span>
                <span className="syne text-[clamp(32px,4.4vw,64px)] leading-[1.02] tracking-[-.035em] [overflow-wrap:anywhere]">
                  <span className="w-lijnlink"><T t={p.titel} /></span>
                </span>
                <span className="lbl text-gedempt">
                  <T t={p.type} /> · {p.plaats !== "—" ? `${p.plaats} · ` : ""}
                  <T t={p.status} />
                </span>
              </span>
              <ViewTransition name={p.morph} share="morph" default="none">
                <Doorkijk
                  foto={p.foto}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="order-first aspect-[4/3] w-full md:order-none md:col-span-5"
                  eigen={false}
                />
              </ViewTransition>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

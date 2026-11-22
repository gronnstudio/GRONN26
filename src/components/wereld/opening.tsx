import { ViewTransition, type ReactNode } from "react"
import { Foto } from "@/components/foto"
import { Beide, T, type Tekst } from "@/components/taal"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { Kruimelpad } from "@/components/kruimelpad"
import { Beeld } from "@/components/landschap/beeld"
import type { Beeld as BeeldData } from "@/components/landschap/beelden"

/**
 * De opening van elke pagina behalve de voorpagina, in de taal van de
 * bouwbrief "Van landschap naar detail" (21 nov 2026): op het raster het
 * kruimelpad, een kop in de displaymaat van de voorpagina, rechts één zin, en
 * daaronder eventueel een groot beeld in een kader met 6px hoeken. `titel`
 * is de h1 van de pagina; regeleinden in de titel worden spaties, de kop
 * breekt zelf evenwichtig af.
 */
export function Opening({
  label,
  titel,
  zin,
  foto,
  beeld: sfeerbeeld,
  morph,
  children,
}: {
  label: Tekst
  titel: Tekst
  zin?: ReactNode
  foto?: FotoData
  /** Een beeld met soort: sfeer- en AI-beelden krijgen zo hun zichtbare label. */
  beeld?: BeeldData
  /** Naam van de View Transition: de foto groeit hierheen vanuit de lijst op Werk. */
  morph?: string
  children?: ReactNode
}) {
  const vlak = (t: string) => t.replace(/\n/g, " ")
  const beeld = foto ? (
    <Foto foto={foto} priority sizes="(min-width: 1344px) 1280px, 100vw" className="w-beeld" />
  ) : sfeerbeeld ? (
    <Beeld beeld={sfeerbeeld} priority sizes="(min-width: 1344px) 1280px, 100vw" className="w-beeld" />
  ) : null
  return (
    <section className="ls ls-opening" aria-labelledby="pagina-titel" data-opening>
      <div className="ls-raster ls-opening-tekst">
        <div className="ls-opening-links">
          {/* één regel boven de kop: het kruimelpad, of het label waar geen pad is */}
          <div className="ls-label ls-opening-label">
            <Kruimelpad anders={<p className="w-label"><T t={label} /></p>} />
          </div>
          <h1 id="pagina-titel" className="ls-display ls-opening-kop" tabIndex={-1}>
            {typeof titel === "string" ? vlak(titel) : <Beide nl={vlak(titel.nl)} en={vlak(titel.en)} />}
          </h1>
        </div>
        {zin ? <p className="ls-body ls-opening-zin">{zin}</p> : null}
      </div>
      {children ? <div className="ls-raster ls-opening-extra">{children}</div> : null}
      {beeld ? (
        <div className="ls-raster">
          <div className="w-groei ls-opening-beeld">
            {morph ? (
              <ViewTransition name={morph} share="morph" default="none">
                {beeld}
              </ViewTransition>
            ) : (
              beeld
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

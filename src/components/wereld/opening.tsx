import { ViewTransition, type CSSProperties, type ReactNode } from "react"
import { Foto } from "@/components/foto"
import { Beide, T, type Tekst } from "@/components/taal"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { HANGERS, Plant } from "@/components/plant"
import { Kruimelpad } from "@/components/kruimelpad"

/**
 * De opening van elke pagina (behalve de voorpagina, die zijn eigen WF-058
 * heeft): in de kleur van het thema, een label, een reuzenkop die regel voor regel omhoog komt,
 * één zin, en eventueel een foto die groeit terwijl je scrolt. De sitekop
 * ligt eroverheen. `titel` is de h1 van de pagina.
 */
export function Opening({
  label,
  titel,
  zin,
  foto,
  zij,
  morph,
  rimpel,
  children,
}: {
  label: Tekst
  titel: Tekst
  zin?: ReactNode
  foto?: FotoData
  /** Twee korte woorden voor de verticale labels in de marge (vanaf 1100px). */
  zij?: [Tekst, Tekst]
  /** Naam van de View Transition: de foto groeit hierheen vanuit de lijst op Werk. */
  morph?: string
  /** Rimpelend water op de foto (alleen een vijverfoto). */
  rimpel?: boolean
  children?: ReactNode
}) {
  const regels = (t: string) =>
    t.split("\n").map((r, n) => (
      <span key={n} className="w-r">
        <span className="w-w" style={{ "--i": n } as CSSProperties}>
          {r}
        </span>
      </span>
    ))
  // Elke pagina zijn eigen hangende tak, vast gekozen uit de titel.
  const sleutel = typeof titel === "string" ? titel : titel.nl
  const hanger = HANGERS[[...sleutel].reduce((s, c) => s + c.charCodeAt(0), 0) % HANGERS.length]
  return (
    <section className="w-opening" aria-labelledby="pagina-titel" data-opening>
      <Plant naam={hanger} className="plant-hang" />
      <Kruimelpad />
      <p className="lbl w-label"><T t={label} /></p>
      <h1 id="pagina-titel" className="w-reus" tabIndex={-1} aria-label={typeof titel === "string" ? titel.replace(/\n/g, " ") : undefined}>
        {typeof titel === "string" ? regels(titel) : <Beide nl={regels(titel.nl)} en={regels(titel.en)} />}
      </h1>
      {zin ? <p className="w-zin">{zin}</p> : null}
      {children}
      {foto ? (
        <div className="w-groei" data-groei>
          {morph ? (
            <ViewTransition name={morph} share="morph" default="none">
              <Foto foto={foto} priority sizes="100vw" className="w-beeld" rimpel={rimpel} />
            </ViewTransition>
          ) : (
            <Foto foto={foto} priority sizes="100vw" className="w-beeld" rimpel={rimpel} />
          )}
        </div>
      ) : null}
      {zij ? (
        <>
          <p className="w-zij links" data-zij aria-hidden="true">
            <T t={zij[0]} />
          </p>
          <p className="w-zij rechts" data-zij aria-hidden="true">
            <T t={zij[1]} />
          </p>
        </>
      ) : null}
    </section>
  )
}

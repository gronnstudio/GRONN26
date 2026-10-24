import { ViewTransition, type ReactNode } from "react"
import { Foto } from "@/components/foto"
import { Beide, T, type Tekst } from "@/components/taal"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { Kruimelpad } from "@/components/kruimelpad"

/**
 * De opening van elke pagina (behalve de voorpagina, die zijn eigen WF-058
 * heeft): in de kleur van het thema, een label, een reuzenkop, één zin en
 * eventueel een grote foto. `titel` is de h1 van de pagina.
 */
export function Opening({
  label,
  titel,
  zin,
  foto,
  morph,
  children,
}: {
  label: Tekst
  titel: Tekst
  zin?: ReactNode
  foto?: FotoData
  /** Naam van de View Transition: de foto groeit hierheen vanuit de lijst op Werk. */
  morph?: string
  children?: ReactNode
}) {
  const regels = (t: string) =>
    t.split("\n").map((r, n) => (
      <span key={n} className="w-r">
        {r}
      </span>
    ))
  return (
    <section className="w-opening" aria-labelledby="pagina-titel" data-opening>
      <Kruimelpad />
      <p className="lbl w-label"><T t={label} /></p>
      <h1 id="pagina-titel" className="w-reus" tabIndex={-1} aria-label={typeof titel === "string" ? titel.replace(/\n/g, " ") : undefined}>
        {typeof titel === "string" ? regels(titel) : <Beide nl={regels(titel.nl)} en={regels(titel.en)} />}
      </h1>
      {zin ? <p className="w-zin">{zin}</p> : null}
      {children}
      {foto ? (
        <div className="w-groei">
          {morph ? (
            <ViewTransition name={morph} share="morph" default="none">
              <Foto foto={foto} priority sizes="100vw" className="w-beeld" />
            </ViewTransition>
          ) : (
            <Foto foto={foto} priority sizes="100vw" className="w-beeld" />
          )}
        </div>
      ) : null}
    </section>
  )
}

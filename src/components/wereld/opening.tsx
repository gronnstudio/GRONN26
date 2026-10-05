import type { CSSProperties, ReactNode } from "react"
import { Foto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"

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
  children,
}: {
  label: string
  titel: string
  zin?: ReactNode
  foto?: FotoData
  /** Twee korte woorden voor de verticale labels in de marge (vanaf 1100px). */
  zij?: [string, string]
  children?: ReactNode
}) {
  const regels = titel.split("\n")
  return (
    <section className="w-opening" aria-labelledby="pagina-titel" data-opening>
      <p className="lbl w-label">{label}</p>
      <h1 id="pagina-titel" className="w-reus" tabIndex={-1} aria-label={titel.replace(/\n/g, " ")}>
        {regels.map((r, n) => (
          <span key={n} className="w-r">
            <span className="w-w" style={{ "--i": n } as CSSProperties}>
              {r}
            </span>
          </span>
        ))}
      </h1>
      {zin ? <p className="w-zin">{zin}</p> : null}
      {children}
      {foto ? (
        <div className="w-groei" data-groei>
          <Foto foto={foto} priority sizes="100vw" className="w-beeld" />
        </div>
      ) : null}
      {zij ? (
        <>
          <p className="w-zij links" data-zij aria-hidden="true">
            {zij[0]}
          </p>
          <p className="w-zij rechts" data-zij aria-hidden="true">
            {zij[1]}
          </p>
        </>
      ) : null}
    </section>
  )
}

import type { ReactNode } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { T, type Tekst } from "@/components/taal"

// De bouwstenen van het ontwerpsysteem (9 nov 2026). Opmaak in ontwerp.css,
// uitleg in docs/design/components.md. Alles server components.

/** "01 — Studio" op een haarlijn: begint elke sectie, zodat de pagina leest als een tekening met genummerde bladen. */
export function Markering({ nr, naam, className = "" }: { nr: string; naam: Tekst; className?: string }) {
  return (
    <p className={`markering meta m-0 ${className}`}>
      <span className="markering-nr">{nr}</span>
      <span aria-hidden>—</span>
      <span><T t={naam} /></span>
    </p>
  )
}

/** Een maatlijn |←— label —→|. Alleen met een echte maat of hoeveelheid erin, nooit als versiering. */
export function Maatlijn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`maatlijn meta m-0 ${className}`}>
      <i aria-hidden /><b aria-hidden /><span>{children}</span><b aria-hidden /><i aria-hidden />
    </p>
  )
}

/** Een foto met code en bijschrift eronder, in mono. De vorm (aspect) komt van de ouder via `vorm`. */
export function Figuur({
  foto,
  code,
  bijschrift,
  vorm = "aspect-[4/5]",
  sizes,
  priority,
  className = "",
  beeldKlasse = "",
}: {
  foto: FotoData
  code?: string
  bijschrift?: Tekst
  vorm?: string
  sizes: string
  priority?: boolean
  className?: string
  beeldKlasse?: string
}) {
  return (
    <figure className={`figuur ${className}`}>
      <Foto foto={foto} sizes={sizes} priority={priority} className={`${vorm} ${beeldKlasse}`} />
      {code || bijschrift ? (
        <figcaption>
          {bijschrift ? <span className="bijschrift"><T t={bijschrift} /></span> : <span />}
          {code ? <span className="meta">{code}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}

/** Een kop in regels die bij binnenkomst één voor één omhoog komen. Alleen voor de opening van een pagina. */
export function Regels({ regels }: { regels: Tekst[] }) {
  return (
    <>
      {regels.map((r, i) => (
        <span key={i} className="regel" style={{ "--i": i } as React.CSSProperties}>
          <span><T t={r} /></span>
        </span>
      ))}
    </>
  )
}

/** Een tekstlink met een lijn eronder die bij aanwijzen wegtrekt, en een pijl die meeschuift. */
export function LijnLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`lijnlink ${className}`}>
      <span>{children}</span>
      <span className="pijl" aria-hidden>→</span>
    </Link>
  )
}

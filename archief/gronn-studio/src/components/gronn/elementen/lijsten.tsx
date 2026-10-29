import type { ReactNode } from "react"

/** Een opsomming: een oranje streepje (wat je krijgt, `teken="◆"`) of — (wat je niet krijgt). */
export function Opsomming({ items, teken = "◆" }: { items: ReactNode[]; teken?: "◆" | "—" }) {
  return (
    <ul data-element="Opsomming" className="grid gap-3">
      {items.map((x, i) => (
        <li key={i} className={`flex gap-3 text-[16px] leading-relaxed ${teken === "—" ? "text-foreground/80" : ""}`}>
          {teken === "◆" ? (
            <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-[var(--ember-text)]" />
          ) : (
            <span aria-hidden className="mt-[2px] shrink-0 text-muted">{teken}</span>
          )}
          <span>{x}</span>
        </li>
      ))}
    </ul>
  )
}

/** Een genummerde lijst met grote regels (uitgangspunten, stappen). */
export function NummerLijst({ items }: { items: ReactNode[] }) {
  return (
    <ol data-element="NummerLijst" className="grid border-t border-line/15">
      {items.map((x, i) => (
        <li key={i} className="g-in grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-b border-line/15 py-6 sm:grid-cols-[6rem_1fr]">
          <span className="font-mono text-[12px] text-[var(--ember-text)]">{String(i + 1).padStart(2, "0")}</span>
          <span className="tekst-h3">{x}</span>
        </li>
      ))}
    </ol>
  )
}

/** Drie korte kolommen met nummer, kop en tekst (bijv. "voor wie"). */
export function Kolommen({ items }: { items: { kop: ReactNode; tekst: ReactNode }[] }) {
  return (
    <ul data-element="Kolommen" className="grid gap-10 md:grid-cols-3 md:gap-8">
      {items.map((v, i) => (
        <li key={i} className="g-in">
          <p className="tekst-annotatie text-[var(--ember-text)]">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="tekst-h3 mt-3">{v.kop}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">{v.tekst}</p>
        </li>
      ))}
    </ul>
  )
}

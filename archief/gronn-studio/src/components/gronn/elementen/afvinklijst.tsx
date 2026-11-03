import type { ReactNode } from "react"

/**
 * Een lijst om af te vinken, op scherm en op papier: een leeg vierkantje
 * (4px hoek: een vinkvak is geen knop), de vraag vet, een uitleg eronder
 * en optioneel een regel die alleen op het scherm staat (`bron`, voor de
 * conceptversie). Het vakje is versiering (`aria-hidden`): wie voorleest,
 * hoort gewoon de lijst.
 */
export function Afvinklijst({
  items,
}: {
  items: { tekst: ReactNode; uitleg?: ReactNode; bron?: ReactNode }[]
}) {
  return (
    <ul data-element="Afvinklijst" className="grid border-t border-line/15">
      {items.map((p, i) => (
        <li key={i} data-punt="" className="grid grid-cols-[20px_minmax(0,1fr)] gap-4 border-b border-line/15 py-5 break-inside-avoid">
          <span aria-hidden className="mt-[3px] size-[20px] rounded-[4px] border-[1.5px] border-foreground/70" />
          <div>
            <p className="text-[17px] leading-snug font-semibold">{p.tekst}</p>
            {p.uitleg && <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-foreground/80">{p.uitleg}</p>}
            {p.bron && (
              <p data-print="hide" className="mt-2 text-[12px] leading-relaxed text-muted">
                {p.bron}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

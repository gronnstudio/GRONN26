import type { ReactNode } from "react"

/**
 * Qi's "stacked item scroll" in CSS: elke kaart plakt iets lager dan de
 * vorige, zodat ze bij het scrollen over elkaar schuiven. Geen script;
 * zonder `position: sticky` is het gewoon een lijst.
 */
export function Stapel({ items, boven = 96 }: { items: { titel: ReactNode; tekst: ReactNode }[]; boven?: number }) {
  return (
    <ol data-element="Stapel" className="grid gap-5 pb-[8vh]">
      {items.map((s, i) => (
        <li
          key={i}
          className="sticky rounded-[16px] border border-line/10 bg-surface p-6 shadow-[0_-20px_40px_-32px_rgb(0_0_0/0.45)] sm:p-10"
          style={{ top: `${boven + i * 14}px` }}
        >
          <div className="grid gap-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline">
            <span className="tekst-h1 text-gronn-green dark:text-gronn-light">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="tekst-h3">{s.titel}</h3>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-foreground/75 sm:text-lg">{s.tekst}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

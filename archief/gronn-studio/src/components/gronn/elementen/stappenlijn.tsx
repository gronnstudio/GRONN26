import type { ReactNode } from "react"

/**
 * Qi's "process / timeline" in CSS: genummerde stappen aan één dunne
 * verticale lijn die zich vult terwijl je leest. De lijn is `::before`
 * (het spoor) en `::after` (de vulling) op de `<ol>`; de vulling en de
 * kleur van elk nummer lopen op `animation-timeline: view()` — zie
 * "Stappenlijn" in globals.css. Geen script.
 *
 * De rust is de eindstand: zonder ondersteuning of bij minder beweging
 * staat de lijn helemaal getekend en is elk nummer oranje (`--ember-text`).
 * De lijn staat 24px van de rand, alles in px, zodat hij bij grotere
 * tekst niet van de nummers wegloopt.
 */
export function Stappenlijn({ items }: { items: ReactNode[] }) {
  return (
    <ol data-element="Stappenlijn" className="g-stappenlijn relative grid" data-stappenlijn>
      {items.map((x, i) => (
        // Het nummervak is precies één kopregel hoog (30/34px, tekst-h3),
        // zodat zijn midden — waar de lijn doorloopt — vastligt: 20 + 15
        // of 20 + 17px vanaf de bovenkant van elke stap (zie globals.css).
        <li key={i} className="grid grid-cols-[48px_minmax(0,1fr)] items-start gap-x-[16px] py-[20px] sm:gap-x-[24px]">
          <span className="g-stap-nummer inline-flex h-[30px] items-center justify-self-center bg-background px-[4px] font-mono text-[12px] leading-[18px] md:h-[34px]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="tekst-h3">{x}</span>
        </li>
      ))}
    </ol>
  )
}

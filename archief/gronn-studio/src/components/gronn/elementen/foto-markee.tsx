import Image from "next/image"

import { pick, type L, type Locale } from "@/lib/i18n"

export type MarkeeFoto = { src: string; alt: L; width: number; height: number }

/**
 * Een markee: rijen foto's die rustig en eindeloos doorlopen, om en om
 * in tegengestelde richting (eigenaar, 24 sep 2026: "Maak een markee met
 * twee tegenstrijdig lopende foto carousels").
 *
 * Pure CSS (`g-markee` in globals.css, bij g-in/g-parallax): elke rij is
 * twee keer hetzelfde spoor achter elkaar en schuift −50 % in 90 s; de
 * tweede rij loopt achteruit. De tweede kopie is `aria-hidden` met lege
 * alts, zodat een schermlezer elke foto één keer hoort. Stil onder de
 * muis en bij toetsenbordfocus (de rij is focusbaar); een tik op de
 * telefoon zet hem niet stil.
 *
 * Minder beweging (systeem of `data-motion="reduced"`): geen beweging,
 * geen kopie, en elke rij is een gewone strook die opzij scrollt — elke
 * foto blijft bereikbaar. Dat is ook de toestand zonder de poort: de
 * beweging komt er alleen bij, nooit andersom.
 *
 * Maten in px (tegels 160 hoog, vanaf md 220 — eigenaar 24 sep 2026: "kleiner"; breedte volgt de foto),
 * hoeken 16px zoals elke foto. De wrapper knipt af: geen horizontale
 * pagina-overloop.
 */
export function FotoMarkee({
  rijen,
  label,
  locale,
  className = "",
}: {
  rijen: MarkeeFoto[][]
  /** De toegankelijke naam van het gebied. */
  label: L
  locale: Locale
  className?: string
}) {
  const t = (v: L) => pick(v, locale)
  const naam = t(label)
  return (
    <div data-element="FotoMarkee" role="region" aria-label={naam} data-markee className={`g-markee grid gap-[12px] overflow-hidden md:gap-[16px] ${className}`}>
      {rijen.map((rij, r) => (
        <div
          key={r}
          data-markee-rij={r % 2 === 0 ? "links" : "rechts"}
          tabIndex={0}
          role="group"
          aria-label={`${naam} (${r + 1}/${rijen.length})`}
          className="g-markee-rij focus-visible:outline-offset-[-2px]"
        >
          <div className="g-markee-spoor">
            {[false, true].map((kopie) => (
              <ul
                key={String(kopie)}
                role="list"
                aria-hidden={kopie || undefined}
                data-markee-kopie={kopie ? "" : undefined}
                className="g-markee-kopie flex gap-[12px] pr-[12px] md:gap-[16px] md:pr-[16px]"
              >
                {/* Elke kopie draagt de rij twee keer: met kleine tegels is
                    één rij smaller dan een breed scherm, en dan zou de lus
                    een gat laten. De herhaling is decoratief (aria-hidden)
                    en staat er alleen als de markee beweegt. */}
                {[false, true].flatMap((herhaal) =>
                  rij.map((f) => (
                    <li
                      key={`${f.src}-${herhaal}`}
                      aria-hidden={herhaal || undefined}
                      className={`shrink-0 overflow-hidden rounded-[16px] bg-surface ${herhaal ? "g-markee-herhaal" : ""}`}
                    >
                      <Image
                        src={f.src}
                        alt={kopie || herhaal ? "" : t(f.alt)}
                        width={f.width}
                        height={f.height}
                        sizes="(min-width: 768px) 165px, 120px"
                        loading="lazy"
                        draggable={false}
                        className="block h-[160px] w-auto md:h-[220px]"
                      />
                    </li>
                  )),
                )}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

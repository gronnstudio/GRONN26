"use client"

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

import { eenmaalInBeeld } from "./in-beeld"

/**
 * Een kop die regel voor regel uit een masker omhoog schuift — de
 * "tekst"-helft van "Tekst en beeld" van de oude site (eigenaar, 23 sep
 * 2026: "Kunnen we ook de animaties van de oude site in de nieuwe
 * verwerken?"). Afgeleid van `motion/reveal-text.tsx`, met dezelfde maat
 * (110 %+, 0,8 s, out-expo), maar gedragen door CSS in plaats van
 * framer-motion. Waarom:
 *
 * - `direct` (boven de vouw) speelt als pure CSS vanaf de eerste verf.
 *   framer-motion rendert de kop op de server verborgen en kan hem pas na
 *   de hydratie tonen — op een trage telefoon seconden aan LCP (zie de
 *   hero-noot in globals.css).
 * - Verder op de pagina staat de kop alleen verborgen onder
 *   `(scripting: enabled)` en zonder minder-beweging; zonder JS of met
 *   `data-motion="reduced"` staat hij er gewoon, zonder dat hier iets
 *   hoeft te rekenen.
 *
 * Toegankelijkheid: de kop blijft een echte h1/h2. Bij een tekst als
 * kind draagt hij die zin als `aria-label` en zijn de losse woorden
 * `aria-hidden`, zodat een schermlezer de zin één keer leest en niet per
 * woord. `textContent` blijft de hele zin (woorden met spaties ertussen).
 *
 * Regel voor regel: bij `direct` zijn de regels nog niet te meten (er
 * draait nog geen JS), dus daar golft het per woord. Verderop meet de
 * trekker welke woorden op één regel staan en schuift per regel.
 */
export function Kop({
  as: Tag = "h2",
  id,
  lang,
  className = "",
  direct = false,
  children,
}: {
  as?: "h1" | "h2"
  id?: string
  lang?: string
  className?: string
  /** Boven de vouw: speelt meteen bij het laden, zonder op JS te wachten. */
  direct?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [regels, setRegels] = useState<number[] | null>(null)

  useEffect(() => {
    const el = ref.current
    if (direct || !el) return
    return eenmaalInBeeld(el, () => {
      const toppen: number[] = []
      setRegels(
        [...el.querySelectorAll<HTMLElement>(".g-regel-masker")].map((m) => {
          const top = Math.round(m.getBoundingClientRect().top)
          let r = toppen.findIndex((t) => Math.abs(t - top) <= 2)
          if (r < 0) r = toppen.push(top) - 1
          return r
        })
      )
    })
  }, [direct])

  const tekst = typeof children === "string" ? children : null
  // Alleen gewone spaties: een harde spatie in de tekst blijft binnen zijn woord.
  const woorden = tekst ? tekst.split(/ +/).filter(Boolean) : null
  const stand = direct ? "laden" : regels ? "nu" : "wacht"

  return (
    <Tag ref={ref} id={id} lang={lang} className={className} data-regels={stand} aria-label={tekst ?? undefined}>
      {woorden ? (
        <span aria-hidden="true">
          {woorden.map((w, i) => (
            <Fragment key={i}>
              {i > 0 && " "}
              <span className="g-regel-masker">
                <span className="g-regel" style={{ "--w": i, "--r": regels?.[i] ?? 0 } as CSSProperties}>
                  {w}
                </span>
              </span>
            </Fragment>
          ))}
        </span>
      ) : (
        <span className="g-regel-masker">
          <span className="g-regel">{children}</span>
        </span>
      )}
    </Tag>
  )
}

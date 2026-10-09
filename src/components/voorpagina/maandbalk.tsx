"use client"

import Link from "next/link"
import { useState, useSyncExternalStore } from "react"
import { MAANDEN } from "@/lib/data/maanden"
import { Beide, T } from "@/components/taal"

// "Nu in de maand" (eigenaar, 9 okt 2026, naar chrisjanssenstein.com): twaalf
// maanden, de huidige gemarkeerd, en per maand een tip voor vijver en tuin.
// Klik een andere maand en de tips wisselen mee. De huidige maand komt van de
// klok van de bezoeker; op de server is die onbekend (-1), dus de pagina blijft
// statisch en de markering verschijnt bij het laden.
const geen = () => () => {}
const nu = () => new Date().getMonth()
const server = () => -1

export function Maandbalk() {
  const huidig = useSyncExternalStore(geen, nu, server)
  const [gekozen, kies] = useState<number | null>(null)
  const actief = gekozen ?? huidig
  const maand = MAANDEN[actief]

  return (
    <section className="vp-maand" aria-labelledby="h-maand">
      <div className="vp-inhoud">
        <h2 className="lbl" id="h-maand">
          <Beide nl="Nu in de maand" en="This month" />
        </h2>
        <div className="vp-maand-rij" role="group" aria-labelledby="h-maand">
          {MAANDEN.map((m, n) => (
            <button
              key={n}
              type="button"
              className="vp-maand-knop"
              aria-pressed={n === actief}
              data-nu={n === huidig || undefined}
              onClick={() => kies(n)}
            >
              <T t={m.kort} />
            </button>
          ))}
        </div>
        <div className="vp-maand-tips" aria-live="polite">
          {maand ? (
            <>
              <p className="vp-maand-naam syne">
                <T t={maand.naam} />
                {actief !== huidig ? null : <span className="lbl"> · <Beide nl="nu" en="now" /></span>}
              </p>
              {([["Vijver", "Pond", "vijvers", "ponds", maand.vijver], ["Tuin", "Garden", "tuinen", "gardens", maand.tuin]] as const).map(([nl, en, nlMv, enMv, tip]) => (
                <p key={nl} className="vp-maand-tip">
                  <span className="lbl"><Beide nl={nl} en={en} /></span>
                  <span><T t={tip.tekst} /></span>
                  <Link className="lnk" href={tip.href}>
                    <Beide nl={`Meer over ${nlMv} →`} en={`More on ${enMv} →`} />
                  </Link>
                </p>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

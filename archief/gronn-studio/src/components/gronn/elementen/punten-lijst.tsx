"use client"

import { useState, useSyncExternalStore } from "react"

/**
 * Genummerde punten in groepen, doorlopend genummerd (01, 02 … over alle
 * groepen heen), zoals een veldformulier: per groep een kleine mono-kop
 * met het bereik ("01–05") en een haarlijn, per punt een mono-nummer en
 * de tekst, met een haarlijn eronder.
 *
 * Nick, 29 sep 2026: "zet hier een lijst van 21 punten ipv maar 4, kleed
 * dat leuk aan". De inhoud komt altijd uit de data van de pagina die het
 * geheel toont (bij de checklist: `checklist()` in checklist-lijst.ts),
 * nooit overgetikt — dan kan de lijst niet uit de pas lopen.
 *
 * Twee kolommen zodra de lijst zelf er ruimte voor heeft (container
 * query, 560px), niet op schermbreedte: de groepen liggen dan twee aan
 * twee, met de koppen van een paar op één hoogte (rijen van het raster).
 * In een smalle kolom blijft het één kolom. Elk punt schuift in via `g-in` (view());
 * bij minder beweging of zonder ondersteuning staat alles gewoon stil.
 * Geen oranje: de compositie eromheen heeft haar ene accent al.
 *
 * Op de telefoon (onder sm, 640px) klapt elke groep in, de eerste staat
 * open (eigenaar, 3 okt 2026: "Maak dit ook inklapbaar want op mobiel erg
 * langdradig zo"). De kop is dan een knop met `aria-expanded` en een rond
 * plusje dat een kruis wordt, net als `Vraag`. Vanaf sm staat alles open en
 * is de kop gewoon een kop: het inklappen zit in `max-sm:hidden`, dus ook
 * vóór de hydratie klapt op een breed scherm niets dicht.
 */
export type PuntenGroep = { id: string; kop: string; punten: string[] }

const nummer = (n: number, cijfers: number) => String(n).padStart(cijfers, "0")

const BREED = "(min-width: 640px)"
function abonneer(melden: () => void) {
  const mql = window.matchMedia(BREED)
  mql.addEventListener("change", melden)
  return () => mql.removeEventListener("change", melden)
}

export function PuntenLijst({ groepen }: { groepen: PuntenGroep[] }) {
  const breed = useSyncExternalStore(abonneer, () => window.matchMedia(BREED).matches, () => false)
  const [open, zetOpen] = useState<Record<string, boolean>>(() => (groepen[0] ? { [groepen[0].id]: true } : {}))
  const totaal = groepen.reduce((n, g) => n + g.punten.length, 0)
  const cijfers = Math.max(2, String(totaal).length)
  // De eerste nummer per groep, vooraf: render blijft zonder bijwerkingen.
  const starts = groepen.map((_, i) => groepen.slice(0, i).reduce((n, g) => n + g.punten.length, 0) + 1)

  return (
    <div data-element="PuntenLijst" className="@container">
      <div className="grid gap-[32px] @min-[560px]:grid-cols-2 @min-[560px]:gap-x-[32px] @min-[800px]:gap-x-[64px] @min-[800px]:gap-y-[40px]">
        {groepen.map((g, gi) => {
          const eerste = starts[gi]
          const laatste = eerste + g.punten.length - 1
          const isOpen = breed || !!open[g.id]
          const bereik = g.punten.length > 1 ? `${nummer(eerste, cijfers)}–${nummer(laatste, cijfers)}` : nummer(eerste, cijfers)
          const regel = "tekst-annotatie flex w-full items-center justify-between gap-[12px] border-b border-line/25 pb-[8px] text-left text-muted"
          return (
            <div key={g.id} data-puntengroep={g.id} data-open={isOpen ? "" : undefined}>
              <h3 id={`${g.id}-punten`}>
                {breed ? (
                  <span className={regel}>
                    <span>{g.kop}</span>
                    <span aria-hidden className="shrink-0 tabular-nums">{bereik}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${g.id}-lijst`}
                    onClick={() => zetOpen((o) => ({ ...o, [g.id]: !isOpen }))}
                    className={`${regel} min-h-[44px] cursor-pointer pt-[8px] outline-offset-4`}
                  >
                    <span>{g.kop}</span>
                    <span className="flex shrink-0 items-center gap-[12px]">
                      <span aria-hidden className="tabular-nums">{bereik}</span>
                      <span
                        aria-hidden
                        className={`flex size-[28px] items-center justify-center rounded-full border border-line/25 font-sans text-[16px] leading-none text-foreground/70 motion-safe:transition-transform ${isOpen ? "rotate-45" : ""}`}
                      >
                        +
                      </span>
                    </span>
                  </button>
                )}
              </h3>
              <ol id={`${g.id}-lijst`} start={eerste} aria-labelledby={`${g.id}-punten`} className={`grid ${isOpen ? "" : "max-sm:hidden"}`}>
                {g.punten.map((p, pi) => (
                  <li
                    key={pi}
                    data-punt-nr={nummer(eerste + pi, cijfers)}
                    className="g-in grid grid-cols-[28px_minmax(0,1fr)] items-baseline gap-[8px] border-b border-line/10 py-[10px] text-[15px] leading-[22px]"
                  >
                    <span data-punt-nummer="" className="font-mono text-[12px] leading-[18px] tabular-nums text-muted">
                      {nummer(eerste + pi, cijfers)}
                    </span>
                    <span data-punt-tekst="">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>
    </div>
  )
}

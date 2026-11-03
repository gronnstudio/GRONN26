import type { BegripData } from "./begrip"
import { metBegrippen } from "./begrip-tekst"
import { TelOp } from "./tel-op"
import { gedempt, lijn, accentTekst, type Toon } from "./toon"

export type CijferData = { waarde: string; eenheid?: string; label: string }

/** Eén getal met eenheid en onderschrift, met een lijn erboven. Het getal
 * telt op als het in beeld komt (`TelOp`); de server-HTML draagt de echte waarde. */
export function Cijfer({ waarde, eenheid, label, toon = "grond", groot = false }: CijferData & { toon?: Toon; groot?: boolean }) {
  return (
    // Kolom met het getal onderaan (mt-auto): labels breken op 1, 2 of 3
    // regels af, en zonder dit stond elk getal op een andere hoogte
    // (eigenaar, 23 sep 2026: "nummers zitten niet op de zelfde hoogte").
    // De grid rekt de cellen van één rij even hoog, dus de getallen
    // delen één lijn.
    <div className={`flex flex-col border-t pt-3 ${lijn(toon)}`}>
      <dt className={`tekst-annotatie ${gedempt(toon)}`}>{label}</dt>
      <dd className={`mt-auto pt-3 font-heading leading-none ${groot ? "text-[clamp(2.6rem,5.6vw,5rem)] tracking-tight" : "text-[30px]"}`}>
        <TelOp waarde={waarde} />
        {eenheid && <span className={`ml-1 align-top text-[0.4em] tracking-normal ${accentTekst(toon)}`}>{eenheid}</span>}
      </dd>
    </div>
  )
}

/** Een rij getallen: 2 kolommen op de telefoon, `kolommen` op breed. */
export function CijferRij({
  cijfers,
  toon = "grond",
  groot = false,
  className = "",
}: {
  cijfers: CijferData[]
  toon?: Toon
  groot?: boolean
  className?: string
}) {
  return (
    <dl data-element="CijferRij" className={`grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 ${className}`}>
      {cijfers.map((c) => (
        <Cijfer key={c.label} {...c} toon={toon} groot={groot} />
      ))}
    </dl>
  )
}

/** Een lijst sleutel → waarde (bijv. "Het project in cijfers"). */
export function Feitenlijst({
  rijen,
  begrippen,
  className = "",
}: {
  rijen: [string, string][]
  /** De eerste vermelding van elk woord in de waarden wordt een `Begrip`. */
  begrippen?: BegripData[]
  className?: string
}) {
  const waarden = begrippen?.length ? metBegrippen(rijen.map(([, v]) => v), begrippen) : rijen.map(([, v]) => v)
  return (
    <dl data-element="Feitenlijst" className={`grid border-t border-line/15 sm:grid-cols-2 sm:gap-x-12 ${className}`}>
      {rijen.map(([k], i) => (
        <div key={k} className="grid gap-1 border-b border-line/15 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
          <dt className="pt-1 tekst-annotatie text-muted uppercase">{k}</dt>
          <dd className="text-sm sm:text-base">{waarden[i]}</dd>
        </div>
      ))}
    </dl>
  )
}

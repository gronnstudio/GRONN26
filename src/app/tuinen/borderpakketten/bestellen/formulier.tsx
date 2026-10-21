"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { T } from "@/components/taal"
import { BORDER_MATEN, BORDER_PRIJS, BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { priceLabel } from "@/lib/format"
import { bestel } from "./acties"

// Het bestelformulier: pakket, maat, opgestuurd of aangeplant, en waar het heen moet.
// Daarna door naar de betaalpagina van Mollie (iDEAL, Wero, Visa, Mastercard).

const veld = "block w-full min-w-0 rounded-[12px] border border-gedempt bg-veld px-4 py-3 text-[18px] text-inkt outline-none placeholder:text-voorbeeld focus:border-inkt focus:shadow-[0_0_0_1px_var(--inkt)]"
const chip = "inline-flex min-h-[var(--knop)] items-center rounded-full border border-gedempt px-3.5 py-2 text-[14px] leading-[1.3] peer-checked:border-inkt peer-checked:bg-inkt peer-checked:text-grond peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inkt"

function Kies({ naam, waarde, gekozen, onKies, children }: { naam: string; waarde: string; gekozen: boolean; onKies: () => void; children: React.ReactNode }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={naam} value={waarde} checked={gekozen} onChange={onKies} className="peer sr-only" />
      <span className={chip}>{children}</span>
    </label>
  )
}

function Invul({ label, naam, ...rest }: { label: string; naam: string; type?: string; autoComplete?: string; inputMode?: "text" | "email" | "tel" }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="lbl">{label}</span>
      <input name={naam} required className={veld} {...rest} />
    </label>
  )
}

export function BestelFormulier({ start }: { start: string }) {
  const [pakket, setPakket] = useState(start)
  const [maat, setMaat] = useState<number>(BORDER_MATEN[0])
  const [soort, setSoort] = useState<"opgestuurd" | "aangeplant">("opgestuurd")
  const [uitkomst, actie, bezig] = useActionState(bestel, {})
  const totaal = maat * BORDER_PRIJS[soort]
  return (
    <form action={actie} className="grid max-w-[720px] gap-8">
      <label className="flex flex-col gap-2">
        <span className="lbl"><T t={{ nl: "Pakket", en: "Package" }} /></span>
        <select name="pakket" value={pakket} onChange={(e) => setPakket(e.target.value)} className={veld}>
          {BORDERPAKKETTEN.map((p) => <option key={p.slug} value={p.slug}>{p.naam.nl}</option>)}
        </select>
      </label>

      <fieldset className="m-0 border-0 p-0">
        <legend className="lbl mb-3 p-0"><T t={{ nl: "Maat", en: "Size" }} /></legend>
        <div className="flex flex-wrap gap-2">
          {BORDER_MATEN.map((m) => <Kies key={m} naam="maat" waarde={String(m)} gekozen={maat === m} onKies={() => setMaat(m)}>{m} m²</Kies>)}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="lbl mb-3 p-0"><T t={{ nl: "Hoe", en: "How" }} /></legend>
        <div className="flex flex-wrap gap-2">
          <Kies naam="soort" waarde="opgestuurd" gekozen={soort === "opgestuurd"} onKies={() => setSoort("opgestuurd")}>
            <T t={{ nl: `Opgestuurd · ${priceLabel(maat * BORDER_PRIJS.opgestuurd)}`, en: `Shipped · ${priceLabel(maat * BORDER_PRIJS.opgestuurd)}` }} />
          </Kies>
          <Kies naam="soort" waarde="aangeplant" gekozen={soort === "aangeplant"} onKies={() => setSoort("aangeplant")}>
            <T t={{ nl: `Aangeplant · ${priceLabel(maat * BORDER_PRIJS.aangeplant)}`, en: `Planted · ${priceLabel(maat * BORDER_PRIJS.aangeplant)}` }} />
          </Kies>
        </div>
        <p className="mt-3 mb-0 text-[14px] leading-[1.5] text-gedempt">
          {soort === "opgestuurd" ? (
            <T t={{ nl: "De planten in P9-pot met het plan van boven, thuisbezorgd in Nederland en België.", en: "The plants in 9 cm pots with the planting plan, delivered in the Netherlands and Belgium." }} />
          ) : (
            <T t={{ nl: "Ik maak de grond los, plant volgens plan en leg er compost over. Alleen in Stein en omgeving; ik bel je om een dag af te spreken.", en: "I loosen the soil, plant to the plan and add compost. Only in and around Stein; I’ll call you to set a day." }} />
          )}
        </p>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Invul label="Naam" naam="naam" autoComplete="name" />
        <Invul label="E-mail" naam="email" type="email" inputMode="email" autoComplete="email" />
        <Invul label="Telefoon" naam="telefoon" type="tel" inputMode="tel" autoComplete="tel" />
        <Invul label="Straat en huisnummer" naam="straat" autoComplete="street-address" />
        <Invul label="Postcode" naam="postcode" autoComplete="postal-code" />
        <Invul label="Plaats" naam="plaats" autoComplete="address-level2" />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="flex items-start gap-3 text-[15px] leading-[1.5]">
        <input type="checkbox" name="akkoord" required className="mt-1 size-[18px] shrink-0 accent-[var(--oranje)]" />
        <span>
          <T t={{ nl: "Ik ga akkoord met de ", en: "I agree to the " }} />
          <Link href="/voorwaarden" className="lnk" target="_blank"><T t={{ nl: "voorwaarden", en: "terms" }} /></Link>
          <T t={{ nl: " en ken mijn ", en: " and know my " }} />
          <Link href="/herroeping" className="lnk" target="_blank"><T t={{ nl: "bedenktijd", en: "right of withdrawal" }} /></Link>.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-lijn pt-6">
        <p className="m-0">
          <span className="lbl block text-gedempt"><T t={{ nl: "Totaal, incl. btw", en: "Total, incl. VAT" }} /></span>
          <span className="syne text-[clamp(32px,4vw,44px)] leading-none tabular-nums">{priceLabel(totaal)}</span>
        </p>
        <button disabled={bezig} className="knop bg-oranje text-antraciet disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">
          <T t={bezig ? { nl: "Even geduld…", en: "One moment…" } : { nl: "Bestellen en betalen →", en: "Order and pay →" }} />
        </button>
      </div>
      <p className="-mt-4 mb-0 text-[14px] text-gedempt"><T t={{ nl: "Je betaalt veilig via Mollie: iDEAL, Wero, Visa of Mastercard.", en: "You pay securely via Mollie: iDEAL, Wero, Visa or Mastercard." }} /></p>
      {uitkomst.fout && <p role="alert" className="m-0 font-semibold text-oranje-tekst">{uitkomst.fout}</p>}
    </form>
  )
}

"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { BonKaart } from "@/components/cadeaubon/kaart"
import { BON_BEDRAGEN, BON_MAX, BON_MIN, DOOSJE_PRIJS } from "@/lib/data/cadeaubon"
import { priceLabel } from "@/lib/format"
import { koop } from "./acties"

// Links de kaart die meeverandert met wat je invult, rechts het formulier.
// Daarna door naar Mollie (iDEAL, Wero, Visa, Mastercard).

const veld = "block w-full min-w-0 rounded-[12px] border border-gedempt bg-veld px-4 py-3 text-[18px] text-inkt outline-none placeholder:text-voorbeeld focus:border-inkt focus:shadow-[0_0_0_1px_var(--inkt)]"
const chip = "inline-flex min-h-[var(--knop)] items-center rounded-full border border-gedempt px-4 py-2 text-[15px] tabular-nums peer-checked:border-inkt peer-checked:bg-inkt peer-checked:text-grond peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inkt"

export function BonFormulier({ online }: { online: boolean }) {
  const [vast, setVast] = useState<number | null>(BON_BEDRAGEN[1])
  const [eigen, setEigen] = useState("")
  const bedrag = vast ?? Number(eigen || 0)
  const [doosje, setDoosje] = useState(false)
  const totaal = bedrag + (doosje ? DOOSJE_PRIJS : 0)
  const [voor, setVoor] = useState("")
  const [van, setVan] = useState("")
  const [boodschap, setBoodschap] = useState("")
  const [uitkomst, actie, bezig] = useActionState(koop, {})
  return (
    <div className="grid items-start gap-[clamp(40px,6vw,88px)] lg:grid-cols-[1.1fr_1fr]">
      <div className="lg:sticky lg:top-[96px]">
        <BonKaart bedrag={bedrag} voor={voor} van={van} boodschap={boodschap} />
      </div>

      <form action={actie} className="grid gap-7">
        <fieldset className="m-0 border-0 p-0">
          <legend className="lbl mb-3 p-0">Bedrag</legend>
          <div className="flex flex-wrap gap-2">
            {BON_BEDRAGEN.map((b) => (
              <label key={b} className="cursor-pointer">
                <input type="radio" name="keuze" checked={vast === b} onChange={() => setVast(b)} className="peer sr-only" />
                <span className={chip}>{priceLabel(b)}</span>
              </label>
            ))}
            <label className="cursor-pointer">
              <input type="radio" name="keuze" checked={vast === null} onChange={() => setVast(null)} className="peer sr-only" />
              <span className={chip}>Ander bedrag</span>
            </label>
          </div>
          {vast === null && (
            <label className="mt-4 flex max-w-[340px] flex-col gap-2">
              <span className="text-[14px] text-gedempt">Bedrag in hele euro&apos;s, {priceLabel(BON_MIN)} tot {priceLabel(BON_MAX)}</span>
              <span className="relative">
                <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[18px]">€</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  autoFocus
                  value={eigen}
                  onChange={(e) => setEigen(e.target.value.replace(/\D/g, "").replace(/^0+/, ""))}
                  placeholder="75"
                  className={`${veld} pl-9 tabular-nums`}
                />
              </span>
            </label>
          )}
          <input type="hidden" name="bedrag" value={bedrag} />
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="lbl">Voor wie</span>
            <input name="voor" required maxLength={40} value={voor} onChange={(e) => setVoor(e.target.value)} placeholder="Marieke" className={veld} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="lbl">Van wie</span>
            <input name="van" required maxLength={40} value={van} onChange={(e) => setVan(e.target.value)} placeholder="Tom en de kinderen" className={veld} />
          </label>
        </div>
        <label className="flex flex-col gap-2">
          <span className="lbl">Een kort berichtje (mag leeg)</span>
          <textarea name="boodschap" maxLength={140} rows={2} value={boodschap} onChange={(e) => setBoodschap(e.target.value)} placeholder="Eindelijk die vijver weer helder!" className={`${veld} resize-none`} />
        </label>

        <fieldset className="m-0 border-0 p-0">
          <legend className="lbl mb-3 p-0">Hoe geef je hem</legend>
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer">
              <input type="radio" name="vorm" value="digitaal" checked={!doosje} onChange={() => setDoosje(false)} className="peer sr-only" />
              <span className={chip}>Digitaal · gratis</span>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="vorm" value="doosje" checked={doosje} onChange={() => setDoosje(true)} className="peer sr-only" />
              <span className={chip}>Kaart in luxe doosje · +{priceLabel(DOOSJE_PRIJS)}</span>
            </label>
          </div>
          <p className="mt-3 mb-0 text-[14px] leading-[1.5] text-gedempt">
            {doosje
              ? "Ik print de kaart op dik papier, leg hem in een doosje en stuur hem binnen drie werkdagen op, naar jou of naar wie hem krijgt. Je krijgt de digitale bon er meteen bij."
              : "Na betalen staat de bon klaar om te printen of door te sturen."}
          </p>
          {doosje && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="lbl">Straat en huisnummer</span>
                <input name="straat" required autoComplete="street-address" className={veld} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="lbl">Postcode</span>
                <input name="postcode" required autoComplete="postal-code" className={veld} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="lbl">Plaats</span>
                <input name="plaats" required autoComplete="address-level2" className={veld} />
              </label>
            </div>
          )}
        </fieldset>

        <div className="grid gap-5 border-t border-lijn pt-7 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="lbl">Jouw naam</span>
            <input name="naam" required autoComplete="name" className={veld} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="lbl">Jouw e-mail</span>
            <input name="email" type="email" inputMode="email" required autoComplete="email" className={veld} />
          </label>
        </div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <label className="flex items-start gap-3 text-[15px] leading-[1.5]">
          <input type="checkbox" name="akkoord" required className="mt-1 size-[18px] shrink-0 accent-[var(--oranje)]" />
          <span>
            Ik ga akkoord met de <Link href="/voorwaarden" className="lnk" target="_blank">voorwaarden</Link>.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="m-0">
            <span className="lbl block text-gedempt">Totaal, incl. btw</span>
            <span className="syne text-[clamp(32px,4vw,44px)] leading-none tabular-nums">{priceLabel(totaal)}</span>
          </p>
          <button disabled={bezig || !online || bedrag < BON_MIN || bedrag > BON_MAX} className="knop bg-oranje text-antraciet disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">
            {bezig ? "Even geduld…" : "Kopen en betalen →"}
          </button>
        </div>
        <p className="-mt-3 mb-0 text-[14px] leading-[1.5] text-gedempt">
          {online ? "Je betaalt veilig via Mollie. Direct daarna staat je bon klaar met een eigen bonnummer." : "Online kopen staat nog niet aan. App Nick op 06 18 11 80 14 voor een cadeaubon."}
        </p>
        {uitkomst.fout && <p role="alert" className="m-0 font-semibold text-oranje-tekst">{uitkomst.fout}</p>}
      </form>
    </div>
  )
}

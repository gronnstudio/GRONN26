"use client"

import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

// Een inkoopfactuur toevoegen, met de PDF of foto erbij. Gaat naar
// /api/crm/inkoop (geen server-actie: die stopt bij 1 MB).
export function InkoopFormulier({ klanten, leveranciers, vandaag, klantId }: { klanten: { id: string; naam: string }[]; leveranciers: string[]; vandaag: string; klantId?: string }) {
  const router = useRouter()
  const vorm = useRef<HTMLFormElement>(null)
  const [bezig, setBezig] = useState(false)
  const [melding, setMelding] = useState<{ fout: boolean; tekst: string } | null>(null)

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBezig(true)
    setMelding(null)
    const r = await fetch("/api/crm/inkoop", { method: "POST", body: new FormData(e.currentTarget) }).catch(() => null)
    const j = (await r?.json().catch(() => null)) as { fout?: string } | null
    setBezig(false)
    if (!r?.ok) return setMelding({ fout: true, tekst: j?.fout ?? "Bewaren lukte niet. Probeer het opnieuw." })
    vorm.current?.reset()
    setMelding({ fout: false, tekst: "Bewaard ✓" })
    router.refresh()
  }

  const veld = "crm-veld w-full"
  const lbl = "crm-label mb-1 block"
  return (
    <form ref={vorm} onSubmit={verstuur} className="grid grid-cols-2 gap-3">
      <label className="col-span-2">
        <span className={lbl}>Leverancier</span>
        <input name="leverancier" required list="inkoop-leveranciers" className={veld} placeholder="Bijv. Bomat" />
        <datalist id="inkoop-leveranciers">
          {leveranciers.map((l) => <option key={l} value={l} />)}
        </datalist>
      </label>
      <label>
        <span className={lbl}>Factuurdatum</span>
        <input name="datum" type="date" required defaultValue={vandaag} className={veld} />
      </label>
      <label>
        <span className={lbl}>Betalen voor</span>
        <input name="vervalt" type="date" className={veld} />
      </label>
      <label>
        <span className={lbl}>Factuurnummer</span>
        <input name="nummer" className={veld} />
      </label>
      <label>
        <span className={lbl}>Bedrag (€)</span>
        <input name="bedrag" required inputMode="decimal" className={veld} placeholder="0,00" />
      </label>
      <label>
        <span className={lbl}>Bedrag is</span>
        <select name="metbtw" defaultValue="1" className={veld}>
          <option value="1">incl. btw</option>
          <option value="0">excl. btw</option>
        </select>
      </label>
      <label>
        <span className={lbl}>Btw</span>
        <select name="btw" defaultValue="21" className={veld}>
          <option value="21">21 %</option>
          <option value="9">9 %</option>
          <option value="0">0 %</option>
        </select>
      </label>
      <label className="col-span-2">
        <span className={lbl}>Voor klant</span>
        <select name="klantId" defaultValue={klantId ?? ""} className={veld}>
          <option value="">Algemene kosten (geen klant)</option>
          {klanten.map((k) => <option key={k.id} value={k.id}>{k.naam}</option>)}
        </select>
      </label>
      <label className="col-span-2">
        <span className={lbl}>Omschrijving</span>
        <input name="omschrijving" className={veld} placeholder="Bijv. 3 BB teelaarde" />
      </label>
      <label className="col-span-2">
        <span className={lbl}>Factuur (PDF of foto, hooguit 4 MB)</span>
        <input name="bestand" type="file" accept="application/pdf,image/jpeg,image/png" className="block w-full text-[13px]" />
      </label>
      <label className="col-span-2 flex items-center gap-2 text-[14px]">
        <input name="betaald" type="checkbox" value="1" /> Al betaald
      </label>
      <div className="col-span-2 flex items-center gap-3">
        <button className="crm-knop" disabled={bezig}>{bezig ? "Bewaren…" : "Inkoop toevoegen"}</button>
        {melding && <span role="status" className={`text-[13px] ${melding.fout ? "text-let" : "text-gedempt"}`}>{melding.tekst}</span>}
      </div>
    </form>
  )
}

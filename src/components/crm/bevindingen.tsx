"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { Bevinding, Foto } from "@/lib/crm/klant"
import { INTAKE_ANTWOORD, type IntakeAntwoord } from "./intake"

// Wat Claude op de foto's zag, als voorstel (intake.md §5). Bevestigen met een
// voorgesteld antwoord zet dat antwoord in de intake, via dezelfde weg als
// zelf invullen; afwijzen bewaart alleen de status. Niets wordt vanzelf een antwoord.

const MAX = 12

export function Bevindingen({
  klant,
  tuin,
  fotos,
  bevindingen,
  vragen,
  zet,
}: {
  klant: string
  tuin: string
  fotos: Foto[]
  bevindingen: Bevinding[]
  vragen: Record<string, string>
  zet: (id: string, status: Bevinding["status"]) => Promise<void>
}) {
  const router = useRouter()
  const [bezig, setBezig] = useState(false)
  const [melding, setMelding] = useState("")
  const [, start] = useTransition()
  const nieuw = fotos.filter((f) => f.moment === "Opname" && !f.bekeken)
  const voorstellen = bevindingen.filter((b) => b.status === "voorstel")
  const bevestigd = bevindingen.filter((b) => b.status === "bevestigd")

  async function analyseer() {
    setBezig(true)
    setMelding("")
    try {
      const r = await fetch("/api/crm/analyse", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ klant, tuin, fotos: nieuw.slice(0, MAX).map((f) => f.id) }) })
      const d = (await r.json().catch(() => ({}))) as { fout?: string; aantal?: number }
      setMelding(d.fout ?? `${d.aantal ?? 0} voorstel${d.aantal === 1 ? "" : "len"} erbij.`)
      if (r.ok) router.refresh()
    } catch {
      setMelding("Analyse lukte niet, probeer het opnieuw.")
    }
    setBezig(false)
  }

  const kies = (b: Bevinding, status: Bevinding["status"]) =>
    start(async () => {
      if (status === "bevestigd" && b.vraag && b.antwoord)
        window.dispatchEvent(new CustomEvent<IntakeAntwoord>(INTAKE_ANTWOORD, { detail: { tuin, vraag: b.vraag, antwoord: b.antwoord } }))
      await zet(b.id, status)
      router.refresh()
    })

  return (
    <section className="crm-paneel p-5" aria-labelledby="bevindingen-kop">
      <p id="bevindingen-kop" className="crm-label m-0">Wat Claude ziet</p>
      <p className="m-0 mt-1 text-[13px] text-gedempt">Voorstellen uit de opnamefoto&apos;s. Pas na Bevestigen wordt iets een antwoord; maten uit een foto zijn een schatting.</p>
      <button type="button" onClick={analyseer} disabled={bezig || !nieuw.length} className="crm-knop mt-3 w-full disabled:opacity-50">
        {bezig ? "Claude kijkt…" : nieuw.length ? `Analyseer ${Math.min(nieuw.length, MAX)} nieuwe foto${nieuw.length === 1 ? "" : "'s"} met Claude` : "Geen nieuwe opnamefoto's"}
      </button>
      {melding && <p role="status" className="m-0 mt-2 text-[13px]">{melding}</p>}

      {voorstellen.length > 0 && (
        <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
          {voorstellen.map((b) => (
            <li key={b.id} className="rounded-[12px] border border-lijn p-3 text-[13px]">
              <p className="m-0 text-[12px] text-gedempt">
                {b.zone} · <span className={b.zeker === "zichtbaar" ? "font-semibold text-inkt" : ""}>{b.zeker}</span>
              </p>
              <p className="m-0 mt-1">{b.tekst}</p>
              {b.vraag && b.antwoord && (
                <p className="m-0 mt-1">
                  {vragen[b.vraag] ?? b.vraag}: <strong>{b.antwoord}</strong>
                </p>
              )}
              {b.meting && <p className="m-0 mt-1 text-let">Meten: {b.meting}</p>}
              {b.bron.some((f) => fotos.some((x) => x.id === f)) && (
                <div className="mt-2 flex gap-1">
                  {b.bron.filter((f) => fotos.some((x) => x.id === f)).slice(0, 4).map((f) => (
                    // eslint-disable-next-line @next/next/no-img-element -- privé foto achter de inlog
                    <img key={f} src={`/api/crm/foto?id=${f}`} alt="" loading="lazy" className="size-[48px] rounded-[6px] object-cover" />
                  ))}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => kies(b, "bevestigd")} className="crm-knop min-h-[36px] px-3">Bevestigen</button>
                <button type="button" onClick={() => kies(b, "afgewezen")} className="crm-knop-rand min-h-[36px] px-3">Afwijzen</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {bevestigd.length > 0 && (
        <details className="mt-4 text-[13px]">
          <summary className="cursor-pointer font-semibold">{bevestigd.length} bevestigd</summary>
          <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
            {bevestigd.map((b) => (
              <li key={b.id}>
                {b.zone}: {b.tekst}
                {b.meting && <span className="block text-gedempt">Meten: {b.meting}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}

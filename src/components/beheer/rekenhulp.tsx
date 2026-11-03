"use client"

import { useState } from "react"
import { nieuweRegel, type Regel, type Soort } from "@/lib/crm/calculatie"
import { alsRegel, type Item } from "@/lib/crm/catalogus"
import { leesBp, leesCenten, leesMilli, toonEuro, type Milli } from "@/lib/crm/geld"
import * as h from "@/lib/crm/rekenhulpen"

// Rekenhulpen in het rekenblad: maten in, hoeveelheid uit, en met één klik als
// regel in de calculatie (met de prijs uit de catalogus als je een item kiest).
// De formule staat erbij, zodat je ziet waar het getal vandaan komt.

type Veld = { id: string; label: string; standaard: string }
type Hulp = {
  id: string
  naam: string
  velden: Veld[]
  soort: Soort
  reken: (v: Record<string, string>) => { hoeveelheid: Milli; eenheid: string; formule: string; bedrag?: number } | null
}

const m = (s: string) => leesMilli(s) ?? 0
const heel = (s: string) => Math.max(0, Math.round((leesMilli(s) ?? 0) / 1000))

const HULPEN: Hulp[] = [
  { id: "bestrating", naam: "Bestrating met snijverlies", soort: "materiaal", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "verlies", label: "Snijverlies %", standaard: "7" }], reken: (v) => h.bestrating(m(v.opp), leesBp(v.verlies) ?? 0) },
  { id: "afgraven", naam: "Afgraven", soort: "afvoer", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "diepte", label: "Diepte mm", standaard: "300" }], reken: (v) => h.afgraven(m(v.opp), heel(v.diepte)) },
  { id: "grond", naam: "Grond of teelaarde aanvoeren", soort: "materiaal", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "dikte", label: "Laagdikte mm", standaard: "200" }, { id: "zak", label: "Inklinking %", standaard: "15" }], reken: (v) => h.grond(m(v.opp), heel(v.dikte), leesBp(v.zak) ?? 0) },
  { id: "grind", naam: "Grind, split of fundering", soort: "materiaal", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "dikte", label: "Laagdikte mm", standaard: "150" }, { id: "gewicht", label: "Gewicht t/m³", standaard: "1,6" }], reken: (v) => h.grind(m(v.opp), heel(v.dikte), m(v.gewicht)) },
  { id: "gazon", naam: "Graszoden", soort: "planten", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "verlies", label: "Snijverlies %", standaard: "5" }], reken: (v) => h.gazon(m(v.opp), leesBp(v.verlies) ?? 0) },
  { id: "zaad", naam: "Graszaad", soort: "planten", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "gram", label: "Gram per m²", standaard: "35" }], reken: (v) => h.graszaad(m(v.opp), heel(v.gram)) },
  { id: "planten", naam: "Planten per m²", soort: "planten", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "dichtheid", label: "Planten per m²", standaard: "7" }], reken: (v) => h.planten(m(v.opp), m(v.dichtheid)) },
  { id: "mulch", naam: "Mulch of compost", soort: "materiaal", velden: [{ id: "opp", label: "Oppervlak m²", standaard: "" }, { id: "dikte", label: "Laagdikte mm", standaard: "50" }], reken: (v) => h.mulch(m(v.opp), heel(v.dikte)) },
  {
    id: "machine",
    naam: "Machinehuur",
    soort: "machine",
    velden: [{ id: "dagen", label: "Dagen", standaard: "1" }, { id: "prijs", label: "Dagprijs €", standaard: "150" }, { id: "transport", label: "Transport €", standaard: "75" }],
    reken: (v) => {
      const r = h.machinehuur(m(v.dagen), leesCenten(v.prijs) ?? 0, leesCenten(v.transport) ?? 0)
      return { hoeveelheid: 1000, eenheid: "post", formule: r.formule, bedrag: r.bedrag }
    },
  },
  { id: "arbeid", naam: "Uren uit dagproductie", soort: "overig", velden: [{ id: "hoeveel", label: "Hoeveelheid (m², m, st)", standaard: "" }, { id: "perdag", label: "Per dag", standaard: "22" }], reken: (v) => h.arbeid(m(v.hoeveel), m(v.perdag)) },
]

export function Rekenhulp({ catalogus, onRegel, onUren }: { catalogus: Item[]; onRegel: (r: Regel) => void; onUren: (m: Milli) => void }) {
  const [id, setId] = useState(HULPEN[0].id)
  const hulp = HULPEN.find((x) => x.id === id) ?? HULPEN[0]
  const [waarden, setWaarden] = useState<Record<string, string>>({})
  const [item, setItem] = useState("")
  const v = Object.fromEntries(hulp.velden.map((f) => [f.id, waarden[`${hulp.id}.${f.id}`] ?? f.standaard]))
  const uit = hulp.velden.some((f) => !v[f.id]) ? null : hulp.reken(v)
  const geschikt = catalogus.filter((i) => uit && i.eenheid === uit.eenheid)
  const gekozen = geschikt.find((i) => i.id === item)

  const voegToe = () => {
    if (!uit) return
    if (hulp.id === "arbeid") return onUren(uit.hoeveelheid)
    if (uit.bedrag !== undefined) return onRegel(nieuweRegel("machine", { omschrijving: "Machinehuur", eenheid: "post", hoeveelheid: 1000, inkoop: uit.bedrag }))
    onRegel(gekozen ? alsRegel(gekozen, uit.hoeveelheid) : nieuweRegel(hulp.soort, { omschrijving: hulp.naam, eenheid: uit.eenheid, hoeveelheid: uit.hoeveelheid }))
  }

  return (
    <section className="crm-paneel p-5">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[.18em] text-gedempt">4 · Rekenhulp</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[13px]">
          Wat reken je uit?
          <select value={id} onChange={(e) => { setId(e.target.value); setItem("") }} className="min-w-0 rounded-[12px] border border-lijn bg-grond px-3 py-2 text-[14px]">
            {HULPEN.map((x) => (
              <option key={x.id} value={x.id}>{x.naam}</option>
            ))}
          </select>
        </label>
        {hulp.velden.map((f) => (
          <label key={f.id} className="grid gap-1 text-[13px]">
            {f.label}
            <input
              inputMode="decimal"
              value={v[f.id]}
              onChange={(e) => setWaarden({ ...waarden, [`${hulp.id}.${f.id}`]: e.target.value })}
              className="w-[110px] min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
            />
          </label>
        ))}
      </div>
      {uit && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <p className="m-0 crm-cijfer">{uit.formule}</p>
          <div className="flex flex-wrap items-center gap-2">
            {geschikt.length > 0 && (
              <select aria-label="Prijs uit catalogus" value={item} onChange={(e) => setItem(e.target.value)} className="rounded-[10px] border border-lijn bg-grond px-2 py-1.5 text-[13px]">
                <option value="">Zonder catalogusprijs</option>
                {geschikt.map((i) => (
                  <option key={i.id} value={i.id}>{i.naam} · {toonEuro(i.inkoop)}/{i.eenheid}</option>
                ))}
              </select>
            )}
            <button type="button" onClick={voegToe} className="crm-knop-rand">
              {hulp.id === "arbeid" ? "+ Bij de uren" : "+ Als regel"}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

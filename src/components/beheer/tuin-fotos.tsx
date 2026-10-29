"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { Foto } from "@/lib/crm/klant"

// Foto's bij een tuin: opname, voor, tijdens en na. De browser verkleint tot
// hooguit 1600px JPG (zoals de vijverfoto op Kennismaken) en stuurt hem naar
// /api/crm/foto; daar staat hij privé. Voor-en-na staat naast elkaar.

const MOMENTEN = ["Opname", "Voor", "Tijdens", "Na"] as const

async function verklein(bestand: File): Promise<Blob> {
  const beeld = await createImageBitmap(bestand)
  const schaal = Math.min(1, 1600 / Math.max(beeld.width, beeld.height))
  const doek = document.createElement("canvas")
  doek.width = Math.round(beeld.width * schaal)
  doek.height = Math.round(beeld.height * schaal)
  doek.getContext("2d")?.drawImage(beeld, 0, 0, doek.width, doek.height)
  beeld.close()
  return new Promise((klaar, mis) => doek.toBlob((b) => (b ? klaar(b) : mis(new Error("leeg"))), "image/jpeg", 0.85))
}

export function TuinFotos({ klant, tuin, fotos, weg }: { klant: string; tuin: string; fotos: Foto[]; weg: (fotoId: string) => Promise<void> }) {
  const router = useRouter()
  const [moment, setMoment] = useState<(typeof MOMENTEN)[number]>("Opname")
  const [bijschrift, setBijschrift] = useState("")
  const [stand, setStand] = useState<"" | "bezig" | "fout">("")
  const [fout, setFout] = useState("")
  const [, start] = useTransition()

  async function kies(lijst: FileList | null) {
    if (!lijst?.length) return
    setStand("bezig")
    setFout("")
    try {
      for (const bestand of Array.from(lijst)) {
        const body = new FormData()
        body.append("foto", await verklein(bestand), "tuin.jpg")
        body.append("klant", klant)
        body.append("tuin", tuin)
        body.append("moment", moment)
        body.append("bijschrift", bijschrift)
        const r = await fetch("/api/crm/foto", { method: "POST", body })
        if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { fout?: string }).fout || "Uploaden mislukt.")
      }
      setStand("")
      setBijschrift("")
      router.refresh()
    } catch (e) {
      setStand("fout")
      setFout(e instanceof Error ? e.message : "Uploaden mislukt.")
    }
  }

  return (
    <section className="rounded-[18px] border border-lijn p-5">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[.18em] opacity-60">Foto&apos;s</p>
      <div className="mt-3 grid gap-2">
        <div className="flex gap-1" role="radiogroup" aria-label="Moment">
          {MOMENTEN.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={m === moment} onClick={() => setMoment(m)} className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${m === moment ? "border-inkt bg-inkt text-grond" : "border-lijn"}`}>
              {m}
            </button>
          ))}
        </div>
        <input value={bijschrift} onChange={(e) => setBijschrift(e.target.value)} placeholder="Bijschrift (optioneel)" aria-label="Bijschrift" className="min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]" />
        <label className="cursor-pointer rounded-full border border-lijn px-4 py-2 text-center text-[14px] font-semibold hover:border-oranje has-[:focus-visible]:outline-2">
          {stand === "bezig" ? "Uploaden…" : "+ Foto's kiezen of maken"}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={stand === "bezig"} onChange={(e) => kies(e.target.files)} />
        </label>
        {fout && <p role="alert" className="m-0 text-[13px] text-oranje-tekst">{fout}</p>}
      </div>
      {MOMENTEN.filter((m) => fotos.some((f) => f.moment === m)).map((m) => (
        <div key={m} className="mt-4">
          <p className="m-0 text-[12px] font-semibold opacity-70">{m}</p>
          <ul className="m-0 mt-2 grid list-none grid-cols-2 gap-2 p-0">
            {fotos
              .filter((f) => f.moment === m)
              .map((f) => (
                <li key={f.id} className="group relative">
                  <a href={`/api/crm/foto?id=${f.id}`} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- privé foto achter de inlog, niet via next/image */}
                    <img src={`/api/crm/foto?id=${f.id}`} alt={f.bijschrift || `${m}-foto`} loading="lazy" className="block aspect-[4/3] w-full rounded-[10px] object-cover" />
                  </a>
                  {f.bijschrift && <p className="m-0 mt-1 text-[12px] opacity-70">{f.bijschrift}</p>}
                  <button type="button" onClick={() => start(async () => { await weg(f.id); router.refresh() })} aria-label="Foto weghalen" className="absolute top-1 right-1 size-[28px] rounded-full bg-grond/90 text-[14px] opacity-0 group-hover:opacity-100 focus-visible:opacity-100">×</button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

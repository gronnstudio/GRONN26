"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { Foto } from "@/lib/crm/klant"
import type { Zone } from "@/lib/crm/vragenlijst"

// Foto's bij een tuin: opname, voor, tijdens en na. De browser verkleint tot
// hooguit 1600px JPG (zoals de vijverfoto op Kennismaken) en stuurt hem naar
// /api/crm/foto; daar staat hij privé. Voor-en-na staat naast elkaar.
// Een video wordt niet bewaard: de browser haalt er elke 3 seconden een beeld
// uit (hooguit 20), en die beelden worden foto's met hun tijdcode
// (intake.md §5, zonder ffmpeg of nieuwe afhankelijkheid).

const MOMENTEN = ["Opname", "Voor", "Tijdens", "Na"] as const

function naarJpg(bron: CanvasImageSource, breedte: number, hoogte: number): Promise<Blob> {
  const schaal = Math.min(1, 1600 / Math.max(breedte, hoogte))
  const doek = document.createElement("canvas")
  doek.width = Math.round(breedte * schaal)
  doek.height = Math.round(hoogte * schaal)
  doek.getContext("2d")?.drawImage(bron, 0, 0, doek.width, doek.height)
  return new Promise((klaar, mis) => doek.toBlob((b) => (b ? klaar(b) : mis(new Error("leeg"))), "image/jpeg", 0.85))
}

async function verklein(bestand: File): Promise<Blob> {
  const beeld = await createImageBitmap(bestand)
  try {
    return await naarJpg(beeld, beeld.width, beeld.height)
  } finally {
    beeld.close()
  }
}

const STAP = 3
const MAX_BEELDEN = 20
export const tijdcode = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

/** Beelden uit een video, elke 3 seconden, met hun tijd in seconden. */
async function beeldenUit(bestand: File): Promise<{ tijd: number; jpg: Blob }[]> {
  const url = URL.createObjectURL(bestand)
  const video = document.createElement("video")
  video.muted = true
  video.playsInline = true
  video.preload = "auto"
  video.src = url
  try {
    await new Promise<void>((klaar, mis) => {
      video.onloadeddata = () => klaar()
      video.onerror = () => mis(new Error("Deze video kan de browser niet openen."))
    })
    const duur = Number.isFinite(video.duration) ? video.duration : 0
    const tijden = Array.from({ length: Math.min(MAX_BEELDEN, Math.floor(duur / STAP) + 1) }, (_, i) => Math.min(i * STAP, Math.max(0, duur - 0.1)))
    const uit: { tijd: number; jpg: Blob }[] = []
    for (const tijd of tijden) {
      await new Promise<void>((klaar) => {
        video.onseeked = () => klaar()
        video.currentTime = tijd
      })
      uit.push({ tijd, jpg: await naarJpg(video, video.videoWidth, video.videoHeight) })
    }
    return uit
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function TuinFotos({ klant, tuin, fotos, zones = [], weg }: { klant: string; tuin: string; fotos: Foto[]; zones?: Zone[]; weg: (fotoId: string) => Promise<void> }) {
  const router = useRouter()
  const [moment, setMoment] = useState<(typeof MOMENTEN)[number]>("Opname")
  const [bijschrift, setBijschrift] = useState("")
  const [zone, setZone] = useState("")
  const [voortgang, setVoortgang] = useState("")
  const [stand, setStand] = useState<"" | "bezig" | "fout">("")
  const [fout, setFout] = useState("")
  const [, start] = useTransition()

  async function stuur(jpg: Blob, tijd?: string) {
    const body = new FormData()
    body.append("foto", jpg, "tuin.jpg")
    body.append("klant", klant)
    body.append("tuin", tuin)
    body.append("moment", moment)
    body.append("bijschrift", bijschrift)
    body.append("zone", zone)
    if (tijd) body.append("tijd", tijd)
    const r = await fetch("/api/crm/foto", { method: "POST", body })
    if (!r.ok) throw new Error(((await r.json().catch(() => ({}))) as { fout?: string }).fout || "Uploaden mislukt.")
  }

  async function kies(lijst: FileList | null, video = false) {
    if (!lijst?.length) return
    setStand("bezig")
    setFout("")
    try {
      for (const bestand of Array.from(lijst)) {
        if (!video) {
          await stuur(await verklein(bestand))
          continue
        }
        setVoortgang("Beelden uit de video halen…")
        const beelden = await beeldenUit(bestand)
        for (const [i, b] of beelden.entries()) {
          setVoortgang(`Beeld ${i + 1} van ${beelden.length} uploaden…`)
          await stuur(b.jpg, tijdcode(b.tijd))
        }
      }
      setStand("")
      setVoortgang("")
      setBijschrift("")
      router.refresh()
    } catch (e) {
      setStand("fout")
      setVoortgang("")
      setFout(e instanceof Error ? e.message : "Uploaden mislukt.")
    }
  }

  return (
    <section className="crm-paneel p-5">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[.18em] text-gedempt">Foto&apos;s</p>
      <div className="mt-3 grid gap-2">
        <div className="flex gap-1" role="radiogroup" aria-label="Moment">
          {MOMENTEN.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={m === moment} onClick={() => setMoment(m)} className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${m === moment ? "border-accent bg-accent text-op-accent" : "border-lijn"}`}>
              {m}
            </button>
          ))}
        </div>
        {zones.length > 0 && (
          <select value={zone} onChange={(e) => setZone(e.target.value)} aria-label="Zone" className="min-w-0 rounded-[12px] border border-lijn bg-grond px-3 py-2 text-[14px]">
            <option value="">Geen zone</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.naam}</option>
            ))}
          </select>
        )}
        <input value={bijschrift} onChange={(e) => setBijschrift(e.target.value)} placeholder="Bijschrift (optioneel)" aria-label="Bijschrift" className="min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]" />
        <label className="cursor-pointer rounded-full border border-lijn px-4 py-2 text-center text-[14px] font-semibold hover:border-accent has-[:focus-visible]:outline-2">
          {stand === "bezig" ? "Uploaden…" : "+ Foto's kiezen of maken"}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={stand === "bezig"} onChange={(e) => kies(e.target.files)} />
        </label>
        <label className="cursor-pointer rounded-full border border-lijn px-4 py-2 text-center text-[14px] font-semibold hover:border-accent has-[:focus-visible]:outline-2">
          + Video (beelden eruit halen)
          <input type="file" accept="video/*" className="sr-only" aria-label="Video" disabled={stand === "bezig"} onChange={(e) => kies(e.target.files, true)} />
        </label>
        {voortgang && <p role="status" className="m-0 text-[13px] text-gedempt">{voortgang}</p>}
        {fout && <p role="alert" className="m-0 text-[13px] text-let">{fout}</p>}
      </div>
      {MOMENTEN.filter((m) => fotos.some((f) => f.moment === m)).map((m) => (
        <div key={m} className="mt-4">
          <p className="m-0 text-[12px] font-semibold text-gedempt">{m}</p>
          <ul className="m-0 mt-2 grid list-none grid-cols-2 gap-2 p-0">
            {fotos
              .filter((f) => f.moment === m)
              .map((f) => (
                <li key={f.id} className="group relative">
                  <a href={`/api/crm/foto?id=${f.id}`} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- privé foto achter de inlog, niet via next/image */}
                    <img src={`/api/crm/foto?id=${f.id}`} alt={f.bijschrift || `${m}-foto`} loading="lazy" className="block aspect-[4/3] w-full rounded-[10px] object-cover" />
                  </a>
                  {(f.bijschrift || f.tijd || f.zone) && (
                    <p className="m-0 mt-1 text-[12px] text-gedempt">
                      {[f.tijd && `Video ${f.tijd}`, zones.find((z) => z.id === f.zone)?.naam, f.bijschrift].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <button type="button" onClick={() => start(async () => { await weg(f.id); router.refresh() })} aria-label="Foto weghalen" className="absolute top-1 right-1 size-[28px] rounded-full bg-grond/90 text-[14px] opacity-0 group-hover:opacity-100 focus-visible:opacity-100">×</button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

"use client"

import { useId, useState } from "react"
import { T } from "@/components/taal"

// "Stuur een foto van je vijver" (11 okt 2026; de Instagram-belofte "Groen
// water? Stuur een foto."). Optioneel. De browser verkleint de foto tot
// hooguit 1600px JPG; /api/vijverfoto bewaart hem voor Nick en geeft een
// eerste inschatting terug. Die staat hier, en gaat mee in het bericht.

export type FotoUitkomst = { id: string | null; inschatting: string | null }

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

export function Vijverfoto({ onUitkomst }: { onUitkomst: (u: FotoUitkomst | null) => void }) {
  const id = useId()
  const [stand, setStand] = useState<"leeg" | "bezig" | "klaar" | "fout">("leeg")
  const [voorbeeld, setVoorbeeld] = useState<string | null>(null)
  const [tekst, setTekst] = useState<string | null>(null)

  async function kies(bestand: File | undefined) {
    onUitkomst(null)
    setTekst(null)
    if (voorbeeld) URL.revokeObjectURL(voorbeeld)
    setVoorbeeld(null)
    if (!bestand) return setStand("leeg")
    setStand("bezig")
    try {
      const jpg = await verklein(bestand)
      setVoorbeeld(URL.createObjectURL(jpg))
      const body = new FormData()
      body.append("foto", jpg, "vijver.jpg")
      const res = await fetch("/api/vijverfoto", { method: "POST", body })
      if (!res.ok) throw new Error(String(res.status))
      const uit = (await res.json()) as FotoUitkomst
      onUitkomst(uit)
      setTekst(uit.inschatting)
      setStand("klaar")
    } catch {
      setStand("fout")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="lbl m-0 text-gedempt" id={`${id}-kop`}>
        <T t={{ nl: "Groen water? Stuur een foto (optioneel)", en: "Green water? Send a photo (optional)" }} />
      </p>
      {/* Het echte bestandsveld is onzichtbaar (de browser zet er anders "Choose file" in zijn eigen taal op);
          het label is de knop, en krijgt de focusrand als het veld focus heeft. */}
      <input
        id={id}
        type="file"
        accept="image/*"
        aria-describedby={`${id}-kop`}
        onChange={(e) => void kies(e.currentTarget.files?.[0])}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="knop-klein self-start border border-lijn peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px] peer-focus-visible:outline-inkt"
      >
        {voorbeeld ? <T t={{ nl: "Andere foto kiezen", en: "Choose another photo" }} /> : <T t={{ nl: "Kies een foto", en: "Choose a photo" }} />}
      </label>
      <div aria-live="polite" className="flex items-start gap-4">
        {voorbeeld ? (
          // eslint-disable-next-line @next/next/no-img-element -- een lokale blob: uit de browser, geen bestand op de server
          <img src={voorbeeld} alt="" className="size-[72px] shrink-0 rounded-[6px] object-cover" />
        ) : null}
        {stand === "bezig" ? (
          <p className="m-0 text-gedempt"><T t={{ nl: "Ik kijk even naar je foto…", en: "Looking at your photo…" }} /></p>
        ) : null}
        {stand === "klaar" ? (
          <div className="m-0">
            {tekst ? (
              <>
                <p className="lbl m-0 text-gedempt"><T t={{ nl: "Eerste inschatting, automatisch · Nick kijkt zelf ook", en: "First impression, automatic · Nick looks too" }} /></p>
                <p className="mt-1 mb-0 max-w-[60ch] leading-relaxed">{tekst}</p>
              </>
            ) : (
              <p className="m-0"><T t={{ nl: "Foto ontvangen. Hij gaat mee met je bericht.", en: "Photo received. It goes along with your message." }} /></p>
            )}
          </div>
        ) : null}
        {stand === "fout" ? (
          <p className="m-0 text-gedempt"><T t={{ nl: "Deze foto lukte niet. Probeer een andere, of stuur hem later via WhatsApp.", en: "That photo didn't work. Try another one, or send it later via WhatsApp." }} /></p>
        ) : null}
      </div>
    </div>
  )
}

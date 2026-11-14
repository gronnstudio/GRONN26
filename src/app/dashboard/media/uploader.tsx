"use client"

import { upload } from "@vercel/blob/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Kies of sleep foto's en video's; ze gaan rechtstreeks naar de privé Blob-opslag.
export function Uploader() {
  const router = useRouter()
  const [bezig, setBezig] = useState<{ naam: string; pct: number }[]>([])
  const [fout, setFout] = useState("")
  const [over, setOver] = useState(false)

  async function stuur(lijst: FileList | null) {
    if (!lijst?.length) return
    setFout("")
    const bestanden = [...lijst]
    setBezig(bestanden.map((f) => ({ naam: f.name, pct: 0 })))
    for (const [i, f] of bestanden.entries()) {
      try {
        const veilig = f.name.normalize("NFKD").replace(/[^\w.-]+/g, "-").toLowerCase()
        await upload(`media/${veilig}`, f, {
          access: "private",
          handleUploadUrl: "/api/media",
          multipart: f.size > 50 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setBezig((b) => b.map((x, j) => (j === i ? { ...x, pct: Math.round(percentage) } : x))),
        })
      } catch (e) {
        setFout(`${f.name}: ${(e as Error).message}`)
      }
    }
    setBezig([])
    router.refresh()
  }

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); stuur(e.dataTransfer.files) }}
        className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed p-6 text-center ${over ? "border-inkt bg-vlak" : "border-lijn"}`}
      >
        <span className="text-[17px] font-semibold">Kies of sleep foto&apos;s en video&apos;s</span>
        <span className="text-[14px] text-gedempt">JPG, PNG, WebP, HEIC, MP4 of MOV, tot 1 GB per bestand</span>
        <input type="file" multiple accept="image/*,video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => stuur(e.target.files)} />
      </label>
      {bezig.length > 0 && (
        <ul className="m-0 mt-4 list-none space-y-2 p-0" aria-live="polite">
          {bezig.map((b) => (
            <li key={b.naam} className="text-[14px]">
              {b.naam} · {b.pct}%
              <progress max={100} value={b.pct} className="ml-2 align-middle" />
            </li>
          ))}
        </ul>
      )}
      {fout && <p role="alert" className="mt-3 text-[14px]">{fout}</p>}
    </div>
  )
}

import type { Metadata } from "next"
import { list } from "@vercel/blob"
import { Kop } from "@/components/crm/kop"
import { eisEigenaar } from "@/lib/crm/toegang"
import { Uploader } from "./uploader"
import { verwijderMedia } from "./acties"

// Media (eigenaar, 14 nov 2026): foto's en video's uploaden naar de privé Blob-opslag,
// voor de site en voor social. Alleen voor de ingelogde eigenaar.
export const metadata: Metadata = { title: "Media" }
export const dynamic = "force-dynamic"

const mb = (b: number) => (b > 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${(b / 1e6).toFixed(1)} MB`)

export default async function MediaPagina() {
  await eisEigenaar()
  const aan = !!process.env.BLOB_READ_WRITE_TOKEN
  // alle pagina's ophalen: list geeft er hooguit 1000 per keer
  const blobs: Awaited<ReturnType<typeof list>>["blobs"] = []
  for (let cursor: string | undefined, eerst = true; aan && (eerst || cursor); eerst = false) {
    const r = await list({ prefix: "media/", limit: 1000, cursor })
    blobs.push(...r.blobs)
    cursor = r.hasMore ? r.cursor : undefined
  }
  blobs.sort((a, b) => +b.uploadedAt - +a.uploadedAt)
  const totaal = blobs.reduce((s, b) => s + b.size, 0)
  return (
    <div className="mx-auto max-w-[1100px] p-5">
      <Kop titel="Media" />
      <p className="mt-2 text-[15px] text-gedempt">
        {blobs.length} bestanden · {mb(totaal)} in gebruik. Privé: alleen jij ziet ze als je bent ingelogd.
      </p>
      <div className="mt-6">{aan ? <Uploader /> : <p>Opslag staat uit (geen BLOB_READ_WRITE_TOKEN).</p>}</div>
      <ul className="m-0 mt-8 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3 lg:grid-cols-4">
        {blobs.map((b) => {
          const src = `/api/media?pad=${encodeURIComponent(b.pathname)}`
          const video = /\.(mp4|mov|webm)$/i.test(b.pathname)
          const naam = b.pathname.slice(6)
          return (
            <li key={b.url} className="crm-paneel overflow-hidden p-0">
              <a href={src} target="_blank" rel="noopener" className="block aspect-square bg-vlak">
                {video ? (
                  <video src={src} muted playsInline preload="metadata" className="size-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={naam} loading="lazy" className="size-full object-cover" />
                )}
              </a>
              <div className="flex items-center justify-between gap-2 p-3 text-[13px]">
                <span className="min-w-0 truncate" title={naam}>{naam}</span>
                <span className="shrink-0 text-gedempt">{mb(b.size)}</span>
              </div>
              <div className="flex gap-2 px-3 pb-3">
                <a href={`${src}`} download={naam} className="knop-klein border border-inkt/30">Download</a>
                <form action={verwijderMedia.bind(null, b.url)}>
                  <button className="knop-klein border border-inkt/30">Verwijderen</button>
                </form>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

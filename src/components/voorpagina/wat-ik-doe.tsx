import type { CSSProperties } from "react"
import Link from "next/link"
import { Foto, GeenFoto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { SERVICES, type Service } from "@/lib/data/services"
import { F01, F05, F07_2, F10, SFEER_WEIDE, T01 } from "./beelden"

// WF-057 (Uncode "Creative Persona"): de diensten als grote namen met kleine
// nummers; met een muis loopt er een beeld mee, op telefoon/touch staat de
// uitleg eronder. Volgt het thema. Het beeld is een foto die bij de dienst
// past, zonder projectnaam; bij twijfel GeenFoto.

type Rij = { slug: string; href: "/vijvers" | "/tuinen"; beeld: FotoData | string }

// Volgorde zoals /vijvers en /tuinen. Een string = nog geen passende foto.
const RIJEN: Rij[] = [
  { slug: "pond-survey", href: "/vijvers", beeld: F07_2 },
  { slug: "water-systems", href: "/vijvers", beeld: F10 },
  { slug: "pond-autumn-service", href: "/vijvers", beeld: F05 },
  { slug: "leaf-net", href: "/vijvers", beeld: "foto bij Bladnet plaatsen" },
  { slug: "winterising", href: "/vijvers", beeld: "foto bij Winterklaar maken" },
  { slug: "maintenance-subscription", href: "/vijvers", beeld: F01 },
  { slug: "consultancy", href: "/tuinen", beeld: "foto bij Advies op locatie" },
  { slug: "garden-design", href: "/tuinen", beeld: "foto bij Tuinontwerp" },
  { slug: "planting-habitat", href: "/tuinen", beeld: SFEER_WEIDE },
  { slug: "garden-transformation", href: "/tuinen", beeld: "foto bij Bestaande tuin omvormen" },
  { slug: "implementation", href: "/tuinen", beeld: T01 },
]

const DIENSTEN: (Rij & { dienst: Service })[] = RIJEN.map((r) => {
  const dienst = SERVICES.find((s) => s.slug === r.slug)
  if (!dienst) throw new Error(`Onbekende dienst: ${r.slug}`)
  return { ...r, dienst }
})

const nr = (n: number) => String(n + 1).padStart(2, "0")

export function WatIkDoe() {
  return (
    <section className="vp-diensten-blok" aria-labelledby="h-diensten">
      <div className="vp-kolom vp-diensten" data-diensten>
        <h2 className="lbl" id="h-diensten">
          Wat ik doe · {DIENSTEN.length} diensten
        </h2>
        <ul className="vp-namen">
          {DIENSTEN.map((d, n) => (
            <li key={d.slug} className="vp-op" data-zie style={{ "--i": n % 2 } as CSSProperties}>
              <Link className="syne" href={d.href} data-naam={n}>
                <span className="vp-naam">
                  {d.dienst.title.nl}
                  <wbr />
                  <sup>{nr(n)}</sup>
                </span>
                <span className="vp-uitleg">{d.dienst.summary.nl}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="vp-terzijde">
          <Link className="lnk" href="/vijvers">
            Alles over vijvers →
          </Link>
          <Link className="lnk" href="/tuinen">
            Alles over tuinen →
          </Link>
        </div>
      </div>
      <div className="vp-zwerf" aria-hidden="true" data-zwerf>
        {DIENSTEN.map((d, n) => (
          <div key={d.slug} className="vp-zwerf-item" data-beeld={n}>
            {typeof d.beeld === "string" ? (
              <GeenFoto wat={d.beeld} className="vp-zwerf-foto" />
            ) : (
              <Foto foto={d.beeld} sizes="360px" className="vp-zwerf-foto" />
            )}
            <p className="vp-bijschrift">{d.dienst.summary.nl}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

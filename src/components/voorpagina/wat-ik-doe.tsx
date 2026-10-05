import Link from "next/link"
import { Foto, GeenFoto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { SERVICES, type Service } from "@/lib/data/services"
import { Beide, T } from "@/components/taal"
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
          <Beide nl={`Wat ik doe · ${DIENSTEN.length} diensten`} en={`What I do · ${DIENSTEN.length} services`} />
        </h2>
        {/* Zoals oudolf.com: de diensten als één lopende zin, gescheiden door
            komma's, met het nummer klein ervoor en een punt aan het eind.
            Twee zinnen: vijvers en tuinen (eigenaar, 5 okt 2026: "speelser"). */}
        {(["/vijvers", "/tuinen"] as const).map((groep) => {
          const rij = DIENSTEN.filter((d) => d.href === groep)
          return (
            <div key={groep} className="vp-zin-lijst syne" data-zie>
              <span className="lbl vp-zin-kop"><T t={groep === "/vijvers" ? { nl: "Vijvers", en: "Ponds" } : { nl: "Tuinen", en: "Gardens" }} /></span>
              {rij.map((d, k) => {
                const n = DIENSTEN.indexOf(d)
                return (
                  <span key={d.slug} className="vp-zin-item">
                    <Link href={d.href} data-naam={n}>
                      <sup>{nr(n)}</sup>
                      <T t={d.dienst.title} />
                      <span className="vp-uitleg"><T t={d.dienst.summary} /></span>
                    </Link>
                    <span className="vp-komma">{k < rij.length - 1 ? "," : "."}</span>{" "}
                    <span className="vp-inline" aria-hidden="true">
                      {typeof d.beeld === "string" ? (
                        <GeenFoto wat={d.beeld} className="vp-inline-foto" />
                      ) : (
                        <Foto foto={d.beeld} sizes="90vw" className="vp-inline-foto" />
                      )}
                    </span>
                  </span>
                )
              })}
            </div>
          )
        })}
        <div className="vp-terzijde">
          <Link className="lnk" href="/vijvers">
            <T t={{ nl: "Alles over vijvers →", en: "All about ponds →" }} />
          </Link>
          <Link className="lnk" href="/tuinen">
            <T t={{ nl: "Alles over tuinen →", en: "All about gardens →" }} />
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
            <p className="vp-bijschrift"><T t={d.dienst.summary} /></p>
          </div>
        ))}
      </div>
    </section>
  )
}

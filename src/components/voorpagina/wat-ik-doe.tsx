import Link from "next/link"
import { Foto } from "@/components/foto"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { T, type Tekst } from "@/components/taal"
import { F10, T01 } from "./beelden"
import { Plant } from "@/components/plant"
import { Stapel } from "@/components/stapel"

// Wat ik doe als drie ruime kaarten (eigenaar, 18 okt 2026: de kaarten van de
// zijtak "zijn beter verdeeld, meer negatieve ruimte", plus borderpakketten):
// nummer, naam, één zin, de onderdelen als labels, een link en onderaan de foto.
// Verving de lopende zin met meelopend beeld. Op één kolom stapelen ze bij het
// scrollen (Stapel).

type Kaart = { href: string; naam: Tekst; zin: Tekst; delen: Tekst[]; link: Tekst; foto: FotoData }

const KAARTEN: Kaart[] = [
  {
    href: "/vijvers",
    naam: { nl: "Vijvers", en: "Ponds" },
    zin: { nl: "Water dat zijn weg vindt, schoon blijft en bij de tuin hoort.", en: "Water that finds its way, stays clear and belongs to the garden." },
    delen: [
      { nl: "Diagnose", en: "Diagnosis" },
      { nl: "Renovatie", en: "Renovation" },
      { nl: "Aanleg", en: "Build" },
      { nl: "Onderhoud", en: "Care" },
    ],
    link: { nl: "Bekijk vijvers", en: "See ponds" },
    foto: F10,
  },
  {
    href: "/tuinen",
    naam: { nl: "Tuinen", en: "Gardens" },
    zin: { nl: "Natuurlijke tuinen die met de seizoenen meegroeien.", en: "Natural gardens that grow with the seasons." },
    delen: [
      { nl: "Ontwerp", en: "Design" },
      { nl: "Aanleg", en: "Build" },
      { nl: "Beplanting", en: "Planting" },
      { nl: "Onderhoud", en: "Care" },
    ],
    link: { nl: "Bekijk tuinen", en: "See gardens" },
    foto: T01,
  },
  {
    href: "/tuinen/borderpakketten",
    naam: { nl: "Border\u00ADpakketten", en: "Border packages" },
    zin: { nl: "Een complete border met plantlijst en plan, of een op maat.", en: "A complete border with plant list and plan, or a custom one." },
    delen: [
      { nl: "8 pakketten", en: "8 packages" },
      { nl: "5, 10 of 15 m²", en: "5, 10 or 15 m²" },
      { nl: "Op maat", en: "Custom" },
    ],
    link: { nl: "Bekijk pakketten", en: "See packages" },
    foto: {
      src: "/borderpakketten/vlinderborder.jpg",
      width: 1600,
      height: 1200,
      alt: "Een bloeiende border met zonnehoed en siergras.",
      label: "Sfeerbeeld",
      en: { alt: "A flowering border with coneflowers and ornamental grass.", label: "Mood image" },
    },
  },
]

const nr = (n: number) => String(n + 1).padStart(2, "0")

export function WatIkDoe() {
  return (
    <section className="vp-diensten-blok met-groen" aria-labelledby="h-diensten">
      <Plant naam="bladtak" className="plant-hang plant-rand links" />
      <div className="vp-kolom">
        <h2 className="lbl vp-diensten-kop" id="h-diensten">
          <T t={{ nl: "Wat ik doe", en: "What I do" }} />
        </h2>
        <Stapel className="vp-kaarten">
          {KAARTEN.map((k, n) => (
            <li key={k.href} className="vp-kaart">
              <div className="vp-kaart-tekst">
                <p className="lbl vp-kaart-nr">{nr(n)}</p>
                <h3 className="vp-kaart-naam"><T t={k.naam} /></h3>
                <p className="vp-kaart-zin"><T t={k.zin} /></p>
                <ul className="vp-kaart-delen">
                  {k.delen.map((d, i) => (
                    <li key={i} className="lbl"><T t={d} /></li>
                  ))}
                </ul>
                <Link href={k.href} className="vp-kaart-link">
                  <T t={k.link} />
                  <span className="vp-kaart-pijl" aria-hidden="true">→</span>
                </Link>
              </div>
              <Foto foto={k.foto} sizes="(min-width: 1024px) 30vw, 90vw" className="vp-kaart-foto" />
            </li>
          ))}
        </Stapel>
      </div>
    </section>
  )
}

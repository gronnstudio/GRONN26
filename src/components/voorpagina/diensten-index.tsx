import Link from "next/link"
import { Foto } from "@/components/foto"
import { Figuur, Markering } from "@/components/ontwerp"
import type { Foto as FotoData } from "@/lib/data/vijverrenovatie"
import { T, type Tekst } from "@/components/taal"
import { F01, T01 } from "./beelden"

// 02 Wat ik maak: een index, geen kaarten. Drie grote woorden onder elkaar;
// op desktop wisselt rechts het beeld mee met de rij die je aanwijst (CSS
// :has, ontwerp.css), op de telefoon heeft elke rij een klein eigen beeld.

const BORDER: FotoData = {
  src: "/borderpakketten/vlinderborder.jpg",
  width: 1600,
  height: 1200,
  alt: "Een bloeiende border met zonnehoed en siergras.",
  label: "Sfeerbeeld",
  en: { alt: "A flowering border with coneflowers and ornamental grass.", label: "Mood image" },
}

type Rij = { href: string; naam: Tekst; zin: Tekst; delen: Tekst; foto: FotoData; code: string }

const RIJEN: Rij[] = [
  {
    href: "/vijvers",
    naam: { nl: "Vijvers", en: "Ponds" },
    zin: { nl: "Renovatie, aanleg en onderhoud. Water dat zijn weg vindt, schoon blijft en bij de tuin hoort.", en: "Renovation, building and care. Water that finds its way, stays clear and belongs to the garden." },
    delen: { nl: "Diagnose · Renovatie · Aanleg · Onderhoud", en: "Diagnosis · Renovation · Build · Care" },
    foto: F01,
    code: "GR/001 · F01",
  },
  {
    href: "/tuinen",
    naam: { nl: "Tuinen", en: "Gardens" },
    zin: { nl: "Natuurlijke tuinen die met de seizoenen meegroeien, van ontwerp tot de eerste snoei.", en: "Natural gardens that grow with the seasons, from design to the first pruning." },
    delen: { nl: "Ontwerp · Aanleg · Beplanting · Onderhoud", en: "Design · Build · Planting · Care" },
    foto: T01,
    code: "GR/002 · T01",
  },
  {
    href: "/tuinen/borderpakketten",
    naam: { nl: "Borders", en: "Borders" },
    zin: { nl: "Een complete border met plantlijst en plan, aangeplant of om zelf te planten. Of een op maat.", en: "A complete border with plant list and plan, planted or to plant yourself. Or a custom one." },
    delen: { nl: "8 pakketten · 5, 10 of 15 m² · Op maat", en: "8 packages · 5, 10 or 15 m² · Custom" },
    foto: BORDER,
    code: "Sfeerbeeld",
  },
]

export function DienstenIndex() {
  return (
    <section className="wrap sectie-ruim" aria-labelledby="h-diensten">
      <Markering nr="02" naam={{ nl: "Wat ik maak", en: "What I make" }} />
      <h2 id="h-diensten" className="sr-only"><T t={{ nl: "Wat ik maak", en: "What I make" }} /></h2>
      <div className="index">
        <ul className="index-lijst">
          {RIJEN.map((r, i) => (
            <li key={r.href} className="index-rij">
              <Link href={r.href} className="index-link">
                <span className="index-nr meta">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="index-woord t-index"><T t={r.naam} /></h3>
                <Foto foto={r.foto} sizes="72px" className="index-duim" />
                <span className="index-tekst">
                  <span className="t-body"><T t={r.zin} /></span>
                  <span className="index-delen meta"><T t={r.delen} /></span>
                </span>
                <span className="index-pijl" aria-hidden>
                  <svg viewBox="0 0 11 14" width="14" height="18"><path d="M0 12.06 7.5 4.6 1 4.51V2.5h10v10.06H9l-.06-6.51-7.5 7.45z" fill="currentColor" /></svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="index-beelden" aria-hidden>
          {RIJEN.map((r) => (
            <Figuur key={r.href} foto={r.foto} sizes="40vw" vorm="h-full" code={r.code} className="index-beeld" />
          ))}
        </div>
      </div>
    </section>
  )
}

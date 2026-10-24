import Link from "next/link"
import { T, type Tekst } from "@/components/taal"
import { priceHint } from "@/lib/data/pricing"
import { BORDER_PRIJS } from "@/lib/data/borderpakketten"
import { priceLabel } from "@/lib/format"

// De voorpagina als plattegrond (tuinplan, 24 okt 2026): één tuin van boven,
// getekend als een ontwerptekening. Elke zone is een dienst en een link;
// de legenda ernaast zegt wat het is en wat het kost (de prijzen uit
// pricing.ts en borderpakketten.ts, nooit hier verzonnen). Wijs je een zone
// of een regel in de legenda aan, dan lichten beide op (CSS :has, geen JS).

const vanaf = (slug: string, per?: Tekst): Tekst => {
  const p = priceHint(slug)
  if (!p) return { nl: "Op maat", en: "Custom" }
  const bedrag = priceLabel(p.from)
  if (p.monthly) return { nl: `Vanaf ${bedrag} per maand`, en: `From ${bedrag} a month` }
  return per ? { nl: `Vanaf ${bedrag} ${typeof per === "string" ? per : per.nl}`, en: `From ${bedrag} ${typeof per === "string" ? per : per.en}` } : { nl: `Vanaf ${bedrag}`, en: `From ${bedrag}` }
}

type Zone = { id: string; nr: number; href: string; naam: Tekst; zin: Tekst; prijs: Tekst }

export const ZONES: Zone[] = [
  {
    id: "vijver",
    nr: 1,
    href: "/vijvers",
    naam: { nl: "Vijver", en: "Pond" },
    zin: { nl: "Doorlichting, renovatie, aanleg en de najaarsbeurt.", en: "Survey, renovation, build and the autumn service." },
    prijs: vanaf("pond-survey"),
  },
  {
    id: "border",
    nr: 2,
    href: "/tuinen/borderpakketten",
    naam: { nl: "Border", en: "Border" },
    zin: { nl: "Acht complete borderpakketten met plan, of een op maat.", en: "Eight complete border packages with a plan, or a custom one." },
    prijs: { nl: `${priceLabel(BORDER_PRIJS.aangeplant)} per m², aangeplant`, en: `${priceLabel(BORDER_PRIJS.aangeplant)} per m², planted` },
  },
  {
    id: "terras",
    nr: 3,
    href: "/werk/terras-geulle",
    naam: { nl: "Terras", en: "Patio" },
    zin: { nl: "Bestrating en aanleg. In Geulle: 24 m² in twee dagen.", en: "Paving and build. In Geulle: 24 m² in two days." },
    prijs: { nl: "Vaste prijs na offerte", en: "Fixed price after a quote" },
  },
  {
    id: "tuin",
    nr: 4,
    href: "/tuinen",
    naam: { nl: "Ontwerp van de hele tuin", en: "Design of the whole garden" },
    zin: { nl: "Een plan voor water, bodem, licht en beplanting samen.", en: "One plan for water, soil, light and planting together." },
    prijs: vanaf("garden-design"),
  },
  {
    id: "onderhoud",
    nr: 5,
    href: "/vijvers",
    naam: { nl: "Onderhoud", en: "Care" },
    zin: { nl: "Elk seizoen even langs, met een vaste datum.", en: "A visit every season, on a fixed date." },
    prijs: vanaf("maintenance-subscription"),
  },
  {
    id: "poort",
    nr: 6,
    href: "/kennismaken",
    naam: { nl: "De poort: kennismaken", en: "The gate: get in touch" },
    zin: { nl: "Vertel waar je aan denkt. Ik kom kijken.", en: "Tell me what you have in mind. I’ll come and look." },
    prijs: { nl: "Gratis gesprek", en: "Free conversation" },
  },
]

/** Een genummerde aanwijzer op de tekening. */
function Nummer({ x, y, nr }: { x: number; y: number; nr: number }) {
  return (
    <g className="pl-nummer" aria-hidden="true">
      <circle cx={x} cy={y} r="15" />
      <text x={x} y={y + 5} textAnchor="middle">{nr}</text>
    </g>
  )
}

export function Plan() {
  const zone = (id: string) => ZONES.find((z) => z.id === id)!
  const label = (id: string) => {
    const z = zone(id)
    return typeof z.naam === "string" ? z.naam : z.naam.nl
  }
  return (
    <div className="pl">
      <figure className="pl-tekening m-0">
        <svg viewBox="0 0 1000 680" role="img" aria-labelledby="pl-titel" className="pl-svg">
          <title id="pl-titel">Plattegrond van een tuin met vijver, border, terras, bomen en een poort. Elke zone is een link naar die dienst.</title>
          <defs>
            <pattern id="pl-arcering" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" className="pl-lijn-dun" />
            </pattern>
            <pattern id="pl-tegels" width="28" height="28" patternUnits="userSpaceOnUse">
              <rect width="28" height="28" className="pl-tegel" />
            </pattern>
            <pattern id="pl-water" width="40" height="14" patternUnits="userSpaceOnUse">
              <path d="M0 7 q10 -6 20 0 t20 0" className="pl-lijn-dun" fill="none" />
            </pattern>
            <pattern id="pl-planten" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="6" className="pl-lijn-dun" fill="none" />
              <circle cx="26" cy="24" r="7" className="pl-lijn-dun" fill="none" />
              <circle cx="24" cy="6" r="2" className="pl-stip" />
              <circle cx="8" cy="27" r="2" className="pl-stip" />
            </pattern>
          </defs>

          {/* het perceel, met de poort onderin als opening */}
          <path d="M60 60 H940 V620 H540 M460 620 H60 Z" className="pl-grens" />
          {/* de woning (gearceerd, geen zone) */}
          <rect x="360" y="60" width="280" height="120" fill="url(#pl-arcering)" className="pl-woning" />
          <text x="500" y="128" textAnchor="middle" className="pl-tekst">WONING</text>

          {/* 4 · de hele tuin: het gazon/de ondergrond, achter alles */}
          <Link href={zone("tuin").href} className="pl-zone pl-z-tuin" aria-label={label("tuin")}>
            <path d="M72 192 H928 V608 H72 Z" className="pl-vlak pl-vlak-tuin" />
          </Link>

          {/* 3 · terras tegen de woning */}
          <Link href={zone("terras").href} className="pl-zone pl-z-terras" aria-label={label("terras")}>
            <rect x="340" y="180" width="320" height="112" fill="url(#pl-tegels)" className="pl-vlak" />
          </Link>

          {/* 1 · vijver met beekloop */}
          <Link href={zone("vijver").href} className="pl-zone pl-z-vijver" aria-label={label("vijver")}>
            <path d="M120 360 C 110 300, 200 270, 260 300 S 360 330, 350 400 S 300 520, 210 515 S 95 470, 120 360 Z" fill="url(#pl-water)" className="pl-vlak" />
            <path d="M262 300 C 280 260, 250 240, 285 215" className="pl-beek" />
          </Link>

          {/* 2 · border langs de rechterkant */}
          <Link href={zone("border").href} className="pl-zone pl-z-border" aria-label={label("border")}>
            <path d="M800 200 H928 V600 H760 C 800 520, 770 420, 820 360 S 780 240, 800 200 Z" fill="url(#pl-planten)" className="pl-vlak" />
          </Link>

          {/* 5 · bomen: kroonprojecties */}
          <Link href={zone("onderhoud").href} className="pl-zone pl-z-onderhoud" aria-label={label("onderhoud")}>
            <circle cx="150" cy="150" r="62" className="pl-vlak pl-kroon" />
            <circle cx="150" cy="150" r="5" className="pl-stip" />
            <circle cx="860" cy="120" r="46" className="pl-vlak pl-kroon" />
            <circle cx="860" cy="120" r="4" className="pl-stip" />
          </Link>

          {/* het pad van terras naar poort: stapstenen */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={482 + (i % 2 ? 10 : -10)} y={318 + i * 42} width="36" height="22" className="pl-steen" />
          ))}

          {/* 6 · de poort */}
          <Link href={zone("poort").href} className="pl-zone pl-z-poort" aria-label={label("poort")}>
            <rect x="452" y="600" width="96" height="40" className="pl-vlak pl-poort-vak" />
            <path d="M460 620 A 40 40 0 0 1 500 580" className="pl-poort" />
            <path d="M540 620 A 40 40 0 0 0 500 580" className="pl-poort" />
          </Link>

          {/* aanwijzers */}
          <Nummer x={235} y={410} nr={1} />
          <Nummer x={860} y={420} nr={2} />
          <Nummer x={500} y={236} nr={3} />
          <Nummer x={640} y={470} nr={4} />
          <Nummer x={150} y={150} nr={5} />
          <Nummer x={500} y={656} nr={6} />

          {/* noordpijl en schaalstok */}
          <g className="pl-noord" aria-hidden="true">
            <path d="M940 640 l10 -30 l10 30 l-10 -8 z" />
            <text x="950" y="664" textAnchor="middle" className="pl-tekst">N</text>
          </g>
          <g aria-hidden="true">
            <rect x="60" y="644" width="40" height="8" className="pl-schaal-vol" />
            <rect x="100" y="644" width="40" height="8" className="pl-schaal" />
            <rect x="140" y="644" width="40" height="8" className="pl-schaal-vol" />
            <text x="60" y="672" className="pl-tekst">0</text>
            <text x="172" y="672" className="pl-tekst">5 m</text>
          </g>
        </svg>
        <figcaption className="pl-onderschrift">
          <T t={{ nl: "Plattegrond, voorbeeldtuin. Wijs een zone aan of tik erop.", en: "Site plan, sample garden. Point at a zone or tap it." }} />
        </figcaption>
      </figure>

      <ol className="pl-legenda" aria-label="Legenda">
        {ZONES.map((z) => (
          <li key={z.id} className={`pl-leg pl-leg-${z.id}`}>
            <Link href={z.href}>
              <span className="pl-leg-nr" aria-hidden="true">{z.nr}</span>
              <span className="pl-leg-tekst">
                <span className="pl-leg-naam"><T t={z.naam} /></span>
                <span className="pl-leg-zin"><T t={z.zin} /></span>
                <span className="pl-leg-prijs"><T t={z.prijs} /></span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

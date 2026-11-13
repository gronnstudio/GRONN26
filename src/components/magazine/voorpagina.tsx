import Link from "next/link"
import { Foto } from "@/components/foto"
import { euro } from "@/components/diensten/prijs"
import { Pijl } from "@/components/pijl"
import { F01, F02_2, F08_1, F09_2, F10, T02 } from "@/components/voorpagina/beelden"
import { pricingFor } from "@/lib/data/pricing"
import { KLANT_CITAAT, VIJVER } from "@/lib/data/vijverrenovatie"
import { TelLink, VoorNu } from "@/components/handoff/klant"
import { WHATSAPP_FOTO } from "@/components/handoff/voorpagina"
import "./magazine.css"

// De voorpagina als tijdschrift (eigenaar, 13 nov 2026: "een moderne magazine
// achtige architectuur website", "begin nogmaals op nieuw"). Een cover met
// editieregel en coverregels, de inhoud als genummerde rubrieken, één
// reportage in losse beelden met de feiten "in het kort", en de studio.
// Referenties: dejongensvanoranje.nl (tegels, wijkend menu), studioverde.be
// (losse fotocompositie, in het kort), bartoszkolenda.com (één uitspraak over
// de volle breedte). Alleen echte foto's en getallen uit de projectdata.

const prijs = (slug: string) => pricingFor(slug)?.tiers[0]?.amount ?? 0

const EDITIE = "Editie 01 · Winter 2026/27"

const COVERREGELS = [
  { nr: "01", kop: "Plan nu, dan begin ik in maart", sub: "Start een project", href: "/start-een-project", actie: true },
  { nr: "02", kop: "Twee vijvers, één watersysteem", sub: "Reportage · Vijverrenovatie", href: "/werk/vijverrenovatie" },
  { nr: "03", kop: "Wat kost een vijver?", sub: "De vaste prijzen", href: "/vijvers" },
  { nr: "04", kop: "24 m² terras in Geulle", sub: "Reportage · Tuinen", href: "/werk/terras-geulle" },
]

const RUBRIEKEN = [
  { nr: "01", naam: "Werk", zin: "Reportages van echt werk, van eerste schop tot beplanting.", href: "/werk", foto: F10 },
  { nr: "02", naam: "Vijvers", zin: `Doorlichting ${euro(prijs("pond-survey"))}, onderhoud vanaf ${euro(prijs("maintenance-subscription"))} per maand.`, href: "/vijvers", foto: F08_1 },
  { nr: "03", naam: "Tuinen", zin: `Kleine tuin of terras vanaf ${euro(prijs("implementation"))}, vaste prijs vooraf.`, href: "/tuinen", foto: T02 },
  { nr: "04", naam: "Studio", zin: "Eén hovenier, één aanspreekpunt, van eerste gesprek tot oplevering.", href: "/over", foto: F09_2 },
  { nr: "05", naam: "Journaal", zin: "Korte stukken over water, planten en wat er deze maand speelt.", href: "/journaal", foto: F01 },
]

// "In het kort": alleen wat in de projectdata staat (VIJVER.omschrijving en .status).
const IN_HET_KORT = [
  ["Opdracht", VIJVER.categorie],
  ["Water", "Twee vijvers, circa 5.000 liter"],
  ["Onderdelen", "Waterval en beekloop in één systeem"],
  ["Werk", "Circa 120 uur"],
  ["Status", VIJVER.status],
]

export function MagazineVoorpagina() {
  return (
    <div className="ho mg">
      {/* ── De cover ─────────────────────────────────────────────── */}
      <section className="mg-cover" aria-labelledby="mg-titel">
        <div className="mg-cover-beeld" data-v="1">
          <Foto foto={F01} sizes="100vw" priority className="mg-cover-foto" />
        </div>
        <div className="mg-cover-inhoud">
          <p className="mg-regel ho-lbl">
            <span>{EDITIE}</span>
            <span>Stein en omgeving</span>
          </p>
          <h1 id="mg-titel" className="mg-titel">
            <span className="mg-titel-klein">GRØNN Studio</span>
            Vijvers en natuurlijke tuinen, met een vaste prijs vooraf.
          </h1>
          <ol className="mg-coverregels">
            {COVERREGELS.map((r) => (
              <li key={r.nr}>
                <Link href={r.href} transitionTypes={["schuif"]} className="mg-coverregel" data-actie={r.actie || undefined}>
                  <span className="ho-lbl">{r.nr}</span>
                  <span className="mg-coverregel-kop">{r.kop}</span>
                  <span className="ho-lbl mg-coverregel-sub">
                    {r.sub} <Pijl />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── De uitspraak ─────────────────────────────────────────── */}
      <section className="mg-blok mg-kolom" aria-labelledby="mg-uitspraak">
        <p className="ho-lbl">Van de maker</p>
        <h2 id="mg-uitspraak" className="mg-uitspraak">
          Een tuin is geen product maar een plek. Ik ontwerp hem, reken hem door en leg hem zelf aan, <em>en je weet vooraf wat het kost.</em>
        </h2>
      </section>

      {/* ── De inhoud ────────────────────────────────────────────── */}
      <section className="mg-blok mg-kolom" id="inhoud-editie" aria-labelledby="mg-inhoud">
        <div className="mg-kopregel">
          <h2 id="mg-inhoud" className="ho-lbl">Inhoud</h2>
          <p className="ho-lbl">{EDITIE}</p>
        </div>
        <ol className="mg-inhoud">
          {RUBRIEKEN.map((r) => (
            <li key={r.nr}>
              <Link href={r.href} transitionTypes={["schuif"]} className="mg-rubriek">
                <span className="ho-lbl mg-rubriek-nr">{r.nr}</span>
                <span className="mg-rubriek-naam">{r.naam}</span>
                <span className="mg-rubriek-zin">{r.zin}</span>
                <span className="mg-rubriek-beeld" aria-hidden>
                  <Foto foto={{ ...r.foto, alt: "" }} sizes="220px" className="mg-rubriek-foto" />
                </span>
                <Pijl className="mg-rubriek-pijl" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ── De reportage ─────────────────────────────────────────── */}
      <section className="mg-blok mg-kolom" id="projecten" aria-labelledby="mg-reportage">
        <div className="mg-kopregel">
          <p className="ho-lbl">Reportage · GR / 001</p>
          <p className="ho-lbl">2026</p>
        </div>
        <div className="mg-reportage">
          <div className="mg-reportage-tekst">
            <h2 id="mg-reportage" className="mg-h2">{VIJVER.titel}</h2>
            <p>{VIJVER.kaarttekst}</p>
            <dl className="mg-kort">
              {IN_HET_KORT.map(([k, v]) => (
                <div key={k}>
                  <dt className="ho-lbl">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/werk/vijverrenovatie" transitionTypes={["schuif"]} className="ho-pijl">
              Lees de reportage <Pijl />
            </Link>
          </div>
          <div className="mg-beelden">
            <div className="mg-beeld mg-beeld-groot" data-v="0.6">
              <Foto foto={F10} sizes="(min-width: 1024px) 40vw, 80vw" className="mg-foto-liggend" />
            </div>
            <div className="mg-beeld mg-beeld-klein" data-v="3">
              <Foto foto={F08_1} sizes="(min-width: 1024px) 18vw, 44vw" className="mg-foto-staand" />
            </div>
          </div>
        </div>
        <figure className="mg-voornu">
          <VoorNu voor={F02_2} nu={F01} sizes="(min-width: 1024px) 60vw, 94vw" />
          <blockquote className="mg-citaat">
            <p>“{KLANT_CITAAT.tekst.nl}”</p>
            <footer className="ho-lbl">{KLANT_CITAAT.bron}</footer>
          </blockquote>
        </figure>
      </section>

      {/* ── De studio ────────────────────────────────────────────── */}
      <section className="mg-blok mg-kolom mg-studio" aria-labelledby="mg-studio">
        <div className="mg-studio-beeld" data-v="0.6">
          <Foto foto={F09_2} sizes="(min-width: 1024px) 34vw, 70vw" className="mg-foto-staand" />
        </div>
        <div className="mg-studio-tekst">
          <p className="ho-lbl">Colofon · De studio</p>
          <h2 id="mg-studio" className="mg-h2">Klein in schaal. Groot in aandacht.</h2>
          <p>
            Ik ben Nick, en GRØNN Studio is mijn eenmanszaak voor tuinen en vijvers in Stein en omgeving. Eén aanspreekpunt van eerste gesprek tot
            oplevering, aandacht voor details en technische kennis van water.
          </p>
          <Link href="/over" transitionTypes={["schuif"]} className="ho-pijl">
            Meer over mij <Pijl />
          </Link>
        </div>
      </section>

      {/* ── Het slot ─────────────────────────────────────────────── */}
      <section className="ho-eind" id="ho-eind" aria-labelledby="ho-eind-kop">
        <div className="ho-kolom">
          <p className="ho-lbl">Start een project</p>
          <h2 id="ho-eind-kop" className="ho-eind-kop">Er begint iets moois buiten.</h2>
          <p>Een tuin die niet meer bij je past? Een vijver die aandacht nodig heeft? Vertel me over je plannen. Plan je nu, dan begin ik in maart.</p>
          <div className="ho-knoppen">
            <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="eind" className="ho-knop ho-knop-oranje">
              Start jouw project <Pijl />
            </TelLink>
            <TelLink href={WHATSAPP_FOTO} gebeurtenis="cta_whatsapp_foto" plek="eind" className="ho-knop ho-knop-lijn">
              Stuur een foto <Pijl />
            </TelLink>
          </div>
        </div>
      </section>
    </div>
  )
}

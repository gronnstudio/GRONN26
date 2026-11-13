import Link from "next/link"
import { Foto } from "@/components/foto"
import { WERK } from "@/components/werk/projecten"
import { F04_2, F08_1, F08_2, F10, F11 } from "@/components/voorpagina/beelden"
import { fotosVoor } from "@/lib/data/vijverrenovatie"
import { TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { pricingFor } from "@/lib/data/pricing"
import { BUSINESS } from "@/lib/business"
import { kies } from "@/components/taal"
import { TelLink } from "@/components/handoff/klant"
import "./ar.css"

// De voorpagina, van nul (eigenaar, 13 nov 2026: "Architectuur stijl! minder
// magazine", "je hergebruikt te veel"). Elk onderwerp één keer: opening,
// uitspraak met de draaiende band, het werk als index, de twee diensten met
// prijs, de werkwijze, de maker en het slot. Alleen echte foto's en prijzen
// uit pricing.ts. Alle beweging in CSS, stil bij minder beweging.

const euro = (n: number) => `€ ${n.toLocaleString("nl-NL")}`
const vanaf = (slug: string) => {
  const t = pricingFor(slug)?.tiers ?? []
  return t.length ? Math.min(...t.map((x) => x.amount)) : 0
}

// de opening: drie rustige, strakke beelden die om de beurt uitzoomen
const OPENING = [F10, TERRAS_FOTOS.reeks[0], fotosVoor("F09")[0]]
const BAND = [F04_2, F10, TERRAS_FOTOS.hoofd, F08_1, TERRAS_FOTOS.reeks[1], F11]
const WHATSAPP = `${BUSINESS.whatsapp}?text=${encodeURIComponent("Hoi Nick, hier een foto van mijn tuin/vijver. Kun je even meekijken?")}`

const STAPPEN = [
  ["Kennismaken", "Een gesprek bij jou in de tuin, of eerst een foto via WhatsApp."],
  ["Vaste prijs", "Je krijgt vooraf een prijs die vaststaat, met wat er wel en niet in zit."],
  ["Aanleg", "Ik doe het werk zelf, van grondwerk tot de laatste plant."],
] as const

export function ArVoorpagina() {
  return (
    <div className="ar">
      {/* ── Opening ─────────────────────────────────────────────── */}
      <section className="ar-raster ar-opening" aria-labelledby="ar-titel">
        <div className="ar-opening-tekst">
          <p className="ar-lbl ar-in" style={{ "--d": 0 } as React.CSSProperties}>GRØNN Studio · sinds 2026</p>
          <h1 id="ar-titel" className="ar-titel">
            <span className="ar-regel"><span style={{ "--d": 1 } as React.CSSProperties}>Vijvers en</span></span>
            <span className="ar-regel"><span style={{ "--d": 2 } as React.CSSProperties}>natuurlijke</span></span>
            <span className="ar-regel"><span style={{ "--d": 3 } as React.CSSProperties}>tuinen.</span></span>
          </h1>
          <p className="ar-opening-zin ar-in" style={{ "--d": 4 } as React.CSSProperties}>
            Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.
          </p>
          <div className="ar-knoppen ar-in" style={{ "--d": 5 } as React.CSSProperties}>
            <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="opening" className="ar-knop ar-knop-oranje">Start een project</TelLink>
            <TelLink href={WHATSAPP} gebeurtenis="cta_whatsapp_foto" plek="opening" className="ar-knop ar-knop-lijn">Stuur een foto</TelLink>
          </div>
        </div>
        <div className="ar-opening-beeld" aria-label="Beelden van het werk">
          {OPENING.map((f, i) => (
            <div key={f.src} className="ar-dia" style={{ "--n": i } as React.CSSProperties} aria-hidden={i > 0 || undefined}>
              <Foto foto={i > 0 ? { ...f, alt: "" } : f} sizes="(min-width: 1024px) 45vw, 100vw" priority={i === 0} className="ar-dia-foto" />
            </div>
          ))}
          <p className="ar-lbl ar-opening-onderschrift">Vijverrenovatie en terras Geulle, 2026</p>
        </div>
      </section>

      {/* ── Uitspraak en de draaiende band ──────────────────────── */}
      <section className="ar-donker" aria-labelledby="ar-uitspraak">
        <div className="ar-raster ar-uitspraak-blok">
          <p className="ar-lbl">Van de maker</p>
          <h2 id="ar-uitspraak" className="ar-uitspraak">
            Een tuin is geen product maar een plek. Ik ontwerp hem, reken hem door en leg hem zelf aan, <em>en je weet vooraf wat het kost.</em>
          </h2>
        </div>
        <div className="ar-band">
          <div className="ar-band-baan">
            {[0, 1].map((ronde) => (
              <div key={ronde} className="ar-band-reeks" aria-hidden={ronde === 1 || undefined}>
                {BAND.map((f) => (
                  <Foto key={f.src} foto={ronde === 1 ? { ...f, alt: "" } : f} sizes="(min-width: 900px) 24vw, 60vw" className="ar-band-foto" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Werk als index ──────────────────────────────────────── */}
      <section className="ar-raster ar-blok" aria-labelledby="ar-werk">
        <div className="ar-blokkop">
          <p className="ar-lbl">01</p>
          <h2 id="ar-werk" className="ar-h2">Werk</h2>
          <Link href="/werk" className="ar-lbl ar-lijnlink" transitionTypes={["schuif"]}>Alle projecten</Link>
        </div>
        <div className="ar-index" role="list">
          <div className="ar-index-kop ar-lbl" aria-hidden>
            <span>Nr.</span><span>Project</span><span>Soort</span><span>Plaats</span><span>Jaar</span>
          </div>
          {WERK.map((p) => (
            <Link key={p.href} href={p.href} role="listitem" className="ar-index-rij" transitionTypes={["schuif"]}>
              <span className="ar-lbl">{p.code.replace(" ", "")}</span>
              <span className="ar-index-naam">{kies(p.naam, "nl")}</span>
              <span className="ar-index-cel">{kies(p.type, "nl")}</span>
              <span className="ar-index-cel">{p.plaats === "—" ? "Limburg" : p.plaats}</span>
              <span className="ar-index-cel tabular-nums">{p.jaar}</span>
              <span className="ar-index-beeld" aria-hidden>
                <Foto foto={{ ...p.foto, alt: "" }} sizes="320px" className="ar-index-foto" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Diensten ───────────────────────────────────────────── */}
      <section className="ar-raster ar-blok" aria-labelledby="ar-diensten">
        <div className="ar-blokkop">
          <p className="ar-lbl">02</p>
          <h2 id="ar-diensten" className="ar-h2">Diensten</h2>
        </div>
        <div className="ar-diensten">
          <Link href="/vijvers" className="ar-dienst" transitionTypes={["schuif"]}>
            <h3 className="ar-h3">Vijvers</h3>
            <p>Een heldere vijver met een filter dat werkt. Aanleg, renovatie en vast onderhoud.</p>
            <dl className="ar-prijzen">
              <div><dt>Doorlichting</dt><dd>vanaf {euro(vanaf("pond-survey"))}</dd></div>
              <div><dt>Onderhoud</dt><dd>vanaf {euro(vanaf("maintenance-subscription"))} p/m</dd></div>
            </dl>
            <span className="ar-lbl ar-lijnlink">Naar vijvers</span>
          </Link>
          <Link href="/tuinen" className="ar-dienst" transitionTypes={["schuif"]}>
            <h3 className="ar-h3">Tuinen</h3>
            <p>Een natuurlijke tuin die bij je huis en je bodem past. Ontwerp, aanleg en beplanting.</p>
            <dl className="ar-prijzen">
              <div><dt>Kleine tuin of terras</dt><dd>vanaf {euro(vanaf("implementation"))}</dd></div>
              <div><dt>Borderpakketten</dt><dd>per m²</dd></div>
            </dl>
            <span className="ar-lbl ar-lijnlink">Naar tuinen</span>
          </Link>
        </div>
      </section>

      {/* ── Werkwijze ──────────────────────────────────────────── */}
      <section className="ar-raster ar-blok" aria-labelledby="ar-werkwijze">
        <div className="ar-blokkop">
          <p className="ar-lbl">03</p>
          <h2 id="ar-werkwijze" className="ar-h2">Werkwijze</h2>
        </div>
        <ol className="ar-stappen">
          {STAPPEN.map(([kop, zin], i) => (
            <li key={kop} className="ar-op">
              <span className="ar-stap-nr">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ar-h3">{kop}</h3>
              <p>{zin}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── De maker ───────────────────────────────────────────── */}
      <section className="ar-raster ar-blok ar-maker" aria-labelledby="ar-maker">
        <div className="ar-maker-beeld">
          <Foto foto={F08_2} sizes="(min-width: 1024px) 34vw, 90vw" className="ar-maker-foto" />
        </div>
        <div className="ar-maker-tekst">
          <p className="ar-lbl">04 · Studio</p>
          <h2 id="ar-maker" className="ar-h2">Eén maker, van eerste schets tot laatste plant.</h2>
          <p>Ik ben Nick. GRØNN Studio is mijn eenmanszaak voor vijvers en tuinen in Stein en omgeving. Je hebt één aanspreekpunt, en wie de prijs maakt, legt de tuin ook aan.</p>
          <Link href="/over" className="ar-lbl ar-lijnlink" transitionTypes={["schuif"]}>Over mij</Link>
        </div>
      </section>

      {/* ── Slot ───────────────────────────────────────────────── */}
      <section className="ar-slot" aria-labelledby="ar-slot">
        <div className="ar-raster">
          <p className="ar-lbl">Plan nu, dan begin ik in maart</p>
          <h2 id="ar-slot" className="ar-slot-kop">Vertel wat je buiten wilt.</h2>
          <div className="ar-knoppen">
            <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="slot" className="ar-knop ar-knop-oranje">Start een project</TelLink>
            <TelLink href={WHATSAPP} gebeurtenis="cta_whatsapp_foto" plek="slot" className="ar-knop ar-knop-lijn-licht">Stuur een foto</TelLink>
          </div>
        </div>
      </section>
    </div>
  )
}

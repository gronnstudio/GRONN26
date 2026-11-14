import Link from "next/link"
import { Foto } from "@/components/foto"
import { WERK } from "@/components/werk/projecten"
import { F04_2, F08_1, F08_2, F10, F11 } from "@/components/voorpagina/beelden"
import { VIJVER } from "@/lib/data/vijverrenovatie"
import { fotosVoor } from "@/lib/data/vijverrenovatie"
import { TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { SFEER, SFEER_BAND } from "@/lib/data/sfeer"
import { pricingFor } from "@/lib/data/pricing"
import { BUSINESS } from "@/lib/business"
import { T, Beide } from "@/components/taal"
import { TelLink } from "@/components/handoff/klant"
import type { L } from "@/lib/i18n"
import "./ar.css"

const START: L = { nl: "Start een project", en: "Start a project" }
const FOTO: L = { nl: "Stuur een foto", en: "Send a photo" }

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
// elk beeld draagt zijn eigen onderschrift, dat meewisselt (eigenaar, 14 nov 2026)
const OPENING = [
  { foto: F10, tekst: { nl: "Vijverrenovatie, waterval en beekloop", en: "Pond renovation, waterfall and stream" } },
  { foto: TERRAS_FOTOS.reeks[0], tekst: { nl: "Terras en tegelpad, Geulle", en: "Terrace and paved path, Geulle" } },
  { foto: fotosVoor("F09")[0], tekst: { nl: "Vijverrenovatie, nieuwe beplanting", en: "Pond renovation, new planting" } },
]
// de band: projectkaarten met naam en soort eronder (dejongensvanoranje.nl)
const VIJ = { titel: { nl: "Vijverrenovatie", en: "Pond renovation" }, soort: { nl: "Ontwerp & aanleg", en: "Design & build" }, href: "/werk/vijverrenovatie" }
const TER = { titel: { nl: "Terras Geulle", en: "Terrace Geulle" }, soort: { nl: "Aanleg", en: "Build" }, href: "/werk/terras-geulle" }
const BAND = [
  { foto: F04_2, ...VIJ }, SFEER_BAND[0], { foto: TERRAS_FOTOS.hoofd, ...TER }, SFEER_BAND[1], { foto: F11, ...VIJ }, SFEER_BAND[2],
  { foto: TERRAS_FOTOS.reeks[1], ...TER }, SFEER_BAND[3], { foto: F08_1, ...VIJ }, SFEER_BAND[4], { foto: TERRAS_FOTOS.reeks[0], ...TER },
]
// "in het kort" bij het uitgelichte project (studioverde.be), met maatlijnen (Blueprint)
const KORT: [L, string | L][] = [
  [{ nl: "Opdracht", en: "Brief" }, VIJVER.categorie],
  [{ nl: "Water", en: "Water" }, { nl: "Twee vijvers, circa 5.000 liter", en: "Two ponds, about 5,000 litres" }],
  [{ nl: "Onderdelen", en: "Parts" }, { nl: "Waterval en beekloop in één systeem", en: "Waterfall and stream in one system" }],
  [{ nl: "Werk", en: "Work" }, { nl: "Circa 120 uur", en: "About 120 hours" }],
  [{ nl: "Status", en: "Status" }, VIJVER.status],
]
const WHATSAPP = `${BUSINESS.whatsapp}?text=${encodeURIComponent("Hoi Nick, hier een foto van mijn tuin/vijver. Kun je even meekijken?")}`

// Vijf stappen (eigenaar, 14 nov 2026: "Maak hier 5 stappen").
const STAPPEN = [
  [{ nl: "Kennismaken", en: "Get in touch" }, { nl: "Stuur een foto via WhatsApp of bel. Binnen een dag hoor je of ik kan helpen.", en: "Send a photo via WhatsApp or call. Within a day you'll know whether I can help." }],
  [{ nl: "Bezoek", en: "Visit" }, { nl: "Ik kom kijken, meet op en test bodem of water. Leidt het tot werk, dan verreken ik het bezoek.", en: "I come and look, measure up and test soil or water. If it leads to work, the visit is deducted." }],
  [{ nl: "Plan en vaste prijs", en: "Plan and fixed price" }, { nl: "Een plan op papier en een prijs die vaststaat, met wat er wel en niet in zit.", en: "A plan on paper and a price that's fixed, with what is and isn't included." }],
  [{ nl: "Aanleg", en: "Build" }, { nl: "Ik doe het werk zelf, van grondwerk tot de laatste plant.", en: "I do the work myself, from groundwork to the last plant." }],
  [{ nl: "Oplevering en nazorg", en: "Handover and aftercare" }, { nl: "We lopen samen alles na. Daarna onderhoud ik het als je wilt, zodat het blijft werken.", en: "We check everything together. After that I maintain it if you like, so it keeps working." }],
] as const

// Vanafprijzen incl. btw, op de markt gelegd (14 nov 2026; Trustoo, Homedeal,
// Slimster: hovenier € 35–65/u, siervijver € 2.500–5.000, renovatie € 1.000–5.000,
// onderhoudscontract € 50–200 p/m) en Nicks eigen offertes. Vijverbedragen en onderhoud
// bevestigd door Nick (14 nov 2026: nieuw € 2.500, renovatie € 4.500, € 45 p/m voor twee bezoeken).
const PRIJZEN_VIJVER: [L, L][] = [
  [{ nl: "Nieuwe vijver", en: "New pond" }, { nl: "vanaf € 2.500", en: "from € 2,500" }],
  [{ nl: "Vijverrenovatie", en: "Pond renovation" }, { nl: "vanaf € 4.500", en: "from € 4,500" }],
  [{ nl: "Onderhoud, 2 keer per jaar", en: "Maintenance, twice a year" }, { nl: "€ 45 p/m", en: "€ 45 a month" }],
  [{ nl: "Bezoek en doorlichting", en: "Visit and inspection" }, { nl: "€ 195, verrekend", en: "€ 195, deducted" }],
]
const PRIJZEN_TUIN: [L, L][] = [
  [{ nl: "Tuinaanleg", en: "Garden build" }, { nl: "vanaf € 7.000", en: "from € 7,000" }],
  [{ nl: "Border, aangeplant", en: "Border, planted" }, { nl: "€ 75 per m²", en: "€ 75 per m²" }],
  [{ nl: "Tuinontwerp", en: "Garden design" }, { nl: "vanaf € 2.500", en: "from € 2,500" }],
  [{ nl: "Bezoek met advies", en: "Visit with advice" }, { nl: "€ 195, verrekend", en: "€ 195, deducted" }],
]

export function ArVoorpagina() {
  return (
    <div className="ar">
      {/* ── Opening ─────────────────────────────────────────────── */}
      <section className="ar-inv ar-opening-vlak"><div className="ar-raster ar-opening" aria-labelledby="ar-titel">
        <div className="ar-opening-tekst">
          <p className="ar-lbl ar-in" style={{ "--d": 0 } as React.CSSProperties}>GRØNN Studio · <T t={{ nl: "sinds 2026", en: "since 2026" }} /></p>
          <h1 id="ar-titel" className="ar-titel">
            <span className="ar-regel"><span style={{ "--d": 1 } as React.CSSProperties}><T t={{ nl: "Vijvers en", en: "Ponds and" }} /></span></span>
            <span className="ar-regel"><span style={{ "--d": 2 } as React.CSSProperties}><T t={{ nl: "natuurlijke", en: "natural" }} /></span></span>
            <span className="ar-regel"><span style={{ "--d": 3 } as React.CSSProperties}><T t={{ nl: "tuinen", en: "gardens" }} /><b>.</b></span></span>
          </h1>
          <p className="ar-opening-zin ar-in" style={{ "--d": 4 } as React.CSSProperties}>
            <T t={{ nl: "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.", en: "I build and maintain ponds and natural gardens for homeowners in and around Stein, with a fixed price up front." }} />
          </p>
          <div className="ar-knoppen ar-in" style={{ "--d": 5 } as React.CSSProperties}>
            <TelLink href="/start-een-project" gebeurtenis="cta_project" plek="opening" className="ar-knop ar-knop-oranje"><T t={START} /></TelLink>
            <TelLink href={WHATSAPP} gebeurtenis="cta_whatsapp_foto" plek="opening" className="ar-knop ar-knop-lijn"><T t={FOTO} /></TelLink>
          </div>
        </div>
        <div className="ar-opening-beeld" role="group" aria-label="Beelden van het werk / Photos of the work">
          {OPENING.map(({ foto: f, tekst }, i) => (
            <div key={f.src} className="ar-dia" style={{ "--n": i } as React.CSSProperties} aria-hidden={i > 0 || undefined}>
              <Foto foto={i > 0 ? { ...f, alt: "" } : f} sizes="100vw" priority={i === 0} className="ar-dia-foto" />
              <p className="ar-lbl ar-opening-onderschrift"><T t={tekst} />, 2026</p>
            </div>
          ))}
        </div>
      </div></section>

      {/* ── Uitspraak en de draaiende band ──────────────────────── */}
      <section className="ar-uitspraak-sectie" aria-labelledby="ar-uitspraak">
        <div className="ar-raster ar-uitspraak-blok">
          <p className="ar-lbl"><T t={{ nl: "Van de maker", en: "From the maker" }} /></p>
          <h2 id="ar-uitspraak" className="ar-uitspraak">
            <Beide
              nl={<>Een tuin is geen product maar een plek. Ik ontwerp hem, reken hem door en leg hem zelf aan, <em>en je weet vooraf wat het kost</em></>}
              en={<>A garden isn&apos;t a product but a place. I design it, cost it and build it myself, <em>and you know up front what it costs</em></>}
            /><b className="ar-punt">.</b>
          </h2>
        </div>
        <div className="ar-band">
          <div className="ar-band-baan">
            {[0, 1].map((ronde) => (
              <div key={ronde} className="ar-band-reeks" aria-hidden={ronde === 1 || undefined}>
                {BAND.map((b) => (
                  <Link key={b.foto.src} href={b.href} className="ar-band-kaart" tabIndex={ronde === 1 ? -1 : undefined} transitionTypes={["schuif"]}>
                    <Foto foto={ronde === 1 ? { ...b.foto, alt: "" } : b.foto} sizes="(min-width: 900px) 24vw, 60vw" className="ar-band-foto" />
                    <span className="ar-band-titel"><T t={b.titel} /></span>
                    <span className="ar-band-soort"><T t={b.soort} /></span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Werk als index ──────────────────────────────────────── */}
      <section className="ar-inv" aria-labelledby="ar-werk"><div className="ar-raster ar-blok">
        <div className="ar-blokkop">
          <h2 id="ar-werk" className="ar-h2"><T t={{ nl: "Projecten", en: "Projects" }} /><b className="ar-punt">.</b></h2>
          <p className="ar-stelling"><T t={{ nl: "Werk dat ik zelf heb aangelegd, met de cijfers erbij.", en: "Work I built myself, with the numbers alongside." }} /></p>
          <Link href="/werk" className="ar-lbl ar-lijnlink" transitionTypes={["schuif"]}><T t={{ nl: "Alle projecten", en: "All projects" }} /></Link>
        </div>
        <div className="ar-werk-inhoud">
        <article className="ar-spread" aria-labelledby="ar-spread-titel">
          <div className="ar-spread-groot" data-v="0.6">
            <Foto foto={F10} sizes="100vw" className="ar-spread-foto" />
          </div>
          <div className="ar-spread-klein ar-spread-klein-a" data-v="1.5">
            <Foto foto={F08_1} sizes="(min-width: 1024px) 16vw, 44vw" className="ar-spread-foto" />
          </div>
          <div className="ar-spread-klein ar-spread-klein-b" data-v="3">
            <Foto foto={F11} sizes="(min-width: 1024px) 14vw, 40vw" className="ar-spread-foto" />
          </div>
          <div className="ar-spread-tekst">
            <p className="ar-lbl"><T t={{ nl: "Uitgelicht", en: "Featured" }} /></p>
            <h3 id="ar-spread-titel" className="ar-h3"><T t={VIJVER.titel} /></h3>
            <dl className="ar-kort">
              {KORT.map(([k, v]) => (
                <div key={k.nl}><dt className="ar-lbl"><T t={k} /></dt><dd><T t={v} /></dd></div>
              ))}
            </dl>
            <Link href="/werk/vijverrenovatie" className="ar-lbl ar-lijnlink" transitionTypes={["schuif"]}><T t={{ nl: "Lees het project", en: "Read the project" }} /></Link>
          </div>
        </article>
        <div className="ar-index" role="list">
          <div className="ar-index-kop ar-lbl" aria-hidden>
            <span>Project</span><span><T t={{ nl: "Soort", en: "Type" }} /></span><span><T t={{ nl: "Plaats", en: "Place" }} /></span><span><T t={{ nl: "Jaar", en: "Year" }} /></span>
          </div>
          {WERK.map((p) => (
            <Link key={p.href} href={p.href} role="listitem" className="ar-index-rij" transitionTypes={["schuif"]}>
              <span className="ar-index-naam"><T t={p.naam} /></span>
              <span className="ar-index-cel"><T t={p.type} /></span>
              <span className="ar-index-cel">{p.plaats === "—" ? "Limburg" : p.plaats}</span>
              <span className="ar-index-cel tabular-nums">{p.jaar}</span>
              <span className="ar-index-beeld" aria-hidden>
                <Foto foto={{ ...p.foto, alt: "" }} sizes="320px" className="ar-index-foto" />
              </span>
            </Link>
          ))}
        </div>
        </div>
      </div></section>

      {/* ── Diensten ───────────────────────────────────────────── */}
      <section className="ar-raster ar-blok ar-blok-vol" aria-labelledby="ar-diensten">
        <div className="ar-blokkop">
          <h2 id="ar-diensten" className="ar-h2"><T t={{ nl: "Diensten", en: "Services" }} /><b className="ar-punt">.</b></h2>
          <p className="ar-stelling"><T t={{ nl: "Vijvers en tuinen, van ontwerp tot onderhoud, met de prijs erbij.", en: "Ponds and gardens, from design to maintenance, with the price alongside." }} /></p>
        </div>
        <div className="ar-diensten">
          <Link href="/vijvers" className="ar-dienst" transitionTypes={["schuif"]}>
            <span className="ar-dienst-beeld" aria-hidden><Foto foto={{ ...SFEER.waterval, alt: "" }} sizes="(min-width: 760px) 30vw, 90vw" className="ar-dienst-foto" eager /></span>
            <h3 className="ar-h3"><T t={{ nl: "Vijvers", en: "Ponds" }} /></h3>
            <p><T t={{ nl: "Een heldere vijver met een filter dat werkt. Aanleg, renovatie en vast onderhoud.", en: "A clear pond with a filter that works. Building, renovation and regular maintenance." }} /></p>
            <dl className="ar-prijzen">
              {PRIJZEN_VIJVER.map(([dt, dd]) => <div key={dt.nl}><dt><T t={dt} /></dt><dd><T t={dd} /></dd></div>)}
            </dl>
            <span className="ar-lbl ar-lijnlink"><T t={{ nl: "Naar vijvers", en: "To ponds" }} /></span>
          </Link>
          <Link href="/tuinen" className="ar-dienst" transitionTypes={["schuif"]}>
            <span className="ar-dienst-beeld" aria-hidden><Foto foto={{ ...TERRAS_FOTOS.hoofd, alt: "" }} sizes="(min-width: 760px) 30vw, 90vw" className="ar-dienst-foto" eager /></span>
            <h3 className="ar-h3"><T t={{ nl: "Tuinen", en: "Gardens" }} /></h3>
            <p><T t={{ nl: "Een natuurlijke tuin die bij je huis en je bodem past. Ontwerp, aanleg en beplanting.", en: "A natural garden that suits your house and your soil. Design, building and planting." }} /></p>
            <dl className="ar-prijzen">
              {PRIJZEN_TUIN.map(([dt, dd]) => <div key={dt.nl}><dt><T t={dt} /></dt><dd><T t={dd} /></dd></div>)}
            </dl>
            <span className="ar-lbl ar-lijnlink"><T t={{ nl: "Naar tuinen", en: "To gardens" }} /></span>
          </Link>
        </div>
      </section>

      {/* ── Werkwijze ──────────────────────────────────────────── */}
      <section className="ar-inv" aria-labelledby="ar-werkwijze"><div className="ar-raster ar-blok ar-blok-vol">
        <div className="ar-blokkop">
          <h2 id="ar-werkwijze" className="ar-h2"><T t={{ nl: "Werkwijze", en: "How I work" }} /><b className="ar-punt">.</b></h2>
          <p className="ar-stelling"><T t={{ nl: "Van eerste foto tot oplevering in vijf stappen, met één aanspreekpunt.", en: "From first photo to handover in five steps, with one point of contact." }} /></p>
        </div>
        <div className="ar-stappen-kolom">
        <p className="ar-maat ar-lbl" aria-hidden><span><T t={{ nl: "Eerste gesprek", en: "First talk" }} /></span><span><T t={{ nl: "Oplevering", en: "Handover" }} /></span></p>
        <ol className="ar-stappen">
          {STAPPEN.map(([kop, zin]) => (
            <li key={kop.nl} className="ar-op">
              <h3 className="ar-h3"><T t={kop} /></h3>
              <p><T t={zin} /></p>
            </li>
          ))}
        </ol>
        </div>
      </div></section>

      {/* ── De maker ───────────────────────────────────────────── */}
      <section className="ar-raster ar-blok ar-maker" aria-labelledby="ar-maker">
        <div className="ar-maker-beeld">
          <Foto foto={F08_2} sizes="(min-width: 1024px) 34vw, 90vw" className="ar-maker-foto" />
        </div>
        <div className="ar-maker-tekst">
          <p className="ar-lbl">Studio</p>
          <h2 id="ar-maker" className="ar-h2"><T t={{ nl: "Eén maker, van eerste schets tot laatste plant", en: "One maker, from first sketch to last plant" }} /><b className="ar-punt">.</b></h2>
          <p><T t={{ nl: "Ik ben Nick. GRØNN Studio is mijn eenmanszaak voor vijvers en tuinen in Stein en omgeving. Je hebt één aanspreekpunt, en wie de prijs maakt, legt de tuin ook aan.", en: "I'm Nick. GRØNN Studio is my one-person business for ponds and gardens in and around Stein. You have one point of contact, and whoever makes the price also builds the garden." }} /></p>
          <Link href="/over" className="ar-lbl ar-lijnlink" transitionTypes={["schuif"]}><T t={{ nl: "Over mij", en: "About me" }} /></Link>
        </div>
      </section>

    </div>
  )
}

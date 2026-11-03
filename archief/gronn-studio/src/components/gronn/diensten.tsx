import { pricingFor, priceHint, quoteOffsetFor } from "@/lib/data/pricing"
import { beeldLabel, beeldVan, groupOf, levelOf, SERVICE_GROUPS, servicesInGroup, type Service } from "@/lib/data/services"
import { pick, type L, type Locale } from "@/lib/i18n"
import { PANEEL_MOS, PLANTGROEP_ICONEN, PLANTGROEP_VOLGORDE, type PlantgroepSlug } from "@/lib/iconen"
import { localePath } from "@/lib/locale"
import { serviceImage } from "@/lib/placeholder"
import { VIJVER, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import type { Crumb } from "@/lib/nav"
import { BeeldKaart, BosVlak, BREEDTE, euro, IcoonTegel, IcoonVlak, Knop, Kop, Kruimelpad, Label, LeesTekst, LinkShowcase, MetroRaster, Opsomming, PaginaKop, PijlLink, PrijsTabel, Sectie } from "./elementen"
import { KENNISMAKING, NIVEAU } from "./plekken"

// Diensten en één dienst, samengesteld uit ./elementen.

/**
 * De diensten waar de vijverrenovatie het bewijs naast het aanbod is
 * (Dan Hoye: echt werk naast wat je verkoopt). Alleen water; een tuin-
 * dienst krijgt pas een bewijsblok als er een tuinproject is.
 */
const VIJVER_BEWIJS = new Set(["water-systems", "pond-survey", "pond-autumn-service"])

/** Beplanting: de dienst waar de plantgroepen bij horen. */
const BEPLANTING = "planting-habitat"

/**
 * De vier plantgroepen op de kaart van Beplanting (2 × 2, dambord: donker
 * en licht wisselen), zodat de plantgroepiconen op /services staan.
 */
const BEPLANTING_VLAK: readonly [PlantgroepSlug, PlantgroepSlug, PlantgroepSlug, PlantgroepSlug] = [
  "bomen",
  "vaste-planten",
  "siergrassen",
  "water-en-oeverplanten",
]

/**
 * Het beeld van een dienstkaart (huisstijl Editie 02, 28 sep 2026): een
 * ECHTE eigen foto blijft staan, met zijn label; alles wat een stock- of
 * plaatshouderfoto was, wordt de tegel van het niveau. Beplanting krijgt
 * vier plantgroepen. `groot`: het grote blok van het metroraster, waar
 * het vlak vanaf lg de hoogte vult en de tegel groter is.
 */
function kaartBeeld(s: Service, locale: Locale, t: (v: L) => string, groot = false) {
  const b = beeldVan(s)
  if (b?.bron === "werk") {
    const label = beeldLabel(s)
    return {
      beeld: serviceImage(s),
      alt: t(b.alt),
      focus: b.focus,
      concept: !!label,
      conceptTekst: label ? t(label) : undefined,
    }
  }
  return {
    vlak:
      s.slug === BEPLANTING ? (
        <IcoonVlak soort="plantgroepen" ids={BEPLANTING_VLAK} groot={groot} locale={locale} />
      ) : (
        <IcoonVlak soort="dienst" id={levelOf(s)} groot={groot} locale={locale} />
      ),
  }
}

/**
 * De acht plantgroepen op de pagina van Beplanting, in de volgorde van
 * het overzicht (PLANTGROEP_VOLGORDE, het dambord). Tegel plus naam; de
 * naam staat zichtbaar, dus de tegel is decoratief.
 */
function Plantgroepen({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <section aria-labelledby="plantgroepen-kop" data-plantgroepen className="rounded-[16px] bg-paneel-mos p-[24px] sm:p-[32px]">
      <h2 id="plantgroepen-kop" className="mb-[24px] font-heading text-[28px]">
        {t({ nl: "De acht plantgroepen", en: "The eight plant groups" })}
      </h2>
      <ul className="grid grid-cols-1 gap-[16px] min-[420px]:grid-cols-2">
        {PLANTGROEP_VOLGORDE.map((slug) => (
          <li key={slug} data-plantgroep={slug} className="flex items-center gap-[16px]">
            <IcoonTegel soort="plantgroep" id={slug} maat={48} decoratief ondergrond={PANEEL_MOS} locale={locale} />
            <span className="text-[15px] leading-snug">{t(PLANTGROEP_ICONEN[slug].naam)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Klein blok onder "Wat je (niet) krijgt": het echte vijverproject. Geen
 * oranje — het ene accent van deze pagina is de knop in het bosvlak.
 */
function VijverBewijs({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <section aria-labelledby="bewijs-kop" className="rounded-[16px] border border-line/10 bg-surface p-6 sm:p-8" data-bewijs>
      <h2 id="bewijs-kop" className="tekst-annotatie text-muted uppercase">
        {t({ nl: "Uit de praktijk · in afronding", en: "From practice · finishing" })}
      </h2>
      <p lang="nl" className="mt-4 tekst-h3">{VIJVER.titel}</p>
      <p lang="nl" className="mt-3 text-[15px] leading-relaxed text-foreground/80">{VIJVER.kaarttekst}</p>
      <div className="mt-4">
        <PijlLink href={localePath(locale, `/projects/${VIJVER_SLUG}`)} stil>
          {t({ nl: "Lees hoe ik het aanpakte", en: "Read how I approached it (in Dutch)" })}
        </PijlLink>
      </div>
    </section>
  )
}

/**
 * Het aanbod per onderdeel (Langenegger Naturgärten; eigenaar, 3 okt
 * 2026: "doe die vijf"): vijf dingen die ik in een tuin maak, elk met
 * één zin over wat het de natuur oplevert. Alleen de vijver heeft een
 * eigen foto (de vijverrenovatie); een voedselbos is nog niet aangelegd,
 * dus die regel claimt geen werk.
 */
function Onderdelen({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const contact = localePath(locale, "/contact")
  const rijen = [
    {
      // Naar de sectie met de vijverdiensten, niet naar één dienstkaart.
      href: `${localePath(locale, "/services")}#ontwerp`,
      kop: { nl: "Vijver", en: "Pond" },
      uitleg: { nl: "Water trekt libellen, kikkers en vogels aan: geen onderdeel brengt zo snel leven in een tuin.", en: "Water draws dragonflies, frogs and birds: nothing brings life into a garden faster." },
      beeld: "/projecten/vijverrenovatie/F01.jpg",
      beeldLabel: { nl: "Eigen werk · Vijverrenovatie", en: "Own work · Pond renovation" },
    },
    {
      href: contact,
      kop: { nl: "Natuurlijke oever", en: "Natural bank" },
      uitleg: { nl: "Een flauwe, beplante rand laat egels en kikkers veilig in en uit het water, en de planten houden het water helder.", en: "A gentle, planted edge lets hedgehogs and frogs in and out of the water safely, and the plants help keep it clear." },
    },
    {
      href: contact,
      kop: { nl: "Takkenril", en: "Brushwood hedge" },
      uitleg: { nl: "Snoeihout op een rij in plaats van in de container: schuilplaats en nestplek voor egels, winterkoninkjes en insecten.", en: "Prunings stacked in a row instead of in the bin: shelter and nesting for hedgehogs, wrens and insects." },
    },
    {
      href: contact,
      kop: { nl: "Stapelmuur", en: "Dry stone wall" },
      uitleg: { nl: "Natuursteen zonder cement houdt de warmte van de zon vast; in de voegen wonen wilde bijen, hagedissen en muurplanten.", en: "Stone without mortar holds the sun’s warmth; wild bees, lizards and wall plants live in the gaps." },
    },
    {
      href: contact,
      kop: { nl: "Voedselbos", en: "Food forest" },
      uitleg: { nl: "Lagen van bomen, struiken en bodemplanten die eten geven en elkaar beschermen, zodat de bodem nooit kaal ligt.", en: "Layers of trees, shrubs and ground plants that give food and shelter each other, so the soil is never bare." },
    },
  ]
  return (
    <Sectie
      id="onderdelen"
      label={t({ nl: "Per onderdeel", en: "By element" })}
      kop={t({ nl: "Vijf dingen die ik in een tuin maak.", en: "Five things I build in a garden." })}
      intro={t({ nl: "Elk onderdeel doet iets voor de natuur. Vraag er één, of laat ze samen een tuin worden.", en: "Each element does something for nature. Ask for one, or let them become a garden together." })}
    >
      <LinkShowcase
        rijen={rijen.map((r, i) => ({
          href: r.href,
          nummer: `0${i + 1}`,
          soort: t({ nl: "Onderdeel", en: "Element" }),
          kop: t(r.kop),
          uitleg: t(r.uitleg),
          beeld: r.beeld,
          beeldLabel: r.beeldLabel && t(r.beeldLabel),
        }))}
      />
    </Sectie>
  )
}

export function DienstenPagina({ locale, services }: { locale: Locale; services: Service[] }) {
  const t = (v: L) => pick(v, locale)
  return (
    <>
      <PaginaKop
        label={t({ nl: "Diensten", en: "Services" })}
        titel={t({ nl: "Tekenen, maken, bijhouden.", en: "Draw, build, look after." })}
        intro={t({
          // De doelgroepzin (positionering, 3 okt 2026) vertelt ook wie er
          // verder kan lopen.
          nl: "Ik werk voor particulieren in Stein en omgeving, tot zo’n 30 km. Drie niveaus: ontwerp, aanleg en onderhoud, van even meekijken tot het werk per seizoen. Waar een vaste prijs kan, staat hij erbij, inclusief btw.",
          en: "I work for homeowners in and around Stein, South Limburg, up to about 30 km. Three levels: design, build and care, from a second look to the work each season. Where a fixed price is possible it is shown, including VAT.",
        })}
      />
      <Onderdelen locale={locale} />
      {SERVICE_GROUPS.map((g, i) => {
        const lijst = servicesInGroup(services, g.kind)
        if (!lijst.length) return null
        return (
          // `overflow-clip`, niet `overflow-hidden`: knipt de spiraal af
          // zonder een scrollcontainer te maken.
          <section key={g.kind} id={g.kind} aria-labelledby={`${g.kind}-kop`} className={`scroll-mt-[88px] overflow-clip py-16 sm:py-20 ${i % 2 ? "bg-surface" : ""}`}>
            <div className={BREEDTE}>
              {/* De kop op dezelfde kolommen als het metroraster eronder
                  (φ : 1): naam links boven het grote blok, de intro rechts
                  boven de kleine kaarten. */}
              <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:items-end lg:gap-x-[16px]">
                <div>
                  {/* De tegel van het niveau boven zijn naam (huisstijl Editie 02). */}
                  <IcoonTegel soort="dienst" id={g.kind} maat={64} decoratief locale={locale} />
                  <p className="mt-[20px] tekst-annotatie text-[var(--ember-text)] uppercase">0{i + 1} · {t(NIVEAU[g.kind])}</p>
                  <Kop id={`${g.kind}-kop`} className="mt-3 tekst-h2">{t(g.label)}</Kop>
                </div>
                <LeesTekst className="max-w-[560px] text-[16px] leading-relaxed text-foreground/80">{t(g.intro)}</LeesTekst>
              </div>
              {/* Metro (eigenaar, 29 sep 2026): een groot blok, twee kleine
                  ernaast, in de gulden snede, met de gulden spiraal erachter.
                  Geen `Drijf` meer: elk kaartje in zijn eigen tempo gaf het
                  hoogteverschil ("waarom zit hier hoogte verschil?"). Het
                  grote blok is een kaart met een echte eigen foto. */}
              <MetroRaster
                className="mt-[40px] lg:mt-[56px]"
                items={lijst}
                sleutel={(s) => s.slug}
                voorkeur={(s) => beeldVan(s)?.bron === "werk"}
                vak={(s, plek) => {
                  const p = priceHint(s.slug)
                  const groot = plek.rol === "groot"
                  return (
                    <BeeldKaart
                      aanwijzer="read"
                      href={localePath(locale, `/services/${s.slug}`)}
                      {...kaartBeeld(s, locale, t, groot)}
                      vorm={groot ? "groot" : plek.rol === "breed" ? "liggend" : "staand"}
                      gespiegeld={plek.gespiegeld}
                      titel={t(s.title)}
                      tekst={t(s.tagline ?? s.summary)}
                      voet={p ? `${t({ nl: "vanaf", en: "from" })} ${euro(p.from, locale)}${p.monthly ? t({ nl: " /mnd", en: " /mo" }) : ""}` : t({ nl: "op maat", en: "tailored" })}
                    />
                  )
                }}
              />
            </div>
          </section>
        )
      })}
    </>
  )
}

export function DienstPagina({ locale, service, trail }: { locale: Locale; service: Service; trail: Crumb[] }) {
  const t = (v: L) => pick(v, locale)
  const groep = groupOf(service)
  const pricing = pricingFor(service.slug)
  const verrekening = quoteOffsetFor(service.slug)
  return (
    <>
      <PaginaKop
        boven={<Kruimelpad trail={trail} locale={locale} />}
        label={t(NIVEAU[groep.kind])}
        titel={t(service.title)}
        intro={t(service.summary)}
      />
      <div className={`${BREEDTE} grid gap-12 pb-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16`}>
        <div className="grid grid-cols-[minmax(0,1fr)] content-start gap-12">
          <section aria-labelledby="inbegrepen">
            <h2 id="inbegrepen" className="mb-6 font-heading text-[28px]">{t({ nl: "Wat je krijgt", en: "What you get" })}</h2>
            <Opsomming items={service.includes.map(t)} />
          </section>
          {service.excludes?.length ? (
            <section aria-labelledby="niet-inbegrepen">
              <h2 id="niet-inbegrepen" className="mb-6 font-heading text-[28px]">{t({ nl: "Wat je niet krijgt", en: "What you do not get" })}</h2>
              <Opsomming items={service.excludes.map(t)} teken="—" />
            </section>
          ) : null}
          {service.slug === BEPLANTING && <Plantgroepen locale={locale} />}
          {VIJVER_BEWIJS.has(service.slug) && <VijverBewijs locale={locale} />}
        </div>
        <aside className="grid grid-cols-[minmax(0,1fr)] content-start gap-6">
          {pricing ? (
            <PrijsTabel pricing={pricing} locale={locale} />
          ) : (
            <div className="rounded-[16px] border border-line/10 bg-surface p-6 sm:p-8">
              <Label>{t({ nl: "Prijs · op maat", en: "Price · tailored" })}</Label>
              <p className="mt-4 text-[16px] leading-relaxed">{t({ nl: "Per project geoffreerd, na een kennismaking op locatie.", en: "Quoted per project, after an introduction on site." })}</p>
              {verrekening && <p className="mt-4 text-[14px] leading-relaxed text-foreground/75">{t(verrekening)}</p>}
            </div>
          )}
          <BosVlak>
            <p className="tekst-h3">{t({ nl: "Past dit bij jouw tuin?", en: "Does this fit your garden?" })}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/80">
              {t({ nl: "Vertel kort wat je hebt en wat je wilt. Je krijgt een eerlijk antwoord, ook als dat 'niets doen' is.", en: "Tell me briefly what you have and what you want. You get an honest answer, even if that is 'do nothing'." })}
            </p>
            <div className="mt-6">
              <Knop href={`${localePath(locale, "/contact")}?dienst=${service.slug}`} soort="ember">{t(KENNISMAKING)}</Knop>
            </div>
          </BosVlak>
          <PijlLink href={localePath(locale, "/services")}>{t({ nl: "Alle diensten", en: "All services" })}</PijlLink>
        </aside>
      </div>
    </>
  )
}

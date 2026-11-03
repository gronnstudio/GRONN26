import {
  BEGRIPPEN,
  CIJFERS,
  CIJFERS_NOOT,
  CITAAT,
  HOOFDSTUKKEN,
  NA_CITAAT,
  NA_PLANTTABEL,
  PLANTTABEL,
  SLOT,
  UITGELICHT,
  VIDEOS,
  VIJVER,
  VIJVER_FASE_NU,
  VIJVER_FASEN,
  VIJVER_SLUG,
} from "@/lib/data/vijverrenovatie"
import { VIJVER_BIJGEWERKT } from "@/lib/data/vijverrenovatie-datums"
import { volgendProject } from "@/lib/data/projecten-volgorde"
import { pick, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import type { Crumb } from "@/lib/nav"
import {
  Alineas,
  BosVlak,
  BREEDTE,
  CijferRij,
  Citaat,
  FaseBalk,
  Feitenlijst,
  Inhoud,
  Knop,
  Kop,
  Kop2,
  Kruimelpad,
  Label,
  Leestijd,
  leesMinuten,
  ProjectVideo,
  Status,
  Tabel,
  VerderLezen,
  VolgendProject,
  WaterrouteSchema,
  LeesTekst,
} from "./elementen"
import { FotoBlok } from "./foto-blok"

// De vijverrenovatie: de volledige projecttekst uit de overdracht,
// samengesteld uit ./elementen. De tekst is alleen Nederlands.

/** "23 september 2026" / "23 September 2026", los van de tijdzone van de server. */
const datum = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`))

/** Bij het bouwen: de intro plus alle hoofdstukteksten. */
const MINUTEN = leesMinuten([...VIJVER.intro, ...HOOFDSTUKKEN.flatMap((h) => h.alineas)])
const VERDER_HOOFDSTUKKEN = HOOFDSTUKKEN.map(({ id, kort }) => ({ id, kort }))

export function ProjectVerhaal({ locale, trail }: { locale: Locale; trail: Crumb[] }) {
  return (
    <article lang="nl" className="relative">
      <header className={`${BREEDTE} pt-12 sm:pt-20`}>
        <div lang={locale} className="mb-6">
          <Kruimelpad trail={trail} locale={locale} />
        </div>
        <Label>
          {VIJVER.categorie}
          <span aria-hidden>·</span>
          <Status>{VIJVER.status}</Status>
        </Label>
        {locale === "en" && <p className="mt-4 text-sm text-muted" lang="en">This project story is written in Dutch.</p>}
        {/* Onder 360px: "samenhangend" is op 40px breder dan 272px en duwde
            de pagina 17px zijwaarts (qi-stappen-fase.spec.ts, 320px). */}
        <Kop as="h1" direct className="mt-8 max-w-[14ch] tekst-h1 max-[359px]:text-[34px] max-[359px]:leading-[38px]">{VIJVER.titel}</Kop>
        <LeesTekst className="mt-8 max-w-2xl text-lg text-foreground/80 sm:text-xl">{VIJVER.ondertitel}</LeesTekst>
        {/* Boven de vouw: stil, want een half gevulde balk zou iets zeggen wat niet waar is. */}
        <div lang={locale} className="mt-8 max-w-xl">
          <FaseBalk fasen={VIJVER_FASEN} huidig={VIJVER_FASE_NU} locale={locale} beweeg={false} />
        </div>
        <p className="mt-6 tekst-annotatie text-muted uppercase">{VIJVER.auteur}</p>
        {/* Dezelfde datum als dateModified in de JSON-LD (vijverrenovatie-datums.ts). */}
        <p lang={locale} className="mt-2 tekst-annotatie text-muted uppercase" data-bijgewerkt>
          {pick({ nl: "Bijgewerkt op", en: "Updated" }, locale)}{" "}
          <time dateTime={VIJVER_BIJGEWERKT}>{datum(VIJVER_BIJGEWERKT, locale)}</time>
        </p>
        <Leestijd minuten={MINUTEN} locale={locale} className="mt-2" />
        <div lang={locale}>
          <VerderLezen slug={VIJVER_SLUG} hoofdstukken={VERDER_HOOFDSTUKKEN} />
        </div>
      </header>

      <div className={`${BREEDTE} mt-14`}>
        <FotoBlok id="F01" priority breed />
      </div>

      <div className={`${BREEDTE} mt-14 grid gap-6 lg:grid-cols-2 lg:gap-12`}>
        {VIJVER.intro.map((p) => (
          <Alineas key={p.slice(0, 24)} teksten={[p]} />
        ))}
      </div>

      <section aria-labelledby="cijfers" className={`${BREEDTE} mt-24`}>
        <h2 id="cijfers" className="font-heading text-3xl sm:text-4xl">Het project in cijfers</h2>
        <CijferRij cijfers={UITGELICHT} groot className="mt-10" />
        <Feitenlijst rijen={CIJFERS} begrippen={BEGRIPPEN} className="mt-14" />
        <p className="mt-4 text-sm text-muted">{CIJFERS_NOOT}</p>
      </section>

      <div className={`${BREEDTE} mt-28 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]`}>
        <Inhoud titel="Inhoud" label="Inhoud van dit project" items={HOOFDSTUKKEN} />
        <div className="min-w-0">
          {HOOFDSTUKKEN.map((h) => (
            <section key={h.id} id={h.id} aria-labelledby={`${h.id}-kop`} className="scroll-mt-[112px] border-t border-line/15 pt-10 pb-20">
              <Kop2 id={`${h.id}-kop`}>{h.kop}</Kop2>
              <Alineas teksten={h.alineas} className="mt-8" />
              {h.planttabel && (
                <>
                  <div className="max-w-3xl">
                    <Tabel
                      bijschrift="Oorspronkelijk beplantingsplan"
                      kolommen={["Zone", "Soorten", "Aantal manden", "Aantal planten"]}
                      rechts={[2, 3]}
                      rijen={PLANTTABEL.rijen.map((r) => [r.zone, r.soorten.join(", "), r.manden, r.planten])}
                      totaal={["Totaal", PLANTTABEL.totaal.soorten, PLANTTABEL.totaal.manden, PLANTTABEL.totaal.planten]}
                    />
                  </div>
                  <Alineas teksten={NA_PLANTTABEL} />
                </>
              )}
              {h.schema && <div className="mt-12"><WaterrouteSchema /></div>}
              {h.foto && <div className="mt-12"><FotoBlok id={h.foto} /></div>}
              {h.video && <ProjectVideo video={VIDEOS[h.video]} className="mt-12 max-w-[420px]" />}
              {h.id === "eerste-project" && (
                <>
                  <Citaat tekst={CITAAT.tekst} bron={CITAAT.bron} groot className="my-14 rounded-[16px] bg-surface p-6 sm:p-10" />
                  <Alineas teksten={[NA_CITAAT]} />
                </>
              )}
            </section>
          ))}
        </div>
      </div>

      <section aria-labelledby="slot" className={`${BREEDTE} pb-24`}>
        <div className="mb-14">
          <FotoBlok id={SLOT.foto} breed />
        </div>
        <BosVlak groot>
          <Kop id="slot" className="max-w-[18ch] tekst-h1">{SLOT.kop}</Kop>
          <Alineas teksten={[...SLOT.alineas, SLOT.oproep]} groot className="mt-8 text-white/85" />
          <div className="mt-10">
            <Knop href={localePath(locale, "/contact")} soort="ember">{VIJVER.contactknop}</Knop>
          </div>
        </BosVlak>
        {/* Na het slotvlak, niet ervoor: eerst de oproep, dan rustig verder. */}
        <VolgendProject project={volgendProject(VIJVER_SLUG)} locale={locale} className="mt-16" />
      </section>
    </article>
  )
}

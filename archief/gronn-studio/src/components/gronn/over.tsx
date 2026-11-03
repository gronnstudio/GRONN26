import { MOESTUIN_RIJEN } from "@/lib/data/moestuin"
import { CITAAT, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { Beeld, BosVlak, BREEDTE, Citaat, FotoMarkee, Knop, Kop, Label, LeesTekst, NummerLijst, PijlLink, Sectie, Stapel, WhatsAppNick } from "./elementen"
import { KENNISMAKING, PORTRET } from "./plekken"
import { OVER_MIJ, UITGANGSPUNTEN, WERKWIJZE, WERKWIJZE_KOP } from "./teksten"

// "Over mij": de persoon eerst (Dan Hoye — mensen kiezen een ontwerper,
// niet een bureau). Nicks eigen tekst staat er letterlijk; de rest is in
// zijn stem geschreven (teksten.ts). Het citaat komt uit zijn
// vijverproject.

/** Na de vierde alinea (van huis uit, de eigen weg) het portret; daarna
 *  vaderschap, het werk en de slotzin. Twee ongeveer even lange helften. */
const OVER_MIJ_VOOR_PORTRET = 4

function Alineas({ alineas, t, className = "" }: { alineas: L[]; t: (v: L) => string; className?: string }) {
  return (
    <div className={`grid max-w-[62ch] gap-6 ${className}`}>
      {alineas.map((alinea, i) => (
        <p key={i} data-over-mij className="tekst-body text-foreground/90">
          {t(alinea)}
        </p>
      ))}
    </div>
  )
}

export function OverPagina({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <>
      {/* Eén raster, drie stukken: tekst, portret, tekst. Op de telefoon
          en tablet staan ze onder elkaar, zodat het portret de lange tekst
          in tweeën breekt (eigenaar, 24 sep 2026: "dan heb je niet eerst
          een lap tekst en daarna een klein tekstje met veel foto's"). Vanaf
          lg lopen beide tekststukken door in de linkerkolom (de rij-gap is
          de alinea-gap) en staat het portret ernaast, sticky. Eén beeld,
          niet twee: de volgorde in de DOM is de leesvolgorde. */}
      <header className={`${BREEDTE} grid grid-cols-[minmax(0,1fr)] gap-12 pt-12 pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-x-16 lg:gap-y-6`}>
        <div className="lg:col-start-1 lg:row-start-1">
          <Label>{t({ nl: "Hovenier en ecologisch ontwerper", en: "Gardener and ecological designer" })}</Label>
          <Kop as="h1" direct className="mt-5 tekst-h1">{t({ nl: "Over mij", en: "About me" })}</Kop>
          {/* Nicks eigen tekst, letterlijk (zie teksten.ts). Geen
              tussenkoppen, geen uitgelichte zinnen: 1:1 is 1:1. Alleen
              het portret staat ertussen. */}
          <Alineas alineas={OVER_MIJ.slice(0, OVER_MIJ_VOOR_PORTRET)} t={t} className="mt-10" />
        </div>
        <div className="lg:sticky lg:top-[112px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <Beeld {...PORTRET} alt={t(PORTRET.alt)} ratio="4/5" sizes="(min-width: 1024px) 36vw, 90vw" priority parallax className="w-full max-w-[28rem] lg:mx-auto" onderschrift="Nick Peters · GRØNN Studio" />
          {/* Zijn WhatsApp naast zijn gezicht (eigenaar, 2 okt 2026, naar
              Langenegger Naturgärten). */}
          <WhatsAppNick locale={locale} className="mt-6 w-full max-w-[28rem] lg:mx-auto" />
        </div>
        <Alineas alineas={OVER_MIJ.slice(OVER_MIJ_VOOR_PORTRET)} t={t} className="lg:col-start-1 lg:row-start-2" />
      </header>

      {/* Buiten de opdrachten: de moestuin (eigenaar, 24 sep 2026: "Maak
          een markee met twee tegenstrijdig lopende foto carousels"). Na
          de persoon, vóór de ankers van STUDIO_EXTRAS; zelf geen anker. */}
      <section aria-labelledby="moestuin-kop" className="pb-20 sm:pb-28">
        <div className={`${BREEDTE} mb-8 sm:mb-10`}>
          <Kop id="moestuin-kop" className="tekst-h3">
            {t({ nl: "Buiten de opdrachten", en: "Outside client work" })}
          </Kop>
          <LeesTekst className="mt-3 tekst-body max-w-[60ch] text-foreground/80">
            {t({
              nl: "Moestuinieren: in de eigen tuin en op een vakantiepark in Beringe (België). Zelf kweken houdt de handen in de grond.",
              en: "Growing vegetables: in my own garden and at a holiday park in Beringe, Belgium. Growing my own keeps my hands in the soil.",
            })}
          </LeesTekst>
        </div>
        <FotoMarkee rijen={MOESTUIN_RIJEN} label={{ nl: "Foto's uit de moestuin", en: "Photos from the vegetable garden" }} locale={locale} />
      </section>

      <section id="uitgangspunten" aria-labelledby="principes-kop" className="scroll-mt-[96px] border-y border-line/10 bg-surface py-20 sm:py-28">
        <div className={BREEDTE}>
          <Label>{t({ nl: "Waar ik op let", en: "What I pay attention to" })}</Label>
          <Kop id="principes-kop" className="mt-4 mb-12 max-w-[18ch] tekst-h2">
            {t({ nl: "Vijf dingen die ik altijd meeneem.", en: "Five things I always bring along." })}
          </Kop>
          <NummerLijst items={UITGANGSPUNTEN.map(t)} />
        </div>
      </section>

      {/* De zes stappen, sinds 2 okt 2026 hier en niet meer op de
          voorpagina (eigenaar: "Rustiger", naar Dan Hoye: "fewer things per
          page"). Anker #werkwijze, in STUDIO_EXTRAS. */}
      <Sectie
        id="werkwijze"
        className="scroll-mt-[96px]"
        label={t({ nl: "Werkwijze", en: "How it works" })}
        kop={t(WERKWIJZE_KOP)}
        intro={t({
          nl: "Zes stappen, van eerst kijken tot laten groeien. Elke tuin doorloopt ze in zijn eigen tempo.",
          en: "Six steps, from looking first to letting it grow. Every garden goes through them at its own pace.",
        })}
      >
        <Stapel items={WERKWIJZE.map((s) => ({ titel: t(s.titel), tekst: t(s.tekst) }))} />
      </Sectie>

      <section id="manifest" aria-labelledby="manifest-kop" className={`${BREEDTE} scroll-mt-[96px] py-20 sm:py-28`}>
        <BosVlak groot>
          <Kop id="manifest-kop" className="tekst-h2 max-w-[20ch]">{t({ nl: "Waar ik voor sta.", en: "What I stand for." })}</Kop>
          <Citaat tekst={CITAAT.tekst} bron={CITAAT.bron} toon="bos" lang="nl" lees className="mt-10 max-w-3xl" />
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Knop href={localePath(locale, "/contact")} soort="ember">{t(KENNISMAKING)}</Knop>
            <PijlLink toon="bos" href={localePath(locale, `/projects/${VIJVER_SLUG}`)}>{t({ nl: "Bekijk het eerste project", en: "See the first project" })}</PijlLink>
          </div>
        </BosVlak>
      </section>
    </>
  )
}

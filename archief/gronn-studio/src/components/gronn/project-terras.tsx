import {
  TERRAS,
  TERRAS_CIJFERS,
  TERRAS_CITAAT,
  TERRAS_FOTOS,
  TERRAS_SLOT,
  TERRAS_SLUG,
  TERRAS_STAPPEN,
  TERRAS_UITGELICHT,
} from "@/lib/data/terras-geulle"
import { volgendProject } from "@/lib/data/projecten-volgorde"
import { type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import type { Crumb } from "@/lib/nav"
import {
  Alineas,
  BosVlak,
  BREEDTE,
  CijferRij,
  Citaat,
  Feitenlijst,
  Knop,
  Kop,
  Kop2,
  Kruimelpad,
  Label,
  Stappenlijn,
  Status,
  VolgendProject,
  LeesTekst,
} from "./elementen"
import { FotoRij } from "./foto-blok"

// Het terras in Geulle: een kort project, dus een korte pagina — dezelfde
// elementen als de vijverrenovatie, zonder inhoudsopgave of hoofdstukken.
// De tekst is alleen Nederlands, net als bij de vijver.

export function TerrasVerhaal({ locale, trail }: { locale: Locale; trail: Crumb[] }) {
  return (
    <article lang="nl" className="relative">
      <header className={`${BREEDTE} pt-12 sm:pt-20`}>
        <div lang={locale} className="mb-6">
          <Kruimelpad trail={trail} locale={locale} />
        </div>
        <Label>
          {TERRAS.categorie}
          <span aria-hidden>·</span>
          <Status>{TERRAS.status}</Status>
        </Label>
        {locale === "en" && <p className="mt-4 text-sm text-muted" lang="en">This project story is written in Dutch.</p>}
        <Kop as="h1" direct className="mt-8 max-w-[16ch] tekst-h1">{TERRAS.titel}</Kop>
        <LeesTekst className="mt-8 max-w-2xl text-lg text-foreground/80 sm:text-xl">{TERRAS.ondertitel}</LeesTekst>
        <p className="mt-6 tekst-annotatie text-muted uppercase">
          {TERRAS.plaats} · {TERRAS.wanneer} · {TERRAS.auteur}
        </p>
      </header>

      <div className={`${BREEDTE} mt-14 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16`}>
        <div className="max-w-[520px]">
          <FotoRij id="T01" fotos={[TERRAS_FOTOS.hoofd]} priority breed />
        </div>
        <div className="grid gap-6">
          <Alineas teksten={[...TERRAS.intro]} />
        </div>
      </div>

      <section aria-labelledby="cijfers" className={`${BREEDTE} mt-24`}>
        <h2 id="cijfers" className="font-heading text-3xl sm:text-4xl">Het project in cijfers</h2>
        <CijferRij cijfers={TERRAS_UITGELICHT} groot className="mt-10" />
        <Feitenlijst rijen={TERRAS_CIJFERS} className="mt-14" />
      </section>

      <section aria-labelledby="werk-kop" className={`${BREEDTE} mt-24`}>
        <Kop2 id="werk-kop">De werkzaamheden</Kop2>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-foreground/80">
          Geen tegels erin en klaar. Dit is de volgorde waarin het terras is opgebouwd:
        </p>
        <div className="mt-10 max-w-3xl">
          <Stappenlijn items={[...TERRAS_STAPPEN]} />
        </div>
        <div className="mt-14 max-w-4xl">
          <FotoRij id="T02" fotos={TERRAS_FOTOS.reeks} />
        </div>
        <Citaat tekst={TERRAS_CITAAT.tekst} bron={TERRAS_CITAAT.bron} groot className="my-16 rounded-[16px] bg-surface p-6 sm:p-10" />
      </section>

      <section aria-labelledby="slot" className={`${BREEDTE} pb-24`}>
        <div className="mb-14 max-w-[520px]">
          <FotoRij id="T03" fotos={[TERRAS_FOTOS.slot]} />
        </div>
        <BosVlak groot>
          <Kop id="slot" className="max-w-[18ch] tekst-h1">{TERRAS_SLOT.kop}</Kop>
          <Alineas teksten={TERRAS_SLOT.alineas} groot className="mt-8 text-white/85" />
          <div className="mt-10">
            <Knop href={localePath(locale, "/contact")} soort="ember">{TERRAS.contactknop}</Knop>
          </div>
        </BosVlak>
        {/* Vervangt de losse regel "Meer echt werk": die staat nu onder de kaart. */}
        <VolgendProject project={volgendProject(TERRAS_SLUG)} locale={locale} className="mt-16" />
      </section>
    </article>
  )
}

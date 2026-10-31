import Link from "next/link"
import { BUSINESS } from "@/lib/business"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { DASHBOARD } from "@/lib/nav"
import { CHANNELS } from "@/components/layout/channel-icons"
import { CopyChip } from "@/components/layout/copy-chip"
import { Auteursrecht, BREEDTE, Knop, LinkKolom, Logo, Maanfase, Seizoenszaadje, Zonneboog } from "./elementen"
import { KENNISMAKING, PLEKKEN, STACK_PLEK, VRAGEN_PLEK } from "./plekken"

// De voet: het antraciet merkvlak uit de brand guide (p. 14), met het
// woordmerk en "Rooted in nature." Bovenaan één zin en één deur;
// daaronder de plekken, de kanalen en het juridische.
//
// Eerdere eigenaarsbesluiten die hier gelden (paneel-op-zak.spec.ts,
// nav-client-entry.spec.ts): adres, telefoon en e-mail staan NIET in de
// voet maar op /colofon (art. 3:15d BW vraagt bereikbaar, niet herhaald);
// KvK en btw elk als eigen kopieerknop; en de deur naar /dashboard is een
// gevulde knop, geen zoveelste tekstlink.

const JURIDISCH: { href: string; label: L }[] = [
  { href: "/privacy", label: { nl: "Privacy", en: "Privacy" } },
  { href: "/voorwaarden", label: { nl: "Voorwaarden", en: "Terms" } },
  { href: "/voorwaarden-zakelijk", label: { nl: "Zakelijke voorwaarden", en: "Business terms" } },
  { href: "/herroeping", label: { nl: "Herroeping", en: "Withdrawal" } },
  // /colofon staat onder Contact, als "Adres en gegevens": één keer is
  // genoeg (eigenaar, 29 sep 2026: "twee keer contact?").
  { href: "/portaal", label: { nl: "Klantportaal", en: "Client portal" } },
]

export function Voet({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const links = (lijst: { href: string; label: L }[]) => lijst.map((p) => ({ href: localePath(locale, p.href), tekst: t(p.label) }))
  return (
    <footer className="vlak-antraciet relative mt-auto border-t border-gronn-white/10">
      <div className={`${BREEDTE} pt-[64px] pb-10`}>
        {/* Boven en onder even veel lucht, voor de tekst én voor de knoppen
            (eigenaar, 28 sep 2026: "bij knoppen onder en boven zelfde
            ruimte, bij tekst niet"). Beide verticaal gecentreerd, 64px
            boven en onder, en de kop zonder de loze ruimte van zijn
            regelhoogte (`text-box: trim-both cap alphabetic`): zijn vak is
            dan precies hoofdletter tot basislijn. uitlijning.spec.ts meet
            het. */}
        <div data-voet-cta="" className="grid gap-10 border-b border-white/15 pb-[64px] lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <p className="max-w-[18ch] tekst-h2 [text-box:trim-both_cap_alphabetic]">
            {t({ nl: "Zullen we eens naar jouw tuin kijken?", en: "Shall we take a look at your garden?" })}
          </p>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Knop href={localePath(locale, "/contact")} soort="ember">{t(KENNISMAKING)}</Knop>
            {/* WhatsApp en Instagram naast elkaar, als lijnicoon in de
                tekstkleur: geen merkkleuren op het antraciet, het oranje
                is de kennismaking (eigenaar, 24 sep 2026). Op 320px passen ze
                niet naast elkaar en breken ze om. */}
            <div className="flex flex-wrap gap-3">
              {CHANNELS.map((c) => (
                <Knop key={c.key} href={c.href} soort="rand">
                  <span className="inline-flex items-center gap-2">
                    {c.icon}
                    {c.label}
                  </span>
                </Knop>
              ))}
            </div>
          </div>
        </div>

        {/* Ook op de telefoon twee kolommen (eigenaar, 24 sep 2026: "trekt
            erg lang"): het merk over de volle breedte, dan Site naast
            Contact, dan Juridisch breed met zijn links in twee kolommen. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-12 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Logo op="bos" hoogte={32} alt={BUSINESS.name} />
            <p lang="en" className="tekst-annotatie mt-4 text-gronn-ember">Rooted in nature.</p>
            <p className="mt-4 max-w-[28ch] text-[14px] leading-relaxed text-white/75">
              {t({ nl: "Ecologische tuinen en vijvers. Ontwerp, aanleg en onderhoud vanuit Stein, Limburg.", en: "Ecological gardens and ponds. Design, build and care from Stein, Limburg." })}
            </p>
          </div>
          {/* Contact staat niet onder Site: de kolom ernaast heet Contact en
              opent met het contactformulier (eigenaar, 29 sep 2026: "twee
              keer contact?"). */}
          <LinkKolom kop={t({ nl: "Site", en: "Site" })} label={t({ nl: "Voettekst", en: "Footer" })} links={links([...PLEKKEN.filter((p) => p.href !== "/contact"), VRAGEN_PLEK, STACK_PLEK])} toon="bos" />
          <div>
            <LinkKolom
              kop={t({ nl: "Contact", en: "Contact" })}
              links={[
                { href: localePath(locale, "/contact"), tekst: t({ nl: "Contactformulier", en: "Contact form" }) },
                { href: BUSINESS.instagram, tekst: "Instagram" },
                { href: localePath(locale, "/colofon"), tekst: t({ nl: "Adres en gegevens", en: "Address and details" }) },
              ]}
              toon="bos"
            />
            <Link
              href={DASHBOARD.href}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white/12 px-5 text-[14px] font-semibold ring-1 ring-white/25 transition-colors hover:bg-white/20"
            >
              {t(DASHBOARD.label)} <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <LinkKolom kop={t({ nl: "Juridisch", en: "Legal" })} label={t({ nl: "Juridisch", en: "Legal" })} links={links(JURIDISCH)} toon="bos" tweeKolommen />
          </div>
        </div>

      </div>
      {/* Wat de wet vraagt, op de paletgrond: de kopieerknoppen dragen
          de kleuren van het thema, niet die van het bosgroene vlak. */}
      <div className="bg-background text-foreground">
        {/* Vanaf `xl` staat de kalender in de rechterbubbel en bleef de
            rechterhelft leeg: dan staat de regel in het midden (eigenaar,
            29 sep 2026: "dit meer centreren op midden?"). uitlijning.spec.ts meet het. */}
        <div data-voet-regel="" className={`${BREEDTE} flex flex-wrap items-center gap-x-6 gap-y-3 py-5 xl:justify-center`}>
          {/* Eigenaar, 23 sep 2026: de © wordt even het Ø van het woordmerk. */}
          <p data-voet-copy="" className="tekst-annotatie text-muted">
            <Auteursrecht /> {new Date().getFullYear()} {BUSINESS.name}.{" "}
            {t({ nl: "Pixels en code beschermd door pure wilskracht.", en: "Pixels and code protected by sheer willpower." })}
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyChip label="KVK" value={BUSINESS.kvk} />
            <CopyChip label="BTW" value={BUSINESS.btw} />
          </div>
          {/* Onder `xl` de tuinkalender, de maan op Blauwe Uur en de zon op Gouden Uur. Vanaf `xl` staan die
              drie in de rechterbubbel (`HemelBubbel`; eigenaar, 27 sep
              2026). Beide linken naar /calendar. Vaste hoogte, dus geen verschuiving als ze na het
              laden verschijnen. */}
          <div className="flex min-h-[22px] items-center gap-4 sm:ml-auto xl:ml-0 xl:hidden">
            {/* Samen één link naar de tuinkalender, zoals de bubbel. */}
            <Link
              href={localePath(locale, "/calendar")}
              data-voet-kalender=""
              className="flex min-h-[24px] items-center gap-4 underline-offset-4 hover:underline focus-visible:underline xl:hidden"
            >
              <span className="sr-only">{t({ nl: "Tuinkalender: ", en: "Garden calendar: " })}</span>
              <Seizoenszaadje />
              <Maanfase />
              <Zonneboog />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

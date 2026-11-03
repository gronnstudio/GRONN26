import Image from "next/image"

import { CHANNELS } from "@/components/layout/channel-icons"
import { BUSINESS } from "@/lib/business"
import { SERVICE_GROUPS, vanafPrijs, type Service } from "@/lib/data/services"
import { TERRAS, TERRAS_FOTOS, TERRAS_SLUG } from "@/lib/data/terras-geulle"
import { fotosVoor, VIJVER, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { SITE_URL } from "@/lib/seo"
import { VCARD_PAD } from "@/lib/vcard"

import { BentoPijl, BentoRaster, BentoTegel, Logo, TaalPil, UrenPil } from "./elementen"
import { KENNISMAKING, NIVEAU, PORTRET } from "./plekken"

/**
 * De linkpagina voor de Instagram-bio: links.gronn.studio (en
 * gronn.studio/links). Eigenaar, 27 sep 2026: "kun je op gronn.studio
 * ook een subdomein creëren en een soort bentobox linktree maken?" Zijn
 * tegels: kennismaking, WhatsApp, e-mail, visitekaartje, de twee echte
 * projecten en de diensten. Alleen bestaande inhoud; niets verzonnen.
 *
 * Standaard Nederlands, want wie via de bio komt, leest Nederlands; met de
 * vlag Engels, onthouden zoals op de rest van de site (eigenaar, 28 sep
 * 2026). De projecttitels blijven Nederlands (`lang="nl"`). Zonder de
 * omlijsting van de site (geen menu, dock of voet): dit IS het menu.
 * Elke link is absoluut naar gronn.studio, zodat je vanaf het subdomein
 * op de gewone site landt; alleen het visitekaartje is relatief, want
 * dat bestand werkt op beide hosts.
 */

// De één stap kleinere schaal van de linkpagina (eigenaar, 28 sep 2026:
// "Make text smaller, there are some cutoffs"): een tegel is half zo
// breed als een sectie. Vloeiend via de `--tekst-tegel-*`-variabelen in
// globals.css, net als de rest van de typeschaal.
const KOP = "font-heading font-bold tracking-[-0.02em] text-[length:var(--tekst-tegel-kop)] leading-[var(--tekst-tegel-kop-regel)]"
const TITEL = "font-heading font-bold tracking-[-0.01em] text-[length:var(--tekst-tegel-titel)] leading-[var(--tekst-tegel-titel-regel)]"
const TEKST = "text-[length:var(--tekst-tegel-tekst)] leading-[var(--tekst-tegel-tekst-regel)]"

export function LinksPagina({ services, locale = "nl" }: { services: Service[]; locale?: Locale }) {
  const t = (v: L) => pick(v, locale)
  const site = (pad: string) => `${SITE_URL}${localePath(locale, pad)}`
  const nl = locale === "nl" ? undefined : "nl"
  const whatsapp = CHANNELS.find((c) => c.key === "whatsapp")!
  const vijverFoto = fotosVoor("F10")[0]
  const plaats = `${BUSINESS.address.city}, ${BUSINESS.address.province}`

  return (
    <main
      id="main"
      data-element="LinksPagina"
      className="mx-auto flex min-h-svh w-full max-w-[960px] flex-col gap-[24px] px-[16px] pt-[24px] pb-[40px] md:px-[24px] md:pt-[48px]"
    >
      <h1 className="sr-only">GRØNN Studio · Nick Peters · links</h1>
      {/* Licht of Donker, met dezelfde knop als op de site (eigenaar,
          28 sep 2026). */}
      <div className="flex justify-end gap-[8px]">
        <TaalPil />
        <UrenPil />
      </div>
      <BentoRaster>
        {/* 1. Wie: het portret, de naam, de ene zin uit de voet. */}
        <BentoTegel kolommen={2} rijenMd={2} data="intro" className="justify-between gap-[20px]">
          <Logo hoogte={24} alt="GRØNN" priority />
          <div className="flex items-center gap-[14px]">
            <Image
              src={PORTRET.src}
              alt={t(PORTRET.alt)}
              width={144}
              height={144}
              sizes="72px"
              priority
              className="size-[72px] shrink-0 rounded-full object-cover object-[50%_30%]"
            />
            <div>
              <p className={TITEL}>Nick Peters</p>
              <p className="tekst-annotatie text-muted">{plaats}</p>
            </div>
          </div>
          <p className={`${TEKST} max-w-[42ch] text-muted`}>
            {t({
              nl: "Ecologische tuinen en vijvers. Ontwerp, aanleg en onderhoud vanuit Stein, Limburg.",
              en: "Ecological gardens and ponds. Design, build and care from Stein, Limburg.",
            })}
          </p>
        </BentoTegel>

        {/* 2. De ene oranje tegel: de deur. */}
        <BentoTegel href={site("/contact")} kolommen={2} toon="ember" data="kennismaking" className="justify-end">
          <BentoPijl />
          <p className="tekst-annotatie">Contact</p>
          <p className={`${KOP} mt-[6px]`}>{t(KENNISMAKING)}</p>
          <p className="tekst-annotatie mt-[6px]">{t({ nl: "Vrijblijvend", en: "No obligation" })}</p>
        </BentoTegel>

        {/* 3. WhatsApp, met het merkteken in zijn eigen kleur. */}
        <BentoTegel href={whatsapp.href} extern label={t(whatsapp.aria)} data="whatsapp" className="justify-between">
          <BentoPijl />
          <span aria-hidden className="[&_svg]:size-[28px]" style={{ color: whatsapp.color }}>
            {whatsapp.icon}
          </span>
          <div>
            <p className={TITEL}>WhatsApp</p>
            <p className="tekst-annotatie text-muted">{t({ nl: "Stuur een bericht", en: "Send a message" })}</p>
          </div>
        </BentoTegel>

        {/* 4. E-mail. */}
        <BentoTegel href={BUSINESS.emailHref} data="email" className="justify-between">
          <BentoPijl />
          <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          <div className="min-w-0">
            <p className={TITEL}>E-mail</p>
            <p className="font-mono text-[11px] leading-[16px] text-muted md:text-[12px]">
              {BUSINESS.email.split("@")[0]}@<wbr />
              {BUSINESS.email.split("@")[1]}
            </p>
          </div>
        </BentoTegel>

        {/* 5. De vijverrenovatie: echt werk, met de waterval. */}
        <BentoTegel href={site(`/projects/${VIJVER_SLUG}`)} kolommen={2} rijenMd={2} vol data="vijver">
          <div className="relative min-h-[160px] flex-1">
            <Image src={vijverFoto.src} alt="" fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
            <div aria-hidden className="photo-glass absolute inset-0" />
          </div>
          <div className="relative border-t border-line/15 bg-surface p-[16px] md:p-[20px]">
            <BentoPijl className="top-[18px] md:top-[22px]" />
            <p lang={nl} className="tekst-annotatie text-[color:var(--ember-text)]">Project · {VIJVER.status}</p>
            <p lang={nl} className={`${TITEL} mt-[4px] pr-[24px]`}>{VIJVER.titel}</p>
          </div>
        </BentoTegel>

        {/* 6. Het terras in Geulle: staand, zoals de foto. */}
        <BentoTegel href={site(`/projects/${TERRAS_SLUG}`)} rijen={2} vol data="terras">
          <div className="relative min-h-[160px] flex-1">
            <Image src={TERRAS_FOTOS.hoofd.src} alt="" fill sizes="(min-width: 768px) 240px, 50vw" className="object-cover" />
            <div aria-hidden className="photo-glass absolute inset-0" />
          </div>
          <div className="border-t border-line/15 bg-surface p-[12px] md:p-[16px]">
            <p lang={nl} className="tekst-annotatie text-[color:var(--ember-text)]">Project · {TERRAS.status}</p>
            <p lang={nl} className={`${TEKST} mt-[4px] font-semibold`}>{TERRAS.titel}</p>
          </div>
        </BentoTegel>

        {/* 7. Het visitekaartje: in je contacten, zonder overtypen. */}
        <BentoTegel href={VCARD_PAD} download="gronn-studio.vcf" data="visitekaartje" className="justify-between">
          <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
            <circle cx="8.5" cy="11" r="2" />
            <path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2M14 10h4.5M14 13h3" />
          </svg>
          <div>
            <p className={TITEL}>{t({ nl: "Visitekaartje", en: "Business card" })}</p>
            <p className="tekst-annotatie text-muted">{t({ nl: "Zet in je contacten", en: "Add to your contacts" })}</p>
          </div>
        </BentoTegel>

        {/* 8. De rest van de site, op het bosgroen. */}
        <BentoTegel href={site("/")} toon="bos" data="website" className="justify-between">
          <BentoPijl />
          <p className="tekst-annotatie">Website</p>
          <p className={TITEL}>gronn.studio</p>
        </BentoTegel>

        {/* 9. De drie niveaus met de "vanaf"-prijs die home ook noemt. */}
        <BentoTegel kolommen={2} kolommenMd={4} data="diensten" className="gap-[8px]">
          <p className="tekst-annotatie text-[color:var(--ember-text)]">{t({ nl: "Diensten", en: "Services" })}</p>
          <ul className="flex flex-col md:flex-row md:gap-[12px]">
            {SERVICE_GROUPS.map((g) => {
              const vanaf = vanafPrijs(services, g.kind)
              return (
                <li key={g.kind} className="border-t border-line/15 first:border-t-0 md:flex-1 md:border-t-0 md:border-l md:pl-[12px] md:first:border-l-0 md:first:pl-0">
                  <a
                    href={`${site("/services")}#${g.kind}`}
                    className="flex min-h-[48px] items-center justify-between gap-[12px] py-[8px] outline-offset-2 hover:text-[color:var(--ember-text)] focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)]"
                  >
                    <span>
                      <span className="tekst-annotatie block text-muted">{t(NIVEAU[g.kind])}</span>
                      <span className={`${TEKST} font-semibold`}>{t(g.label)}</span>
                    </span>
                    <span className="tekst-annotatie shrink-0">{vanaf ? `${t({ nl: "vanaf", en: "from" })} € ${vanaf}` : t({ nl: "op maat", en: "tailored" })}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </BentoTegel>
      </BentoRaster>

      <p className="tekst-annotatie text-center text-muted">
        {BUSINESS.name} · {plaats}
      </p>
    </main>
  )
}

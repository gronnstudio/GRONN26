import Image from "next/image"
import Link from "next/link"

import { BUSINESS } from "@/lib/business"
import { SERVICE_GROUPS, vanafPrijs, type Service } from "@/lib/data/services"
import { fotosVoor, UITGELICHT, VIJVER, VIJVER_FASE_NU, VIJVER_FASEN, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { LIDMAATSCHAPPEN, REACTIES } from "@/lib/data/vertrouwen"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import {
  Beeld,
  BosVlak,
  BREEDTE,
  CijferRij,
  FaseBalk,
  IcoonTegel,
  IcoonVlak,
  Knop,
  Kop,
  Label,
  LeesTekst,
  LinkShowcase,
  PijlLink,
  ProjectBeeld,
  Sectie,
  VolleOpening,
  Vertrouwen,
} from "./elementen"
import { KENNISMAKING, MERKBASIS, MERKBELOFTE, NIVEAU, PIJLERS, PORTRET } from "./plekken"
import { ChecklistBlok } from "./checklist-aanbod"
import { VragenLijst } from "./vragen"
import { thuisVragen, vragen } from "./vragen-lijst"
import { OVER_MIJ } from "./teksten"

/**
 * De openingsfoto: F10, de waterval (echt werk, geen sfeerbeeld). Een
 * andere foto is deze ene regel. F10 is 2000px breed; over het hele
 * scherm op een 2×-scherm (en met de uitzoom van 1,08) is dat zacht. Een
 * origineel van ≥ 2880px breed is bij Nick gevraagd (29 sep 2026).
 */
const OPENING = fotosVoor("F10")[0]

// De homepage van V5, volgens Dan Hoye's drie vragen: in één scherm ziet
// een bezoeker VOOR WIE dit is, WAAR GRØNN OM BEKEND STAAT en WAAROM HET
// ANDERS IS. Daarna wat je kunt vragen, het echte werk, hoe het gaat en
// wie Nick is. Alleen samengesteld uit ./elementen.

/** "Stein, Limburg" — uit business.ts, de enige plek voor het adres. */
const PLAATS = `${BUSINESS.address.city}, ${BUSINESS.address.province}`

function Opening({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const href = (p: string) => localePath(locale, p)
  return (
    // De volle opening (eigenaar, 29 sep 2026: variant A uit drie proeven).
    // Dan Hoye: wie je bent, wat je doet en WAAR, boven de vouw. Het waar
    // staat naast Nicks foto onder de knoppen; niet ook in het label
    // (eigenaar, 24 sep 2026). Brand guide p. 12 en 13: een uitgesproken
    // Syne-kop, één zin Montserrat en één oranje primaire actie.
    <VolleOpening
      id="opening-kop"
      foto={OPENING}
      alt={t({
        nl: OPENING.alt,
        en: "The waterfall flows over natural stone into the pond, with a red flowering canna in front and the pipes with a ball valve behind.",
      })}
      // Geen logo op de foto (eigenaar, 29 sep 2026: "haal gronn primary
      // logo van de hero af"); het woordmerk staat al in de menubalk.
      // Wat en voor wie in één keer (eigenaar, 3 okt 2026: "Vijvers en
      // tuinen", beide even zwaar): de positionering uit
      // website/positionering/positionering.md.
      label={t({ nl: "Vijvers en tuinen · Stein en omgeving", en: "Ponds and gardens · Stein and around" })}
      kop={t({ nl: "Een vijver en tuin die gezond blijven.", en: "A pond and garden that stay healthy." })}
      zin={t({
        nl: "Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf.",
        en: "I’m Nick. I renovate and maintain ponds and build natural gardens, for homeowners in and around Stein. Where possible with a fixed price agreed up front.",
      })}
      // Eén knop, geen tweede ernaast (eigenaar, 2 okt 2026, "Rustiger"
      // naar Dan Hoye: "fewer things per page"). Het werk staat een blok
      // lager, en in het menu.
      acties={<Knop href={href("/contact")}>{t(KENNISMAKING)}</Knop>}
      persoon={
        // Wie er aan je tuin werkt: het goedgekeurde portret (het enige)
        // in een cirkel van 72px — 44 was "erg klein" (eigenaar, 24 sep
        // 2026), maar groot in de hero wilde hij niet — met naam en
        // plaats op twee regels, als deur naar Over mij. De muis ziet
        // "Over mij" in de aanwijzer; op touch een gewone link.
        <Link
          href={href("/studio")}
          data-cursor="about"
          className="group inline-flex min-h-[44px] items-center gap-[16px] rounded-full pr-[16px] text-[16px] leading-snug"
        >
          <Image
            src={PORTRET.src}
            alt=""
            width={72}
            height={72}
            sizes="72px"
            className="size-[72px] shrink-0 rounded-full bg-surface object-cover object-[50%_30%] ring-1 ring-white/30"
          />
          <span>
            <span className="sr-only">{t({ nl: "Over ", en: "About " })}</span>
            <span data-opening-naam="" className="block font-semibold underline-offset-4 group-hover:underline">Nick Peters</span>
            <span className="sr-only"> · </span>
            <span data-opening-plaats="" className="block text-[14px] text-gronn-white/90">{PLAATS}</span>
          </span>
        </Link>
      }
    />
  )
}

/** Merkbasis (brand guide p. 2): de belofte in een antraciet vlak en drie pijlers. */
function Merkbasis({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <section aria-labelledby="merk-kop" className="border-y border-line/10 bg-surface py-20 sm:py-28">
      <div className={BREEDTE}>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-7">
            <Kop id="merk-kop" className="tekst-h1 max-w-[16ch]">{t({ nl: "Ontworpen voor leven.", en: "Designed for life." })}</Kop>
            {/* Leest mee: licht woord voor woord op (LeesTekst). */}
            <LeesTekst className="tekst-body mt-8 max-w-[60ch] text-foreground/85">{t(MERKBASIS)}</LeesTekst>
          </div>
          <BosVlak kleur="antraciet" className="g-in lg:col-span-5">
            <p className="tekst-annotatie text-gronn-white/75">{t({ nl: "Merkbelofte", en: "Brand promise" })}</p>
            <p className="tekst-h2 mt-6">{t(MERKBELOFTE)}</p>
          </BosVlak>
        </div>
        <ol className="mt-16 grid gap-10 border-t border-line/15 pt-10 md:grid-cols-3 md:gap-8">
          {PIJLERS.map((p, i) => (
            <li key={i} className="g-in">
              <p className="tekst-annotatie text-[var(--ember-text)]">{`0${i + 1} / ${t(p.label)}`}</p>
              <h3 className="tekst-h3 mt-4">{t(p.kop)}</h3>
              <p className="tekst-body mt-3 max-w-[40ch] text-foreground/80">{t(p.tekst)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Diensten({ locale, services }: { locale: Locale; services: Service[] }) {
  const t = (v: L) => pick(v, locale)
  const rijen = SERVICE_GROUPS.map((g, i) => {
    const laagste = vanafPrijs(services, g.kind)
    return {
      href: `${localePath(locale, "/services")}#${g.kind}`,
      nummer: `0${i + 1}`,
      soort: t(NIVEAU[g.kind]),
      kop: t(g.label),
      uitleg: t(g.intro),
      // Huisstijl Editie 02: de tegel van het niveau in plaats van een
      // conceptfoto, klein boven "01 · Ontwerp" en groot op de zwevende kaart.
      icoon: <IcoonTegel soort="dienst" id={g.kind} maat={32} decoratief locale={locale} />,
      vlak: <IcoonVlak soort="dienst" id={g.kind} ratio="4/3" locale={locale} />,
      // Een niveau zonder vaste prijs (ontwerp: altijd een offerte) zegt
      // "op maat", net als zijn dienstenkaarten.
      rechts: laagste ? t({ nl: `vanaf € ${laagste}`, en: `from € ${laagste}` }) : t({ nl: "op maat", en: "tailored" }),
    }
  })
  return (
    <Sectie
      id="diensten"
      label={t({ nl: "Diensten", en: "Services" })}
      kop={t({ nl: "Van meekijken tot onderhouden.", en: "From a second look to the care after." })}
      intro={t({
        nl: "Drie niveaus, in de volgorde waarin een tuin ze doorloopt — niet geordend naar wat ik het liefst verkoop.",
        en: "Three levels, in the order a garden goes through them — not ordered by what I would rather sell.",
      })}
    >
      <LinkShowcase rijen={rijen} />
    </Sectie>
  )
}

function Uitgelicht({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <section aria-labelledby="project-kop" className="py-10 sm:py-16">
      <div className={BREEDTE}>
        {/* grid-cols-[minmax(0,1fr)] op de telefoon: zonder die rem groeide
            de ene kolom mee met het schema (min. 520px) en liep de tekst onder
            de kaartrand weg. */}
        <BosVlak groot className="g-in g-wissel-groep grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div>
            <Label toon="bos">{t({ nl: "Uitgelicht project · in afronding", en: "Featured project · finishing" })}</Label>
            <Kop id="project-kop" lang="nl" className="mt-5 tekst-h2">{VIJVER.titel}</Kop>
            <p lang="nl" className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/80">{VIJVER.kaarttekst}</p>
            <FaseBalk fasen={VIJVER_FASEN} huidig={VIJVER_FASE_NU} locale={locale} toon="bos" className="mt-8 max-w-xl" />
            <CijferRij cijfers={UITGELICHT} toon="bos" className="mt-10 lg:grid-cols-2 xl:grid-cols-4" />
            <div className="mt-10">
              <Knop href={localePath(locale, `/projects/${VIJVER_SLUG}`)} soort="ember">
                {t({ nl: "Lees het hele project", en: "Read the whole project (in Dutch)" })}
              </Knop>
            </div>
          </div>
          {/* De foto vult zijn deel van het vlak tot aan de rand, met een
              rechte kant naar de tekst; de hoeken komen van het vlak zelf
              (eigenaar, 3 okt 2026: "Maak de fotos op kaarten recht
              bovenkant en vul de ruimte op"). De negatieve marge is precies
              de binnenrand van BosVlak groot (p-6, sm:p-12). */}
          <div className="-mx-6 -mb-6 sm:-mx-12 sm:-mb-12 lg:-my-12 lg:ml-0 lg:-mr-12 lg:self-stretch">
            {/* Foto zodra F01 er is, anders de waterroute — zelfde keuze
                als het projectenoverzicht (ProjectBeeld). Het hele vlak is
                de trekker voor de tweede foto (g-wissel-groep): onder de
                muis, of als de knop toetsenbordfocus heeft. */}
            <ProjectBeeld id="home-route" sizes="(min-width: 1024px) 50vw, 100vw" vul />
          </div>
        </BosVlak>
      </div>
    </section>
  )
}

function OverNick({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <section aria-labelledby="nick-kop" className="py-20 sm:py-28">
      <div className={`${BREEDTE} grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-20`}>
        <Beeld {...PORTRET} alt={t(PORTRET.alt)} ratio="1/1" focus="50% 30%" sizes="(min-width: 1024px) 34vw, 90vw" className="mx-auto w-full max-w-[416px] lg:mx-0" />
        <div className="g-in">
          <Label>{t({ nl: "Over mij", en: "About me" })}</Label>
          {/* Brand guide, pijler 03: "Je weet wie er aan jouw tuin werkt." */}
          <Kop id="nick-kop" className="mt-4 tekst-h2">{t({ nl: "Wie er aan jouw tuin werkt.", en: "Who works on your garden." })}</Kop>
          {/* De eerste twee alinea's van Nicks eigen tekst, letterlijk. */}
          <div className="mt-6 grid max-w-[62ch] gap-5">
            {/* De eerste alinea (twee zinnen) leest mee (LeesTekst); de
                tweede is te lang om woord voor woord op te lichten. */}
            <LeesTekst className="tekst-body text-foreground/85">{t(OVER_MIJ[0])}</LeesTekst>
            <p className="tekst-body text-foreground/85">{t(OVER_MIJ[1])}</p>
          </div>
          <div className="mt-8">
            <PijlLink href={localePath(locale, "/studio")}>{t({ nl: "Lees mijn hele verhaal", en: "Read my whole story" })}</PijlLink>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Een paar veelgestelde vragen, als laatste blok voor de voettekst: wie
 * tot hier las en nog twijfelt, krijgt antwoord op prijs, werkgebied,
 * duur en de eerste stap vlak voor de contactgegevens. Uit dezelfde lijst
 * als /faq (`THUIS_VRAGEN`); geen FAQPage-JSON-LD hier — die staat alleen
 * op /faq, de canonieke pagina.
 */
function Vragen({ locale, services }: { locale: Locale; services: Service[] }) {
  const t = (v: L) => pick(v, locale)
  const lijst = thuisVragen(vragen(services, locale))
  if (!lijst.length) return null
  // Twee kolommen op het raster, zoals het blok erboven (0,8fr/1,2fr):
  // kop links, de vragen tot de rechterlijn. Eerst stonden de vragen op
  // 880px onder de kop, met een leeg derde rechts (eigenaar, 28 sep 2026:
  // "faq op 2/3 en de ander 1/3 is leeg?").
  return (
    <section data-element="Sectie" id="vragen" aria-labelledby="vragen-kop" className="py-20 sm:py-28">
      <div className={`${BREEDTE} grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20`}>
        <div className="g-in lg:sticky lg:top-[112px] lg:self-start">
          <Label>{t({ nl: "Veelgestelde vragen", en: "Frequently asked questions" })}</Label>
          <Kop id="vragen-kop" className="tekst-h2 mt-4 max-w-[20ch]">
            {t({ nl: "Wat je wilt weten voordat je begint.", en: "What you want to know before you start." })}
          </Kop>
          <div className="mt-8">
            <PijlLink href={localePath(locale, "/faq")}>{t({ nl: "Alle vragen", en: "All questions" })}</PijlLink>
          </div>
        </div>
        <div data-vragen-lijst="" className="grid gap-3">
          <VragenLijst locale={locale} lijst={lijst} kop="h3" />
        </div>
      </div>
    </section>
  )
}

export function Home({ locale, services, checklist = false }: { locale: Locale; services: Service[]; checklist?: boolean }) {
  return (
    <>
      <Opening locale={locale} />
      <Merkbasis locale={locale} />
      <Diensten locale={locale} services={services} />
      <Uitgelicht locale={locale} />
      {/* Leeg tot Nick materiaal aanlevert (src/lib/data/vertrouwen.ts):
          dan rendert dit niets, geen kop en geen leeg vak. */}
      <Vertrouwen locale={locale} reactie={REACTIES[0]} lidmaatschappen={LIDMAATSCHAPPEN} />
      {/* De maillijst met de checklist vooraf. Achter de go-live-vlag
          (src/lib/nieuwsbrief.ts). De werkwijze staat sinds 2 okt 2026 op
          Studio (#werkwijze), niet meer hier ("Rustiger"). */}
      {checklist && <ChecklistBlok locale={locale} />}
      <OverNick locale={locale} />
      <Vragen locale={locale} services={services} />
    </>
  )
}

import { BUSINESS } from "@/lib/business"
import type { Crumb } from "@/lib/nav"
import { PRICING } from "@/lib/data/pricing"
import { FOTOS, VIJVER_SLUG, type Foto } from "@/lib/data/vijverrenovatie"
import { ZELF_DOEN } from "@/lib/data/zelf-doen"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { BREEDTE, Beeld, ContactKanalen, Knop, Kruimelpad, PaginaKop, PijlLink, PrijsTabel, Sectie, Stappenlijn, ZelfDoenKaarten } from "./elementen"

// De herfstbeurt (/herfstbeurt): de landingspagina van de najaarsactie
// (eigenaar, 29 sep 2026: "build a funnel"). Hierheen wijzen de
// advertentie, de posts en het WhatsApp-bericht aan oude klanten. Eén
// actie: een WhatsApp met een foto van de vijver. De prijzen komen uit
// `PRICING` — hier staat geen enkel bedrag overgetypt — en de foto's
// zijn van de vijverrenovatie, echt werk, geen sfeerbeeld.

/** De drie najaarsdiensten, in de volgorde waarin ze in het seizoen vallen. */
const DIENSTEN: { slug: "leaf-net" | "pond-autumn-service" | "winterising"; naam: L; wanneer: L }[] = [
  {
    slug: "leaf-net",
    naam: { nl: "Bladnet", en: "Leaf net" },
    wanneer: {
      nl: "Erop vóórdat het blad valt, in december haal ik het er weer af.",
      en: "On before the leaves fall; I take it off again in December.",
    },
  },
  {
    slug: "pond-autumn-service",
    naam: { nl: "Najaarsbeurt", en: "Autumn service" },
    wanneer: {
      nl: "Slib en afgestorven blad eruit, planten terugsnoeien, filter nakijken.",
      en: "Sludge and dead leaves out, plants cut back, filter checked.",
    },
  },
  {
    slug: "winterising",
    naam: { nl: "Winterklaar maken", en: "Winterising" },
    wanneer: {
      nl: "Pomp en leidingen vorstvrij, zodat er in het voorjaar niets gebarsten is.",
      en: "Pump and pipes made frost-safe, so nothing has cracked by spring.",
    },
  },
]

const BERICHT: L = {
  nl: "Hoi Nick, ik heb interesse in de herfstbeurt voor mijn vijver. Mijn postcode is … en de vijver is ongeveer … m². Een foto stuur ik mee.",
  en: "Hi Nick, I'm interested in the autumn service for my pond. My postcode is … and the pond is about … m². I'll send a photo along.",
}

/** De WhatsApp-link met het bericht alvast ingevuld. */
export function herfstWhatsApp(locale: Locale): string {
  return `${BUSINESS.whatsapp}?text=${encodeURIComponent(pick(BERICHT, locale))}`
}

const enkel = (f: Foto | Foto[] | undefined): Foto | undefined => (Array.isArray(f) ? f[0] : f)

export function HerfstbeurtPagina({ locale, trail }: { locale: Locale; trail: Crumb[] }) {
  const t = (v: L) => pick(v, locale)
  const href = (p: string) => localePath(locale, p)
  const whatsapp = herfstWhatsApp(locale)
  const voor = enkel(FOTOS.F02)
  const na = FOTOS.F10 as Foto | undefined

  return (
    <>
      <PaginaKop
        boven={<Kruimelpad trail={trail} locale={locale} />}
        label={t({ nl: "Najaar · vaste prijzen incl. btw", en: "Autumn · fixed prices incl. VAT" })}
        titel={t({ nl: "Je vijver winterklaar, vóór de vorst", en: "Your pond ready for winter, before the frost" })}
        intro={t({
          nl: "Blad dat nu in je vijver valt, is in het voorjaar slib en algen. Ik zet je vijver deze herfst winterklaar, met een prijs die je vooraf kent. Stuur een foto via WhatsApp en je hoort wat het kost en wanneer ik kan.",
          en: "Leaves that fall into your pond now are sludge and algae by spring. This autumn I get your pond ready for winter, at a price you know beforehand. Send a photo on WhatsApp and you'll hear what it costs and when I can come.",
        })}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Knop href={whatsapp}>{t({ nl: "Stuur een foto via WhatsApp", en: "Send a photo on WhatsApp" })}</Knop>
          <PijlLink href="#prijzen" stil>
            {t({ nl: "Bekijk de prijzen", en: "See the prices" })}
          </PijlLink>
        </div>
      </PaginaKop>

      {voor && na && (
        <div className={`${BREEDTE} grid grid-cols-2 gap-4 pb-8 sm:gap-6`}>
          <Beeld {...voor} ratio="4/5" priority sizes="(min-width: 1280px) 600px, 46vw" onderschrift={t({ nl: "Voor: de vijver onder een net", en: "Before: the pond under a net" })} />
          <Beeld {...na} ratio="4/5" focus="40% 50%" priority sizes="(min-width: 1280px) 600px, 46vw" onderschrift={t({ nl: "Na: dezelfde tuin, september", en: "After: the same garden, September" })} />
        </div>
      )}

      <Sectie
        id="prijzen"
        label={t({ nl: "Drie klussen, één seizoen", en: "Three jobs, one season" })}
        kop={t({ nl: "Wat het kost", en: "What it costs" })}
        intro={t({
          nl: "Alles incl. btw. Het meeste valt samen op één dag, dan is het ook één keer voorrijden.",
          en: "All incl. VAT. Most of it fits into one day, so there is one call-out, not three.",
        })}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {DIENSTEN.map((d) => (
            <div key={d.slug} className="grid content-start gap-4">
              <h3 className="tekst-h3">{t(d.naam)}</h3>
              <p className="tekst-body text-foreground/80">{t(d.wanneer)}</p>
              <PrijsTabel pricing={PRICING[d.slug]} locale={locale} />
              <PijlLink href={href(`/services/${d.slug}`)} stil>
                {t({ nl: "Wat je precies krijgt", en: "What exactly you get" })}
              </PijlLink>
            </div>
          ))}
        </div>
      </Sectie>

      <Sectie
        id="zo-werkt-het"
        vlak
        label={t({ nl: "Zo werkt het", en: "How it works" })}
        kop={t({ nl: "Een foto is genoeg om te beginnen", en: "A photo is enough to start" })}
      >
        <Stappenlijn
          items={[
            t({ nl: "Je stuurt een foto van je vijver en je postcode via WhatsApp.", en: "You send a photo of your pond and your postcode on WhatsApp." }),
            t({
              nl: "Je krijgt een prijs en een datum terug. Is de vijver lang niet onderhouden, dan kom ik eerst kijken.",
              en: "You get a price and a date back. If the pond hasn't been looked after in years, I come and look first.",
            }),
            t({ nl: "Ik kom, doe het werk en laat zien wat ik tegenkwam.", en: "I come, do the work and show you what I found." }),
          ]}
        />
        <div className="mt-10">
          <Knop href={whatsapp}>{t({ nl: "Stuur een foto via WhatsApp", en: "Send a photo on WhatsApp" })}</Knop>
        </div>
      </Sectie>

      <Sectie
        id="het-hele-jaar"
        label={t({ nl: "Daarna", en: "After that" })}
        kop={t({ nl: "Liever het hele jaar geregeld?", en: "Rather have the whole year covered?" })}
        intro={t({
          nl: "Met een onderhoudsabonnement kom ik vanzelf langs: in het voorjaar om op te starten, in het najaar om af te sluiten. Je hoeft er niet meer aan te denken.",
          en: "With a maintenance plan I come by without you asking: in spring to start up, in autumn to close down. You no longer have to think about it.",
        })}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <PrijsTabel pricing={PRICING["maintenance-subscription"]} locale={locale} />
          <div className="grid content-start gap-6">
            <p className="tekst-body max-w-[52ch] text-foreground/80">
              {t({
                nl: "Wat ik doe, zie je bij de vijverrenovatie: twee vijvers, een waterval en een beekloop, van de eerste schop tot de laatste plant.",
                en: "What I do, you can see in the pond renovation: two ponds, a waterfall and a stream, from the first spade to the last plant.",
              })}
            </p>
            <PijlLink href={href(`/projects/${VIJVER_SLUG}`)}>{t({ nl: "Bekijk de vijverrenovatie", en: "See the pond renovation" })}</PijlLink>
            <PijlLink href={href("/services/maintenance-subscription")} stil>
              {t({ nl: "Alles over het abonnement", en: "All about the plan" })}
            </PijlLink>
          </div>
        </div>
      </Sectie>

      {/* Korte how-to's uit Nicks eigen kennisposts (eigenaar, 2 okt 2026,
          naar Langenegger Naturgärten). */}
      <Sectie
        id="zelf-doen"
        vlak
        label={t({ nl: "Zelf doen", en: "Do it yourself" })}
        kop={t({ nl: "Drie dingen die je zelf kunt doen.", en: "Three things you can do yourself." })}
        intro={t({
          nl: "Liever zelf aan de slag? Met deze drie regels kom je met je tuin en vijver goed de herfst door.",
          en: "Rather do it yourself? With these three rules your garden and pond get through autumn well.",
        })}
      >
        <ZelfDoenKaarten items={ZELF_DOEN} locale={locale} />
      </Sectie>

      <section aria-labelledby="herfst-contact-kop" className={`${BREEDTE} border-t border-line/15 py-16`}>
        <h2 id="herfst-contact-kop" className="tekst-h3">
          {t({ nl: "Liever bellen of mailen?", en: "Rather call or email?" })}
        </h2>
        <p className="tekst-body mt-3 max-w-[60ch] text-foreground/80">
          {t({
            nl: `Nick Peters, ${BUSINESS.name}, ${BUSINESS.address.city}.`,
            en: `Nick Peters, ${BUSINESS.name}, ${BUSINESS.address.city}.`,
          })}
        </p>
        <div className="mt-6">
          <ContactKanalen groot />
        </div>
      </section>
    </>
  )
}

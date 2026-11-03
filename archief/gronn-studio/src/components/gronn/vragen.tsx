import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { BosVlak, BREEDTE, Knop, Opsomming, PaginaKop, PijlLink, Vraag, VraagAnker } from "./elementen"
import { ChecklistKaart } from "./checklist-aanbod"
import { KENNISMAKING } from "./plekken"
import type { Vraag as VraagData } from "./vragen-lijst"

// Veelgestelde vragen, samengesteld uit ./elementen. De vragen zelf en
// hun antwoorden komen uit ./vragen-lijst — dezelfde lijst die de
// FAQPage-JSON-LD en de zoekfunctie lezen.

export function VragenPagina({ locale, lijst, checklist = false }: { locale: Locale; lijst: VraagData[]; checklist?: boolean }) {
  const t = (v: L) => pick(v, locale)
  return (
    <>
      <PaginaKop
        label={t({ nl: "Veelgestelde vragen", en: "Frequently asked questions" })}
        titel={t({ nl: "Wat je wilt weten voordat je begint.", en: "What you want to know before you start." })}
        intro={t({
          nl: "Wat het kost, waar ik werk en hoe een traject gaat. Alle prijzen zijn inclusief btw.",
          en: "What it costs, where I work and how a project goes. All prices include VAT.",
        })}
      />
      <div className={`${BREEDTE} pb-24`}>
        <VraagAnker />
        {/* Twee kolommen op het raster, zoals de vragen op home: de lijst
            links onder de kop, rechts "Staat je vraag er niet bij?" dat
            meeschuift tot de rechterlijn. Eerst stond alles op 880px, met
            een leeg derde rechts (eigenaar, 29 sep 2026: "voor FAQ gebruik
            je maar 2/3 van de plek, waarom?"). De antwoorden houden hun
            leesbreedte van 68ch in `Vraag`. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
          <div data-vragen-lijst="" className="grid content-start gap-3">
            {/* De eerste staat open: de prijsvraag is waarom de meeste
                mensen hier zijn, en het laat meteen zien dat hij opengaat. */}
            <VragenLijst locale={locale} lijst={lijst} eersteOpen />
          </div>
          <aside data-vragen-zij="" className="lg:sticky lg:top-[112px] lg:self-start">
            <BosVlak>
              <p className="tekst-h3">{t({ nl: "Staat je vraag er niet bij?", en: "Is your question not here?" })}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                {t({ nl: "Stel hem gewoon. Een paar zinnen is genoeg.", en: "Just ask. A few sentences is enough." })}
              </p>
              <div className="mt-6">
                <Knop href={localePath(locale, "/contact")} soort="ember">{t(KENNISMAKING)}</Knop>
              </div>
            </BosVlak>
          </aside>
        </div>

        {/* Voor wie zich oriënteert en nog niet wil schrijven: de
            checklist vooraf. Achter de go-live-vlag. */}
        {checklist && <ChecklistKaart locale={locale} />}
      </div>
    </>
  )
}

/**
 * De vragen als kaarten, met hun antwoord en lees-link. Gedeeld door /faq
 * (kop h2) en home (kop h3, onder de sectiekop).
 */
export function VragenLijst({
  locale,
  lijst,
  kop = "h2",
  eersteOpen = false,
}: {
  locale: Locale
  lijst: VraagData[]
  kop?: "h2" | "h3"
  eersteOpen?: boolean
}) {
  return (
    <>
      {lijst.map((v, i) => (
        <Vraag
          key={v.id}
          id={v.id}
          vraag={v.vraag}
          kop={kop}
          open={eersteOpen && i === 0}
          na={v.verder && <PijlLink href={localePath(locale, v.verder.href)}>{v.verder.label}</PijlLink>}
        >
          {v.alineas.map((a, j) => (
            <p key={j}>{a}</p>
          ))}
          {v.lijst && (
            <Opsomming
              items={v.lijst.map((r) =>
                r.kop ? (
                  <>
                    <strong className="font-semibold text-foreground">{r.kop}.</strong> {r.tekst}
                  </>
                ) : (
                  r.tekst
                )
              )}
            />
          )}
        </Vraag>
      ))}
    </>
  )
}

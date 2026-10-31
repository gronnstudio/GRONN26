import { pick, type L, type Locale } from "@/lib/i18n"
import { Aanmelden, Label, PuntenLijst, Sectie } from "./elementen"
import { checklist } from "./checklist-lijst"
import { CHECKLIST_BELOFTE, CHECKLIST_NAAM } from "./teksten"

// De drie plekken waar de checklist vooraf wordt aangeboden, samengesteld
// uit ./elementen. Alleen zichtbaar met `nieuwsbriefZichtbaar()` — de
// pagina's beslissen dat, niet deze blokken.
//
// Waarom hier en niet in de opening (Dan Hoye's lead-magnet-aanpak): de
// opening is voor de ene echte actie, een kennismaking. De checklist is
// voor wie nog niet zover is. Hij staat dus waar iemand net heeft gelezen
// hoe het gaat (na het uitgelichte project op home), waar iemand zich oriënteert
// (/faq) en onderaan elke pagina (de voet), compact.

const GRATIS: L = { nl: "Gratis checklist", en: "Free checklist" }

/** Home, na het uitgelichte project: de checklist is de eerste stap, zelf gedaan. */
export function ChecklistBlok({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const onderdelen = checklist(locale)
  const punten = onderdelen.reduce((n, o) => n + o.punten.length, 0)
  return (
    <Sectie id="checklist" vlak label={t(GRATIS)} kop={t(CHECKLIST_NAAM)} intro={t(CHECKLIST_BELOFTE)}>
      {/* Eerst het formulier onder de kop, dan de kaart over de volle
          breedte van het raster. Tot 29 sep 2026 stond de kaart in de
          smalle kolom onder de intro (Nick, 24 sep 2026: "de indeling
          ziet oneven uit"); met alle 21 punten werd die kolom 1370px hoog,
          dus staat de kaart nu op de randen van het raster en liggen de
          vier onderdelen daarin twee aan twee. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-[40px] lg:gap-[48px]">
        <div className="max-w-[560px]">
          <Aanmelden plek="home" />
        </div>
        {/* Alle punten, niet alleen de vier koppen (Nick, 29 sep 2026: "zet
            hier een lijst van 21 punten ipv maar 4, kleed dat leuk aan").
            Uit dezelfde `checklist()` als /checklist, en het aantal is
            geteld — de kaart kan niet uit de pas lopen met de pagina. */}
        <div data-checklist-inhoud="" className="rounded-[16px] border border-line/15 bg-background p-[24px] sm:p-[32px] lg:px-[48px] lg:py-[40px]">
          <p className="tekst-annotatie flex items-baseline justify-between gap-[12px] text-muted">
            <span>{t({ nl: `Wat erin staat · ${punten} punten`, en: `What’s in it · ${punten} points` })}</span>
            {/* Onder 400px zou het getal "21 punten" breken; dan alleen de kop. */}
            <span aria-hidden className="hidden shrink-0 min-[400px]:inline">
              {t({ nl: `${onderdelen.length} delen`, en: `${onderdelen.length} parts` })}
            </span>
          </p>
          <div className="mt-[24px]">
            <PuntenLijst groepen={onderdelen.map((o) => ({ id: o.id, kop: o.kop, punten: o.punten.map((p) => p.tekst) }))} />
          </div>
        </div>
      </div>
    </Sectie>
  )
}

/** /faq, tussen de vragen en "Staat je vraag er niet bij?". */
export function ChecklistKaart({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  return (
    <section aria-labelledby="checklist-kop" className="mt-12 max-w-[880px] rounded-[16px] border border-line/15 bg-surface p-6 sm:p-8">
      <Label>{t(GRATIS)}</Label>
      <h2 id="checklist-kop" className="tekst-h3 mt-3">
        {t(CHECKLIST_NAAM)}
      </h2>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-foreground/80">{t(CHECKLIST_BELOFTE)}</p>
      <div className="mt-6 max-w-[560px]">
        <Aanmelden plek="faq" />
      </div>
    </section>
  )
}

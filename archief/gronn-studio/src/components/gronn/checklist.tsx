import { BUSINESS } from "@/lib/business"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { SITE_URL } from "@/lib/seo"
import { Afvinklijst, BREEDTE, Logo, PaginaKop, PdfKnop, PijlLink, PrintKnop } from "./elementen"
import type { ChecklistOnderdeel } from "./checklist-lijst"
import { KENNISMAKING } from "./plekken"
import { CHECKLIST_BELOFTE, CHECKLIST_NAAM } from "./teksten"

// De checklist vooraf (/checklist): de weggever van de maillijst, als
// pagina. "Download als PDF" is het printvenster van de browser; de
// printopmaak staat in globals.css ("De checklist op papier") en hangt
// aan `data-checklist`.
//
// Goedgekeurd door Nick op 24 sep 2026 ("checklist prime"). De bronnen
// per punt staan nog in `checklist-lijst.ts` — de test legt ze tegen de
// live pagina's, zodat er geen nieuw feit in sluipt — maar de bezoeker
// ziet ze niet meer; dat was voor de beoordeling.

/** De PDF's in public/pdf/, gemaakt met `npm run checklist:pdf`. */
export const CHECKLIST_PDF: Record<Locale, { pad: string; naam: string }> = {
  nl: { pad: "/pdf/checklist-vooraf.pdf", naam: "GRØNN Studio – Checklist vooraf.pdf" },
  en: { pad: "/pdf/checklist-before-you-start.pdf", naam: "GRØNN Studio – Checklist before you start.pdf" },
}

export function ChecklistPagina({ locale, onderdelen }: { locale: Locale; onderdelen: ChecklistOnderdeel[] }) {
  const t = (v: L) => pick(v, locale)
  const contact = `${SITE_URL.replace(/^https:\/\//, "")}${localePath(locale, "/contact")}`
  return (
    <div data-checklist="">
      {/* Op papier is de kop van de site weg; dan draagt het woordmerk de afzender. */}
      <div className={`${BREEDTE} hidden pt-2 print:block`}>
        <Logo hoogte={28} alt={BUSINESS.name} />
      </div>
      <PaginaKop
        label={t({ nl: "Gratis checklist", en: "Free checklist" })}
        titel={t(CHECKLIST_NAAM)}
        intro={t(CHECKLIST_BELOFTE)}
      >
        <div data-print="hide" className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <PdfKnop href={CHECKLIST_PDF[locale].pad} bestandsnaam={CHECKLIST_PDF[locale].naam}>
            {t({ nl: "Download als PDF", en: "Download as PDF" })}
          </PdfKnop>
          <PrintKnop>{t({ nl: "Printen", en: "Print" })}</PrintKnop>
        </div>
      </PaginaKop>

      <div className={`${BREEDTE} grid gap-14 pb-16`}>
        {onderdelen.map((o, i) => (
          <section key={o.id} aria-labelledby={`${o.id}-kop`} className="max-w-[880px]">
            <p className="tekst-annotatie text-muted">{`0${i + 1}`}</p>
            <h2 id={`${o.id}-kop`} className="tekst-h3 mt-3">
              {o.kop}
            </h2>
            {o.intro && <p className="tekst-body mt-3 max-w-[62ch] text-foreground/80">{o.intro}</p>}
            <div className="mt-6">
              <Afvinklijst
                items={o.punten.map((p) => ({
                  tekst: p.tekst,
                  uitleg: p.uitleg,
                }))}
              />
            </div>
          </section>
        ))}

        <section aria-labelledby="checklist-klaar" className="max-w-[880px] border-t border-line/15 pt-10">
          <h2 id="checklist-klaar" className="tekst-h3">
            {t({ nl: "Alles bekeken?", en: "Checked it all?" })}
          </h2>
          <p className="tekst-body mt-3 max-w-[62ch] text-foreground/80">
            {t({
              nl: "Neem je antwoorden mee naar ons eerste gesprek.",
              en: "Bring your answers to our first conversation.",
            })}
          </p>
          <div data-print="hide" className="mt-6">
            <PijlLink href={localePath(locale, "/contact")}>{t(KENNISMAKING)}</PijlLink>
          </div>
          {/* Op papier: waar je daarna heen kunt, uit business.ts. */}
          <p className="mt-6 hidden text-[13px] leading-relaxed print:block">
            {BUSINESS.name} · {BUSINESS.address.city}, {BUSINESS.address.province} · {contact} · {BUSINESS.email} · {BUSINESS.phone}
          </p>
        </section>
      </div>
    </div>
  )
}

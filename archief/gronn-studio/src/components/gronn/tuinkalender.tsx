import { pick, type L, type Locale } from "@/lib/i18n"
import { STEIN } from "@/lib/hemel"
import { localePath } from "@/lib/locale"
import type { Crumb } from "@/lib/nav"

import { BREEDTE, HemelVandaag, JaarKalender, Kruimelpad, PaginaKop, PijlLink, Sectie, ZonJaarTabel } from "./elementen"

// /calendar: de uitgebreide versie van de rechterbubbel (eigenaar, 28 sep
// 2026: "make this also clickable so it opens a link, to a page with
// advanced info?"). Alleen wat er al was, uitgerekend: de regels uit
// SEIZOEN (src/lib/data/seizoen.ts, een algemene tuinkalender, geen
// advies) en zon en maan uit src/lib/hemel.ts. Niets verzonnen.

const graden = (n: number, locale: Locale) => (locale === "nl" ? n.toFixed(2).replace(/0$/, "").replace(".", ",") : n.toFixed(2).replace(/0$/, ""))

export function TuinkalenderPagina({ locale, trail }: { locale: Locale; trail: Crumb[] }) {
  const t = (v: L) => pick(v, locale)
  const plek =
    locale === "nl"
      ? `${graden(STEIN.lat, locale)}° N, ${graden(STEIN.lng, locale)}° O`
      : `${graden(STEIN.lat, locale)}° N, ${graden(STEIN.lng, locale)}° E`
  return (
    <>
      <PaginaKop
        boven={<Kruimelpad trail={trail} locale={locale} />}
        label={<span data-plek="">Stein · {plek}</span>}
        titel={t({ nl: "Tuinkalender.", en: "Garden calendar." })}
        intro={t({
          nl: "Eén vuistregel per maand, en de zon en de maan van vandaag, uitgerekend voor Stein. Een algemene tuinkalender, geen advies op maat.",
          en: "One rule of thumb per month, plus today's sun and moon, calculated for Stein. A general garden calendar, not tailored advice.",
        })}
      />
      <Sectie
        id="vandaag"
        label={t({ nl: "Vandaag", en: "Today" })}
        kop={t({ nl: "Zon en maan boven Stein.", en: "Sun and moon over Stein." })}
        intro={t({
          nl: "Uitgerekend in je browser, voor de plek van de studio. De boog loopt van opkomst tot ondergang; de stip is waar de zon nu staat.",
          en: "Calculated in your browser, for the studio's location. The arc runs from sunrise to sunset; the dot is where the sun is now.",
        })}
        className="pt-0 sm:pt-0"
      >
        <HemelVandaag locale={locale} />
      </Sectie>
      <Sectie
        id="jaar"
        label={t({ nl: "Het jaar", en: "The year" })}
        kop={t({ nl: "Twaalf maanden, twaalf regels.", en: "Twelve months, twelve rules." })}
        intro={t({
          nl: "Korte, bekende vuistregels voor tuin en vijver. De maand van nu is gemarkeerd, volgens de klok van je eigen apparaat.",
          en: "Short, well-known rules of thumb for garden and pond. The current month is marked, going by your own device's clock.",
        })}
      >
        <JaarKalender locale={locale} />
      </Sectie>
      <Sectie
        id="zon-per-maand"
        label={t({ nl: "Zon per maand", en: "Sun by month" })}
        kop={t({ nl: "Op en onder, de 1e van elke maand.", en: "Sunrise and sunset on the 1st of each month." })}
      >
        <ZonJaarTabel locale={locale} />
      </Sectie>
      <div className={`${BREEDTE} pb-24`}>
        <div className="grid gap-4 border-t border-line/15 pt-8 sm:flex sm:items-center sm:justify-between">
          <p data-uitleg="" className="tekst-annotatie max-w-[60ch] text-muted">
            {t({
              nl: `Tijden uitgerekend voor Stein (${plek}) met het rekenschema van NOAA, in Nederlandse tijd. Ze kunnen een paar minuten afwijken; de maanfase klopt tot op ongeveer een halve dag.`,
              en: `Times calculated for Stein (${plek}) with the NOAA method, in Dutch time. They can be a few minutes off; the moon phase is accurate to about half a day.`,
            })}
          </p>
          <PijlLink href={localePath(locale, "/contact")} stil>
            {t({ nl: "Vraag over je tuin? Stuur me een bericht", en: "A question about your garden? Send me a message" })}
          </PijlLink>
        </div>
      </div>
    </>
  )
}

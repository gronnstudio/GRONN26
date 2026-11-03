/** @jsxImportSource react */
// ↑ Wat Next hier toch al doet, maar dan uitgeschreven: de testrunner van
// Playwright zet JSX anders om (naar zijn eigen componenttest-vorm), en
// tests/e2e/vindbaarheid.spec.ts rendert dit element met react-dom/server
// om de GEVULDE staat te bewijzen, die op de site nog niet kan bestaan.
import type { Lidmaatschap, Reactie } from "@/lib/data/vertrouwen"
import { pick, type L, type Locale } from "@/lib/i18n"

import { BREEDTE } from "./breedte"

/**
 * Vertrouwen: één klantreactie en de lidmaatschappen of kwalificaties.
 * Is beide leeg, dan rendert het NIETS — geen kop, geen leeg vak (net
 * als een foto die er nog niet is). De inhoud komt uit
 * `src/lib/data/vertrouwen.ts` en alleen van Nick.
 *
 * Geen oranje: de streep bij de reactie is een lijn in `--line`, de
 * links staan in de tekstkleur. Het oranje accent van de omgeving (de
 * knop in Uitgelicht) blijft het enige.
 */
export function Vertrouwen({
  locale,
  reactie,
  lidmaatschappen = [],
  className = "",
}: {
  locale: Locale
  reactie?: Reactie
  lidmaatschappen?: Lidmaatschap[]
  className?: string
}) {
  const heeftReactie = !!reactie && reactie.tekst.trim() !== "" && reactie.naam.trim() !== ""
  const leden = lidmaatschappen.filter((l) => l.naam.trim() !== "")
  if (!heeftReactie && leden.length === 0) return null

  const t = (v: L) => pick(v, locale)
  const kop = "tekst-annotatie text-muted uppercase"
  return (
    <section data-element="Vertrouwen" data-vertrouwen className={`py-10 sm:py-16 ${className}`}>
      <div className={BREEDTE}>
        <div
          className={`grid grid-cols-[minmax(0,1fr)] gap-10 rounded-[16px] border border-line/10 bg-surface p-6 sm:p-10 ${
            heeftReactie && leden.length ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16" : ""
          }`}
        >
          {heeftReactie && (
            <div>
              <h2 className={kop}>{t({ nl: "Een klant over het werk", en: "A client on the work" })}</h2>
              <figure className="mt-5">
                <blockquote lang={reactie.taal ?? "nl"} className="border-l-2 border-line/30 pl-5 sm:pl-8">
                  <p className="tekst-h3">“{reactie.tekst}”</p>
                </blockquote>
                <figcaption className="mt-4 pl-5 tekst-annotatie text-muted sm:pl-8">— {reactie.naam}</figcaption>
              </figure>
            </div>
          )}
          {leden.length > 0 && (
            <div>
              <h2 className={kop}>{t({ nl: "Lidmaatschappen en kwalificaties", en: "Memberships and qualifications" })}</h2>
              <ul className="mt-5 grid gap-3">
                {leden.map((l) => (
                  <li key={l.naam} className="border-t border-line/15 pt-3 text-[16px] leading-relaxed">
                    {l.link ? (
                      <a href={l.link} className="inline-flex min-h-[24px] items-center underline decoration-1 underline-offset-4 hover:decoration-2">
                        {l.naam}
                      </a>
                    ) : (
                      l.naam
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

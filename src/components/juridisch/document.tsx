import { Opening } from "@/components/wereld/opening"
import { Inhoud } from "@/components/juridisch/inhoud"
import { SectieBody, Alinea } from "@/components/juridisch/alinea"
import { BUSINESS } from "@/lib/business"
import { Beide, T, type Tekst } from "@/components/taal"
import type { LegalDocument } from "@/lib/data/legal/types"

function datum(iso: string, locale: "nl-NL" | "en-GB" = "nl-NL") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  )
}

// WF-033 met de donkere opening van de site: smalle leeskolom, links de inhoudsopgave.
// Gedeeld door privacy, voorwaarden en herroeping; de tekst komt letterlijk uit src/lib/data/legal/.
export function JuridischDocument({ doc, titel }: { doc: LegalDocument; titel: Tekst }) {
  const a = BUSINESS.address
  return (
    <>
      {/* Eén lang woord per regel: op de telefoon iets kleiner, zodat het past. */}
      <div className="max-md:[&_.w-reus]:text-[13vw]!">
      <Opening label={{ nl: "Juridisch", en: "Legal" }} titel={titel}>
        <div className="mt-[clamp(28px,3vw,48px)] flex flex-wrap gap-x-6 gap-y-2 text-[#a9a8a3]">
          <p className="lbl m-0"><Beide nl={<>Laatst bijgewerkt · {datum(doc.updated)}</>} en={<>Last updated · {datum(doc.updated, "en-GB")}</>} /></p>
          <p className="lbl m-0">Status · <T t={doc.status === "concept" ? { nl: "Concept", en: "Draft" } : { nl: "Vastgesteld", en: "Final" }} /></p>
        </div>
        {/* Alleen in het Engels: het document zelf blijft Nederlands. */}
        <Beide
          nl={null}
          en={<p className="mt-4 mb-0 max-w-[60ch]">This document is only available in Dutch. The Dutch text is legally binding.</p>}
        />
      </Opening>
      </div>
      <div className="wrap">
      <div className="mt-[clamp(56px,7vw,96px)] grid grid-cols-1 items-start gap-y-8 lg:grid-cols-[3fr_9fr] lg:gap-x-8">
        <Inhoud koppen={doc.sections.map((s) => s.heading)} />

        <article className="min-w-0 max-w-[66ch] [overflow-wrap:anywhere] text-base leading-[1.7] md:text-[17px]">
          <p className="mt-0 mb-2 text-[clamp(18px,1.7vw,22px)] leading-[1.55]">
            <Alinea tekst={doc.intro} />
          </p>

          {doc.sections.map((s, i) => (
            <section key={s.heading} id={`s${i + 1}`} className="scroll-mt-6 pt-12">
              <h2 className="syne mt-0 mb-4 grid grid-cols-[32px_minmax(0,1fr)] text-[clamp(22px,2.2vw,28px)] leading-[1.2] tracking-[-.02em] md:grid-cols-[44px_minmax(0,1fr)]">
                <span className="lbl pt-2 font-semibold text-gedempt">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <SectieBody body={s.body} />
            </section>
          ))}

          <section
            aria-labelledby="h-bedrijfsgegevens"
            className="mt-16 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-inkt pt-5 md:grid-cols-2"
          >
            <p id="h-bedrijfsgegevens" className="lbl m-0 text-gedempt md:col-span-2"><T t={{ nl: "Bedrijfsgegevens", en: "Company details" }} /></p>
            <p className="m-0">
              {BUSINESS.name}
              <br />
              {a.street}
              <br />
              {a.postalCode} {a.city}
            </p>
            <p className="m-0">
              <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>
              <br />
              <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
            </p>
            <p className="lbl m-0 text-gedempt">
              KVK {BUSINESS.kvk}
              <br />
              BTW {BUSINESS.btw}
            </p>
            <p className="lbl m-0 text-gedempt">{BUSINESS.legalForm}</p>
          </section>

          <nav aria-label="Verder" className="mt-10 flex flex-wrap gap-x-7 gap-y-4">
            <a className="lnk" href="#inhoud">
              <T t={{ nl: "Naar de inhoud ↑", en: "Back to contents ↑" }} />
            </a>
          </nav>
        </article>
      </div>
      </div>
    </>
  )
}

import { Opening } from "@/components/wereld/opening"
import { Inhoud } from "@/components/juridisch/inhoud"
import { SectieBody, Alinea } from "@/components/juridisch/alinea"
import { BUSINESS } from "@/lib/business"
import type { LegalDocument } from "@/lib/data/legal/types"

function datum(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  )
}

// WF-033 met de donkere opening van de site: smalle leeskolom, links de inhoudsopgave.
// Gedeeld door privacy, voorwaarden en herroeping; de tekst komt letterlijk uit src/lib/data/legal/.
export function JuridischDocument({ doc, titel }: { doc: LegalDocument; titel: string }) {
  const a = BUSINESS.address
  return (
    <>
      {/* Eén lang woord per regel: op de telefoon iets kleiner, zodat het past. */}
      <div className="max-md:[&_.w-reus]:text-[13vw]!">
      <Opening label="Juridisch" titel={titel}>
        <div className="mt-[clamp(28px,3vw,48px)] flex flex-wrap gap-x-6 gap-y-2 text-[#a9a8a3]">
          <p className="lbl m-0">Laatst bijgewerkt · {datum(doc.updated)}</p>
          <p className="lbl m-0">Status · {doc.status === "concept" ? "Concept" : "Vastgesteld"}</p>
        </div>
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
            aria-label="Bedrijfsgegevens"
            className="mt-16 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-inkt pt-5 md:grid-cols-2"
          >
            <p className="lbl m-0 text-gedempt md:col-span-2">Bedrijfsgegevens</p>
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
              Naar de inhoud ↑
            </a>
          </nav>
        </article>
      </div>
      </div>
    </>
  )
}

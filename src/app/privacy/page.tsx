import type { Metadata } from "next"
import { Inhoud } from "@/components/juridisch/inhoud"
import { SectieBody, Alinea } from "@/components/juridisch/alinea"
import { BUSINESS } from "@/lib/business"
import { PRIVACY } from "@/lib/data/legal/privacy"

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Wat GRØNN Studio met je gegevens doet: wat ik verwerk, waarvoor, hoe lang, met wie ik het deel en wat je rechten zijn.",
  alternates: { canonical: "/privacy" },
}

function datum(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`)
  )
}

// WF-033: smalle leeskolom, links de inhoudsopgave. Tekst letterlijk uit
// src/lib/data/legal/privacy.ts.
export default function PrivacyPagina() {
  const doc = PRIVACY
  const a = BUSINESS.address
  return (
    <div className="wrap">
      <section className="grid grid-cols-1 gap-y-4 pt-[clamp(56px,9vw,140px)] md:grid-cols-[3fr_9fr] md:gap-x-8 md:gap-y-0">
        <p className="lbl m-0 text-gedempt">Juridisch</p>
        <h1 className="syne m-0 text-[clamp(42px,7.5vw,104px)] leading-none tracking-[-.04em] break-words hyphens-auto">{doc.title}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 md:col-start-2 md:mt-7">
          <p className="lbl m-0 text-gedempt">Laatst bijgewerkt · {datum(doc.updated)}</p>
          <p className="lbl m-0 text-gedempt">Status · {doc.status === "concept" ? "Concept" : "Vastgesteld"}</p>
        </div>
      </section>

      <div className="mt-[clamp(56px,7vw,96px)] grid grid-cols-1 items-start gap-y-8 lg:grid-cols-[3fr_9fr] lg:gap-x-8">
        <Inhoud koppen={doc.sections.map((s) => s.heading)} />

        <article className="min-w-0 max-w-[66ch] text-base leading-[1.7] md:text-[17px]">
          <p className="mt-0 mb-2 text-[clamp(18px,1.7vw,22px)] leading-[1.55]">
            <Alinea tekst={doc.intro} />
          </p>

          {doc.sections.map((s, i) => (
            <section key={s.heading} id={`s${i + 1}`} className="scroll-mt-6 pt-12">
              <h2 className="syne mt-0 mb-4 grid grid-cols-[32px_minmax(0,1fr)] text-[clamp(22px,2.2vw,28px)] leading-[1.2] tracking-[-.02em] md:grid-cols-[44px_minmax(0,1fr)]">
                <span className="pt-2 font-mono text-xs font-normal text-gedempt">{String(i + 1).padStart(2, "0")}</span>
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
  )
}

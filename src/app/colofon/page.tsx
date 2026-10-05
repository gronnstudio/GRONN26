import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { T } from "@/components/taal"
import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"
import { PRIVACY } from "@/lib/data/legal/privacy"
import { VOORWAARDEN_CONSUMENT } from "@/lib/data/legal/voorwaarden-consument"
import { HERROEPING } from "@/lib/data/legal/herroeping"

export const metadata: Metadata = {
  title: "Colofon",
  description: "Alles wat een Nederlands bedrijf verplicht is te publiceren, plus de documenten die beschrijven hoe ik werk.",
  alternates: { canonical: "/colofon" },
}

const PARTICULIER: L = { nl: "Particuliere opdrachtgevers", en: "Private clients" }
const a = BUSINESS.address
const GEGEVENS: [L, React.ReactNode][] = [
  [{ nl: "Handelsnaam", en: "Trade name" }, BUSINESS.name],
  [{ nl: "Vestigingsadres", en: "Business address" }, <>{a.street}<br />{a.postalCode} {a.city}</>],
  [{ nl: "Land", en: "Country" }, a.country],
  [{ nl: "KvK-nummer", en: "Chamber of Commerce (KvK) number" }, BUSINESS.kvk],
  [{ nl: "Btw-identificatienummer", en: "VAT identification number" }, BUSINESS.btw],
  [{ nl: "E-mail", en: "E-mail" }, <a key="e" href={BUSINESS.emailHref}>{BUSINESS.email}</a>],
  [{ nl: "Telefoon", en: "Phone" }, <a key="t" href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>],
]
const DOCS: { doc: { title: string; status: string }; href: string; voor: L; titel: L }[] = [
  { doc: VOORWAARDEN_CONSUMENT, href: "/voorwaarden", voor: PARTICULIER, titel: { nl: VOORWAARDEN_CONSUMENT.title, en: "Terms and conditions for private clients" } },
  { doc: HERROEPING, href: "/herroeping", voor: PARTICULIER, titel: { nl: HERROEPING.title, en: "Model form for cancellation / withdrawal" } },
  { doc: PRIVACY, href: "/privacy", voor: { nl: "Iedereen", en: "Everyone" }, titel: { nl: PRIVACY.title, en: "Privacy statement" } },
]

// Het colofon van gronn.studio, in de taal van de nieuwe site. Teksten letterlijk overgenomen.
export default function Colofon() {
  return (
    <>
      <Opening
        label={{ nl: "Juridisch", en: "Legal" }}
        titel={{ nl: "Colofon", en: "Colophon" }}
        zin={
          <T
            t={{
              nl: "Alles wat een Nederlands bedrijf verplicht is te publiceren, plus de documenten die beschrijven hoe wij werken. Op één plek, zodat er niets naar gezocht hoeft te worden.",
              en: "Everything a Dutch business is required to publish, plus the documents that describe how we work. In one place, so nobody has to go looking for it.",
            }}
          />
        }
      />
      <div className="wrap max-w-[900px]">
        <section className="w-sectie" aria-labelledby="h-gegevens">
          <div className="w-kopregel"><h2 id="h-gegevens" className="lbl m-0 font-normal"><T t={{ nl: "Bedrijfsgegevens", en: "Company details" }} /></h2></div>
          <dl className="m-0 border-t border-lijn">
            {GEGEVENS.map(([k, v]) => (
              <div key={k.nl} className="grid gap-1 border-b border-lijn py-4 md:grid-cols-[260px_1fr]">
                <dt className="lbl text-gedempt"><T t={k} /></dt>
                <dd className="m-0 tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[14px] leading-relaxed text-gedempt">
            <T
              t={{
                nl: "Ons rekeningnummer staat hier bewust niet. Het is niet verplicht, en een rekeningnummer dat een vreemde op onze eigen site kan lezen is een rekeningnummer waarmee een valse factuur er echt uitziet. Klanten vinden het op hun factuur.",
                en: "Our bank account number is deliberately not listed here. It is not required, and an account number a stranger can read on our own site is an account number that makes a fake invoice look real. Clients find it on their invoice.",
              }}
            />
          </p>
        </section>

        <section className="w-sectie" aria-labelledby="h-docs">
          <div className="w-kopregel"><h2 id="h-docs" className="lbl m-0 font-normal"><T t={{ nl: "Voorwaarden en beleid", en: "Terms and policies" }} /></h2></div>
          <ul className="m-0 list-none border-t border-lijn p-0">
            {DOCS.map(({ doc, href, voor, titel }) => (
              <li key={href}>
                <Link href={href} className="group flex items-baseline gap-4 border-b border-lijn py-5 no-underline">
                  <span className="flex-1">
                    <span className="syne block text-[clamp(20px,2vw,26px)] tracking-[-.02em] group-hover:underline"><T t={titel} /></span>
                    <span className="lbl mt-1 block text-gedempt"><T t={voor} />{doc.status === "concept" && <T t={{ nl: " · concept", en: " · draft" }} />}</span>
                  </span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] leading-relaxed text-gedempt">
            <T
              t={{
                nl: "Documenten met de aanduiding concept zijn geschreven maar nog niet getoetst door een Nederlandse jurist. De wettelijke regels gelden onverkort, wat er in deze documenten ook staat.",
                en: "Documents marked draft have been written but not yet reviewed by a Dutch lawyer. The statutory rules apply in full, whatever these documents say.",
              }}
            />
          </p>
        </section>
      </div>
    </>
  )
}

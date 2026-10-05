import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { BUSINESS } from "@/lib/business"
import { PRIVACY } from "@/lib/data/legal/privacy"
import { VOORWAARDEN_CONSUMENT } from "@/lib/data/legal/voorwaarden-consument"
import { HERROEPING } from "@/lib/data/legal/herroeping"

export const metadata: Metadata = {
  title: "Colofon",
  description: "Alles wat een Nederlands bedrijf verplicht is te publiceren, plus de documenten die beschrijven hoe ik werk.",
  alternates: { canonical: "/colofon" },
}

const a = BUSINESS.address
const GEGEVENS: [string, React.ReactNode][] = [
  ["Handelsnaam", BUSINESS.name],
  ["Vestigingsadres", <>{a.street}<br />{a.postalCode} {a.city}</>],
  ["Land", a.country],
  ["KvK-nummer", BUSINESS.kvk],
  ["Btw-identificatienummer", BUSINESS.btw],
  ["E-mail", <a key="e" href={BUSINESS.emailHref}>{BUSINESS.email}</a>],
  ["Telefoon", <a key="t" href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>],
]
const DOCS = [
  { doc: VOORWAARDEN_CONSUMENT, href: "/voorwaarden", voor: "Particuliere opdrachtgevers" },
  { doc: HERROEPING, href: "/herroeping", voor: "Particuliere opdrachtgevers" },
  { doc: PRIVACY, href: "/privacy", voor: "Iedereen" },
]

// Het colofon van gronn.studio, in de taal van de nieuwe site. Teksten letterlijk overgenomen.
export default function Colofon() {
  return (
    <>
      <Opening label="Juridisch" titel="Colofon" zin="Alles wat een Nederlands bedrijf verplicht is te publiceren, plus de documenten die beschrijven hoe wij werken. Op één plek, zodat er niets naar gezocht hoeft te worden." />
      <div className="wrap max-w-[900px]">
        <section className="w-sectie" aria-labelledby="h-gegevens">
          <div className="w-kopregel"><h2 id="h-gegevens" className="lbl m-0 font-normal">Bedrijfsgegevens</h2></div>
          <dl className="m-0 border-t border-lijn">
            {GEGEVENS.map(([k, v]) => (
              <div key={k} className="grid gap-1 border-b border-lijn py-4 md:grid-cols-[260px_1fr]">
                <dt className="lbl text-gedempt">{k}</dt>
                <dd className="m-0 tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[14px] leading-relaxed text-gedempt">Ons rekeningnummer staat hier bewust niet. Het is niet verplicht, en een rekeningnummer dat een vreemde op onze eigen site kan lezen is een rekeningnummer waarmee een valse factuur er echt uitziet. Klanten vinden het op hun factuur.</p>
        </section>

        <section className="w-sectie" aria-labelledby="h-docs">
          <div className="w-kopregel"><h2 id="h-docs" className="lbl m-0 font-normal">Voorwaarden en beleid</h2></div>
          <ul className="m-0 list-none border-t border-lijn p-0">
            {DOCS.map(({ doc, href, voor }) => (
              <li key={href}>
                <Link href={href} className="group flex items-baseline gap-4 border-b border-lijn py-5 no-underline">
                  <span className="flex-1">
                    <span className="syne block text-[clamp(20px,2vw,26px)] tracking-[-.02em] group-hover:underline">{doc.title}</span>
                    <span className="lbl mt-1 block text-gedempt">{voor}{doc.status === "concept" && " · concept"}</span>
                  </span>
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] leading-relaxed text-gedempt">Documenten met de aanduiding concept zijn geschreven maar nog niet getoetst door een Nederlandse jurist. De wettelijke regels gelden onverkort, wat er in deze documenten ook staat.</p>
        </section>
      </div>
    </>
  )
}

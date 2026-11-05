import { toonNummer } from "@/lib/crm/nummer"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HandtekeningVeld } from "@/components/crm/handtekening-veld"
import { PdfKnoppen } from "@/components/crm/pdf-knoppen"
import { BUSINESS } from "@/lib/business"
import { leesWerkbon } from "@/lib/beheer/werkbon"
import { teken } from "./acties"

// De werkbon zoals de klant hem ziet en tekent (idee uit Plancraft, 5 nov
// 2026). Geen inlog: de sleutel in het adres is de toegang.
export const metadata: Metadata = { title: "Werkbon", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

export default async function WerkbonPagina({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const w = await leesWerkbon(token)
  if (!w) notFound()
  return (
    <article className="offerte-druk mx-auto max-w-[860px] px-6 pt-[clamp(32px,6vw,72px)] pb-24 print:max-w-none print:p-0">
      <div className="-mx-6 rounded-b-[24px] bg-[#202020] px-6 pt-8 pb-7 sm:px-10 print:mx-0 print:px-[48px] print:pt-[40px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[36px] w-auto" />
        <p className="m-0 mt-5 text-[11px] font-semibold tracking-[.18em] text-[#ff5b04] uppercase">Vijvers en natuurlijke tuinen · Stein en omgeving</p>
      </div>
      <div className="print:px-[48px]">
        <header className="mt-8 border-b border-lijn pb-6">
          <p className="lbl m-0 text-gedempt">Werkbon · {toonNummer(w.nummer)}</p>
          <h1 className="syne m-0 mt-2 text-[clamp(30px,4.4vw,48px)] leading-[1.05] tracking-[-.03em]">{datum(w.datum)}</h1>
          <p className="m-0 mt-3 text-[16px] text-gedempt">
            Bij {w.klant}
            {w.adres ? ` · ${w.adres}` : ""}
          </p>
        </header>
        <dl className="m-0 mt-8 grid gap-6 text-[16px] leading-[1.6]">
          <div>
            <dt className="lbl text-gedempt">Gedaan</dt>
            <dd className="m-0 mt-1 whitespace-pre-line">{w.werk}</dd>
          </div>
          <div>
            <dt className="lbl text-gedempt">Uren</dt>
            <dd className="m-0 mt-1 tabular-nums">{w.uren.toLocaleString("nl-NL")} uur</dd>
          </div>
          {w.materiaal && (
            <div>
              <dt className="lbl text-gedempt">Materiaal</dt>
              <dd className="m-0 mt-1 whitespace-pre-line">{w.materiaal}</dd>
            </div>
          )}
          {w.opmerking && (
            <div>
              <dt className="lbl text-gedempt">Opmerking</dt>
              <dd className="m-0 mt-1 whitespace-pre-line">{w.opmerking}</dd>
            </div>
          )}
        </dl>

        {w.getekend ? (
          <section aria-labelledby="getekend" className="mt-10 border-t border-lijn pt-6">
            <h2 id="getekend" className="lbl m-0 text-gedempt">Voor gezien getekend</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={w.getekend.beeld} alt={`Handtekening van ${w.getekend.naam}`} className="mt-3 h-[90px] w-auto rounded-[8px] bg-white p-1" />
            <p className="m-0 mt-2 text-[14px]">
              {w.getekend.naam} · {new Date(w.getekend.op).toLocaleString("nl-NL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })}
            </p>
          </section>
        ) : (
          <form action={teken.bind(null, w.token)} data-geen-pdf className="mt-10 grid gap-4 rounded-[16px] border border-lijn p-6 print:hidden">
            <h2 className="syne m-0 text-[24px]">Klopt dit?</h2>
            <label className="grid max-w-[420px] gap-2">
              <span className="lbl">Je naam</span>
              <input name="naam" required autoComplete="name" className="block w-full rounded-[12px] border border-gedempt bg-veld px-4 py-3 text-[18px] text-inkt outline-none focus:border-inkt" />
            </label>
            <HandtekeningVeld knop="Tekenen">
              <label className="flex items-start gap-3 text-[15px] leading-[1.5]">
                <input type="checkbox" name="eens" value="ja" required className="mt-1 size-[18px] shrink-0" />
                <span>Ik heb gezien dat dit werk op deze dag is gedaan.</span>
              </label>
            </HandtekeningVeld>
          </form>
        )}

        <PdfKnoppen naam={`Werkbon ${toonNummer(w.nummer)} GRØNN Studio`} />

        <footer className="mt-12 border-t border-lijn pt-5 text-[13px] leading-[1.6] text-gedempt">
          {BUSINESS.name} · {BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.city} · KvK {BUSINESS.kvk} · {BUSINESS.phone} · {BUSINESS.email}
        </footer>
      </div>
    </article>
  )
}

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PdfKnoppen } from "@/components/crm/pdf-knoppen"
import { Qr } from "@/components/crm/qr"
import { BUSINESS } from "@/lib/business"
import { leesKlanten } from "@/lib/beheer/klanten"
import { betaalstand } from "@/lib/crm/klant"
import { epcCode } from "@/lib/crm/factuur-reken"
import { leesFactuur } from "@/lib/crm/factuur"
import { toonEuro } from "@/lib/crm/geld"
import { vandaagNL } from "@/lib/crm/overzicht"

// De factuur zoals de klant hem via de privélink ziet (Nick koos "Facturen in
// het dashboard", 5 nov 2026). Zelfde briefpapier als de offerte. Staat de
// factuur op herinnerd, dan is dit blad de kosteloze herinnering met de nieuwe
// termijn uit de voorwaarden; is hij betaald, dan staat dat erop.
export const metadata: Metadata = { title: "Factuur", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

export default async function FactuurPagina({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const f = await leesFactuur(token)
  if (!f) notFound()
  // De stand (betaald, herinnerd) leeft op de klantkaart; het document zelf verandert niet.
  const stuk = (await leesKlanten()).find((k) => k.id === f.klantId)?.stukken.find((s) => s.factuur === f.token)
  if (!stuk) notFound()
  const stand = betaalstand(stuk, vandaagNL())
  const herinnering = stand.stand === "herinnerd"
  const uiterlijk = stand.stand === "herinnerd" ? stand.uiterlijk : stand.stand === "open" || stand.stand === "te laat" ? stand.vervalt : ""
  // De IBAN staat niet in de code (src/lib/business.ts), alleen als omgevingsvariabele op de server.
  const iban = process.env.FACTUUR_IBAN?.replace(/\s/g, "").toUpperCase()
  const excl = f.btw.reduce((t, b) => t + b.grondslag, 0)
  const kop = herinnering ? "Herinnering" : f.soort

  return (
    <article className="offerte-druk mx-auto max-w-[860px] px-6 pt-[clamp(32px,6vw,72px)] pb-24 print:max-w-none print:p-0">
      <div className="-mx-6 rounded-b-[24px] bg-[#202020] px-6 pt-8 pb-7 sm:px-10 print:mx-0 print:px-[48px] print:pt-[40px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[36px] w-auto" />
        <p className="m-0 mt-5 text-[11px] font-semibold tracking-[.18em] text-[#ff5b04] uppercase">Vijvers en natuurlijke tuinen · Stein en omgeving</p>
      </div>
      <div className="print:px-[48px]">
        <header className="mt-8 flex flex-wrap items-start justify-between gap-6 border-b border-lijn pb-6">
          <div>
            <p className="lbl m-0 text-gedempt">{kop} · {f.nummer}</p>
            <h1 className="syne m-0 mt-2 text-[clamp(30px,4.4vw,48px)] leading-[1.05] tracking-[-.03em]">{f.titel}</h1>
            <p className="m-0 mt-3 text-[16px] text-gedempt">
              Aan {f.klant}
              {f.adres ? ` · ${f.adres}` : ""}
            </p>
          </div>
          <dl className="m-0 grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-[14px]">
            <dt className="text-gedempt">Factuurnummer</dt>
            <dd className="m-0">{f.nummer}</dd>
            <dt className="text-gedempt">Factuurdatum</dt>
            <dd className="m-0">{datum(f.datum)}</dd>
            {herinnering && stand.stand === "herinnerd" && (
              <>
                <dt className="text-gedempt">Herinnering</dt>
                <dd className="m-0">{datum(stand.herinnerd)}</dd>
              </>
            )}
            {uiterlijk && (
              <>
                <dt className="text-gedempt">Betalen vóór</dt>
                <dd className="m-0 font-semibold">{datum(uiterlijk)}</dd>
              </>
            )}
            {f.offerte && (
              <>
                <dt className="text-gedempt">Offerte</dt>
                <dd className="m-0">{f.offerte.nummer}</dd>
              </>
            )}
          </dl>
        </header>

        {herinnering && (
          <p className="m-0 mt-6 max-w-[72ch] text-[16px] leading-[1.6]">
            Volgens onze administratie staat deze factuur nog open. Misschien is hij aan je aandacht ontsnapt. Wil je het bedrag vóór {datum(uiterlijk)} overmaken? Heb je al betaald, dan kun je deze herinnering vergeten.
          </p>
        )}

        <table className="mt-10 w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-lijn text-left text-[12px] text-gedempt uppercase">
              <th className="py-2 font-semibold">Omschrijving</th>
              <th className="py-2 text-right font-semibold">Btw</th>
              <th className="py-2 text-right font-semibold">Bedrag excl. btw</th>
            </tr>
          </thead>
          <tbody>
            {f.regels.map((r, i) => (
              <tr key={i} className="border-b border-lijn">
                <td className="py-2.5 pr-4">{r.omschrijving}</td>
                <td className="py-2.5 pr-4 text-right text-gedempt tabular-nums">{r.btw / 100} %</td>
                <td className="py-2.5 text-right whitespace-nowrap tabular-nums">{toonEuro(r.bedrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="mt-2 w-full border-collapse text-[15px]">
          <tbody>
            <tr>
              <th scope="row" className="py-1.5 text-left font-semibold">Totaal excl. btw</th>
              <td className="py-1.5 text-right font-semibold tabular-nums">{toonEuro(excl)}</td>
            </tr>
            {f.btw.map((b) => (
              <tr key={b.tarief}>
                <th scope="row" className="py-1.5 text-left font-normal text-gedempt">Btw {b.tarief / 100} % over {toonEuro(b.grondslag)}</th>
                <td className="py-1.5 text-right tabular-nums">{toonEuro(b.btw)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-inkt">
              <th scope="row" className="py-3 text-left text-[18px] font-semibold">Te betalen</th>
              <td className="py-3 text-right text-[22px] font-semibold tabular-nums">{toonEuro(f.totaal)}</td>
            </tr>
          </tbody>
        </table>

        {stand.stand === "betaald" ? (
          <p className="mt-10 inline-block rounded-full border-2 border-[#2e7d4f] px-5 py-2 text-[16px] font-semibold text-[#2e7d4f]">Betaald, dank je wel</p>
        ) : (
          <section aria-labelledby="betalen" className="mt-10 grid gap-6 rounded-[16px] border border-lijn p-6 sm:grid-cols-[minmax(0,1fr)_auto] print:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h2 id="betalen" className="syne m-0 text-[24px]">Betalen</h2>
              <p className="m-0 mt-2 text-[15px] leading-[1.6]">
                Graag {toonEuro(f.totaal)} vóór {datum(uiterlijk)}, onder vermelding van {f.nummer}.
              </p>
              {f.betaallink && (
                <p className="m-0 mt-4">
                  <a href={f.betaallink} className="knop bg-oranje text-antraciet" data-geen-pdf>Betaal met iDEAL of Wero</a>
                </p>
              )}
              {iban && (
                <p className="m-0 mt-4 text-[14px] leading-[1.6]">
                  Of maak over naar <strong className="tabular-nums">{iban.replace(/(.{4})/g, "$1 ").trim()}</strong> t.n.v. {BUSINESS.name}.
                </p>
              )}
            </div>
            {(f.betaallink || iban) && (
              <figure className="m-0 grid justify-items-center gap-2">
                {f.betaallink ? (
                  <Qr tekst={f.betaallink} label={`QR-code: betaal factuur ${f.nummer} online`} />
                ) : (
                  <Qr tekst={epcCode({ naam: BUSINESS.name, iban: iban!, bedrag: f.totaal, omschrijving: `Factuur ${f.nummer}` })} label={`QR-code: betaal factuur ${f.nummer} met je bankapp`} />
                )}
                <figcaption className="text-[12px] text-gedempt">Scan met je {f.betaallink ? "camera" : "bankapp"}</figcaption>
              </figure>
            )}
          </section>
        )}

        <PdfKnoppen naam={`${kop} ${f.nummer} GRØNN Studio`} />

        <footer className="mt-12 grid gap-x-8 gap-y-3 border-t border-lijn pt-5 text-[13px] leading-[1.6] sm:grid-cols-3 print:grid-cols-3">
          <p className="m-0">
            <strong>{BUSINESS.name}</strong>
            <br />
            {BUSINESS.address.street}
            <br />
            {BUSINESS.address.postalCode} {BUSINESS.address.city}
          </p>
          <p className="m-0">
            <span className="font-semibold text-accent-tekst">Telefoon</span> <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
            <br />
            <span className="font-semibold text-accent-tekst">E-mail</span> <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>
          </p>
          <p className="m-0">
            <span className="font-semibold text-accent-tekst">KvK</span> {BUSINESS.kvk}
            <br />
            <span className="font-semibold text-accent-tekst">Btw</span> {BUSINESS.btw}
          </p>
          <p className="m-0 text-gedempt sm:col-span-3 print:col-span-3">Op al onze offertes en werkzaamheden zijn onze algemene voorwaarden van toepassing: gronn.studio/voorwaarden</p>
        </footer>
      </div>
      <div className="mt-8 hidden h-[10px] bg-[#ff5b04] print:block" />
    </article>
  )
}

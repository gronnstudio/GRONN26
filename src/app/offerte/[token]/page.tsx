import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { OfferteKnoppen } from "@/components/crm/offerte-knoppen"
import { BUSINESS } from "@/lib/business"
import { toonEuro } from "@/lib/crm/geld"
import { leesOfferte, verlopen, type OffertePost } from "@/lib/crm/offerte"
import { geefAkkoord } from "./acties"

// De offerte zoals de klant hem via de privélink ziet. Geen inlog: de sleutel
// in het adres is de toegang. Niet in zoekmachines, niet in de sitemap.
export const metadata: Metadata = { title: "Offerte", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

export default async function OffertePagina({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ specificatie?: string }> }) {
  const { token } = await params
  // Dezelfde offerte als bijlage bij de factuur die Nick in DigiBoox maakt (30 okt 2026): zonder akkoordblok en geldigheid.
  const spec = (await searchParams).specificatie === "1"
  const o = await leesOfferte(token)
  if (!o) notFound()
  const oud = o.status === "open" && verlopen(o)

  return (
    <article className="offerte-druk mx-auto max-w-[860px] px-6 pt-[clamp(32px,6vw,72px)] pb-24 print:max-w-none print:p-0">
      {/* De kop van het briefpapier (Brand Guide 2026): antraciet vlak, primair woordmerk, oranje regel. */}
      <div className="-mx-6 rounded-b-[24px] bg-[#202020] px-6 pt-8 pb-7 sm:px-10 print:mx-0 print:px-[48px] print:pt-[40px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[36px] w-auto" />
        <p className="m-0 mt-5 text-[11px] font-semibold tracking-[.18em] text-[#ff5b04] uppercase">Vijvers en natuurlijke tuinen · Stein en omgeving</p>
      </div>
      <div className="print:px-[48px]">
      <header className="mt-8 flex flex-wrap items-start justify-between gap-6 border-b border-lijn pb-6">
        <div>
          <p className="lbl m-0 text-gedempt">{spec ? `Specificatie bij factuur · offerte ${o.nummer}` : `Offerte · ${o.nummer}`}</p>
          <h1 className="syne m-0 mt-2 text-[clamp(30px,4.4vw,48px)] leading-[1.05] tracking-[-.03em]">{o.titel}</h1>
          <p className="m-0 mt-3 text-[16px] text-gedempt">
            Voor {o.klant}
            {o.adres ? ` · ${o.adres}` : ""}
          </p>
        </div>
        <dl className="m-0 grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-[14px]">
          <dt className="text-gedempt">Datum</dt>
          <dd className="m-0">{datum(o.datum)}</dd>
          {spec ? (
            o.akkoord && (
              <>
                <dt className="text-gedempt">Akkoord</dt>
                <dd className="m-0">{datum(o.akkoord.op)} · {o.akkoord.naam}</dd>
              </>
            )
          ) : (
            <>
              <dt className="text-gedempt">Geldig tot</dt>
              <dd className="m-0">{datum(o.geldigTot)}</dd>
            </>
          )}
        </dl>
      </header>

      {o.beschrijving && <p className="mt-6 mb-0 max-w-[64ch] text-[17px] leading-[1.6] whitespace-pre-line">{o.beschrijving}</p>}

      {o.planning && o.planning.length > 0 && (
        <section className="mt-8">
          <h2 className="lbl m-0 text-gedempt">Planning</h2>
          <ol className="m-0 mt-2 grid gap-1 pl-5 text-[15px]">
            {o.planning.map((f, i) => (
              <li key={i}>
                {f.naam} · {f.dagen.toLocaleString("nl-NL")} {f.dagen === 1 ? "werkdag" : "werkdagen"}
              </li>
            ))}
          </ol>
          <p className="m-0 mt-2 text-[13px] text-gedempt">Samen {o.planning.reduce((t, f) => t + f.dagen, 0).toLocaleString("nl-NL")} werkdagen. De startdatum spreken we samen af; het weer kan de planning verschuiven.</p>
        </section>
      )}

      <Posten titel="Wat er gebeurt" posten={o.posten} />
      <table className="mt-2 w-full border-collapse text-[15px]">
        <tbody>
          {o.onvoorzien > 0 && <Rij naam="Onvoorzien" bedrag={o.onvoorzien} />}
          {o.korting > 0 && <Rij naam="Korting" bedrag={-o.korting} />}
          <Rij naam="Totaal excl. btw" bedrag={o.verkoop} sterk />
          {o.btw.map((b) => (
            <Rij key={b.tarief} naam={`Btw ${b.tarief / 100} % over ${toonEuro(b.grondslag)}`} bedrag={b.btw} />
          ))}
          <tr className="border-t-2 border-inkt">
            <th scope="row" className="py-3 text-left text-[18px] font-semibold">Totaal incl. btw</th>
            <td className="py-3 text-right text-[22px] font-semibold tabular-nums">{toonEuro(o.totaal)}</td>
          </tr>
        </tbody>
      </table>

      {o.optioneel.length > 0 && <Posten titel="Optioneel, niet in het totaal" posten={o.optioneel} />}

      <OfferteKnoppen naam={`${spec ? "Specificatie" : "Offerte"} ${o.nummer} GRØNN Studio`} />

      {!spec && (
      <section data-geen-pdf aria-labelledby="akkoord-kop" className="mt-12 rounded-[16px] border border-lijn bg-vlak p-6 print:hidden">
        <h2 id="akkoord-kop" className="syne m-0 text-[24px]">
          {o.status === "akkoord" ? "Akkoord, dank je wel" : o.status === "ingetrokken" ? "Deze offerte is ingetrokken" : oud ? "Deze offerte is verlopen" : "Akkoord?"}
        </h2>
        {o.status === "akkoord" && o.akkoord ? (
          <p className="m-0 mt-2 text-[16px]">
            {o.akkoord.naam} gaf akkoord op {new Date(o.akkoord.op).toLocaleString("nl-NL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })}. Nick neemt contact met je op om te plannen.
          </p>
        ) : o.status === "ingetrokken" || oud ? (
          <p className="m-0 mt-2 text-[16px]">
            Neem contact op voor een nieuwe: <a className="lnk" href={BUSINESS.emailHref}>{BUSINESS.email}</a> of <a className="lnk" href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>.
          </p>
        ) : (
          <form action={geefAkkoord.bind(null, o.token)} className="mt-4 grid gap-4">
            <label className="grid max-w-[420px] gap-2">
              <span className="lbl">Je naam</span>
              <input name="naam" required autoComplete="name" className="block w-full rounded-[12px] border border-gedempt bg-veld px-4 py-3 text-[18px] text-inkt outline-none focus:border-inkt" />
            </label>
            <label className="flex items-start gap-3 text-[15px] leading-[1.5]">
              <input type="checkbox" name="eens" value="ja" required className="mt-1 size-[18px] shrink-0" />
              <span>
                Ik ga akkoord met deze offerte en de <Link href="/voorwaarden" className="lnk">algemene voorwaarden</Link>.
              </span>
            </label>
            <div>
              <BewaarKnop className="knop bg-oranje text-antraciet">Akkoord geven</BewaarKnop>
            </div>
          </form>
        )}
      </section>
      )}

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

function Posten({ titel, posten }: { titel: string; posten: OffertePost[] }) {
  return (
    <section className="mt-10">
      <h2 className="lbl m-0 text-gedempt">{titel}</h2>
      <table className="mt-3 w-full border-collapse text-[15px]">
        <thead className="sr-only">
          <tr><th>Omschrijving</th><th>Hoeveelheid</th><th>Bedrag excl. btw</th></tr>
        </thead>
        <tbody>
          {posten.map((p, i) => (
            <tr key={i} className="border-b border-lijn">
              <td className="py-2.5 pr-4">{p.omschrijving}</td>
              <td className="py-2.5 pr-4 whitespace-nowrap text-gedempt tabular-nums">{p.hoeveelheid}</td>
              <td className="py-2.5 text-right whitespace-nowrap tabular-nums">{toonEuro(p.bedrag)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Rij({ naam, bedrag, sterk }: { naam: string; bedrag: number; sterk?: boolean }) {
  return (
    <tr>
      <th scope="row" className={`py-1.5 text-left ${sterk ? "font-semibold" : "font-normal text-gedempt"}`}>{naam}</th>
      <td className={`py-1.5 text-right tabular-nums ${sterk ? "font-semibold" : ""}`}>{toonEuro(bedrag)}</td>
    </tr>
  )
}

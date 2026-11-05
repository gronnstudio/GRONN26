import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { TekstOpmaak } from "@/components/crm/tekst-opmaak"
import { PdfKnoppen } from "@/components/crm/pdf-knoppen"
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
      <header className="mt-8 border-b border-lijn pb-6">
        <p className="lbl m-0 text-gedempt">{spec ? "Specificatie bij factuur" : "Offerte"}</p>
        <h1 className="syne m-0 mt-2 text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-.02em]">{o.titel}</h1>
        {/* De gegevens in één nette rij vakjes (Nick, 5 nov 2026: "erg rommelig"). */}
        <dl className="m-0 mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-4 print:grid-cols-4">
          <Gegeven t="Voor" w={o.klant} />
          <Gegeven t="Nummer" w={o.nummer} />
          <Gegeven t="Datum" w={datum(o.datum)} />
          {spec ? o.akkoord && <Gegeven t="Akkoord" w={`${datum(o.akkoord.op)} · ${o.akkoord.naam}`} /> : <Gegeven t="Geldig tot" w={datum(o.geldigTot)} />}
          {o.adres && <Gegeven t="Adres" w={o.adres} breed />}
        </dl>
      </header>

      {!spec && o.begin && <p className="m-0 mt-6 max-w-[72ch] whitespace-pre-line text-[16px] leading-[1.6]">{o.begin}</p>}
      {o.beschrijving && <TekstOpmaak tekst={o.beschrijving} zonderPrijzen className="mt-6 max-w-[72ch] text-[16px] leading-[1.6]" />}

      {o.planning && o.planning.length > 0 && (
        <section className="mt-10">
          <h2 className="lbl m-0 text-gedempt">Planning</h2>
          <table className="mt-3 w-full border-collapse text-[15px]">
            <tbody>
              {o.planning.map((f, i) => (
                <tr key={i} className="border-b border-lijn">
                  <td className="w-[36px] py-2.5 text-gedempt tabular-nums">{i + 1}</td>
                  <td className="py-2.5 pr-4">{f.naam}</td>
                  <td className="py-2.5 text-right whitespace-nowrap tabular-nums">{f.dagen.toLocaleString("nl-NL")} {f.dagen === 1 ? "werkdag" : "werkdagen"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="m-0 mt-2 text-[13px] text-gedempt">Samen {o.planning.reduce((t, f) => t + f.dagen, 0).toLocaleString("nl-NL")} werkdagen. De startdatum spreken we samen af; het weer kan de planning verschuiven.</p>
        </section>
      )}

      <Posten titel="Wat er gebeurt" posten={o.posten} />
      <table data-blok className="mt-4 ml-auto w-full max-w-[400px] border-collapse text-[15px]">
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

      {!spec && o.slot && <p className="m-0 mt-10 max-w-[72ch] whitespace-pre-line text-[16px] leading-[1.6]">{o.slot}</p>}

      <PdfKnoppen naam={`${spec ? "Specificatie" : "Offerte"} ${o.nummer} GRØNN Studio`} />

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

function Posten({ titel, posten: alle }: { titel: string; posten: OffertePost[] }) {
  // Arbeid onderaan, na wat er komt (Nick, 5 nov 2026: "niet als mokerslag bovenaan").
  const posten = [...alle.filter((p) => p.omschrijving !== "Arbeid"), ...alle.filter((p) => p.omschrijving === "Arbeid").map((p) => ({ ...p, omschrijving: "Aanleg en arbeid" }))]
  // Hoeveelheid alleen waar die iets zegt, en de kolom alleen als de meeste posten er een hebben.
  const hv = (p: OffertePost) => (/^1\s*st$/.test(p.hoeveelheid.trim()) ? "" : p.hoeveelheid)
  const kolom = posten.filter((p) => hv(p)).length * 2 > posten.length
  return (
    <section className="mt-10">
      <h2 className="lbl m-0 text-gedempt">{titel}</h2>
      <table className="mt-3 w-full table-fixed border-collapse text-[15px]">
        <colgroup>
          <col />
          {kolom && <col className="w-[110px]" />}
          <col className="w-[130px]" />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-inkt text-[12px] text-gedempt">
            <th scope="col" className="pb-2 text-left font-semibold">Omschrijving</th>
            {kolom && <th scope="col" className="pb-2 text-right font-semibold">Hoeveelheid</th>}
            <th scope="col" className="pb-2 text-right font-semibold">Excl. btw</th>
          </tr>
        </thead>
        <tbody>
          {posten.map((p, i) => (
            <tr key={i} className="border-b border-lijn align-top">
              <td className="py-2.5 pr-4">{p.omschrijving}</td>
              {kolom && <td className="py-2.5 pr-4 text-right whitespace-nowrap text-gedempt tabular-nums">{hv(p)}</td>}
              <td className="py-2.5 text-right whitespace-nowrap tabular-nums">{toonEuro(p.bedrag)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Gegeven({ t, w, breed }: { t: string; w: string; breed?: boolean }) {
  return (
    <div className={breed ? "col-span-2" : ""}>
      <dt className="text-[12px] text-gedempt">{t}</dt>
      <dd className="m-0 mt-0.5 font-medium">{w}</dd>
    </div>
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

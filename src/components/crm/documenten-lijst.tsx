import { toonNummer } from "@/lib/crm/nummer"
import Link from "next/link"
import { Kop, Cijfer, Cijfers, Leeg } from "@/components/crm/kop"
import { MailKnop } from "@/components/crm/mail-knop"
import { OfferteWeg } from "@/components/crm/offerte-weg"
import { stukRond } from "@/app/dashboard/klanten/acties"
import { leesKlanten } from "@/lib/beheer/klanten"
import { vandaagNL } from "@/lib/crm/overzicht"
import { STATUSSEN, documentRijen, filterRijen, somEuro, statusKlasse, type DocRij, type Filter } from "@/lib/crm/documenten"
import { mailVoor, mailtoLink } from "@/lib/crm/mail"
import { euro } from "@/lib/format"

// Eén lijst voor offertes of facturen over alle klanten heen, zoals Plancraft die heeft: zoeken,
// filteren op status en jaar, een statuspil per regel, de acties ernaast en het totaal onderaan.
// Filters zijn gewone links en een GET-formulier, zodat een gefilterde lijst een adres heeft.

const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export async function DocumentenLijst({ soort, filter }: { soort: "Offerte" | "Factuur"; filter: Filter }) {
  const nu = vandaagNL()
  const alle = documentRijen(await leesKlanten(), soort, nu)
  const status = (STATUSSEN[soort] as readonly string[]).includes(filter.status ?? "") ? filter.status : undefined
  const jaren = [...new Set(alle.map((r) => r.stuk.datum.slice(0, 4)))].sort().reverse()
  const jaar = filter.jaar && jaren.includes(filter.jaar) ? filter.jaar : undefined
  const zonderStatus = filterRijen(alle, { q: filter.q, jaar })
  const rijen = filterRijen(zonderStatus, { status })
  const basis = soort === "Offerte" ? "/dashboard/offertes" : "/dashboard/facturen"
  const naar = (s?: string) => {
    const p = new URLSearchParams()
    if (filter.q) p.set("q", filter.q)
    if (jaar) p.set("jaar", jaar)
    if (s) p.set("status", s)
    const q = p.toString()
    return q ? `${basis}?${q}` : basis
  }
  const csv = `${basis}/export?${new URLSearchParams({ ...(filter.q ? { q: filter.q } : {}), ...(jaar ? { jaar } : {}), ...(status ? { status } : {}) })}`

  const telling = (s: string) => zonderStatus.filter((r) => r.status === s)
  const titel = soort === "Offerte" ? "Offertes" : "Facturen"

  return (
    <>
      <Kop pad={[{ naam: "Verkoop" }, { naam: titel }]} titel={titel} sub={soort === "Offerte" ? "Alle offertes van alle klanten, incl. btw. Een nieuwe offerte maak je vanuit een calculatie op de klantkaart." : "Alle facturen van alle klanten, incl. btw. Betaaltermijn 14 dagen; een nieuwe factuur maak je op de klantkaart."}>
        <a href={csv} className="crm-knop-rand" download>Exporteer CSV ↓</a>
      </Kop>
      <main className="mx-auto grid max-w-[1440px] gap-6 px-8 py-6">
        <Cijfers>
          {soort === "Factuur" ? (
            <>
              <Cijfer label="Openstaand" waarde={euro(somEuro(zonderStatus.filter((r) => r.status !== "Betaald")))} uitleg={`${zonderStatus.filter((r) => r.status !== "Betaald").length} facturen, nog niet betaald`} />
              <Cijfer label="Te laat" waarde={euro(somEuro(telling("Te laat")))} let={telling("Te laat").length > 0} uitleg={`${telling("Te laat").length} zonder herinnering`} href={naar("Te laat")} />
              <Cijfer label="Herinnerd" waarde={euro(somEuro(telling("Herinnerd")))} uitleg={`${telling("Herinnerd").length} facturen`} href={naar("Herinnerd")} />
              <Cijfer label="Betaald" waarde={euro(somEuro(telling("Betaald")))} uitleg={`${telling("Betaald").length} facturen`} href={naar("Betaald")} />
            </>
          ) : (
            <>
              <Cijfer label="Open" waarde={euro(somEuro(telling("Open")))} uitleg={`${telling("Open").length} zonder akkoord`} href={naar("Open")} />
              <Cijfer label="Akkoord" waarde={euro(somEuro(telling("Akkoord")))} uitleg={`${telling("Akkoord").length} offertes`} href={naar("Akkoord")} />
              <Cijfer
                label="Scoringskans"
                waarde={zonderStatus.length ? `${Math.round((telling("Akkoord").length / zonderStatus.length) * 100)} %` : "—"}
                uitleg="akkoord van alle offertes"
              />
            </>
          )}
        </Cijfers>

        <div className="flex flex-wrap items-center gap-2">
          <form action={basis} className="flex min-w-0 flex-1 flex-wrap gap-2" role="search">
            <label className="sr-only" htmlFor="zoek-doc">Zoek op nummer of klant</label>
            <input id="zoek-doc" name="q" type="search" defaultValue={filter.q} placeholder="Zoek op nummer of klant" className="crm-veld w-full max-w-[320px]" />
            <label className="sr-only" htmlFor="jaar-doc">Jaar</label>
            <select id="jaar-doc" name="jaar" defaultValue={jaar ?? ""} className="crm-veld">
              <option value="">Alle jaren</option>
              {jaren.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
            {status && <input type="hidden" name="status" value={status} />}
            <button className="crm-knop-rand">Zoeken</button>
          </form>
          <nav aria-label="Status" className="flex flex-wrap gap-1.5">
            <Link href={naar()} aria-current={!status ? "true" : undefined} className="crm-chip">Alle <span className="crm-cijfer">{zonderStatus.length}</span></Link>
            {STATUSSEN[soort].map((s) => (
              <Link key={s} href={naar(s)} aria-current={status === s ? "true" : undefined} className="crm-chip">
                {s} <span className="crm-cijfer">{telling(s).length}</span>
              </Link>
            ))}
          </nav>
        </div>

        {rijen.length ? (
          <div className="crm-lijst">
            <table className="crm-tabel">
              <thead>
                <tr>
                  <th>Nummer</th>
                  <th>Klant</th>
                  <th>Datum</th>
                  {soort === "Factuur" && <th>Vervalt</th>}
                  <th>Status</th>
                  <th className="text-right">Bedrag</th>
                  <th><span className="sr-only">Acties</span></th>
                </tr>
              </thead>
              <tbody>
                {rijen.map((r) => <Regel key={`${r.klant.id}-${r.stuk.id}`} r={r} soort={soort} />)}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={soort === "Factuur" ? 5 : 4}>Totaal · {rijen.length} {soort === "Factuur" ? (rijen.length === 1 ? "factuur" : "facturen") : rijen.length === 1 ? "offerte" : "offertes"}</td>
                  <td className="crm-cijfer text-right">{euro(somEuro(rijen))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <Leeg>{alle.length ? "Niets gevonden met deze filters." : soort === "Offerte" ? "Nog geen offertes. Maak er een vanuit een calculatie op de klantkaart." : "Nog geen facturen. Maak er een op de klantkaart, onder Offertes en facturen."}</Leeg>
        )}
      </main>
    </>
  )
}

function Regel({ r, soort }: { r: DocRij; soort: "Offerte" | "Factuur" }) {
  const s = r.stuk
  const kaart = `/dashboard/klanten/${r.klant.id}?tab=stukken`
  const herinnering = soort === "Factuur" && (r.status === "Te laat" || r.status === "Herinnerd")
  const m = r.pad ? mailVoor(soort === "Offerte" ? "offerte" : herinnering && s.herinnerd ? "herinnering" : "factuur", { naam: r.klant.naam, nummer: s.nummer, pad: r.pad, bedrag: euro(s.bedrag) }) : undefined
  return (
    <tr>
      <td className="font-semibold whitespace-nowrap">{r.pad ? <a href={r.pad} className="crm-link">{toonNummer(s.nummer)}</a> : s.nummer}</td>
      <td><Link href={kaart} className="hover:text-accent-tekst">{r.klant.naam}</Link></td>
      <td className="crm-cijfer whitespace-nowrap text-gedempt">{datum(s.datum)}</td>
      {soort === "Factuur" && <td className={`crm-cijfer whitespace-nowrap ${r.status === "Te laat" ? "font-semibold text-let" : "text-gedempt"}`}>{r.vervalt ? datum(r.vervalt) : "—"}</td>}
      <td><span className={statusKlasse(r.status)}>{r.status}</span></td>
      <td className="crm-cijfer text-right">{euro(s.bedrag)}</td>
      <td>
        <div className="flex flex-wrap justify-end gap-1">
          {m && !s.rond && <MailKnop href={mailtoLink(r.klant.email, m.onderwerp, m.tekst)} klantId={r.klant.id} wat={`${herinnering && s.herinnerd ? "Herinnering" : soort} ${s.nummer}`} />}
          <form action={stukRond.bind(null, r.klant.id, s.id, !s.rond)}>
            <button className={s.rond ? "crm-knop-stil crm-knop-klein" : "crm-knop-rand crm-knop-klein"}>
              {s.rond ? (soort === "Factuur" ? "Toch niet betaald" : "Toch geen akkoord") : soort === "Factuur" ? "Betaald" : "Akkoord"}
              <span className="sr-only"> · {s.nummer}</span>
            </button>
          </form>
          {soort === "Offerte" && !r.vastAanFactuur && <OfferteWeg klantId={r.klant.id} stuk={s} />}
        </div>
      </td>
    </tr>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { Blok, Cijfer, Cijfers, Kop, Leeg } from "@/components/crm/kop"
import { TE_BETALEN } from "@/lib/beheer/data"
import { betaalstand, leesKlanten } from "@/lib/beheer/klanten"
import { DOCUMENTEN } from "@/lib/data/legal"
import { geldOverzicht, jaarOverzicht, vandaagNL, type Openstaand } from "@/lib/crm/overzicht"
import { RECONSTRUCTIE, leesUren, weekTotaal } from "@/lib/beheer/uren"
import { euro } from "@/lib/format"
import { lijstBetalingen } from "@/lib/mollie"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { koppelMollie } from "./acties"
import { leesInkoop } from "@/lib/beheer/inkoop"
import { teBetalen } from "@/lib/crm/inkoop"
import { InkoopTabel } from "@/components/crm/inkoop-tabel"

// Geld en papieren: wat je nog krijgt en wat er aan offertes openstaat (uit de
// klantkaarten), wat je zelf nog moet betalen, en de kleine letters. Facturen
// maken en boeken blijft in DigiBoox; hier zie je wat er openstaat.
export const metadata: Metadata = { title: "Geld en papieren" }
export const dynamic = "force-dynamic"

const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
const dagenGeleden = (d: string, nu: string) => Math.round((Date.parse(`${nu}T12:00Z`) - Date.parse(`${d.slice(0, 10)}T12:00Z`)) / 86_400_000)

export default async function Geld() {
  const [klanten, uren, mollie, inkoop] = await Promise.all([leesKlanten(), leesUren(), lijstBetalingen(), leesInkoop()])
  const open = teBetalen(inkoop)
  const nu = vandaagNL()
  const g = geldOverzicht(klanten, nu)
  const jaar = nu.slice(0, 4)
  const maanden = jaarOverzicht(klanten, [...RECONSTRUCTIE.map((r) => ({ datum: r.maandag, uren: weekTotaal(r) })), ...uren], jaar)
    .filter((m) => m.maand <= nu.slice(0, 7))
    .filter((m, i, l) => l.slice(0, i + 1).some((x) => x.gefactureerd || x.uren)) // lege maanden vóór de start weg
  const gekoppeld = new Map(klanten.flatMap((k) => k.stukken.filter((x) => x.mollie).map((x) => [x.mollie!, k] as const)))
  const doelen = klanten.flatMap((k) => [
    ...k.stukken.filter((x) => x.soort === "Factuur" && !x.rond).map((x) => ({ waarde: `${k.id}|${x.id}`, naam: `${k.naam} · factuur ${x.nummer} (${euro(x.bedrag)})` })),
    { waarde: `${k.id}|`, naam: `${k.naam} · nieuw ontvangen bedrag` },
  ])

  return (
    <>
      <Kop pad={[{ naam: "Bedrijf" }, { naam: "Geld en papieren" }]} titel="Geld en papieren" sub="Openstaand uit de klantkaarten (incl. btw). Vink een factuur af op de klantkaart als hij betaald is; de bank en de btw-aangifte zie je in DigiBoox.">
        <a href="https://account.digiboox.app" target="_blank" rel="noreferrer" className="crm-knop-rand">DigiBoox ↗</a>
      </Kop>
      <main className="mx-auto grid max-w-[1440px] gap-8 px-8 py-6">
        <Cijfers>
          <Cijfer label="Te ontvangen" waarde={euro(g.teOntvangenSom)} let={g.teOntvangenSom > 0} uitleg={`${g.teOntvangen.length} facturen`} />
          <Cijfer label="Te laat" waarde={euro(g.teLaatSom)} let={g.teLaatSom > 0} uitleg={g.teLaat.length ? `${g.teLaat.length} zonder herinnering, na 14 dagen` : "niets over de 14 dagen"} />
          <Cijfer label="Offertes open" waarde={euro(g.offertesOpenSom)} uitleg={`${g.offertesOpen.length} zonder akkoord`} />
          <Cijfer label="Gefactureerd deze maand" waarde={euro(g.dezeMaand)} />
          <Cijfer label="Daarvan afgevinkt" waarde={euro(g.betaaldDezeMaand)} />
        </Cijfers>

        <div className="grid gap-8 2xl:grid-cols-2">
          <Blok titel="Te ontvangen">
            <Lijst rijen={g.teOntvangen} nu={nu} leeg="Alle facturen zijn afgevinkt." oud />
          </Blok>
          <div id="offertes">
            <Blok titel="Offertes zonder akkoord">
              <Lijst rijen={g.offertesOpen} nu={nu} leeg="Geen offertes die nog op akkoord wachten." />
            </Blok>
          </div>
        </div>

        <Blok titel={`Jaaroverzicht ${jaar}`} rechts={<span className="text-gedempt">per uur = gefactureerd excl. 21 % btw ÷ uren</span>}>
          {maanden.length ? <Jaar maanden={maanden} /> : <Leeg>Nog geen facturen of uren dit jaar.</Leeg>}
        </Blok>

        <Blok titel="Betalingen via Mollie" rechts={<a href="https://my.mollie.com/dashboard" target="_blank" rel="noreferrer" className="text-accent-tekst">Mollie ↗</a>}>
          {!mollie ? (
            <Leeg>Mollie is niet bereikbaar (geen sleutel of geen verbinding).</Leeg>
          ) : !mollie.length ? (
            <Leeg>Nog geen betalingen in Mollie.</Leeg>
          ) : (
            <table className="crm-tabel">
              <thead>
                <tr><th>Datum</th><th>Omschrijving</th><th>Status</th><th className="text-right">Bedrag</th><th>Klant</th></tr>
              </thead>
              <tbody>
                {mollie.map((b) => {
                  const k = gekoppeld.get(b.id)
                  return (
                    <tr key={b.id}>
                      <td className="crm-cijfer text-[13px] text-gedempt">{datum(b.betaald ?? b.datum)}</td>
                      <td>{b.omschrijving}{b.naam && <span className="ml-2 text-[13px] text-gedempt">{b.naam}</span>}</td>
                      <td className={`text-[13px] ${b.status === "paid" ? "" : "text-gedempt"}`}>{STATUS[b.status] ?? b.status}</td>
                      <td className="crm-cijfer text-right">{euro(b.bedrag)}</td>
                      <td>
                        {k ? (
                          <Link href={`/dashboard/klanten/${k.id}?tab=stukken`} className="crm-link">{k.naam}</Link>
                        ) : b.status === "paid" ? (
                          <form action={koppelMollie.bind(null, b.id)} className="flex gap-1">
                            <select name="doel" required defaultValue="" aria-label="Koppel aan" className="crm-veld crm-knop-klein max-w-[260px]">
                              <option value="" disabled>Koppel aan…</option>
                              {doelen.map((d) => <option key={d.waarde} value={d.waarde}>{d.naam}</option>)}
                            </select>
                            <BewaarKnop className="crm-knop-rand crm-knop-klein">Koppel</BewaarKnop>
                          </form>
                        ) : (
                          <span className="text-gedempt">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Blok>

        <Blok titel="Zelf te betalen" rechts={<Link href="/dashboard/inkoop" className="text-accent-tekst">Inkoop toevoegen →</Link>}>
          {open.length ? <InkoopTabel lijst={open} naam={new Map(klanten.map((k) => [k.id, k.naam]))} nu={vandaagNL()} /> : <p className="m-0 text-[13px] text-gedempt">Geen open inkoopfacturen. Zet ze onder Inkoop, met de PDF erbij.</p>}
          <details className="mt-3">
            <summary className="cursor-pointer text-[13px] text-gedempt">Oude lijst uit de mail (stand 7 okt 2026)</summary>
          <table className="crm-tabel">
            <thead>
              <tr><th>Van</th><th>Waarvoor</th><th>Stand</th><th>Vervaldag</th><th className="text-right">Bedrag</th></tr>
            </thead>
            <tbody>
              {TE_BETALEN.map((f) => (
                <tr key={f.nummer}>
                  <td className="font-semibold">{f.nummer}</td>
                  <td>{f.aan}</td>
                  <td className="text-[13px] text-let">{f.stand}</td>
                  <td className="crm-cijfer text-[13px] text-gedempt">{datum(f.vervalt)}</td>
                  <td className="crm-cijfer text-right">{f.bedrag ? euro(f.bedrag) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </details>
        </Blok>

        <Blok titel="Kleine letters" rechts={<a href="/documenten/GRONN-bijlagen-particulier.zip" download className="text-accent-tekst">Bijlagen voor een particuliere offerte (zip) ↓</a>}>
          <table className="crm-tabel">
            <thead>
              <tr><th>Document</th><th>Stand</th><th /></tr>
            </thead>
            <tbody>
              {[
                ...DOCUMENTEN.map(({ doc, pagina, pdf }) => ({ titel: doc.title, sub: `${doc.status === "vastgesteld" ? "Vastgesteld" : "Concept"} · ${datum(doc.updated)}`, pagina, pdf })),
                { titel: "Fototoestemming", sub: "Leeg formulier", pagina: "", pdf: "GRONN-fototoestemming.pdf" },
              ].map((d) => (
                <tr key={d.titel}>
                  <td className="font-semibold">{d.titel}</td>
                  <td className="text-gedempt">{d.sub}</td>
                  <td className="text-right whitespace-nowrap">
                    {d.pagina && <Link href={d.pagina} className="crm-knop-stil crm-knop-klein">Bekijk</Link>}
                    <a href={`/documenten/${d.pdf}`} download className="crm-knop-rand crm-knop-klein ml-1">PDF ↓</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Blok>
      </main>
    </>
  )
}

const maandNaam = (m: string) => new Date(`${m}-15T12:00Z`).toLocaleDateString("nl-NL", { month: "long" })
const uur = (n: number) => n.toLocaleString("nl-NL", { maximumFractionDigits: 1 })

// Omzet, betaald en uren per maand van dit jaar, met onderaan het totaal. Een marge staat er
// niet bij, want een factuur weet niet wat de inkoop was (zie jaarOverzicht).
function Jaar({ maanden }: { maanden: ReturnType<typeof jaarOverzicht> }) {
  const som = maanden.reduce((t, m) => ({ gefactureerd: t.gefactureerd + m.gefactureerd, ontvangen: t.ontvangen + m.ontvangen, uren: t.uren + m.uren }), { gefactureerd: 0, ontvangen: 0, uren: 0 })
  const perUur = som.uren > 0 && som.gefactureerd > 0 ? Math.round(som.gefactureerd / 1.21 / som.uren) : undefined
  return (
    <table className="crm-tabel">
      <thead>
        <tr><th>Maand</th><th className="text-right">Gefactureerd</th><th className="text-right">Afgevinkt</th><th className="text-right">Uren</th><th className="text-right">Per uur</th></tr>
      </thead>
      <tbody>
        {maanden.map((m) => (
          <tr key={m.maand}>
            <td className="capitalize">{maandNaam(m.maand)}</td>
            <td className="crm-cijfer text-right">{m.gefactureerd ? euro(m.gefactureerd) : "—"}</td>
            <td className={`crm-cijfer text-right ${m.ontvangen < m.gefactureerd ? "text-let" : ""}`}>{m.gefactureerd ? euro(m.ontvangen) : "—"}</td>
            <td className="crm-cijfer text-right">{m.uren ? uur(m.uren) : "—"}</td>
            <td className="crm-cijfer text-right">{m.perUur ? euro(m.perUur) : "—"}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="font-semibold">
          <td>Totaal</td>
          <td className="crm-cijfer text-right">{euro(Math.round(som.gefactureerd * 100) / 100)}</td>
          <td className="crm-cijfer text-right">{euro(Math.round(som.ontvangen * 100) / 100)}</td>
          <td className="crm-cijfer text-right">{uur(som.uren)}</td>
          <td className="crm-cijfer text-right">{perUur ? euro(perUur) : "—"}</td>
        </tr>
      </tfoot>
    </table>
  )
}

const STATUS: Record<string, string> = { paid: "Betaald", open: "Open", pending: "Bezig", authorized: "Goedgekeurd", canceled: "Geannuleerd", expired: "Verlopen", failed: "Mislukt" }

/** Betaalstand volgens de voorwaarden: 14 dagen termijn, daarna een kosteloze herinnering met weer 14 dagen. */
function Stand({ s, nu }: { s: Openstaand; nu: string }) {
  const b = betaalstand({ ...s, rond: false }, nu)
  if (b.stand === "te laat") return <span className="block font-semibold text-let">{b.dagen} {b.dagen === 1 ? "dag" : "dagen"} te laat</span>
  if (b.stand === "herinnerd") return <span className={`block ${b.voorbij ? "font-semibold text-let" : ""}`}>herinnerd, uiterlijk {datum(b.uiterlijk)}</span>
  if (b.stand === "open") return <span className="block">vervalt {datum(b.vervalt)}</span>
  return null
}

function Lijst({ rijen, nu, leeg, oud }: { rijen: Openstaand[]; nu: string; leeg: string; oud?: boolean }) {
  if (!rijen.length) return <Leeg>{leeg}</Leeg>
  return (
    <table className="crm-tabel">
      <thead>
        <tr><th>Nummer</th><th>Klant</th><th>Datum</th><th className="text-right">Bedrag</th></tr>
      </thead>
      <tbody>
        {rijen.map((s) => {
          const dagen = dagenGeleden(s.datum, nu)
          return (
            <tr key={`${s.klant.id}-${s.nummer}`}>
              <td className="crm-cijfer text-[13px]">{s.nummer}</td>
              <td><Link href={`/dashboard/klanten/${s.klant.id}?tab=stukken`} className="crm-link">{s.klant.naam}</Link></td>
              <td className="crm-cijfer text-[13px] text-gedempt">
                {datum(s.datum)}
                {oud ? <Stand s={s} nu={nu} /> : dagen > 14 && <span className="block">{dagen} dagen</span>}
              </td>
              <td className="crm-cijfer text-right">{euro(s.bedrag)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

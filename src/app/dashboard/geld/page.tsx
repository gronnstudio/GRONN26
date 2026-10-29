import type { Metadata } from "next"
import Link from "next/link"
import { Blok, Cijfer, Cijfers, Kop, Leeg } from "@/components/crm/kop"
import { TE_BETALEN } from "@/lib/beheer/data"
import { leesKlanten } from "@/lib/beheer/klanten"
import { DOCUMENTEN } from "@/lib/data/legal"
import { geldOverzicht, vandaagNL, type Openstaand } from "@/lib/crm/overzicht"
import { euro } from "@/lib/format"

// Geld en papieren: wat je nog krijgt en wat er aan offertes openstaat (uit de
// klantkaarten), wat je zelf nog moet betalen, en de kleine letters. Facturen
// maken en boeken blijft in DigiBoox; hier zie je wat er openstaat.
export const metadata: Metadata = { title: "Geld en papieren" }
export const dynamic = "force-dynamic"

const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
const dagenGeleden = (d: string, nu: string) => Math.round((Date.parse(`${nu}T12:00Z`) - Date.parse(`${d.slice(0, 10)}T12:00Z`)) / 86_400_000)

export default async function Geld() {
  const klanten = await leesKlanten()
  const nu = vandaagNL()
  const g = geldOverzicht(klanten, nu)

  return (
    <>
      <Kop pad={[{ naam: "Bedrijf" }, { naam: "Geld en papieren" }]} titel="Geld en papieren" sub="Openstaand uit de klantkaarten (incl. btw). Vink een factuur af op de klantkaart als hij betaald is; de bank en de btw-aangifte zie je in DigiBoox.">
        <a href="https://account.digiboox.app" target="_blank" rel="noreferrer" className="crm-knop-rand">DigiBoox ↗</a>
      </Kop>
      <main className="mx-auto grid max-w-[1440px] gap-8 px-8 py-6">
        <Cijfers>
          <Cijfer label="Te ontvangen" waarde={euro(g.teOntvangenSom)} let={g.teOntvangenSom > 0} uitleg={`${g.teOntvangen.length} facturen`} />
          <Cijfer label="Offertes open" waarde={euro(g.offertesOpenSom)} uitleg={`${g.offertesOpen.length} zonder akkoord`} />
          <Cijfer label="Gefactureerd deze maand" waarde={euro(g.dezeMaand)} />
          <Cijfer label="Daarvan afgevinkt" waarde={euro(g.betaaldDezeMaand)} />
        </Cijfers>

        <div className="grid grid-cols-2 gap-8">
          <Blok titel="Te ontvangen">
            <Lijst rijen={g.teOntvangen} nu={nu} leeg="Alle facturen zijn afgevinkt." oud />
          </Blok>
          <div id="offertes">
            <Blok titel="Offertes zonder akkoord">
              <Lijst rijen={g.offertesOpen} nu={nu} leeg="Geen offertes die nog op akkoord wachten." />
            </Blok>
          </div>
        </div>

        <Blok titel="Zelf te betalen" rechts={<span className="text-gedempt">stand 7 okt 2026, uit de mail · src/lib/beheer/data.ts</span>}>
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
                {oud && dagen > 14 && <span className="ml-2 text-let">{dagen} dagen</span>}
              </td>
              <td className="crm-cijfer text-right">{euro(s.bedrag)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

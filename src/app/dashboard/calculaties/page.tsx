import type { Metadata } from "next"
import Link from "next/link"
import { Kop, Leeg } from "@/components/crm/kop"
import { leesKlanten } from "@/lib/beheer/klanten"
import { reken } from "@/lib/crm/calculatie"
import { toonEuro } from "@/lib/crm/geld"

// Alle calculaties van alle klanten op één plek, nieuwste eerst, met wat er
// overblijft. Een calculatie zelf staat bij de klant (met versies); een losse
// berekening begin je in Prijs berekenen.
export const metadata: Metadata = { title: "Calculaties" }
export const dynamic = "force-dynamic"

const tijd = (d: string) => new Date(d).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })

export default async function Calculaties() {
  const klanten = await leesKlanten()
  const rijen = klanten
    .flatMap((k) => k.calculaties.map((c) => ({ k, c, v: c.versies.at(-1) })))
    .sort((a, b) => (b.v?.datum ?? b.c.aangemaakt).localeCompare(a.v?.datum ?? a.c.aangemaakt))

  return (
    <>
      <Kop pad={[{ naam: "Rekenen" }, { naam: "Calculaties" }]} titel="Calculaties" sub="Elke bewaarde berekening, per klant, met de laatste versie. Openen rekent verder; bewaren maakt een nieuwe versie.">
        <Link href="/dashboard/prijs" className="crm-knop">+ Nieuwe berekening</Link>
      </Kop>
      <main className="px-8 py-6">
        {rijen.length === 0 ? (
          <Leeg>Nog geen bewaarde calculatie. Begin in Prijs berekenen of vanuit de opname van een tuin.</Leeg>
        ) : (
          <table className="crm-tabel">
            <thead>
              <tr>
                <th>Calculatie</th>
                <th>Klant</th>
                <th>Tuin</th>
                <th className="text-right">Versies</th>
                <th>Laatst bewaard</th>
                <th className="text-right">Overhouden</th>
                <th className="text-right">Marge</th>
                <th className="text-right">Totaal incl. btw</th>
              </tr>
            </thead>
            <tbody>
              {rijen.map(({ k, c, v }) => (
                <tr key={c.id}>
                  <td><Link href={`/dashboard/klanten/${k.id}/calculatie/${c.id}`} className="crm-link">{c.titel}</Link></td>
                  <td><Link href={`/dashboard/klanten/${k.id}?tab=calculaties`} className="hover:text-accent-tekst">{k.naam}</Link></td>
                  <td className="text-gedempt">{k.tuinen.find((t) => t.id === c.tuinId)?.naam ?? "—"}</td>
                  <td className="crm-cijfer text-right">{c.versies.length}</td>
                  <td className="crm-cijfer text-[13px] text-gedempt">{v ? tijd(v.datum) : "—"}</td>
                  <td className={`crm-cijfer text-right ${v && v.winst < 0 ? "text-let" : ""}`}>{v ? toonEuro(v.winst) : "—"}</td>
                  <td className="crm-cijfer text-right text-gedempt">{v ? `${(reken(v).marge / 100).toLocaleString("nl-NL", { maximumFractionDigits: 1 })} %` : "—"}</td>
                  <td className="crm-cijfer text-right">{v ? toonEuro(v.totaal) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="m-0 mt-3 text-[12px] text-gedempt">Overhouden: verkoop excl. btw min de inkoop van de regels; je eigen uren zitten erin. Marge: overhouden gedeeld door de verkoop excl. btw (niet de opslag). Rekenregels in src/lib/crm/calculatie.ts.</p>
      </main>
    </>
  )
}

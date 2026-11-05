import Link from "next/link"
import { inkoopBetaald, inkoopWeg } from "@/app/dashboard/inkoop/acties"
import { metBtw, type Inkoop } from "@/lib/crm/inkoop"
import { toonEuro } from "@/lib/crm/geld"

const datum = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export function InkoopTabel({ lijst, naam, nu, zonderKlant }: { lijst: Inkoop[]; naam: Map<string, string>; nu: string; zonderKlant?: boolean }) {
  return (
    <table className="crm-tabel">
      <thead>
        <tr>
          <th>Datum</th>
          <th>Leverancier</th>
          {!zonderKlant && <th>Klant</th>}
          <th className="text-right">Excl. btw</th>
          <th className="text-right">Incl. btw</th>
          <th>Stand</th>
          <th><span className="sr-only">Acties</span></th>
        </tr>
      </thead>
      <tbody>
        {lijst.map((i) => {
          const telaat = !i.betaald && i.vervalt && i.vervalt < nu
          return (
            <tr key={i.id}>
              <td className="crm-cijfer text-[13px] text-gedempt">{datum(i.datum)}</td>
              <td>
                <span className="font-semibold">{i.leverancier}</span>
                {(i.nummer || i.omschrijving) && <span className="block text-[12px] text-gedempt">{[i.nummer, i.omschrijving].filter(Boolean).join(" · ")}</span>}
                {i.bestand && <a href={`/api/crm/inkoop?id=${i.id}`} target="_blank" rel="noreferrer" className="text-[12px] text-accent-tekst">Factuur bekijken ({i.bestand.ext.toUpperCase()}) ↗</a>}
              </td>
              {!zonderKlant && <td>{i.klantId ? <Link href={`/dashboard/klanten/${i.klantId}`} className="crm-link">{naam.get(i.klantId) ?? "Onbekend"}</Link> : <span className="text-gedempt">Algemeen</span>}</td>}
              <td className="crm-cijfer text-right">{toonEuro(i.bedrag)}</td>
              <td className="crm-cijfer text-right text-gedempt">{toonEuro(metBtw(i))}</td>
              <td className="text-[13px]">
                {i.betaald ? <span className="crm-badge crm-badge-goed">Betaald</span> : <span className={telaat ? "crm-badge crm-badge-let" : "crm-badge"}>{i.vervalt ? `${telaat ? "Te laat" : "Voor"} ${datum(i.vervalt)}` : "Open"}</span>}
              </td>
              <td className="whitespace-nowrap text-right">
                <form action={inkoopBetaald.bind(null, i.id, !i.betaald)} className="inline">
                  <button className="crm-knop-stil crm-knop-klein">{i.betaald ? "Niet betaald" : "Betaald"}</button>
                </form>
                <form action={inkoopWeg.bind(null, i.id)} className="inline">
                  <button aria-label={`Inkoop ${i.leverancier} ${i.nummer} weghalen`} className="px-2 opacity-40 hover:opacity-100">×</button>
                </form>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

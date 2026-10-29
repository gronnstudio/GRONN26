import type { Metadata } from "next"
import { Kop, Tabs } from "@/components/crm/kop"
import { GROEPEN, STAND } from "@/lib/beheer/leveranciers"

// Leveranciers per materiaal, één tabblad per groep (eigenaar, 20 okt 2026).
// Inhoud: src/lib/beheer/leveranciers.ts. Dichtbij eerst (afstand vanaf
// Stein), daarna online, met de accounts die je al hebt vooraan.
export const metadata: Metadata = { title: "Leveranciers" }

const extern = { target: "_blank", rel: "noreferrer" } as const

export default async function Leveranciers({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const groep = GROEPEN.find((g) => g.id === tab) ?? GROEPEN[0]
  const lijst = [...groep.leveranciers].sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity) || Number(!a.account) - Number(!b.account))

  return (
    <>
      <Kop
        pad={[{ naam: "Rekenen" }, { naam: "Leveranciers" }]}
        titel="Leveranciers"
        sub={<>Waar je materiaal haalt, per soort, dichtstbij eerst. &ldquo;Vragen&rdquo; betekent dat de site niets zegt over zakelijke prijzen: bel of mail met je KvK-nummer.</>}
      />
      <Tabs label="Soort materiaal" tabs={GROEPEN.map((g) => ({ id: g.id, naam: g.naam, aantal: g.leveranciers.length }))} actief={groep.id} href={(id) => `/dashboard/leveranciers?tab=${id}`} />
      <main className="px-8 py-6">
        <table className="crm-tabel">
          <thead>
            <tr>
              <th>Leverancier</th>
              <th>Waar</th>
              <th>Wat</th>
              <th>Zakelijk</th>
              <th>Stalen of catalogus</th>
            </tr>
          </thead>
          <tbody>
            {lijst.map((l) => (
              <tr key={l.naam}>
                <td className="whitespace-nowrap">
                  <a href={l.href} {...extern} className="crm-link">
                    {l.naam} <span className="text-gedempt">↗</span>
                  </a>
                </td>
                <td className="whitespace-nowrap text-gedempt">{l.km ? <><span className="crm-cijfer">{l.km} km</span> · {l.plaats}</> : (l.plaats ?? "Online of via dealer")}</td>
                <td className="max-w-[420px]">{l.wat}</td>
                <td>
                  {l.account ? (
                    <span className={`crm-badge ${l.account === "actief" ? "" : l.account === "wacht" ? "crm-badge-stil" : "crm-badge-let"}`}>
                      <span aria-hidden>{STAND[l.account].teken}</span> Account: {STAND[l.account].naam.toLowerCase()}
                    </span>
                  ) : (
                    l.zakelijk
                  )}
                </td>
                <td>
                  {l.stalen ? (
                    l.stalen.href ? (
                      <a href={l.stalen.href} {...extern} className="font-semibold text-accent-tekst">{l.stalen.tekst} ↗</a>
                    ) : (
                      l.stalen.tekst
                    )
                  ) : (
                    <span className="text-gedempt">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  )
}

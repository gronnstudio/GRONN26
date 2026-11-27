import type { Metadata } from "next"
import { Kop, Tabs } from "@/components/crm/kop"
import { GROEPEN, STAND, VAST, type Leverancier } from "@/lib/beheer/leveranciers"

// Leveranciers per materiaal, één tabblad per groep (eigenaar, 20 okt 2026).
// Inhoud: src/lib/beheer/leveranciers.ts. Dichtbij eerst (afstand vanaf
// Stein), daarna online, met de accounts die je al hebt vooraan.
export const metadata: Metadata = { title: "Leveranciers" }

const extern = { target: "_blank", rel: "noreferrer" } as const

export default async function Leveranciers({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const groep = GROEPEN.find((g) => g.id === tab)
  const tabs = [{ id: "vast", naam: "Vast", aantal: VAST.length }, ...GROEPEN.map((g) => ({ id: g.id, naam: g.naam, aantal: g.leveranciers.length }))]
  const kop = (
    <>
      <Kop
        pad={[{ naam: "Rekenen" }, { naam: "Leveranciers" }]}
        titel="Leveranciers"
        sub={<>Waar je materiaal haalt. Onder &ldquo;Vast&rdquo; staan je vaste leveranciers met contactpersoon, webshop, prijslijst en afspraken; de andere tabbladen per soort, dichtstbij eerst.</>}
      />
      <Tabs label="Soort materiaal" tabs={tabs} actief={groep?.id ?? "vast"} href={(id) => `/dashboard/leveranciers?tab=${id}`} />
    </>
  )

  if (!groep) {
    return (
      <>
        {kop}
        <main className="px-4 py-6 sm:px-8">
          <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2 2xl:grid-cols-3">
            {VAST.map((l) => (
              <li key={l.naam}>
                <Kaart l={l} />
              </li>
            ))}
          </ul>
        </main>
      </>
    )
  }

  const lijst = [...groep.leveranciers].sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity) || Number(!a.account) - Number(!b.account))

  return (
    <>
      {kop}
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
                  {l.href ? (
                    <a href={l.href} {...extern} className="crm-link">
                      {l.naam} <span className="text-gedempt">↗</span>
                    </a>
                  ) : (
                    l.naam
                  )}
                </td>
                <td className="whitespace-nowrap text-gedempt">{l.km ? <><span className="crm-cijfer">{l.km} km</span> · {l.plaats}</> : (l.plaats ?? "Online of via dealer")}</td>
                <td className="max-w-[420px]">{l.wat}</td>
                <td>
                  {l.account ? (
                    <span className={`crm-badge ${l.account === "actief" ? "crm-badge-goed" : l.account === "wacht" ? "crm-badge-stil" : "crm-badge-let"}`}>
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

/** Eén vaste leverancier: wie je belt, waar je bestelt en wat er is afgesproken. */
function Kaart({ l }: { l: Leverancier }) {
  const knoppen = [...(l.href ? [{ tekst: "Website", href: l.href }] : []), ...(l.links ?? [])]
  return (
    <article className="crm-paneel flex h-full flex-col gap-3 px-5 py-4">
      <header>
        <h2 className="m-0 text-[17px] font-semibold">{l.naam}</h2>
        <p className="m-0 mt-0.5 text-[13px] text-gedempt">{l.plaats ? `${l.plaats} · ` : ""}{l.wat}</p>
      </header>
      {l.contact && (
        <p className="m-0 text-[14px]">
          {l.contact.naam && <span className="block font-semibold">{l.contact.naam}</span>}
          {l.contact.telefoon && (
            <a href={`tel:${l.contact.telefoon.replace(/[^0-9+]/g, "")}`} className="crm-link block">
              {l.contact.telefoon}
            </a>
          )}
          {l.contact.email && (
            <a href={`mailto:${l.contact.email}`} className="crm-link block">
              {l.contact.email}
            </a>
          )}
        </p>
      )}
      {knoppen.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {knoppen.map((k) => (
            <li key={k.href}>
              <a href={k.href} {...extern} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-lijn px-3 text-[13px] font-semibold hover:border-accent">
                {k.tekst} <span aria-hidden className="text-gedempt">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      {l.notities && (
        <ul className="m-0 grid list-disc gap-1 pl-5 text-[13px] text-gedempt">
          {l.notities.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

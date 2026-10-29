import type { Metadata } from "next"
import { CrmKop } from "@/components/beheer/crm-kop"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { BTW_TARIEVEN, EENHEDEN, SOORTEN, type Soort } from "@/lib/crm/calculatie"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"
import { sleutel } from "@/lib/crm/klant"
import { bewaarCatalogusItem, catalogusItemWeg, nieuwCatalogusItem } from "./acties"

// De catalogus (masterprompt CRM, module 07): wat je inkoopt, per eenheid,
// met leverancier en de historie van de prijs. Het rekenblad leest hieruit;
// "★ Onthoud" in het rekenblad schrijft hierin terug.
export const metadata: Metadata = {
  title: { absolute: "Catalogus · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const klein = "min-w-0 rounded-[10px] border border-lijn bg-transparent px-2 py-1.5 text-[13px]"
const datum = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export default async function Catalogus({ searchParams }: { searchParams: Promise<{ soort?: string; q?: string }> }) {
  const { soort, q } = await searchParams
  const alle = await leesCatalogus()
  const zoek = (q ?? "").toLowerCase()
  const items = alle
    .filter((i) => (!soort || i.soort === soort) && (!zoek || `${i.naam} ${i.leverancier} ${i.sku}`.toLowerCase().includes(zoek)))
    .sort((a, b) => a.soort.localeCompare(b.soort) || a.naam.localeCompare(b.naam))

  return (
    <div data-links className="min-h-svh min-w-[1200px] bg-grond text-inkt">
      <CrmKop pad={[{ naam: "Dashboard", href: "/dashboard" }, { naam: "Catalogus" }]} actief="/dashboard/catalogus" />
      <main className="mx-auto max-w-[1440px] px-8 py-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="syne m-0 text-[48px] leading-[1.05]">Catalogus</h1>
            <p className="m-0 mt-2 max-w-[70ch] text-[14px] opacity-70">
              Je inkoopprijzen per eenheid, excl. btw. Pas je een prijs aan, dan blijft de oude in de historie. Een bewaarde calculatie houdt de prijs van toen.
            </p>
          </div>
          <a href="/dashboard/catalogus/export" className="rounded-full border border-lijn px-4 py-2 text-[13px] font-semibold hover:border-oranje">CSV downloaden</a>
        </div>

        <form className="mt-6 flex items-center gap-2" action="/dashboard/catalogus">
          <input name="q" defaultValue={q} placeholder="Zoek op naam, leverancier…" aria-label="Zoeken" className={`${klein} w-[260px] py-2 text-[14px]`} />
          <select name="soort" defaultValue={soort ?? ""} aria-label="Soort" className={`${klein} bg-grond py-2 text-[14px]`}>
            <option value="">Alle soorten</option>
            {Object.entries(SOORTEN).map(([id, s]) => (
              <option key={id} value={id}>{s.naam}</option>
            ))}
          </select>
          <button className="rounded-full border border-lijn px-4 py-2 text-[13px] font-semibold hover:border-oranje">Filter</button>
        </form>

        <datalist id="eenheden">
          {EENHEDEN.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
        <table className="mt-6 w-full border-collapse text-[13px]">
          <thead>
            <tr className={`${lbl} text-left opacity-60`}>
              {["Naam", "Soort", "Eenheid", "Inkoop", "Opslag %", "Afval %", "Btw", "Leverancier", "Bijgewerkt", ""].map((h, i) => (
                <th key={i} className="border-b border-lijn py-2 pr-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const formId = `item-${i.id}`
              return (
                <tr key={`${i.id}-${sleutel(i)}`} className="border-b border-lijn align-top">
                  <td className="py-1.5 pr-2">
                    <form id={formId} action={bewaarCatalogusItem.bind(null, i.id)} />
                    <input form={formId} name="naam" defaultValue={i.naam} aria-label="Naam" className={`${klein} w-full`} />
                    {i.notitie && <span className="mt-1 block text-[12px] opacity-60">{i.notitie}</span>}
                    {i.historie.length > 0 && (
                      <details className="mt-1 text-[12px]">
                        <summary className="cursor-pointer opacity-70">{i.historie.length} eerdere prijs{i.historie.length === 1 ? "" : "zen"}</summary>
                        <ul className="m-0 mt-1 list-none p-0 font-mono">
                          {i.historie.map((h, n) => (
                            <li key={n}>{datum(h.datum)} · {toonEuro(h.inkoop)}{h.leverancier ? ` · ${h.leverancier}` : ""}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">
                    <select form={formId} name="soort" defaultValue={i.soort} aria-label="Soort" className={`${klein} w-[150px] bg-grond`}>
                      {(Object.keys(SOORTEN) as Soort[]).map((s) => (
                        <option key={s} value={s}>{SOORTEN[s].naam}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2"><input form={formId} name="eenheid" list="eenheden" defaultValue={i.eenheid} aria-label="Eenheid" className={`${klein} w-[64px]`} /></td>
                  <td className="py-1.5 pr-2"><input form={formId} name="inkoop" inputMode="decimal" defaultValue={toonDecimaal(i.inkoop, 2, 2)} aria-label="Inkoop" className={`${klein} w-[90px] font-mono`} /></td>
                  <td className="py-1.5 pr-2"><input form={formId} name="opslag" inputMode="decimal" defaultValue={toonDecimaal(i.opslag, 2)} aria-label="Opslag" className={`${klein} w-[60px]`} /></td>
                  <td className="py-1.5 pr-2"><input form={formId} name="afval" inputMode="decimal" defaultValue={toonDecimaal(i.afval, 2)} aria-label="Afval" className={`${klein} w-[56px]`} /></td>
                  <td className="py-1.5 pr-2">
                    <select form={formId} name="btw" defaultValue={i.btw} aria-label="Btw" className={`${klein} bg-grond`}>
                      {BTW_TARIEVEN.map((b) => (
                        <option key={b} value={b}>{b / 100} %</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2"><input form={formId} name="leverancier" defaultValue={i.leverancier} aria-label="Leverancier" className={`${klein} w-[130px]`} /></td>
                  <td className="py-1.5 pr-2 whitespace-nowrap opacity-70">{datum(i.bijgewerkt)}</td>
                  <td className="py-1.5 whitespace-nowrap">
                    <button form={formId} className="rounded-full border border-lijn px-3 py-1 text-[12px] font-semibold hover:border-oranje">Bewaar</button>
                    <form action={catalogusItemWeg.bind(null, i.id)} className="inline">
                      <button aria-label={`${i.naam} weghalen`} className="px-2 opacity-40 hover:opacity-100">×</button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {!items.length && (
              <tr>
                <td colSpan={10} className="py-6 text-center opacity-60">Niets gevonden. Voeg hieronder een item toe, of gebruik ★ in het rekenblad.</td>
              </tr>
            )}
          </tbody>
        </table>

        <form action={nieuwCatalogusItem} className="mt-8 grid grid-cols-[2fr_1.3fr_80px_100px_100px_1fr_auto] items-end gap-2 rounded-[18px] border border-lijn p-5">
          <p className={`${lbl} col-span-7 m-0 opacity-60`}>Nieuw item</p>
          <input name="naam" required placeholder="bijv. Waaltjes antraciet" aria-label="Naam" className={`${klein} py-2 text-[14px]`} />
          <select name="soort" aria-label="Soort" className={`${klein} bg-grond py-2 text-[14px]`}>
            {(Object.keys(SOORTEN) as Soort[]).map((s) => (
              <option key={s} value={s}>{SOORTEN[s].naam}</option>
            ))}
          </select>
          <input name="eenheid" list="eenheden" placeholder="m²" aria-label="Eenheid" className={`${klein} py-2 text-[14px]`} />
          <input name="inkoop" inputMode="decimal" placeholder="€ inkoop" aria-label="Inkoop" className={`${klein} py-2 text-[14px]`} />
          <input name="afval" inputMode="decimal" placeholder="afval %" aria-label="Afval" className={`${klein} py-2 text-[14px]`} />
          <input name="leverancier" placeholder="Leverancier" aria-label="Leverancier" className={`${klein} py-2 text-[14px]`} />
          <button className="rounded-full bg-oranje px-5 py-2 text-[14px] font-semibold text-[#202020]">+ Toevoegen</button>
        </form>
      </main>
    </div>
  )
}

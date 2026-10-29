import type { Metadata } from "next"
import { Kop } from "@/components/crm/kop"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { BTW_TARIEVEN, EENHEDEN, SOORTEN, type Soort } from "@/lib/crm/calculatie"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"
import { sleutel } from "@/lib/crm/klant"
import { zoekItems } from "@/lib/crm/catalogus"
import { CatalogusImport } from "@/components/crm/catalogus-import"
import { bewaarCatalogusItem, catalogusItemWeg, importeerCatalogus, nieuwCatalogusItem } from "./acties"

// De catalogus (masterprompt CRM, module 07): wat je inkoopt, per eenheid,
// met leverancier en de historie van de prijs. Het rekenblad leest hieruit;
// "★ Onthoud" in het rekenblad schrijft hierin terug.
export const metadata: Metadata = { title: "Catalogus" }
export const dynamic = "force-dynamic"

const lbl = "crm-label"
const klein = "crm-veld !px-2 !py-1 !text-[13px]"
// Met de prijslijsten erin zijn het duizenden items; de tabel toont er zoveel tegelijk.
const TONEN = 100
const datum = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })

export default async function Catalogus({ searchParams }: { searchParams: Promise<{ soort?: string; q?: string }> }) {
  const { soort, q } = await searchParams
  const alle = await leesCatalogus()
  const gevonden = zoekItems(alle, q ?? "")
    .filter((i) => !soort || i.soort === soort)
    .sort((a, b) => a.soort.localeCompare(b.soort) || a.naam.localeCompare(b.naam))
  const items = gevonden.slice(0, TONEN)

  return (
    <>
      <Kop pad={[{ naam: "Rekenen" }, { naam: "Catalogus" }]} titel="Catalogus" sub="Je inkoopprijzen per eenheid, excl. btw. Pas je een prijs aan, dan blijft de oude in de historie. Een bewaarde calculatie houdt de prijs van toen.">
        <a href="/dashboard/catalogus/export" className="crm-knop-rand">CSV downloaden</a>
        <a href="#nieuw" className="crm-knop">+ Item</a>
      </Kop>
      <main className="mx-auto max-w-[1440px] px-8 py-6">
        <form className="flex flex-wrap items-center gap-2" action="/dashboard/catalogus">
          <input name="q" defaultValue={q} type="search" placeholder="Zoek op naam, leverancier, artikelnummer, groep…" aria-label="Zoeken" className="crm-veld w-[min(100%,360px)]" />
          <select name="soort" defaultValue={soort ?? ""} aria-label="Soort" className="crm-veld">
            <option value="">Alle soorten</option>
            {Object.entries(SOORTEN).map(([id, s]) => (
              <option key={id} value={id}>{s.naam}</option>
            ))}
          </select>
          <button className="crm-knop-rand">Zoek</button>
          <span className="text-[13px] text-gedempt" role="status">
            {gevonden.length > TONEN
              ? `${TONEN} van ${gevonden.length.toLocaleString("nl-NL")} getoond, zoek verder om te verfijnen`
              : `${gevonden.length.toLocaleString("nl-NL")} van ${alle.length.toLocaleString("nl-NL")} items`}
          </span>
        </form>
        <CatalogusImport actie={importeerCatalogus} />

        <datalist id="eenheden">
          {EENHEDEN.map((e) => (
            <option key={e} value={e} />
          ))}
        </datalist>
        <table className="crm-tabel mt-6">
          <thead>
            <tr>
              {["Naam", "Soort", "Eenheid", "Inkoop", "Opslag %", "Afval %", "Btw", "Leverancier", "Bijgewerkt", ""].map((h, i) => (
                <th key={i} className="">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const formId = `item-${i.id}`
              return (
                <tr key={`${i.id}-${sleutel(i)}`}>
                  <td className="!py-1.5">
                    <form id={formId} action={bewaarCatalogusItem.bind(null, i.id)} />
                    <input form={formId} name="naam" defaultValue={i.naam} aria-label="Naam" className={`${klein} w-full`} />
                    {(i.groep || i.sku) && <span className="mt-1 block text-[12px] text-gedempt">{[i.groep, i.sku && `art. ${i.sku}`].filter(Boolean).join(" · ")}</span>}
                    {i.notitie && <span className="mt-1 block text-[12px] text-gedempt">{i.notitie}</span>}
                    {i.historie.length > 0 && (
                      <details className="mt-1 text-[12px]">
                        <summary className="cursor-pointer text-gedempt">{i.historie.length} eerdere prijs{i.historie.length === 1 ? "" : "zen"}</summary>
                        <ul className="m-0 mt-1 list-none p-0 crm-cijfer">
                          {i.historie.map((h, n) => (
                            <li key={n}>{datum(h.datum)} · {toonEuro(h.inkoop)}{h.leverancier ? ` · ${h.leverancier}` : ""}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td className="!py-1.5">
                    <select form={formId} name="soort" defaultValue={i.soort} aria-label="Soort" className={`${klein} w-[150px] bg-grond`}>
                      {(Object.keys(SOORTEN) as Soort[]).map((s) => (
                        <option key={s} value={s}>{SOORTEN[s].naam}</option>
                      ))}
                    </select>
                  </td>
                  <td className="!py-1.5"><input form={formId} name="eenheid" list="eenheden" defaultValue={i.eenheid} aria-label="Eenheid" className={`${klein} w-[64px]`} /></td>
                  <td className="!py-1.5"><input form={formId} name="inkoop" inputMode="decimal" defaultValue={toonDecimaal(i.inkoop, 2, 2)} aria-label="Inkoop" className={`${klein} w-[90px] crm-cijfer`} /></td>
                  <td className="!py-1.5"><input form={formId} name="opslag" inputMode="decimal" defaultValue={toonDecimaal(i.opslag, 2)} aria-label="Opslag" className={`${klein} w-[60px]`} /></td>
                  <td className="!py-1.5"><input form={formId} name="afval" inputMode="decimal" defaultValue={toonDecimaal(i.afval, 2)} aria-label="Afval" className={`${klein} w-[56px]`} /></td>
                  <td className="!py-1.5">
                    <select form={formId} name="btw" defaultValue={i.btw} aria-label="Btw" className={`${klein}`}>
                      {BTW_TARIEVEN.map((b) => (
                        <option key={b} value={b}>{b / 100} %</option>
                      ))}
                    </select>
                  </td>
                  <td className="!py-1.5"><input form={formId} name="leverancier" defaultValue={i.leverancier} aria-label="Leverancier" className={`${klein} w-[130px]`} /></td>
                  <td className="!py-1.5 whitespace-nowrap text-gedempt">{datum(i.bijgewerkt)}</td>
                  <td className="py-1.5 whitespace-nowrap">
                    <button form={formId} className="crm-knop-rand">Bewaar</button>
                    <form action={catalogusItemWeg.bind(null, i.id)} className="inline">
                      <button aria-label={`${i.naam} weghalen`} className="px-2 opacity-40 hover:opacity-100">×</button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {!items.length && (
              <tr>
                <td colSpan={10} className="py-6 text-center text-gedempt">Niets gevonden. Voeg hieronder een item toe, of gebruik ★ in het rekenblad.</td>
              </tr>
            )}
          </tbody>
        </table>

        <form id="nieuw" action={nieuwCatalogusItem} className="mt-8 grid grid-cols-[2fr_1.3fr_80px_100px_100px_1fr_auto] items-end gap-2 crm-paneel p-5">
          <p className={`${lbl} col-span-7 m-0 text-gedempt`}>Nieuw item</p>
          <input name="naam" required placeholder="bijv. Waaltjes antraciet" aria-label="Naam" className={`crm-veld`} />
          <select name="soort" aria-label="Soort" className="crm-veld">
            {(Object.keys(SOORTEN) as Soort[]).map((s) => (
              <option key={s} value={s}>{SOORTEN[s].naam}</option>
            ))}
          </select>
          <input name="eenheid" list="eenheden" placeholder="m²" aria-label="Eenheid" className={`crm-veld`} />
          <input name="inkoop" inputMode="decimal" placeholder="€ inkoop" aria-label="Inkoop" className={`crm-veld`} />
          <input name="afval" inputMode="decimal" placeholder="afval %" aria-label="Afval" className={`crm-veld`} />
          <input name="leverancier" placeholder="Leverancier" aria-label="Leverancier" className={`crm-veld`} />
          <button className="crm-knop">+ Toevoegen</button>
        </form>
      </main>
    </>
  )
}

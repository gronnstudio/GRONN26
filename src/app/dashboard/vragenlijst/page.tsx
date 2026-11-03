import type { Metadata } from "next"
import { Kop } from "@/components/crm/kop"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { leesVragenlijst } from "@/lib/beheer/vragenlijst"
import { SOORT_NAAM, VRAAG_SOORTEN, alleVragen, type Vraag } from "@/lib/crm/vragenlijst"
import { bewaarCategorie, bewaarDiensten, nieuweCategorie } from "./acties"

// De vragenlijst van de intake aanpassen (ADR 0008). Per categorie één
// formulier, zodat bewaren nooit iets anders overschrijft.
export const metadata: Metadata = { title: "Vragenlijst" }
export const dynamic = "force-dynamic"

const veld = "crm-veld"

function AlleenBij({ naam, diensten, gekozen, label }: { naam: string; diensten: string[]; gekozen?: string[]; label: string }) {
  return (
    <details className="text-[13px]">
      <summary className="cursor-pointer text-gedempt">
        {label}: {gekozen?.length ? gekozen.join(", ") : "altijd"}
      </summary>
      <div className="mt-2 grid gap-1 sm:grid-cols-3">
        {diensten.map((d) => (
          <label key={d} className="flex items-center gap-2">
            <input type="checkbox" name={naam} value={d} defaultChecked={gekozen?.includes(d)} className="size-[16px] accent-[var(--accent)]" />
            {d}
          </label>
        ))}
      </div>
    </details>
  )
}

function VraagVelden({ p, v, diensten }: { p: string; v?: Vraag; diensten: string[] }) {
  return (
    <div className={`grid gap-2 border-t border-lijn py-3 sm:grid-cols-[minmax(0,2fr)_180px_minmax(0,1fr)] ${v?.vervallen ? "opacity-60" : ""}`}>
      <label className="grid gap-1 text-[13px]">
        <span className="sr-only">Vraag</span>
        <input name={`${p}tekst`} defaultValue={v?.tekst} placeholder={v ? undefined : "Nieuwe vraag in deze categorie"} aria-label={v ? `Vraag: ${v.tekst}` : "Nieuwe vraag"} className={`${veld} font-semibold`} />
      </label>
      <select name={`${p}soort`} defaultValue={v?.soort ?? "jnov"} aria-label="Soort antwoord" className={veld}>
        {VRAAG_SOORTEN.map((s) => (
          <option key={s} value={s}>
            {SOORT_NAAM[s]}
          </option>
        ))}
      </select>
      <input name={`${p}hulp`} defaultValue={v?.hulp} placeholder="Hulptekst (mag leeg)" aria-label="Hulptekst" className={veld} />
      <div className="grid gap-2 sm:col-span-3 sm:grid-cols-[minmax(0,2fr)_180px_minmax(0,1fr)]">
        <textarea name={`${p}opties`} defaultValue={v?.opties?.join("\n")} rows={2} placeholder="Keuzes, één per regel (alleen bij keuzelijst)" aria-label="Keuzes" className={`${veld} text-[13px]`} />
        <input name={`${p}eenheid`} defaultValue={v?.eenheid} placeholder="Eenheid (bij getal)" aria-label="Eenheid" className={veld} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" name={`${p}snel`} value="1" defaultChecked={v?.snel} className="size-[16px] accent-[var(--accent)]" />
            Snelle intake
          </label>
          {v && (
            <label className="flex items-center gap-2">
              <input type="checkbox" name={`${p}vervallen`} value="1" defaultChecked={v.vervallen} className="size-[16px] accent-[var(--accent)]" />
              Vervallen
            </label>
          )}
        </div>
      </div>
      <div className="sm:col-span-3">
        <AlleenBij naam={`${p}toonBij`} diensten={diensten} gekozen={v?.toonBij} label="Alleen bij" />
      </div>
    </div>
  )
}

export default async function VragenlijstPagina() {
  const lijst = await leesVragenlijst()
  const aantal = alleVragen(lijst).filter((v) => !v.vervallen).length

  return (
    <>
      <Kop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: "Vragenlijst" }]} titel="Vragenlijst van de intake" sub={`${aantal} vragen in ${lijst.categorieen.length} categorieën · versie ${lijst.versie}. Een vervallen vraag verdwijnt uit nieuwe intakes; oude antwoorden blijven staan.`} />
      <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-6 sm:px-8">
        <section className="crm-paneel p-5">
          <form key={lijst.versie} action={bewaarDiensten} className="grid gap-3">
            <label htmlFor="diensten" className="text-[15px] font-semibold">
              Werkzaamheden
            </label>
            <p className="m-0 -mt-2 text-[13px] text-gedempt">Eén per regel. Een categorie of vraag met &quot;Alleen bij&quot; verschijnt pas als een van deze gekozen is. Hernoem je er een, pas dan ook &quot;Alleen bij&quot; aan.</p>
            <textarea id="diensten" name="diensten" defaultValue={lijst.diensten.join("\n")} rows={6} className={`${veld} max-w-[420px]`} />
            <BewaarKnop className="crm-knop self-start">Werkzaamheden bewaren</BewaarKnop>
          </form>
        </section>

        {lijst.categorieen.map((c) => (
          <details key={c.id} className="crm-paneel p-5">
            <summary className="cursor-pointer">
              <span className="syne text-[20px]">{c.naam}</span>
              <span className="ml-3 text-[13px] text-gedempt">
                {c.vragen.filter((v) => !v.vervallen).length} vragen{c.toonBij?.length ? ` · alleen bij ${c.toonBij.join(", ")}` : ""}
              </span>
            </summary>
            <form key={lijst.versie} action={bewaarCategorie.bind(null, c.id)} className="mt-4 grid gap-1">
              <div className="grid gap-3 pb-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <label className="grid gap-1 text-[13px]">
                  Naam van de categorie
                  <input name="naam" defaultValue={c.naam} className={`${veld} font-semibold`} />
                </label>
                <div className="self-end">
                  <AlleenBij naam="toonBij" diensten={lijst.diensten} gekozen={c.toonBij} label="Categorie alleen bij" />
                </div>
              </div>
              {c.vragen.map((v) => (
                <VraagVelden key={v.id} p={`v-${v.id}-`} v={v} diensten={lijst.diensten} />
              ))}
              <VraagVelden p="nieuw-" diensten={lijst.diensten} />
              <BewaarKnop className="crm-knop mt-2 self-start">{c.naam} bewaren</BewaarKnop>
            </form>
          </details>
        ))}

        <form action={nieuweCategorie} className="crm-paneel flex flex-wrap items-end gap-3 p-5">
          <label className="grid flex-1 gap-1 text-[13px]">
            Nieuwe categorie
            <input name="naam" placeholder="bijv. Zwemvijver of Groendak" className={veld} />
          </label>
          <BewaarKnop className="crm-knop-rand">Toevoegen</BewaarKnop>
        </form>
      </main>
    </>
  )
}

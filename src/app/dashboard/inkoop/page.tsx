import type { Metadata } from "next"
import { Blok, Cijfer, Cijfers, Kop, Leeg, Tabs } from "@/components/crm/kop"
import { InkoopFormulier } from "@/components/crm/inkoop-formulier"
import { leesInkoop } from "@/lib/beheer/inkoop"
import { leesKlanten } from "@/lib/beheer/klanten"
import { GROEPEN } from "@/lib/beheer/leveranciers"
import { metBtw, teBetalen } from "@/lib/crm/inkoop"
import { toonEuro } from "@/lib/crm/geld"
import { vandaagNL } from "@/lib/crm/overzicht"
import { InkoopTabel as Tabel } from "@/components/crm/inkoop-tabel"

// Inkoop (idee uit Plancraft, "Inkomende facturen", 5 nov 2026): facturen van
// leveranciers met de PDF erbij, per klant, zodat de klantkaart laat zien wat
// het materiaal kostte en Geld wat je zelf nog moet betalen.
export const metadata: Metadata = { title: "Inkoop" }
export const dynamic = "force-dynamic"

export default async function InkoopPagina({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "open" } = await searchParams
  const [lijst, klanten] = await Promise.all([leesInkoop(), leesKlanten()])
  const nu = vandaagNL()
  const open = teBetalen(lijst)
  const maand = nu.slice(0, 7)
  const dezeMaand = lijst.filter((i) => i.datum.startsWith(maand))
  const naam = new Map(klanten.map((k) => [k.id, k.naam]))
  const zichtbaar = tab === "alle" ? lijst : tab === "algemeen" ? lijst.filter((i) => !i.klantId) : open
  const leveranciers = [...new Set([...lijst.map((i) => i.leverancier), ...GROEPEN.flatMap((g) => g.leveranciers.map((l) => l.naam))])].sort((a, b) => a.localeCompare(b, "nl"))

  return (
    <>
      <Kop pad={[{ naam: "Bedrijf" }, { naam: "Inkoop" }]} titel="Inkoop" sub="Facturen van leveranciers, met de PDF erbij. Koppel ze aan een klant; de klantkaart rekent dan wat er overbleef. Boeken blijft in DigiBoox." />
      <main className="mx-auto grid max-w-[1440px] gap-8 px-8 py-6">
        <Cijfers>
          <Cijfer label="Nog te betalen" waarde={toonEuro(open.reduce((s, i) => s + metBtw(i), 0))} let={open.some((i) => i.vervalt && i.vervalt < nu)} uitleg={`${open.length} facturen, incl. btw`} />
          <Cijfer label="Inkoop deze maand" waarde={toonEuro(dezeMaand.reduce((s, i) => s + i.bedrag, 0))} uitleg="excl. btw" />
          <Cijfer label="Voor klanten" waarde={toonEuro(dezeMaand.filter((i) => i.klantId).reduce((s, i) => s + i.bedrag, 0))} uitleg="deze maand, excl. btw" />
          <Cijfer label="Te verrekenen btw" waarde={toonEuro(dezeMaand.reduce((s, i) => s + metBtw(i) - i.bedrag, 0))} uitleg="deze maand, voorbelasting" />
        </Cijfers>
        <div className="grid gap-8 @min-[1100px]:grid-cols-[minmax(0,1fr)_400px]">
          <section className="min-w-0">
            <Tabs label="Welke inkoop" tabs={[{ id: "open", naam: "Te betalen", aantal: open.length }, { id: "alle", naam: "Alles", aantal: lijst.length }, { id: "algemeen", naam: "Zonder klant", aantal: lijst.filter((i) => !i.klantId).length }]} actief={tab} href={(id) => `/dashboard/inkoop?tab=${id}`} />
            <div className="mt-4">
              {zichtbaar.length ? <Tabel lijst={zichtbaar} naam={naam} nu={nu} /> : <Leeg>{tab === "open" ? "Alles is betaald." : "Nog geen inkoopfacturen."}</Leeg>}
            </div>
          </section>
          <Blok titel="Inkoop toevoegen">
            <div className="crm-paneel p-5">
              <InkoopFormulier klanten={klanten.map((k) => ({ id: k.id, naam: k.naam }))} leveranciers={leveranciers} vandaag={nu} />
            </div>
          </Blok>
        </div>
      </main>
    </>
  )
}

import type { Metadata } from "next"
import { PrijsRekenaar } from "@/components/beheer/prijs"
import { Kop } from "@/components/crm/kop"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { isOpen, leesKlanten } from "@/lib/beheer/klanten"

// Rekenblad voor een vaste prijs waar genoeg aan overblijft (eigenaar, 29 okt
// 2026: "werkblad om in te vullen op de website om prijs te berekenen zodat ik
// genoeg over houdt"). Kies een klant om het als versie bij die klant te bewaren.
export const metadata: Metadata = { title: "Prijs berekenen" }
export const dynamic = "force-dynamic"

export default async function Prijs() {
  const [klanten, catalogus] = await Promise.all([leesKlanten(), leesCatalogus()])
  const keuze = klanten.filter((k) => isOpen(k.fase)).map((k) => ({ id: k.id, naam: k.naam, tuinen: k.tuinen.map((t) => ({ id: t.id, naam: t.naam })) }))
  return (
    <>
      <Kop
        pad={[{ naam: "Rekenen" }, { naam: "Prijs berekenen" }]}
        titel="Prijs berekenen"
        sub="Vul je uren en je inkoop in. De opslag per soort rekent vanzelf mee, en je ziet meteen of er genoeg overblijft. Kies een klant om de berekening als versie bij die klant te bewaren."
      />
      <main className="mx-auto max-w-[1440px] px-8 py-6 print:max-w-none print:p-0">
        <PrijsRekenaar klanten={keuze} catalogus={catalogus} />
      </main>
    </>
  )
}

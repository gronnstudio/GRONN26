import type { Metadata } from "next"
import { CrmKop } from "@/components/beheer/crm-kop"
import { PrijsRekenaar } from "@/components/beheer/prijs"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { isOpen, leesKlanten } from "@/lib/beheer/klanten"

// Rekenblad voor een vaste prijs waar genoeg aan overblijft (eigenaar, 29 okt
// 2026: "werkblad om in te vullen op de website om prijs te berekenen zodat ik
// genoeg over houdt"). Alleen voor de eigenaar, net als de rest van /dashboard.
export const metadata: Metadata = {
  title: { absolute: "Prijs berekenen · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function Prijs() {
  const [klanten, catalogus] = await Promise.all([leesKlanten(), leesCatalogus()])
  const keuze = klanten.filter((k) => isOpen(k.fase)).map((k) => ({ id: k.id, naam: k.naam, tuinen: k.tuinen.map((t) => ({ id: t.id, naam: t.naam })) }))
  return (
    <div data-links className="min-h-svh bg-grond text-inkt print:min-h-0 print:bg-white">
      <CrmKop pad={[{ naam: "Dashboard", href: "/dashboard" }, { naam: "Prijs berekenen" }]} actief="/dashboard/prijs" />
      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 print:max-w-none print:p-0">
        <h1 className="syne m-0 text-[clamp(36px,4vw,48px)] leading-[1.05] print:hidden">Prijs berekenen</h1>
        <p className="m-0 mt-3 print:hidden max-w-[60ch] text-[14px] leading-[1.55] opacity-75">
          Vul je uren en je inkoop in. De opslag per soort rekent vanzelf mee, en je ziet meteen of er genoeg overblijft. Kies een klant om de berekening als versie bij die klant te bewaren.
        </p>
        <div className="mt-8 print:mt-0">
          <PrijsRekenaar klanten={keuze} catalogus={catalogus} />
        </div>
      </main>
    </div>
  )
}

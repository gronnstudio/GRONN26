import type { Metadata } from "next"
import { Geist_Mono, Montserrat, Syne } from "next/font/google"
import { Schil } from "@/components/crm/schil"
import type { Treffer } from "@/components/crm/zoekvenster"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { isEigen } from "@/lib/crm/catalogus"
import { isOpen, leesKlanten } from "@/lib/beheer/klanten"
import { GROEPEN as LEVERANCIERS } from "@/lib/beheer/leveranciers"
import { leesStand } from "@/lib/beheer/stand"

// Het bedrijfssysteem achter de login (vervangt sinds 29 okt 2026 het oude
// Jarvis-dashboard). src/proxy.ts laat hier alleen de eigenaar in; elke
// actie controleert dat nog een keer (eisEigenaar).
//
// De letters staan hier nog een keer op de schil: Layout Tuinplan (html.plan)
// zet op de site andere letters, het systeem houdt Syne en Montserrat. Geist
// Mono is voor bedragen, maten en tijden (masterprompt CRM).
const syne = Syne({ subsets: ["latin"], weight: ["700"], variable: "--font-syne" })
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-montserrat" })
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: { absolute: "GRØNN Studio · Systeem", template: "%s · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [klanten, catalogus, stand] = await Promise.all([leesKlanten(), leesCatalogus(), leesStand()])
  const nu = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

  // Wat het zoekvenster kan vinden. Bewust zonder telefoon, e-mail of adres.
  const index: Treffer[] = [
    ...klanten.map((k) => ({ groep: "Klanten", titel: k.naam, sub: [k.fase, k.wat, k.plaats, k.bedrijf, ...k.tags].filter(Boolean).join(" · "), href: `/dashboard/klanten/${k.id}` })),
    ...klanten.flatMap((k) => k.tuinen.map((t) => ({ groep: "Tuinen", titel: t.naam, sub: k.naam, href: `/dashboard/klanten/${k.id}/tuin/${t.id}` }))),
    ...klanten.flatMap((k) => k.calculaties.map((c) => ({ groep: "Calculaties", titel: c.titel, sub: k.naam, href: `/dashboard/klanten/${k.id}/calculatie/${c.id}` }))),
    ...klanten.flatMap((k) => k.stukken.map((s) => ({ groep: "Offertes en facturen", titel: s.nummer, sub: `${s.soort} · ${k.naam}`, href: `/dashboard/klanten/${k.id}?tab=stukken` }))),
    // Alleen eigen items: de duizenden regels uit prijslijsten zoek je op de catalogus zelf.
    ...catalogus.filter(isEigen).map((i) => ({ groep: "Catalogus", titel: i.naam, sub: [i.leverancier, i.eenheid].filter(Boolean).join(" · "), href: `/dashboard/catalogus?q=${encodeURIComponent(i.naam)}` })),
    ...LEVERANCIERS.flatMap((g) => g.leveranciers.map((l) => ({ groep: "Leveranciers", titel: l.naam, sub: `${g.naam} · ${l.wat}`, href: `/dashboard/leveranciers?tab=${g.id}` }))),
  ]
  const tellers = {
    aanvragen: stand.aanvragen.filter((a) => !a.klaar).length,
    opvolgen: klanten.filter((k) => k.opvolgen && k.opvolgen <= nu && isOpen(k.fase)).length,
  }

  return (
    <div data-links className={`${syne.variable} ${montserrat.variable} ${mono.variable}`}>
      <Schil index={index} tellers={tellers}>
        {children}
      </Schil>
    </div>
  )
}

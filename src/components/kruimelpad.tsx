"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { T, kies, type Tekst } from "@/components/taal"

// Het kruimelpad (eigenaar, 21 okt 2026: "site mist breadcrumb"). Klein en
// stil boven het label van de opening, op elke pagina behalve de voorpagina.
// De ouder volgt het menu, niet de map: de cadeaubon en de borderpakketten
// horen bij Shop, Techniek bij Studio. Een pad dat hier niet staat (zoals de
// 404) krijgt geen kruimelpad.
const PAGINAS: Record<string, { naam: Tekst; ouder?: string }> = {
  "/vijvers": { naam: { nl: "Vijvers", en: "Ponds" } },
  "/tuinen": { naam: { nl: "Tuinen", en: "Gardens" } },
  "/tuinen/materialen": { naam: { nl: "Materialen", en: "Materials" }, ouder: "/tuinen" },
  "/shop": { naam: "Shop" },
  "/tuinen/borderpakketten": { naam: { nl: "Borderpakketten", en: "Border packages" }, ouder: "/shop" },
  "/tuinen/borderpakketten/bestellen": { naam: { nl: "Bestellen", en: "Order" }, ouder: "/tuinen/borderpakketten" },
  "/tuinen/borderpakketten/bedankt": { naam: { nl: "Bedankt", en: "Thank you" }, ouder: "/tuinen/borderpakketten" },
  "/tuinen/cadeaubon": { naam: { nl: "Cadeaubon", en: "Gift card" }, ouder: "/shop" },
  "/tuinen/cadeaubon/bon": { naam: { nl: "Je bon", en: "Your card" }, ouder: "/tuinen/cadeaubon" },
  "/werk": { naam: { nl: "Werk", en: "Work" } },
  "/werk/vijverrenovatie": { naam: { nl: "Vijverrenovatie", en: "Pond renovation" }, ouder: "/werk" },
  "/werk/terras-geulle": { naam: { nl: "Terras in Geulle", en: "Terrace in Geulle" }, ouder: "/werk" },
  "/over": { naam: "Studio" },
  "/techniek": { naam: { nl: "Techniek", en: "Tech" }, ouder: "/over" },
  "/kennismaken": { naam: { nl: "Kennismaken", en: "Get in touch" } },
  "/faq": { naam: { nl: "Vragen", en: "Questions" } },
  "/privacy": { naam: { nl: "Privacy", en: "Privacy" } },
  "/voorwaarden": { naam: { nl: "Voorwaarden", en: "Terms" } },
  "/herroeping": { naam: { nl: "Herroeping", en: "Withdrawal" } },
  "/colofon": { naam: { nl: "Colofon", en: "Colophon" } },
  "/merk": { naam: { nl: "Merk", en: "Brand" } },
  "/downloads": { naam: "Downloads" },
}

function spoor(pad: string) {
  const stappen: { pad: string; naam: Tekst }[] = []
  for (let p: string | undefined = pad; p && PAGINAS[p]; p = PAGINAS[p].ouder) stappen.unshift({ pad: p, naam: PAGINAS[p].naam })
  return stappen.length ? [{ pad: "/", naam: "Home" as Tekst }, ...stappen] : []
}

export function Kruimelpad() {
  const pad = usePathname().replace(/\/$/, "") || "/"
  const stappen = spoor(pad)
  if (!stappen.length) return null
  // Voor zoekmachines (BreadcrumbList), in het Nederlands zoals de site zelf.
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: stappen.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: kies(s.naam, "nl"),
      item: `https://gronn.studio${s.pad === "/" ? "" : s.pad}`,
    })),
  }
  return (
    <nav className="kruimelpad" aria-label="Kruimelpad">
      <ol>
        {stappen.map((s, i) => (
          <li key={s.pad}>
            {i < stappen.length - 1 ? <Link href={s.pad}><T t={s.naam} /></Link> : <span aria-current="page"><T t={s.naam} /></span>}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </nav>
  )
}

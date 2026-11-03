import Link from "next/link"

import { BREEDTE, Knop, Logo, PijlLink, Voedselbos } from "@/components/gronn/elementen"

// De 404 van V5. Next rendert deze pagina alleen binnen de ROOT-layout
// (het [locale]-segment wordt voor een onbekende URL niet opgelost), dus
// zonder kop en voet van de site en zonder taal uit de URL: Nederlands
// voorop, Engels eronder, en een eigen <main>. Een notFound() binnen een
// route komt hier ook uit.
//
// Eigenaar, 30 sep 2026: "maak een leuke custom 404 pagina!" en daarna
// "maak hier een microspelletje? simulatie, voedselbossen, maak het
// onbeperkt speelbaar en gebruik local storage". Het leuke is het perceel
// ernaast (`Voedselbos`): hier groeit nog niets, dus plant de bezoeker
// zelf een voedselbos. Het ene oranje accent is de knop naar de
// voorpagina; de andere wegen zijn stille links.
const WEGEN = [
  { href: "/nl/services", nl: "Diensten" },
  { href: "/nl/projects", nl: "Projecten" },
  { href: "/nl/studio", nl: "Studio" },
  { href: "/nl/contact", nl: "Contact" },
] as const

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col">
      <div className={`${BREEDTE} pt-[24px] sm:pt-[40px]`}>
        <Link href="/nl" className="inline-flex min-h-[44px] items-center">
          <Logo alt="GRØNN Studio, naar de voorpagina" />
        </Link>
      </div>
      <div
        className={`${BREEDTE} grid flex-1 grid-cols-1 content-center gap-[40px] py-[48px] lg:grid-cols-12 lg:items-center lg:gap-[64px] lg:py-[64px]`}
      >
        <div className="lg:col-span-5">
          <p className="tekst-annotatie text-accent">404 · Niet gevonden</p>
          <h1 className="tekst-h1 mt-[16px] max-w-[14ch]">Hier groeit nog niets.</h1>
          <p className="tekst-body mt-[16px] max-w-[42ch] text-muted">
            Deze pagina bestaat niet (meer). Misschien is hij verplaatst, of zit er een tikfout in het adres.
            Plant intussen een voedselbos: je perceel blijft bewaard.
          </p>
          <p lang="en" className="tekst-body mt-[12px] max-w-[42ch] text-muted">
            Nothing grows here yet: this page does not exist (any more). Plant a food forest while you are here.
          </p>
          <div className="mt-[32px] flex flex-wrap gap-[12px]">
            <Knop href="/nl">Naar de voorpagina</Knop>
            <span lang="en">
              <Knop href="/" soort="rand">
                To the homepage
              </Knop>
            </span>
          </div>
          <nav aria-label="Verder kijken" className="mt-[24px]">
            <ul className="flex flex-wrap gap-x-[24px]">
              {WEGEN.map((w) => (
                <li key={w.href}>
                  <PijlLink href={w.href} stil>
                    {w.nl}
                  </PijlLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <Voedselbos className="lg:col-span-7" />
      </div>
      <p lang="en" className={`${BREEDTE} tekst-annotatie pb-[32px] text-muted`}>
        Rooted in nature.
      </p>
    </main>
  )
}

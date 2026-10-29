import Link from "next/link"

// De bovenbalk van de CRM-schermen: waar je bent (kruimelpad) en de vaste
// onderdelen, op elke pagina in dezelfde volgorde. Eén component, zodat een
// nieuw onderdeel op één plek bij komt.
const ONDERDELEN = [
  { href: "/dashboard", naam: "Overzicht" },
  { href: "/dashboard/klanten", naam: "Klanten" },
  { href: "/dashboard/prijs", naam: "Prijs berekenen" },
  { href: "/dashboard/catalogus", naam: "Catalogus" },
  { href: "/dashboard/uren", naam: "Uren" },
  { href: "/offertes", naam: "Offerte maken" },
] as const

export function CrmKop({ pad, actief }: { pad: { naam: string; href?: string }[]; actief?: (typeof ONDERDELEN)[number]["href"] }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-lijn px-8 py-4 print:hidden">
      <nav aria-label="Kruimelpad" className="text-[10px] font-semibold uppercase tracking-[.18em]">
        <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {pad.map((p, i) => (
            <li key={i} className="flex gap-1.5">
              {i > 0 && <span aria-hidden className="opacity-40">·</span>}
              {p.href ? (
                <Link href={p.href} className="opacity-70 hover:opacity-100">{p.naam}</Link>
              ) : (
                <span aria-current="page" className="text-oranje-tekst">{p.naam}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <nav aria-label="Onderdelen" className="flex flex-wrap gap-5 text-[13px]">
        {ONDERDELEN.map((o) => (
          <Link key={o.href} href={o.href} aria-current={o.href === actief ? "page" : undefined} className={o.href === actief ? "font-semibold" : "opacity-70 hover:opacity-100"}>
            {o.naam}
          </Link>
        ))}
      </nav>
    </header>
  )
}

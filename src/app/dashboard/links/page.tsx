import type { Metadata } from "next"
import Link from "next/link"
import { Blok, Kop } from "@/components/crm/kop"
import { EIGEN_PAGINAS, KOPPELINGEN } from "@/lib/beheer/data"
import { LEVERANCIERS, STAND } from "@/lib/beheer/leveranciers"

// Alles op één plek (eigenaar, 21 okt 2026: "alles waar we links voor hebben
// gemaakt kun je in dashboard makkelijk bereikbaar maken"): de diensten die je
// gebruikt, je eigen pagina's die in geen menu staan, en je zakelijke accounts.
export const metadata: Metadata = { title: "Links" }

const extern = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})

export default function Links() {
  return (
    <>
      <Kop pad={[{ naam: "Bedrijf" }, { naam: "Links" }]} titel="Links" sub="Je diensten, je eigen pagina's buiten het menu, en de leveranciers waar je een account hebt." />
      <main className="mx-auto grid max-w-[1440px] gap-8 px-8 py-6">
        <Blok titel="Diensten">
          <Raster items={KOPPELINGEN.map((k) => ({ naam: k.naam, sub: k.uitleg, href: k.href }))} />
        </Blok>
        <Blok titel="Eigen pagina's · niet in het menu">
          <Raster items={EIGEN_PAGINAS.map((k) => ({ naam: k.naam, sub: k.uitleg, href: k.href }))} />
        </Blok>
        <Blok titel="Zakelijke accounts" rechts={<Link href="/dashboard/leveranciers" className="text-accent-tekst">Alle leveranciers →</Link>}>
          <Raster items={LEVERANCIERS.map((l) => ({ naam: l.naam, sub: `${STAND[l.account].naam} · ${l.wat}`, href: l.href }))} />
        </Blok>
      </main>
    </>
  )
}

function Raster({ items }: { items: { naam: string; sub: string; href: string }[] }) {
  return (
    <ul className="m-0 grid list-none grid-cols-4 gap-3 p-0">
      {items.map((k) => (
        <li key={k.naam}>
          <a href={k.href} {...extern(k.href)} className="crm-paneel flex h-full items-start justify-between gap-3 px-4 py-3 hover:border-accent">
            <span className="min-w-0">
              <span className="block font-semibold">{k.naam}</span>
              <span className="block truncate text-[12px] text-gedempt">{k.sub}</span>
            </span>
            <span aria-hidden className="text-gedempt">{k.href.startsWith("http") ? "↗" : "→"}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

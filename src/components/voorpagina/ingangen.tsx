import Link from "next/link"
import { kortePrijs } from "@/components/diensten/prijs"
import { T } from "@/components/taal"
import { SERVICES } from "@/lib/data/services"
import type { L } from "@/lib/i18n"

// Richting 1 (eigenaar, 16 okt 2026): op de telefoon begint de voorpagina bij
// het probleem van de bezoeker, niet bij de namen van de diensten. Drie
// ingangen, elk met de dienst die het oplost en wat die kost. Vervangt op de
// telefoon "Wat ik doe"; desktop houdt die. De kaart is de <li>, zodat
// de link geen ronde knop is (die zijn 36, 48 of 64 hoog).

const INGANGEN: { vraag: L; slug: string; href: string }[] = [
  { vraag: { nl: "Mijn vijver is groen, lekt of stinkt", en: "My pond is green, leaking or smelly" }, slug: "pond-survey", href: "/vijvers#pond-survey" },
  { vraag: { nl: "Ik wil een natuurlijke tuin", en: "I want a natural garden" }, slug: "garden-design", href: "/tuinen#garden-design" },
  { vraag: { nl: "Mijn vijver moet de winter door", en: "My pond needs to get through winter" }, slug: "pond-autumn-service", href: "/vijvers#pond-autumn-service" },
]

const RIJEN = INGANGEN.map((i) => {
  const dienst = SERVICES.find((s) => s.slug === i.slug)
  if (!dienst) throw new Error(`Onbekende dienst: ${i.slug}`)
  return { ...i, dienst }
})

export function Ingangen() {
  return (
    <section aria-labelledby="ingangen" className="px-[var(--vp-rand)] pt-[40px] md:hidden">
      <h2 id="ingangen" className="lbl m-0 text-gedempt">
        <T t={{ nl: "Waar kan ik je mee helpen?", en: "What can I help with?" }} />
      </h2>
      <ul className="m-0 mt-[16px] grid list-none gap-[12px] p-0">
        {RIJEN.map((r) => (
          <li key={r.slug} className="rounded-[16px] bg-vlak">
            <Link href={r.href} className="block p-[20px] no-underline">
              <span className="syne block text-[22px] leading-[1.15] tracking-[-.015em]"><T t={r.vraag} /></span>
              <span className="mt-[12px] flex items-baseline justify-between gap-[12px] text-[.875rem] text-gedempt">
                <span><T t={r.dienst.title} /></span>
                <span className="lbl shrink-0 text-inkt tabular-nums"><T t={kortePrijs(r.dienst)} /> →</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

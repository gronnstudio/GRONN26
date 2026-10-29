import type { Metadata } from "next"
import Link from "next/link"
import { Pijplijn } from "@/components/beheer/pijplijn"
import { geld, leesKlanten, opslagAan } from "@/lib/beheer/klanten"
import { euro } from "@/lib/format"
import { nieuweKlant } from "./acties"

// Klanten als pijplijn, alleen voor desktop (eigenaar, 29 okt 2026: "maak de
// UI gewoon goed en enkel voor desktop!"). Een klus sleep je naar de volgende
// fase; de kaart opent de klant.
export const metadata: Metadata = {
  title: { absolute: "Klanten · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"

export default async function Klanten() {
  const klanten = await leesKlanten()
  const kaarten = klanten.map((k) => {
    const g = geld(k)
    return { id: k.id, naam: k.naam, wat: k.wat, plaats: k.plaats, fase: k.fase, volgende: k.volgende, bedrag: g.offerte ?? (g.gefactureerd || undefined), open: g.open }
  })
  const open = klanten.reduce((t, k) => t + geld(k).open, 0)
  const lopend = klanten.filter((k) => k.fase !== "Opgeleverd" && k.fase !== "Aanvraag")
  const inPijplijn = lopend.reduce((t, k) => t + (geld(k).offerte ?? 0), 0)

  return (
    <div data-links className="min-h-svh min-w-[1200px] bg-grond text-inkt">
      <header className="flex items-center justify-between gap-4 border-b border-lijn px-8 py-4">
        <span className={`${lbl} text-oranje-tekst`}>Dashboard · Klanten</span>
        <nav className="flex gap-5 text-[13px]">
          <Link href="/dashboard/prijs" className="opacity-70 hover:opacity-100">Prijs berekenen</Link>
          <Link href="/offertes" className="opacity-70 hover:opacity-100">Offerte maken</Link>
          <Link href="/dashboard" className="opacity-70 hover:opacity-100">← Dashboard</Link>
        </nav>
      </header>
      <main className="px-8 py-8">
        <div className="flex items-end justify-between gap-8">
          <div>
            <h1 className="syne m-0 text-[48px] leading-[1.05]">Klanten</h1>
            <p className="m-0 mt-2 text-[14px] opacity-70">Sleep een klus naar de volgende fase. Klik op een naam voor de klantkaart.</p>
          </div>
          <dl className="m-0 flex gap-10">
            {[
              [String(lopend.length), "lopende klussen"],
              [euro(inPijplijn), "in offertes en planning"],
              [euro(open), "nog te ontvangen"],
            ].map(([n, t]) => (
              <div key={t}>
                <dd className={`syne m-0 text-[26px] tabular-nums ${t === "nog te ontvangen" && open > 0 ? "text-oranje-tekst" : ""}`}>{n}</dd>
                <dt className={`${lbl} opacity-60`}>{t}</dt>
              </div>
            ))}
          </dl>
        </div>

        <form action={nieuweKlant} className="mt-8 flex items-center gap-2">
          <input name="naam" required placeholder="Naam nieuwe klant" aria-label="Naam" className={`${veld} w-[260px]`} />
          <input name="wat" placeholder="Wat wil de klant?" aria-label="Wat" className={`${veld} w-[380px]`} />
          <input name="plaats" placeholder="Plaats" aria-label="Plaats" className={`${veld} w-[160px]`} />
          <button className="rounded-full bg-oranje px-5 py-2 text-[14px] font-semibold text-[#202020]">+ Klant</button>
          {!opslagAan() && <span className="text-[12px] text-oranje-tekst">Opslag staat uit: wijzigingen worden niet bewaard.</span>}
        </form>

        <div className="mt-6">
          <Pijplijn kaarten={kaarten} />
        </div>
      </main>
    </div>
  )
}

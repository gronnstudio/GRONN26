import type { Metadata } from "next"
import Link from "next/link"
import { PrijsRekenaar } from "@/components/beheer/prijs"

// Rekenblad voor een vaste prijs waar genoeg aan overblijft (eigenaar, 29 okt
// 2026: "werkblad om in te vullen op de website om prijs te berekenen zodat ik
// genoeg over houdt"). Alleen voor de eigenaar, net als de rest van /dashboard.
export const metadata: Metadata = {
  title: { absolute: "Prijs berekenen · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"

export default function Prijs() {
  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      <header className="flex items-center justify-between gap-4 border-b border-lijn px-5 py-4 md:px-8">
        <span className={`${lbl} text-oranje-tekst`}>Dashboard · Prijs berekenen</span>
        <Link href="/dashboard" className="text-[13px] opacity-70 hover:opacity-100">← Dashboard</Link>
      </header>
      <main className="mx-auto max-w-[1200px] px-5 py-8 md:px-8">
        <h1 className="syne m-0 text-[clamp(36px,4vw,48px)] leading-[1.05]">Prijs berekenen</h1>
        <p className="m-0 mt-3 max-w-[60ch] text-[14px] leading-[1.55] opacity-75">
          Vul je uren en je inkoop in. De opslag per soort rekent vanzelf mee, en je ziet meteen of er genoeg overblijft.
        </p>
        <div className="mt-8">
          <PrijsRekenaar />
        </div>
      </main>
    </div>
  )
}

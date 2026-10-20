import type { Metadata } from "next"
import Link from "next/link"
import { GROEPEN, STAND } from "@/lib/beheer/leveranciers"

// Leveranciers per materiaal, één tabblad per groep (eigenaar, 20 okt 2026).
// De tabbladen zijn gewone links met ?tab=, zodat het zonder JavaScript werkt
// en je een tabblad kunt delen of bewaren. Inhoud: src/lib/beheer/leveranciers.ts.
export const metadata: Metadata = {
  title: { absolute: "Leveranciers · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const extern = { target: "_blank", rel: "noreferrer" } as const

export default async function Leveranciers({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const groep = GROEPEN.find((g) => g.id === tab) ?? GROEPEN[0]
  // Dichtbij eerst; daarna online, met de accounts die je al hebt vooraan.
  const lijst = [...groep.leveranciers].sort(
    (a, b) => (a.km ?? Infinity) - (b.km ?? Infinity) || Number(!a.account) - Number(!b.account),
  )

  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      <header className="flex items-center justify-between gap-4 border-b border-lijn px-5 py-4 md:px-8">
        <span className={`${lbl} text-oranje-tekst`}>Dashboard · Leveranciers</span>
        <Link href="/dashboard" className="text-[13px] opacity-70 hover:opacity-100">← Dashboard</Link>
      </header>
      <main className="mx-auto max-w-[1200px] px-5 py-8 md:px-8">
        <h1 className="syne m-0 text-[clamp(36px,4vw,48px)] leading-[1.05]">Leveranciers</h1>
        <p className="m-0 mt-3 max-w-[60ch] text-[14px] leading-[1.55] opacity-75">
          Waar je materiaal haalt, per soort, dichtstbij eerst (afstand vanaf Stein, ongeveer). &ldquo;Vragen&rdquo; betekent dat de site niets zegt over zakelijke prijzen: bel
          of mail met je KvK-nummer.
        </p>

        <nav aria-label="Soort materiaal" className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {GROEPEN.map((g) => {
            const actief = g.id === groep.id
            return (
              <Link
                key={g.id}
                href={`/dashboard/leveranciers?tab=${g.id}`}
                aria-current={actief ? "page" : undefined}
                className={`shrink-0 rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${
                  actief ? "border-inkt bg-inkt text-grond" : "border-lijn hover:border-oranje"
                }`}
              >
                {g.naam} <span className="opacity-60">{g.leveranciers.length}</span>
              </Link>
            )
          })}
        </nav>

        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {lijst.map((l) => (
            <li key={l.naam} className="flex flex-col gap-4 rounded-[18px] border border-lijn p-5">
              <div>
                <a href={l.href} {...extern} className="syne text-[20px] leading-[1.2] hover:text-oranje-tekst">
                  {l.naam} <span className="text-[14px] opacity-60">↗</span>
                </a>
                <p className="m-0 mt-1 text-[12px] opacity-60">
                  {l.km ? `${l.km} km · ${l.plaats}` : l.plaats ?? "Online of via dealer"}
                </p>
                <p className="m-0 mt-2 text-[14px] leading-[1.5] opacity-80">{l.wat}</p>
              </div>
              <dl className="m-0 mt-auto grid gap-2 text-[13px]">
                <div>
                  <dt className={`${lbl} opacity-60`}>Zakelijk</dt>
                  <dd className="m-0 mt-0.5 flex items-center gap-1.5">
                    {l.account && (
                      <span aria-hidden className={`grid size-[18px] place-items-center rounded-full text-[11px] font-bold ${STAND[l.account].bol}`}>
                        {STAND[l.account].teken}
                      </span>
                    )}
                    {l.account ? `Account: ${STAND[l.account].naam.toLowerCase()}` : l.zakelijk}
                  </dd>
                </div>
                {l.stalen && (
                  <div>
                    <dt className={`${lbl} opacity-60`}>Stalen of catalogus</dt>
                    <dd className="m-0 mt-0.5">
                      {l.stalen.href ? (
                        <a href={l.stalen.href} {...extern} className="font-semibold text-oranje-tekst">
                          {l.stalen.tekst} ↗
                        </a>
                      ) : (
                        l.stalen.tekst
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

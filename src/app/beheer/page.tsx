import type { Metadata } from "next"
import Link from "next/link"
import { Assistent } from "@/components/beheer/assistent"
import { Facturen } from "@/components/beheer/facturen"
import { Kern } from "@/components/beheer/kern"
import { KleurKeuze } from "@/components/beheer/kleur"
import { Datum, Groet, Klok } from "@/components/beheer/klok"
import { KOPPELINGEN, LEVERANCIERS, PROJECTEN, TE_BETALEN, TE_ONTVANGEN, TODOS } from "@/lib/beheer/data"
import { DOCUMENTEN } from "@/lib/data/legal"
import { euro } from "@/lib/format"

// Het dashboard achter de login, waar alles samenkomt (eigenaar, 6 okt 2026:
// "een jarvis achtig dashboard"). Opzet naar de Command Center in
// gronnstudio/gronncore, maar met alleen echte gegevens (src/lib/beheer/data.ts).
// Alleen voor de eigenaar: src/proxy.ts laat hier niemand anders in.
export const metadata: Metadata = {
  title: { absolute: "Beheer · GRØNN Studio" },
  robots: { index: false, follow: false },
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"

export default function Beheer() {
  const aandacht = PROJECTEN.filter((p) => p.aandacht)
  const lopend = PROJECTEN.filter((p) => p.fase !== "Opgeleverd")
  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      {/* bovenbalk */}
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-lijn px-5 py-4 md:px-8">
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="hidden h-[22px] w-auto dark:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt="GRØNN Studio" className="h-[22px] w-auto dark:hidden" />
          <span className={`${lbl} hidden text-oranje-tekst sm:inline`}>Beheer · alleen eigenaar</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          <span className="hidden font-semibold tabular-nums sm:inline">
            <Klok />
          </span>
          <KleurKeuze />
          <Link href="/" className="opacity-70 hover:opacity-100">Site</Link>
          <a href="/api/uitloggen" className="opacity-70 hover:opacity-100">Uitloggen</a>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-12 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* de kern */}
        <section className="flex items-center justify-center">
          <Kern />
        </section>

        {/* vandaag */}
        <aside className="flex flex-col gap-8">
          <div>
            <p className={`${lbl} m-0 opacity-60`}>
              <Datum />
            </p>
            <h1 className="syne m-0 mt-1 text-[clamp(30px,3.4vw,44px)] leading-[1.05]">
              <Groet />
            </h1>
          </div>
          <dl className="m-0 grid grid-cols-3 border-y border-lijn">
            {[
              [String(lopend.length).padStart(2, "0"), "lopend"],
              [String(aandacht.length).padStart(2, "0"), "aandacht"],
              [String(TODOS.length).padStart(2, "0"), "te doen"],
            ].map(([n, t], i) => (
              <div key={t} className={`py-4 ${i ? "border-l border-lijn pl-4" : ""}`}>
                <dd className={`syne m-0 text-[30px] ${t === "aandacht" && n !== "00" ? "text-oranje-tekst" : ""}`}>{n}</dd>
                <dt className={`${lbl} opacity-60`}>{t}</dt>
              </div>
            ))}
          </dl>
          <div>
            <p className={`${lbl} m-0 opacity-60`}>Volgende stap</p>
            <ul className="m-0 mt-3 list-none space-y-4 p-0">
              {lopend.map((p) => (
                <li key={p.naam} className="border-l-2 pl-4" style={{ borderColor: p.aandacht ? "var(--oranje)" : "var(--lijn)" }}>
                  <div className="flex justify-between gap-3">
                    <b className="font-semibold">{p.naam}</b>
                    <span className={`${lbl} shrink-0 opacity-60`}>{p.fase}</span>
                  </div>
                  <p className="m-0 mt-1 text-[13px] leading-[1.5] opacity-75">{p.volgende}</p>
                </li>
              ))}
            </ul>
          </div>
          <Assistent />
          <Link
            href="/offertes"
            className="group flex items-center justify-between rounded-full bg-oranje px-6 py-4 font-semibold text-[#202020]"
          >
            Nieuwe offerte maken <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </aside>

        {/* te doen, met kosten */}
        <section className="lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <p className={`${lbl} m-0 opacity-60`}>Te doen · met wat het kost</p>
            <p className="m-0 text-[11px] opacity-50">Kosten zijn schattingen</p>
          </div>
          <ul className="m-0 mt-4 grid list-none grid-cols-[minmax(0,1fr)] gap-3 p-0 md:grid-cols-2">
            {TODOS.map((t) => (
              <li
                key={t.wat}
                className={`rounded-[18px] border p-5 ${t.dringend ? "border-oranje/60 bg-oranje/10" : "border-lijn bg-inkt/[.03]"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <b className="font-semibold hyphens-auto [overflow-wrap:anywhere]" lang="nl">{t.wat}</b>
                  {t.dringend && <span className={`${lbl} shrink-0 text-oranje-tekst`}>Eerst</span>}
                </div>
                <p className="m-0 mt-1.5 text-[13px] opacity-70">{t.waarom}</p>
                <p className="syne m-0 mt-3 text-[17px] text-oranje-tekst">{t.kosten}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* facturen */}
        <Facturen ontvangen={TE_ONTVANGEN} betalen={TE_BETALEN} />

        {/* kleine letters */}
        <section className="lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className={`${lbl} m-0 opacity-60`}>Kleine letters</p>
            <a href="/documenten/GRONN-bijlagen-particulier.zip" download className="text-[13px] text-oranje-tekst">
              Bijlagen voor een particuliere offerte (zip) ↓
            </a>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ...DOCUMENTEN.map(({ doc, pagina, pdf }) => ({
                titel: doc.title,
                sub: `${doc.status === "vastgesteld" ? "Vastgesteld" : "Concept"} · ${datum(doc.updated)}`,
                pagina,
                pdf,
              })),
              { titel: "Fototoestemming", sub: "Leeg formulier", pagina: "", pdf: "GRONN-fototoestemming.pdf" },
            ].map((d) => (
              <li key={d.titel} className="flex flex-col justify-between gap-4 rounded-[18px] border border-lijn p-5">
                <div>
                  <b className="font-semibold leading-[1.3]">{d.titel}</b>
                  <span className="mt-1 block text-[12px] opacity-60">{d.sub}</span>
                </div>
                <div className="flex gap-2 text-[12px]">
                  {d.pagina && (
                    <Link href={d.pagina} className="rounded-full border border-lijn px-3 py-1">Bekijk</Link>
                  )}
                  <a href={`/documenten/${d.pdf}`} download className="rounded-full bg-inkt px-3 py-1 text-grond">PDF</a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* koppelingen */}
        <section className="lg:col-span-2">
          <p className={`${lbl} m-0 opacity-60`}>Alles op één plek</p>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-6">
            {KOPPELINGEN.map((k) => (
              <li key={k.naam}>
                <a
                  href={k.href}
                  {...(k.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[18px] border border-lijn p-4 transition-colors hover:border-oranje"
                >
                  <span className="syne text-[17px]">{k.naam}</span>
                  <span className="flex items-center justify-between text-[12px] opacity-60">
                    {k.uitleg} <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        {/* leveranciers */}
        <section className="lg:col-span-2">
          <p className={`${lbl} m-0 opacity-60`}>Leveranciers · zakelijke accounts</p>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {LEVERANCIERS.map((k) => (
              <li key={k.naam}>
                <a
                  href={k.href}
                  {...(k.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[18px] border border-lijn p-4 transition-colors hover:border-oranje"
                >
                  <span className="syne text-[17px]">{k.naam}</span>
                  <span className="flex items-center justify-between text-[12px] opacity-60">
                    {k.uitleg} <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <p className="m-0 text-[11px] opacity-40 lg:col-span-2">
          Projecten en to-do&apos;s staan in src/lib/beheer/data.ts. Open offertes samen:{" "}
          {euro(PROJECTEN.filter((p) => p.fase === "Offerte").reduce((s, p) => s + (p.bedrag ?? 0), 0))}.
        </p>
      </main>
    </div>
  )
}

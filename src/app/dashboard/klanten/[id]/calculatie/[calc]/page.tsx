import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CrmKop } from "@/components/beheer/crm-kop"
import { PrijsRekenaar, type Begin } from "@/components/beheer/prijs"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { leesKlanten } from "@/lib/beheer/klanten"
import { STANDAARD } from "@/lib/crm/calculatie"
import { oppervlakUit } from "@/lib/crm/intake"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"

// Een calculatie bij een klant: hetzelfde rekenblad als /dashboard/prijs, met
// bewaren als nieuwe versie. ?v=2 opent een oudere versie om verder te
// rekenen; bewaren maakt dan weer een nieuwe versie, de oude blijft staan.
export const metadata: Metadata = {
  title: { absolute: "Calculatie · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const tijd = (d: string) => new Date(d).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })

export default async function CalculatiePagina({ params, searchParams }: { params: Promise<{ id: string; calc: string }>; searchParams: Promise<{ v?: string; tuin?: string }> }) {
  const { id, calc } = await params
  const { v, tuin } = await searchParams
  const [klanten, catalogus] = await Promise.all([leesKlanten(), leesCatalogus()])
  const k = klanten.find((x) => x.id === id)
  if (!k) notFound()
  const c = calc === "nieuw" ? undefined : k.calculaties.find((x) => x.id === calc)
  if (calc !== "nieuw" && !c) notFound()
  const versie = c ? (c.versies.find((x) => String(x.nr) === v) ?? c.versies.at(-1)) : undefined
  const laatste = c?.versies.at(-1)?.nr ?? 0

  // Nieuw vanuit een tuin: de opname geeft de eerste beschrijving.
  const t = k.tuinen.find((x) => x.id === (c?.tuinId ?? tuin))
  const opp = t ? oppervlakUit(t.antwoorden) : null
  const uitOpname = t
    ? [`${t.naam}${opp ? `, ${toonDecimaal(opp, 3)} m²` : ""}.`, t.diensten.length ? `Werk: ${t.diensten.join(", ").toLowerCase()}.` : "", t.antwoorden.doelen ?? "", t.antwoorden.toegang ? `Toegang: ${t.antwoorden.toegang}.` : ""]
        .filter(Boolean)
        .join(" ")
    : ""

  const begin: Begin = {
    klantId: k.id,
    calculatieId: c?.id,
    titel: c?.titel ?? (t ? `${t.naam} · ${k.naam}` : k.wat),
    tuinId: t?.id,
    beschrijving: versie?.beschrijving ?? uitOpname,
    uren: versie?.uren ?? 0,
    uurtarief: versie?.uurtarief ?? STANDAARD.uurtarief,
    onvoorzien: versie?.onvoorzien ?? 0,
    korting: versie?.korting ?? 0,
    regels: versie?.regels ?? [],
    nr: laatste,
  }
  const keuze = [{ id: k.id, naam: k.naam, tuinen: k.tuinen.map((x) => ({ id: x.id, naam: x.naam })) }]

  return (
    <div data-links className="min-h-svh bg-grond text-inkt print:min-h-0 print:bg-white">
      <CrmKop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam, href: `/dashboard/klanten/${k.id}?tab=calculaties` }, { naam: c?.titel ?? "Nieuwe calculatie" }]} actief="/dashboard/klanten" />
      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 print:max-w-none print:p-0">
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <h1 className="syne m-0 text-[clamp(32px,3.5vw,44px)] leading-[1.05]">{c ? c.titel : "Nieuwe calculatie"}</h1>
          {c && c.versies.length > 0 && (
            <nav aria-label="Versies" className="flex flex-wrap items-center gap-1 text-[13px]">
              <span className="mr-2 opacity-60">Versie</span>
              {c.versies.map((x) => (
                <Link
                  key={x.nr}
                  href={`/dashboard/klanten/${k.id}/calculatie/${c.id}?v=${x.nr}`}
                  aria-current={x.nr === versie?.nr ? "page" : undefined}
                  title={`${tijd(x.datum)} · ${toonEuro(x.totaal)}`}
                  className={`rounded-full border px-3 py-1 font-mono ${x.nr === versie?.nr ? "border-inkt bg-inkt text-grond" : "border-lijn hover:border-oranje"}`}
                >
                  {x.nr}
                </Link>
              ))}
            </nav>
          )}
        </div>
        {versie && versie.nr !== laatste && (
          <p role="status" className="m-0 mt-3 text-[13px] text-oranje-tekst print:hidden">
            Je kijkt naar versie {versie.nr} van {tijd(versie.datum)}. Bewaren maakt er versie {laatste + 1} van; deze blijft staan.
          </p>
        )}
        <div className="mt-8 print:mt-0">
          {/* key: een andere gekozen versie (?v=) begint met een schoon rekenblad; na bewaren blijft het blad staan */}
          <PrijsRekenaar key={`${c?.id ?? "nieuw"}-${v ?? "laatste"}`} klanten={keuze} catalogus={catalogus} begin={begin} />
        </div>
      </main>
    </div>
  )
}

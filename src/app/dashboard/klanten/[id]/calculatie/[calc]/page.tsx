import { werkplan } from "@/lib/crm/planning"
import { faseTotalen } from "@/lib/crm/werkomschrijving"
import type { Metadata } from "next"
import Link from "next/link"
import { labelVan, zichtbareVersies } from "@/lib/crm/versies"
import { notFound } from "next/navigation"
import { Kop } from "@/components/crm/kop"
import { PrijsRekenaar, type Begin } from "@/components/beheer/prijs"
import { leesCatalogus } from "@/lib/beheer/catalogus"
import { voorRekenblad } from "@/lib/crm/catalogus"
import { meetstaat, naarRegel as naarMeetRegel } from "@/lib/crm/meetstaat"
import { leesKlanten } from "@/lib/beheer/klanten"
import { STANDAARD } from "@/lib/crm/calculatie"
import { oppervlakUit } from "@/lib/crm/vragenlijst"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { maakOfferteVan } from "../../../offerte-acties"

// Een calculatie bij een klant: hetzelfde rekenblad als /dashboard/prijs, met
// bewaren als nieuwe versie. ?v=2 opent een oudere versie om verder te
// rekenen; bewaren maakt dan weer een nieuwe versie, de oude blijft staan.
export const metadata: Metadata = { title: "Calculatie" }
export const dynamic = "force-dynamic"

const tijd = (d: string) => new Date(d).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })

export default async function CalculatiePagina({ params, searchParams }: { params: Promise<{ id: string; calc: string }>; searchParams: Promise<{ v?: string; tuin?: string; meetstaat?: string }> }) {
  const { id, calc } = await params
  const { v, tuin, meetstaat: metMeetstaat } = await searchParams
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
    betaald: versie?.betaald,
    betaaldTekst: versie?.betaaldTekst,
    regels: versie?.regels ?? [],
    planning: versie?.planning,
    planStart: versie?.planStart,
    fasen: versie?.fasen,
    planVoorstel: t ? werkplan(t.zones) : undefined,
    nr: laatste,
  }
  // "Zet in calculatie" vanuit de tuin: de meetstaat komt erbij. Regels die eerder uit de
  // meetstaat kwamen (ook van een hernoemde of leeggemaakte zone), worden vervangen; de rest blijft staan.
  if (metMeetstaat === "1" && t) {
    const staat = meetstaat(t.zones)
    const nieuw = staat.flatMap((z) => z.regels.filter((r) => r.hoeveelheid > 0).map((r) => naarMeetRegel(r, catalogus)))
    begin.regels = [...begin.regels.filter((r) => !r.meetstaat), ...nieuw]
  }
  const keuze = [{ id: k.id, naam: k.naam, tuinen: k.tuinen.map((x) => ({ id: x.id, naam: x.naam })) }]

  return (
    <>
      <Kop pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam, href: `/dashboard/klanten/${k.id}?tab=calculaties` }, { naam: c?.titel ?? "Nieuwe calculatie" }]} titel={c ? c.titel : "Nieuwe calculatie"}>
        {/* Drie vakken in plaats van versienummers (Nick, 5 nov 2026). */}
        {c && c.versies.length > 0 && (
          <nav aria-label="Concept of definitief" className="flex flex-wrap gap-1.5 text-[13px]">
            {zichtbareVersies(c.versies).map((x) => (
              <Link
                key={x.label}
                href={`/dashboard/klanten/${k.id}/calculatie/${c.id}?v=${x.versie.nr}`}
                aria-current={x.versie.nr === versie?.nr ? "true" : undefined}
                className="crm-chip"
              >
                {x.label} <span className="crm-cijfer text-gedempt">{toonEuro(x.versie.totaal)} · {tijd(x.versie.datum)}</span>
              </Link>
            ))}
          </nav>
        )}
        {c && versie && (
          <form action={maakOfferteVan.bind(null, k.id, c.id, versie.nr, "")}>
            <BewaarKnop>Offerte met link maken ({labelVan(c.versies, versie.nr).toLowerCase()})</BewaarKnop>
          </form>
        )}
        {c && versie && versie.fasen && versie.fasen.length > 1 &&
          versie.fasen.map((f) => (
            <form key={f.naam} action={maakOfferteVan.bind(null, k.id, c.id, versie.nr, f.naam)}>
              <BewaarKnop className="crm-knop-rand">Offerte {f.naam.split(" — ")[0]}</BewaarKnop>
            </form>
          ))}
      </Kop>
      <main className="mx-auto max-w-[2200px] px-8 py-6 print:max-w-none print:p-0">
        {c && versie && versie.nr !== laatste && (
          <p role="status" data-stil className="crm-let m-0 px-4 py-2 text-[13px] print:hidden">
            Je kijkt naar {labelVan(c.versies, versie.nr).toLowerCase()} van {tijd(versie.datum)}. Bewaren maakt een nieuw concept of definitief; deze blijft staan.
          </p>
        )}
        <div className="mt-4 print:mt-0">
          {/* key: een andere gekozen versie (?v=) begint met een schoon rekenblad; na bewaren blijft het blad staan */}
          <PrijsRekenaar key={`${c?.id ?? "nieuw"}-${v ?? "laatste"}`} klanten={keuze} catalogus={voorRekenblad(catalogus)} begin={begin} />
        </div>
      </main>
    </>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Assistent } from "@/components/beheer/assistent"
import { CrmKop } from "@/components/beheer/crm-kop"
import { BRONNEN, KLANT_FASEN, KLANT_SOORTEN, PRIORITEITEN, VERLOREN_REDENEN, VOORKEUREN, geld, hoortBij, leesKlanten, sleutel, type Klant } from "@/lib/beheer/klanten"
import { ingevuld } from "@/lib/crm/intake"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"
import { leesUren } from "@/lib/beheer/uren"
import { euro } from "@/lib/format"
import { bewaarKlant, klantWeg, nieuweNotitie, nieuweTuin, nieuwStuk, stukRond, stukWeg } from "../acties"

// De klantkaart: één werkplek per klant, met tabbladen (masterprompt CRM,
// module 02: Overzicht | Tuinen | Calculaties | Stukken | Activiteit). Gewone
// links met ?tab=, net als op het dashboard.
export const metadata: Metadata = {
  title: { absolute: "Klant · Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"
const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const datum = (d: string) => new Date(d.length === 10 ? `${d}T12:00` : d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" })
const tijd = (d: string) => new Date(d).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })

const TABS = [
  { id: "overzicht", naam: "Overzicht" },
  { id: "tuinen", naam: "Tuinen" },
  { id: "calculaties", naam: "Calculaties" },
  { id: "stukken", naam: "Offertes en facturen" },
  { id: "activiteit", naam: "Tijdlijn" },
] as const

export default async function Klantkaart({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string; bestond?: string }> }) {
  const { id } = await params
  const { tab, bestond } = await searchParams
  const k = (await leesKlanten()).find((x) => x.id === id)
  if (!k) notFound()
  const actief = TABS.find((t) => t.id === tab)?.id ?? "overzicht"
  const g = geld(k)
  const tel = { tuinen: k.tuinen.length, calculaties: k.calculaties.length, stukken: k.stukken.length, activiteit: k.activiteit.length } as Record<string, number>

  return (
    <div data-links className="min-h-svh min-w-[1200px] bg-grond text-inkt">
      <CrmKop pad={[{ naam: "Dashboard", href: "/dashboard" }, { naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam }]} actief="/dashboard/klanten" />
      <div className="mx-auto max-w-[1400px] px-8 pt-8">
        {bestond && (
          <p role="status" className="m-0 mb-4 rounded-[12px] border border-oranje/60 bg-oranje/10 px-4 py-2 text-[14px]">
            Deze klant bestond al (zelfde naam, e-mail of telefoon). Je ziet de bestaande kaart.
          </p>
        )}
        <div className="flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className={`${lbl} m-0 opacity-60`}>{[k.soort, k.fase, k.plaats].filter(Boolean).join(" · ")}</p>
            <h1 className="syne m-0 mt-1 text-[44px] leading-[1.05]">{k.naam}</h1>
            {k.wat && <p className="m-0 mt-1 text-[15px] opacity-75">{k.wat}</p>}
          </div>
          <dl className="m-0 grid shrink-0 grid-cols-3 rounded-[18px] border border-lijn">
            {[
              [euro(g.gefactureerd), "gefactureerd"],
              [euro(g.betaald), "betaald"],
              [euro(g.open), "open"],
            ].map(([n, t], i) => (
              <div key={t} className={`px-5 py-3 ${i ? "border-l border-lijn" : ""}`}>
                <dd className={`m-0 font-mono text-[16px] font-semibold tabular-nums ${t === "open" && g.open > 0 ? "text-oranje-tekst" : ""}`}>{n}</dd>
                <dt className={`${lbl} opacity-60`}>{t}</dt>
              </div>
            ))}
          </dl>
        </div>
        <nav aria-label="Klantkaart" className="-mb-px mt-6 flex gap-1 border-b border-lijn">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={t.id === "overzicht" ? `/dashboard/klanten/${k.id}` : `/dashboard/klanten/${k.id}?tab=${t.id}`}
              aria-current={t.id === actief ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2.5 text-[14px] font-semibold ${t.id === actief ? "border-oranje" : "border-transparent opacity-65 hover:opacity-100"}`}
            >
              {t.naam}
              {tel[t.id] ? <span className="ml-1.5 font-mono text-[12px] opacity-60">{tel[t.id]}</span> : null}
            </Link>
          ))}
        </nav>
      </div>
      <main className="mx-auto max-w-[1400px] px-8 py-8">
        {actief === "overzicht" && <Overzicht k={k} />}
        {actief === "tuinen" && <Tuinen k={k} />}
        {actief === "calculaties" && <Calculaties k={k} />}
        {actief === "stukken" && <Stukken k={k} />}
        {actief === "activiteit" && <Tijdlijn k={k} />}
      </main>
    </div>
  )
}

async function Overzicht({ k }: { k: Klant }) {
  const g = geld(k)
  const uren = (await leesUren()).filter((r) => hoortBij(k, r.klant))
  const urenTotaal = uren.reduce((t, r) => t + r.uren, 0)
  // Nacalculatie in het klein: wat er per gewerkt uur binnenkwam (excl. 21 % btw, schatting).
  const perUur = urenTotaal && g.gefactureerd ? g.gefactureerd / 1.21 / urenTotaal : 0
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-10">
      <form key={sleutel({ ...k, activiteit: 0, stukken: 0, tuinen: 0, calculaties: 0 })} action={bewaarKlant.bind(null, k.id)} className="flex flex-col gap-6">
        <fieldset className="m-0 grid grid-cols-3 gap-4 border-0 p-0">
          <legend className={`${lbl} mb-3 opacity-60`}>Contact</legend>
          <Veld naam="naam" label="Naam" waarde={k.naam} />
          <Keuze naam="soort" label="Soort contact" waarde={k.soort} opties={KLANT_SOORTEN} />
          <Veld naam="bedrijf" label="Bedrijf" waarde={k.bedrijf} />
          <Veld naam="telefoon" label="Telefoon" waarde={k.telefoon} type="tel" />
          <Veld naam="email" label="E-mail" waarde={k.email} type="email" />
          <Keuze naam="voorkeur" label="Liefst via" waarde={k.voorkeur} opties={["", ...VOORKEUREN]} />
          <Veld naam="adres" label="Factuuradres" waarde={k.adres} />
          <Veld naam="plaats" label="Plaats" waarde={k.plaats} />
          <Veld naam="tags" label="Tags, met komma's" waarde={k.tags.join(", ")} />
          {k.contact && <Veld naam="contact" label="Oud contactveld" waarde={k.contact} />}
        </fieldset>

        <fieldset className="m-0 grid grid-cols-3 gap-4 border-0 p-0">
          <legend className={`${lbl} mb-3 opacity-60`}>Lead en klus</legend>
          <div className="col-span-3">
            <Veld naam="wat" label="Wat wil de klant?" waarde={k.wat} />
          </div>
          <Keuze naam="fase" label="Fase" waarde={k.fase} opties={KLANT_FASEN} />
          <Keuze naam="bron" label="Hoe binnengekomen" waarde={k.bron} opties={["", ...BRONNEN]} />
          <Keuze naam="prioriteit" label="Prioriteit" waarde={k.prioriteit} opties={PRIORITEITEN} />
          <Veld naam="waarde" label="Geschatte waarde excl. btw (€)" waarde={k.waarde ? toonDecimaal(k.waarde, 2, 2) : ""} />
          <Veld naam="kans" label="Kans op opdracht (%)" waarde={k.kans ? String(k.kans) : ""} />
          <Veld naam="opvolgen" label="Opvolgen op" waarde={k.opvolgen} type="date" />
          <div className="col-span-2">
            <Veld naam="volgende" label="Volgende stap" waarde={k.volgende} />
          </div>
          <Keuze naam="verlorenReden" label="Reden verloren (alleen bij Verloren)" waarde={k.verlorenReden} opties={["", ...VERLOREN_REDENEN]} />
        </fieldset>

        <label className="grid gap-1 text-[13px]">
          Notities
          <textarea name="notities" defaultValue={k.notities} rows={8} className={`${veld} resize-y leading-[1.5]`} placeholder="Afspraken, wensen, wat je zag…" />
        </label>
        <div className="flex items-center justify-between">
          <button className="rounded-full bg-oranje px-6 py-3 text-[14px] font-semibold text-[#202020]">Bewaren</button>
          <button formAction={klantWeg.bind(null, k.id)} className="text-[13px] opacity-50 hover:text-oranje-tekst hover:opacity-100">Klant verwijderen</button>
        </div>
      </form>

      <aside className="flex flex-col gap-6">
        <section className="rounded-[18px] border border-lijn p-5">
          <p className={`${lbl} m-0 opacity-60`}>Snel</p>
          <div className="mt-3 grid gap-2 text-[14px] font-semibold">
            <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw`} className="rounded-full bg-oranje px-5 py-2.5 text-[#202020]">+ Nieuwe calculatie</Link>
            {k.telefoon && <a href={`tel:${k.telefoon.replace(/\s/g, "")}`} className="rounded-full border border-lijn px-5 py-2.5 hover:border-oranje">Bel {k.telefoon}</a>}
            {k.telefoon && <a href={`https://wa.me/${k.telefoon.replace(/\D/g, "").replace(/^0/, "31")}`} className="rounded-full border border-lijn px-5 py-2.5 hover:border-oranje">WhatsApp</a>}
            {k.email && <a href={`mailto:${k.email}`} className="rounded-full border border-lijn px-5 py-2.5 hover:border-oranje">Mail {k.email}</a>}
          </div>
        </section>
        <Assistent klantId={k.id} snel={["Vat deze klant samen", "Wat ontbreekt nog in de opname?", "Is de prijs scherp genoeg?", "Schrijf een bericht voor de volgende stap"]} />
        <Notitie k={k} />
        <section className="rounded-[18px] border border-lijn p-5">
          <div className="flex items-baseline justify-between">
            <p className={`${lbl} m-0 opacity-60`}>Uren uit je registratie</p>
            <Link href="/dashboard/uren" className="text-[12px] text-oranje-tekst">Uren invullen →</Link>
          </div>
          <p className="syne m-0 mt-2 text-[26px] tabular-nums">{urenTotaal.toLocaleString("nl-NL")} uur</p>
          {perUur > 0 && (
            <p className={`m-0 text-[13px] ${perUur < 37 ? "font-semibold text-oranje-tekst" : "opacity-70"}`}>± {euro(perUur)} per uur gefactureerd (excl. btw, inclusief materiaal)</p>
          )}
          <ul className="m-0 mt-3 grid max-h-[240px] list-none gap-1 overflow-y-auto p-0 text-[13px]">
            {uren.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{datum(r.datum)} · {r.wat || r.soort}</span>
                <span className="tabular-nums">{r.uren} u</span>
              </li>
            ))}
            {!uren.length && <li className="opacity-60">Geen uren gevonden met deze naam in het veld Klant.</li>}
          </ul>
        </section>
      </aside>
    </div>
  )
}

function Notitie({ k }: { k: Klant }) {
  return (
    <section className="rounded-[18px] border border-lijn p-5">
      <p className={`${lbl} m-0 opacity-60`}>Gesprek of bezoek vastleggen</p>
      <form action={nieuweNotitie.bind(null, k.id)} className="mt-3 grid gap-2">
        <select name="soort" aria-label="Soort" className={`${veld} bg-grond`}>
          <option>Gesprek</option>
          <option>Bezoek</option>
          <option>Notitie</option>
        </select>
        <textarea name="tekst" required rows={3} aria-label="Wat is er besproken" placeholder="Wat is er besproken of afgesproken?" className={`${veld} resize-y`} />
        <button className="rounded-full border border-lijn px-4 py-2 text-[14px] font-semibold hover:border-oranje">+ Op de tijdlijn</button>
      </form>
    </section>
  )
}

function Tuinen({ k }: { k: Klant }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-10">
      <ul className="m-0 grid list-none grid-cols-2 gap-4 self-start p-0">
        {k.tuinen.map((t) => {
          const n = ingevuld(t.antwoorden)
          return (
            <li key={t.id} className="rounded-[18px] border border-lijn p-5">
              <Link href={`/dashboard/klanten/${k.id}/tuin/${t.id}`} className="syne text-[22px] hover:text-oranje-tekst">{t.naam}</Link>
              {t.adres && <p className="m-0 mt-1 text-[13px] opacity-70">{t.adres}</p>}
              <p className="m-0 mt-3 text-[13px]">
                Opname: {n.gevuld} van {n.van} vragen · {t.fotos.length} foto{t.fotos.length === 1 ? "" : "'s"}
                {t.antwoorden.oppervlak && <> · {t.antwoorden.oppervlak} m²</>}
              </p>
              {t.diensten.length > 0 && <p className="m-0 mt-1 text-[13px] opacity-70">{t.diensten.join(", ")}</p>}
              <p className="m-0 mt-2 text-[12px] opacity-50">Bijgewerkt {datum(t.bijgewerkt)}</p>
            </li>
          )
        })}
        {!k.tuinen.length && <li className="col-span-2 rounded-[18px] border border-dashed border-lijn p-8 text-center text-[14px] opacity-70">Nog geen tuin. Voeg er een toe en doe de opname: maten, grond, toegang en foto&apos;s.</li>}
      </ul>
      <form action={nieuweTuin.bind(null, k.id)} className="flex flex-col gap-3 self-start rounded-[18px] border border-lijn p-5">
        <p className={`${lbl} m-0 opacity-60`}>Tuin of perceel toevoegen</p>
        <Veld naam="naam" label="Naam" waarde="" plaats="bijv. Achtertuin" />
        <Veld naam="adres" label="Adres van de tuin" waarde={k.adres} />
        <button className="rounded-full bg-oranje px-5 py-2.5 text-[14px] font-semibold text-[#202020]">+ Tuin en opname</button>
      </form>
    </div>
  )
}

function Calculaties({ k }: { k: Klant }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw`} className="rounded-full bg-oranje px-5 py-2.5 text-[14px] font-semibold text-[#202020]">+ Nieuwe calculatie</Link>
      </div>
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className={`${lbl} text-left opacity-60`}>
            {["Calculatie", "Tuin", "Versies", "Laatst", "Overhouden", "Totaal incl. btw"].map((h, i) => (
              <th key={h} className={`border-b border-lijn py-2 pr-4 font-semibold ${i > 3 ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {k.calculaties.map((c) => {
            const v = c.versies.at(-1)
            return (
              <tr key={c.id} className="border-b border-lijn">
                <td className="py-2 pr-4"><Link href={`/dashboard/klanten/${k.id}/calculatie/${c.id}`} className="font-semibold hover:text-oranje-tekst">{c.titel}</Link></td>
                <td className="py-2 pr-4">{k.tuinen.find((t) => t.id === c.tuinId)?.naam ?? ""}</td>
                <td className="py-2 pr-4 tabular-nums">{c.versies.length}</td>
                <td className="py-2 pr-4">{v ? tijd(v.datum) : ""}</td>
                <td className="py-2 pr-4 text-right font-mono tabular-nums">{v ? toonEuro(v.winst) : ""}</td>
                <td className="py-2 text-right font-mono tabular-nums">{v ? toonEuro(v.totaal) : ""}</td>
              </tr>
            )
          })}
          {!k.calculaties.length && (
            <tr>
              <td colSpan={6} className="py-6 text-center opacity-60">Nog geen calculatie. Een nieuwe begint met de maten uit de opname.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Stukken({ k }: { k: Klant }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-10">
      <section>
        <p className={`${lbl} m-0 opacity-60`}>Offertes en facturen · incl. btw</p>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[14px]">
          {k.stukken.map((s) => (
            <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-lijn pb-2">
              <span className="min-w-0">
                <span className={`${lbl} mr-2 opacity-60`}>{s.soort}</span>
                <span className="[overflow-wrap:anywhere]">{s.nummer}</span>
                <span className="block text-[12px] opacity-60">{datum(s.datum)}</span>
              </span>
              <span className="font-mono tabular-nums">{euro(s.bedrag)}</span>
              <span className="flex gap-1">
                <form action={stukRond.bind(null, k.id, s.id, !s.rond)}>
                  <button className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${s.rond ? "border-inkt bg-inkt text-grond" : "border-lijn hover:border-oranje"}`}>
                    {s.rond ? (s.soort === "Factuur" ? "Betaald ✓" : "Akkoord ✓") : s.soort === "Factuur" ? "Betaald?" : "Akkoord?"}
                  </button>
                </form>
                <form action={stukWeg.bind(null, k.id, s.id)}>
                  <button aria-label={`${s.soort} ${s.nummer} weghalen`} className="px-2 opacity-40 hover:opacity-100">×</button>
                </form>
              </span>
            </li>
          ))}
          {!k.stukken.length && <li className="text-[13px] opacity-60">Nog niets.</li>}
        </ul>
        <p className="m-0 mt-4 text-[12px] opacity-60">De facturen zelf maak en boek je in DigiBoox; hier houd je bij wat er openstaat.</p>
      </section>
      <form action={nieuwStuk.bind(null, k.id)} className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 self-start rounded-[18px] border border-lijn p-5">
        <p className={`${lbl} col-span-2 m-0 opacity-60`}>Toevoegen</p>
        <select name="soort" aria-label="Soort" className={`${veld} bg-grond`}>
          <option>Factuur</option>
          <option>Offerte</option>
        </select>
        <input name="nummer" required placeholder="GR-F // 2026-…" aria-label="Nummer" className={veld} />
        <input name="bedrag" required inputMode="decimal" placeholder="€ incl. btw" aria-label="Bedrag" className={veld} />
        <input name="datum" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} aria-label="Datum" className={veld} />
        <button className="col-span-2 rounded-full border border-lijn px-4 py-2 text-[14px] font-semibold hover:border-oranje">+ Toevoegen</button>
      </form>
    </div>
  )
}

function Tijdlijn({ k }: { k: Klant }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-10">
      <ol className="m-0 list-none border-l border-lijn p-0 pl-6">
        {k.activiteit.map((a) => (
          <li key={a.id} className="relative pb-5">
            <span aria-hidden className={`absolute top-1.5 -left-[29px] size-[9px] rounded-full ${["Gesprek", "Bezoek", "Notitie"].includes(a.soort) ? "bg-oranje" : "bg-lijn"}`} />
            <p className={`${lbl} m-0 opacity-60`}>
              <time dateTime={a.datum}>{tijd(a.datum)}</time> · {a.soort} · {a.wie}
            </p>
            <p className="m-0 mt-1 whitespace-pre-line text-[14px] leading-[1.5]">{a.tekst}</p>
          </li>
        ))}
        {!k.activiteit.length && <li className="text-[14px] opacity-60">Nog niets op de tijdlijn. Gesprekken, fasewissels, opnames en calculaties komen hier vanzelf.</li>}
      </ol>
      <Notitie k={k} />
    </div>
  )
}

function Veld({ naam, label, waarde, type = "text", plaats }: { naam: string; label: string; waarde: string; type?: string; plaats?: string }) {
  return (
    <label className="grid gap-1 text-[13px]">
      {label}
      <input name={naam} type={type} defaultValue={waarde} placeholder={plaats} className={veld} />
    </label>
  )
}

function Keuze({ naam, label, waarde, opties }: { naam: string; label: string; waarde: string; opties: readonly string[] }) {
  return (
    <label className="grid gap-1 text-[13px]">
      {label}
      <select name={naam} defaultValue={waarde} className={`${veld} bg-grond`}>
        {opties.map((o) => (
          <option key={o} value={o}>{o || "—"}</option>
        ))}
      </select>
    </label>
  )
}

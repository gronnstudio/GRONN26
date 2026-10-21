import type { Metadata } from "next"
import Link from "next/link"
import { Assistent } from "@/components/beheer/assistent"
import { Facturen } from "@/components/beheer/facturen"
import { Kern } from "@/components/beheer/kern"
import { KleurKeuze } from "@/components/beheer/kleur"
import { Datum, Groet, Klok } from "@/components/beheer/klok"
import { Kopieer } from "@/components/beheer/kopieer"
import { POSTS, POSTTIJDEN, TEGELS, tegelVan } from "@/lib/beheer/social"
import { leesStand, opslagAan } from "@/lib/beheer/stand"
import { RECONSTRUCTIE, leesUren, weekTotaal } from "@/lib/beheer/uren"
import { aanvraagKlaar, bestellingKlaar, bonIngewisseld, bonVerstuurd, nieuweAanvraag, nieuwPlan, planWeg, zetGepost } from "./acties"
import { LEVERANCIERS, STAND } from "@/lib/beheer/leveranciers"
import { EIGEN_PAGINAS, KOPPELINGEN, OFFERTES, PROJECTEN, TE_BETALEN, TE_ONTVANGEN, TODOS } from "@/lib/beheer/data"
import { DOCUMENTEN } from "@/lib/data/legal"
import { euro } from "@/lib/format"

// Het dashboard achter de login, waar alles samenkomt (eigenaar, 6 okt 2026:
// "een jarvis achtig dashboard"). Opzet naar de Command Center in
// gronnstudio/gronncore, maar met alleen echte gegevens (src/lib/beheer/data.ts).
// Alleen voor de eigenaar: src/proxy.ts laat hier niemand anders in.
export const metadata: Metadata = {
  title: { absolute: "Dashboard · GRØNN Studio" },
  robots: { index: false, follow: false },
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]"

export const dynamic = "force-dynamic"

const veld = "min-w-0 rounded-[12px] border border-lijn bg-transparent px-3 py-2 text-[14px]"
const dag = (d: string) => new Date(`${d}T12:00`).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
const vandaag = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Amsterdam" })

// Tabbladen (eigenaar, 21 okt 2026: "dashboard wordt rommelig, maak tabbladen").
// Gewone links met ?tab=, net als op /dashboard/leveranciers.
const TABS = [
  { id: "vandaag", naam: "Vandaag" },
  { id: "klanten", naam: "Klanten" },
  { id: "geld", naam: "Geld en papieren" },
  { id: "social", naam: "Social" },
  { id: "links", naam: "Links" },
] as const

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab
  const actief = TABS.find((t) => t.id === tab)?.id ?? "vandaag"
  const stand = await leesStand()
  const urenTotaal = RECONSTRUCTIE.reduce((t, r) => t + weekTotaal(r), 0) + (await leesUren()).filter((r) => r.datum.startsWith("2026")).reduce((t, r) => t + r.uren, 0)
  const aandacht = PROJECTEN.filter((p) => p.aandacht)
  const lopend = PROJECTEN.filter((p) => p.fase !== "Opgeleverd")
  // Social (eigenaar, 10 okt 2026: "maak in dashboard een special stuk voor social
  // media"): de eerstvolgende post om te plaatsen, en wat daarna komt.
  const posts = POSTS.map((p, i) => ({ p, n: i + 1, t: TEGELS[tegelVan(i + 1)] }))
  const open = posts.filter(({ p }) => !p.gepost && !(p.map && stand.gepost[p.map]))
  const volgende = open.find(({ p }) => p.map)
  return (
    <div data-links className="min-h-svh bg-grond text-inkt">
      {/* bovenbalk */}
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-lijn px-5 py-4 md:px-8">
        <div className="flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="hidden h-[22px] w-auto dark:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt="GRØNN Studio" className="h-[22px] w-auto dark:hidden" />
          <span className={`${lbl} hidden text-oranje-tekst sm:inline`}>Dashboard · alleen eigenaar</span>
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

      {/* Tabbladen zoals in een browser (eigenaar, 21 okt 2026: "maak echte
          tabbladen zoals een browser dat doet, nu staan er knoppen"): het
          actieve blad heeft de kleur van de pagina en dekt de lijn eronder af. */}
      <div className="border-b border-lijn">
      <nav aria-label="Onderdelen" className="mx-auto -mb-px flex max-w-[1440px] items-end gap-1 overflow-x-auto px-5 pt-6 md:px-8">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "vandaag" ? "/dashboard" : `/dashboard?tab=${t.id}`}
            aria-current={t.id === actief ? "page" : undefined}
            className={`shrink-0 rounded-t-[12px] border border-b-0 px-5 text-[14px] font-semibold transition-colors ${
              t.id === actief
                ? "relative z-10 border-lijn bg-grond py-3 shadow-[0_2px_0_0_var(--grond)] before:absolute before:inset-x-4 before:top-0 before:h-[2px] before:rounded-full before:bg-oranje before:content-['']"
                : "border-transparent bg-inkt/[.05] py-2.5 opacity-75 hover:bg-inkt/[.09] hover:opacity-100"
            }`}
          >
            {t.naam}
            {t.id === "klanten" && stand.aanvragen.some((a) => !a.klaar) && (
              <span className="ml-1.5 text-oranje-tekst">{stand.aanvragen.filter((a) => !a.klaar).length}</span>
            )}
          </Link>
        ))}
      </nav>
      </div>

      <main className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-12 px-5 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {actief === "vandaag" && (<>
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
            <h1 className="syne m-0 mt-1 text-[clamp(36px,4vw,48px)] leading-[1.05]">
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
          <Link
            href="/dashboard/uren"
            className="group flex items-center justify-between gap-4 rounded-[18px] border border-lijn p-5 transition-colors hover:border-oranje"
          >
            <span>
              <span className={`${lbl} block opacity-60`}>Urenregistratie</span>
              <b className="syne mt-1 block text-[19px]">{urenTotaal.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} van 1.225 uur</b>
            </span>
            <span className="text-[13px] font-semibold transition-transform group-hover:translate-x-1">Invullen →</span>
          </Link>
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
        </>)}

        {actief === "social" && (<>
        {/* social */}
        <section className="lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className={`${lbl} m-0 opacity-60`}>Social · The KNIGHT move</p>
            <p className="m-0 text-[12px] opacity-60">
              {posts.length - open.length} gepost · {open.filter(({ p }) => p.map).length} klaar ·{" "}
              {open.filter(({ p }) => !p.map).length} nog te maken
            </p>
          </div>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {volgende ? (
              <div className="flex gap-5 rounded-[18px] border border-oranje/60 bg-oranje/10 p-5">
                <a href={`/dashboard/social#post-${volgende.n}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/social/${volgende.p.map}/1.jpg`} alt={volgende.p.titel} className="h-[150px] w-[120px] rounded-[10px] object-cover" />
                </a>
                <div className="flex min-w-0 flex-col justify-between gap-3">
                  <div>
                    <span className={`${lbl} text-oranje-tekst`}>Nu posten · {volgende.n}</span>
                    <b className="syne mt-1 block text-[19px] leading-[1.2]">{volgende.p.titel}</b>
                    <span className="mt-1 block text-[12px] opacity-70">
                      {volgende.t.emoji} {volgende.t.naam} · {volgende.p.reel ? "Reel" : `${volgende.p.slides ?? 1} beeld${(volgende.p.slides ?? 1) > 1 ? "en" : ""}`}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {volgende.p.caption && <Kopieer tekst={volgende.p.caption} />}
                    {opslagAan() && (
                      <form action={zetGepost.bind(null, volgende.p.map!, true)}>
                        <button className="knop-klein border border-inkt/30">Gepost ✓</button>
                      </form>
                    )}
                    <a href={`/dashboard/social#post-${volgende.n}`} className="text-[13px] font-semibold">Beelden ↓</a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="m-0 rounded-[18px] border border-lijn p-5 text-[14px] opacity-70">Alles wat klaar is, staat online.</p>
            )}
            <Link
              href="/dashboard/social"
              className="group flex flex-col justify-between gap-4 rounded-[18px] border border-lijn p-5 transition-colors hover:border-oranje"
            >
              <span className={`${lbl} opacity-60`}>Daarna</span>
              <ol className="m-0 grid min-w-0 list-none gap-1.5 p-0 text-[13px]">
                {open.filter((o) => o !== volgende).slice(0, 4).map(({ p, n, t }) => (
                  <li key={n} className="flex min-w-0 gap-2">
                    <span className="w-[22px] shrink-0 tabular-nums opacity-50">{n}</span>
                    <span aria-hidden>{t.emoji}</span>
                    <span className="min-w-0 truncate">{p.titel}</span>
                    {!p.map && <span className="ml-auto shrink-0 opacity-50">te maken</span>}
                  </li>
                ))}
              </ol>
              <span className="flex items-center justify-between text-[13px] font-semibold">
                Raster, alle posts en captions <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
          <p className={`${lbl} m-0 mt-5 opacity-60`}>Wanneer posten</p>
          <ul className="m-0 mt-3 grid list-none grid-cols-3 gap-3 p-0">
            {POSTTIJDEN.map((t) => (
              <li key={t.dag} className="rounded-[18px] border border-lijn p-4">
                <span className={`${lbl} opacity-60`}>{t.dag}</span>
                <b className="syne mt-1 block text-[22px] tabular-nums">{t.tijd}</b>
                <span className="mt-1 block text-[12px] leading-[1.4] opacity-60">{t.waarom}</span>
              </li>
            ))}
          </ul>
        </section>
        </>)}

        {actief === "klanten" && (<>
        {/* bestellingen: borderpakketten die online zijn betaald (Mollie); open en mislukt laat Mollie zien */}
        {stand.bestellingen.some((b) => b.status === "betaald") && (
        <section className="min-w-0 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className={`${lbl} m-0 opacity-60`}>Bestellingen · borderpakketten</p>
            <p className="m-0 text-[12px] opacity-60">{stand.bestellingen.filter((b) => b.status === "betaald" && !b.klaar).length} te doen</p>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
            {stand.bestellingen.filter((b) => b.status === "betaald").map((b) => (
              <li key={b.id} className={`rounded-[18px] border p-4 ${!b.klaar ? "border-oranje/60 bg-oranje/10" : "border-lijn opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <b className="font-semibold">{b.pakket} · {b.maat} m² · {b.soort}</b>
                    <span className="mt-0.5 block text-[12px] opacity-60">
                      {euro(b.bedrag)} · betaald · {dag(b.datum.slice(0, 10))}
                    </span>
                  </div>
                  <form action={bestellingKlaar.bind(null, b.id, !b.klaar)}>
                    <button className="knop-klein shrink-0 border border-inkt/30">{b.klaar ? "Terugzetten" : "Geleverd ✓"}</button>
                  </form>
                </div>
                <p className="m-0 mt-2 text-[13px] leading-[1.5]">
                  {b.naam} · <a href={`mailto:${b.email}`} className="text-oranje-tekst">{b.email}</a> · <a href={`tel:${b.telefoon.replace(/\s/g, "")}`} className="text-oranje-tekst">{b.telefoon}</a>
                  <br />
                  {b.adres}
                </p>
              </li>
            ))}
          </ul>
        </section>
        )}
        {/* cadeaubonnen: online betaald; het nummer staat op de bon die de klant laat zien */}
        {stand.bonnen.some((b) => b.status === "betaald") && (
        <section className="min-w-0 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className={`${lbl} m-0 opacity-60`}>Cadeaubonnen</p>
            <p className="m-0 text-[12px] opacity-60">{stand.bonnen.filter((b) => b.status === "betaald" && !b.ingewisseld).length} open</p>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
            {stand.bonnen.filter((b) => b.status === "betaald").map((b) => (
              <li key={b.id} className={`rounded-[18px] border p-4 ${!b.ingewisseld ? "border-oranje/60 bg-oranje/10" : "border-lijn opacity-60"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <b className="font-semibold tabular-nums">{b.nummer} · {euro(b.bedrag)}</b>
                    <span className="mt-0.5 block text-[12px] opacity-60">voor {b.voor} · van {b.van} · geldig t/m {b.geldigTot}</span>
                  </div>
                  <form action={bonIngewisseld.bind(null, b.id, !b.ingewisseld)}>
                    <button className="knop-klein shrink-0 border border-inkt/30">{b.ingewisseld ? "Terugzetten" : "Ingewisseld ✓"}</button>
                  </form>
                </div>
                <p className="m-0 mt-2 text-[13px] leading-[1.5]">
                  Gekocht door {b.naam} · <a href={`mailto:${b.email}`} className="text-oranje-tekst">{b.email}</a> · <a href={`/tuinen/cadeaubon/bon?b=${b.id}`} className="text-oranje-tekst">bon bekijken</a>
                </p>
                {b.adres && (
                  <div className="mt-2 flex items-center justify-between gap-3 text-[13px] leading-[1.5]">
                    <span>{b.verstuurd ? "Doosje verstuurd" : "In doosje versturen naar"} · {b.adres}</span>
                    <form action={bonVerstuurd.bind(null, b.id, !b.verstuurd)}>
                      <button className="knop-klein shrink-0 border border-inkt/30">{b.verstuurd ? "Terugzetten" : "Verstuurd ✓"}</button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
        )}
        {/* aanvragen */}
        <section className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <p className={`${lbl} m-0 opacity-60`}>Aanvragen · terugbellen</p>
            <p className="m-0 text-[12px] opacity-60">{stand.aanvragen.filter((a) => !a.klaar).length} open</p>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-3 p-0">
            {stand.aanvragen.map((a) => (
              <li key={a.id} className={`rounded-[18px] border p-4 ${a.klaar ? "border-lijn opacity-50" : "border-oranje/60 bg-oranje/10"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <b className="font-semibold">{a.naam}</b>
                    <span className="mt-0.5 block text-[12px] opacity-60">
                      {a.bron} · {dag(a.datum.slice(0, 10))}
                    </span>
                  </div>
                  <form action={aanvraagKlaar.bind(null, a.id, !a.klaar)}>
                    <button className="knop-klein shrink-0 border border-inkt/30">{a.klaar ? "Terugzetten" : "Gebeld ✓"}</button>
                  </form>
                </div>
                {a.contact && (
                  <a href={/^[\d\s+()-]+$/.test(a.contact) ? `tel:${a.contact.replace(/\s/g, "")}` : `mailto:${a.contact}`} className="mt-2 block break-all text-[14px] font-semibold text-oranje-tekst">
                    {a.contact}
                  </a>
                )}
                {a.foto && (
                  <a href={`/api/vijverfoto?id=${a.foto}`} target="_blank" rel="noreferrer" className="mt-3 block">
                    {/* eslint-disable-next-line @next/next/no-img-element -- privé foto achter de inlog, niet via next/image */}
                    <img src={`/api/vijverfoto?id=${a.foto}`} alt={`Vijverfoto van ${a.naam}`} loading="lazy" className="block max-h-[240px] w-full rounded-[12px] object-cover" />
                  </a>
                )}
                {a.wat && <p className="m-0 mt-2 whitespace-pre-line text-[13px] leading-[1.5] opacity-75">{a.wat}</p>}
              </li>
            ))}
            {!stand.aanvragen.length && <li className="text-[13px] opacity-60">Nog geen aanvragen. Het formulier op de site komt hier vanzelf binnen.</li>}
          </ul>
          <details className="mt-3 rounded-[18px] border border-lijn p-4">
            <summary className="cursor-pointer text-[13px] font-semibold">+ WhatsApp of telefoontje toevoegen</summary>
            <form action={nieuweAanvraag} className="mt-3 grid gap-2">
              <input name="naam" required placeholder="Naam" className={veld} />
              <input name="contact" placeholder="Telefoon of e-mail" className={veld} />
              <textarea name="wat" rows={2} placeholder="Waar gaat het over?" className={veld} />
              <div className="flex gap-2">
                <select name="bron" className={veld} defaultValue="WhatsApp">
                  <option>WhatsApp</option><option>Telefoon</option><option>Anders</option>
                </select>
                <button className="knop-klein bg-oranje text-[#202020]">Toevoegen</button>
              </div>
            </form>
          </details>
        </section>

        {/* planning */}
        <section className="min-w-0">
          <p className={`${lbl} m-0 opacity-60`}>Planning · komende weken</p>
          <ul className="m-0 mt-4 list-none p-0">
            {stand.planning.filter((p) => p.datum >= vandaag()).map((p) => (
              <li key={p.id} className="flex items-center gap-3 border-b border-lijn py-3">
                <span className={`${lbl} w-[92px] shrink-0 ${p.datum === vandaag() ? "text-oranje-tekst" : "opacity-60"}`}>{dag(p.datum)}</span>
                <span className="min-w-0 flex-1 text-[14px]">{p.wat}</span>
                <form action={planWeg.bind(null, p.id)}>
                  <button aria-label={`${p.wat} weghalen`} className="grid size-[32px] place-items-center rounded-full border border-lijn text-[13px]">✕</button>
                </form>
              </li>
            ))}
            {!stand.planning.some((p) => p.datum >= vandaag()) && <li className="py-3 text-[13px] opacity-60">Nog niets gepland.</li>}
          </ul>
          <form action={nieuwPlan} className="mt-3 flex flex-wrap gap-2">
            <input type="date" name="datum" required defaultValue={vandaag()} className={`${veld} w-full sm:w-auto`} />
            <input name="wat" required placeholder="Wat en waar" className={`${veld} min-w-[160px] flex-1`} />
            <button className="knop-klein bg-oranje text-[#202020]">Plannen</button>
          </form>
        </section>
        </>)}

        {actief === "geld" && (<>
        {/* facturen */}
        <Facturen
          groepen={[
            { titel: "Facturen · Te ontvangen", lijst: TE_ONTVANGEN },
            { titel: "Facturen · Te betalen", lijst: TE_BETALEN },
            { titel: "Offertes", lijst: OFFERTES, klaar: "geaccepteerd", vervalt: "geldig tot" },
          ]}
        />

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
        <p className="m-0 text-[11px] opacity-40 lg:col-span-2">
          Projecten en to-do&apos;s staan in src/lib/beheer/data.ts. Open offertes samen:{" "}
          {euro(PROJECTEN.filter((p) => p.fase === "Offerte").reduce((s, p) => s + (p.bedrag ?? 0), 0))}.
        </p>
        </>)}

        {actief === "links" && (<>
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
        {/* eigen pagina's */}
        <section className="lg:col-span-2">
          <p className={`${lbl} m-0 opacity-60`}>Eigen pagina&apos;s · niet in het menu</p>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-6">
            {EIGEN_PAGINAS.map((k) => (
              <li key={k.naam}>
                <Link
                  href={k.href}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[18px] border border-lijn p-4 transition-colors hover:border-oranje"
                >
                  <span className="syne text-[17px]">{k.naam}</span>
                  <span className="flex items-center justify-between text-[12px] opacity-60">
                    {k.uitleg} <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {/* leveranciers */}
        <section className="lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className={`${lbl} m-0 opacity-60`}>Leveranciers · zakelijke accounts</p>
            <Link href="/dashboard/leveranciers" className="text-[13px] font-semibold text-oranje-tekst">Alle leveranciers →</Link>
          </div>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {LEVERANCIERS.map((k) => (
              <li key={k.naam}>
                <a
                  href={k.href}
                  {...(k.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex h-full flex-col justify-between gap-6 rounded-[18px] border border-lijn p-4 transition-colors hover:border-oranje"
                >
                  <span className="syne text-[17px]">{k.naam}</span>
                  <span className="flex items-end justify-between gap-2 text-[12px]">
                    <span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span aria-hidden className={`grid size-[18px] place-items-center rounded-full text-[11px] font-bold ${STAND[k.account].bol}`}>
                          {STAND[k.account].teken}
                        </span>
                        {STAND[k.account].naam}
                      </span>
                      <span className="mt-1 block opacity-60">{k.wat}</span>
                    </span>
                    <span className="opacity-60 transition-transform group-hover:translate-x-0.5">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        </>)}
      </main>
    </div>
  )
}

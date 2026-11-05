import type { Metadata } from "next"
import { faseBadge } from "@/lib/crm/klant"
import Link from "next/link"
import { VerwijderKnop } from "@/components/crm/verwijder-knop"
import { calculatieWeg } from "@/app/dashboard/calculatie/acties"
import { notFound } from "next/navigation"
import { FaseBalk, Kop, Tabs } from "@/components/crm/kop"
import { GrønnKnop } from "@/components/crm/gronn-knop"
import { BRONNEN, KLANT_FASEN, KLANT_SOORTEN, PRIORITEITEN, VERLOREN_REDENEN, VOORKEUREN, betaalstand, geld, geplandeUren, hoortBij, leesKlanten, sleutel, type Klant, type Stuk } from "@/lib/beheer/klanten"
import { vandaagNL } from "@/lib/crm/overzicht"
import { telling, type Vragenlijst } from "@/lib/crm/vragenlijst"
import { leesVragenlijst } from "@/lib/beheer/vragenlijst"
import { toonDecimaal, toonEuro } from "@/lib/crm/geld"
import { leesUren } from "@/lib/beheer/uren"
import { leesInkoop } from "@/lib/beheer/inkoop"
import { naInkoop } from "@/lib/crm/inkoop"
import { InkoopTabel } from "@/components/crm/inkoop-tabel"
import { InkoopFormulier } from "@/components/crm/inkoop-formulier"
import { euro } from "@/lib/format"
import { bewaarKlant, klantWeg, nieuweNotitie, nieuweTuin, nieuwStuk, stukHerinnerd, stukRond, stukWeg } from "../acties"
import { BewaarKnop } from "@/components/crm/bewaar-knop"
import { AdresVeld } from "@/components/adres-veld"
import { KopieerKnop } from "@/components/crm/kopieer-knop"
import { MailKnop } from "@/components/crm/mail-knop"
import { mailVoor, mailtoLink, type MailSoort } from "@/lib/crm/mail"
import { trekOfferteIn } from "../offerte-acties"
import { maakFactuur } from "../factuur-acties"
import { haalWerkbonWeg, maakWerkbon } from "../werkbon-acties"
import { leesWerkbonnen } from "@/lib/beheer/werkbon"
import { volgendFactuurNummer } from "@/lib/crm/factuur-reken"
import { klusdagen } from "@/lib/crm/agenda"

// De klantkaart: één werkplek per klant, met tabbladen (masterprompt CRM,
// module 02: Overzicht | Tuinen | Calculaties | Stukken | Activiteit). Gewone
// links met ?tab=, net als op het dashboard.
export const metadata: Metadata = { title: "Klant" }
export const dynamic = "force-dynamic"

const lbl = "crm-label"
const veld = "crm-veld"
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
  const [klanten, lijst] = await Promise.all([leesKlanten(), leesVragenlijst()])
  const k = klanten.find((x) => x.id === id)
  if (!k) notFound()
  const actief = TABS.find((t) => t.id === tab)?.id ?? "overzicht"
  const g = geld(k)
  const tel = { tuinen: k.tuinen.length, calculaties: k.calculaties.length, projecten: k.projecten.length, stukken: k.stukken.length, activiteit: k.activiteit.length } as Record<string, number>

  // De kopfoto: de nieuwste Na-foto, anders de nieuwste opnamefoto, van welke tuin ook.
  const fotos = k.tuinen.flatMap((t) => t.fotos).sort((a, b) => b.datum.localeCompare(a.datum))
  const kopFoto = fotos.find((f) => f.moment === "Na") ?? fotos.find((f) => f.moment === "Opname") ?? fotos[0]

  return (
    <>
      {kopFoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/crm/foto?id=${kopFoto.id}`} alt={kopFoto.bijschrift || `Tuin van ${k.naam}`} className="block h-[140px] w-full object-cover sm:h-[180px] print:hidden" />
      )}
      <Kop
        pad={[{ naam: "Klanten", href: "/dashboard/klanten" }, { naam: k.naam }]}
        titel={k.naam}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            <span className={faseBadge(k.fase)}>{k.fase}</span>
            <span>{[k.soort, k.plaats, k.wat].filter(Boolean).join(" · ")}</span>
            <span className="mt-2 block w-full max-w-[640px]"><FaseBalk fasen={KLANT_FASEN} nu={k.fase} /></span>
          </span>
        }
      >
        <dl className="crm-paneel m-0 mr-2 grid min-w-0 flex-1 grid-cols-2 divide-lijn sm:min-w-[760px] sm:grid-cols-4 sm:divide-x">
          {[
            [euro(g.akkoord), "akkoord"],
            [euro(g.gefactureerd), "gefactureerd"],
            [euro(g.betaald), "betaald"],
            [euro(g.open), "open"],
          ].map(([n, t]) => (
            <div key={t} className="min-h-[72px] px-4 py-2">
              <dt className="crm-label">{t}</dt>
              <dd className={`crm-cijfer m-0 text-[15px] ${t === "open" && g.open > 0 ? "text-let" : ""}`}>{n}</dd>
              {t === "akkoord" && g.teFactureren > 0 && <dd className="m-0 text-[11px] text-gedempt">nog {euro(g.teFactureren)} te factureren</dd>}
            </div>
          ))}
        </dl>
        <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw`} className="crm-knop">+ Calculatie</Link>
      </Kop>
      <Tabs
        label="Klantkaart"
        tabs={TABS.map((t) => ({ id: t.id, naam: t.naam, aantal: tel[t.id] }))}
        actief={actief}
        href={(t) => (t === "overzicht" ? `/dashboard/klanten/${k.id}` : `/dashboard/klanten/${k.id}?tab=${t}`)}
      />
      <main className="mx-auto max-w-[1440px] px-8 py-6">
        {bestond && (
          <p role="status" data-stil className="crm-let m-0 mb-6 px-4 py-2 text-[14px]">
            Deze klant bestond al (zelfde naam, e-mail of telefoon). Je ziet de bestaande kaart.
          </p>
        )}
        {actief === "overzicht" && <Overzicht k={k} />}
        {actief === "tuinen" && <Tuinen k={k} lijst={lijst} />}
        {actief === "calculaties" && <Calculaties k={k} />}
        {actief === "stukken" && <Stukken k={k} nummer={volgendFactuurNummer(klanten, vandaagNL())} />}
        {actief === "activiteit" && <Tijdlijn k={k} />}
      </main>
    </>
  )
}

async function Overzicht({ k }: { k: Klant }) {
  const g = geld(k)
  const [alleUren, alleInkoop] = await Promise.all([leesUren(), leesInkoop()])
  const uren = alleUren.filter((r) => hoortBij(k, r.klant))
  const urenTotaal = uren.reduce((t, r) => t + r.uren, 0)
  const inkoop = alleInkoop.filter((i) => i.klantId === k.id)
  const na = naInkoop(g.gefactureerd, inkoop.reduce((t, i) => t + i.bedrag, 0), urenTotaal)
  // Nacalculatie in het klein: wat er per gewerkt uur binnenkwam (excl. 21 % btw, schatting).
  const perUur = urenTotaal && g.gefactureerd ? g.gefactureerd / 1.21 / urenTotaal : 0
  // Gewerkt tegenover gepland (idee uit Plancraft): de nieuwste planning per calculatie × 8 uur per dag.
  const gepland = geplandeUren(k)
  const deel = gepland ? Math.round((urenTotaal / gepland) * 100) : 0
  const dagen = klusdagen([k]).map((d) => d.datum).sort()
  return (
    <>
    <Infokaarten k={k} uren={urenTotaal} gepland={gepland} deel={deel} dagen={dagen} />
    <div className="grid @min-[1060px]:grid-cols-[minmax(0,1fr)_420px] gap-10">
      <form key={sleutel({ ...k, activiteit: 0, stukken: 0, tuinen: 0, calculaties: 0, projecten: 0 })} action={bewaarKlant.bind(null, k.id)} className="flex flex-col gap-6">
        <fieldset className="m-0 grid grid-cols-3 gap-4 border-0 p-0">
          <legend className={`${lbl} mb-3`}>Contact</legend>
          <Veld naam="naam" label="Naam" waarde={k.naam} />
          <Keuze naam="soort" label="Soort contact" waarde={k.soort} opties={KLANT_SOORTEN} />
          <Veld naam="bedrijf" label="Bedrijf" waarde={k.bedrijf} />
          <Veld naam="telefoon" label="Telefoon" waarde={k.telefoon} type="tel" />
          <Veld naam="email" label="E-mail" waarde={k.email} type="email" />
          <Keuze naam="voorkeur" label="Liefst via" waarde={k.voorkeur} opties={["", ...VOORKEUREN]} />
          <AdresVeld naam="adres" label="Factuuradres" waarde={k.adres} className={veld} />
          <Veld naam="plaats" label="Plaats" waarde={k.plaats} />
          <Veld naam="tags" label="Tags, met komma's (onderhoud: elk seizoen in de planning)" waarde={k.tags.join(", ")} />
          {k.contact && <Veld naam="contact" label="Oud contactveld" waarde={k.contact} />}
        </fieldset>

        <fieldset className="m-0 grid grid-cols-3 gap-4 border-0 p-0">
          <legend className={`${lbl} mb-3`}>Lead en klus</legend>
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
          <BewaarKnop>Bewaren</BewaarKnop>
          {k.stukken.some((s) => s.factuur) ? (
            <span className="text-[12px] text-gedempt">Heeft facturen, blijft bewaard</span>
          ) : (
            <button formAction={klantWeg.bind(null, k.id)} className="crm-knop-stil hover:!text-let">Klant verwijderen</button>
          )}
        </div>
      </form>

      <aside className="flex flex-col gap-6">
        <section className="crm-paneel p-5">
          <p className={`${lbl} m-0`}>Contact opnemen</p>
          <div className="mt-3 grid gap-2">
            {k.telefoon && <a href={`tel:${k.telefoon.replace(/\s/g, "")}`} className="crm-knop-rand justify-start">Bel {k.telefoon}</a>}
            {k.telefoon && <a href={`https://wa.me/${k.telefoon.replace(/\D/g, "").replace(/^0/, "31")}`} className="crm-knop-rand justify-start">WhatsApp</a>}
            {k.email && <a href={`mailto:${k.email}`} className="crm-knop-rand justify-start">Mail {k.email}</a>}
            {!k.telefoon && !k.email && <p className="m-0 text-[13px] text-gedempt">Nog geen telefoon of e-mail. Vul ze links in.</p>}
          </div>
        </section>
        <GrønnKnop />
        <Notitie k={k} />
        <section className="crm-paneel p-5">
          <div className="flex items-baseline justify-between">
            <p className={`${lbl} m-0`}>Uren uit je registratie</p>
            <Link href="/dashboard/uren" className="text-[12px] text-accent-tekst">Uren invullen →</Link>
          </div>
          <p className="crm-cijfer m-0 mt-2 text-[22px]">
            {urenTotaal.toLocaleString("nl-NL")} uur
            {gepland > 0 && <span className="text-[14px] text-gedempt"> van {gepland.toLocaleString("nl-NL")} gepland</span>}
          </p>
          {gepland > 0 && (
            <>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-lijn" role="img" aria-label={`${deel} % van de geplande uren gewerkt`}>
                <div className={`h-full rounded-full ${deel > 100 ? "bg-let" : "bg-accent"}`} style={{ width: `${Math.min(100, deel)}%` }} />
              </div>
              <p className={`m-0 mt-1 text-[13px] ${deel > 100 ? "font-semibold text-let" : "text-gedempt"}`}>
                {deel} % van de planning{deel > 100 ? `, ${(urenTotaal - gepland).toLocaleString("nl-NL")} uur over` : ""}
              </p>
            </>
          )}
          {perUur > 0 && !inkoop.length && (
            <p className={`m-0 text-[13px] ${perUur < 37 ? "font-semibold text-let" : "text-gedempt"}`}>± {euro(perUur)} per uur gefactureerd (excl. btw, inclusief materiaal)</p>
          )}
          <ul className="m-0 mt-3 grid max-h-[240px] list-none gap-1 overflow-y-auto p-0 text-[13px]">
            {uren.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{datum(r.datum)} · {r.wat || r.soort}</span>
                <span className="tabular-nums">{r.uren} u</span>
              </li>
            ))}
            {!uren.length && <li className="text-gedempt">Geen uren gevonden met deze naam in het veld Klant.</li>}
          </ul>
        </section>
        <section className="crm-paneel p-5" aria-labelledby="nacalculatie">
          <div className="flex items-baseline justify-between">
            <p id="nacalculatie" className={`${lbl} m-0`}>Nacalculatie</p>
            <Link href="/dashboard/inkoop" className="text-[12px] text-accent-tekst">Alle inkoop →</Link>
          </div>
          <dl className="m-0 mt-3 grid gap-1 text-[13px]">
            <div className="flex justify-between"><dt>Gefactureerd excl. btw <span className="text-gedempt">(geschat op 21 %)</span></dt><dd className="crm-cijfer m-0">{toonEuro(na.omzet)}</dd></div>
            <div className="flex justify-between"><dt>Inkoop excl. btw</dt><dd className="crm-cijfer m-0">− {toonEuro(na.inkoop)}</dd></div>
            <div className="flex justify-between border-t border-lijn pt-1 font-semibold"><dt>Over voor je werk</dt><dd className={`crm-cijfer m-0 ${na.over < 0 ? "text-let" : ""}`}>{toonEuro(na.over)}</dd></div>
            {na.perUur !== 0 && <div className="flex justify-between"><dt>Per gewerkt uur</dt><dd className={`crm-cijfer m-0 ${na.perUur < 3700 ? "font-semibold text-let" : ""}`}>{toonEuro(na.perUur)}</dd></div>}
          </dl>
          {inkoop.length > 0 && <div className="mt-3 overflow-x-auto"><InkoopTabel lijst={inkoop} naam={new Map()} nu={vandaagNL()} zonderKlant /></div>}
          <details className="mt-3">
            <summary className="cursor-pointer text-[13px] text-accent-tekst">Inkoopfactuur toevoegen</summary>
            <div className="mt-3"><InkoopFormulier klanten={[{ id: k.id, naam: k.naam }]} leveranciers={[...new Set(alleInkoop.map((i) => i.leverancier))]} vandaag={vandaagNL()} klantId={k.id} /></div>
          </details>
        </section>
      </aside>
    </div>
    </>
  )
}

/**
 * De kop van de klantkaart als projectpagina (Plancraft, 5 nov 2026): vier kaarten met wat je
 * het vaakst zoekt. Uren gewerkt tegenover gepland als ring, de klant, wanneer en waar.
 */
function Infokaarten({ k, uren, gepland, deel, dagen }: { k: Klant; uren: number; gepland: number; deel: number; dagen: string[] }) {
  const over = deel > 100
  const r = 26
  const omtrek = 2 * Math.PI * r
  const waar = [k.adres, k.plaats].filter(Boolean).join(", ")
  const kaart = "crm-paneel min-w-0 p-4"
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 @min-[1060px]:grid-cols-4">
      <section aria-label="Gewerkte uren" className={`${kaart} flex items-center gap-4`}>
        <svg viewBox="0 0 64 64" className="size-[64px] shrink-0 -rotate-90" aria-hidden>
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--lijn)" strokeWidth="7" />
          {gepland > 0 && <circle cx="32" cy="32" r={r} fill="none" stroke={over ? "var(--let)" : "var(--accent)"} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(Math.min(100, deel) / 100) * omtrek} ${omtrek}`} />}
        </svg>
        <div className="min-w-0">
          <p className={`${lbl} m-0`}>Gewerkte uren</p>
          <p className="crm-cijfer m-0 mt-1 text-[20px]">{uren.toLocaleString("nl-NL")} u</p>
          <p className={`m-0 text-[12px] ${over ? "font-semibold text-let" : "text-gedempt"}`}>{gepland ? `${deel} % van ${gepland.toLocaleString("nl-NL")} u gepland` : "Nog geen planning in een calculatie"}</p>
        </div>
      </section>
      <section aria-label="Klant" className={kaart}>
        <p className={`${lbl} m-0`}>Klant</p>
        <p className="m-0 mt-1 truncate font-semibold">{k.naam}{k.bedrijf ? <span className="font-normal text-gedempt"> · {k.bedrijf}</span> : null}</p>
        {k.telefoon ? <a href={`tel:${k.telefoon.replace(/\s/g, "")}`} className="block truncate text-[13px] hover:text-accent-tekst">{k.telefoon}</a> : <span className="block text-[13px] text-gedempt">Geen telefoon</span>}
        {k.email ? <a href={`mailto:${k.email}`} className="block truncate text-[13px] hover:text-accent-tekst">{k.email}</a> : <span className="block text-[13px] text-gedempt">Geen e-mail</span>}
      </section>
      <section aria-label="Tijdsbestek" className={kaart}>
        <p className={`${lbl} m-0`}>Tijdsbestek</p>
        {dagen.length ? (
          <>
            <p className="crm-cijfer m-0 mt-1 font-semibold">{datum(dagen[0])} – {datum(dagen.at(-1)!)}</p>
            <p className="m-0 text-[12px] text-gedempt">{dagen.length} {dagen.length === 1 ? "werkdag" : "werkdagen"} gepland</p>
          </>
        ) : (
          <p className="m-0 mt-1 text-[13px] text-gedempt">Nog niet ingepland. Zet een startdatum in de planning van de calculatie.</p>
        )}
        {k.opvolgen && <p className="m-0 mt-1 text-[12px]">Opvolgen {datum(k.opvolgen)}</p>}
      </section>
      <section aria-label="Locatie" className={kaart}>
        <p className={`${lbl} m-0`}>Locatie</p>
        {waar ? (
          <>
            <p className="m-0 mt-1 text-[13px] [overflow-wrap:anywhere]">{waar}</p>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(waar)}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[13px] font-semibold text-accent-tekst">Route ↗</a>
          </>
        ) : (
          <p className="m-0 mt-1 text-[13px] text-gedempt">Nog geen adres. Vul het hieronder in.</p>
        )}
      </section>
    </div>
  )
}

function Notitie({ k }: { k: Klant }) {
  return (
    <section className="crm-paneel p-5">
      <p className={`${lbl} m-0`}>Gesprek of bezoek vastleggen</p>
      <form action={nieuweNotitie.bind(null, k.id)} className="mt-3 grid gap-2">
        <select name="soort" aria-label="Soort" className={`${veld}`}>
          <option>Gesprek</option>
          <option>Bezoek</option>
          <option>Notitie</option>
        </select>
        <textarea name="tekst" required rows={3} aria-label="Wat is er besproken" placeholder="Wat is er besproken of afgesproken?" className={`${veld} resize-y`} />
        <button className="crm-knop-rand">+ Op de tijdlijn</button>
      </form>
    </section>
  )
}

function Tuinen({ k, lijst }: { k: Klant; lijst: Vragenlijst }) {
  return (
    <div className="grid @min-[1060px]:grid-cols-[minmax(0,1fr)_380px] gap-10">
      <ul className="m-0 grid list-none grid-cols-2 gap-4 self-start p-0">
        {k.tuinen.map((t) => {
          const n = telling(lijst, t)
          return (
            <li key={t.id} className="crm-paneel p-5">
              <Link href={`/dashboard/klanten/${k.id}/tuin/${t.id}`} className="syne text-[22px] hover:text-accent-tekst">{t.naam}</Link>
              {t.adres && <p className="m-0 mt-1 text-[13px] text-gedempt">{t.adres}</p>}
              <p className="m-0 mt-3 text-[13px]">
                Opname: {n.gevuld} van {n.van} vragen · {t.fotos.length} foto{t.fotos.length === 1 ? "" : "'s"}
                {t.antwoorden.oppervlak && <> · {t.antwoorden.oppervlak} m²</>}
              </p>
              {t.diensten.length > 0 && <p className="m-0 mt-1 text-[13px] text-gedempt">{t.diensten.join(", ")}</p>}
              <p className="m-0 mt-2 text-[12px] text-gedempt">Bijgewerkt {datum(t.bijgewerkt)}</p>
            </li>
          )
        })}
        {!k.tuinen.length && <li className="col-span-2 rounded-[18px] border border-dashed border-lijn p-8 text-center text-[14px] text-gedempt">Nog geen tuin. Voeg er een toe en doe de opname: maten, grond, toegang en foto&apos;s.</li>}
      </ul>
      <form action={nieuweTuin.bind(null, k.id)} className="flex flex-col gap-3 self-start crm-paneel p-5">
        <p className={`${lbl} m-0`}>Tuin of perceel toevoegen</p>
        <Veld naam="naam" label="Naam" waarde="" plaats="bijv. Achtertuin" />
        <Veld naam="adres" label="Adres van de tuin" waarde={k.adres} />
        <button className="crm-knop">+ Tuin en opname</button>
      </form>
    </div>
  )
}

function Calculaties({ k }: { k: Klant }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href={`/dashboard/klanten/${k.id}/calculatie/nieuw`} className="crm-knop">+ Nieuwe calculatie</Link>
      </div>
      <table className="crm-tabel">
        <thead>
          <tr>
            {["Calculatie", "Tuin", "Versies", "Laatst", "Overhouden", "Totaal incl. btw"].map((h, i) => (
              <th key={h} className={`${i > 3 ? "text-right" : ""}`}>{h}</th>
            ))}
            <th><span className="sr-only">Verwijderen</span></th>
          </tr>
        </thead>
        <tbody>
          {k.calculaties.map((c) => {
            const v = c.versies.at(-1)
            return (
              <tr key={c.id}>
                <td className="pr-4"><Link href={`/dashboard/klanten/${k.id}/calculatie/${c.id}`} className="font-semibold hover:text-accent-tekst">{c.titel}</Link></td>
                <td className="pr-4">{k.tuinen.find((t) => t.id === c.tuinId)?.naam ?? ""}</td>
                <td className="tabular-nums">{c.versies.length}</td>
                <td className="pr-4">{v ? tijd(v.datum) : ""}</td>
                <td className="text-right crm-cijfer">{v ? toonEuro(v.winst) : ""}</td>
                <td className="text-right crm-cijfer">{v ? toonEuro(v.totaal) : ""}</td>
                <td className="pl-4 text-right">
                  <VerwijderKnop actie={calculatieWeg.bind(null, k.id, c.id)} wat="deze calculatie" />
                </td>
              </tr>
            )
          })}
          {!k.calculaties.length && (
            <tr>
              <td colSpan={7} className="py-6 text-center text-gedempt">Nog geen calculatie. Een nieuwe begint met de maten uit de opname.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Projecten({ k }: { k: Klant }) {
  return (
    <ul className="m-0 grid list-none gap-2 p-0 text-[14px]">
      {k.projecten.map((p) => {
        const klaar = p.taken.filter((t) => t.klaar).length
        return (
          <li key={p.id} className="flex flex-wrap items-baseline gap-3 border-b border-lijn pb-2">
            <Link href={`/dashboard/klanten/${k.id}/project/${p.id}`} className="font-semibold hover:text-accent-tekst">{p.titel === "Calculatie" ? (k.calculaties.find((c) => c.id === p.calculatieId)?.titel ?? p.titel) : p.titel}</Link>
            <span className="text-gedempt">{p.wanneer ? `gepland ${p.wanneer}` : `gestart ${datum(p.gestart)}`}</span>
            <span className="ml-auto crm-cijfer">{p.opgeleverd ? `opgeleverd ${datum(p.opgeleverd)}` : `${klaar} van ${p.taken.length} taken`}</span>
          </li>
        )
      })}
      {!k.projecten.length && <li className="py-6 text-center text-gedempt">Nog geen project. Start er een vanuit een calculatie, na akkoord.</li>}
    </ul>
  )
}

/** Open, te laat of herinnerd, volgens de betaaltermijn uit de voorwaarden (14 dagen). */
function Betaalstand({ s }: { s: Stuk }) {
  const b = betaalstand(s, vandaagNL())
  if (b.stand === "open") return <span className="block text-[12px] text-gedempt">Vervalt {datum(b.vervalt)}</span>
  if (b.stand === "te laat") return <span className="block text-[12px] font-semibold text-let">{b.dagen} {b.dagen === 1 ? "dag" : "dagen"} te laat · stuur een kosteloze herinnering</span>
  if (b.stand === "herinnerd")
    return (
      <span className={`block text-[12px] ${b.voorbij ? "font-semibold text-let" : "text-gedempt"}`}>
        Herinnerd {datum(b.herinnerd)} · uiterlijk {datum(b.uiterlijk)}
        {b.voorbij && " · nu mogen rente en incassokosten"}
      </span>
    )
  return null
}

async function Stukken({ k, nummer }: { k: Klant; nummer: string }) {
  const [alleBonnen, alleUren] = await Promise.all([leesWerkbonnen(), leesUren()])
  const bonnen = alleBonnen.filter((w) => w.klantId === k.id)
  const vandaag = vandaagNL()
  const urenVandaag = alleUren.filter((r) => r.datum === vandaag && hoortBij(k, r.klant)).reduce((t, r) => t + r.uren, 0)
  const offertes = k.stukken.filter((s) => s.soort === "Offerte" && s.link && s.rond)
  return (
    <div className="grid @min-[1060px]:grid-cols-[minmax(0,1fr)_380px] gap-10">
      <section>
        <p className={`${lbl} m-0`}>Offertes en facturen · incl. btw</p>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[14px]">
          {k.stukken.map((s) => (
            <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-lijn pb-2">
              <span className="min-w-0">
                <span className={`${lbl} mr-2 text-gedempt`}>{s.soort}</span>
                <span className="[overflow-wrap:anywhere]">{s.nummer}</span>
                <span className="block text-[12px] text-gedempt">{datum(s.datum)}</span>
                {s.soort === "Factuur" && !s.rond && <Betaalstand s={s} />}
                {s.factuur && (
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Mail k={k} soort={s.herinnerd && !s.rond ? "herinnering" : "factuur"} nummer={s.nummer} pad={`/factuur/${s.factuur}`} bedrag={euro(s.bedrag)} wat={`${s.herinnerd && !s.rond ? "Herinnering" : "Factuur"} ${s.nummer}`} />
                    <KopieerKnop tekst={`/factuur/${s.factuur}`} />
                    <a href={`/factuur/${s.factuur}`} className="crm-knop-stil crm-knop-klein">{s.herinnerd && !s.rond ? "Herinnering bekijken" : "Factuur bekijken"}</a>
                  </span>
                )}
                {s.link && (
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {!s.rond && <Mail k={k} soort="offerte" nummer={s.nummer} pad={`/offerte/${s.link}`} wat={`Offerte ${s.nummer}`} />}
                    <KopieerKnop tekst={`/offerte/${s.link}`} />
                    <a href={`/offerte/${s.link}`} className="crm-knop-stil crm-knop-klein">Bekijk als klant</a>
                    <a href={`/offerte/${s.link}?specificatie=1`} className="crm-knop-stil crm-knop-klein">Specificatie voor factuur</a>
                    {!s.rond && (
                      <form action={trekOfferteIn.bind(null, k.id, s.link)}>
                        <button className="crm-knop-stil crm-knop-klein">Intrekken</button>
                      </form>
                    )}
                  </span>
                )}
              </span>
              <span className="crm-cijfer">{euro(s.bedrag)}</span>
              <span className="flex flex-wrap justify-end gap-1">
                {s.soort === "Factuur" && !s.rond && ["te laat", "herinnerd"].includes(betaalstand(s, vandaagNL()).stand) && (
                  <form action={stukHerinnerd.bind(null, k.id, s.id, !s.herinnerd)}>
                    <button className="rounded-full border border-lijn px-3 py-1 text-[12px] font-semibold hover:border-accent">
                      {s.herinnerd ? "Herinnering terug" : "Herinnering verstuurd"}
                    </button>
                  </form>
                )}
                <form action={stukRond.bind(null, k.id, s.id, !s.rond)}>
                  <button className={`rounded-full border px-3 py-1 text-[12px] font-semibold ${s.rond ? "border-accent bg-accent text-op-accent" : "border-lijn hover:border-accent"}`}>
                    {s.rond ? (s.soort === "Factuur" ? "Betaald ✓" : "Akkoord ✓") : s.soort === "Factuur" ? "Betaald?" : "Akkoord?"}
                  </button>
                </form>
                {!s.factuur && (
                  <form action={stukWeg.bind(null, k.id, s.id)}>
                    <button aria-label={`${s.soort} ${s.nummer} weghalen`} className="px-2 opacity-40 hover:opacity-100">×</button>
                  </form>
                )}
              </span>
            </li>
          ))}
          {!k.stukken.length && <li className="text-[13px] text-gedempt">Nog niets.</li>}
        </ul>
        <p className="m-0 mt-4 text-[12px] text-gedempt">Maak de factuur hiernaast; de klant krijgt een link met betaalknop en QR-code. Boeken blijft in DigiBoox.</p>

        <p className={`${lbl} m-0 mt-10`}>Werkbonnen</p>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-[14px]">
          {bonnen.map((w) => (
            <li key={w.token} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-lijn pb-2">
              <span className="min-w-0">
                <span className={`${lbl} mr-2 text-gedempt`}>Werkbon</span>
                {w.nummer}
                <span className="block truncate text-[12px] text-gedempt">{datum(w.datum)} · {w.werk}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {!w.getekend && <Mail k={k} soort="werkbon" nummer={w.nummer} pad={`/werkbon/${w.token}`} wat={`Werkbon ${w.nummer}`} />}
                  <KopieerKnop tekst={`/werkbon/${w.token}`} />
                  <a href={`/werkbon/${w.token}`} className="crm-knop-stil crm-knop-klein">{w.getekend ? "Bekijken" : "Laten tekenen"}</a>
                </span>
              </span>
              <span className="flex items-center gap-1">
                {w.getekend ? <span className="crm-badge crm-badge-goed">Getekend door {w.getekend.naam}</span> : <span className="crm-badge">Niet getekend</span>}
                <form action={haalWerkbonWeg.bind(null, w.token)}>
                  <button aria-label={`Werkbon ${w.nummer} weghalen`} className="px-2 opacity-40 hover:opacity-100">×</button>
                </form>
              </span>
            </li>
          ))}
          {!bonnen.length && <li className="text-[13px] text-gedempt">Nog geen werkbonnen. Maak er een op de dag zelf en laat de klant tekenen op je telefoon.</li>}
        </ul>
      </section>
      <div className="flex flex-col gap-6 self-start">
      <form action={maakFactuur.bind(null, k.id)} className="crm-paneel grid gap-3 p-5">
        <p className={`${lbl} m-0`}>Factuur maken</p>
        <label className="grid gap-1 text-[13px]">
          Waar komt hij uit?
          <select name="bron" className={veld} defaultValue={offertes.at(-1)?.link ?? ""}>
            {offertes.map((o) => <option key={o.id} value={o.link}>Termijn van offerte {o.nummer} ({euro(o.bedrag)})</option>)}
            <option value="">Vrije factuur, één regel</option>
          </select>
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
          <label className="grid gap-1 text-[13px]">Naam van de termijn<input name="label" placeholder="Termijn 1 van 3" className={veld} /></label>
          <label className="grid gap-1 text-[13px]">Deel (%)<input name="procent" inputMode="decimal" defaultValue="100" className={veld} /></label>
        </div>
        <details className="text-[13px]">
          <summary className="cursor-pointer text-accent-tekst">Bij een vrije factuur</summary>
          <div className="mt-2 grid gap-2">
            <label className="grid gap-1">Omschrijving<input name="omschrijving" placeholder="Snoeiwerk 4 november" className={veld} /></label>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-2">
              <label className="grid gap-1">Bedrag (€)<input name="bedrag" inputMode="decimal" className={veld} /></label>
              <label className="grid gap-1">Bedrag is<select name="metbtw" defaultValue="1" className={veld}><option value="1">incl. btw</option><option value="0">excl. btw</option></select></label>
              <label className="grid gap-1">Btw<select name="btw" defaultValue="21" className={veld}><option value="21">21 %</option><option value="9">9 %</option><option value="0">0 %</option></select></label>
            </div>
          </div>
        </details>
        <label className="grid gap-1 text-[13px]">Titel op de factuur<input name="titel" placeholder="Leeg = titel van de offerte" className={veld} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-[13px]">Factuurnummer<input name="nummer" required defaultValue={nummer} className={veld} /></label>
          <label className="grid gap-1 text-[13px]">Datum<input name="datum" type="date" required defaultValue={vandaagNL()} className={veld} /></label>
        </div>
        <BewaarKnop>Factuur maken</BewaarKnop>
      </form>
      <form action={maakWerkbon.bind(null, k.id)} className="crm-paneel grid gap-3 p-5">
        <p className={`${lbl} m-0`}>Werkbon maken</p>
        <label className="grid gap-1 text-[13px]">Wat is er gedaan?<textarea name="werk" required rows={3} className={`${veld} resize-y`} placeholder="Keermuur gestort, 6 m drainage gelegd" /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-[13px]">Datum<input name="datum" type="date" required defaultValue={vandaag} className={veld} /></label>
          <label className="grid gap-1 text-[13px]">Uren<input name="uren" inputMode="decimal" required defaultValue={urenVandaag ? String(urenVandaag).replace(".", ",") : ""} className={veld} /></label>
        </div>
        <label className="grid gap-1 text-[13px]">Materiaal<textarea name="materiaal" rows={2} className={`${veld} resize-y`} placeholder="2 BB teelaarde, 40 betonblokken" /></label>
        <label className="grid gap-1 text-[13px]">Opmerking (bijv. meerwerk)<input name="opmerking" className={veld} /></label>
        <BewaarKnop>Werkbon maken</BewaarKnop>
      </form>
      <form action={nieuwStuk.bind(null, k.id)} className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 crm-paneel p-5">
        <p className={`${lbl} col-span-2 m-0 text-gedempt`}>Al gemaakt in DigiBoox? Toevoegen</p>
        <select name="soort" aria-label="Soort" className={`${veld}`}>
          <option>Factuur</option>
          <option>Offerte</option>
        </select>
        <input name="nummer" required placeholder="GR-F // 2026-…" aria-label="Nummer" className={veld} />
        <input name="bedrag" required inputMode="decimal" placeholder="€ incl. btw" aria-label="Bedrag" className={veld} />
        <input name="datum" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} aria-label="Datum" className={veld} />
        <button className="col-span-2 crm-knop-rand">+ Toevoegen</button>
      </form>
      </div>
    </div>
  )
}

function Tijdlijn({ k }: { k: Klant }) {
  return (
    <div className="grid @min-[1060px]:grid-cols-[minmax(0,1fr)_380px] gap-10">
      <ol className="m-0 list-none border-l border-lijn p-0 pl-6">
        {k.activiteit.map((a) => (
          <li key={a.id} className="relative pb-5">
            <span aria-hidden className={`absolute top-1.5 -left-[29px] size-[9px] rounded-full ${["Gesprek", "Bezoek", "Notitie"].includes(a.soort) ? "bg-accent" : "bg-lijn"}`} />
            <p className={`${lbl} m-0`}>
              <time dateTime={a.datum}>{tijd(a.datum)}</time> · {a.soort} · {a.wie}
            </p>
            <p className="m-0 mt-1 whitespace-pre-line text-[14px] leading-[1.5]">{a.tekst}</p>
          </li>
        ))}
        {!k.activiteit.length && <li className="text-[14px] text-gedempt">Nog niets op de tijdlijn. Gesprekken, fasewissels, opnames en calculaties komen hier vanzelf.</li>}
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
      <select name={naam} defaultValue={waarde} className={`${veld}`}>
        {opties.map((o) => (
          <option key={o} value={o}>{o || "—"}</option>
        ))}
      </select>
    </label>
  )
}

/** Mailknop met de mail al ingevuld: aan de klant, met groet en privélink. */
function Mail({ k, soort, nummer, pad, bedrag, wat }: { k: Klant; soort: MailSoort; nummer: string; pad: string; bedrag?: string; wat: string }) {
  const m = mailVoor(soort, { naam: k.naam, nummer, pad, bedrag })
  return <MailKnop href={mailtoLink(k.email, m.onderwerp, m.tekst)} klantId={k.id} wat={wat} />
}

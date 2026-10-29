import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Blok, Cijfer, Cijfers, Kop, Leeg } from "@/components/crm/kop"
import { TODOS } from "@/lib/beheer/data"
import { hoortBij, leesKlanten } from "@/lib/beheer/klanten"
import { POSTS, TEGELS, tegelVan } from "@/lib/beheer/social"
import { leesStand } from "@/lib/beheer/stand"
import { DOEL, RECONSTRUCTIE, leesUren, weekTotaal, weekVan } from "@/lib/beheer/uren"
import { toonEuro } from "@/lib/crm/geld"
import { LOPEND, geldOverzicht, gewogenPijplijn, opTeVolgen, pijplijn, plusDagen, vandaagNL, waardeVan } from "@/lib/crm/overzicht"
import { euro } from "@/lib/format"

// Vandaag: de startpagina van het systeem (vervangt het Jarvis-scherm met de
// ring, 29 okt 2026). Eén vraag per blok: wie moet ik bellen, wat loopt er,
// wat staat er open, wat komt eraan. Alles komt uit de klantkaarten, de
// aanvragen, de planning en de urenregistratie; elk getal linkt naar de lijst
// erachter. Rekenen gebeurt in src/lib/crm/overzicht.ts.
export const metadata: Metadata = { title: "Vandaag" }
export const dynamic = "force-dynamic"

// De oude tabbladen van het dashboard (?tab=) zijn eigen onderdelen geworden.
const OUD: Record<string, string> = { klanten: "/dashboard/aanvragen", geld: "/dashboard/geld", social: "/dashboard/social", links: "/dashboard/links" }

const kort = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
const groet = () => {
  const uur = Number(new Date().toLocaleString("nl-NL", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Amsterdam" }))
  return uur < 6 ? "Goedenacht" : uur < 12 ? "Goedemorgen" : uur < 18 ? "Goedemiddag" : "Goedenavond"
}

export default async function Vandaag({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  if (tab && OUD[tab]) redirect(OUD[tab])

  const [klanten, stand, uren] = await Promise.all([leesKlanten(), leesStand(), leesUren()])
  const nu = vandaagNL()
  const tot = plusDagen(nu, 14)
  const opvolgen = opTeVolgen(klanten, nu)
  const aanvragen = stand.aanvragen.filter((a) => !a.klaar)
  const lopend = klanten.filter((k) => LOPEND.includes(k.fase))
  const geld = geldOverzicht(klanten, nu)
  const fasen = pijplijn(klanten).filter((f) => f.fase !== "Opgeleverd" && f.fase !== "Verloren")

  const maandag = weekVan(nu).maandag
  const dezeWeek = uren.filter((r) => r.datum >= maandag && r.datum <= nu).reduce((t, r) => t + r.uren, 0)
  const ditJaar = RECONSTRUCTIE.reduce((t, r) => t + weekTotaal(r), 0) + uren.filter((r) => r.datum.startsWith("2026")).reduce((t, r) => t + r.uren, 0)
  const getal = (n: number) => n.toLocaleString("nl-NL", { maximumFractionDigits: 1 })

  // De komende twee weken: wat je zelf plande, en wanneer je wie wilde opvolgen.
  const agenda = [
    ...stand.planning.filter((p) => p.datum > nu && p.datum <= tot).map((p) => ({ datum: p.datum, wat: p.wat, href: "/dashboard/planning", soort: "Planning" })),
    ...klanten.filter((k) => k.opvolgen > nu && k.opvolgen <= tot && LOPEND.concat(["Aanvraag", "Opname", "Offerte"]).includes(k.fase)).map((k) => ({ datum: k.opvolgen, wat: `${k.naam}${k.volgende ? `: ${k.volgende}` : ""}`, href: `/dashboard/klanten/${k.id}`, soort: "Opvolgen" })),
  ].sort((a, b) => a.datum.localeCompare(b.datum))
  const vandaagGepland = stand.planning.filter((p) => p.datum === nu)

  const posts = POSTS.map((p, i) => ({ p, n: i + 1, t: TEGELS[tegelVan(i + 1)] }))
  const volgende = posts.find(({ p }) => !p.gepost && p.map && !stand.gepost[p.map])

  return (
    <>
      <Kop
        titel={`${groet()}, Nick`}
        sub={new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" })}
      >
        <Link href="/dashboard/aanvragen?nieuw=1" className="crm-knop-rand">+ Aanvraag</Link>
        <Link href="/dashboard/klanten?nieuw=1" className="crm-knop-rand">+ Klant</Link>
        <Link href="/dashboard/prijs" className="crm-knop">Prijs berekenen</Link>
      </Kop>

      <main className="mx-auto grid max-w-[1440px] gap-8 px-8 py-6">
        <Cijfers>
          <Cijfer label="Opvolgen" waarde={String(opvolgen.length)} let={opvolgen.length > 0} uitleg="vandaag of eerder" href="/dashboard/klanten" />
          <Cijfer label="Nieuwe aanvragen" waarde={String(aanvragen.length)} let={aanvragen.length > 0} uitleg="nog niet gebeld" href="/dashboard/aanvragen" />
          <Cijfer label="Offertes open" waarde={euro(geld.offertesOpenSom)} uitleg={`${geld.offertesOpen.length} zonder akkoord`} href="/dashboard/geld#offertes" />
          <Cijfer label="Lopende klussen" waarde={String(lopend.length)} uitleg="akkoord, gepland of bezig" href="/dashboard/klanten" />
          <Cijfer label="Te ontvangen" waarde={euro(geld.teOntvangenSom)} let={geld.teOntvangenSom > 0} uitleg={`${geld.teOntvangen.length} facturen niet afgevinkt`} href="/dashboard/geld" />
          <Cijfer label="Uren deze week" waarde={getal(dezeWeek)} uitleg={`${getal(ditJaar)} van ${DOEL.toLocaleString("nl-NL")} dit jaar`} href="/dashboard/uren" />
        </Cijfers>

        <div className="grid gap-8 @min-[1060px]:grid-cols-[minmax(0,1fr)_400px]">
          <div className="grid content-start gap-8">
            <Blok titel="Vandaag te doen" rechts={<span className="text-gedempt">{opvolgen.length + aanvragen.length + vandaagGepland.length} open</span>}>
              {opvolgen.length + aanvragen.length + vandaagGepland.length === 0 ? (
                <Leeg>Niemand om op te volgen en geen nieuwe aanvragen. Kijk bij de komende twee weken wat eraan komt.</Leeg>
              ) : (
                <ul className="crm-paneel m-0 list-none divide-y divide-lijn p-0">
                  {aanvragen.map((a) => (
                    <Rij key={a.id} soort="Aanvraag" let href="/dashboard/aanvragen" titel={a.naam} sub={[a.bron, a.wat.split("\n")[0]].filter(Boolean).join(" · ")} rechts={kort(a.datum)} />
                  ))}
                  {opvolgen.map((k) => (
                    <Rij key={k.id} soort="Opvolgen" let={k.opvolgen < nu} href={`/dashboard/klanten/${k.id}`} titel={k.naam} sub={k.volgende || "Geen volgende stap ingevuld."} rechts={k.opvolgen < nu ? `sinds ${kort(k.opvolgen)}` : "vandaag"} />
                  ))}
                  {vandaagGepland.map((p) => (
                    <Rij key={p.id} soort="Planning" href="/dashboard/planning" titel={p.wat} rechts="vandaag" />
                  ))}
                </ul>
              )}
            </Blok>

            <Blok titel="Lopende klussen" rechts={<Link href="/dashboard/klanten" className="text-accent-tekst">Alle klanten →</Link>}>
              {lopend.length === 0 ? (
                <Leeg>Geen klus met akkoord, gepland of in uitvoering.</Leeg>
              ) : (
                <table className="crm-tabel">
                  <thead>
                    <tr>
                      <th>Klant</th>
                      <th>Fase</th>
                      <th>Volgende stap</th>
                      <th className="text-right">Uren geboekt</th>
                      <th className="text-right">Waarde</th>
                      <th className="text-right">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lopend.map((k) => {
                      const open = k.stukken.filter((s) => s.soort === "Factuur" && !s.rond).reduce((t, s) => t + s.bedrag, 0)
                      const geboekt = uren.filter((r) => hoortBij(k, r.klant)).reduce((t, r) => t + r.uren, 0)
                      const w = waardeVan(k)
                      return (
                        <tr key={k.id}>
                          <td>
                            <Link href={`/dashboard/klanten/${k.id}`} className="crm-link">{k.naam}</Link>
                            {k.plaats && <span className="block text-[12px] text-gedempt">{k.plaats}</span>}
                          </td>
                          <td><span className="crm-badge">{k.fase}</span></td>
                          <td className="max-w-[360px] text-[13px]">{k.volgende || <span className="text-gedempt">—</span>}</td>
                          <td className="crm-cijfer text-right">{geboekt ? getal(geboekt) : "—"}</td>
                          <td className="crm-cijfer text-right">{w ? euro(w) : "—"}</td>
                          <td className={`crm-cijfer text-right ${open > 0 ? "text-let" : "text-gedempt"}`}>{open > 0 ? euro(open) : "—"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
              <p className="m-0 mt-2 text-[12px] text-gedempt">Uren geboekt: regels uit je urenregistratie waarvan het veld Klant een woord uit de klantnaam bevat. Waarde: laatste offerte, anders de laatste calculatie, incl. btw.</p>
            </Blok>

            <Blok titel="Pijplijn" rechts={<span className="text-gedempt">leads gewogen naar kans: <span className="crm-cijfer text-inkt">{toonEuro(gewogenPijplijn(klanten))}</span></span>}>
              <ol className="crm-paneel m-0 grid list-none grid-cols-6 divide-x @max-[900px]:[&_a]:px-3 divide-lijn overflow-hidden p-0">
                {fasen.map((f) => (
                  <li key={f.fase}>
                    <Link href="/dashboard/klanten" className="block px-4 py-3 hover:bg-grond">
                      <span className="crm-label block">{f.fase}</span>
                      <span className="crm-cijfer mt-1 block text-[18px]">{f.aantal}</span>
                      <span className="crm-cijfer block text-[12px] text-gedempt">{f.waarde ? euro(f.waarde) : "—"}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Blok>
          </div>

          <div className="grid content-start gap-8">
            <Blok titel="Komende twee weken" rechts={<Link href="/dashboard/planning" className="text-accent-tekst">Planning →</Link>}>
              {agenda.length === 0 ? (
                <Leeg>Nog niets gepland en niemand om op te volgen.</Leeg>
              ) : (
                <ul className="crm-paneel m-0 list-none divide-y divide-lijn p-0">
                  {agenda.map((a, i) => (
                    <li key={i}>
                      <Link href={a.href} className="grid grid-cols-[84px_minmax(0,1fr)] gap-3 px-4 py-2.5 hover:bg-grond">
                        <span className="crm-cijfer text-[12px] text-gedempt">{kort(a.datum)}</span>
                        <span className="min-w-0 text-[13px]">
                          <span className="truncate">{a.wat}</span>
                          <span className="ml-2 text-[11px] text-gedempt">{a.soort}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Blok>

            <Blok titel="Geld" rechts={<Link href="/dashboard/geld" className="text-accent-tekst">Geld en papieren →</Link>}>
              <dl className="crm-paneel m-0 grid grid-cols-2 divide-x divide-lijn">
                <div className="px-4 py-3">
                  <dt className="crm-label">Gefactureerd deze maand</dt>
                  <dd className="crm-cijfer m-0 mt-1 text-[18px]">{euro(geld.dezeMaand)}</dd>
                </div>
                <div className="px-4 py-3">
                  <dt className="crm-label">Daarvan betaald</dt>
                  <dd className="crm-cijfer m-0 mt-1 text-[18px]">{euro(geld.betaaldDezeMaand)}</dd>
                </div>
              </dl>
              <p className="m-0 mt-2 text-[12px] text-gedempt">Incl. btw, uit de facturen op de klantkaarten. Betaald is wat je zelf hebt afgevinkt; de bank zie je in DigiBoox.</p>
            </Blok>

            {volgende && (
              <Blok titel="Social" rechts={<Link href="/dashboard/social" className="text-accent-tekst">Alle posts →</Link>}>
                <Link href={`/dashboard/social#post-${volgende.n}`} className="crm-paneel flex gap-4 p-3 hover:border-accent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/social/${volgende.p.map}/1.jpg`} alt="" className="h-[80px] w-[64px] shrink-0 rounded-[8px] object-cover" />
                  <span className="min-w-0">
                    <span className="crm-label block">Nu posten · {volgende.n}</span>
                    <span className="mt-1 block font-semibold leading-[1.3]">{volgende.p.titel}</span>
                    <span className="mt-0.5 block text-[12px] text-gedempt">{volgende.t.emoji} {volgende.t.naam}</span>
                  </span>
                </Link>
              </Blok>
            )}

            <Blok titel="Te regelen" rechts={<span className="text-gedempt">kosten zijn schattingen</span>}>
              <ul className="crm-paneel m-0 list-none divide-y divide-lijn p-0">
                {TODOS.map((t) => (
                  <li key={t.wat} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <b className="text-[13px] font-semibold">{t.wat}</b>
                      {t.dringend && <span className="crm-badge crm-badge-let">Eerst</span>}
                    </div>
                    <p className="m-0 mt-1 text-[12px] text-gedempt">{t.waarom}</p>
                    <p className="crm-cijfer m-0 mt-1 text-[12px]">{t.kosten}</p>
                  </li>
                ))}
              </ul>
            </Blok>
          </div>
        </div>
      </main>
    </>
  )
}

function Rij({ soort, titel, sub, rechts, href, let: aandacht }: { soort: string; titel: string; sub?: string; rechts?: string; href: string; let?: boolean }) {
  return (
    <li>
      <Link href={href} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 hover:bg-grond">
        <span className={`crm-badge justify-self-start ${aandacht ? "crm-badge-let" : "crm-badge-stil"}`}>{soort}</span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{titel}</span>
          {sub && <span className="block truncate text-[13px] text-gedempt">{sub}</span>}
        </span>
        {rechts && <span className={`crm-cijfer text-[12px] ${aandacht ? "text-let" : "text-gedempt"}`}>{rechts}</span>}
      </Link>
    </li>
  )
}

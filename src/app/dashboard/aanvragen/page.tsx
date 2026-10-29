import type { Metadata } from "next"
import { Blok, Kop, Leeg } from "@/components/crm/kop"
import { leesStand } from "@/lib/beheer/stand"
import { euro } from "@/lib/format"
import { aanvraagKlaar, aanvraagNaarKlant, bestellingKlaar, bonIngewisseld, bonVerstuurd, nieuweAanvraag } from "../acties"

// Wat er van buiten binnenkomt: aanvragen van het formulier op de site en wat
// je zelf toevoegt (WhatsApp, telefoon), online betaalde borderpakketten en
// cadeaubonnen. Een aanvraag wordt met één knop een klant (met dubbelcontrole);
// tot die tijd is hij hier, en na 30 dagen gaat hij weg (privacyverklaring).
export const metadata: Metadata = { title: "Aanvragen" }
export const dynamic = "force-dynamic"

const dag = (d: string) => new Date(`${d.slice(0, 10)}T12:00`).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
const isTel = (s: string) => /^[\d\s+()-]+$/.test(s)

export default async function Aanvragen({ searchParams }: { searchParams: Promise<{ nieuw?: string }> }) {
  const { nieuw } = await searchParams
  const stand = await leesStand()
  const open = stand.aanvragen.filter((a) => !a.klaar)
  const gedaan = stand.aanvragen.filter((a) => a.klaar)
  const bestellingen = stand.bestellingen.filter((b) => b.status === "betaald")
  const bonnen = stand.bonnen.filter((b) => b.status === "betaald")

  return (
    <>
      <Kop pad={[{ naam: "Werk" }, { naam: "Aanvragen" }]} titel="Aanvragen" sub="Wat binnenkomt via het formulier, WhatsApp of de telefoon. Maak er een klant van zodra je hebt gebeld.">
        <a href="#toevoegen" className="crm-knop">+ Aanvraag toevoegen</a>
      </Kop>
      <main className="mx-auto grid max-w-[1440px] @min-[1060px]:grid-cols-[minmax(0,1fr)_380px] gap-8 px-8 py-6">
        <div className="grid content-start gap-8">
          <Blok titel={`Open · ${open.length}`}>
            {open.length === 0 ? (
              <Leeg>Geen open aanvragen. Het formulier op de site komt hier vanzelf binnen.</Leeg>
            ) : (
              <ul className="m-0 grid list-none gap-3 p-0">
                {open.map((a) => (
                  <li key={a.id} className="crm-paneel p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <b className="text-[15px] font-semibold">{a.naam}</b>
                        <span className="mt-0.5 block text-[12px] text-gedempt">{a.bron} · {dag(a.datum)}</span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <form action={aanvraagNaarKlant.bind(null, a.id)}>
                          <button className="crm-knop crm-knop-klein">Maak klant →</button>
                        </form>
                        <form action={aanvraagKlaar.bind(null, a.id, true)}>
                          <button className="crm-knop-rand crm-knop-klein">Gebeld ✓</button>
                        </form>
                      </div>
                    </div>
                    {a.contact && (
                      <a href={isTel(a.contact) ? `tel:${a.contact.replace(/\s/g, "")}` : `mailto:${a.contact}`} className="mt-2 inline-block font-semibold break-all text-accent-tekst">
                        {a.contact}
                      </a>
                    )}
                    {a.wat && <p className="m-0 mt-2 whitespace-pre-line text-[13px] leading-[1.55]">{a.wat}</p>}
                    {a.foto && (
                      <a href={`/api/vijverfoto?id=${a.foto}`} target="_blank" rel="noreferrer" className="mt-3 block">
                        {/* eslint-disable-next-line @next/next/no-img-element -- privé foto achter de inlog, niet via next/image */}
                        <img src={`/api/vijverfoto?id=${a.foto}`} alt={`Vijverfoto van ${a.naam}`} loading="lazy" className="block max-h-[240px] rounded-[8px] object-cover" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Blok>

          {bestellingen.length > 0 && (
            <Blok titel="Borderpakketten · online betaald" rechts={<span className="text-gedempt">{bestellingen.filter((b) => !b.klaar).length} te leveren</span>}>
              <table className="crm-tabel">
                <thead>
                  <tr><th>Pakket</th><th>Klant</th><th>Adres</th><th className="text-right">Bedrag</th><th /></tr>
                </thead>
                <tbody>
                  {bestellingen.map((b) => (
                    <tr key={b.id} className={b.klaar ? "text-gedempt" : ""}>
                      <td>
                        <b className="font-semibold">{b.pakket} · {b.maat} m²</b>
                        <span className="block text-[12px] text-gedempt">{b.soort} · {dag(b.datum)}</span>
                      </td>
                      <td>
                        {b.naam}
                        <span className="block text-[12px]">
                          <a href={`mailto:${b.email}`} className="text-accent-tekst">{b.email}</a> · <a href={`tel:${b.telefoon.replace(/\s/g, "")}`} className="text-accent-tekst">{b.telefoon}</a>
                        </span>
                      </td>
                      <td className="text-[13px]">{b.adres}</td>
                      <td className="crm-cijfer text-right">{euro(b.bedrag)}</td>
                      <td className="text-right">
                        <form action={bestellingKlaar.bind(null, b.id, !b.klaar)}>
                          <button className="crm-knop-rand crm-knop-klein">{b.klaar ? "Terugzetten" : "Geleverd ✓"}</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Blok>
          )}

          {bonnen.length > 0 && (
            <Blok titel="Cadeaubonnen" rechts={<span className="text-gedempt">{bonnen.filter((b) => !b.ingewisseld).length} open</span>}>
              <table className="crm-tabel">
                <thead>
                  <tr><th>Bon</th><th>Gekocht door</th><th>Doosje</th><th className="text-right">Bedrag</th><th /></tr>
                </thead>
                <tbody>
                  {bonnen.map((b) => (
                    <tr key={b.id} className={b.ingewisseld ? "text-gedempt" : ""}>
                      <td>
                        <a href={`/tuinen/cadeaubon/bon?b=${b.id}`} className="crm-link crm-cijfer">{b.nummer}</a>
                        <span className="block text-[12px] text-gedempt">voor {b.voor} · van {b.van} · geldig t/m {b.geldigTot}</span>
                      </td>
                      <td>
                        {b.naam}
                        <a href={`mailto:${b.email}`} className="block text-[12px] text-accent-tekst">{b.email}</a>
                      </td>
                      <td className="text-[13px]">
                        {b.adres ? (
                          <form action={bonVerstuurd.bind(null, b.id, !b.verstuurd)} className="flex items-center gap-2">
                            <span>{b.verstuurd ? "Verstuurd" : b.adres}</span>
                            <button className="crm-knop-rand crm-knop-klein">{b.verstuurd ? "Terugzetten" : "Verstuurd ✓"}</button>
                          </form>
                        ) : (
                          <span className="text-gedempt">—</span>
                        )}
                      </td>
                      <td className="crm-cijfer text-right">{euro(b.bedrag)}</td>
                      <td className="text-right">
                        <form action={bonIngewisseld.bind(null, b.id, !b.ingewisseld)}>
                          <button className="crm-knop-rand crm-knop-klein">{b.ingewisseld ? "Terugzetten" : "Ingewisseld ✓"}</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Blok>
          )}

          {gedaan.length > 0 && (
            <Blok titel={`Gebeld of klant geworden · ${gedaan.length}`}>
              <ul className="crm-paneel m-0 list-none divide-y divide-lijn p-0">
                {gedaan.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-gedempt">
                    <span className="min-w-0 truncate">
                      <b className="font-semibold text-inkt">{a.naam}</b> · {a.bron} · {dag(a.datum)}
                    </span>
                    <form action={aanvraagKlaar.bind(null, a.id, false)}>
                      <button className="crm-knop-stil crm-knop-klein">Terugzetten</button>
                    </form>
                  </li>
                ))}
              </ul>
            </Blok>
          )}
        </div>

        <aside id="toevoegen" className="self-start">
          <form action={nieuweAanvraag} className="crm-paneel grid gap-3 p-5">
            <h2 className="m-0 text-[15px] font-semibold">Aanvraag toevoegen</h2>
            <p className="m-0 -mt-1 text-[13px] text-gedempt">Een appje of telefoontje dat niet via de site kwam.</p>
            <label className="grid gap-1 text-[13px]">
              Naam
              <input name="naam" required autoFocus={!!nieuw} className="crm-veld" />
            </label>
            <label className="grid gap-1 text-[13px]">
              Telefoon of e-mail
              <input name="contact" className="crm-veld" />
            </label>
            <label className="grid gap-1 text-[13px]">
              Waar gaat het over?
              <textarea name="wat" rows={3} className="crm-veld resize-y" />
            </label>
            <label className="grid gap-1 text-[13px]">
              Hoe binnengekomen
              <select name="bron" className="crm-veld" defaultValue="WhatsApp">
                <option>WhatsApp</option>
                <option>Telefoon</option>
                <option>Anders</option>
              </select>
            </label>
            <button className="crm-knop">Toevoegen</button>
          </form>
        </aside>
      </main>
    </>
  )
}

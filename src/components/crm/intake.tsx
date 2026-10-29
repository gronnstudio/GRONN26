"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { bewaarIntake, type IntakeWijziging } from "@/app/dashboard/klanten/intake-acties"
import { toonDecimaal } from "@/lib/crm/geld"
import {
  INTAKE_NAAM,
  INTAKE_SOORTEN,
  JNOV,
  ZONE_SOORTEN,
  isOpenAntwoord,
  openPunten,
  schoonAntwoord,
  telling,
  vragenVoor,
  zoneOppervlak,
  type IntakeSoort,
  type Vraag,
  type Vragenlijst,
  type Zone,
} from "@/lib/crm/vragenlijst"

// De intake op locatie (docs/architecture/intake.md §2 en §4). Eerst voor de
// telefoon: één categorie per scherm, grote knoppen. Elke wijziging gaat na
// een korte pauze naar de server (bewaarIntake). Lukt dat niet, dan blijft de
// wijziging in deze browser staan en gaat ze mee zodra er weer verbinding is.

export type IntakeBegin = {
  antwoorden: Record<string, string>
  notities: Record<string, string>
  aandacht: string[]
  diensten: string[]
  soort: IntakeSoort
  zones: Zone[]
}

type Stand = IntakeBegin
type Bewaard = "bewaard" | "bezig" | "wacht" | "fout"

const PAUZE = 700

/** Een antwoord van buiten de intake (een bevestigd voorstel van Claude), via de gewone weg bewaard. */
export const INTAKE_ANTWOORD = "crm-intake-antwoord"
export type IntakeAntwoord = { tuin: string; vraag: string; antwoord: string }
/** De zones zoals de intake ze nu kent, voor de foto's ernaast (die anders pas na herladen een nieuwe zone zien). */
export const INTAKE_ZONES = "crm-intake-zones"
export type IntakeZones = { tuin: string; zones: Zone[] }
const KORT: Record<IntakeSoort, string> = { snel: "Snel", uitgebreid: "Uitgebreid", vervolg: "Vervolg" }
const opslagSleutel = (tuin: string) => `gronn-intake-${tuin}`

function voegSamen(a: IntakeWijziging, b: IntakeWijziging): IntakeWijziging {
  return {
    antwoorden: a.antwoorden || b.antwoorden ? { ...a.antwoorden, ...b.antwoorden } : undefined,
    notities: a.notities || b.notities ? { ...a.notities, ...b.notities } : undefined,
    aandacht: a.aandacht || b.aandacht ? { ...a.aandacht, ...b.aandacht } : undefined,
    diensten: b.diensten ?? a.diensten,
    soort: b.soort ?? a.soort,
    zones: b.zones ?? a.zones,
  }
}

function pasToe(s: Stand, w: IntakeWijziging): Stand {
  const antwoorden = { ...s.antwoorden }
  for (const [id, v] of Object.entries(w.antwoorden ?? {})) if (v) antwoorden[id] = v
  else delete antwoorden[id]
  const notities = { ...s.notities }
  for (const [id, v] of Object.entries(w.notities ?? {})) if (v) notities[id] = v
  else delete notities[id]
  let aandacht = s.aandacht
  for (const [id, aan] of Object.entries(w.aandacht ?? {})) aandacht = aan ? [...new Set([...aandacht, id])] : aandacht.filter((x) => x !== id)
  return { antwoorden, notities, aandacht, diensten: w.diensten ?? s.diensten, soort: w.soort ?? s.soort, zones: w.zones ?? s.zones }
}

const leeg = (w: IntakeWijziging) => !Object.values(w).some((v) => v !== undefined)

function leesLokaal(tuin: string): IntakeWijziging | null {
  try {
    const ruw = localStorage.getItem(opslagSleutel(tuin))
    return ruw ? (JSON.parse(ruw) as IntakeWijziging) : null
  } catch {
    return null
  }
}
function schrijfLokaal(tuin: string, w: IntakeWijziging | null) {
  try {
    if (w && !leeg(w)) localStorage.setItem(opslagSleutel(tuin), JSON.stringify(w))
    else localStorage.removeItem(opslagSleutel(tuin))
  } catch {
    // Privévenster of vol: dan alleen in het geheugen.
  }
}

export function Intake({ klant, tuin, lijst, begin }: { klant: string; tuin: string; lijst: Vragenlijst; begin: IntakeBegin }) {
  const [s, setS] = useState<Stand>(begin)
  const [bewaard, setBewaard] = useState<Bewaard>("bewaard")
  const [afgewezen, setAfgewezen] = useState<string[]>([])
  const [blad, setBlad] = useState<string>("")
  // De vervolginspectie houdt de lijst vast waarmee hij begon, anders verdwijnt een vraag zodra je hem beantwoordt.
  const [vervolgIds, setVervolgIds] = useState<Set<string> | null>(() => (begin.soort === "vervolg" ? new Set(vragenVoor(lijst, begin, "vervolg").flatMap((c) => c.vragen.map((v) => v.id))) : null))
  const wachtrij = useRef<IntakeWijziging>({})
  // Wat nu naar de server onderweg is: blijft in de lokale buffer tot de server het bevestigt.
  const onderweg = useRef<IntakeWijziging>({})
  const bewaarLokaal = useCallback(() => schrijfLokaal(tuin, voegSamen(onderweg.current, wachtrij.current)), [tuin])
  const bezig = useRef(false)
  const klok = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stuur = useCallback(async () => {
    if (bezig.current) return
    bezig.current = true
    while (!leeg(wachtrij.current)) {
      const w = wachtrij.current
      onderweg.current = w
      wachtrij.current = {}
      setBewaard("bezig")
      let gelukt = false
      try {
        const r = await bewaarIntake(klant, tuin, w)
        gelukt = r.ok
        if (!r.ok) setBewaard("fout")
        else setAfgewezen(r.afgewezen)
      } catch {
        setBewaard("wacht")
      }
      onderweg.current = {}
      if (!gelukt) {
        wachtrij.current = voegSamen(w, wachtrij.current)
        break
      }
      bewaarLokaal()
      if (leeg(wachtrij.current)) setBewaard("bewaard")
    }
    bezig.current = false
    bewaarLokaal()
  }, [klant, tuin, bewaarLokaal])

  const wijzig = useCallback(
    (w: IntakeWijziging) => {
      setS((oud) => pasToe(oud, w))
      wachtrij.current = voegSamen(wachtrij.current, w)
      bewaarLokaal()
      setBewaard("bezig")
      if (klok.current) clearTimeout(klok.current)
      klok.current = setTimeout(() => void stuur(), PAUZE)
    },
    [stuur, bewaarLokaal],
  )

  // Bij openen: wat er nog in deze browser stond eerst toepassen en versturen.
  useEffect(() => {
    const lokaal = leesLokaal(tuin)
    if (lokaal && !leeg(lokaal)) {
      wachtrij.current = lokaal
      const t = setTimeout(() => {
        setS((oud) => pasToe(oud, lokaal))
        void stuur()
      }, 0)
      return () => clearTimeout(t)
    }
  }, [stuur, tuin])

  useEffect(() => {
    const zet = (e: Event) => {
      const d = (e as CustomEvent<IntakeAntwoord>).detail
      if (d?.tuin === tuin) wijzig({ antwoorden: { [d.vraag]: d.antwoord } })
    }
    window.addEventListener(INTAKE_ANTWOORD, zet)
    return () => window.removeEventListener(INTAKE_ANTWOORD, zet)
  }, [tuin, wijzig])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent<IntakeZones>(INTAKE_ZONES, { detail: { tuin, zones: s.zones } }))
  }, [tuin, s.zones])

  // Weer verbinding, of elke 15 tellen zolang er iets wacht.
  useEffect(() => {
    const opnieuw = () => void stuur()
    window.addEventListener("online", opnieuw)
    const tik = setInterval(() => {
      if (!leeg(wachtrij.current) && !bezig.current) void stuur()
    }, 15_000)
    return () => {
      window.removeEventListener("online", opnieuw)
      clearInterval(tik)
    }
  }, [stuur])

  // Niet weggaan met iets dat nog niet bewaard is zonder waarschuwing.
  useEffect(() => {
    const weg = (e: BeforeUnloadEvent) => {
      if (!leeg(wachtrij.current) || !leeg(onderweg.current)) e.preventDefault()
    }
    window.addEventListener("beforeunload", weg)
    return () => window.removeEventListener("beforeunload", weg)
  }, [])

  const kiesSoort = (soort: IntakeSoort) => {
    if (soort === s.soort) return
    setVervolgIds(soort === "vervolg" ? new Set(vragenVoor(lijst, s, "vervolg").flatMap((c) => c.vragen.map((v) => v.id))) : null)
    setBlad("")
    wijzig({ soort })
  }

  const categorieen = useMemo(() => {
    if (s.soort !== "vervolg") return vragenVoor(lijst, s, s.soort)
    const ids = vervolgIds ?? new Set(vragenVoor(lijst, s, "vervolg").flatMap((c) => c.vragen.map((v) => v.id)))
    return vragenVoor(lijst, s, "uitgebreid")
      .map((c) => ({ ...c, vragen: c.vragen.filter((v) => ids.has(v.id)) }))
      .filter((c) => c.vragen.length)
  }, [lijst, s, vervolgIds])

  const open = useMemo(() => openPunten(lijst, s), [lijst, s])
  const n = telling(lijst, s)
  const huidig = blad === "open" || blad === "zones" ? blad : (categorieen.find((c) => c.id === blad) ?? categorieen[0])?.id ?? "open"
  const plek = categorieen.findIndex((c) => c.id === huidig)
  const categorie = plek >= 0 ? categorieen[plek] : null

  const naarVraag = (catId: string, vraagId: string) => {
    if (!categorieen.some((c) => c.id === catId && c.vragen.some((v) => v.id === vraagId))) kiesSoort("uitgebreid")
    setBlad(catId)
    setTimeout(() => document.getElementById(`v-${vraagId}`)?.scrollIntoView({ block: "center" }), 50)
  }

  const statusTekst = { bewaard: "Bewaard ✓", bezig: "Bewaren…", wacht: "Nog niet bewaard · geen verbinding, wordt bewaard zodra die er is", fout: "Niet bewaard: deze tuin bestaat niet meer" }[bewaard]

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-b border-lijn bg-grond/95 px-4 py-3 backdrop-blur sm:mx-0 sm:px-0">
        <div role="group" aria-label="Soort intake" className="grid grid-cols-3 gap-1 rounded-full border border-lijn bg-vlak p-1">
          {INTAKE_SOORTEN.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={s.soort === x}
              onClick={() => kiesSoort(x)}
              className={`min-h-[40px] cursor-pointer rounded-full px-2 text-[13px] font-semibold leading-tight ${s.soort === x ? "bg-accent text-op-accent" : "text-gedempt hover:text-inkt"}`}
            >
              {KORT[x]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[13px]">
          <span className="crm-cijfer text-gedempt">
            {n.gevuld} van {n.van} beantwoord · {open.length} open
          </span>
          <span role="status" className={bewaard === "wacht" || bewaard === "fout" ? "font-semibold text-let" : "text-gedempt"}>
            {statusTekst}
          </span>
        </div>
        {afgewezen.length > 0 && (
          <p role="alert" className="m-0 text-[13px] font-semibold text-let">
            Niet bewaard, de vragenlijst is intussen veranderd: {afgewezen.join(", ")}. Herlaad de pagina en vul {afgewezen.length === 1 ? "die vraag" : "die vragen"} opnieuw in.
          </p>
        )}
      </div>

      <p className="m-0 text-[13px] text-gedempt">{INTAKE_NAAM[s.soort].uitleg}</p>

      <fieldset className="m-0 border-0 p-0">
        <legend className="crm-label mb-2 p-0">Gewenste werkzaamheden</legend>
        <div className="flex flex-wrap gap-2">
          {[...lijst.diensten, ...s.diensten.filter((x) => !lijst.diensten.includes(x))].map((dn) => {
            const aan = s.diensten.includes(dn)
            return (
              <button
                key={dn}
                type="button"
                aria-pressed={aan}
                onClick={() => wijzig({ diensten: aan ? s.diensten.filter((x) => x !== dn) : [...s.diensten, dn] })}
                className={`min-h-[40px] cursor-pointer rounded-full border px-4 text-[14px] ${aan ? "border-accent bg-accent-zacht font-semibold text-accent-tekst" : "border-lijn-sterk bg-vlak"}`}
              >
                {aan && <span aria-hidden>✓ </span>}
                {dn}
              </button>
            )
          })}
        </div>
      </fieldset>

      <nav aria-label="Categorieën" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 pb-1">
          {categorieen.map((c) => {
            const beantwoord = c.vragen.filter((v) => !isOpenAntwoord(s.antwoorden[v.id])).length
            return (
              <button
                key={c.id}
                type="button"
                aria-current={huidig === c.id ? "step" : undefined}
                onClick={() => setBlad(c.id)}
                className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border px-4 text-[13px] ${huidig === c.id ? "border-inkt bg-inkt text-grond" : "border-lijn bg-vlak"}`}
              >
                {c.naam}
                <span className="crm-cijfer opacity-70">
                  {beantwoord}/{c.vragen.length}
                </span>
              </button>
            )
          })}
          <button type="button" aria-current={huidig === "zones" ? "step" : undefined} onClick={() => setBlad("zones")} className={`min-h-[40px] cursor-pointer rounded-full border px-4 text-[13px] ${huidig === "zones" ? "border-inkt bg-inkt text-grond" : "border-lijn bg-vlak"}`}>
            Zones <span className="crm-cijfer opacity-70">{s.zones.length}</span>
          </button>
          <button type="button" aria-current={huidig === "open" ? "step" : undefined} onClick={() => setBlad("open")} className={`min-h-[40px] cursor-pointer rounded-full border px-4 text-[13px] font-semibold ${huidig === "open" ? "border-inkt bg-inkt text-grond" : "border-let/40 bg-let-zacht text-let"}`}>
            Open punten <span className="crm-cijfer">{open.length}</span>
          </button>
        </div>
      </nav>

      {categorie && (
        <section aria-labelledby={`cat-${categorie.id}`} className="flex flex-col gap-3">
          <h2 id={`cat-${categorie.id}`} className="syne m-0 text-[22px]">
            {categorie.naam}
          </h2>
          {categorie.vragen.map((v) => (
            <VraagKaart key={v.id} v={v} s={s} wijzig={wijzig} />
          ))}
          <div className="mt-2 flex justify-between gap-3">
            <button type="button" disabled={plek <= 0} onClick={() => setBlad(categorieen[plek - 1]?.id ?? "")} className="crm-knop-rand min-h-[44px] disabled:invisible">
              ← {categorieen[plek - 1]?.naam ?? ""}
            </button>
            <button type="button" onClick={() => setBlad(categorieen[plek + 1]?.id ?? "zones")} className="crm-knop min-h-[44px]">
              {categorieen[plek + 1]?.naam ?? "Zones"} →
            </button>
          </div>
        </section>
      )}

      {huidig === "zones" && <Zones zones={s.zones} wijzig={(zones) => wijzig({ zones })} />}

      {huidig === "open" && (
        <section aria-labelledby="open-kop" className="flex flex-col gap-3">
          <h2 id="open-kop" className="syne m-0 text-[22px]">
            Nog open
          </h2>
          <p className="m-0 text-[13px] text-gedempt">Gemarkeerd eerst, dan onbekend, dan nog leeg. Alleen vragen voor de gekozen werkzaamheden.</p>
          {!open.length && <p className="crm-paneel m-0 p-5 text-[14px]">Alles is beantwoord. Mooi.</p>}
          <ul className="m-0 grid list-none gap-2 p-0">
            {open.map(({ categorie: c, vraag: v, reden }) => (
              <li key={v.id}>
                <button type="button" onClick={() => naarVraag(c.id, v.id)} className="crm-paneel flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-[14px] hover:border-accent">
                  <span>
                    {v.tekst}
                    <span className="block text-[12px] text-gedempt">{c.naam}</span>
                  </span>
                  <span className={reden === "leeg" ? "crm-badge crm-badge-stil" : "crm-badge crm-badge-let"}>{{ aandacht: "Aandacht", onbekend: "Onbekend", leeg: "Leeg" }[reden]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function VraagKaart({ v, s, wijzig }: { v: Vraag; s: Stand; wijzig: (w: IntakeWijziging) => void }) {
  const waarde = s.antwoorden[v.id] ?? ""
  const notitie = s.notities[v.id] ?? ""
  const gemarkeerd = s.aandacht.includes(v.id)
  const [notitieOpen, setNotitieOpen] = useState(Boolean(notitie))
  const veldId = `i-${v.id}`
  const zet = (w: string) => wijzig({ antwoorden: { [v.id]: w } })
  const label = (
    <>
      {v.tekst}
      {v.eenheid && <span className="text-gedempt"> ({v.eenheid})</span>}
    </>
  )

  return (
    <div id={`v-${v.id}`} className={`crm-paneel scroll-mt-40 p-4 ${gemarkeerd ? "border-let" : ""}`}>
      {v.soort === "jnov" ? (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 p-0 text-[15px] font-semibold leading-snug">{label}</legend>
          {v.hulp && <p className="m-0 mb-2 text-[13px] text-gedempt">{v.hulp}</p>}
          <div className="grid grid-cols-4 gap-1.5">
            {JNOV.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={waarde === o}
                onClick={() => zet(waarde === o ? "" : o)}
                className={`min-h-[44px] cursor-pointer rounded-[10px] border px-1 text-[13px] font-semibold ${waarde === o ? "border-accent bg-accent text-op-accent" : "border-lijn-sterk bg-veld"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="grid gap-2">
          <label htmlFor={veldId} className="text-[15px] font-semibold leading-snug">
            {label}
          </label>
          {v.hulp && <p className="m-0 -mt-1 text-[13px] text-gedempt">{v.hulp}</p>}
          {v.soort === "keuze" ? (
            <select id={veldId} value={waarde} onChange={(e) => zet(e.target.value)} className="crm-veld min-h-[44px] text-[16px]">
              <option value="">—</option>
              {v.opties?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : v.soort === "lang" ? (
            <textarea id={veldId} value={waarde} onChange={(e) => zet(e.target.value)} rows={3} className="crm-veld resize-y text-[16px] leading-[1.5]" />
          ) : (
            <input
              id={veldId}
              value={waarde}
              onChange={(e) => zet(e.target.value)}
              type={v.soort === "datum" ? "date" : "text"}
              inputMode={v.soort === "getal" ? "decimal" : undefined}
              className="crm-veld min-h-[44px] text-[16px]"
            />
          )}
        </div>
      )}

      {/* Een antwoord dat niet meer in dit soort vraag past (optie weg, soort veranderd) blijft leesbaar. */}
      {waarde && schoonAntwoord(v, waarde) !== waarde && (
        <p className="m-0 mt-2 text-[13px]">
          Eerder ingevuld: <strong>{waarde}</strong>
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" aria-expanded={notitieOpen} onClick={() => setNotitieOpen((x) => !x)} className="crm-knop-stil crm-knop-klein min-h-[36px]">
          {notitie ? "Notitie ✓" : "+ Notitie"}
        </button>
        <button type="button" aria-pressed={gemarkeerd} onClick={() => wijzig({ aandacht: { [v.id]: !gemarkeerd } })} className={`crm-knop-klein min-h-[36px] cursor-pointer rounded-full border px-3 text-[12px] font-semibold ${gemarkeerd ? "border-let bg-let-zacht text-let" : "border-transparent text-gedempt hover:bg-accent-zacht"}`}>
          {gemarkeerd ? "! Aandachtspunt" : "Markeer als aandachtspunt"}
        </button>
      </div>
      {notitieOpen && <Notitie id={`n-${v.id}`} label={`Notitie bij ${v.tekst}`} waarde={notitie} zet={(n) => wijzig({ notities: { [v.id]: n } })} />}
    </div>
  )
}

type Herkenning = { lang: string; interimResults: boolean; continuous: boolean; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null }

function Notitie({ id, label, waarde, zet }: { id: string; label: string; waarde: string; zet: (n: string) => void }) {
  const [luistert, setLuistert] = useState(false)
  const [kan, setKan] = useState(false)
  const herkenning = useRef<Herkenning | null>(null)
  const basis = useRef(waarde)

  useEffect(() => {
    const W = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
    const t = setTimeout(() => setKan(Boolean(W.SpeechRecognition ?? W.webkitSpeechRecognition)), 0)
    return () => {
      clearTimeout(t)
      herkenning.current?.stop()
    }
  }, [])

  const spreek = () => {
    if (luistert) return herkenning.current?.stop()
    const W = window as unknown as { SpeechRecognition?: new () => Herkenning; webkitSpeechRecognition?: new () => Herkenning }
    const Klasse = W.SpeechRecognition ?? W.webkitSpeechRecognition
    if (!Klasse) return
    const h = new Klasse()
    h.lang = "nl-NL"
    h.interimResults = false
    h.continuous = true
    basis.current = waarde
    h.onresult = (e) => {
      const gehoord = Array.from(e.results)
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript.trim())
        .join(" ")
      if (gehoord) zet([basis.current, gehoord].filter(Boolean).join(basis.current ? " " : ""))
    }
    h.onend = () => setLuistert(false)
    h.onerror = () => setLuistert(false)
    herkenning.current = h
    setLuistert(true)
    h.start()
  }

  return (
    <div className="mt-2 flex items-start gap-2">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea id={id} value={waarde} onChange={(e) => zet(e.target.value)} rows={2} placeholder="Eigen aantekening" className="crm-veld min-w-0 flex-1 resize-y text-[16px] leading-[1.5]" />
      {kan && (
        <button
          type="button"
          onClick={spreek}
          aria-pressed={luistert}
          className={`grid size-[44px] shrink-0 cursor-pointer place-items-center rounded-full ${luistert ? "bg-let text-grond" : "bg-accent-zacht text-accent-tekst"}`}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="7" y="2.5" width="6" height="10" rx="3" />
            <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5v2.5" />
          </svg>
          <span className="sr-only">{luistert ? "Stop met inspreken" : "Spreek in"}</span>
        </button>
      )}
    </div>
  )
}

function Zones({ zones, wijzig }: { zones: Zone[]; wijzig: (z: Zone[]) => void }) {
  const zet = (id: string, veld: keyof Zone, w: string) => wijzig(zones.map((z) => (z.id === id ? { ...z, [veld]: w } : z)))
  const nieuw = () => {
    const letter = String.fromCharCode(65 + (zones.length % 26))
    wijzig([...zones, { id: crypto.randomUUID(), naam: `Zone ${letter}`, soort: "Terras", lengte: "", breedte: "", oppervlak: "", diepte: "", notitie: "" }])
  }
  const maat = (z: Zone, veld: "lengte" | "breedte" | "oppervlak" | "diepte", label: string, eenheid: string, voorbeeld?: string) => (
    <label className="grid gap-1 text-[13px]">
      <span>
        {label} <span className="text-gedempt">({eenheid})</span>
      </span>
      <input value={z[veld]} onChange={(e) => zet(z.id, veld, e.target.value)} inputMode="decimal" placeholder={voorbeeld} className="crm-veld min-h-[44px] text-[16px]" />
    </label>
  )

  return (
    <section aria-labelledby="zones-kop" className="flex flex-col gap-3">
      <h2 id="zones-kop" className="syne m-0 text-[22px]">
        Zones
      </h2>
      <p className="m-0 text-[13px] text-gedempt">Deel de tuin op, bijvoorbeeld A Terras, B Gazon, C Border. Per zone de maten; later rekent de meetstaat hiermee fundering, zand en planten uit.</p>
      {zones.map((z) => {
        const opp = zoneOppervlak(z)
        return (
          <fieldset key={z.id} className="crm-paneel m-0 grid gap-3 p-4 sm:grid-cols-2">
            <legend className="sr-only">{z.naam}</legend>
            <label className="grid gap-1 text-[13px]">
              Naam
              <input value={z.naam} onChange={(e) => zet(z.id, "naam", e.target.value)} className="crm-veld min-h-[44px] text-[16px] font-semibold" />
            </label>
            <label className="grid gap-1 text-[13px]">
              Soort
              <select value={z.soort} onChange={(e) => zet(z.id, "soort", e.target.value)} className="crm-veld min-h-[44px] text-[16px]">
                {ZONE_SOORTEN.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            {maat(z, "lengte", "Lengte", "m")}
            {maat(z, "breedte", "Breedte", "m")}
            {maat(z, "oppervlak", "Oppervlak", "m²", opp && !z.oppervlak ? toonDecimaal(opp, 3) : undefined)}
            {maat(z, "diepte", z.soort === "Vijver" ? "Diepte" : "Ophogen of afgraven", z.soort === "Vijver" ? "m" : "cm")}
            <label className="grid gap-1 text-[13px] sm:col-span-2">
              Notitie
              <textarea value={z.notitie} onChange={(e) => zet(z.id, "notitie", e.target.value)} rows={2} className="crm-veld resize-y text-[16px]" />
            </label>
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <span className="crm-cijfer text-[13px] text-gedempt">{opp ? `${toonDecimaal(opp, 3)} m²${z.oppervlak ? "" : " (lengte × breedte)"}` : "Nog geen oppervlak"}</span>
              <button type="button" onClick={() => confirm(`${z.naam} weghalen?`) && wijzig(zones.filter((x) => x.id !== z.id))} className="crm-knop-stil crm-knop-klein">
                Weghalen
              </button>
            </div>
          </fieldset>
        )
      })}
      <button type="button" onClick={nieuw} className="crm-knop-rand min-h-[44px] self-start">
        + Zone toevoegen
      </button>
    </section>
  )
}

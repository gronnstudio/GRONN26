"use client"

import Link from "next/link"
import { track } from "@vercel/analytics"
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Logo } from "@/components/logo"
import { BUSINESS } from "@/lib/business"
import { Pijl } from "@/components/pijl"

// "Start een project": de aanvraag uit de handoff "Website 2027" (pagina 12
// en 23; eigenaar koos "Handoff precies volgen", 12 nov 2026), op 13 nov
// teruggebracht van zes naar vier stappen: wat, hoe het er nu uitziet (met
// foto's), budget en planning samen, contact. "Stap x van 4", terug en volgende, voortgang
// in sessionStorage (zonder foto's), fouten bij het veld én in een
// samenvatting. Versturen gaat zoals op Kennismaken: rechtstreeks uit de
// browser naar FormSubmit (die blokkeert serveradressen), met een kopie naar
// /api/aanvraag voor het dashboard. Foto's gaan privé naar /api/vijverfoto.

const ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS.email}`
const OPSLAG = "gronn-aanvraag"
const MAX_FOTOS = 5 // /api/vijverfoto neemt er zes per uur per adres aan
const MAX_MB = 20

type Keuze = { id: string; label: string }

const TYPES: Keuze[] = [
  { id: "tuin", label: "Een bestaande tuin vernieuwen" },
  { id: "vijver", label: "Een vijver renoveren of verbeteren" },
  { id: "advies", label: "Ontwerp of specialistisch advies" },
  { id: "anders", label: "Anders / nog niet zeker" },
]
const VIJVERTYPES: Keuze[] = [
  { id: "sier", label: "Siervijver" },
  { id: "natuur", label: "Natuurlijke vijver" },
  { id: "koi", label: "Koivijver" },
  { id: "zwem", label: "Zwemvijver" },
  { id: "onbekend", label: "Weet ik niet" },
]
const BUDGETTEN: Keuze[] = [
  { id: "advies", label: "Advies / tot € 2.500" },
  { id: "2500", label: "€ 2.500 – 5.000" },
  { id: "5000", label: "€ 5.000 – 10.000" },
  { id: "10000", label: "€ 10.000 – 20.000" },
  { id: "20000", label: "€ 20.000+" },
  { id: "onzeker", label: "Nog onzeker" },
]
const PLANNINGEN: Keuze[] = [
  { id: "zsm", label: "Zo snel mogelijk" },
  { id: "voorjaar", label: "Voorjaar 2027, vanaf maart" },
  { id: "3mnd", label: "Binnen 3 maanden" },
  { id: "6mnd", label: "Binnen 6 maanden" },
  { id: "later", label: "Later" },
  { id: "orienterend", label: "Oriënterend" },
]
const KANALEN: Keuze[] = [
  { id: "email", label: "E-mail" },
  { id: "telefoon", label: "Telefoon" },
  { id: "whatsapp", label: "WhatsApp" },
]

type Stand = {
  type: string
  situatie: string
  postcode: string
  oppervlakte: string
  vijvertype: string
  budget: string
  planning: string
  naam: string
  email: string
  telefoon: string
  kanaal: string
  akkoord: boolean
}
const LEEG: Stand = { type: "", situatie: "", postcode: "", oppervlakte: "", vijvertype: "", budget: "", planning: "", naam: "", email: "", telefoon: "", kanaal: "email", akkoord: false }

type Foto = { sleutel: string; voorbeeld: string; id: string | null; stand: "bezig" | "klaar" | "fout" }
type Fouten = Partial<Record<keyof Stand, string>>

const STAPPEN = [
  { lbl: "Jouw project", kop: "Wat wil je laten doen?", uitleg: "Kies wat het beste past. Twijfel je? Dan denk ik met je mee." },
  { lbl: "Bestaande situatie", kop: "Hoe ziet het er nu uit?", uitleg: "Een korte toelichting en je postcode zijn genoeg. Foto's helpen veel, maar zijn niet verplicht." },
  { lbl: "Budget en planning", kop: "Wat heb je in gedachten?", uitleg: "Een bandbreedte en een moment helpen mij de juiste vervolgstap voor te stellen. Het is geen toezegging." },
  { lbl: "Contact", kop: "Hoe bereik ik je?", uitleg: "Ik gebruik je gegevens alleen om op deze aanvraag te reageren." },
]
const LAATSTE = STAPPEN.length - 1

const label = (lijst: Keuze[], id: string) => lijst.find((k) => k.id === id)?.label ?? ""

function controleer(stap: number, s: Stand): Fouten {
  const f: Fouten = {}
  if (stap === 0 && !s.type) f.type = "Kies wat je wilt laten doen."
  if (stap === 1) {
    if (s.situatie.trim().length < 10) f.situatie = "Vertel in een paar woorden hoe het er nu uitziet."
    if (!/^\d{4}\s?[a-zA-Z]{2}$/.test(s.postcode.trim())) f.postcode = "Vul een postcode in zoals 6171 AB."
  }
  if (stap === 2) {
    if (!s.budget) f.budget = "Kies een budget, of Nog onzeker."
    if (!s.planning) f.planning = "Kies wanneer je wilt beginnen."
  }
  if (stap === 3) {
    if (!s.naam.trim()) f.naam = "Vul je naam in."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) f.email = "Vul een geldig e-mailadres in, zoals in je mailprogramma."
    if ((s.kanaal === "telefoon" || s.kanaal === "whatsapp") && s.telefoon.replace(/\D/g, "").length < 9) f.telefoon = "Vul je telefoonnummer in, zodat ik je zo kan bereiken."
    if (!s.akkoord) f.akkoord = "Geef akkoord op de privacyverklaring om te versturen."
  }
  return f
}

async function verklein(bestand: File): Promise<Blob> {
  const beeld = await createImageBitmap(bestand)
  const schaal = Math.min(1, 1600 / Math.max(beeld.width, beeld.height))
  const doek = document.createElement("canvas")
  doek.width = Math.round(beeld.width * schaal)
  doek.height = Math.round(beeld.height * schaal)
  doek.getContext("2d")?.drawImage(beeld, 0, 0, doek.width, doek.height)
  beeld.close()
  return new Promise((klaar, mis) => doek.toBlob((b) => (b ? klaar(b) : mis(new Error("leeg"))), "image/jpeg", 0.85))
}

function Keuzes({ naam, lijst, waarde, onKies, fout, legenda, zichtbaar }: { naam: keyof Stand; lijst: Keuze[]; waarde: string; onKies: (id: string) => void; fout?: string; legenda: string; zichtbaar?: boolean }) {
  return (
    <fieldset className="hw-keuzes" aria-describedby={fout ? `fout-${naam}` : undefined} aria-invalid={fout ? true : undefined}>
      <legend className={zichtbaar ? "hw-legenda" : "sr-only"}>{legenda}</legend>
      {lijst.map((k, i) => (
        <label key={k.id} className="hw-keuze">
          <input type="radio" name={naam} value={k.id} checked={waarde === k.id} onChange={() => onKies(k.id)} id={i === 0 ? `veld-${naam}` : undefined} />
          <span>{k.label}</span>
          <Pijl className="hw-keuze-pijl" />
        </label>
      ))}
      {fout ? <p id={`fout-${naam}`} className="hw-fout">{fout}</p> : null}
    </fieldset>
  )
}

function Veld({ naam, label: lbl, fout, optioneel, children }: { naam: string; label: string; fout?: string; optioneel?: boolean; children: ReactNode }) {
  return (
    <div className="hw-veld">
      <label htmlFor={`veld-${naam}`}>
        {lbl}
        {optioneel ? <span className="hw-optioneel"> · optioneel</span> : null}
      </label>
      {children}
      {fout ? <p id={`fout-${naam}`} className="hw-fout">{fout}</p> : null}
    </div>
  )
}

export function ProjectWizard() {
  const [stap, setStap] = useState(0)
  const [s, setS] = useState<Stand>(LEEG)
  const [fouten, setFouten] = useState<Fouten>({})
  const [fotos, setFotos] = useState<Foto[]>([])
  const [status, setStatus] = useState<"invullen" | "bezig" | "klaar" | "terugval">("invullen")
  const [referentie, setReferentie] = useState("")
  const [mailto, setMailto] = useState("")
  const kopRef = useRef<HTMLHeadingElement>(null)
  const samenvattingRef = useRef<HTMLDivElement>(null)
  const verzonden = useRef(false)
  const geladen = useRef(false)
  const fotoId = useId()

  // Terug van een eerdere sessie, of ?type=advies vanaf de voorpagina.
  useEffect(() => {
    try {
      const bewaard = JSON.parse(sessionStorage.getItem(OPSLAG) || "null") as { stap?: number; s?: Partial<Stand> } | null
      // eslint-disable-next-line react-hooks/set-state-in-effect -- eenmalig na hydratie
      if (bewaard?.s) setS({ ...LEEG, ...bewaard.s })
      if (typeof bewaard?.stap === "number") setStap(Math.min(Math.max(bewaard.stap, 0), LAATSTE))
    } catch {}
    const type = new URLSearchParams(window.location.search).get("type")
    if (type && TYPES.some((t) => t.id === type)) setS((o) => ({ ...o, type }))
    geladen.current = true
    track("start_application")
  }, [])

  useEffect(() => {
    if (!geladen.current || status !== "invullen") return
    try {
      sessionStorage.setItem(OPSLAG, JSON.stringify({ stap, s }))
    } catch {}
  }, [stap, s, status])

  const zet = <K extends keyof Stand>(k: K, w: Stand[K]) => {
    setS((o) => ({ ...o, [k]: w }))
    if (fouten[k]) setFouten((f) => ({ ...f, [k]: undefined }))
  }

  function naar(n: number) {
    setFouten({})
    setStap(n)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0 })
      kopRef.current?.focus()
    })
  }

  function volgende(e: FormEvent) {
    e.preventDefault()
    const f = controleer(stap, s)
    if (Object.keys(f).length) {
      setFouten(f)
      for (const veld of Object.keys(f)) track("form_error", { step: stap + 1, field: veld })
      requestAnimationFrame(() => samenvattingRef.current?.focus())
      return
    }
    track("complete_step", { step: stap + 1 })
    if (stap < LAATSTE) naar(stap + 1)
    else void verstuur()
  }

  async function kiesFotos(lijst: FileList | null) {
    if (!lijst) return
    const ruimte = MAX_FOTOS - fotos.length
    const nieuw = Array.from(lijst).slice(0, Math.max(ruimte, 0))
    for (const bestand of nieuw) {
      const sleutel = `${bestand.name}-${bestand.size}-${Math.random().toString(36).slice(2, 7)}`
      if (bestand.size > MAX_MB * 1024 * 1024) {
        setFotos((o) => [...o, { sleutel, voorbeeld: "", id: null, stand: "fout" }])
        continue
      }
      setFotos((o) => [...o, { sleutel, voorbeeld: "", id: null, stand: "bezig" }])
      try {
        const jpg = await verklein(bestand)
        const voorbeeld = URL.createObjectURL(jpg)
        setFotos((o) => o.map((f) => (f.sleutel === sleutel ? { ...f, voorbeeld } : f)))
        const body = new FormData()
        body.append("foto", jpg, "aanvraag.jpg")
        const res = await fetch("/api/vijverfoto", { method: "POST", body })
        if (!res.ok) throw new Error(String(res.status))
        const uit = (await res.json()) as { id: string | null }
        setFotos((o) => o.map((f) => (f.sleutel === sleutel ? { ...f, id: uit.id, stand: uit.id ? "klaar" : "fout" } : f)))
      } catch {
        setFotos((o) => o.map((f) => (f.sleutel === sleutel ? { ...f, stand: "fout" } : f)))
      }
    }
    track("upload_photos", { count: nieuw.length })
  }

  function verwijder(sleutel: string) {
    setFotos((o) => {
      const weg = o.find((f) => f.sleutel === sleutel)
      if (weg?.voorbeeld) URL.revokeObjectURL(weg.voorbeeld)
      return o.filter((f) => f.sleutel !== sleutel)
    })
  }

  async function verstuur() {
    if (verzonden.current) return // dubbele inzending
    verzonden.current = true
    setStatus("bezig")
    const nu = new Date()
    const ref = `GR-${nu.getFullYear()}${String(nu.getMonth() + 1).padStart(2, "0")}${String(nu.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    setReferentie(ref)
    const fotoLinks = fotos.filter((f) => f.id).map((f) => `https://gronn.studio/api/vijverfoto?id=${f.id} (alleen ingelogd te zien)`)
    const tekst = [
      `Referentie: ${ref}`,
      `Projecttype: ${label(TYPES, s.type)}`,
      `Postcode: ${s.postcode.trim().toUpperCase()}`,
      s.oppervlakte ? `Oppervlakte: ${s.oppervlakte}` : null,
      s.type === "vijver" && s.vijvertype ? `Vijvertype: ${label(VIJVERTYPES, s.vijvertype)}` : null,
      `Budget: ${label(BUDGETTEN, s.budget)}`,
      `Planning: ${label(PLANNINGEN, s.planning)}`,
      `Naam: ${s.naam.trim()}`,
      `E-mail: ${s.email.trim()}`,
      s.telefoon ? `Telefoon: ${s.telefoon.trim()}` : null,
      `Voorkeur contact: ${label(KANALEN, s.kanaal)}`,
      "",
      "Bestaande situatie:",
      s.situatie.trim(),
      fotoLinks.length ? `\nFoto's:\n${fotoLinks.join("\n")}` : null,
    ]
      .filter((r): r is string => typeof r === "string")
      .join("\n")
    const onderwerp = `Projectaanvraag ${ref} — ${label(TYPES, s.type)}`
    const mail = `${BUSINESS.emailHref}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(tekst)}`
    setMailto(mail)
    fetch("/api/aanvraag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: s.naam.trim(), contact: s.telefoon.trim() || s.email.trim(), wat: tekst, foto: fotos.find((f) => f.id)?.id ?? undefined }),
      keepalive: true,
    }).catch(() => {})
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: onderwerp,
          _template: "box",
          _captcha: "false",
          // De bevestiging aan de aanvrager, met samenvatting en referentie (handoff 12).
          _autoresponse: `Bedankt voor je aanvraag bij ${BUSINESS.name}. Ik bekijk hem zelf en reageer binnen twee werkdagen.\n\nReferentie: ${ref}\nProjecttype: ${label(TYPES, s.type)}\nBudget: ${label(BUDGETTEN, s.budget)}\nPlanning: ${label(PLANNINGEN, s.planning)}`,
          name: s.naam.trim(),
          email: s.email.trim(),
          message: tekst,
        }),
      })
      const uit = (await res.json().catch(() => null)) as { success?: string | boolean } | null
      if (!res.ok || !(uit?.success === true || uit?.success === "true")) throw new Error("niet bezorgd")
      track("submit_application", { type: s.type, budget: s.budget })
      try {
        sessionStorage.removeItem(OPSLAG)
      } catch {}
      setStatus("klaar")
    } catch {
      setStatus("terugval")
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- mailto:, geen interne pagina
      window.location.href = mail
    }
    requestAnimationFrame(() => kopRef.current?.focus())
  }

  const kop = (
    <div className="hw-kop">
      <Link href="/" aria-label="GRØNN Studio, naar de voorpagina">
        <Logo className="h-[22px] w-auto" />
      </Link>
      {status === "invullen" || status === "bezig" ? <p className="hw-stapnr" aria-live="polite">Stap {stap + 1} van {STAPPEN.length}</p> : null}
    </div>
  )

  if (status === "klaar" || status === "terugval") {
    return (
      <div className="hw ho-wizard">
        {kop}
        <div className="hw-inhoud">
          <p className="ho-lbl">Bevestiging</p>
          <h1 ref={kopRef} tabIndex={-1} className="hw-titel">
            {status === "klaar" ? "Bedankt. Ik bekijk je aanvraag zelf." : "Verzenden lukte niet. Er staat een e-mail voor je klaar."}
          </h1>
          {status === "klaar" ? (
            <>
              <p className="hw-uitleg">
                Je ontvangt een e-mail met een samenvatting en je referentienummer. Binnen twee werkdagen hoor je van mij: een afspraak om te komen
                kijken, een voorstel voor advies of inspectie, of eerlijk bericht als je project niet bij mij past.
              </p>
              <p className="hw-referentie">
                <span className="ho-lbl">Referentie</span> {referentie}
              </p>
            </>
          ) : (
            <>
              <p className="hw-uitleg">Je e-mailprogramma is geopend met dezelfde tekst. Verstuur hem daar, of mail naar {BUSINESS.email}.</p>
              <a href={mailto} className="ho-knop ho-knop-oranje">Open de e-mail opnieuw</a>
            </>
          )}
          <p>
            <Link href="/" className="ho-pijl">Terug naar de voorpagina <Pijl /></Link>
          </p>
        </div>
      </div>
    )
  }

  const st = STAPPEN[stap]
  const foutLijst = Object.entries(fouten).filter(([, w]) => w) as [keyof Stand, string][]
  const fotosBezig = fotos.some((f) => f.stand === "bezig")

  return (
    <div className="hw ho-wizard">
      {kop}
      <div className="hw-balk" role="progressbar" aria-label="Voortgang" aria-valuemin={1} aria-valuemax={STAPPEN.length} aria-valuenow={stap + 1}>
        <span style={{ width: `${((stap + 1) / STAPPEN.length) * 100}%` }} />
      </div>
      <form className="hw-inhoud" onSubmit={volgende} noValidate>
        <p className="ho-lbl">{st.lbl}</p>
        <h1 ref={kopRef} tabIndex={-1} className="hw-titel">{st.kop}</h1>
        <p className="hw-uitleg">{st.uitleg}</p>

        {foutLijst.length ? (
          <div ref={samenvattingRef} tabIndex={-1} role="alert" className="hw-samenvatting">
            <p>Nog {foutLijst.length === 1 ? "één ding" : `${foutLijst.length} dingen`} om aan te vullen:</p>
            <ul>
              {foutLijst.map(([k, w]) => (
                <li key={k}><a href={`#veld-${k}`}>{w}</a></li>
              ))}
            </ul>
          </div>
        ) : null}

        {stap === 0 ? <Keuzes naam="type" legenda={st.kop} lijst={TYPES} waarde={s.type} onKies={(id) => zet("type", id)} fout={fouten.type} /> : null}

        {stap === 1 ? (
          <div className="hw-velden">
            <Veld naam="situatie" label="Korte toelichting" fout={fouten.situatie}>
              <textarea id="veld-situatie" rows={5} value={s.situatie} onChange={(e) => zet("situatie", e.target.value)} aria-invalid={fouten.situatie ? true : undefined} aria-describedby={fouten.situatie ? "fout-situatie" : undefined} placeholder="Bijvoorbeeld: de vijver is groen en het filter is oud, de border erachter wil ik natuurlijker." />
            </Veld>
            <Veld naam="postcode" label="Postcode" fout={fouten.postcode}>
              <input id="veld-postcode" value={s.postcode} onChange={(e) => zet("postcode", e.target.value)} autoComplete="postal-code" inputMode="text" maxLength={7} className="hw-kort" aria-invalid={fouten.postcode ? true : undefined} aria-describedby={fouten.postcode ? "fout-postcode" : undefined} />
            </Veld>
            <Veld naam="oppervlakte" label="Oppervlakte" optioneel>
              <input id="veld-oppervlakte" value={s.oppervlakte} onChange={(e) => zet("oppervlakte", e.target.value)} placeholder="Bijvoorbeeld 80 m²" className="hw-kort" />
            </Veld>
            {s.type === "vijver" ? (
              <Veld naam="vijvertype" label="Soort vijver" optioneel>
                <select id="veld-vijvertype" value={s.vijvertype} onChange={(e) => zet("vijvertype", e.target.value)} className="hw-kort">
                  <option value="">Kies…</option>
                  {VIJVERTYPES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </Veld>
            ) : null}
            <p className="hw-legenda">Foto&apos;s <span className="hw-optioneel">· optioneel</span></p>
            <div
              className="hw-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                void kiesFotos(e.dataTransfer.files)
              }}
            >
              <p className="hw-drop-kop">Sleep je foto&apos;s hierheen</p>
              <p className="hw-optioneel" id={`${fotoId}-regels`}>Maximaal {MAX_FOTOS} foto&apos;s · JPG, PNG of HEIC · tot {MAX_MB} MB per foto</p>
              <input id={fotoId} type="file" accept="image/jpeg,image/png,image/heic,image/heif" multiple className="peer sr-only" aria-describedby={`${fotoId}-regels`} disabled={fotos.length >= MAX_FOTOS} onChange={(e) => { void kiesFotos(e.currentTarget.files); e.currentTarget.value = "" }} />
              <label htmlFor={fotoId} className="ho-knop ho-knop-lijn peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[3px]">
                {fotos.length ? "Nog een foto kiezen" : "Kies foto's"}
              </label>
            </div>
            {fotos.length ? (
              <ul className="hw-fotos" aria-live="polite">
                {fotos.map((f, i) => (
                  <li key={f.sleutel}>
                    {f.voorbeeld ? (
                      // eslint-disable-next-line @next/next/no-img-element -- een lokale blob: uit de browser
                      <img src={f.voorbeeld} alt="" />
                    ) : <span className="hw-foto-leeg" />}
                    <span className="hw-foto-stand">
                      Foto {i + 1}: {f.stand === "bezig" ? "uploaden…" : f.stand === "klaar" ? "ontvangen" : "lukte niet, probeer een andere"}
                    </span>
                    <button type="button" onClick={() => verwijder(f.sleutel)} className="hw-foto-weg">Verwijder<span className="sr-only"> foto {i + 1}</span></button>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="hw-optioneel">Je foto&apos;s worden privé bewaard, alleen voor deze aanvraag, en na 30 dagen verwijderd.</p>
          </div>
        ) : null}

        {stap === 2 ? (
          <div className="hw-velden">
            <Keuzes naam="budget" legenda="Aan welk budget denk je?" zichtbaar lijst={BUDGETTEN} waarde={s.budget} onKies={(id) => zet("budget", id)} fout={fouten.budget} />
            <Keuzes naam="planning" legenda="Wanneer wil je beginnen?" zichtbaar lijst={PLANNINGEN} waarde={s.planning} onKies={(id) => zet("planning", id)} fout={fouten.planning} />
          </div>
        ) : null}

        {stap === 3 ? (
          <div className="hw-velden">
            <Veld naam="naam" label="Naam" fout={fouten.naam}>
              <input id="veld-naam" value={s.naam} onChange={(e) => zet("naam", e.target.value)} autoComplete="name" aria-invalid={fouten.naam ? true : undefined} aria-describedby={fouten.naam ? "fout-naam" : undefined} />
            </Veld>
            <Veld naam="email" label="E-mail" fout={fouten.email}>
              <input id="veld-email" value={s.email} onChange={(e) => zet("email", e.target.value)} inputMode="email" autoComplete="email" aria-invalid={fouten.email ? true : undefined} aria-describedby={fouten.email ? "fout-email" : undefined} />
            </Veld>
            <Veld naam="telefoon" label="Telefoon" optioneel={s.kanaal === "email"} fout={fouten.telefoon}>
              <input id="veld-telefoon" type="tel" value={s.telefoon} onChange={(e) => zet("telefoon", e.target.value)} inputMode="tel" autoComplete="tel" aria-invalid={fouten.telefoon ? true : undefined} aria-describedby={fouten.telefoon ? "fout-telefoon" : undefined} />
            </Veld>
            <fieldset className="hw-veld">
              <legend>Voorkeur voor contact</legend>
              <div className="hw-chips">
                {KANALEN.map((k) => (
                  <label key={k.id} className="hw-chip">
                    <input type="radio" name="kanaal" value={k.id} checked={s.kanaal === k.id} onChange={() => zet("kanaal", k.id)} />
                    <span>{k.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="hw-veld">
              <label className="hw-akkoord">
                <input id="veld-akkoord" type="checkbox" checked={s.akkoord} onChange={(e) => zet("akkoord", e.target.checked)} aria-invalid={fouten.akkoord ? true : undefined} aria-describedby={fouten.akkoord ? "fout-akkoord" : undefined} />
                <span>
                  Ik ga akkoord met de <Link href="/privacy" target="_blank">privacyverklaring</Link>. Mijn aanvraag gaat via FormSubmit naar de mailbox van GRØNN Studio.
                </span>
              </label>
              {fouten.akkoord ? <p id="fout-akkoord" className="hw-fout">{fouten.akkoord}</p> : null}
            </div>
            {/* honeypot: mensen zien het niet, bots vullen het in */}
            <div aria-hidden className="absolute left-[-9999px]">
              <label>Website<input name="website" tabIndex={-1} autoComplete="off" onChange={() => { verzonden.current = true; setStatus("klaar") }} /></label>
            </div>
          </div>
        ) : null}

        <div className="hw-acties">
          {stap > 0 ? (
            <button type="button" className="hw-terug" onClick={() => naar(stap - 1)}>
              <span aria-hidden>←</span> Terug
            </button>
          ) : <span />}
          <button type="submit" className="ho-knop ho-knop-oranje" disabled={status === "bezig" || (stap === 1 && fotosBezig)}>
            {stap < LAATSTE ? <>Volgende stap <span aria-hidden>→</span></> : status === "bezig" ? "Versturen…" : <>Verstuur aanvraag <span aria-hidden>→</span></>}
          </button>
        </div>
      </form>
    </div>
  )
}

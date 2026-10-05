"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode, type RefObject } from "react"
import { flushSync } from "react-dom"

import { BUSINESS } from "@/lib/business"
import { CONTACT_BUDGETTEN } from "@/lib/data/teksten"
import type { L } from "@/lib/i18n"
import { focusEerste, useVeldControle } from "./controle"
import { CONTACT_REGELS } from "./invulvelden"

// Het kennismakingsformulier (WF-023) met de staten van WF-034. Vormgeving
// in de taal van de site (5 okt 2026): Montserrat, ronde oranje knop. Transport,
// velden, controle en meldingen letterlijk uit de oude site
// (src/components/gronn/contact-formulier.tsx): rechtstreeks vanuit de
// browser naar FormSubmit's AJAX-endpoint (FormSubmit blokkeert
// datacenter-IP's, dus NIET via de server). Succes pas na bevestiging;
// lukt verzenden niet, dan opent een e-mailconcept met dezelfde tekst.
// Honeypot + validatie in de browser.

const ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS.email}`

const SOORTEN: { id: string; label: string }[] = [
  { id: "ontwerp", label: "Ontwerp — meekijken of een plan" },
  { id: "aanleg", label: "Aanleg — leg de tuin aan" },
  { id: "onderhoud", label: "Onderhoud — per seizoen" },
  { id: "vijver", label: "Vijver of watersysteem" },
  { id: "anders", label: "Weet ik nog niet" },
]

const nl = (v: L) => v.nl

type Status = "invullen" | "bezig" | "verzonden" | "terugval"
type Velden = { naam: string; email: string; telefoon: string; plaats: string; soort: string; budget: string; bericht: string }

/* ---------- velden als regels op papier: label, lijn, geen kaders ---------- */

function Veld({
  label,
  optioneel,
  naam,
  voorbeeld,
  fout,
  opmerking,
  onBlur,
  onInput,
  regels,
  ...rest
}: {
  label: string
  optioneel?: boolean
  naam: string
  voorbeeld?: string
  fout?: string
  opmerking?: string
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onInput?: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  regels?: number
  type?: string
  inputMode?: "text" | "email" | "tel"
  autoComplete?: string
  verplicht?: boolean
}) {
  const id = useId()
  const veldId = `${id}-veld`
  const meldingId = `${id}-melding`
  const { verplicht, type = "text", inputMode, autoComplete } = rest
  const gedeeld = {
    id: veldId,
    name: naam,
    required: verplicht,
    placeholder: voorbeeld,
    "aria-invalid": fout ? true : undefined,
    "aria-describedby": fout || opmerking ? meldingId : undefined,
    onBlur,
    onInput,
    className: "w-full min-w-0 border-0 bg-transparent py-1 text-[18px] text-inkt outline-none placeholder:text-gedempt",
  }
  return (
    <div>
      <div
        className={`grid gap-y-1.5 border-b pb-2.5 md:grid-cols-[180px_minmax(0,1fr)] md:items-end md:gap-x-6 ${
          fout ? "border-oranje-tekst shadow-[0_1px_0_var(--oranje-tekst)]" : "border-inkt focus-within:shadow-[0_1px_0_var(--inkt)]"
        }`}
      >
        <label htmlFor={veldId} className={`lbl ${regels ? "md:self-start md:pt-2" : ""}`}>
          {label}
          {optioneel ? <span className="text-gedempt"> · optioneel</span> : null}
        </label>
        {regels ? (
          <textarea rows={regels} {...gedeeld} className={`${gedeeld.className} min-h-[120px] resize-y`} />
        ) : (
          <input type={type} inputMode={inputMode} autoComplete={autoComplete} {...gedeeld} />
        )}
      </div>
      {fout || opmerking ? (
        <p id={meldingId} className={`mt-2 mb-0 text-[14px] leading-5 ${fout ? "font-semibold text-oranje-tekst" : "text-gedempt"}`}>
          {fout ?? opmerking}
        </p>
      ) : null}
    </div>
  )
}

function Keuzes({
  legenda,
  naam,
  keuzes,
  gekozen,
  onKies,
  verplicht,
  fout,
}: {
  legenda: string
  naam: string
  keuzes: { id: string; label: string }[]
  gekozen: string
  onKies: (id: string) => void
  verplicht?: boolean
  fout?: string
}) {
  const foutId = `${naam}-fout`
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="lbl mb-3 p-0">{legenda}</legend>
      <div className="flex flex-wrap gap-2">
        {keuzes.map((k) => (
          <label key={k.id} className="cursor-pointer">
            <input
              type="radio"
              name={naam}
              value={k.id}
              checked={gekozen === k.id}
              onChange={() => onKies(k.id)}
              required={verplicht}
              aria-describedby={fout ? foutId : undefined}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-[44px] items-center rounded-full border border-lijn px-3.5 py-2 text-[14px] leading-[1.3] peer-checked:border-inkt peer-checked:bg-inkt peer-checked:text-grond peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inkt">
              {k.label}
            </span>
          </label>
        ))}
      </div>
      {fout ? (
        <p id={foutId} className="mt-2 mb-0 text-[14px] leading-5 font-semibold text-oranje-tekst">
          {fout}
        </p>
      ) : null}
    </fieldset>
  )
}

/* ---------- na verzenden (WF-034) ---------- */

function Staat({ kopRef, kop, sub, children }: { kopRef: RefObject<HTMLHeadingElement | null>; kop: string; sub: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby="staat-kop" className="mt-[clamp(56px,7vw,96px)] grid md:grid-cols-[3fr_9fr] md:gap-x-8">
      <div className="md:col-start-2">
        <div role="status" className="max-w-[40ch]">
          <h2 id="staat-kop" ref={kopRef} tabIndex={-1} className="syne m-0 text-[clamp(32px,4.4vw,60px)] leading-[1.05] tracking-[-.035em] outline-none">
            {kop}
          </h2>
          <p className="mt-5 mb-0 text-[clamp(17px,1.5vw,21px)] leading-[1.5] text-gedempt">{sub}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

function Samenvatting({ v }: { v: Velden }) {
  const rijen: [string, string][] = [
    ["Vraag", v.soort],
    ["Budget", v.budget],
    ["Naam", v.naam],
    ["E-mail", v.email],
    ["Telefoon", v.telefoon],
    ["Plaats of postcode", v.plaats],
    ["Bericht", v.bericht],
  ]
  return (
    <>
      <p className="lbl mt-12 mb-0 text-gedempt">Wat je hebt ingevuld</p>
      <dl className="mt-10 mb-0 max-w-[640px] border-t border-inkt">
        {rijen
          .filter(([, w]) => w)
          .map(([k, w]) => (
            <div key={k} className="grid gap-y-0.5 border-b border-lijn py-3 text-[15px] leading-[1.55] md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-6">
              <dt className="lbl pt-1 text-gedempt">{k}</dt>
              <dd className="m-0 whitespace-pre-line [overflow-wrap:anywhere]">{w}</dd>
            </div>
          ))}
      </dl>
    </>
  )
}

/* ---------- het formulier ---------- */

export function KennismakenFormulier() {
  const [status, setStatus] = useState<Status>("invullen")
  const [soort, setSoort] = useState("anders")
  const [budget, setBudget] = useState("")
  const [budgetFout, setBudgetFout] = useState(false)
  const [verstuurd, setVerstuurd] = useState<{ velden: Velden; onderwerp: string; mailto: string } | null>(null)
  const { veld, controleerAlles } = useVeldControle(CONTACT_REGELS, nl)
  const kopRef = useRef<HTMLHeadingElement>(null)

  // ?dienst=<soort> kiest het juiste soort vraag, als het er een van is.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("dienst")
    // eslint-disable-next-line react-hooks/set-state-in-effect -- eenmalig uit de URL, na hydratie
    if (id && SOORTEN.some((s) => s.id === id)) setSoort(id)
  }, [])

  // Na verzenden komt de melding op de plek van het formulier: focus erheen.
  useEffect(() => {
    if (status === "verzonden" || status === "terugval") kopRef.current?.focus()
  }, [status])

  async function verstuur(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (new FormData(form).get("website")) {
      setStatus("verzonden")
      return
    }
    // Eerst controleren (en kleine fouten rechtzetten), dan pas lezen.
    const fout = controleerAlles(form)
    if (!budget) fout.add("budget")
    flushSync(() => setBudgetFout(!budget))
    if (fout.size) {
      focusEerste(form, fout)
      return
    }
    const data = new FormData(form)
    const velden: Velden = {
      naam: String(data.get("naam") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      telefoon: String(data.get("telefoon") ?? "").trim(),
      plaats: String(data.get("plaats") ?? "").trim(),
      soort: SOORTEN.find((s) => s.id === data.get("soort"))?.label ?? SOORTEN[4].label,
      budget: CONTACT_BUDGETTEN.find((b) => b.id === data.get("budget"))?.label.nl ?? "",
      bericht: String(data.get("bericht") ?? "").trim(),
    }
    const tekst = [
      `Vraag: ${velden.soort}`,
      `Budget: ${velden.budget}`,
      `Naam: ${velden.naam}`,
      `E-mail: ${velden.email}`,
      velden.telefoon ? `Telefoon: ${velden.telefoon}` : null,
      velden.plaats ? `Plaats of postcode: ${velden.plaats}` : null,
      "",
      velden.bericht,
    ]
      .filter((r): r is string => typeof r === "string")
      .join("\n")
    const onderwerp = `Kennismaking — ${velden.soort}`
    const mailto = `${BUSINESS.emailHref}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(tekst)}`
    setVerstuurd({ velden, onderwerp, mailto })
    setStatus("bezig")
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: onderwerp,
          _template: "box",
          _captcha: "false",
          name: velden.naam,
          email: velden.email,
          budget: velden.budget,
          message: tekst,
        }),
      })
      const uit = (await res.json().catch(() => null)) as { success?: string | boolean } | null
      if (!res.ok || !(uit?.success === true || uit?.success === "true")) throw new Error("niet bezorgd")
      form.reset()
      setStatus("verzonden")
    } catch {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- mailto:, geen interne pagina
      window.location.href = mailto
      setStatus("terugval")
    }
  }

  if (status === "verzonden") {
    return (
      <Staat kopRef={kopRef} kop="Dank je, je bericht is binnen." sub="Ik reageer meestal binnen twee werkdagen.">
        {verstuurd ? <Samenvatting v={verstuurd.velden} /> : null}
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href="/" className="lnk">Terug naar de voorpagina</Link>
          <Link href="/werk" className="lnk">Bekijk mijn werk</Link>
        </div>
      </Staat>
    )
  }

  if (status === "terugval" && verstuurd) {
    return (
      <Staat
        kopRef={kopRef}
        kop="Verzenden lukte niet — er staat een e-mail voor je klaar."
        sub={`Je e-mailprogramma is geopend met dezelfde tekst. Verstuur hem daar, of mail naar ${BUSINESS.email}.`}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href={verstuurd.mailto}
            className="inline-flex h-[52px] items-center rounded-full bg-oranje px-6 text-[12px] font-semibold tracking-[.1em] text-antraciet uppercase no-underline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
          >
            Open de e-mail opnieuw
          </a>
          <a href={BUSINESS.phoneHref} className="lnk">Of bel {BUSINESS.phone}</a>
        </div>
        <p className="lbl mt-4 mb-0 max-w-[60ch] text-gedempt">Onderwerp: {verstuurd.onderwerp}</p>
      </Staat>
    )
  }

  return (
    <div className="mt-[clamp(64px,8vw,120px)] grid items-start gap-y-14 md:grid-cols-[7fr_1fr_4fr]">
      <form onSubmit={verstuur} noValidate aria-label="Kennismaken" className="relative flex flex-col gap-7">
        {/* E-mail is type="text" met inputMode="email" (zelfde toetsenbord):
            type="email" haalt spaties stil weg vóór de controle ze ziet. */}
        <Veld label="Naam" {...veld("naam")} verplicht autoComplete="name" />
        <Veld label="E-mail" {...veld("email")} inputMode="email" verplicht autoComplete="email" />
        <Veld label="Telefoon" optioneel {...veld("telefoon")} type="tel" inputMode="tel" autoComplete="tel" />
        <Veld label="Plaats of postcode" {...veld("plaats")} autoComplete="postal-code" />
        <Keuzes legenda="Waar gaat het over?" naam="soort" keuzes={SOORTEN} gekozen={soort} onKies={setSoort} />
        <Keuzes
          legenda="Wat is je budget?"
          naam="budget"
          // "€ 15.000" breekt nooit tussen teken en bedrag.
          keuzes={CONTACT_BUDGETTEN.map((b) => ({ id: b.id, label: b.label.nl.replace(/€ /g, "€ ") }))}
          gekozen={budget}
          onKies={(id) => {
            setBudget(id)
            setBudgetFout(false)
          }}
          verplicht
          fout={budgetFout ? "Kies je budget." : undefined}
        />
        <Veld label="Vertel kort over je tuin of vijver" {...veld("bericht")} verplicht regels={5} />
        {/* Het verborgen honeypotveld: mensen zien het niet, bots vullen het in. */}
        <div aria-hidden className="absolute left-[-9999px]">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === "bezig"}
          className="inline-flex h-[52px] cursor-pointer items-center self-start rounded-full border-0 bg-oranje px-7 text-[12px] font-semibold tracking-[.1em] text-antraciet uppercase transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt disabled:cursor-wait disabled:opacity-60"
        >
          {status === "bezig" ? "Versturen…" : "Verstuur →"}
        </button>
        <p className="lbl m-0 text-gedempt">
          Je bericht gaat via FormSubmit naar mijn mailbox. ·{" "}
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
        </p>
      </form>

      <aside aria-label="Contactgegevens" className="flex flex-col gap-5 border-t border-lijn pt-4 md:col-start-3">
        <p className="lbl m-0 text-gedempt">Liever direct?</p>
        <a href={BUSINESS.emailHref} className="w-lijnlink self-start text-[18px] [overflow-wrap:anywhere]">{BUSINESS.email}</a>
        <a href={BUSINESS.phoneHref} className="w-lijnlink self-start text-[18px] tabular-nums">{BUSINESS.phone}</a>
        <a href={BUSINESS.whatsapp} className="w-lijnlink self-start text-[18px]">WhatsApp</a>
        <p className="lbl mt-4 mb-0 text-gedempt">
          {BUSINESS.address.street} · {BUSINESS.address.postalCode} {BUSINESS.address.city}
          <br />
          KVK {BUSINESS.kvk}
        </p>
      </aside>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type ReactNode, type RefObject } from "react"
import { flushSync } from "react-dom"

import { BUSINESS } from "@/lib/business"
import { CONTACT_BUDGETTEN } from "@/lib/data/teksten"
import type { L } from "@/lib/i18n"
import { T, kies, type Tekst } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
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

const SOORTEN: { id: string; label: L }[] = [
  { id: "ontwerp", label: { nl: "Ontwerp — meekijken of een plan", en: "Design — a second look or a plan" } },
  { id: "aanleg", label: { nl: "Aanleg — leg de tuin aan", en: "Build — build the garden" } },
  { id: "onderhoud", label: { nl: "Onderhoud — per seizoen", en: "Care — season by season" } },
  { id: "vijver", label: { nl: "Vijver of watersysteem", en: "Pond or water system" } },
  { id: "anders", label: { nl: "Weet ik nog niet", en: "Not sure yet" } },
]

type Status = "invullen" | "bezig" | "verzonden" | "terugval"
// soort en budget in beide talen: de samenvatting volgt de taal, de mail naar mij blijft Nederlands.
type Velden = { naam: string; email: string; telefoon: string; plaats: string; soort: L; budget: L; bericht: string }

/* ---------- velden: label erboven, een licht vlak met rand om te typen ---------- */
// Eigenaar, 9 okt 2026: alleen een lijn met het label ver links was niet
// duidelijk genoeg. Nu staat het label direct boven een omrand veld en is
// het voorbeeld lichter dan wat je zelf typt.

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
  label: Tekst
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
    className: `block w-full min-w-0 rounded-[12px] border bg-veld px-4 py-3 text-[18px] text-inkt outline-none placeholder:text-voorbeeld focus:shadow-[0_0_0_1px_var(--inkt)] ${
      fout ? "border-oranje-tekst shadow-[0_0_0_1px_var(--oranje-tekst)]" : "border-gedempt focus:border-inkt"
    }`,
  }
  return (
    <div>
      <div className="flex flex-col gap-2">
        <label htmlFor={veldId} className="lbl">
          <T t={label} />
          {optioneel ? <span className="text-gedempt"> · <T t={{ nl: "optioneel", en: "optional" }} /></span> : null}
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
  legenda: Tekst
  naam: string
  keuzes: { id: string; label: Tekst }[]
  gekozen: string
  onKies: (id: string) => void
  verplicht?: boolean
  fout?: string
}) {
  const foutId = `${naam}-fout`
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="lbl mb-3 p-0"><T t={legenda} /></legend>
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
            <span className="inline-flex min-h-[44px] items-center rounded-full border border-gedempt px-3.5 py-2 text-[14px] leading-[1.3] peer-checked:border-inkt peer-checked:bg-inkt peer-checked:text-grond peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-inkt">
              <T t={k.label} />
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

function Staat({ kopRef, kop, sub, children }: { kopRef: RefObject<HTMLHeadingElement | null>; kop: Tekst; sub: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby="staat-kop" className="mt-[clamp(56px,7vw,96px)] grid md:grid-cols-[3fr_9fr] md:gap-x-8">
      <div className="md:col-start-2">
        <div role="status" className="max-w-[40ch]">
          <h2 id="staat-kop" ref={kopRef} tabIndex={-1} className="syne m-0 text-[clamp(32px,4.4vw,60px)] leading-[1.05] tracking-[-.035em] outline-none">
            <T t={kop} />
          </h2>
          <p className="mt-5 mb-0 text-[clamp(17px,1.5vw,21px)] leading-[1.5] text-gedempt">{sub}</p>
        </div>
        {children}
      </div>
    </section>
  )
}

function Samenvatting({ v }: { v: Velden }) {
  const rijen: [L, Tekst][] = [
    [{ nl: "Vraag", en: "Question" }, v.soort],
    [{ nl: "Budget", en: "Budget" }, v.budget],
    [{ nl: "Naam", en: "Name" }, v.naam],
    [{ nl: "E-mail", en: "E-mail" }, v.email],
    [{ nl: "Telefoon", en: "Phone" }, v.telefoon],
    [{ nl: "Plaats of postcode", en: "Town or postcode" }, v.plaats],
    [{ nl: "Bericht", en: "Message" }, v.bericht],
  ]
  return (
    <>
      <p className="lbl mt-12 mb-0 text-gedempt"><T t={{ nl: "Wat je hebt ingevuld", en: "What you filled in" }} /></p>
      <dl className="mt-10 mb-0 max-w-[640px] border-t border-inkt">
        {rijen
          .filter(([, w]) => kies(w, "nl"))
          .map(([k, w]) => (
            <div key={k.nl} className="grid gap-y-0.5 border-b border-lijn py-3 text-[15px] leading-[1.55] md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-6">
              <dt className="lbl pt-1 text-gedempt"><T t={k} /></dt>
              <dd className="m-0 whitespace-pre-line [overflow-wrap:anywhere]"><T t={w} /></dd>
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
  const taal = useTaal()
  const { veld, controleerAlles } = useVeldControle(CONTACT_REGELS, (v: L) => kies(v, taal))
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
      budget: CONTACT_BUDGETTEN.find((b) => b.id === data.get("budget"))?.label ?? { nl: "", en: "" },
      bericht: String(data.get("bericht") ?? "").trim(),
    }
    const tekst = [
      `Vraag: ${velden.soort.nl}`,
      `Budget: ${velden.budget.nl}`,
      `Naam: ${velden.naam}`,
      `E-mail: ${velden.email}`,
      velden.telefoon ? `Telefoon: ${velden.telefoon}` : null,
      velden.plaats ? `Plaats of postcode: ${velden.plaats}` : null,
      "",
      velden.bericht,
    ]
      .filter((r): r is string => typeof r === "string")
      .join("\n")
    const onderwerp = `Kennismaking — ${velden.soort.nl}`
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
          budget: velden.budget.nl,
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
      <Staat
        kopRef={kopRef}
        kop={{ nl: "Dank je, je bericht is binnen.", en: "Thank you, your message has arrived." }}
        sub={<T t={{ nl: "Ik reageer meestal binnen twee werkdagen.", en: "I usually reply within two working days." }} />}
      >
        {verstuurd ? <Samenvatting v={verstuurd.velden} /> : null}
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href="/" className="lnk"><T t={{ nl: "Terug naar de voorpagina", en: "Back to the home page" }} /></Link>
          <Link href="/werk" className="lnk"><T t={{ nl: "Bekijk mijn werk", en: "See my work" }} /></Link>
        </div>
      </Staat>
    )
  }

  if (status === "terugval" && verstuurd) {
    return (
      <Staat
        kopRef={kopRef}
        kop={{ nl: "Verzenden lukte niet — er staat een e-mail voor je klaar.", en: "Sending failed — an e-mail is ready for you." }}
        sub={
          <T
            t={{
              nl: `Je e-mailprogramma is geopend met dezelfde tekst. Verstuur hem daar, of mail naar ${BUSINESS.email}.`,
              en: `Your e-mail app opened with the same text. Send it from there, or write to ${BUSINESS.email}.`,
            }}
          />
        }
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a
            href={verstuurd.mailto}
            className="inline-flex h-[52px] items-center rounded-full bg-oranje px-6 text-[12px] font-semibold tracking-[.1em] text-antraciet uppercase no-underline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt"
          >
            <T t={{ nl: "Open de e-mail opnieuw", en: "Open the e-mail again" }} />
          </a>
          <a href={BUSINESS.phoneHref} className="lnk"><T t={{ nl: "Of bel", en: "Or call" }} /> {BUSINESS.phone}</a>
        </div>
        <p className="lbl mt-4 mb-0 max-w-[60ch] text-gedempt"><T t={{ nl: "Onderwerp", en: "Subject" }} />: {verstuurd.onderwerp}</p>
      </Staat>
    )
  }

  return (
    <div className="mt-[clamp(64px,8vw,120px)] grid items-start gap-y-14 md:grid-cols-[7fr_1fr_4fr]">
      <form onSubmit={verstuur} noValidate aria-label={kies({ nl: "Kennismaken", en: "Get in touch" }, taal)} className="relative flex flex-col gap-6">
        {/* E-mail is type="text" met inputMode="email" (zelfde toetsenbord):
            type="email" haalt spaties stil weg vóór de controle ze ziet. */}
        <Veld label={{ nl: "Naam", en: "Name" }} {...veld("naam")} verplicht autoComplete="name" />
        <Veld label="E-mail" {...veld("email")} inputMode="email" verplicht autoComplete="email" />
        <Veld label={{ nl: "Telefoon", en: "Phone" }} optioneel {...veld("telefoon")} type="tel" inputMode="tel" autoComplete="tel" />
        <Veld label={{ nl: "Plaats of postcode", en: "Town or postcode" }} {...veld("plaats")} autoComplete="postal-code" />
        <Keuzes legenda={{ nl: "Waar gaat het over?", en: "What is it about?" }} naam="soort" keuzes={SOORTEN} gekozen={soort} onKies={setSoort} />
        <Keuzes
          legenda={{ nl: "Wat is je budget?", en: "What is your budget?" }}
          naam="budget"
          // "€ 15.000" breekt nooit tussen teken en bedrag.
          keuzes={CONTACT_BUDGETTEN.map((b) => ({ id: b.id, label: { nl: b.label.nl.replace(/€ /g, "€ "), en: b.label.en } }))}
          gekozen={budget}
          onKies={(id) => {
            setBudget(id)
            setBudgetFout(false)
          }}
          verplicht
          fout={budgetFout ? kies({ nl: "Kies je budget.", en: "Choose your budget." }, taal) : undefined}
        />
        <Veld label={{ nl: "Vertel kort over je tuin of vijver", en: "Tell me briefly about your garden or pond" }} {...veld("bericht")} verplicht regels={5} />
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
          {status === "bezig" ? <T t={{ nl: "Versturen…", en: "Sending…" }} /> : <T t={{ nl: "Verstuur →", en: "Send →" }} />}
        </button>
        <p className="lbl m-0 text-gedempt">
          <T t={{ nl: "Je bericht gaat via FormSubmit naar mijn mailbox.", en: "Your message reaches my inbox via FormSubmit." }} /> ·{" "}
          <Link href="/privacy" className="underline underline-offset-4">Privacy</Link>
        </p>
      </form>

      <aside aria-label={kies({ nl: "Contactgegevens", en: "Contact details" }, taal)} className="flex flex-col gap-5 border-t border-lijn pt-4 md:col-start-3">
        <p className="lbl m-0 text-gedempt"><T t={{ nl: "Liever direct?", en: "Rather direct?" }} /></p>
        <a href={BUSINESS.emailHref} className="w-lijnlink self-start text-[18px] [overflow-wrap:anywhere]">{BUSINESS.email}</a>
        <a href={BUSINESS.phoneHref} className="w-lijnlink self-start text-[18px] tabular-nums">{BUSINESS.phone}</a>
        <a href="/contact.vcf" download="gronn-studio.vcf" className="w-lijnlink self-start text-[15px]"><T t={{ nl: "Visitekaartje bewaren", en: "Save business card" }} /></a>
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

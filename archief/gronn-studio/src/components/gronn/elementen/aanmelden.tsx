"use client"

import Link from "next/link"
import { useId, useState, type FormEvent } from "react"
import { flushSync } from "react-dom"

import { useLanguage } from "@/components/language-provider"
import { BUSINESS } from "@/lib/business"
import { pick, type L } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { controleerEmail, VOORBEELD } from "@/lib/invulvelden"
import { DUBBELE_OPTIN, MAILERLITE, modus as bepaalModus, verzoek, type MailerLiteConfig } from "@/lib/nieuwsbrief"
import { Honingpot } from "./formulier"
import { accentTekst, gedempt, type Toon } from "./toon"

// Aanmelden voor de maillijst, met de checklist vooraf als weggever.
// Eén e-mailveld, één knop, een honeypot en een regel die zegt wat je
// krijgt. Het transport staat in src/lib/nieuwsbrief.ts: MailerLite als
// de ID's er zijn, anders FormSubmit (browser → FormSubmit AJAX, zoals
// het contactformulier). De bevestiging zegt per stand wat er echt
// gebeurt — in de FormSubmit-stand stuurt Nick de checklist zelf, dus
// belooft de site geen automatische mail.
//
// `soort="blok"` voor een sectie (home, /faq), `"compact"` voor een smalle plek.
// Op een donker merkvlak (`toon="bos"`) wordt de knop een omlijning: daar
// staat al een oranje knop, en er is één oranje accent per compositie.
// Er beweegt niets behalve de kleurovergang van knop en veld.
//
// Het veld (eigenaar, 28 sep 2026): een licht gedrukt voorbeeld, en een
// foutregel die zegt wat er wél verwacht wordt — bij blur als er getypt
// is, daarna bij elke invoer tot het klopt, en bij versturen. Spaties
// rond het adres gaan er vanzelf af, met een regel die dat zegt. De
// regels staan in src/lib/invulvelden.ts, dezelfde als het contactformulier.

type Status = "invullen" | "bezig" | "verzonden" | "mislukt"

// Het voorbeeld op bos: gebroken wit op 65 % haalt 4,75:1 op bosgroen en
// 6,7:1 op antraciet, en blijft stiller dan de gedempte tekst (75 %).
const VAK: Record<Toon, string> = {
  grond: "border-line/25 bg-background text-foreground placeholder:text-placeholder",
  bos: "border-gronn-white/40 bg-transparent text-gronn-white placeholder:text-gronn-white/65",
}
// De foutrand in de kleur van de foutregel (accentTekst): 2px zonder te verspringen.
const VAK_FOUT: Record<Toon, string> = {
  grond: "border-[var(--ember-text)] shadow-[inset_0_0_0_1px_var(--ember-text)] focus:border-[var(--ember-text)]",
  bos: "border-gronn-light shadow-[inset_0_0_0_1px_var(--gronn-light)] focus:border-gronn-light",
}

const KNOP: Record<Toon, string> = {
  grond:
    "bg-gronn-ember text-gronn-black hover:bg-[#e57a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]",
  bos: "border border-current/30 text-gronn-white hover:border-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gronn-white",
}

export function Aanmelden({
  plek,
  soort = "blok",
  toon = "grond",
  config = MAILERLITE,
}: {
  /** Waar het formulier staat ("home", "faq"); reist mee naar Nick. */
  plek: string
  soort?: "blok" | "compact"
  toon?: Toon
  /** Alleen voor tests: een andere MailerLite-configuratie. */
  config?: MailerLiteConfig
}) {
  const { locale } = useLanguage()
  const t = (v: L) => pick(v, locale)
  const id = useId()
  const [status, setStatus] = useState<Status>("invullen")
  const [fout, setFout] = useState<L | undefined>()
  const [opmerking, setOpmerking] = useState<L | undefined>()
  const [aangeraakt, setAangeraakt] = useState(false)
  const [adres, setAdres] = useState("")
  const stand = bepaalModus(config)
  const klein = soort === "compact"

  const veldId = `${id}-email`
  const foutId = `${id}-fout`
  const opmerkingId = `${id}-opmerking`
  const regelId = `${id}-regel`

  async function verstuur(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const uitslag = controleerEmail(String(data.get("email") ?? ""))
    const email = uitslag.waarde
    // Bots vullen het verborgen veld; ze krijgen een bedankje, Nick niets.
    if (data.get("website")) {
      setAdres(email)
      setStatus("verzonden")
      return
    }
    if (uitslag.fout) {
      // Synchroon, zodat de foutregel al bestaat als de focus op het veld
      // landt en een schermlezer hem via aria-describedby meeleest.
      flushSync(() => {
        setAdres(email)
        setFout(uitslag.fout)
        setOpmerking(undefined)
      })
      form.querySelector<HTMLInputElement>('input[name="email"]')?.focus()
      return
    }
    setAdres(email)
    setFout(undefined)
    setStatus("bezig")
    const { url, init } = verzoek(email, { cfg: config, locale, plek })
    try {
      const res = await fetch(url, init)
      const uit = (await res.json().catch(() => null)) as { success?: string | boolean } | null
      if (!res.ok || !(uit?.success === true || uit?.success === "true")) throw new Error("niet bezorgd")
      setAdres(email)
      setStatus("verzonden")
    } catch {
      setStatus("mislukt")
    }
  }

  const tekstKleur = toon === "bos" ? "text-gronn-white" : "text-foreground"

  if (status === "verzonden") {
    return (
      <div role="status" data-aanmelden="verzonden" className={tekstKleur}>
        <p className={klein ? "tekst-h3" : "font-heading text-[24px] leading-tight"}>
          {stand === "mailerlite"
            ? DUBBELE_OPTIN
              ? t({ nl: "Bijna klaar: kijk in je mail.", en: "Almost done: check your e-mail." })
              : t({ nl: "Dank je, je bent aangemeld.", en: "Thank you, you’re signed up." })
            : t({ nl: "Dank je, je aanvraag is binnen.", en: "Thank you, your request has arrived." })}
        </p>
        <p className={`mt-3 text-[15px] leading-relaxed ${gedempt(toon)}`}>
          {stand === "mailerlite"
            ? DUBBELE_OPTIN
              ? t({
                  nl: `Je krijgt een mail op ${adres} met een bevestigingsknop. Klik die, dan komt de checklist. Niets gezien? Kijk even in je spam.`,
                  en: `You’ll get an e-mail at ${adres} with a confirm button. Click it, and the checklist follows. Nothing there? Check your spam folder.`,
                })
              : t({
                  nl: `De checklist komt per mail naar ${adres}.`,
                  en: `The checklist comes by e-mail to ${adres}.`,
                })
            : t({
                nl: `Ik stuur je de checklist zelf, naar ${adres}.`,
                en: `I’ll send you the checklist myself, to ${adres}.`,
              })}
        </p>
      </div>
    )
  }

  return (
    // noValidate: de controle is de eigen (controleerEmail), met een foutregel
    // in de taal van de pagina in plaats van de Engelse bel van de browser.
    <form onSubmit={verstuur} noValidate data-aanmelden={stand} className={`relative grid gap-3 ${tekstKleur}`}>
      <label htmlFor={veldId} className="block text-[14px] font-semibold">
        {t({ nl: "Je e-mailadres", en: "Your e-mail address" })}
      </label>
      <div className={`flex flex-col gap-3 ${klein ? "sm:flex-row" : "sm:flex-row sm:items-stretch"}`}>
        <input
          id={veldId}
          name="email"
          // text + inputMode email: zelfde toetsenbord, maar de spaties
          // blijven zichtbaar voor de controle (zie contact-formulier).
          type="text"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={t(VOORBEELD.email)}
          value={adres}
          onChange={(e) => {
            setAdres(e.target.value)
            setAangeraakt(true)
            setOpmerking(undefined)
            // Na een eerste fout bij elke invoer opnieuw, zodat de regel
            // verdwijnt zodra het adres klopt.
            if (fout) setFout(controleerEmail(e.target.value).fout)
          }}
          onBlur={(e) => {
            if (!aangeraakt && !fout) return
            const uit = controleerEmail(e.target.value)
            setAdres(uit.waarde)
            setFout(uit.fout)
            setOpmerking(uit.opmerking)
          }}
          aria-invalid={fout ? true : undefined}
          aria-describedby={[fout ? foutId : opmerking ? opmerkingId : null, regelId].filter(Boolean).join(" ")}
          className={`min-h-[52px] w-full min-w-0 flex-1 rounded-[8px] border px-[16px] text-[16px] outline-none transition-colors focus:border-[var(--gronn-ember)] motion-reduce:transition-none ${VAK[toon]} ${fout ? VAK_FOUT[toon] : ""}`}
        />
        <button
          type="submit"
          disabled={status === "bezig"}
          className={`tekst-knop inline-flex min-h-[52px] shrink-0 items-center justify-between gap-6 rounded-full px-5 transition-colors disabled:opacity-60 ${KNOP[toon]}`}
        >
          {status === "bezig"
            ? t({ nl: "Versturen…", en: "Sending…" })
            : t({ nl: "Stuur me de checklist", en: "Send me the checklist" })}
          <span aria-hidden>→</span>
        </button>
      </div>
      {fout ? (
        <p id={foutId} data-veld-melding="fout" className={`text-[14px] font-semibold leading-[20px] ${accentTekst(toon)}`}>
          {t(fout)}
        </p>
      ) : opmerking ? (
        <p id={opmerkingId} data-veld-melding="opmerking" className={`text-[14px] leading-[20px] ${gedempt(toon)}`}>
          {t(opmerking)}
        </p>
      ) : null}
      {status === "mislukt" && (
        <p role="alert" className={`text-[14px] leading-relaxed ${tekstKleur}`}>
          {t({ nl: "Aanmelden lukte niet. Mail me op ", en: "Signing up failed. E-mail me at " })}
          <a
            href={`${BUSINESS.emailHref}?subject=${encodeURIComponent("Checklist vooraf")}`}
            className="inline-flex min-h-[24px] items-center font-semibold underline underline-offset-4"
          >
            {BUSINESS.email}
          </a>
          {t({ nl: ", dan stuur ik je de checklist zelf.", en: " and I’ll send you the checklist myself." })}
        </p>
      )}
      <p id={regelId} className={`text-[13px] leading-relaxed ${gedempt(toon)}`}>
        {t({
          nl: "Je krijgt de checklist en af en toe een mail van mij. Afmelden kan altijd.",
          en: "You get the checklist and now and then an e-mail from me. You can unsubscribe at any time.",
        })}{" "}
        {stand === "mailerlite"
          ? t({ nl: "Je adres staat bij MailerLite, waarmee ik de mails verstuur.", en: "Your address is kept at MailerLite, which I use to send the e-mails." })
          : t({ nl: "Je adres gaat via FormSubmit naar mijn mailbox.", en: "Your address reaches my inbox via FormSubmit." })}{" "}
        <Link href={localePath(locale, "/privacy")} className="inline-flex min-h-[24px] items-center underline underline-offset-4">
          {t({ nl: "Privacy", en: "Privacy" })}
        </Link>
      </p>
      <Honingpot />
    </form>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { flushSync } from "react-dom"

import { useLanguage } from "@/components/language-provider"
import { BUSINESS } from "@/lib/business"
import type { ServiceKind } from "@/lib/data/services"
import { pick, type L } from "@/lib/i18n"
import { CONTACT_REGELS } from "@/lib/invulvelden"
import { localePath } from "@/lib/locale"
import { BosVlak, focusEerste, Honingpot, KeuzePillen, useVeldControle, Veld } from "./elementen"
import { CONTACT_BUDGETTEN } from "./teksten"

// Het contactformulier van V5. Nieuw van vorm, zelfde transport als
// altijd: rechtstreeks vanuit de browser naar FormSubmit's AJAX-endpoint
// (FormSubmit blokkeert datacenter-IP's, dus NIET via de server — zie
// CLAUDE.md). Succes pas na bevestiging; lukt verzenden niet, dan opent
// een e-mailconcept met dezelfde tekst. Honeypot + validatie in de
// browser. /privacy beschrijft dit transport en blijft dus kloppen.
//
// De controle is de eigen (noValidate): elk veld heeft een licht gedrukt
// voorbeeld en een foutregel in de taal van de pagina die zegt wat er
// wél verwacht wordt, bij blur en — na een eerste fout — bij invoer
// (useVeldControle, src/lib/invulvelden.ts). Bij versturen gaat de focus
// naar het eerste foute veld, het budget meegerekend.

const ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS.email}`

// De eerste drie zijn de niveaus van /services (ServiceKind): een
// ?dienst=<slug> kiest er één via levelOf (contact/page.tsx). Advies aan
// huis valt sinds 28 sep 2026 onder Ontwerp.
const SOORTEN: { id: ServiceKind | "vijver" | "anders"; label: L }[] = [
  { id: "ontwerp", label: { nl: "Ontwerp — meekijken of een plan", en: "Design — a second look or a plan" } },
  { id: "aanleg", label: { nl: "Aanleg — leg de tuin aan", en: "Build — build the garden" } },
  { id: "onderhoud", label: { nl: "Onderhoud — per seizoen", en: "Care — season by season" } },
  { id: "vijver", label: { nl: "Vijver of watersysteem", en: "Pond or water system" } },
  { id: "anders", label: { nl: "Weet ik nog niet", en: "Not sure yet" } },
]

// Wat is je budget? Staat in teksten.ts: de checklist vooraf noemt
// dezelfde drie, en twee lijsten van dezelfde vraag lopen uit elkaar.
const BUDGETTEN = CONTACT_BUDGETTEN

type Status = "invullen" | "bezig" | "verzonden" | "terugval"

export function ContactFormulier({ dienstSoort }: { dienstSoort?: Record<string, string> }) {
  const { locale } = useLanguage()
  const t = (v: L) => pick(v, locale)
  const [status, setStatus] = useState<Status>("invullen")
  const [soort, setSoort] = useState("anders")
  const [budget, setBudget] = useState("")
  const [budgetFout, setBudgetFout] = useState(false)
  const { veld, controleerAlles } = useVeldControle(CONTACT_REGELS, t)

  // ?dienst=<slug> vanaf een dienstpagina kiest het juiste soort vraag.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("dienst")
    const gevonden = slug ? dienstSoort?.[slug] : undefined
    // eslint-disable-next-line react-hooks/set-state-in-effect -- eenmalig uit de URL, na hydratie
    if (gevonden) setSoort(gevonden)
  }, [dienstSoort])

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
    const velden = {
      naam: String(data.get("naam") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      telefoon: String(data.get("telefoon") ?? "").trim(),
      plaats: String(data.get("plaats") ?? "").trim(),
      soort: t(SOORTEN.find((s) => s.id === data.get("soort"))?.label ?? SOORTEN[4].label),
      budget: t(BUDGETTEN.find((b) => b.id === data.get("budget"))?.label ?? { nl: "", en: "" }),
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
      window.location.href = `${BUSINESS.emailHref}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(tekst)}`
      setStatus("terugval")
    }
  }

  if (status === "verzonden" || status === "terugval") {
    return (
      <BosVlak>
        <div role="status">
        <p className="font-heading text-[28px] leading-tight">
          {status === "verzonden"
            ? t({ nl: "Dank je, je bericht is binnen.", en: "Thank you, your message has arrived." })
            : t({ nl: "Verzenden lukte niet — er staat een e-mail voor je klaar.", en: "Sending failed — an e-mail is ready for you." })}
        </p>
        <p className="mt-4 text-[16px] leading-relaxed text-white/85">
          {status === "verzonden"
            ? t({ nl: "Ik reageer meestal binnen twee werkdagen.", en: "I usually reply within two working days." })
            : t({ nl: `Je e-mailprogramma is geopend met dezelfde tekst. Verstuur hem daar, of mail naar ${BUSINESS.email}.`, en: `Your e-mail app opened with the same text. Send it from there, or write to ${BUSINESS.email}.` })}
        </p>
        </div>
      </BosVlak>
    )
  }

  return (
    <form onSubmit={verstuur} className="relative grid gap-[20px]" noValidate>
      {/* E-mail is type="text" met inputMode="email" (zelfde toetsenbord):
          type="email" haalt spaties stil weg vóór de controle ze ziet, en
          dan kan het formulier niet zeggen dat het ze weghaalde. */}
      <div className="grid gap-[20px] sm:grid-cols-2">
        <Veld label={t({ nl: "Naam", en: "Name" })} {...veld("naam")} verplicht autoComplete="name" />
        <Veld label={t({ nl: "E-mail", en: "E-mail" })} {...veld("email")} type="text" inputMode="email" verplicht autoComplete="email" />
        <Veld label={t({ nl: "Telefoon", en: "Phone" })} {...veld("telefoon")} type="tel" inputMode="tel" autoComplete="tel" optioneel={t({ nl: "optioneel", en: "optional" })} />
        <Veld label={t({ nl: "Plaats of postcode", en: "Town or postcode" })} {...veld("plaats")} autoComplete="postal-code" />
      </div>
      <KeuzePillen
        legenda={t({ nl: "Waar gaat het over?", en: "What is it about?" })}
        naam="soort"
        keuzes={SOORTEN.map((s) => ({ id: s.id, tekst: t(s.label) }))}
        gekozen={soort}
        onKies={setSoort}
      />
      <KeuzePillen
        legenda={t({ nl: "Wat is je budget?", en: "What is your budget?" })}
        naam="budget"
        // "€ 15.000" breekt nooit tussen teken en bedrag.
        keuzes={BUDGETTEN.map((b) => ({ id: b.id, tekst: t(b.label).replace(/€ /g, "€\u00a0") }))}
        gekozen={budget}
        onKies={(id) => {
          setBudget(id)
          setBudgetFout(false)
        }}
        verplicht
        fout={budgetFout ? t({ nl: "Kies je budget.", en: "Choose your budget." }) : undefined}
      />
      <Veld label={t({ nl: "Vertel kort over je tuin of vijver", en: "Tell me briefly about your garden or pond" })} {...veld("bericht")} verplicht regels={6} />
      <Honingpot />
      <div className="flex flex-wrap items-center gap-[20px]">
        <button
          type="submit"
          disabled={status === "bezig"}
          className="tekst-knop inline-flex min-h-[52px] items-center gap-6 rounded-full bg-gronn-ember px-5 text-gronn-black transition-colors hover:bg-[#e57a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)] disabled:opacity-60"
        >
          {status === "bezig" ? t({ nl: "Versturen…", en: "Sending…" }) : t({ nl: "Verstuur", en: "Send" })}
          <span aria-hidden>→</span>
        </button>
        <p className="text-[13px] text-muted">
          {t({ nl: "Je bericht gaat via FormSubmit naar mijn mailbox.", en: "Your message reaches my inbox via FormSubmit." })}{" "}
          <Link href={localePath(locale, "/privacy")} className="inline-flex min-h-[24px] items-center underline underline-offset-4">
            {t({ nl: "Privacy", en: "Privacy" })}
          </Link>
        </p>
      </div>
    </form>
  )
}

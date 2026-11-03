"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckIcon, PaperclipIcon } from "lucide-react"

import { useT } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { priceHint } from "@/lib/data/pricing"
import {
  SERVICE_GROUPS,
  servicesInGroup,
  type Service,
  type ServiceGroup,
} from "@/lib/data/services"
import { priceLabel } from "@/lib/format"
import type { L } from "@/lib/i18n"

// Guided project intake (outline §10): four steps instead of a generic
// contact form. Submits directly from the browser to FormSubmit (their
// AJAX endpoint 403s datacenter IPs, so a server relay cannot work); if
// delivery fails, falls back to composing a mailto draft so no enquiry is
// ever lost.

// The first question used to be a flat list of seven project types that
// predated the two-family structure. It now asks which half of the
// practice you are here for — a months-long design conversation, or a
// dated job with a price — and only then which service. Same number of
// steps, better answers, and it mirrors what the site now says everywhere
// else.

const STEPS: L[] = [
  { en: "What you need", nl: "Wat je zoekt" },
  { en: "Which service", nl: "Welke dienst" },
  { en: "Project Information", nl: "Projectinformatie" },
  { en: "Uploads", nl: "Uploads" },
]

/** One of the two doors. Carries the sentence that says what it is for. */
function FamilyCard({
  group,
  selected,
  onSelect,
  t,
}: {
  group: ServiceGroup
  selected: boolean
  onSelect: () => void
  t: (l: L) => string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "tap-target rounded-lg border p-6 text-left transition-colors",
        selected
          ? "border-gronn-green bg-gronn-green/10"
          : "border-line/15 bg-surface/60 hover:border-gronn-green/50"
      )}
    >
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-full",
            selected ? "bg-gronn-green" : "bg-line/40"
          )}
        />
        <span className="font-heading text-lg font-semibold">
          {t(group.label)}
        </span>
      </span>
      <span className="mt-3 block text-sm leading-relaxed text-muted">
        {t(group.intro)}
      </span>
    </button>
  )
}

/** A service to pick, with what it starts at when there is a price. */
function ServiceChip({
  service,
  selected,
  onSelect,
  t,
}: {
  service: Service
  selected: boolean
  onSelect: () => void
  t: (l: L) => string
}) {
  const hint = priceHint(service.slug)
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "tap-target flex items-baseline justify-between gap-4 rounded-lg border px-4 py-3 text-left transition-colors",
        selected
          ? "border-gronn-green bg-gronn-green/15"
          : "border-line/15 hover:border-gronn-green/50"
      )}
    >
      <span className="text-sm text-foreground">{t(service.title)}</span>
      {hint && (
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
          {hint.monthly
            ? `${priceLabel(hint.from)}${t({ en: "/mo", nl: "/mnd" })}`
            : `${t({ en: "from", nl: "vanaf" })} ${priceLabel(hint.from)}`}
        </span>
      )}
    </button>
  )
}

type Details = {
  name: string
  email: string
  location: string
  size: string
  condition: string
  outcome: string
  budget: string
  timeframe: string
}

const EMPTY_DETAILS: Details = {
  name: "",
  email: "",
  location: "",
  size: "",
  condition: "",
  outcome: "",
  budget: "",
  timeframe: "",
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  textarea?: boolean
}) {
  const cls =
    "w-full rounded-lg border border-line/15 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-gronn-green"
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  )
}

export function IntakeForm({ services }: { services: Service[] }) {
  const t = useT()
  const [step, setStep] = useState(0)
  const [family, setFamily] = useState<ServiceGroup["kind"] | null>(null)
  const [serviceSlug, setServiceSlug] = useState<string | null>(null)
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS)
  const [files, setFiles] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [fellBack, setFellBack] = useState(false)
  // Honeypot — hidden from humans, tempting for bots.
  const [company, setCompany] = useState("")

  const setDetail = (key: keyof Details) => (value: string) =>
    setDetails((d) => ({ ...d, [key]: value }))

  const canContinue =
    step === 0
      ? family !== null
      : step === 1
        ? serviceSlug !== null
        : step === 2
          ? details.name.trim() !== "" &&
            details.email.trim() !== "" &&
            details.location.trim() !== ""
          : true

  // What the studio reads in the inbox. Slugs are for the code; the email
  // gets the names, in the language the visitor filled the form in.
  const chosenGroup = SERVICE_GROUPS.find((g) => g.kind === family)
  const chosenService = services.find((s) => s.slug === serviceSlug)
  const chosenLabel = [
    chosenGroup ? t(chosenGroup.label) : null,
    chosenService ? t(chosenService.title) : null,
  ]
    .filter(Boolean)
    .join(" — ")

  async function handleSubmit() {
    if (sending) return
    setSending(true)
    // Honeypot: bots that filled the hidden field get a fake success.
    if (company) {
      setSending(false)
      setSubmitted(true)
      return
    }
    try {
      // Submitted straight from the visitor's browser: FormSubmit blocks
      // datacenter IPs (Vercel functions get 403), while browser-origin
      // requests are exactly what it is designed for. Same processor and
      // privacy disclosure as before.
      const message = [
        `Service: ${chosenLabel}`,
        `Name: ${details.name}`,
        `Email: ${details.email}`,
        `Location: ${details.location}`,
        `Approximate size: ${details.size}`,
        `Current condition: ${details.condition}`,
        `Desired outcome: ${details.outcome}`,
        `Budget indication: ${details.budget}`,
        `Preferred timeframe: ${details.timeframe}`,
        files.length
          ? `Attachments to follow by email: ${files.join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")

      const res = await fetch("https://formsubmit.co/ajax/hello@gronn.studio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `Project enquiry — ${chosenLabel || "website"}`,
          _template: "box",
          _captcha: "false",
          name: details.name,
          email: details.email,
          message,
        }),
      })
      const result = (await res.json().catch(() => null)) as
        | { success?: string | boolean }
        | null
      const ok =
        res.ok && (result?.success === true || result?.success === "true")
      if (!ok) throw new Error("delivery_failed")
      setSubmitted(true)
    } catch {
      // Delivery failed — open a mailto draft instead so nothing is lost.
      const body = [
        `Service: ${chosenLabel}`,
        `Name: ${details.name}`,
        `Email: ${details.email}`,
        `Location: ${details.location}`,
        `Approximate size: ${details.size}`,
        `Current condition: ${details.condition}`,
        `Desired outcome: ${details.outcome}`,
        `Budget indication: ${details.budget}`,
        `Preferred timeframe: ${details.timeframe}`,
        files.length ? `Attachments to follow: ${files.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n")
      window.location.href = `mailto:hello@gronn.studio?subject=${encodeURIComponent(
        `Project enquiry — ${chosenLabel}`
      )}&body=${encodeURIComponent(body)}`
      setFellBack(true)
      setSubmitted(true)
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-gronn-green/40 bg-gronn-green/10 p-10 text-center">
        <p className="font-heading text-3xl font-semibold text-accent">
          {t({
            en: "Thank you — your project is on its way.",
            nl: "Dank je — je project is onderweg.",
          })}
        </p>
        <p className="mx-auto mt-4 max-w-md text-foreground/75">
          {fellBack
            ? t({
                en: "An email draft has been opened with your project details. Send it, and we will come back to you with a first assessment.",
                nl: "Er is een conceptmail geopend met je projectgegevens. Verstuur die, en we komen bij je terug met een eerste beoordeling.",
              })
            : t({
                en: "Your enquiry has been sent to the studio. We will come back to you with a first assessment.",
                nl: "Je aanvraag is verstuurd naar de studio. We komen bij je terug met een eerste beoordeling.",
              })}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-line/10 bg-surface/60 p-6 sm:p-10">
      {/* Honeypot — invisible to people, filled only by bots */}
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />
      {/* Step indicator */}
      <ol className="flex flex-wrap gap-x-6 gap-y-2">
        {STEPS.map((label, i) => (
          <li
            key={label.en}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]",
              i === step
                ? "text-foreground"
                : i < step
                  ? "text-accent"
                  : "text-muted"
            )}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {t(label)}
            {i < step && <CheckIcon className="size-3.5" />}
          </li>
        ))}
      </ol>

      <div className="mt-10 min-h-72">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <>
                <h2 className="mb-6 font-heading text-2xl font-semibold text-accent">
                  {t({
                    en: "What are you here for?",
                    nl: "Waarvoor kom je?",
                  })}
                </h2>
                {/* Three across from `sm`, because there are three
                    levels. Two columns left the third card orphaned on
                    its own row, which reads as an afterthought rather
                    than as the deepest of the three. */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {SERVICE_GROUPS.map((group) => (
                    <FamilyCard
                      key={group.kind}
                      group={group}
                      selected={family === group.kind}
                      onSelect={() => {
                        setFamily(group.kind)
                        setServiceSlug(null)
                      }}
                      t={t}
                    />
                  ))}
                </div>
                {/* A line offering the long design intake used to sit
                    here, in the accent, under the project cards. It is
                    gone on purpose.

                    The reasoning that put it here was that the deep
                    intake should be offered rather than imposed. What it
                    missed is that a visitor on this screen has not
                    spoken to anybody yet, and the two doors are not
                    comparable: this form is four steps and two minutes,
                    the other is an evening. Offering both at the same
                    moment is not a choice, it is a fork the reader has
                    no way to judge.

                    The long sheet now belongs to people who are signed
                    in, from `/dashboard`. This screen's only job is to
                    start the conversation. */}
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="mb-6 font-heading text-2xl font-semibold text-accent">
                  {t({
                    en: "Which one comes closest?",
                    nl: "Welke komt er het dichtst bij?",
                  })}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(family ? servicesInGroup(services, family) : []).map(
                    (service) => (
                      <ServiceChip
                        key={service.slug}
                        service={service}
                        selected={serviceSlug === service.slug}
                        onSelect={() => setServiceSlug(service.slug)}
                        t={t}
                      />
                    )
                  )}
                </div>
                <p className="mt-5 text-sm text-muted">
                  {t({
                    en: "Not sure? Pick the nearest one — we will sort it out together.",
                    nl: "Twijfel je? Kies de dichtstbijzijnde — dat zoeken we samen uit.",
                  })}
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="mb-6 font-heading text-2xl font-semibold text-accent">
                  {t({
                    en: "Tell us about the site.",
                    nl: "Vertel ons over de locatie.",
                  })}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label={t({ en: "Your name *", nl: "Je naam *" })}
                    value={details.name}
                    onChange={setDetail("name")}
                    placeholder={t({ en: "Name", nl: "Naam" })}
                  />
                  <Field
                    label={t({ en: "Email *", nl: "E-mail *" })}
                    type="email"
                    value={details.email}
                    onChange={setDetail("email")}
                    placeholder={t({
                      en: "you@example.com",
                      nl: "jij@voorbeeld.nl",
                    })}
                  />
                  <Field
                    label={t({ en: "Location *", nl: "Locatie *" })}
                    value={details.location}
                    onChange={setDetail("location")}
                    placeholder={t({
                      en: "City or region",
                      nl: "Stad of regio",
                    })}
                  />
                  <Field
                    label={t({
                      en: "Approximate size",
                      nl: "Geschatte omvang",
                    })}
                    value={details.size}
                    onChange={setDetail("size")}
                    placeholder={t({ en: "e.g. 250 m²", nl: "bijv. 250 m²" })}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label={t({
                        en: "Current condition",
                        nl: "Huidige staat",
                      })}
                      textarea
                      value={details.condition}
                      onChange={setDetail("condition")}
                      placeholder={t({
                        en: "What is there now, and what isn't working?",
                        nl: "Wat is er nu, en wat werkt er niet?",
                      })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      label={t({
                        en: "Desired outcome",
                        nl: "Gewenst resultaat",
                      })}
                      textarea
                      value={details.outcome}
                      onChange={setDetail("outcome")}
                      placeholder={t({
                        en: "What should the landscape become?",
                        nl: "Wat moet het landschap worden?",
                      })}
                    />
                  </div>
                  <Field
                    label={t({
                      en: "Budget indication",
                      nl: "Budgetindicatie",
                    })}
                    value={details.budget}
                    onChange={setDetail("budget")}
                    placeholder={t({ en: "e.g. €10–25k", nl: "bijv. €10–25k" })}
                  />
                  <Field
                    label={t({
                      en: "Preferred timeframe",
                      nl: "Gewenste periode",
                    })}
                    value={details.timeframe}
                    onChange={setDetail("timeframe")}
                    placeholder={t({
                      en: "e.g. next spring",
                      nl: "bijv. komend voorjaar",
                    })}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="mb-2 font-heading text-2xl font-semibold text-accent">
                  {t({ en: "Show us the site.", nl: "Laat ons de locatie zien." })}
                </h2>
                <p className="mb-6 text-sm text-muted">
                  {t({
                    en: "Photographs, site plans, measurements or inspiration images — everything helps the first assessment. Optional.",
                    nl: "Foto's, plattegronden, opmetingen of inspiratiebeelden — alles helpt bij de eerste beoordeling. Optioneel.",
                  })}
                </p>
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-line/25 p-10 text-center transition-colors hover:border-gronn-green">
                  <PaperclipIcon className="size-6 text-gronn-green" />
                  <span className="text-sm text-foreground/80">
                    {t({
                      en: "Click to select files",
                      nl: "Klik om bestanden te kiezen",
                    })}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="sr-only"
                    onChange={(e) =>
                      setFiles(
                        Array.from(e.target.files ?? []).map((f) => f.name)
                      )
                    }
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-4 space-y-1 text-sm text-foreground/75">
                    {files.map((name) => (
                      <li key={name} className="flex items-center gap-2">
                        <PaperclipIcon className="size-3.5 text-muted" />
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-line/10 pt-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn(
            // 20px tall as drawn, which is under the 24px floor, and it
            // is the control for going back a step in a four-step form.
            "tap-target text-sm text-muted transition-colors hover:text-foreground active:text-foreground",
            step === 0 && "invisible"
          )}
        >
          ← {t({ en: "Back", nl: "Terug" })}
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-gronn-green px-7 py-3 text-sm font-medium text-gronn-white transition-colors enabled:hover:bg-gronn-ember-strong enabled:hover:text-gronn-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t({ en: "Continue", nl: "Verder" })}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="rounded-full bg-gronn-green px-7 py-3 text-sm font-medium text-gronn-white transition-colors enabled:hover:bg-gronn-ember-strong disabled:cursor-wait disabled:opacity-70"
          >
            {sending
              ? t({ en: "Sending…", nl: "Versturen…" })
              : t({ en: "Submit Your Project", nl: "Verstuur je project" })}
          </button>
        )}
      </div>
    </div>
  )
}

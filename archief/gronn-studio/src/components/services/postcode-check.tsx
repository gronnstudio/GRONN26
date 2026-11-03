"use client"

import { useId, useState } from "react"

import { CtaLink } from "@/components/cta-link"
import { useT } from "@/components/language-provider"
import {
  checkPostcode,
  isServed,
  OUTSIDE_AREA_MESSAGE,
  SERVICE_AREA_TOWNS,
  type AreaResult,
} from "@/lib/werkgebied"

// Asked before the booking step, not after. Seasonal work is a van and a
// drive; letting someone fill in a whole form for a job we would decline
// wastes their evening and our week. The out-of-area answer is a real
// answer, not a door closing — design travels further than a machine does.

export function PostcodeCheck() {
  const t = useT()
  const inputId = useId()
  const [value, setValue] = useState("")
  const [result, setResult] = useState<AreaResult | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setResult(checkPostcode(value))
  }

  return (
    <div className="rounded-lg border border-line/15 bg-surface/60 p-6 sm:p-8">
      <form onSubmit={submit} noValidate>
        <label
          htmlFor={inputId}
          className="block font-mono text-xs uppercase tracking-[0.25em] text-muted"
        >
          {t({
            en: "Check your postcode",
            nl: "Controleer je postcode",
          })}
        </label>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {t({
            en: "Seasonal work runs on a fixed round through South Limburg. One field, and you know before you write anything else.",
            nl: "Seizoenswerk loopt via een vaste ronde door Zuid-Limburg. Eén veld, en je weet het voordat je iets anders invult.",
          })}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* Four digits, and the example shows exactly four digits.
              `checkPostcode()` only ever reads /^(\d{4})/, so a placeholder
              with letters in it advertised work the field does not do and
              contradicted the error text a few lines below. */}
          <input
            id={inputId}
            name="postcode"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (result) setResult(null)
            }}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="6171"
            aria-describedby={result ? `${inputId}-result` : undefined}
            className="w-40 rounded-lg border border-line/15 bg-surface px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted focus:border-gronn-green"
          />
          <button
            type="submit"
            className="tap-target rounded-full border border-line/30 px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-300 hover:border-gronn-ember hover:bg-gronn-ember/10"
          >
            {t({ en: "Check", nl: "Controleer" })}
          </button>
        </div>
      </form>

      {result && (
        <div
          id={`${inputId}-result`}
          role="status"
          className="mt-6 border-t border-line/10 pt-6"
        >
          {result === "invalid" && (
            <p className="text-sm text-foreground/80">
              {t({
                en: "That does not look like a Dutch postcode — four digits is enough.",
                nl: "Dat lijkt geen Nederlandse postcode — vier cijfers is genoeg.",
              })}
            </p>
          )}

          {isServed(result) && (
            <>
              <p className="text-sm text-foreground/85">
                {result === "core"
                  ? t({
                      en: "That is the home patch — minutes from the studio.",
                      nl: "Dat is het thuisgebied — minuten van de studio.",
                    })
                  : t({
                      en: "That is within the round. An ordinary drive.",
                      nl: "Dat ligt binnen de ronde. Een gewone rit.",
                    })}
              </p>
              <CtaLink href="/contact" className="mt-5">
                {t({ en: "Book this work", nl: "Plan deze klus in" })}
              </CtaLink>
            </>
          )}

          {result === "outside" && (
            <>
              <p className="max-w-md text-sm leading-relaxed text-foreground/85">
                {t(OUTSIDE_AREA_MESSAGE)}
              </p>
              <CtaLink href="/contact" variant="outline" className="mt-5">
                {t({ en: "Ask anyway", nl: "Vraag het toch" })}
              </CtaLink>
            </>
          )}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted">
        {SERVICE_AREA_TOWNS.join(" · ")}
      </p>
    </div>
  )
}

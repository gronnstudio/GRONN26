"use client"

import { useT } from "@/components/language-provider"
import { priceLabel, priceRangeLabel } from "@/lib/format"
import type { Pricing } from "@/lib/data/pricing"

// A published price, laid out as a survey table rather than a pricing
// card: figures right-aligned in mono, tiers separated by a hairline, the
// offset rule stated underneath in plain words. Most studios in this trade
// publish nothing — which is exactly why showing a figure works. It also
// filters: whoever calls already knows what it costs and wants it anyway.

export function PriceTable({ pricing }: { pricing: Pricing }) {
  const t = useT()

  const perMonth = pricing.basis === "monthly"

  return (
    <div className="rounded-lg border border-line/15 bg-surface/60 p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
        {perMonth
          ? t({ en: "Per month", nl: "Per maand" })
          : t({ en: "Price", nl: "Prijs" })}
      </p>

      <dl className="mt-5">
        {pricing.tiers.map((tier, i) => (
          <div
            key={tier.label.en}
            className={
              i === 0
                ? "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3"
                : "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line/10 py-3"
            }
          >
            {/* The note qualifies the tier, so it belongs inside the <dt>:
                a <dl> may only hold dt/dd pairs (optionally wrapped in a
                bare div), and a sibling <p> fails axe's definition-list
                rule outright. */}
            <dt className="min-w-0 flex-1 text-sm text-foreground/85">
              {t(tier.label)}
              {tier.note && (
                <span className="mt-1.5 block max-w-sm text-xs leading-relaxed text-muted">
                  {t(tier.note)}
                </span>
              )}
            </dt>
            <dd className="font-mono text-base tabular-nums text-foreground">
              {pricing.basis === "from" && (
                <span className="mr-1 text-xs text-muted">
                  {t({ en: "from", nl: "vanaf" })}
                </span>
              )}
              {tier.amountMax
                ? priceRangeLabel(tier.amount, tier.amountMax)
                : priceLabel(tier.amount)}
              {perMonth && (
                <span className="ml-0.5 text-xs text-muted">
                  {t({ en: "/mo", nl: "/mnd" })}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 border-t border-line/10 pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        {t({ en: "Including VAT", nl: "Inclusief btw" })}
      </p>

      {pricing.offset && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/80">
          {t(pricing.offset)}
        </p>
      )}
    </div>
  )
}

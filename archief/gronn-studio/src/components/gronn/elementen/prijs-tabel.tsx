import type { Pricing } from "@/lib/data/pricing"
import { consumerPrice } from "@/lib/format"
import { pick, type L, type Locale } from "@/lib/i18n"

import { Label } from "./label"

/** Hele euro's in de taal van de bezoeker; zie `consumerPrice`. */
export const euro = (n: number, locale: Locale) => consumerPrice(n, locale)

/** De prijstabel van een dienst, uit src/lib/data/pricing.ts (incl. btw). */
export function PrijsTabel({ pricing, locale }: { pricing: Pricing; locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const basis = { fixed: { nl: "Vaste prijs", en: "Fixed price" }, from: { nl: "Vanaf", en: "From" }, monthly: { nl: "Per maand", en: "Per month" } }[pricing.basis]
  return (
    <div data-element="PrijsTabel" className="rounded-[16px] border border-line/10 bg-surface p-6 sm:p-8">
      <Label>{t(basis)} · {t({ nl: "incl. btw", en: "incl. VAT" })}</Label>
      <dl className="mt-5 grid">
        {pricing.tiers.map((tier, i) => (
          <div key={i} className="flex items-baseline justify-between gap-6 border-b border-line/10 py-3 last:border-0">
            <dt className="text-[15px]">
              {t(tier.label)}
              {tier.note && <span className="block text-[13px] text-muted">{t(tier.note)}</span>}
            </dt>
            <dd className="font-heading text-[22px] tabular-nums">
              {euro(tier.amount, locale)}
              {tier.amountMax ? ` – ${euro(tier.amountMax, locale)}` : ""}
            </dd>
          </div>
        ))}
      </dl>
      {pricing.offset && <p className="mt-4 text-[14px] leading-relaxed text-foreground/75">{t(pricing.offset)}</p>}
    </div>
  )
}

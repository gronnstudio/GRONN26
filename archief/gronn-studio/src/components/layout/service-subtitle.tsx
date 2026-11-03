"use client"

import { useT } from "@/components/language-provider"
import { priceHint } from "@/lib/data/pricing"
import { priceLabel } from "@/lib/format"
import type { L } from "@/lib/i18n"

/**
 * A service's one-line gloss, with its from-price folded into it.
 *
 * The price used to be a right-hand column, and only six of the eleven
 * services have one — so under "Ontwerp en aanleg" the column carried a
 * single amount against five blanks, which is what the owner meant by
 * "met de prijslijst erachter ziet rommelig uit".
 *
 * Completing the column with "op aanvraag" would straighten the edge and
 * say nothing five times. Dropping the price would lose the hook at the
 * moment someone is browsing. Folded into the tagline there is no column
 * to align, so there is nothing to be ragged: a service without a price
 * simply has a shorter subtitle, which reads as normal rather than as a
 * hole. The ember middle dot is the site's own separator idiom.
 *
 * WHY IT LIVES HERE AND NOT IN THE DOCK. It was written for the phone
 * sheet, and the tablet menu — the one a phone gets the moment it is
 * ROTATED, since every current phone in landscape is wider than the
 * 768px `md` breakpoint — still had the ragged column. Two menus, one
 * complaint, so one component.
 *
 * The DESKTOP bar keeps its column, deliberately. At 1024px and up the
 * panel is wide enough that a right-hand price reads as a table rather
 * than as rag, and the complaint was about a phone.
 */
export function ServiceSubtitle({
  slug,
  tagline,
  className,
}: {
  slug: string
  tagline?: L
  /** Overrides the default block spacing where a caller needs its own. */
  className?: string
}) {
  const t = useT()
  const hint = priceHint(slug)
  const price = hint
    ? hint.monthly
      ? `${priceLabel(hint.from)}${t({ en: "/mo", nl: "/mnd" })}`
      : `${t({ en: "from", nl: "vanaf" })} ${priceLabel(hint.from)}`
    : null
  if (!tagline && !price) return null
  return (
    <span
      className={
        className ?? "mt-0.5 block text-[13px] leading-relaxed text-muted"
      }
    >
      {tagline && t(tagline)}
      {tagline && price && (
        <span aria-hidden className="text-gronn-ember">
          {" · "}
        </span>
      )}
      {price && (
        <span className="whitespace-nowrap font-mono text-[12px] tabular-nums text-[color:var(--ember-text)]">
          {price}
        </span>
      )}
    </span>
  )
}

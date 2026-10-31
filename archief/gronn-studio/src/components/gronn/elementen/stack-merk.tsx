import type { Merk } from "@/lib/data/stack-merken"
import { cn } from "@/lib/utils"

/**
 * StackMerk: het merkteken van een product op /stack (eigenaar, 29 sep
 * 2026: "en logos van techstack software?"). De vorm komt ongewijzigd uit
 * Simple Icons (bron en licentie in src/lib/data/stack-merken.ts); de
 * kleur is ÉÉN vlakke tint, `currentColor` op `text-foreground`, dus nooit
 * de merkkleur en altijd leesbaar in beide Uren. Decoratief: de naam
 * staat er als tekst naast, dus `aria-hidden`. Maat in px (standaard 20).
 * Een product zonder eigen teken krijgt geen StackMerk: nooit een
 * benadering tekenen.
 */
export function StackMerk({ merk, maat = 20, className }: { merk: Merk; maat?: number; className?: string }) {
  return (
    <svg
      data-element="StackMerk"
      data-stack-merk=""
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={maat}
      height={maat}
      fill="currentColor"
      className={cn("shrink-0 text-foreground", className)}
      style={{ width: maat, height: maat }}
    >
      <path d={merk.pad} />
    </svg>
  )
}

import { BUSINESS } from "@/lib/business"

import { type Toon } from "./toon"

type Kanaal = "email" | "telefoon" | "whatsapp" | "instagram"

const KANALEN: Record<Kanaal, { href: string; tekst: string }> = {
  email: { href: BUSINESS.emailHref, tekst: BUSINESS.email },
  telefoon: { href: BUSINESS.phoneHref, tekst: BUSINESS.phone },
  whatsapp: { href: BUSINESS.whatsapp, tekst: "WhatsApp" },
  instagram: { href: BUSINESS.instagram, tekst: "Instagram" },
}

/** De contactkanalen uit business.ts — nergens anders overgetypt. */
export function ContactKanalen({
  kanalen = ["email", "telefoon", "whatsapp"],
  toon = "grond",
  groot = false,
}: {
  kanalen?: Kanaal[]
  toon?: Toon
  groot?: boolean
}) {
  return (
    <ul data-element="ContactKanalen" className={`grid gap-1 ${groot ? "text-[17px]" : "text-[15px]"}`}>
      {kanalen.map((k) => (
        <li key={k}>
          <a
            href={KANALEN[k].href}
            className={`inline-flex items-center ${groot ? "min-h-[44px] underline decoration-[var(--gronn-ember)] underline-offset-4" : "min-h-[32px]"} ${toon === "bos" ? "hover:text-[var(--gronn-ember)]" : "hover:text-[var(--ember-text)]"}`}
          >
            {KANALEN[k].tekst}
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Het adres, twee regels. */
export function Adres({ className = "" }: { className?: string }) {
  return (
    <address data-element="Adres" className={`text-[14px] not-italic leading-relaxed ${className}`}>
      {BUSINESS.address.street}
      <br />
      {BUSINESS.address.postalCode} {BUSINESS.address.city}
    </address>
  )
}

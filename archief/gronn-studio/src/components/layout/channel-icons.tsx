import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"

// The two direct channels, with their own brand marks in their own brand
// colours. This is the same acknowledged exception `photo-glass` takes to
// "never hardcode theme-dependent colour": a service's logo colour is a
// constant, not chrome, and WhatsApp green does not become a different
// green at night.
//
// The exact values are chosen for contrast rather than copied from a
// press kit. WhatsApp's headline #25D366 measures 1.75:1 on the Paper
// ground — far below the 3:1 that non-text UI needs — so this uses their
// secondary #128C7E (3.64 paper / 4.58 night). Instagram's #E4405F is
// 3.56 on paper but only just clears dark; #D6336C sits at 4.07 / 4.10,
// even on both.

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
}

export type Channel = {
  key: string
  href: string
  label: string
  /** Brand colour, the same in every theme. */
  color: string
  aria: L
  icon: React.ReactNode
}

export const CHANNELS: Channel[] = [
  {
    key: "whatsapp",
    href: BUSINESS.whatsapp,
    label: "WhatsApp",
    color: "#128c7e",
    aria: {
      en: "Chat on WhatsApp (opens in new tab)",
      nl: "Chat via WhatsApp (opent in nieuw tabblad)",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z"
          {...stroke}
        />
        <path
          d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z"
          {...stroke}
        />
      </svg>
    ),
  },
  {
    key: "instagram",
    href: BUSINESS.instagram,
    label: "Instagram",
    color: "#d6336c",
    aria: {
      en: "GRØNN Studio on Instagram (opens in new tab)",
      nl: "GRØNN Studio op Instagram (opent in nieuw tabblad)",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="4.8" {...stroke} />
        <circle cx="12" cy="12" r="3.8" {...stroke} />
        <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

/** The label these two sit under, everywhere they appear. */
export const DIRECT_CONTACT: L = {
  en: "Direct contact",
  nl: "Direct contact",
}

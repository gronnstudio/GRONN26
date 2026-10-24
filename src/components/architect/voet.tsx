import Link from "next/link"
import { BUSINESS } from "@/lib/business"
import { Separator } from "@/components/ui/separator"
import { T, type Tekst } from "@/components/taal"

// De voet zoals bij architectenbureaus (24 okt 2026): vier rustige kolommen
// in kleine letters op de grond van de pagina, daaronder één regel.
const KOLOMMEN: [Tekst, [string, Tekst][]][] = [
  [
    { nl: "Diensten", en: "Services" },
    [
      ["/vijvers", { nl: "Vijvers", en: "Ponds" }],
      ["/tuinen", { nl: "Tuinen", en: "Gardens" }],
      ["/tuinen/borderpakketten", { nl: "Borderpakketten", en: "Border packages" }],
      ["/tuinen/materialen", { nl: "Materialen", en: "Materials" }],
    ],
  ],
  [
    "Studio",
    [
      ["/werk", { nl: "Werk", en: "Work" }],
      ["/over", { nl: "Over", en: "About" }],
      ["/journaal", "Journaal"],
      ["/faq", { nl: "Vragen", en: "FAQ" }],
    ],
  ],
  [
    { nl: "Klein", en: "Small print" },
    [
      ["/privacy", "Privacy"],
      ["/voorwaarden", { nl: "Voorwaarden", en: "Terms" }],
      ["/colofon", { nl: "Colofon", en: "Colophon" }],
      ["/dashboard", { nl: "Inloggen (eigenaar)", en: "Log in (owner)" }],
    ],
  ],
]

const link = "flex min-h-[var(--raak)] items-center text-muted-foreground no-underline transition-colors hover:text-foreground"

export function Voet() {
  const a = BUSINESS.address
  return (
    <footer className="mt-[clamp(96px,12vw,180px)] border-t border-border text-[14px] leading-[1.6]">
      <div className="wrap grid grid-cols-2 gap-x-6 gap-y-10 py-[clamp(48px,6vw,80px)] md:grid-cols-4">
        <div>
          <p className="m-0 mb-3 text-foreground">{BUSINESS.name}</p>
          <p className="m-0 text-muted-foreground">
            {a.street}
            <br />
            {a.postalCode} {a.city}
          </p>
          <ul className="mt-2 mb-0 list-none p-0">
            <li><a href={BUSINESS.emailHref} className={`${link} [overflow-wrap:anywhere]`}>{BUSINESS.email}</a></li>
            <li><a href={BUSINESS.phoneHref} className={`${link} tabular-nums`}>{BUSINESS.phone}</a></li>
            <li><a href={BUSINESS.instagram} className={link}>Instagram</a></li>
            <li><a href={BUSINESS.whatsapp} className={link}>WhatsApp</a></li>
          </ul>
        </div>
        {KOLOMMEN.map(([kop, links], i) => (
          <nav key={i} aria-label={typeof kop === "string" ? kop : kop.nl}>
            <p className="m-0 mb-3 text-foreground"><T t={kop} /></p>
            <ul className="m-0 list-none p-0">
              {links.map(([h, t]) => (
                <li key={h}>
                  <Link href={h} className={link} rel={h === "/dashboard" ? "nofollow" : undefined}><T t={t} /></Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Separator />
      <div className="wrap flex flex-wrap justify-between gap-x-6 gap-y-2 py-6 text-[13px] text-muted-foreground">
        <span>© 2026 {BUSINESS.name} · <T t={{ nl: "Vijvers en natuurlijke tuinen in Stein en omgeving", en: "Ponds and natural gardens in Stein and the surrounding area" }} /></span>
        <span className="tabular-nums">KVK {BUSINESS.kvk} · BTW {BUSINESS.btw}</span>
      </div>
    </footer>
  )
}

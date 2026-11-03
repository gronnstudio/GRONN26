"use client"

import { LocaleLink as Link } from "@/components/locale-link"

import { useT } from "@/components/language-provider"
import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"
import { DASHBOARD, SECTIONS } from "@/lib/nav"
import { CopyChip } from "@/components/layout/copy-chip"

const EQUILIBRIUM_URL = "https://equilibrium-pink.vercel.app/"

// The footer reads SECTIONS and OWNER from nav.ts now. It used to keep
// its own flat list — Diensten, Projecten, Aanpak, Journaal, Contact,
// Techniek, Veldlab on one heap — plus a second copy of OWNER: a second
// source of truth, in a different shape from the five-section tree the
// rest of the site navigates by.
//
// LEGAL stays local on purpose. Privacy and the terms sit deliberately
// outside the tree: they are obligations, not destinations.
// Twee regels, en niet vier. De voorwaarden staan er niet meer los in:
// zodra er een tweede set bij kwam (zakelijk) en portaalvoorwaarden, werd
// dit een lijst die bij elk document langer wordt — precies de rommeligheid
// die het colofon moest oplossen. Het colofon draagt ze nu allemaal, plus
// de bedrijfsgegevens die de wet permanent vindbaar wil hebben.
//
// Privacy blijft er WEL apart in staan. Dat is het document waar mensen
// gericht naar zoeken, en het één klik verder wegstoppen achter een woord
// dat niet iedereen kent is een verslechtering die geen opgeruimdheid
// waard is.
const LEGAL: { href: string; label: L }[] = [
  { href: "/colofon", label: { en: "Colophon", nl: "Colofon" } },
  { href: "/privacy", label: { en: "Privacy Policy", nl: "Privacybeleid" } },
]

export function Footer() {
  const t = useT()

  return (
    <footer className="border-t border-line/10 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-heading text-2xl font-semibold tracking-tight">
              {BUSINESS.name}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-accent">
              {t({ en: "Rooted in Nature", nl: "Geworteld in de natuur" })}
            </p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
              {t({
                en: "Ecological design practice for gardens, water systems, habitat creation and regenerative landscape transformation.",
                nl: "Ecologisch ontwerpbureau voor tuinen, watersystemen, habitatcreatie en regeneratieve landschapstransformatie.",
              })}
            </p>
            {/* Sidebrand: Equilibrium is GRØNN's open knowledge hub */}
            <div className="mt-8 rounded-lg border border-line/10 bg-surface/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                {t({ en: "From the GRØNN ecosystem", nl: "Uit het GRØNN-ecosysteem" })}
              </p>
              <a
                href={EQUILIBRIUM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t({
                  en: "Equilibrium — our open knowledge hub for regenerative design (opens in new tab)",
                  nl: "Equilibrium — ons open kennisplatform voor regeneratief ontwerp (opent in nieuw tabblad)",
                })}
                className="mt-2 block text-sm text-foreground/90 transition-colors hover:text-gronn-green"
              >
                <span className="font-heading font-semibold">Equilibrium</span>
                <span className="text-muted"> — </span>
                {t({
                  en: "our open knowledge hub for regenerative design",
                  nl: "ons open kennisplatform voor regeneratief ontwerp",
                })}
              </a>
            </div>
          </div>

          <nav className="flex flex-col gap-6 text-sm">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              {t({ en: "Explore", nl: "Ontdek" })}
            </p>
            {/* Section, then what hangs under it — the same five-part
                shape as the bar and the phone sheet, so the footer is a
                map of the site rather than a second, flatter one. */}
            <ul className="-mt-2 flex flex-col gap-5">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <Link
                    href={section.href}
                    className="tap-target underline-draw w-fit text-foreground/80 transition-colors hover:text-gronn-green"
                  >
                    {t(section.label)}
                  </Link>
                  {section.children.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-2 border-l border-line/15 pl-3">
                      {section.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="tap-target underline-draw w-fit text-[13px] text-muted transition-colors hover:text-gronn-green"
                          >
                            {t(child.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t({
                en: "GRØNN Studio on Instagram (opens in new tab)",
                nl: "GRØNN Studio op Instagram (opent in nieuw tabblad)",
              })}
              className="tap-target underline-draw w-fit text-foreground/80 transition-colors hover:text-gronn-green"
            >
              Instagram
            </a>
            <p className="mb-1 mt-6 font-mono text-xs uppercase tracking-[0.25em] text-muted">
              {t({ en: "Legal", nl: "Juridisch" })}
            </p>
            {LEGAL.map((link) => (
              <Link
                key={link.label.en}
                href={link.href}
                className="tap-target underline-draw w-fit text-foreground/80 transition-colors hover:text-gronn-green"
              >
                {t(link.label)}
              </Link>
            ))}

            <p className="mb-1 mt-6 font-mono text-xs uppercase tracking-[0.25em] text-muted">
              {t({ en: "Sign in", nl: "Inloggen" })}
            </p>
            {/* One entry, where there were three. The old copy had to
                say "the last two are the studio's own" — a menu asking
                the reader to work out which audience they belonged to
                before they could pick a link. /dashboard answers that
                itself. */}
            <p className="-mt-3 max-w-[24ch] text-xs leading-relaxed text-muted">
              {t({
                en: "One door. It knows whether you are a client or the studio.",
                nl: "Eén deur. Die weet zelf of je klant bent of de studio.",
              })}
            </p>
            {/* A button, because it is a door and not a further
                reading. In a column of underlined text links it read as
                one more line of prose — the owner's words: "it's not
                logical you can click Dashboard". The note stays beneath
                it rather than inside it: a button whose label runs to two
                lines and carries a subtitle is a card pretending to be a
                button. */}
            <Link
              href={DASHBOARD.href}
              className="tap-target w-fit rounded-full bg-gronn-green px-5 py-2.5 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              {t(DASHBOARD.label)}
            </Link>
            <span className="max-w-[26ch] text-xs leading-relaxed text-muted">
              {t(DASHBOARD.note)}
            </span>
          </nav>

          {/* The registration numbers, and nothing else.

              WHAT MOVED AND WHY. This column used to carry the name, the
              street, the postcode, the country, the phone number and the
              e-mail address — six lines of identity in the footer of
              every page, which is what made the foot of the site read as
              a form rather than as a close.

              All of it lives on `/colofon`, which the Legal list above
              links to from every page. Dutch law (art. 3:15d BW, and the
              Dienstenwet for a service business) wants those details
              "easily, directly and permanently accessible" — a page one
              click away, linked from everywhere, is the shape that
              requirement was written for. It does not ask for them to be
              repeated in the footer of every page.

              The two numbers stay because they are the ones people COPY
              rather than read, and they are what a client's bookkeeper
              asks for. */}
          <div className="flex flex-col gap-3 text-sm">
            <p className="mb-1 font-mono text-xs uppercase tracking-[0.25em] text-muted">
              {t({ en: "Registered as", nl: "Ingeschreven als" })}
            </p>
            <div className="flex flex-wrap gap-2">
              <CopyChip label="KVK" value={BUSINESS.kvk} />
              <CopyChip label="BTW" value={BUSINESS.btw} />
            </div>
            {/* No IBAN. Dutch law wants the name, address, email, KVK and
                BTW number reachable from the site; it does not ask for a
                bank account, and publishing one on every page is how a
                fraudulent invoice gets a number that looks right. */}
            <Link
              href="/colofon"
              className="tap-target underline-draw mt-1 w-fit text-xs text-muted transition-colors hover:text-gronn-green"
            >
              {t({
                en: "Address and contact details",
                nl: "Adres en contactgegevens",
              })}
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line/10 pt-8 sm:flex-row sm:items-center">
          <p className="font-heading text-lg font-semibold text-accent">
            {t({
              en: "Grow green. Live wild. Thrive together.",
              nl: "Groei groen. Leef wild. Bloei samen.",
            })}
          </p>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {BUSINESS.name}
          </p>
        </div>
      </div>
    </footer>
  )
}

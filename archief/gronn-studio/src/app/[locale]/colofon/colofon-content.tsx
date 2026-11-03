"use client"

import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { PageHero } from "@/components/page-hero"
import { useT } from "@/components/language-provider"
import { useLanguage } from "@/components/language-provider"
import { BUSINESS } from "@/lib/business"
import { LEGAL_DOCUMENTS } from "@/lib/data/legal"
import type { L } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// Het colofon: één adres voor alles wat een bezoeker over dit bedrijf mag
// verlangen te weten.
//
// Waarom deze pagina bestaat. De wet (art. 3:15d BW en de Dienstenwet)
// eist dat naam, vestigingsadres, e-mailadres, KvK-nummer en
// btw-identificatienummer permanent en makkelijk vindbaar zijn. Die
// gegevens stonden verspreid: het adres in de voet, het KvK-nummer in de
// voorwaarden, het btw-nummer nergens zichtbaar. Verspreide verplichte
// informatie is informatie die bij de eerste herschrijving half verdwijnt.
//
// WAT HIER BEWUST NIET STAAT: het rekeningnummer. Dat is geen omissie maar
// dezelfde beslissing als in `business-private.ts` — een IBAN die een
// vreemde op je eigen site kan lezen, is een IBAN waarmee een valse
// factuur er echt uitziet. De wet eist hem niet. Klanten krijgen hem op
// hun factuur, waar hij hoort.
//
// De documentenlijst leest uit `LEGAL_DOCUMENTS`, dus een document dat
// erbij komt verschijnt hier vanzelf. Een lijst die met de hand wordt
// bijgehouden is een lijst die achterloopt.

type Row = { label: L; value: string; href?: string; sensitive?: boolean }

export function ColofonContent() {
  const t = useT()
  const { locale } = useLanguage()

  const identity: Row[] = [
    { label: { en: "Trading name", nl: "Handelsnaam" }, value: BUSINESS.name },
    {
      label: { en: "Registered address", nl: "Vestigingsadres" },
      value: `${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}`,
      sensitive: true,
    },
    {
      label: { en: "Country", nl: "Land" },
      value: BUSINESS.address.country,
    },
    {
      label: { en: "Chamber of Commerce", nl: "KvK-nummer" },
      value: BUSINESS.kvk,
      sensitive: true,
    },
    {
      label: { en: "VAT identification", nl: "Btw-identificatienummer" },
      value: BUSINESS.btw,
      sensitive: true,
    },
    {
      label: { en: "Email", nl: "E-mail" },
      value: BUSINESS.email,
      href: BUSINESS.emailHref,
      sensitive: true,
    },
    {
      label: { en: "Telephone", nl: "Telefoon" },
      value: BUSINESS.phone,
      href: BUSINESS.phoneHref,
      sensitive: true,
    },
  ]

  return (
    <>
      <PageHero
        label={{ en: "Colophon", nl: "Colofon" }}
        lines={[{ en: "Who we are, on paper", nl: "Wie wij zijn, op papier" }]}
      />

      <div className="mx-auto w-full max-w-3xl px-4 pb-32 sm:px-6">
        <p className="max-w-2xl leading-relaxed text-foreground/80">
          {t({
            en: "Every detail a Dutch business is required to publish, plus the documents that describe how we work. In one place, so none of it has to be hunted for.",
            nl: "Alles wat een Nederlands bedrijf verplicht is te publiceren, plus de documenten die beschrijven hoe wij werken. Op één plek, zodat er niets naar gezocht hoeft te worden.",
          })}
        </p>

        {/* ---------------------------------------------- bedrijfsgegevens */}
        <section className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ember-text)]">
            {t({ en: "Business details", nl: "Bedrijfsgegevens" })}
          </h2>
          <dl className="mt-6 divide-y divide-line/12 border-y border-line/12">
            {identity.map((row) => (
              <div
                key={row.label.en}
                className="grid gap-1 py-4 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-6"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {t(row.label)}
                </dt>
                <dd
                  data-sensitive={row.sensitive || undefined}
                  className="text-[15px] text-foreground/90"
                >
                  {row.href ? (
                    <a
                      href={row.href}
                      className="tap-target underline-offset-4 transition-colors hover:text-gronn-ember hover:underline active:text-gronn-ember"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {/* De reden dat er géén rekeningnummer staat, hardop. Zonder deze
              regel leest de afwezigheid als vergeten. */}
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            {t({
              en: "We deliberately do not publish our bank account number here. It is not required, and an account number a stranger can read on our own site is one that makes a fraudulent invoice look right. Clients find it on their invoice.",
              nl: "Ons rekeningnummer staat hier bewust niet. Het is niet verplicht, en een rekeningnummer dat een vreemde op onze eigen site kan lezen is een rekeningnummer waarmee een valse factuur er echt uitziet. Klanten vinden het op hun factuur.",
            })}
          </p>
        </section>

        {/* ------------------------------------------------- de documenten */}
        <section className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ember-text)]">
            {t({ en: "Terms and policies", nl: "Voorwaarden en beleid" })}
          </h2>
          <ul className="mt-6 divide-y divide-line/12 border-y border-line/12">
            {LEGAL_DOCUMENTS.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`/${locale}/${doc.slug}`}
                  className={cn(
                    "tap-target group flex items-baseline gap-4 py-4",
                    "transition-colors hover:text-gronn-ember active:text-gronn-ember"
                  )}
                >
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium">{doc.title}</span>
                    <span className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      {doc.audience === "consument"
                        ? t({ en: "Private clients", nl: "Particuliere opdrachtgevers" })
                        : doc.audience === "zakelijk"
                          ? t({ en: "Business clients", nl: "Zakelijke opdrachtgevers" })
                          : t({ en: "Everyone", nl: "Iedereen" })}
                      {doc.status === "concept" && " · "}
                      {doc.status === "concept" && (
                        <span className="text-[color:var(--ember-text)]">
                          {t({ en: "draft", nl: "concept" })}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                    {doc.updated}
                  </span>
                  <ArrowUpRightIcon
                    size={14}
                    aria-hidden
                    className="shrink-0 translate-y-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            {t({
              en: "Documents marked draft have been written but not yet reviewed by a Dutch lawyer. Statutory rules apply in full regardless of what any of these say.",
              nl: "Documenten met de aanduiding concept zijn geschreven maar nog niet getoetst door een Nederlandse jurist. De wettelijke regels gelden onverkort, wat er in deze documenten ook staat.",
            })}
          </p>
        </section>

        {/* ------------------------------------------------------ techniek */}
        <section className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ember-text)]">
            {t({ en: "This website", nl: "Deze website" })}
          </h2>
          <p className="mt-6 leading-relaxed text-foreground/80">
            {t({
              en: "Built and maintained in-house. No tracking cookies, no advertising networks. Which data it processes, and with whom, is in the privacy statement.",
              nl: "In eigen beheer gebouwd en onderhouden. Geen trackingcookies, geen advertentienetwerken. Welke gegevens hij verwerkt, en met wie, staat in de privacyverklaring.",
            })}
          </p>
          <Link
            href={`/${locale}/privacy`}
            className="tap-target mt-4 inline-flex items-center gap-1.5 text-[15px] transition-colors hover:text-gronn-ember active:text-gronn-ember"
          >
            {t({ en: "Privacy statement", nl: "Privacyverklaring" })}
            <ArrowUpRightIcon size={14} aria-hidden />
          </Link>
        </section>
      </div>
    </>
  )
}

import Link from "next/link"

import { PRICING, pricingFor } from "@/lib/data/pricing"
import { SERVICES } from "@/lib/data/services"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { ph } from "@/lib/placeholder"
import { BREEDTE, euro, Label, PaginaKop, ProductKaart, Sectie } from "./elementen"

// De winkel als CONCEPT (Nick, 25 sep 2026: "Ontwikkel een shop concept,
// gebruik voor fotos plaatsvervangers"). Fase 1 van docs/shop-plan.md,
// om te zien en te beoordelen — geen werkende winkel. Noindex, niet in
// de sitemap, nav, voet of zoekfunctie. Geen verzonnen prijzen: alleen de
// vaste diensten met een prijs in pricing.ts tonen een bedrag; al het
// andere zegt "Prijs volgt". Beelden zijn plaatshouders uit public/ph of
// een vlak met lijnicoon, altijd gelabeld; nooit projectfoto's of
// sfeerbeelden. Geen knop betaalt.

/** De vaste diensten van fase 1: alleen slugs met een prijs in pricing.ts. */
export const WINKEL_DIENSTEN = ["pond-survey", "leaf-net", "pond-autumn-service", "winterising", "maintenance-subscription"].filter(
  (slug) => slug in PRICING
)

// Plaatshouderbeelden per dienst, rechtstreeks uit public/ph — NIET via
// serviceImage(), want die geeft eigen werk (de vijver) voorrang.
const PH_ID: Record<string, number> = {
  "pond-survey": 10,
  "leaf-net": 18,
  "pond-autumn-service": 28,
  winterising: 12,
  "maintenance-subscription": 33,
}

const PLAATSHOUDER: L = { nl: "Plaatshouder", en: "Placeholder" }
const PRIJS_VOLGT: L = { nl: "Prijs volgt", en: "Price to follow" }
const LEVERTIJD_VOLGT: L = { nl: "Levertijd: volgt", en: "Delivery time: to follow" }
const BESTELLEN: L = { nl: "Bestellen (concept)", en: "Order (concept)" }

const DIGITAAL: { titel: L; tekst: L; icoon: "document" | "zaad" }[] = [
  {
    titel: { nl: "Plantplan-sjabloon (plaatshouder)", en: "Planting plan template (placeholder)" },
    tekst: { nl: "Plaatshoudertekst: hier komt een korte omschrijving van het product.", en: "Placeholder text: a short description of the product goes here." },
    icoon: "document",
  },
  {
    titel: { nl: "Zaaikalender (plaatshouder)", en: "Sowing calendar (placeholder)" },
    tekst: { nl: "Plaatshoudertekst: hier komt een korte omschrijving van het product.", en: "Placeholder text: a short description of the product goes here." },
    icoon: "zaad",
  },
]

const FYSIEK: { titel: L; tekst: L; icoon?: "blad"; beeld?: string }[] = [
  {
    titel: { nl: "Plant (plaatshouder)", en: "Plant (placeholder)" },
    tekst: { nl: "Plaatshoudertekst: hier komt een korte omschrijving van het product.", en: "Placeholder text: a short description of the product goes here." },
    beeld: ph(33),
  },
  {
    titel: { nl: "Zaden (plaatshouder)", en: "Seeds (placeholder)" },
    tekst: { nl: "Plaatshoudertekst: hier komt een korte omschrijving van het product.", en: "Placeholder text: a short description of the product goes here." },
    icoon: "blad",
  },
]

export function WinkelPagina({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const herroeping = localePath(locale, "/herroeping")
  const verplicht = (prijs: boolean) => [
    t(prijs ? { nl: "Prijs incl. btw", en: "Price incl. VAT" } : { nl: "Prijs incl. btw: volgt", en: "Price incl. VAT: to follow" }),
    t(LEVERTIJD_VOLGT),
    <Link key="h" href={herroeping} className="underline underline-offset-[4px]">
      {t({ nl: "Herroeping: voorwaarden volgen", en: "Withdrawal: terms to follow" })}
    </Link>,
  ]

  return (
    <>
      <div
        role="note"
        data-winkel-concept=""
        className="border-b border-line/15 bg-surface"
      >
        <p className={`${BREEDTE} py-[12px] font-mono text-[13px] leading-relaxed`}>
          {t({
            nl: "Concept — nog niet te koop. Prijzen, producten en foto's zijn plaatshouders.",
            en: "Concept — not for sale yet. Prices, products and photos are placeholders.",
          })}
        </p>
      </div>

      <PaginaKop
        label={t({ nl: "Winkel · concept", en: "Shop · concept" })}
        titel={t({ nl: "Winkel", en: "Shop" })}
        intro={t({
          nl: "Een schets van hoe de winkel eruit kan zien: vaste diensten, digitale en fysieke producten, en cadeaubonnen.",
          en: "A sketch of how the shop could look: fixed services, digital and physical products, and gift cards.",
        })}
      />

      <section aria-labelledby="winkel-stappen-kop" className={`${BREEDTE} pb-[24px]`}>
        <h2 id="winkel-stappen-kop" className="sr-only">
          {t({ nl: "Hoe het werkt", en: "How it works" })}
        </h2>
        <ol className="grid gap-[12px] sm:grid-cols-3">
          {[
            { nl: "Kies", en: "Choose" },
            { nl: "Betaal via iDEAL", en: "Pay with iDEAL" },
            { nl: "Ontvang of plan", en: "Receive or schedule" },
          ].map((stap, i) => (
            <li key={i} className="flex items-baseline gap-[12px] rounded-[16px] border border-line/10 p-[20px]">
              <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="tekst-h3">{t(stap)}</span>
            </li>
          ))}
        </ol>
      </section>

      <Sectie
        id="vaste-diensten"
        label={t({ nl: "01 / Vaste diensten", en: "01 / Fixed services" })}
        kop={t({ nl: "Vaste diensten", en: "Fixed services" })}
        intro={t({ nl: "Na betaling kies je een datum.", en: "After payment you pick a date." })}
      >
        <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
          {WINKEL_DIENSTEN.map((slug) => {
            const dienst = SERVICES.find((s) => s.slug === slug)!
            const prijs = pricingFor(slug)!
            const basis = t(
              prijs.basis === "monthly"
                ? { nl: "Per maand, incl. btw", en: "Per month, incl. VAT" }
                : { nl: "Vaste prijs, incl. btw", en: "Fixed price, incl. VAT" }
            )
            return (
              <ProductKaart
                key={slug}
                beeld={ph(PH_ID[slug] ?? 17)}
                labelTekst={t(PLAATSHOUDER)}
                titel={t(dienst.title)}
                tekst={t(dienst.summary)}
                prijs={basis}
                details={[
                  ...prijs.tiers.map(
                    (tier) =>
                      `${t(tier.label)} · ${euro(tier.amount, locale)}${tier.amountMax ? ` – ${euro(tier.amountMax, locale)}` : ""}`
                  ),
                  ...verplicht(true).slice(1),
                ]}
                knop={t({ nl: "Direct boeken (concept)", en: "Book now (concept)" })}
              />
            )
          })}
        </div>
      </Sectie>

      <Sectie
        id="digitaal"
        vlak
        label={t({ nl: "02 / Digitale producten", en: "02 / Digital products" })}
        kop={t({ nl: "Digitale producten", en: "Digital products" })}
        intro={t({ nl: "Download na betaling.", en: "Download after payment." })}
      >
        <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
          {DIGITAAL.map((p, i) => (
            <ProductKaart
              key={i}
              icoon={p.icoon}
              labelTekst={t(PLAATSHOUDER)}
              titel={t(p.titel)}
              tekst={t(p.tekst)}
              prijs={t(PRIJS_VOLGT)}
              details={[t({ nl: "Download na betaling", en: "Download after payment" }), ...verplicht(false)]}
              knop={t(BESTELLEN)}
            />
          ))}
        </div>
      </Sectie>

      <Sectie
        id="fysiek"
        label={t({ nl: "03 / Fysieke producten", en: "03 / Physical products" })}
        kop={t({ nl: "Fysieke producten", en: "Physical products" })}
        intro={t({
          nl: "Alleen afhalen in Stein of meeleveren bij een klus.",
          en: "Collection in Stein only, or delivered along with a job.",
        })}
      >
        <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
          {FYSIEK.map((p, i) => (
            <ProductKaart
              key={i}
              beeld={p.beeld}
              icoon={p.icoon}
              labelTekst={t(PLAATSHOUDER)}
              titel={t(p.titel)}
              tekst={t(p.tekst)}
              prijs={t(PRIJS_VOLGT)}
              details={[
                t({ nl: "Alleen afhalen in Stein of meeleveren bij een klus", en: "Collection in Stein only, or delivered along with a job" }),
                ...verplicht(false),
              ]}
              knop={t(BESTELLEN)}
            />
          ))}
        </div>
      </Sectie>

      <Sectie
        id="cadeaubonnen"
        vlak
        label={t({ nl: "04 / Cadeaubonnen", en: "04 / Gift cards" })}
        kop={t({ nl: "Cadeaubonnen", en: "Gift cards" })}
        intro={t({ nl: "Een bon als pdf, met een eigen code.", en: "A voucher as a PDF, with its own code." })}
      >
        <div className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
          <ProductKaart
            icoon="bon"
            labelTekst={t(PLAATSHOUDER)}
            titel={t({ nl: "Cadeaubon (plaatshouder)", en: "Gift card (placeholder)" })}
            tekst={
              <span className="grid gap-[8px]">
                {[1, 2].map((n) => (
                  <span key={n} className="flex justify-between gap-[12px] border-b border-line/10 pb-[6px]">
                    <span>{t({ nl: `Bon ${n}`, en: `Card ${n}` })}</span>
                    <span className="font-mono text-[12px]">{t({ nl: "Bedrag volgt", en: "Amount to follow" })}</span>
                  </span>
                ))}
              </span>
            }
            prijs={t({ nl: "Bedrag volgt", en: "Amount to follow" })}
            details={verplicht(false).slice(1)}
            knop={t(BESTELLEN)}
          />
        </div>
      </Sectie>

      <div className={`${BREEDTE} pb-[64px]`}>
        <Label>{t({ nl: "Nog niets te koop", en: "Nothing for sale yet" })}</Label>
      </div>
    </>
  )
}

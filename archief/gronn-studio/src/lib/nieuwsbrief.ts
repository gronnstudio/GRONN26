import { BUSINESS } from "@/lib/business"
import type { Locale } from "@/lib/i18n"
import { controleerEmail } from "@/lib/invulvelden"

// De maillijst met de gratis "checklist vooraf" (Nick, sep 2026: een
// lijst met een weggever, naar Dan Hoye; aanbieder MailerLite).
//
// Twee manieren van versturen, allebei rechtstreeks vanuit de browser:
//
//  1. MailerLite, zodra `MAILERLITE` hieronder beide ID's heeft. Het adres
//     komt dan in Nicks MailerLite-account terecht.
//  2. Tot die tijd FormSubmit, precies zoals het contactformulier dat doet
//     (browser → FormSubmit AJAX; NOOIT via de server, want FormSubmit
//     blokkeert datacenter-IP's — CLAUDE.md, "Contact form"). Nick krijgt
//     dan een mail "Checklist aangevraagd" met het adres en stuurt de
//     checklist zelf. De bevestiging op de site zegt dat ook zo: er gaat
//     in deze stand GEEN automatische mail uit, dus de site belooft er
//     geen.
//
// Niets hier is verzonnen: geen account, geen formulier-ID, geen adres.
// Staat een ID op null, dan is hij er nog niet.

/**
 * Nicks MailerLite-formulier. Beide waarden staan in MailerLite onder
 * Forms → Embedded forms → het formulier → HTML code: in de regel
 * `<form … action="https://assets.mailerlite.com/jsonp/ACCOUNT/forms/FORMULIER/subscribe">`
 * is het eerste getal het account-ID en het tweede het formulier-ID.
 * Vul ze hier in als strings (ze zijn lang; een number verliest cijfers).
 *
 * Zet ze pas als de automatisering in MailerLite klaarstaat die de
 * checklist echt verstuurt — de bevestiging op de site zegt vanaf dat
 * moment dat hij per mail komt.
 */
export const MAILERLITE = {
  // Uit Nicks embed-code (24 sep 2026), formulier "Checklist":
  // action="https://assets.mailerlite.com/jsonp/2657100/forms/199473671017858334/subscribe"
  accountId: "2657100" as string | null,
  formId: "199473671017858334" as string | null,
}

/**
 * Staat in MailerLite "double opt-in" aan? Nick, 24 sep 2026: aan. Dan
 * krijgt een nieuwe aanmelder eerst een mail met een bevestigingsknop,
 * en pas na die klik komt de checklist — de bevestiging op de site zegt
 * dat dus zo, en belooft niet dat de checklist er al aankomt.
 */
export const DUBBELE_OPTIN = true

export type MailerLiteConfig = { accountId: string | null; formId: string | null }

/**
 * De go-live-schakelaar voor ALLE zichtbare plekken: het blok op home, het
 * blok op /faq en de pagina /checklist. Niet in de voet: dubbelop (eigenaar, 24 sep 2026).
 *
 * Aan sinds Nick "live" zei. Stond op `false` tot Nick (1) de tekst van de checklist heeft goedgekeurd
 * en (2) de privacyverklaring de maillijst noemt (FormSubmit nu,
 * MailerLite later). Daarna: `true`, en het label CONCEPT van /checklist
 * mag eraf.
 *
 * Los daarvan staat alles aan (zie `nieuwsbriefZichtbaar`):
 *  · op een Vercel-preview (`VERCEL_ENV=preview`), zodat Nick het daar
 *    kan beoordelen zonder dat productie verandert;
 *  · bij een build met `NIEUWSBRIEF_ZICHTBAAR=1` — zo bouwt CI, zodat de
 *    Playwright-spec en de axe-scans de blokken echt zien.
 * Beide worden bij het bouwen/renderen op de server gelezen; de browser
 * krijgt alleen de uitkomst te zien.
 */
export const ZICHTBAAR = true

export function nieuwsbriefZichtbaar(env: Record<string, string | undefined> = process.env): boolean {
  return ZICHTBAAR || env.NIEUWSBRIEF_ZICHTBAAR === "1" || env.VERCEL_ENV === "preview"
}

export type Modus = "mailerlite" | "formsubmit"

export function modus(cfg: MailerLiteConfig = MAILERLITE): Modus {
  return cfg.accountId && cfg.formId ? "mailerlite" : "formsubmit"
}

/** Hetzelfde endpoint als het contactformulier. */
export const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${BUSINESS.email}`

/**
 * Het endpoint van een MailerLite embedded form: de `action` uit de
 * HTML-code van het formulier.
 *
 * Bron: MailerLite, "How to create an embedded form" —
 * https://www.mailerlite.com/help/how-to-create-an-embedded-form (daar
 * staat waar de HTML-code zit en dat je hem zelf mag aanpassen).
 *
 * De VORM is op 24 sep 2026 bevestigd door Nicks eigen embed-code: dezelfde
 * URL, `fields[email]`, `ml-submit=1` en `anticsrf=true`. Nog NIET
 * geverifieerd (dat doet de eerste echte aanmelding op de preview): CORS
 * en de vorm van het antwoord. Achtergrond: op 23 sep 2026 kon deze sessie mailerlite.com niet
 * openen (de netwerkproxy blokkeerde het), dus de officiële pagina is niet
 * gelezen. Wat er wel te zien was: zoekresultaten over MailerLite-
 * formulieren noemen `action="https://assets.mailerlite.com/jsonp/…"` en
 * de velden `fields[email]`, `ml-submit=1` en `anticsrf=true`. Het deel
 * `{account}/forms/{formulier}/subscribe` achter `/jsonp/` is de vorm van
 * de embed-code uit het geheugen, niet gelezen in een bron. Ook niet
 * geverifieerd: dat het endpoint CORS toestaat
 * voor een fetch vanaf gronn.studio, en de vorm van het JSON-antwoord
 * (hier verwacht: `{ "success": true }`). Voor go-live dus: Nicks
 * HTML-code naast deze functie leggen en één echte aanmelding doen.
 * Mislukt die, dan toont het formulier de foutmelding met het mailadres,
 * nooit een valse bevestiging.
 */
export function mailerliteUrl(cfg: MailerLiteConfig): string {
  if (!cfg.accountId || !cfg.formId) throw new Error("MailerLite-ID's ontbreken")
  return `https://assets.mailerlite.com/jsonp/${encodeURIComponent(cfg.accountId)}/forms/${encodeURIComponent(cfg.formId)}/subscribe`
}

/** Het onderwerp van de mail die Nick in de FormSubmit-stand krijgt. */
export const ONDERWERP = "Checklist aangevraagd"

/**
 * Het verzoek dat de browser verstuurt, als gewone data: zo kan een test
 * het naleggen zonder netwerk (tests/e2e/nieuwsbrief.spec.ts).
 */
export function verzoek(
  email: string,
  { cfg = MAILERLITE, locale, plek }: { cfg?: MailerLiteConfig; locale: Locale; plek: string }
): { modus: Modus; url: string; init: RequestInit } {
  if (modus(cfg) === "mailerlite") {
    // Gewoon formulier-gecodeerd, zoals het HTML-formulier zelf post: een
    // "simple request", dus geen CORS-preflight.
    const body = new URLSearchParams({ "fields[email]": email, "ml-submit": "1", anticsrf: "true" })
    return {
      modus: "mailerlite",
      url: mailerliteUrl(cfg),
      init: { method: "POST", headers: { Accept: "application/json" }, body },
    }
  }
  return {
    modus: "formsubmit",
    url: FORMSUBMIT_ENDPOINT,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: ONDERWERP,
        _template: "box",
        _captcha: "false",
        email,
        taal: locale,
        plek,
        message: `${email} vraagt de checklist vooraf aan (via ${plek}, taal ${locale}). Stuur hem zelf toe; MailerLite is nog niet gekoppeld.`,
      }),
    },
  }
}

/** Een eenvoudige vormcontrole; de foutteksten staan in `controleerEmail`. */
export function lijktOpEmail(waarde: string): boolean {
  return !controleerEmail(waarde).fout
}

/** Het pad van de checklist. */
export const CHECKLIST_PAD = "/checklist"

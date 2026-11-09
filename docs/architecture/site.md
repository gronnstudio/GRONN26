# Opbouw van de publieke site

Stand 29 okt 2026. Het CRM achter de inlog staat in [overview.md](overview.md).

## In één alinea

Een Next.js 16-app (App Router) zonder CMS: alle tekst staat als getypte data
in `src/lib/data/` en in de pagina's zelf. Alles is Nederlands; Engels is een
weergave-instelling (`html.en`), geen eigen route. Er is geen database voor de
site: aanvragen gaan naar `/api/aanvraag` en komen in het dashboard, betalingen
lopen via Mollie, en de enige opslag is Vercel Blob (privé).

## Pagina's

| Pad | Wat | Bron |
| --- | --- | --- |
| `/` | voorpagina (9 nov 2026): opening, 01 Studio, 02 Wat ik maak (index), 03 Werk, 04 Werkwijze, slot. Zie [../website/BLUEPRINT.md](../website/BLUEPRINT.md) | `src/components/voorpagina/` |
| `/vijvers`, `/tuinen` | de twee diensten, even zwaar (positionering 3 okt 2026) | `src/lib/data/services.ts`, `pricing.ts` |
| `/tuinen/borderpakketten` | 8 pakketten + op maat, bestellen en betalen via Mollie | `borderpakketten.ts`, `src/lib/mollie.ts` |
| `/tuinen/cadeaubon`, `/shop` | cadeaubon met eigen bedrag, de winkel | `cadeaubon.ts` |
| `/tuinen/materialen` | steen en buitenmateriaal, met sfeerbeelden | `materialen.ts` |
| `/werk`, `/werk/vijverrenovatie`, `/werk/terras-geulle` | alleen echt werk, met toestemming van de klant | `projects.ts`, `vijverrenovatie.ts`, `terras-geulle.ts` |
| `/over` | Nick en zijn verhaal | `src/components/over/` |
| `/journaal` | tijdschriftstukken (vroeger Blog) | `journaal-tekst.ts`, `journaal-archief.ts` |
| `/techniek` | de site als stapel van vijf lagen | `techniek.ts` |
| `/kennismaken` | het formulier; adres zoekt mee via PDOK | `src/components/kennismaken/` |
| `/faq`, `/privacy`, `/voorwaarden`, `/herroeping`, `/colofon` | vragen en juridisch | `vragen-lijst.ts`, `src/lib/data/legal/` |
| `/links`, `/handtekening`, `/merk`, `/drukwerk/[slug]`, `/downloads` | hulppagina's voor Nick (linktree, mailhandtekening, merk, drukwerk) | |
| `/wallet/visitekaartje.pkpass`, `/contact.vcf` | visitekaartje voor Apple/Google Wallet en als vCard | `src/lib/wallet/`, `vcard.ts` |
| `/proef/observatie` | proefpagina (observatiekaders en loep) | |
| `/wireframes/*` | statische wireframes in `public/wireframes`, noindex | `next.config.ts` |

Oude adressen van de vorige site (`/projects`, `/services`, `/studio`,
`/contact`, `/kennisbank`, …) worden in `next.config.ts` (lijst `OUD`)
doorgestuurd. Haal daar niets weg: ze staan nog in Google, mails en posts.

## Weergave, kleur en layout

- **Kleur:** Auto · Licht · Donker. Auto volgt de klok: donker van 19:00 tot
  07:00 (21 okt 2026). Een script in `src/app/layout.tsx` (`VOORVERF`) zet de
  klasse vóór de eerste verf, zodat er geen flits is. Bewaard in
  `localStorage` onder `gronn-weergave`.
- **Layout:** Klassiek en Blueprint ("plan", IBM Plex), 50/50 toegewezen bij
  het eerste bezoek en gemeten (`LayoutMeting`, 25 okt 2026). Tests en andere
  geautomatiseerde browsers krijgen altijd Klassiek.
- **Toegankelijkheid in Weergave:** minder beweging, grotere tekst, meer
  contrast, onderstreepte links. Zoomen staat aan.
- **Muziek:** schakelaar in Weergave met een rustige loop.

## Kleuren en maten

Alle kleuren zijn tokens in `src/app/globals.css`; nooit een kleur hard in een
component.

| Token | Licht | Donker | Gebruik |
| --- | --- | --- | --- |
| `--grond` | #efeeea crème | #1a1a18 antraciet | achtergrond |
| `--inkt` | #202020 | #efeeea | tekst |
| `--oranje` | #ff5b04 | #ff5b04 | het ene accent |
| `--oranje-tekst` | #b84000 | #ff5b04 | oranje als tekst op licht |
| `--bos` | #141413 | | de voet, diep antraciet |

Sinds 9 nov 2026 crème en antraciet (Master Brief); zand en bruin van 11 okt zijn weg.
Typografie, ruimte en beweging: [../website/ART-DIRECTION.md](../website/ART-DIRECTION.md).
Geen groen of salie als vlak (Nick, 10–11 okt 2026). Maten staan ook als
variabelen: `--knop` 48, `--knop-klein` 36, `--knop-groot` 64, `--raak` 44
(minimale tikhoogte), `--foto-hoek` 4, `--breedte` 1440 met `--goot`.
Letters: Syne (koppen), Montserrat (tekst), IBM Plex in Blueprint.

## Navigatie

Eén dichte antraciet pil onderaan (glas tot 9 nov 2026), op elk scherm (18 okt 2026): Home (kiemplantje),
Werk (schop), Studio (poppetje, ook actief op `/techniek`), Shop (shoptas) en
een menuknop met vier stippen. Tijdens het lezen verschijnt Omhoog (oranje)
als laatste in de pil. Het menu bevat alleen wat niet al in dock of voet staat:
Kennismaken (telefoon en tablet) en Weergave. Op desktop staat bovenaan een
brede balk die bij scrollen een pil wordt. Een komeet loopt één keer om de pil bij binnenkomst; iconen bewegen alleen bij aanwijzen.
Zoeken: ⌘K / Ctrl K, `/`, en `g` + letter (`src/components/zoek.tsx`,
`src/lib/zoek-index.ts`).

## Wat de site met de buitenwereld doet

| Wat | Hoe | Waar |
| --- | --- | --- |
| Aanvraag | POST `/api/aanvraag`, komt in het dashboard als aanvraag | `src/app/api/aanvraag` |
| Vijverfoto beoordelen | POST `/api/vijverfoto`, Claude kijkt naar de foto; foto privé in Blob | `src/app/api/vijverfoto` |
| Betalen | Mollie (borderpakketten, cadeaubon), webhook op `/api/mollie` | `src/lib/mollie.ts` |
| Adres | PDOK Locatieserver vanuit de browser, geen sleutel | `src/components/adres-veld.tsx` |
| Statistiek | Vercel Analytics en Speed Insights, geen cookies | `layout.tsx` |
| Offline | service worker `public/sw.js`; het dashboard gaat er niet doorheen | |

## Beveiliging

Basisheaders in `next.config.ts` (X-Frame-Options, nosniff, Referrer-Policy,
Permissions-Policy met microfoon alleen voor het dashboard). Geen CSP, bewust
(gouden regel; inline scripts). De proxy (`src/proxy.ts`) houdt `/dashboard`
en `/offertes` dicht; elke API-route controleert zelf nog eens (ADR 0004).

## Regels die uit feedback komen

- Alleen echt werk op `/werk`. Sfeerbeelden dragen het label Sfeerbeeld en
  staan nooit bij een project. Een AI-visualisatie gaat nooit door voor een
  foto. Nooit minderjarigen in beeld.
- Foto's zonder metadata (geen GPS) in `public/projecten/`.
- Elke animatie heeft een stille versie bij `prefers-reduced-motion`.
- Nergens op de site staat dat Claude de site bouwt (29 sep 2026).
- Geen ® tot het merk is ingeschreven (Benelux-merk loopt via BRNDPWR).

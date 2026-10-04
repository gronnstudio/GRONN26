# Kwaliteit: toegankelijkheid, prestaties, privacy, SEO en tests

## 1. Toegankelijkheid

Vanaf het begin ingebouwd, niet achteraf.

| Onderwerp | Hoe |
| --- | --- |
| Taal | `<html lang="nl">` |
| Landmarks | `<header>` (kop), `<main id="inhoud">`, `<nav aria-label="Hoofdmenu">`, `<footer>`; projecten als `<article aria-labelledby>`, de opening als `<section aria-labelledby>` |
| Skiplink | "Direct naar de inhoud", eerste focusbare element, zichtbaar bij focus |
| Koppen | één `<h1>` per pagina; projecttitels `<h2>` |
| Actieve pagina | `aria-current="page"` op het menuwoord (en op Kennismaken op `/kennismaken`) |
| Pijl | de toegankelijke naam volgt de functie: "Verder naar beneden" of "Terug naar boven" |
| Weergave | echte radioknoppen in `fieldset` + `legend`; het label rond de knop krijgt de focusring |
| Focus | `:focus-visible` overal, 2px, ≥ 3:1 tegen de grond |
| Dubbele links | het beeld in een projectteaser is `aria-hidden` en `tabIndex={-1}`; één link per project voor toetsenbord en schermlezer |
| Alt-tekst | beschrijvend, geschreven na het bekijken van de foto; decoratieve herhalingen `alt=""` |
| Contrast | `npm run contrast` + axe in Playwright, in licht én donker |
| Beweging | `prefers-reduced-motion` én een eigen keuze onder Weergave; zonder beweging is alle inhoud er |
| Tekstgrootte | tekst in `clamp()` met px-grenzen, zodat zoomen tot 200 % werkt; chroom in px |
| Zonder JavaScript | de site is leesbaar en navigeerbaar (licht thema, alle links werken); alleen Weergave en de pijl doen dan niets |

**Gemeten:** axe-core (WCAG 2 A en AA) op `/`, `/vijvers`, `/tuinen`,
`/werk`, `/over` en `/werk/vijverrenovatie`, in licht en donker, op
desktop en telefoon: **0 fouten** (4 oktober 2026).

## 2. Prestaties

| Onderwerp | Hoe |
| --- | --- |
| Rendering | alle routes statisch vooraf gerenderd; geen serverwerk per bezoek |
| JavaScript | twee kleine client-componenten (`BottomNavigation`, `AppearanceMenu`); al het andere is server-HTML |
| Afhankelijkheden | alleen `next`, `react`, `react-dom`. Geen animatie-, thema- of UI-bibliotheek |
| Fonts | drie lokale woff2-bestanden (12 + 32 + 71 kB), `display: swap`; niets van Google of een CDN |
| Foto's | `next/image` met AVIF en WebP (`next.config.ts`), `sizes` per plek, `priority` alleen op de openingsfoto, de rest lazy |
| Beweging | CSS op de compositor (transform, clip-path, opacity); geen JavaScript per scrollframe, behalve één `requestAnimationFrame`-gedempte luisteraar voor de pijl |
| CLS | elke foto heeft een vaste verhouding (`aspect-*` of `fill` in een gemeten vak) |

## 3. Privacy

- **Foto's zonder metadata.** `scripts/check-photo-metadata.mjs` loopt
  elke JPEG in `public/` langs en faalt bij een APP1-segment (EXIF/XMP,
  waar GPS in zit) of een bestand boven 800 kB. Opschonen:
  `exiftool -all= foto.jpg`, of opnieuw exporteren zonder metadata.
- **Geen tracking, geen cookies.** `localStorage` bewaart alleen de keuze
  onder Weergave (`gronn-weergave`, `gronn-beweging`), en alleen als de
  bezoeker iets kiest.
- **Contact** (fase 3) blijft FormSubmit vanuit de browser, zoals in
  gronn-studio. Niet server-side: FormSubmit blokkeert IP's van
  datacenters. Verandert dat ooit, dan ook `/privacy` aanpassen.

## 4. SEO

Fase 1:

- titelsjabloon `%s — GRØNN Studio`, standaardtitel en beschrijving
  (`MERKBASIS`);
- Open Graph: type, siteName, `nl_NL`;
- `metadataBase` = `https://gronn.studio`;
- **`robots: noindex, nofollow`** tot de domeinwissel;
- projectpagina's: eigen titel ("Vijverrenovatie — GR / 001") en
  beschrijving (de samenvatting).

Fase 3: sitemap, `robots.ts`, canonical URL's, Open Graph-beelden,
JSON-LD (LocalBusiness uit `business.ts`, projecten als CreativeWork),
redirects van de oude URL's. Bij de domeinwissel gaat `noindex` eraf.

## 5. Checks

| Commando | Wat | Faalt als |
| --- | --- | --- |
| `npm run build` | productiebouw + TypeScript | een type- of buildfout |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) | een lintfout |
| `npm run typecheck` | `tsc --noEmit` | een typefout (draai eerst een build, voor de route-typen) |
| `npm run contrast` | WCAG-contrast van de tokens | een paar onder AA |
| `npm run photos` | metadata en grootte van foto's | EXIF/XMP of > 800 kB |
| `npm run check` | typecheck + lint + contrast + photos | een van de vier |
| `npm run test:e2e` | Playwright | een test |

## 6. De Playwright-suite (`tests/site.spec.ts`)

Twee projecten: **desktop** (1440 × 900) en **telefoon** (Pixel 7). De
webserver is een productiebuild op poort 3200.

| Test | Wat hij bewaakt |
| --- | --- |
| het menu heeft precies vier woorden en markeert de pagina | de vier woorden in volgorde; `aria-current` volgt een klik |
| Kennismaken is altijd bereikbaar, en het logo gaat naar home | Kennismaken in het menu (desktop) of in de kop (telefoon); het logo leidt naar `/` |
| de pijl wijst omlaag bovenaan en omhoog tijdens het lezen | de naam van de knop wisselt na scrollen (alleen desktop) |
| niets loopt horizontaal buiten het scherm | op zes routes is `scrollWidth ≤ innerWidth` |
| Weergave onthoudt Donker, ook na herladen | de keuze komt in `localStorage` en de pre-paint zet hem terug |
| een onbekende pagina geeft een echte 404 | status 404 en de kop "Hier groeit nog niets." |
| geen toegankelijkheidsfouten (licht / donker) | axe op zes routes, per thema |

Laatste run (4 oktober 2026): **15 geslaagd, 1 overgeslagen** (de pijl op
de telefoon, die daar bewust niet bestaat).

In een omgeving met een vooraf geïnstalleerde Chromium (zoals de
cloudomgeving van Claude Code):

```bash
PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e
```

Lokaal installeert `npx playwright install chromium` de browser.

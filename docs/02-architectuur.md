# Architectuur en besluiten

Deze repo is een nieuwe start, geen opgeschoonde kopie van `gronn-studio`.
Uit de oude site is alleen gekopieerd wat onder *Keep* staat. Hoe die
site was opgebouwd (zijn componenten en lagen) is bewust níet het
vertrekpunt.

- Bronrepo (alleen gelezen, nooit gewijzigd): `gronnstudio/gronn-studio`,
  commit `3bf250b` van 4 oktober 2026.
- Ook in deze sessie aanwezig maar niet gebruikt: `gronnstudio/GRONN`
  (V2C, de conceptbuild met GSAP).

---

## 1. Keep / Rewrite / Leave behind

### Keep: overgenomen zoals het was

| Wat | Waar het vandaan komt | Waar het nu staat |
| --- | --- | --- |
| Kleuren Brand Guide 2026 (bosgroen, mos, salie, gebroken wit, antraciet, aarde-oranje, donkeroranje) en de 60/30/10-verhouding | `src/app/globals.css` | `styles/globals.css`, blok `:root` |
| De kleurparen voor licht en donker (achtergrond, vlak, tekst, gedempt, accent, oranje tekst, focusring) | `.goldenhour` / `.bluehour` | `.licht` / `.donker` |
| Syne SemiBold en Montserrat (Nicks eigen bestanden, gesubset naar woff2) | `src/fonts/` | `styles/fonts/` |
| Geist Mono | via `next/font/google` | lokaal: `styles/fonts/GeistMono-Variable.woff2`, uit het npm-pakket `geist` (OFL) |
| De typeschaal van de gids (p. 7), vloeiend met `clamp()` | `--tekst-*` in `globals.css` | `--tekst-*` in `styles/globals.css` |
| Het woordmerk en de logo's, ongewijzigd | `public/brand/` | `public/brand/` |
| Foto's vijverrenovatie en terras Geulle (zonder metadata) | `public/projecten/` | `public/projecten/` |
| Projectteksten, cijfers en alt-teksten | `src/lib/data/vijverrenovatie.ts`, `terras-geulle.ts` | `data/projects.ts` (fase 1: alleen wat nu gebruikt wordt) |
| Positioneringszin, merkbasis, merkbelofte, openingskop | `src/components/gronn/home.tsx`, `plekken.ts` | `data/site.ts` |
| Bedrijfsgegevens | `src/lib/business.ts` | `data/business.ts` |
| De contrastcheck | `scripts/check-contrast.mjs` | `scripts/check-contrast.mjs` (ingekort) |
| De metadatacheck voor foto's | `tests/e2e/vijver-beeld.spec.ts` | `scripts/check-photo-metadata.mjs` (als script, over heel `public/`) |
| De favicon en de Apple-icon | `src/app/icon.png`, `apple-icon.png` | `app/` |

### Rewrite: opnieuw en kleiner gemaakt

| Wat | Oud | Nieuw |
| --- | --- | --- |
| Thema en pre-paint | `next-themes`, `ThemeModeProvider`, twee localStorage-sleutels, één knop die rondloopt | Geen bibliotheek. Eén sleutel `gronn-weergave` (`licht`/`donker`, weg = Auto). Een script van één regel in `<head>` (`lib/weergave.ts`, `PREPAINT`) |
| Leesopties | Beweging, onderstreping, tekstgrootte, contrast, privacyblur | Alleen **Minder beweging** (`gronn-beweging`). Tekstgrootte is de zoom van de browser |
| Menu | Header + megamenu (desktop), tabletmenu, DockNav + TopBar (telefoon), komeet, labels, zoeken, delen | Eén component `BottomNavigation`, op elk scherm dezelfde vorm |
| Beweging | GSAP (V2C), framer-motion en Lenis (gronn-studio) | CSS-keyframes, `animation-timeline: view()` en React `<ViewTransition>` |
| Projectdata | `Project`-type met i18n-velden, `FOTOS`-tabellen, fasebalken, begrippen | Eén klein `Project`-type in `data/projects.ts` |
| URL's | `/nl/projects/vijverrenovatie-twee-vijvers-waterval-beekloop` | `/werk/vijverrenovatie`, `/werk/terras-geulle` (redirects in fase 3) |
| Fotostrook | `FotoMarkee` (twee tegengesteld lopende rijen) | Nog niet overgenomen: fase 2, alleen als een projectpagina hem nodig heeft |

### Leave behind: bewust niet meegenomen

- **Uit de brief:** waaier- of radiaal menu, de oude dock, bubbels (Contact- en HemelBubbel), het 404-spel (Voedselbos), de tuinkalender, de techniekpagina (`/stack`), ⌘K en de zoektip, easter eggs, portaal, dashboard, editor, DEV-laag, NextAuth, Supabase, Vercel Blob.
- **Ook weg, omdat ze tegen de brief ingaan:**
  - het i18n-systeem en de Engelse routes;
  - de paneeltinten en de kleurschaal van Editie 02, kaarten en iconentegels;
  - het openingsdoek;
  - service worker, PWA- en offlinemeldingen, pull-to-refresh;
  - de aanwijzer (cursor), randpijlen, leesdraad en voortgangsring;
  - de `photo-glass`-laag over foto's;
  - de linkpagina (links.gronn.studio) en de host-regel in `proxy.ts`;
  - Speed Insights (kan terug zodra de site live gaat).

---

## 2. Mappen

```
app/                  routes (App Router)
  layout.tsx          html-schil: fonts, pre-paint, skiplink, kop, menu, voet, ViewTransition
  page.tsx            home
  not-found.tsx       404
  vijvers/ tuinen/ over/ kennismaken/   fase 1: alleen een PageIntro
  werk/page.tsx       projectindex (fase 1: eenvoudig)
  werk/[slug]/page.tsx  projectpagina (fase 1: opening + intro)
components/           één component per zichtbare verantwoordelijkheid
data/                 getypte inhoud: business.ts, projects.ts, site.ts
lib/                  weergave.ts (kleur en beweging)
styles/               globals.css + fonts/
public/               brand/ en projecten/
scripts/              check-contrast.mjs, check-photo-metadata.mjs
tests/                site.spec.ts (Playwright)
docs/                 deze documentatie
```

**Geen `src/`, geen lagen als atoms/molecules/organisms.** Een nieuwe
ontwikkelaar ziet in één blik waar iets staat. Het pad-alias `@/` wijst
naar de root (`tsconfig.json`).

## 3. Rendering

- **Alles is statisch.** Elke route wordt bij de build vooraf gerenderd
  (`○` of `●` in de build-uitvoer). Er is geen server-logica, geen API,
  geen database.
- **Server components als standaard.** Maar twee componenten draaien in
  de browser (`"use client"`):
  - `BottomNavigation`, voor het actieve woord (`usePathname`) en de
    stand van de pijl (scroll);
  - `AppearanceMenu`, voor het lezen en bewaren van de keuze.
- `werk/[slug]` gebruikt `generateStaticParams` met `dynamicParams =
  false`: een onbekende slug geeft meteen een 404.
- `PageProps<"/werk/[slug]">` is het type dat Next 16 zelf genereert bij
  `next dev`/`next build`. Een losse `tsc --noEmit` zonder eerdere build
  kent het niet; `npm run build` doet de TypeScript-check wél goed.

## 4. Gegevensstroom

```
data/business.ts ──► SiteFooter (straks ook juridisch, contact, JSON-LD)
data/site.ts     ──► layout (metadata), HomeHero, home, BottomNavigation, SiteHeader
data/projects.ts ──► HomeHero (OPENINGSBEELD), ProjectTeaser, /werk, /werk/[slug]
lib/weergave.ts  ──► layout (PREPAINT), AppearanceMenu (pasToe)
styles/globals.css ──► alles; check-contrast.mjs leest het mee
```

Er is precies één plek per feit. Wie een adres, een menuwoord of een
projecttekst wil veranderen, verandert één bestand in `data/`.

## 5. Besluiten

Elk besluit met de reden. Nieuwe besluiten komen onderaan.

1. **Root-mappen in plaats van `src/`.** De brief noemt `app/ components/
   data/ lib/ styles/ public/ tests/`; dat is ook het kortste pad.
2. **Contact op een eigen route `/kennismaken`**, buiten het hoofdmenu.
   Zo wijst Kennismaken overal naar dezelfde plek (kop op de telefoon,
   menu op desktop) en kan `/contact` daar straks naartoe verwijzen. Een
   anker `#kennismaken` zou alleen op de pagina's werken waar het blok
   staat.
3. **Chroom in px, tekst in `clamp()`.** Menu, knoppen en kop houden hun
   maat als iemand de tekst groter zet; alleen de tekst groeit. Les uit
   gronn-studio, waar rem-maten de dock lieten overlopen.
4. **Syne staat alleen als SemiBold in de repo.** De brief zegt Syne
   Bold; er is geen Bold-bestand. We vragen gewicht 600 en zetten
   `font-synthesis-weight: none`, zodat de browser nooit een nep-vet
   maakt. Een echt `Syne-Bold`-bestand kan erbij zodra Nick het levert.
5. **Geist Mono lokaal.** Uit het `geist`-pakket gekopieerd en het pakket
   weer verwijderd. Geen font wordt bij de build of door een bezoeker
   opgehaald.
6. **Auto volgt de klok, niet het systeem.** 07:00–19:00 licht, daarbuiten
   donker: de "Uren" uit gronn-studio. Zonder JavaScript is de site licht.
7. **Eén nieuwe opslagsleutel.** `gronn-weergave` in plaats van de oude
   `theme` + `gronn-theme-mode`. Een terugkerende bezoeker van gronn.studio
   die ooit handmatig een kleur koos, ziet na de domeinwissel één keer
   Auto. Dat weegt niet op tegen een tweede sleutel bijhouden.
8. **Weergave als native `popover`.** De browser regelt openen, sluiten
   met Escape, klikken buiten het paneel en de toplaag. Geen focusval of
   eigen klik-logica.
9. **Het woordmerk als CSS-masker.** `woordmerk-wit.svg` is één vlakke
   vorm; als masker neemt het de tekstkleur aan (antraciet op licht, wit
   op donker en over de openingsfoto). Eén bestand, geen wissellogica.
10. **De kop wordt licht boven de openingsfoto zonder JavaScript.**
    `body:has([data-kop-licht]) .site-header { color: … }`. De opening
    draagt `data-kop-licht`; andere pagina's niet.
11. **De kop scrollt mee weg, het menu onderaan blijft.** Eén blijvend
    element is genoeg.
12. **Geen pijl op de telefoon.** Onder 640px heeft de pil de hele breedte
    nodig voor vier woorden; scrollen met de duim is daar al de snelste
    weg terug.
13. **Paginawissels via React `<ViewTransition>`** rond `<main>`. Werkt
    zonder configuratie in Next 16 (zie
    `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`);
    zonder ondersteuning in de browser gewoon geen animatie.
14. **De vijver noemt geen plaats.** Nick gaf er geen; de site verzint er
    geen. De brief noemde "Geleen", die staat nergens in de bron.
15. **`noindex` tot de domeinwissel** (`robots` in `app/layout.tsx`). Zo
    concurreert de preview niet met gronn.studio in zoekmachines.
16. **Vercel-project `gronn26`** in team GRØNN Studio, los van het
    productieproject `gronn-studio`. Zie [`07-werkwijze.md`](07-werkwijze.md).

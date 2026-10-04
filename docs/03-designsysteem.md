# Het designsysteem

Alles wat hieronder staat, leeft in één bestand: `styles/globals.css`. Daar
staan de merkkleuren, de twee thema's, de typografie, het raster, het glas
van het menu en de beweging. Er is geen tweede stijlbron. Tailwind v4 leest
de tokens via `@theme inline`, zodat `bg-background`, `text-muted`,
`bg-gronn-oranje` enzovoort gewoon werken.

Volgorde in het bestand: merk → thema's → typografie → base → raster →
menu-glas → beweging → woordmerk → kop over foto → Weergave-paneel.

---

## 1. Kleur

### Merkkleuren (gelijk in beide thema's)

Uit de GRØNN Brand Guide 2026 (Editie 01).

| Token | Hex | Naam | Gebruik |
| --- | --- | --- | --- |
| `--gronn-antraciet` | `#202020` | antraciet | tekst op licht, tekst op oranje, donkere grond |
| `--gronn-bos` | `#23483a` | bosgroen | het glas van het menu, actieve tekst op salie |
| `--gronn-mos` | `#607a59` | mosgroen | gereserveerd (nog niet gebruikt) |
| `--gronn-salie` | `#b8c5a8` | salie | het actieve woord in het menu, gekozen optie in Weergave |
| `--gronn-wit` | `#efeeea` | gebroken wit | lichte grond, tekst op foto's en op bosgroen |
| `--gronn-oranje` | `#db6923` | aarde-oranje | **de ene actiekleur:** Kennismaken, tekstselectie |
| `--gronn-oranje-donker` | `#a14312` | donkeroranje | oranje als tekst op licht |

**Verhouding 60 / 30 / 10** (licht / donker / accent). De foto's leveren
al veel groen, dus de interface gebruikt groen alleen in het menu.

**Regels voor oranje:**

- Als vlak draagt oranje **antraciet** (4,70:1), nooit wit.
- `#db6923` op gebroken wit (2,99:1) is **nooit** een tekstpaar; oranje
  tekst op licht is `#a14312`.
- Eén oranje accent per compositie. Nu: Kennismaken. Daarom is de link in
  de opening wit met een onderlijn, niet oranje.

### Thema's

De klasse op `<html>` bepaalt het thema: `licht` of `donker`. Zonder
JavaScript (en dus zonder klasse) geldt `:root`, gelijk aan Licht.

| Token | Licht | Donker | Waarvoor |
| --- | --- | --- | --- |
| `--background` | `#efeeea` | `#202020` | paginagrond |
| `--surface` | `#f8f7f4` | `#2a2a2a` | vlak achter een foto die nog laadt |
| `--foreground` | `#202020` | `#efeeea` | lopende tekst |
| `--muted` | `#5c5a54` | `#aaa8a0` | secundaire tekst, labels |
| `--line` | `#202020` | `#efeeea` | lijnen (altijd met dekking, bv. `border-line/15`) |
| `--accent` | `#23483a` | `#b8c5a8` | hover op koppen |
| `--ember-text` | `#a14312` | `#e27b3c` | oranje als tekst |
| `--focus-ring` | `#a14312` | `#db6923` | toetsenbordfocus |

Regels uit gronn-studio die blijven gelden:

- nooit puur zwart als grond (Donker is `#202020`);
- in donker is een vlak **lichter** dan de grond, nooit een schaduw;
- `color-scheme` staat per thema, zodat formulieren en scrollbalken
  meekleuren.

`@custom-variant dark` wijst naar `.donker`, dus `dark:`-utilities werken.

### Contrast

`npm run contrast` (`scripts/check-contrast.mjs`) leest de echte blokken
`:root`, `.licht` en `.donker` uit `globals.css` en meet:

- per thema: tekst, tekst op vlak, gedempte tekst (op grond en vlak),
  accent, oranje tekst (4,5:1) en de focusring (3:1);
- merkparen: antraciet op oranje (4,70), gebroken wit op bosgroen (8,78),
  bosgroen op salie (5,63), donkeroranje op gebroken wit (5,44).

Bij één paar onder de norm stopt het script met exit 1. **Verander je een
kleur, draai dan deze check.** De drempel gaat nooit omlaag; de kleur
verandert.

---

## 2. Typografie

### Families

| Family | Variabele | Bestand | Gewicht | Waarvoor |
| --- | --- | --- | --- | --- |
| Syne | `--font-syne` → `--font-heading` | `Syne-SemiBold-latin.woff2` (12 kB) | 600 | opening, grote uitspraken, grote getallen, enkele titels: **schaars** |
| Montserrat | `--font-montserrat` → `--font-sans` | `Montserrat-latin.woff2` (32 kB) | 400–600 | lezen, menu, knoppen |
| Geist Mono | `--font-geist-mono` → `--font-mono` | `GeistMono-Variable.woff2` (71 kB) | 100–900 | de technische laag: codes, nummers, plaatsen, data, labels, prijzen, bijschriften |

Alle drie worden geladen met `next/font/local` in `app/layout.tsx`
(`display: swap`). `font-synthesis-weight: none` op `<html>` verbiedt
nep-vet: een gewicht dat niet bestaat, valt zichtbaar terug in plaats van
smoezelig vet te worden.

### Schaal

De schaal van de gids (p. 7), vloeiend van ±390px naar ±1280px. Min en max
in px, zodat zoomen tot 200 % blijft werken.

| Variabele | Waarde | Telefoon → desktop |
| --- | --- | --- |
| `--tekst-display` | `clamp(44px, 24.72px + 4.944vw, 88px)` | 44 → 88px |
| `--tekst-h1` | `clamp(40px, 29.48px + 2.697vw, 64px)` | 40 → 64px |
| `--tekst-h2` | `clamp(30px, 23.87px + 1.573vw, 44px)` | 30 → 44px |
| `--tekst-h3` | `clamp(22px, 20.25px + 0.449vw, 26px)` | 22 → 26px |
| `--tekst-groot` | `clamp(20px, 17.4px + 0.67vw, 26px)` | 20 → 26px |
| `--tekst-lees` | `clamp(16px, 15.12px + 0.225vw, 18px)` | 16 → 18px |

Onder 360px schermbreedte: display 38px, h1 34px. Een lang Nederlands woord
("samenhangend") liep anders buiten een scherm van 320px.

### Utilities

| Utility | Family | Regelafstand | Spatiëring | Gebruik |
| --- | --- | --- | --- | --- |
| `tekst-display` | Syne 600 | 1,02 | −0,03em | de kop van de opening |
| `tekst-h1` | Syne 600 | 1,06 | −0,025em | paginatitels |
| `tekst-h2` | Syne 600 | 1,10 | −0,02em | projecttitels, grote uitspraken |
| `tekst-h3` | Montserrat 500 | 1,30 | −0,01em | de positioneringszin, kleine titels |
| `tekst-groot` | Montserrat | 1,50 | −0,005em | inleidende alinea |
| `tekst-label` | Geist Mono 400, 12px, HOOFDLETTERS | 18px | 0,06em | alles wat technisch of meta is |

Lopende tekst (`body`): Montserrat, `--tekst-lees`, regelafstand **1,65**.
Leesbreedte maximaal **38rem**. Koppen krijgen `text-wrap: balance`,
alinea's `text-wrap: pretty`.

**Menu en knoppen:** Montserrat 600, 12–13px, hoofdletters, spatiëring
0,1em, in px (chroom groeit niet mee).

---

## 3. Ruimte en raster

### Variabelen

| Variabele | Waarde | Waarvoor |
| --- | --- | --- |
| `--goot` | `clamp(24px, 4vw, 72px)` | buitenmarge links en rechts |
| `--ruimte-sectie` | `clamp(112px, 14vw, 240px)` | tussen grote secties |
| `--ruimte-blok` | `clamp(56px, 7vw, 120px)` | binnen een sectie |
| `--dock-hoogte` | `52px` | hoogte van menu, Kennismaken en pijl |
| `--dock-onder` | `16px` | afstand van het menu tot de onderrand |
| `--ease-rust` | `cubic-bezier(0.22, 1, 0.36, 1)` | de enige easing van de site |

`body` krijgt onderaan `--dock-hoogte + 2 × --dock-onder + safe-area` als
padding, zodat het menu nooit de laatste regel van de voet afdekt.

### `raster`

```
telefoon (< 768px)   4 kolommen, tussenruimte 16px
vanaf md (≥ 768px)  12 kolommen, tussenruimte clamp(16px, 2vw, 32px)
breedte              tot 1520px + 2 × goot, gecentreerd
```

Componenten plaatsen zich met `col-span-*` en `col-start-*`. Op de
telefoon is alles `col-span-4`; vanaf `md` asymmetrisch. Voorbeelden uit
fase 1:

```
Opening      |  .  .  .  .  . [label / kop / link  ──────────] |   kolom 6–12
Positionering| [label] . [ zin ─────────────────────] .  .  . |   label 1–2, zin 4–10
Projectteaser| [titel, tekst, gegevens] [ beeld ─────────────] .|   tekst 1–4, beeld 5–11
Paginakop    | [label ──] [ titel ──────────────────────────] .|   label 1–3, titel 4–11
```

### `regel`

Een lijn van 1px in `--line` op 18 % dekking. Scheidt secties zoals in een
monografie, in plaats van kaders.

---

## 4. Het menu-glas (`dock-glas`)

```
achtergrond   bosgroen op 84 % (color-mix)
blur          backdrop-filter: blur(14px) saturate(1.2)
rand          1px gebroken wit op 14 %
tekst         gebroken wit
```

Bewust **merkkleuren, geen thematokens**: het menu ziet er op Licht, op
Donker en boven een foto hetzelfde uit. Inactieve woorden staan op 85 %
dekking, bij hover op 100 %. Het actieve woord: bosgroen op een salie pil.

---

## 5. Beweging

Principe uit de brief: **beweging laat structuur zien, nooit alleen
decoratie.** Vier gedragingen, meer niet.

| # | Gedrag | Klasse | Keyframes | Wanneer |
| --- | --- | --- | --- | --- |
| 1 | Tekst schuift uit een masker | `.onthul-regel > span` met `.opening` of `.scroll-regel` | `regel-op` (translateY 105 % → 0) | opening: bij laden, 1,1 s, per regel 0,09 s later. Elders: op scroll, `entry 10%`–`entry 70%` |
| 2 | Beeld opent | `.scroll-beeld` | `beeld-open` (clip-path inset 6 %/4 % → 0, schaal 1,06 → 1) | op scroll, `entry 0%`–`cover 35%` |
| 2b | Openingsfoto komt tot rust | `.opening-beeld` | `beeld-rust` (schaal 1,05 → 1) | bij laden, 2,4 s |
| 3 | Lichte diepte | `.diepte` | `diepte` (translateY −4 % → 4 %, schaal 1,08) | op scroll, hele `cover`-bereik |
| 4 | Lijnen tekenen | — | — | komt met het watersysteem (fase 2) |

**Hoe het is afgeschermd:**

```css
@media (prefers-reduced-motion: no-preference) {
  :root:not([data-motion="reduced"]) {
    /* laad-animaties */
    @supports (animation-timeline: view()) {
      /* scroll-animaties */
    }
  }
}
```

- Zonder ondersteuning voor `animation-timeline` (bv. oudere Safari): alles
  staat gewoon op zijn plek. De beweging komt erbij, nooit andersom.
- Bij **minder beweging**, uit het systeem of gekozen onder Weergave
  (`data-motion="reduced"` op `<html>`): geen enkele animatie, ook geen
  paginawissel. De inhoud is er volledig.
- De pijl in het menu en de salie vulling gebruiken `motion-reduce:transition-none`.
- De pijl scrollt met `behavior: "smooth"`, of `"auto"` bij minder beweging.

**Paginawissels:** React `<ViewTransition>` rond `<main>`. De standaard
crossfade, 360 ms, `--ease-rust`. Geen laadscherm; navigatie wacht nooit
op een animatie.

**Micro-interacties:** tekst in het menu schuift 1px omhoog bij hover;
Kennismaken en de pijl 2px; de pijl in links schuift 4px naar rechts; de
onderlijn van een link wordt voller. Niets heeft hover nodig om begrepen
te worden.

---

## 6. Focus en selectie

- `:focus-visible`: 2px `--focus-ring`, 3px afstand. Overal, ook in het
  menu en in het Weergave-paneel (daar via `has-[:focus-visible]` op het
  label rond de verborgen radioknop).
- Tekstselectie: antraciet op oranje.
- Skiplink "Direct naar de inhoud": verborgen tot focus, dan oranje
  linksboven; springt naar `<main id="inhoud">`.

---

## 7. Logo

`.woordmerk` is een `span` met `woordmerk-wit.svg` als CSS-masker en
`background: currentColor`. Verhouding 784 × 167 (de bijgesneden viewBox).
Breedte in de kop: 84px (< 400px), 104px, 128px (≥ md). De SVG's zelf
worden nooit opnieuw getekend of aangepast.

In `public/brand/` staan ook `woordmerk-antraciet.svg`,
`woordmerk-primair.svg` (wit met de oranje P) en de volledige logo's. Ze
worden in fase 1 niet gebruikt, maar horen bij de merkset.

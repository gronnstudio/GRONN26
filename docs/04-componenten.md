# Componenten

Zeven componenten in `components/`, elk met één zichtbare
verantwoordelijkheid. Er is bewust geen bibliotheek van knoppen, secties
of wrappers: een `<Link>` met een paar klassen is geen component waard.
Een nieuw component komt er pas als hetzelfde stuk interface op twee
plekken nodig is, of als het eigen gedrag heeft.

| Component | Type | Waar | Regels |
| --- | --- | --- | --- |
| `SiteHeader` | server | `app/layout.tsx` | 31 |
| `AppearanceMenu` | **client** | in `SiteHeader` | 127 |
| `BottomNavigation` | **client** | `app/layout.tsx` | 115 |
| `SiteFooter` | server | `app/layout.tsx` | 27 |
| `HomeHero` | server | `app/page.tsx` | 58 |
| `ProjectTeaser` | server | `app/page.tsx` | 70 |
| `PageIntro` | server | stubpagina's, `/werk`, 404 | 11 |

---

## SiteHeader

Het logo linksboven (naar `/`) en rechts Weergave. Op de telefoon
(< 640px) staat daar ook **Kennismaken**, want daar heeft het menu onderaan
de hele breedte nodig voor de vier woorden.

- `position: absolute` bovenaan: de kop scrollt mee weg.
- Gebruikt níet het `raster`, maar een eigen flexrij met 16px zijmarge
  onder 400px. Op 320px moeten logo (84px), Kennismaken (11px tekst) en
  Weergave naast elkaar passen; met de 24px-goot van het raster schoof het
  logo onder de knop.
- Hoogte 72px, vanaf `md` 88px.
- Kleur: `text-foreground`. Boven de openingsfoto wordt die gebroken wit via
  `body:has([data-kop-licht]) .site-header` (geen JavaScript).
- Toegankelijke naam van het logo: "GRØNN Studio, naar de voorpagina".

## AppearanceMenu

De knop **Weergave** en een klein paneel (native `popover`, id
`weergave`). Twee keuzes, elk een `fieldset` met radioknoppen:

| Keuze | Opties | Opslag | Effect |
| --- | --- | --- | --- |
| Kleur | Auto · Licht · Donker | `localStorage["gronn-weergave"]` = `licht`/`donker`; Auto = sleutel weg | klasse `licht`/`donker` op `<html>` |
| Beweging | Normaal · Minder | `localStorage["gronn-beweging"]` = `minder`; Normaal = sleutel weg | `data-motion="reduced"` op `<html>` |

- Leest de opslag met `useSyncExternalStore`. De server-snapshot is
  Auto/Normaal; na hydratie de echte waarde. Zo is er geen `setState` in
  een effect en geen mismatch.
- Bij een keuze: opslaan → `pasToe()` uit `lib/weergave.ts` → een eigen
  event `gronn-weergave`, zodat elke lezer meteen bijwerkt. Het
  `storage`-event houdt ook andere tabbladen gelijk.
- Paneel: 248px breed, vast rechtsboven (`.weergave-paneel`: top 68px,
  rechts de goot), grond `bg-background`, rand `line/15`, één zachte
  schaduw.
- Gekozen optie: salie vulling, bosgroen tekst (zelfde taal als het menu).
- Toetsenbord: Tab naar Weergave, Enter opent, pijltjes kiezen binnen een
  groep, Escape sluit (browser).

## BottomNavigation

Het blijvende menu onderaan, op elke pagina in dezelfde vorm.

```
desktop / tablet (≥ 640px)
[ KENNISMAKEN ]          [ VIJVERS  TUINEN  WERK  OVER ]          [ ↓ ]
 links, oranje            midden, 440px, bosgroen glas            rechts, rond

telefoon (< 640px)
[ VIJVERS   TUINEN   WERK   OVER ]      schermbreed, 12px marge
```

- `<nav aria-label="Hoofdmenu">`, vast onderaan:
  `bottom: 16px + safe-area`.
- Rij: `grid-cols-[1fr_auto_1fr]` met de goot van de pagina, maximaal
  even breed als het raster.
- **Kennismaken:** 52px hoog, oranje, antraciet tekst 12px/600/0,1em,
  hoofdletters. Alleen vanaf 640px (op de telefoon staat hij in de kop).
- **De pil:** `<ul>` met vier gelijke kolommen, `dock-glas`, 52px hoog,
  5px binnenruimte. Het actieve woord krijgt `aria-current="page"`.
- **De salie vulling:** één `<li aria-hidden>` van een kwart breed die met
  `translateX(index × 100%)` naar het actieve woord glijdt (500 ms,
  `--ease-rust`). Op home (geen actief woord) is hij onzichtbaar.
- **Actief bepalen:** `usePathname()`; een woord is actief als het pad
  gelijk is of eronder ligt (`/werk/vijverrenovatie` → Werk).
- **De pijl:** een knop van 52 × 52 met dezelfde glaslaag.
  - Bovenaan (`scrollY < 48`): pijl omlaag, naam "Verder naar beneden",
    scrollt 85 % van het scherm.
  - Verder: pijl draait 180°, naam "Terug naar boven", scrollt naar 0.
  - Scroll-luisteraar is `passive` en via `requestAnimationFrame`
    gedempt; React rendert alleen als de stand omslaat.
  - Alleen vanaf 640px.

## SiteFooter

Het colofon. Fase 1: vier kolommen in `tekst-label`, gedempt, met een
lijn erboven. Leest alles uit `data/business.ts`: naam, adres, e-mail
(`mailto:`), telefoon (`tel:`), KVK en BTW. Juridische pagina's en FAQ
komen in fase 3.

## HomeHero

De opening van de voorpagina.

- `<section data-kop-licht>` van minimaal **90svh**, de foto als
  achtergrond (`next/image`, `fill`, `priority`, `sizes="100vw"`, AVIF of
  WebP).
- Beeld: `OPENINGSBEELD` uit `data/projects.ts` (F10, de waterval,
  `object-position: 50% 60%`).
- Een verloop over de foto: bovenaan 45 % voor de kop, onderaan 72 % voor
  de tekst, in het midden helder.
- Inhoud in het raster, vanaf `md` in kolom 6–12, onderaan uitgelijnd:
  1. label `OPENING.label` ("Vijvers en tuinen · Stein en omgeving"),
  2. `<h1>` `OPENING.kop` in `tekst-display`, in twee regels gesplitst
     (`splitsKop`) voor de onthulling per regel,
  3. één link "Bekijk het werk →" naar `/werk`.
- Linksonder (vanaf `lg`) een bijschrift in mono: "GR / 001 — De
  waterval".

## ProjectTeaser

Een project op de voorpagina als spread, niet als kaart.

```
──────────────────────────────────────────────────────── (regel)
01 / VIJVERRENOVATIE                              GR / 001

                        ┌───────────────────────────┐
  Twee vijvers.         │                           │
  Eén samenhangend      │       groot beeld         │
  watersysteem.         │   (1:1 desktop, 4:5 tel.) │
                        │                           │
  samenvatting          └───────────────────────────┘
  STATUS  IN AFRONDING
  JAAR    2026
  BEKIJK HET PROJECT →
```

- Props: `project: Project`, `index: number`.
- De titel wordt bij ". " gesplitst; elke zin is een regel die op scroll
  onthult.
- Het beeld is een link met `tabIndex={-1}` en `aria-hidden`, zodat
  toetsenbord en schermlezer één link per project krijgen (de titel en
  "Bekijk het project").
- Beeld: `scroll-beeld` (opent op scroll) en `diepte` (lichte parallax),
  `sizes="(min-width: 768px) 58vw, 100vw"`, uitsnede via `cover.focus`.
- Gegevens als `<dl>` in mono: Status, Plaats (alleen als die er is), Jaar.

## PageIntro

De opening van een gewone pagina: label (mono, kolom 1–3), titel
(`tekst-h1`, kolom 4–11) en optioneel één alinea in `tekst-groot`. Ruimte
erboven `clamp(160px, 22vh, 240px)`, eronder `--ruimte-blok`. Gebruikt op
de stubpagina's, `/werk` en de 404.

---

## Routes

| Route | Bestand | Fase 1 |
| --- | --- | --- |
| `/` | `app/page.tsx` | opening, positioneringszin, eerste project |
| `/vijvers` | `app/vijvers/page.tsx` | PageIntro met "wordt in fase 3 gebouwd" |
| `/tuinen` | `app/tuinen/page.tsx` | idem |
| `/over` | `app/over/page.tsx` | idem |
| `/kennismaken` | `app/kennismaken/page.tsx` | idem (formulier in fase 3) |
| `/werk` | `app/werk/page.tsx` | twee projecten, verspringend in twee kolommen |
| `/werk/[slug]` | `app/werk/[slug]/page.tsx` | code + categorie, titel, groot beeld, de introtekst |
| 404 | `app/not-found.tsx` | "Hier groeit nog niets." + link naar home |

Titels: `%s — GRØNN Studio`; standaard "GRØNN Studio · Vijvers en tuinen
in Stein en omgeving". Beschrijving: `MERKBASIS`.

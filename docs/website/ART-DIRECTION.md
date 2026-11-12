# Art direction: Veldboek

Stand 9 nov 2026. Hoort bij [BLUEPRINT.md](BLUEPRINT.md).

## 1. De richting in één zin

**De site is het veldboek van een tuinarchitect:** wat Nick ziet, meet en
noteert, opgemaakt als een architectuurtijdschrift. Grote koppen in Syne,
rustige tekst in Montserrat, en alles wat gemeten of gezien is in Geist Mono:
coördinaten, codes, hoekhaken op foto's.

## 2. Principes

1. **Kijken is het product.** Het herkenbaarste element is de hoekhaak
   (observatiekader) op echte foto's. Hij komt terug in de opening, in
   Observatie 001 en als detail in dossiers. Geen decoratie: elk kader zegt
   iets wat waar is op die foto.
2. **Papier en plaat.** Twee ondergronden, nooit meer: *papier* (warm crème)
   en *plaat* (antraciet). Wisselen tussen die twee is de belangrijkste
   overgang op de pagina. Groen komt alleen uit foto's.
3. **Eén accent.** Oranje #FF5B04 uit het logo, alleen voor de actie en het
   ene punt dat het verhaal draagt (het kernkader). Nooit als vlak-decoratie.
4. **Typografie als compositie.** De opening is één kop van drie regels met
   bewuste breuken, groot genoeg om de foto te dragen. Elke sectie heeft een
   eigen schaal; niet elke kop is even groot.
5. **Rechte hoeken.** Foto's 2 px hoek (was 16 px). Geen zwevende kaarten,
   geen schaduwen, geen glas buiten de navigatiepil.
6. **Ritme door verschil.** Geen twee secties na elkaar met dezelfde
   compositie: lijst, plaat, asymmetrisch raster, uitspraken, slot.

## 3. Wat we bewust vermijden

Tekst over een foto met een waas; drie gelijke dienstkaarten; chips en
pillen als inhoud; groene vlakken; verloopjes en glassmorphism; ronde
pijlknoppen als enige actie; stockfoto's; verzonnen cijfers, reviews of
logo's; beweging op elk element.

## 4. Kleur

| Token | Licht (papier) | Donker | Gebruik |
| --- | --- | --- | --- |
| `--grond` | `#f4efe6` papier | `#181816` antraciet | achtergrond |
| `--inkt` | `#1f1e1b` | `#eee9df` | tekst |
| `--gedempt` | `#5b554a` | `#b3ada1` | tweede tekst (≥ 4,5:1 op grond) |
| `--lijn` | `#d9d1c3` | `#383732` | haarlijnen |
| `--vlak` | `#ebe4d7` | `#23231f` | fotovakken, paneel |
| `--plaat` | `#1b1b19` | `#0f0f0e` | antraciete secties |
| `--op-plaat` | `#eee9df` | `#eee9df` | tekst op plaat |
| `--bos` | `#1b1b19` | | voet (was aardebruin) |
| `--oranje` / `--oranje-tekst` | `#ff5b04` / `#b84000` | `#ff5b04` | actie, kernpunt |

## 5. Typografie

Syne Bold (koppen), Montserrat (tekst en bediening), Geist Mono
(annotaties). Alles vloeiend met `clamp()`; regellengte in `ch`.

| Niveau | Letter | Maat | Regel | Spatie | Max |
| --- | --- | --- | --- | --- | --- |
| Display (H1 opening) | Syne 700 | `clamp(3rem, 1.1rem + 8.6vw, 10rem)` | 0.88 | -0.04em | 3 regels, handmatig gebroken |
| H2 sectie | Syne 700 | `clamp(2.25rem, 1rem + 4.4vw, 5.25rem)` | 0.95 | -0.03em | 14ch |
| H2 slot | Syne 700 | `clamp(2.75rem, 1rem + 7vw, 8.5rem)` | 0.9 | -0.04em | 12ch |
| H3 (index, dossier) | Syne 700 | `clamp(1.75rem, 1rem + 2.6vw, 3.25rem)` | 1 | -0.025em | — |
| Lead | Montserrat 400 | `clamp(1.125rem, 1rem + .55vw, 1.5rem)` | 1.45 | -0.005em | 34ch |
| Body | Montserrat 400 | 1rem | 1.65 | 0 | 62ch |
| Klein | Montserrat 500 | .875rem | 1.5 | 0 | 48ch |
| Annotatie | Geist Mono 500 | .75rem (11px op foto's) | 1.4 | .08em, kapitalen | — |
| Navigatie / knop | Montserrat 600 | 13px | 1 | .06em, kapitalen | — |

## 6. Ruimte en raster

- Rand: bestaande `--rand` (gutter `clamp(20px, 4vw, 56px)`, max 1440 px).
- Sectieruimte: `--vb-sectie: clamp(96px, 13vw, 208px)`; binnen een sectie
  `--vb-blok: clamp(40px, 6vw, 96px)`.
- Raster: 4 kolommen < 768 px, 12 kolommen daarboven, goot = `--goot`.
- Verhouding beeld/tekst: opening 5/12 beeld; dossiers 7/12 + 4/12
  verspringend; werkwijze 7/12 tekst, 4/12 portret.
- Onderaan de opening 112 px vrij voor de navigatiepil.

## 7. Beeld

Alleen echt werk en Nick zelf; sfeerbeelden met label. Hoge uitsneden (4:5,
3:4) voor de opening en het portret, breed (3:2) voor dossiers. Eén
kleurfilter voor alle foto's (bestaand: iets minder verzadigd, iets meer
contrast). Bijschriften in mono: code · plaats · jaar.

## 8. Beweging

| Interactie | Trigger | Duur / easing | Doel | Mobiel | Minder beweging |
| --- | --- | --- | --- | --- | --- |
| Kopregels opening | laden | 900 ms, `cubic-bezier(.2,.7,.1,1)`, 90 ms per regel | De kop wordt neergezet, niet getoond | gelijk | staat er meteen |
| Hoekhaken opening | laden, na de kop | 500 ms, zelfde easing | Wijst aan wat Nick ziet | gelijk | staan er meteen |
| Observatie 001 | in beeld | bestaand component (650 ms per kader) | Kijken in tempo | tikken voor uitleg | alles meteen |
| Secties | in beeld (`animation-timeline: view()`) | opschuiven 24 px + vervagen, gekoppeld aan scroll | Rustig binnenkomen | gelijk | uit |
| Indexregel | aanwijzen / focus | 350 ms | Beeld schuift mee, pijl schuift | geen beeld, wel pijl | geen transitie |
| Links | aanwijzen | 250 ms onderstreping groeit | Feedback | — | direct |

Alleen CSS en het bestaande observatiecomponent; geen nieuwe bibliotheek.

## 9. Referenties (principes, geen kopie)

Geen live onderzoek gedaan in deze sessie; de principes komen uit bekende
redactionele en architectuursites: grote typografie als compositie,
haarlijnen als structuur, mono voor metadata, licht/donker als
hoofdstukscheiding, en één accentkleur.

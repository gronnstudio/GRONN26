# Art direction: Doorsnede

9 november 2026. De richting voor de publieke site van GRØNN Studio.

## 1. De richting in één zin

**Een tuin gelezen als een bouwtekening:** grote, zelfverzekerde letters op crème en antraciet,
foto's van echt werk als bewijs, en kleine technische annotaties (codes, maten, coördinaten)
die laten zien dat hier iemand werkt die de techniek onder de tuin begrijpt.

"Doorsnede" omdat een doorsnede laat zien wat je normaal niet ziet: de laag water, bodem en
leiding onder het mooie beeld. Dat is precies wat GRØNN anders doet.

## 2. Principes

1. **Twee grondkleuren, één accent.** Crème `#EFEEEA` en antraciet `#202020`/`#1A1A18` wisselen per sectie. Oranje `#FF5B04` alleen voor de actie of één markering per scherm. Groen komt uit de foto's, nooit uit de interface.
2. **Type doet het werk.** Syne Bold groot en strak gespatieerd voor wat je moet onthouden; Montserrat voor wat je leest; Geist Mono klein voor wat je controleert.
3. **Annoteer alleen wat waar is.** Elke maat, code of datum komt uit de projectdata (`src/lib/data/`). Geen versiersels die op meting lijken.
4. **Asymmetrie met een reden.** Een 12-koloms raster; beelden schuiven, steken over randen, of staan verschoven om een volgorde te tonen (ervoor → tijdens → nu).
5. **Rust door weglaten.** Geen kaarten, geen schaduwen, geen glas, geen tweede knop.

## 3. Wat het herkenbaar maakt

- De **sectiemarkering** `01 — Studio` op een haarlijn, zoals bladnummers op een tekening.
- De **maatlijn** `|—— Waterlijn ± 12 m ——|` boven een beeld, met echte maten.
- **Bijschriften in mono** met beeldcode (`GR/001 · F10`).
- Het openingsbeeld dat **over de rand** van donker naar licht steekt.
- De **index** met woorden van 112px in plaats van dienstkaarten.

## 4. Wat we bewust niet doen

Groene interface, tekst links en een rond beeld rechts, drie dienstkaarten, zwevende kaarten met
schaduw, verlopen, glas, stockfoto's zonder label, getallenbalken zonder bron, reviews of keurmerken
die er niet zijn, beweging die doorloopt terwijl je leest, scroll-kaping, laadschermen.

## 5. Kleur

| Token | Licht | Donker | Contrast |
| --- | --- | --- | --- |
| `--grond` | #EFEEEA crème | #1A1A18 antraciet | |
| `--inkt` | #202020 | #EFEEEA | 14,0 / 15,0 |
| `--gedempt` | #5C5A54 | #A8A59C | 5,9 / 7,1 |
| `--lijn` | #D3D0C7 | #353430 | (randen) |
| `--oranje` | #FF5B04 | #FF5B04 | antraciet erop 5,2 |
| `--oranje-tekst` | #B84000 | #FF5B04 | 4,8 / 5,6 |
| diep vlak (`.vlak-diep.donker`) | #1A1A18 | #121211 | |

Gemeten met de WCAG-formule (relatieve luminantie). Dit vervangt zand en bruin van 11 oktober:
de brief van 9 november vraagt crème en antraciet. Het dashboard (`.crm`) heeft zijn eigen palet en verandert niet.

## 6. Typografie

Vloeiend met `clamp()` tussen 390 en 1440px. Utilities in `globals.css`; nooit een eigen maat in een component.

| Niveau | Utility | Letter | Maat | Regel | Spatie | Breedte |
| --- | --- | --- | --- | --- | --- | --- |
| Display (opening) | `t-display` | Syne 700 | 46 → 132px | 0,90 | −0,045em | 12ch |
| H1 paginatitel | `t-h1` | Syne 700 | 40 → 104px | 0,95 | −0,035em | 12ch |
| H2 sectie | `t-h2` | Syne 700 | 32 → 72px | 1,0 | −0,03em | 16–18ch, balance |
| H3 onderdeel | `t-h3` | Syne 700 | 24 → 36px | 1,1 | −0,02em | |
| Index | `t-index` | Syne 700 | 40 → 112px | 0,92 | −0,04em | |
| H4 | Montserrat 600 | | 18–20px | 1,3 | 0 | |
| H5/H6, labels | `meta` | Geist Mono 500 | 11–12px, hoofdletters | 1,45 | +0,04em | |
| Lead | `t-lead` | Montserrat 400 | 19 → 34px | 1,28 | −0,015em | 26–30ch |
| Tekst | `t-body` | Montserrat 400 | 16 → 17,5px | 1,65 | 0 | 62ch |
| Klein | | Montserrat 400 | 14px | 1,55 | 0 | |
| Navigatie | | Montserrat 500 | 15px | | | |
| Knop | `knop` | Montserrat 700, hoofdletters | 13px | 1,2 | +0,06em | |
| Bijschrift | `bijschrift` | Geist Mono 400 | 12px | 1,5 | 0 | |
| Projectdata | `meta` | Geist Mono 500 | 11–12px | | | |

Bewuste regelbreuken in de opening ("Vijvers / en natuurlijke / tuinen."): elke regel is een eigen
masker, zodat ze ook één voor één binnenkomen.

## 7. Ruimte en raster

- **Raster:** `raster` = 4 kolommen onder 768px, 12 daarboven; kolomgoot `--kolomgoot` 16 → 32px.
- **Breedte:** `--breedte` 1440px, marge `--goot` 20 → 56px (ongewijzigd, zodat kop, voet en menu op één lijn blijven).
- **Ruimte:** drie stappen. `--r-s` 16 → 24, `--r-m` 40 → 72, `--r-l` 88 → 176px. Tussen secties altijd `--r-l`; binnen een sectie `--r-m`.
- **Beeld en tekst:** in de opening 5 : 7 (tekst : beeld), in Studio 8 : 4, in Werk 4 : 7.
- **Hoeken:** foto's 4px (`--foto-hoek`, was 16; de brief vraagt minder rond), knoppen blijven helemaal rond (merk).

### Review per sectie (wat er mis was en wat het werd)

| Sectie | Probleem in de eerste versie | Ingreep |
| --- | --- | --- |
| Opening, 1440×900 | Knop viel onder de vouw: kop van 156px nam het hele scherm. | Display max 132px; vanaf 1280px zin en knop naast regel 2–3 (kolom 9–12). |
| Werk | Leeg vlak onder het staande ervoor-beeld (twee rijen hoog, rechts alleen kop). | Kop naar rechts boven Nu; Tijdens en specificatie samen in rij drie. |
| Index, telefoon | Label Sfeerbeeld liep uit de duimnagel van 72px. | Label in de duimnagel kleiner, blijft óp het beeld. |
| Opening, telefoon | Display 44px te bescheiden naast de lead. | 46px min, lead 19px. |

## 8. Beeld

- Alleen echt werk, met code en bijschrift in mono. Sfeerbeelden dragen het label op het beeld.
- Een lichte, gelijke behandeling (bestaand: iets minder verzadigd, iets meer contrast) zodat telefoonfoto's één reeks worden.
- Verschillende verhoudingen per rol: staand 3:5 voor *ervoor*, 4:5 voor mensen, 4:3/3:2 voor overzichten.

## 9. Beweging

| Wat | Trigger | Duur | Easing | Doel | Telefoon | Minder beweging |
| --- | --- | --- | --- | --- | --- | --- |
| Kopregels omhoog | laden | 900ms, 90ms na elkaar | cubic-bezier(.16,1,.3,1) | de belofte als eerste | zelfde | staat er meteen |
| Openingsbeeld opent | laden, +250ms | 1100ms | idem | aandacht naar het werk | zelfde | meteen |
| Zin en knop | laden, +550ms | 800ms | idem | volgorde: kop, dan actie | zelfde | meteen |
| Opkomst van blokken | in beeld scrollen | gekoppeld aan scroll | lineair | ritme bij het lezen | zelfde | staat er |
| Parallax portret | scrollen | gekoppeld aan scroll | lineair | diepte, één keer | lichter | uit |
| Index: beeld wisselt | aanwijzen/focus | 450ms (opacity), 900ms (schaal) | ease / (.22,1,.36,1) | voorproeven | eigen duimnagel | direct |
| Index: woord schuift | aanwijzen/focus | 500ms | (.22,1,.36,1) | "dit is klikbaar" | geen | geen |
| Lijnlink | aanwijzen | 450ms | (.22,1,.36,1) | link-feedback | geen | geen |
| Komeet om de pil | laden | 2,4s / 4,5s, één keer | (.45,0,.2,1) | menu vinden | zelfde | uit |
| Menu-iconen | aanwijzen/focus | 800ms | (.22,1,.36,1) | feedback | n.v.t. | uit |
| Foto naar projectpagina | klik | 550ms | bestaand | doorlopen | zelfde | uit |

Alles in CSS (scroll-driven animations en `:has()`), geen nieuwe bibliotheek, geen JavaScript per frame.
Browsers zonder `animation-timeline` tonen de blokken gewoon.

## 10. Referenties

Geen nieuw extern onderzoek in deze ronde: de principes komen uit de referenties die al in het project
staan (`docs/` en de projectmap: Dan Hoye "fewer things per page", Grova, uncode, zero.university, navbar.gallery)
en uit wat architecten- en landschapsbureaus algemeen doen: bladnummers, maatlijnen, mono-annotatie, beeld in reeksen.
Er is niets van een ander bureau overgenomen.

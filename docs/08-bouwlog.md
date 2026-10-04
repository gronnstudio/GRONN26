# Bouwlog

Elke stap van de bouw, in volgorde, met wat er gebeurde en waarom. Nieuwste
fase onderaan.

---

## Fase 1 — het fundament (4 oktober 2026)

### 1.1 Uitgangssituatie

- `gronnstudio/GRONN26`: leeg, geen commits.
- `gronnstudio/GRONN` (V2C, conceptbuild met GSAP): aanwezig, niet gebruikt.
  Die repo was zelf al een herbouw; de brief vraagt een nieuwe start.
- `gronnstudio/gronn-studio` (de live site, V5): read-only gekloond
  (`--depth 1`, commit `3bf250b`) als bron voor merk, inhoud en beelden.

### 1.2 Inventarisatie van gronn-studio

Alleen gekeken naar wat de brief noemt: tokens, typografie, logo's, echte
inhoud, beelden, data en de genoemde utilities. Bevindingen:

- `globals.css` is 2.412 regels; het merkdeel (kleuren Editie 01, de twee
  thema's, de typeschaal) is klein en goed te isoleren.
- Fonts: Syne staat alleen als **SemiBold**; Geist Mono kwam via Google
  Fonts bij de build.
- Logo's: `woordmerk-*.svg` met een bijgesneden viewBox van 784 × 167.
- Inhoud: de vijverrenovatie (`vijverrenovatie.ts`, 456 regels, woordelijke
  overdracht van Nick) en het terras (`terras-geulle.ts`).
- Foto's: 17 van de vijver plus 2 videoposters, 4 van het terras, allemaal
  al zonder metadata.
- Thema: `next-themes` met een pre-paint-script dat de opslag van
  next-themes vooraf vult; Auto volgt de klok (07–19).
- Contrastcheck: een Node-script dat de echte tokenblokken leest.
- Metadatacheck: een Playwright-test die op de vijverpagina naar APP1-markers
  zoekt.
- Fotostrook: `FotoMarkee`, pure CSS.

Het resultaat staat als Keep / Rewrite / Leave behind in
[`02-architectuur.md`](02-architectuur.md).

### 1.3 Repo-opzet

- Next.js **16.3.8**, React **19.3.0**, Tailwind CSS **4.3.3**,
  TypeScript **5.9.3**, ESLint 9 met `eslint-config-next` 16.3.8,
  Playwright 1.62 met axe-core.
- Handmatig opgezet (geen `create-next-app`), mappen in de root.
- Gekopieerd: fonts, logo's, alle projectfoto's (geen video's), favicon.
- Geist Mono: tijdelijk het npm-pakket `geist` geïnstalleerd, de
  variabele woff2 naar `styles/fonts/` gekopieerd, het pakket weer
  verwijderd.

### 1.4 Designsysteem

`styles/globals.css`: merkkleuren, `.licht`/`.donker`, de typeschaal,
utilities `tekst-*`, `raster`, `regel`, `dock-glas`, en de vier
bewegingen. Details in [`03-designsysteem.md`](03-designsysteem.md).

### 1.5 Weergave

`lib/weergave.ts` (sleutels, klokgrenzen, `pasToe`, `PREPAINT`) en
`AppearanceMenu` (native popover, `useSyncExternalStore`).

### 1.6 Kop en menu

`SiteHeader` en `BottomNavigation`, plus een eenvoudige `SiteFooter` uit
`business.ts`.

### 1.7 Homepage en routes

`HomeHero` (F10, de waterval), de positioneringszin, `ProjectTeaser` voor
GR / 001. Stubpagina's voor `/vijvers`, `/tuinen`, `/over` en
`/kennismaken`; een eenvoudige `/werk` en `/werk/[slug]`, zodat elke link
in het menu en op home ergens heen gaat.

### 1.8 Eerste controle en correcties

Screenshots op 320, 375 en 1440px, licht en donker, met minder beweging
(om eindtoestanden te zien).

| Gevonden | Oorzaak | Oplossing |
| --- | --- | --- |
| Op 320 en 375px schoof het logo onder Kennismaken | de kop gebruikte het raster met 24px goot en `col-span-2` | de kop is een flexrij met 16px marge onder 400px; logo 84px; Kennismaken 11px |
| "Alleen echt werk." als titel van `/werk` | een interne regel uit gronn-studio, geen tekst van Nick | vervangen door label "Index" en titel "Werk" |

### 1.9 Checks

- `npm run build`: alle routes statisch. ✓
- `npm run lint`: schoon. ✓
- `npm run contrast`: alles AA (licht, donker, merkparen). ✓
- `npm run photos`: 23 foto's zonder metadata, binnen 800 kB. ✓
- Playwright: 15 geslaagd, 1 bewust overgeslagen. ✓

Twee hobbels onderweg:

- Playwright 1.62 zocht een browserversie die in de cloudomgeving niet
  geïnstalleerd is. Opgelost met `launchOptions.executablePath` uit de
  omgevingsvariabele `PW_CHROMIUM`, zonder iets te downloaden.
- Screenshots zonder opmaak: een oude `next start` draaide nog terwijl
  Playwright opnieuw bouwde. Na het stoppen van die server klopte alles.

### 1.10 Commits

```
5184bce feat: establish editorial design system
2abeb85 feat: add header, appearance panel and responsive bottom navigation
0f23a74 feat: homepage hero, first project teaser and route stubs
```

### 1.11 Vercel

Op verzoek van Nick het project `gronn26` aangemaakt in team GRØNN Studio
en gekoppeld aan de repo. De eerste build (commit `0f23a74`) was in 25
seconden klaar. **https://gronn26.vercel.app** gaf HTTP 200, zonder
login.

### 1.12 Afwijkingen van de brief

| Brief | Gedaan | Waarom |
| --- | --- | --- |
| Syne Bold | Syne SemiBold (600) | er is geen Bold-bestand; geen nep-vet |
| Vijver in Geleen | geen plaats | staat niet in de bron |
| 75 mm leiding | 50 mm (fase 2) | de bron zegt 50 mm |
| "Twee vijvers. Eén levend systeem." | "… Eén samenhangend watersysteem." | de titel van Nick |
| "Bekijk ons werk" | "Bekijk het werk" | de site spreekt als Nick, in de ik-vorm |
| Pijl ook op mobiel (impliciet) | geen pijl onder 640px | de pil heeft daar de hele breedte nodig |
| Weergave met leesopties | alleen Kleur en Beweging | tekstgrootte is de zoom van de browser; meer opties = een groter paneel |

### 1.13 Documentatie

De map `docs/` met de brief, het plan, architectuur, designsysteem,
componenten, inhoud, kwaliteit, werkwijze, deze log en de roadmap, plus
`CLAUDE.md` in de root voor toekomstige sessies.

---

## Fase 1b — de redactionele laag (4 oktober 2026)

Nick na de eerste preview: *"Het ziet nog niet prijswinnend uit zoals de
voorbeelden?"*

### Wat de voorbeelden echt doen

Schermafdrukken gemaakt van Phlypo, Piet Oudolf, Stefan Morael, Studio
Verde, Con-Tour en Garden Eight (Bart Kolenda was vanuit de bouwomgeving
niet bereikbaar).

| Voorbeeld | Wat het prijswinnend maakt |
| --- | --- |
| Phlypo | Géén tekst over de foto. Een spread: links een foto op volle hoogte, rechts papier met het merk en een tweede, kleinere foto. Beelden asymmetrisch, met veel lucht. |
| Oudolf | Typografie als beeld: grote namen, piepkleine codes. Bijna geen interface. |
| Morael | Eén schone foto, het merk in het midden, verder niets. |

Onze eerste opening deed precies het template-gebaar: een drukke
telefoonfoto met een verloop en een grote kop erover.

### Wat er veranderde

- **De opening is een spread** (`HomeHero`): links F10 (de waterval) op
  volle hoogte, zonder tekst erover, alleen een bijschrift in mono. Rechts
  op papier een **plaat** (F09-1, een hand die een plantmand vult), het
  label, de kop en één link. Water en techniek naast een plantende hand:
  natuur × techniek. Op de telefoon staat de foto boven (56svh) en de tekst
  eronder, nooit erover.
- **Een reuzenmaat** (`tekst-reus`, 40–168px) voor één uitspraak:
  de merkbelofte "Een tuin die met je meegroeit." (`EditorialStatement`),
  met de positioneringszin verschoven eronder.
- **Projecten als spreads met elk een eigen ritme** (`ProjectSpread`):
  - vijver, *breed*: titel over de volle breedte, een groot vierkant beeld,
    ernaast een plaat met een detail (F04-2, "50 mm druk-pvc, twee
    kogelkranen");
  - terras, *staand*: één smal staand beeld (T02, het pad met zijn
    lijnen) en de feiten in mono-rijen (24 m², 60 × 60 × 4 cm, circa 8 uur,
    2 dagen).
- **Over** (`AboutFragment`): het portret als plaat en Nicks eigen zin
  "Ik denk in beelden, patronen en verbanden."
- **Een einde** (`ClosingInvite`): "Kennismaken" in de reuzenmaat, met
  e-mail, telefoon en "Stein en omgeving" in mono.
- **Platen met snijtekens** (`plaat`): kleinere beelden krijgen fijne
  hoektekens, zoals in een veldboek. Alleen voor beelden die niet
  schermbreed staan.
- **Eén fototoon** (`foto-toon`): iets minder verzadigd, iets meer
  contrast, zodat de telefoonfoto's als één reeks lezen.
- Het portret is overgenomen: verkleind tot 1000 × 1333, 137 kB, zonder
  metadata (`public/nick/portret.jpg`).
- `ProjectTeaser` is vervangen door `ProjectSpread`; nieuw zijn ook
  `Plaat`, `EditorialStatement`, `AboutFragment` en `ClosingInvite`.

### Correcties onderweg

| Gevonden | Oplossing |
| --- | --- |
| Het bijschrift van de opening zat achter Kennismaken | desktop: rechtsboven op de foto; telefoon: linksonder |
| Op de telefoon viel de kop achter het menu | de foto op de telefoon van 68 naar 56svh |
| "Kennismaken" in de reuzenmaat was op 320px 358px breed | de reuzenmaat begint bij 40px; de pijl alleen vanaf `md` |
| F01 liet in een brede uitsnede de container links zien | vierkante uitsnede vanaf `md` (focus 82 %) |

### Eerlijk over de foto's

De grootste afstand tot Phlypo zit niet in de code maar in het beeld:
Phlypo gebruikt architectuurfotografie, wij telefoonfoto's met een
groothoeklens. De opmaak vangt dat op (details als platen, strakke
uitsneden, één toon), maar het echte verschil maakt **een fotosessie**:
een fotograaf, laag licht, na de aanplant in het voorjaar van 2027.

### Checks

Lint, contrast, foto's (24, incl. het portret) en Playwright: 15 geslaagd,
1 bewust overgeslagen.

# GRØNN Studio — project instructions

Marketing site for GRØNN Studio (ecological garden/landscape design, NL).
Live at **https://gronn.studio**. Owner: Nick (gronnstudio on GitHub,
hello@gronn.studio). Sister project: Equilibrium (sidebrand knowledge hub,
`gronnstudio/equilibrium`, live at equilibrium-pink.vercel.app).

## V2 · V2C · V3 — welke build is welke

Afgesproken met de eigenaar, 21 september 2026, omdat er inmiddels drie
dingen naast elkaar staan en "de nieuwe site" niets meer betekent.

- **V2** — deze repo zoals hij wás: het menuwiel op de telefoon, Engelse
  routes met een taalprefix. Bestaat alleen nog in de geschiedenis.
- **V2C** — `gronnstudio/gronn`, de conceptbuild. Nederlandse routes,
  twee thema's, GSAP. **Blijft staan als de plek om dingen uit te
  proberen**; wat daar bewezen is verhuist hierheen.
- **V3** — deze repo mét de telefoonnavigatie uit V2C. **Definitieve
  dingen landen hier**, niet in V2C.

## V5 — de publieke site van scratch (23 sep 2026)

Nick: "Ik wil dat je enkel fonts aanhoudt, kleuren, de schakelaars voor
de hours, de rest ga je helemaal van scratch." Daarom:

- **Gebleven:** Syne / Montserrat / Geist Mono, de kleurtokens in
  `globals.css`, en de Uren-schakelaar (`default-theme-toggle.tsx`,
  Auto → Gouden Uur → Blauwe Uur). Portaal, dashboard, editor, API en
  de juridische teksten zijn niet aangeraakt.
- **Nieuw:** alles in `src/components/gronn/`. De bouwstenen staan in
  `elementen/` — één component per element (Sectie, Knop, Beeld,
  CijferRij, Stapel, Tabel, LinkShowcase, Kruimelpad, …), met een barrel
  `index.ts` en een catalogus in `elementen/README.md`. De pagina's
  (home, diensten, projecten, project, over, contact) en `voet.tsx`
  stellen alleen samen; een nieuw onderdeel wordt eerst een element.
- **De menu's zijn de bestaande** (Nick: "Use the menus from desktop and
  mobile on the new build!"): Header (desktop/tablet), DockNav en TopBar
  (telefoon), gemount in `src/app/[locale]/layout.tsx` met
  `VIJVER_ALS_PROJECT` als uitgelicht project. Zie "De
  telefoonnavigatie" hieronder. Terug naar boven: op de telefoon het
  Omhoog-vak in de dock, vanaf `md` het element `NaarBovenKnop`
  rechtsonder (eigenaar, 27 sep 2026; de oude `BackToTop` hing aan
  `SiteShell`, die V5 niet mount). Uit Nicks CodePen van 2022 (28 sep
  2026): een voortgangsring om die knop (`g-ring`), de `Leesdraad` op
  elke pagina en één keer per browser de `ZoekTip` (⌘K / Ctrl K). Alle
  drie pure CSS of een paar regels React, geen GSAP.
- **De linkpagina** (eigenaar, 27 sep 2026: "een soort bentobox
  linktree"): `src/app/links` BUITEN `[locale]`, dus zonder menu, dock
  en voet; alleen Nederlands, noindex, niet in de sitemap. Samengesteld in
  `src/components/gronn/links.tsx` uit `BentoRaster`/`BentoTegel`; alle
  links absoluut naar gronn.studio. Op **links.gronn.studio** via de
  host-regel bovenaan `src/proxy.ts` (`LINKS_HOST` in `src/lib/locale.ts`):
  `/` wordt `/links`, elk ander pagina-pad een 308 naar het hoofddomein.
  DNS: CNAME `links` in Cloudflare (OPERATIONS.md §4).
- **Geen Lenis op de publieke site:** `SmoothScroll` wordt in V5 niet
  gemount. Scrollen is native, de CSS scroll-timelines lopen daarop, en
  terug-naar-boven in de dock valt terug op `window.scrollTo`.
- **Richting:** Dan Hoye — in één scherm voor wie, waarvoor bekend en
  waarom anders; de persoon en echt werk verkopen. Qi-achtige elementen
  zelf gebouwd in CSS: interactive link showcase (diensten), stacked
  cards (werkwijze), parallax (portret), reveals.
- **Merk: de GRØNN Brand Guide 2026 (Editie 01)**, aangeleverd 23 sep
  2026 — die gaat vóór alles wat hierover eerder in dit bestand stond.
  - Kleur: aarde-oranje #DB6923 (`--gronn-ember`), gebroken wit #EFEEEA,
    antraciet #202020; botanisch bosgroen #23483A (`--gronn-forest` én
    `--gronn-green`), mosgroen #607A59, salie #B8C5A8 (`--gronn-light`).
    60 % licht / 30 % donker / 10 % accent. Gouden Uur = de lichte kant
    (gebroken wit/antraciet), Blauwe Uur = de donkere (antraciet/wit).
  - Oranje als vlak draagt ANTRACIET (4,70:1), nooit wit. Oranje als
    tekst op licht is donker oranje #A14312 (`--gronn-ember-strong`,
    `--ember-text`); #DB6923 op #EFEEEA (2,99:1) is nooit een
    tekstpaar. `check-contrast.mjs` meet de vijf paren van de gids.
  - Type: `tekst-display`, `tekst-h1`…`h3`, `tekst-body`, `tekst-knop`,
    `tekst-annotatie` in `globals.css` — de schaal van p. 7, in px. Sinds
    28 sep 2026 vloeiend (eigenaar: "fluid font (clamp)", "eerst een
    aantal variabelen"): de variabelen `--tekst-*` en `--tekst-*-regel`
    in `:root` lopen met `clamp()` van de telefoonmaat bij 390px naar de
    desktopmaat bij 1280px; min en max in px. Chroom blijft vast.
  - Vorm: raster max 1280px, marge 24/64px (`BREEDTE`); knoppen helemaal
    rond (`rounded-full`; de gids zei 8px, eigenaar 23 sep 2026: "ik wil
    alles rond!"), 16px voor kaarten én foto's (de gids zegt "strakke
    beeldvlakken", maar de eigenaar wilde ze gelijk aan de kaarten, 23 sep
    2026). Eén oranje accent per compositie, geen gloed.
  - Logo: het bestaande woordmerk in één vlakke kleur.
    `public/brand/woordmerk-*.svg` zijn de lockup-vectoren met de
    viewBox bijgesneden tot het woordmerk (paden onaangeroerd);
    `logo-antraciet.svg` is `logo-black.svg` met de ene vulling op
    #202020. Nooit opnieuw tekenen. Uitzondering van de eigenaar (28 sep
    2026, "Sowieso op darkmode past deze goed"): op Donker en op donkere
    vlakken staat het primaire logo (`woordmerk-primair.svg`, wit met de
    oranje P van Peters in de R), en het openingsdoek in Donker tekent
    het zichzelf (`woordmerk-intro.svg`, zijn `stroke_logo_intro.svg`
    uit Drive, bijgesneden en sneller: 1,2 s lijnen, 0,5 s vulling).
    In de menubalk bovenaan staat het primaire logo ook op Licht (eigenaar,
    29 sep 2026: "use primary in the dock on top!"):
    `woordmerk-primair-antraciet.svg` is het primaire logo met de witte
    vullingen op #202020 en zonder de grijze verloopschaduw in de P, via
    `<Logo primair />`. Op de hero staat geen logo meer ("haal gronn
    primary logo van de hero af").
  De opening is sinds 2 okt 2026 rustig (eigenaar koos "Rustiger" na
  Dan Hoye's "fewer things per page"): label, kop, één zin, één knop
  (kennismaking) en het portret. Geen tweede knop, geen projectkaart,
  geen stempel; de werkwijze (zes stappen) staat op Studio (`#werkwijze`,
  in `STUDIO_EXTRAS`), niet meer op de voorpagina.
  Positionering sinds 3 okt 2026 (eigenaar koos "Vijvers en tuinen",
  beide even zwaar): "Ik maak en onderhoud vijvers en natuurlijke tuinen
  voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf."
  Die zin stuurt de opening (label, kop, zin), `MERKBASIS` (ook
  sitebeschrijving en JSON-LD), de titel van de voorpagina en de
  doelgroepzin op Diensten. `MERKBELOFTE` blijft merk, geen positionering.
  Bron: `/mnt/project-files/website/positionering/positionering.md`.
  - Sfeerbeelden (`public/sfeer/`, uit de gids) zijn geen bewijs van
    werk: ze dragen het label Sfeerbeeld en staan nooit bij een project.
  - De driehoekenband van de factuur is weg (gids: "vlakke kleuren,
    rust als herkenning").
- **Alleen echt werk:** `/projects` toont de vijverrenovatie en (sinds 24
  sep 2026) het terras in Geulle (`src/lib/data/terras-geulle.ts`,
  `project-terras.tsx`: de korte projectpagina); de
  plaatshouderprojecten hebben geen pagina meer. Journaal, werkwijze
  en lab zijn weg, met tijdelijke redirects in `next.config.ts`.
  `/stack` is sinds 24 sep 2026 terug als "Techniek" (eigenaar: "a tech
  stack page similar to the old one, but more intuitive and
  interactive"): `src/components/gronn/stack.tsx` + element
  `StackKiezer`, inhoud en bronnen in `src/lib/data/stack.ts`. Alleen
  gereedschap dat echt gebruikt wordt; nieuw gereedschap komt van Nick.
  Sinds 29 sep 2026 ook "Gekoppeld aan Claude" (alleen koppelingen die
  in Nicks claude.ai-account verbonden zijn) en "In de gaten houden".
  Nooit op de site zeggen dat Claude de site bouwt (eigenaar, 29 sep
  2026: "zeg niet dat we claude hebben gebruikt om website te bouwen").
  `/calendar` (Tuinkalender, 28 sep 2026) is de pagina achter de
  rechterbubbel `HemelBubbel` (kalender, zon en maan zijn elk een link;
  onder `xl` de hemelregel in de voet): `tuinkalender.tsx` uit
  `HemelVandaag`, `JaarKalender` en `ZonJaarTabel`. Alleen de twaalf
  regels uit `SEIZOEN` en wat `src/lib/hemel.ts` uitrekent voor Stein;
  niet in de menu's, wel onder Studio in kruimelpad, dock en sitemap.
  De kennisbank (`/kennisbank`, 3 okt 2026) is weg (eigenaar, 4 okt
  2026: "haal kennisbank weg"): geen pagina's, geen menu-item, niet in
  voet, ⌘K of sitemap. Oude links leiden tijdelijk naar /faq;
  `geen-kennisbank.spec.ts` bewaakt het. De artikelen staan nog in de
  geschiedenis (`src/lib/data/kennis.ts`, `kennis-blogs.ts`).
  De 404 (`src/app/not-found.tsx`, eigenaar 30 sep 2026: "maak een
  leuke custom 404 pagina!", daarna "maak hier een microspelletje?
  simulatie, voedselbossen, maak het onbeperkt speelbaar en gebruik local
  storage"): "Hier groeit nog niets." naast het element `Voedselbos`, een
  perceel van 6 × 6 waarin je een voedselbos plant en oogst, zonder einde.
  Regels in `src/lib/voedselbos.ts`, stand in localStorage
  (`gronn-voedselbos`). Status blijft 404; `niet-gevonden.spec.ts` bewaakt
  het.
  Easter eggs zijn er niet meer (eigenaar, 1 okt 2026: "Verwijder de
  easter eggs! Er reageert geen hond op de post"): geen eieren, geen
  verzamelkaart, geen Instagram-actie, geen `/api/eieren`. `/easter-eggs`
  leidt tijdelijk naar de voorpagina; `geen-easter-eggs.spec.ts` bewaakt
  het. De alinea in de privacyverklaring blijft staan zolang de anonieme
  dossiers onder `eieren/` in Vercel Blob nog bestaan.
- Foto's van de vijverrenovatie: aangeleverd 24 sep 2026 (Drive, map
  "2vijvers1systeen"), met toestemming van de klant. Webversies in
  `public/projecten/vijverrenovatie/`, verkleind en ZONDER metadata (geen
  GPS) — `vijver-beeld.spec.ts` bewaakt dat. `FOTOS` en `VIDEOS` in
  `src/lib/data/vijverrenovatie.ts`; een AI-visualisatie draagt altijd
  `label` en gaat nooit door voor een foto. F06 (skimmer) is nog leeg.
  De beekloopclip (IMG_4552, "V02") hoorde bij een ander project en is
  weggehaald (eigenaar, 24 sep 2026): alleen beeld van dít project.
  IMG_7400 (vijver met waterlelies) is een AI-visualisatie, geen foto:
  staat als F03-3 bij het denkwerk, met label. Twijfel over een beeld =
  eerst de eigenaar vragen. Aanvulling uit Drive "Claude/content" (24 sep
  2026, akkoord eigenaar): F08-2, F11 en de clip V02. Nooit
  minderjarigen in beeld; de toestemming van de klant gaat over het
  project, niet over een kind.
  Portret: `public/nick/`.

## Archief achter login (5 okt 2026)

De nieuwe site wordt gebouwd in `gronnstudio/GRONN26` (gronn26.vercel.app).
Bij de overstap gaat gronn.studio naar die nieuwe site en blijft deze site
bestaan als archief, alleen voor de eigenaar (eigenaar, 5 okt 2026: "zet de
live site op archief achter een SSO login, die al ingebouwd is"; overstap pas
als hij het zegt). De schakelaar: Vercel-omgevingsvariabele
`ARCHIEF_ACHTER_LOGIN=1` → `src/proxy.ts` stuurt elke openbare pagina naar
`/editor` (Google-login, alleen `EDITOR_ALLOWED_EMAIL`), tenzij de eigenaar
al is ingelogd. Zonder de variabele verandert er niets. Buiten de matcher
(API, /editor, /dashboard, /os, /links, /handtekening, /offline, /clients)
geldt de schakelaar niet; die hebben hun eigen regels.

## De telefoonnavigatie

Eén dock onderaan en twee knoppen bovenin, allebei alleen onder `md`.

- `src/components/layout/dock-nav.tsx` — vijf vaste vakken: Home,
  Diensten, Projecten, Studio, Contact. Tijdens het lezen wordt het één
  pil — hetzelfde glas, dezelfde maat (58 hoog) en dezelfde komeet als de
  volle balk — met vijf knoppen van 44 × 44: Home, Zoeken, WhatsApp,
  Delen, terug naar boven, elk op het midden van het vak erboven
  (eigenaar, 25 sep 2026: "De comet wil ik ook op de bovenste dock, en
  de vijf iconen in ingeklapte modus maak dat ook maar een dock met een
  comet, dan is het gewoon overal hetzelfde."). Dit verving de losse
  cirkels van 58 × 58 van 23 sep. De bovenbalk blijft tijdens het lezen
  staan ("hetzelfde effect als de onderste balk") en draagt dezelfde
  komeet. De komeet heeft één bron: `Komeet` in
  `src/components/layout/komeet.tsx` (klasse `orbit-ring` in
  `globals.css`, stil bij minder beweging). `behaviors.spec.ts` en
  `dock.spec.ts` meten dat op 320–430px.
- Elk icoon draagt een klein label eronder, in beide standen (eigenaar,
  25 sep 2026: "Wellicht een minimaal klein label onder het icoon om aan
  te geven wat het doet? Kunnen we dat op een mooie subtiele manier
  doen?"): `DockLabel`. Sinds 1 okt 2026 in de stijl van de ING-app
  (eigenaar: "Dock from ING banking app. Make it more similar to this,
  use montserrat font and use the colors similarly, instead of darkgreen
  now, keep the comet"): Montserrat 10–12px (`clamp`, 10px op 320px),
  regel 13px, gewicht 500, gewone hoofd- en kleine letters, kleur
  `--dock-label` (4,5:1 in `dock-contrast.spec.ts`). De dock is een
  dichte pil (`--dock-grond`: wit op Licht, #2e2e2e op Donker) met
  `--shadow-dock`; het actieve vak draagt een zachte grijze pil
  (`--dock-actief`) in plaats van het bosgroen, het icoon erin is het
  ene oranje (`--ember-text`). De komeet blijft. Het label ÍS de
  toegankelijke naam: geen `aria-label` op de knoppen. De balk blijft 58
  hoog; de knoppen van de leesstand zijn 44 hoog en kolombreed.
- `src/components/layout/hoek-paneel.tsx` — Weergave en Kleur, samen
  rechtsboven (het logo bezet linksboven). Kleur draagt alleen de
  Uren-schakelaar; verdwijnt daar iets, dan verdwijnen de voorkeuren op
  de telefoon helemaal.
- `DOCK_ORDER` en `activeSection()` in `src/lib/nav.ts`, afgeleid van
  `SECTIONS` en niet ernaast. Journaal en de werkwijzepagina bestaan sinds V5
  niet meer; Studio heeft drie ankers (`STUDIO_EXTRAS`: uitgangspunten, werkwijze,
  manifest) en de pagina `/stack` (Techniek), die Studio laat oplichten.

Vier dingen die stukgaan als je ze achteloos aanraakt:

1. **Alle maten in px, geen enkele in rem.** `h-11`, `size-5`, `p-1.5`
   en `px-3` zijn rem: bij 125 % tekst werd elk vak 55 hoog in plaats van
   44 en liep de balk buiten zijn eigen rekensom. Tekst groeit, chroom
   niet.
2. **Het glas is gemeten, niet gekozen** (sinds 1 okt 2026 geldt dit
   alleen nog voor de bovenbalk en de header; de dock is dicht, zie boven). De leesbaarheid komt uit
   `--nav-glass-brightness` in de backdrop-filter van `@utility
   nav-glass`: 2,1 op licht (was 1,45; met de opening van 23 sep zakte het
   Projecten-icoon naar 2,7:1), 0,34 op Blauwe Uur (was 0,45; boven het
   V5-portret haalde het Studio-icoon toen 2,92:1). De tint staat op
   55 % (was 40; 25 sep 2026 haalde de leesstand-pil boven het groen
   2,92:1 en hielp meer helderheid niet). Dat getal komt uit
   `tests/e2e/dock-contrast.spec.ts`, die een schermafdruk boven de
   zwaarste foto decodeert en 3:1 eist. Zakt er iets onder, dan gaat de
   verdonkering of de tint omhoog — niet de drempel omlaag.
3. **De emberpijl draait op `--ember-text`**, niet op ember of
   ember-strong. Gemeten over twee paletten en twee ondergronden:
   ember-strong zakt naar 1,90 op donker glas, pure ember naar 2,96 op
   licht papier. `--ember-text` haalt alle vier de gevallen.
4. **De knoppen van de leesstand wekken de balk alleen bij TOETSENBORDfocus**
   (`wekBijToetsenbord`). Een tik focust de knop ook; wekken ruilt dan de
   laag tussen mousedown en click, de click landt op niets, en het
   zoekvergrootglas opende op de telefoon nooit.

## Werkwijze voor Claude

- **Werk parallel met agents zolang het gebruik onder 50 % is** (eigenaar,
  23 sep 2026: "spawn agents, if usage is under 50%"). Splits losse taken
  over subagents, elk in een eigen worktree zodat ze elkaar niet in de weg
  zitten; houd zelf CI, merges en de gesprekken met de eigenaar. Boven
  50 % gebruik: weer één spoor tegelijk.
- Een agent pusht niet zelf; zijn commit komt via een eigen PR of wordt
  na controle overgenomen.

## Next.js warning

This repo uses Next.js 16 — newer than most training data. When unsure
about an API or convention, read the bundled docs in
`node_modules/next/dist/docs/` before writing code.

## Deploy & verify

- **Push to `main` = production deploy** (Vercel Git integration, team
  "gronn"). Branch pushes create preview deployments (behind Vercel SSO).
- Verify on **https://gronn.studio**, not localhost — the owner reviews
  production/preview URLs, often on a phone.
- Manual fallback: `npx vercel deploy --prod --yes`. Instant rollback:
  `npx vercel rollback`.
- `npm run build` must pass before any push.

## Design rules (learned from owner feedback — follow strictly)

0. **Gouden regel: functioneel en eenvoudig** (eigenaar, 4 okt 2026:
   "Aangezien ik graag overcompliceer en over engineer, moet je dat als
   gouden regel vastleggen, dat het functioneel blijft zonder dingen te
   complex te maken"). Kies steeds de eenvoudigste versie die werkt. Een
   nieuwe pagina, element, animatie, instelling of afhankelijkheid moet
   een bezoeker helpen begrijpen wat Nick doet of contact opnemen; anders
   niet bouwen. Vraagt de eigenaar iets dat het complexer maakt, bouw dan
   de gewone versie en zeg in één zin wat je wegliet en waarom.
1. **End-user clarity over cleverness**: every control needs a visible
   label a first-time visitor understands (e.g. the theme switch is one
   labeled cycle button, never unlabeled dots).
2. **Small and precise beats big and decorative**: oversized outlined
   marquees and clipart-style illustration were rejected as "cheap". The
   working visual language is fine line-work, mono-font field annotations,
   survey marks, restrained motion.
3. **Aarde-oranje (`--gronn-ember`, #DB6923) is the one action and
   recognition colour; green is for deep sections and secondary UI**
   (Brand Guide 2026). An orange *fill* carries antraciet text; orange
   *text* on the light ground is #A14312; white text on an orange-ish
   fill (dashboard/portal) uses `--gronn-ember-strong` #A14312. The
   token names are historical — "ember" now means aarde-oranje.
4. Every animation needs a `prefers-reduced-motion` fallback (see
   `src/lib/use-reduced-motion.ts` and existing components).
5. Mobile is a first-class experience — scroll-driven pieces (horizontal
   gallery, stacking cards, 3D terrain) run on phones in lighter tiers,
   never hidden.

## Architecture notes

- **Theming**: two palettes, Golden Hour and Blue Hour
  (`src/lib/themes.ts` is the catalog). Visitors read them as **Licht / Donker**
  (Light / Dark; owner, 24 Sep 2026); the internal names `goldenhour` /
  `bluehour` stay, because they are the CSS classes and the stored
  localStorage value — renaming them would wipe returning visitors' choice. The eight concept palettes were
  retired on 23 Sep 2026 (owner: "only golden en blue stay"); a visitor
  with one stored is moved back to Auto by the pre-paint script.
  - **The Hours** — Golden Hour (day) and Blue Hour (night). These
    follow the *visitor's own clock*: `resolveAutoTheme()` splits at
    `DAY_START_HOUR` 07:00 / `NIGHT_START_HOUR` 19:00. Local clock, not
    sunrise tables — real sunrise needs latitude, and a location prompt
    to pick a colour is a wildly disproportionate trade.
  - The default control is ONE button cycling **Auto → Golden Hour →
    Blue Hour**, showing `AUTO · GOLDEN HOUR` so both the fact that the
    site is deciding and what it decided are visible. Picking either
    palette writes `gronn-theme-mode=manual` and
    the clock stops driving — permanently, until Auto is chosen again.
  - Two things that WILL break if touched carelessly: the pre-paint
    script in `layout.tsx` seeds next-themes' storage from the clock
    before its script runs (it must stay ahead of `<Providers>`, or auto
    visitors get a flash of the wrong ground), and `ThemeModeProvider`'s
    sync effect gates on a **live `localStorage` read, not the
    render-time `mode`** — during hydration `mode` is still the server
    snapshot `"auto"`, and trusting it overwrites a returning visitor's
    saved override.
  - ALL colors flow through semantic
  tokens in `src/app/globals.css`
  (background/surface/foreground/muted/line/accent + scene vars for the
  3D field). Never hardcode theme-dependent colors. Adding a palette
  means three edits: the token block in `globals.css`, the
  `@custom-variant dark` list at the top of that file (dark themes only
  — miss it and every `dark:` utility silently does nothing), and the
  entry in `src/lib/themes.ts`. `providers.tsx` derives its theme list
  from the catalog, so it can't fall out of step.
- **Palette design rules** (from dark/light-mode research, 30 Jul 2026):
  never a pure-black ground — Material's floor is #121212, because black
  under bright content pushes contrast to eye-strain levels and smears
  for readers with astigmatism (`.dark`/Night predates this and is kept
  deliberately). In dark mode elevation is expressed as *light*: the
  `surface` token is LIGHTER than `background`, never a shadow. Accents
  are desaturated on dark grounds, since a saturated colour that works
  on white visually vibrates against dark. Light grounds stay HIGH VALUE
  and LOW CHROMA — a mid-value tinted ground reads muddy however good
  its contrast numbers are, which is why the rejected "Marl" failed.
- **Contrast**: `node scripts/check-contrast.mjs` audits every palette
  against WCAG AA and exits non-zero on failure — run it after touching
  any color. It parses the real token blocks, so it can't drift from
  what ships. Note Lighthouse only measures the *resting* state; a
  `:hover` or `:active` color it never sees can still fail, which is how
  white-on-Signal-Ember sat at 2.99:1 under a score of 100.
- **i18n**: client-side EN/NL. Every user-facing string is `{ en, nl }`
  (`src/lib/i18n.ts`), resolved with `useT()` from
  `src/components/language-provider.tsx`. Pages split into server
  `page.tsx` (metadata) + client `*-content.tsx`.
- **Content is typed data**, no CMS: `src/lib/data/{projects,journal,services}.ts`.
  Current entries are PLACEHOLDER fiction awaiting the owner's real
  projects. Images are self-hosted in `public/ph` (see
  `src/lib/placeholder.ts`) — replace with real photography when provided.
- **Photo treatment**: every photograph carries the `photo-glass` screen
  (one `@utility` in `globals.css`, applied as a single `absolute inset-0`
  layer). It is glass, not frost — deliberately NO `backdrop-filter`,
  because `RevealImage` animates `filter: blur()` on an ancestor (which
  would stop it sampling), `<Tilt>` gives project cards a 3D-transformed
  ancestor (backdrop flicker), and blur over a photo is the pathological
  compositing case on the very pages furthest from their perf targets. It
  is also the ONE acknowledged exception to "never hardcode
  theme-dependent colour": a photo filter is not chrome, and the labels
  over it are theme-invariant brand constants. It replaced a green
  multiply/soft-light film that had been hand-copied into six files and
  drifted. Never re-inline a per-site wash — change the utility.
- **DEV-laag**: alleen eigenaar-sessie; flags via useFlag; nooit voor
  bezoekers. Gezag uit `getOwnerSession()` via `/api/dev/sessie`, nooit
  uit localStorage/query/cookie-waarde. Zie `docs/dev-laag.md`.
- **Business identity** (address, KVK, BTW, phone, email) lives ONLY in
  `src/lib/business.ts`; footer, legal pages and JSON-LD read from it.
- **Contact form** (`src/components/contact/intake-form.tsx`) submits
  DIRECTLY from the browser to FormSubmit's AJAX endpoint — do NOT move
  this server-side: FormSubmit 403-blocks datacenter IPs (a Vercel relay
  was tried and removed 19 Jul 2026). Honeypot + validation are client
  side; mailto fallback on failure. Activation status lives in
  OPERATIONS.md §1. If the transport ever changes, update `/privacy`.
- **Brand assets** in `public/` were cropped from the owner's brand drive
  (`J:\Mijn Drive\1_Business\_branding\` — local machine only, not
  available in cloud). Don't regenerate or trace logos; ask the owner.
- **References** live in ONE place: `docs/referenties.md` (owner, 23
  Sep 2026: "een lijstje met websites centraal opgeslagen"). Add every
  new reference there with date and reason. Start a nav round at
  **https://www.navbar.gallery/** before proposing a shape.
- **The old site is a concept until 31 Dec 2026** — branch
  `concept/oude-site-v3` (with its own Vercel preview) and the list of
  unreachable files in `docs/concept-archief.md`. Reuse by copying from
  there; never merge that branch. After 31 Dec it is removed, with the
  owner's go-ahead.
- Known SVG/framer gotcha: framer-motion caches SVG `style` fills — put
  changing SVG colors in CSS classes, not the `style` prop (see
  `living-system.tsx`).
- `design/editorial` branch holds a rejected full-redesign experiment;
  don't merge it.

## Gotchas

- framer-motion `whileInView` on elements that start fully clipped by an
  `overflow-hidden` mask never fires — observe an unclipped parent and
  drive children via variants (see `reveal-text.tsx`).
- No CSS `scroll-behavior: smooth` — where Lenis is mounted it owns
  scrolling (the public V5 site does not mount it; see V5 above).
- The legal terms (`/voorwaarden`) are a draft pending professional review.

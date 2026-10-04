# Architectuur en besluiten

Deze repo is een nieuwe start, geen opgeschoonde kopie. Uit `gronn-studio`
is alleen gekopieerd wat hieronder onder *Keep* staat; de componentarchitectuur
van de oude site is bewust niet het vertrekpunt.

## Keep — overgenomen zoals het was

- **Kleuren uit de Brand Guide 2026**: bosgroen, mos, salie, gebroken wit,
  antraciet, aarde-oranje en donkeroranje, en de 60/30/10-verhouding.
  Oranje als vlak draagt antraciet; als tekst op licht is het donkeroranje.
- **Fonts**: Syne SemiBold en Montserrat (Nicks eigen, gesubsette bestanden)
  en Geist Mono. Alle drie lokaal; geen font wordt opgehaald.
- **De typeschaal van de gids** (`--tekst-display` … `--tekst-lees`), vloeiend
  met `clamp()` in px.
- **Het woordmerk** (`public/brand/`), ongewijzigd. Op de site als CSS-masker,
  zodat één bestand elke kleur aanneemt.
- **Echte inhoud**: de vijverrenovatie en het terras in Geulle, met de
  webfoto's zonder metadata; de positioneringszin, merkbasis en merkbelofte.
- **`business.ts`** als enige bron van bedrijfsgegevens (`data/business.ts`).
- **De contrastcheck** (`scripts/check-contrast.mjs`), ingekort tot de tokens
  van deze site, plus de paren van het menu.
- **De metadatacheck** voor foto's, nu als script over héél `public/` in
  plaats van een test op één pagina.

## Rewrite — opnieuw en kleiner gemaakt

- **Weergave**: de Uren-schakelaar en het pre-paint-script, herschreven zonder
  `next-themes`. Eén sleutel (`gronn-weergave`: auto/licht/donker), Auto volgt
  de klok (07–19 licht). Een tweede keuze: minder beweging. Het paneel is een
  native `popover`.
- **Het menu onderaan** (naar Bart Kolenda): Kennismaken links in oranje,
  vier woorden in bosgroen glas met een salie vulling die naar het actieve
  woord glijdt, rechts een ronde pijl (omlaag bovenaan, omhoog tijdens lezen).
  Op de telefoon is de pil schermbreed, staat Kennismaken in de kop en valt
  de pijl weg.
- **Beweging**: geen GSAP, geen Lenis, geen framer-motion. CSS-animaties op de
  scroll van de browser (`animation-timeline: view()`) en React's
  `<ViewTransition>` voor een rustige paginawissel. Alles staat stil bij
  `prefers-reduced-motion` of als de bezoeker "Minder" kiest.
- **Projectdata**: één klein `Project`-type in `data/projects.ts`, met een
  projectcode (`GR / 001`). URL's worden `/werk/<slug>`.
- **Nog te doen in fase 2/3**: de fotostrook (FotoMarkee), diensten en prijzen,
  Over, FAQ, juridische teksten, het FormSubmit-formulier, redirects, sitemap.

## Leave behind

Waaier/radiaal menu, de oude dock, bubbels, de 404-game, tuinkalender,
techniekpagina, ⌘K, easter eggs, portaal, dashboard, editor, DEV-laag,
NextAuth, Supabase, Vercel Blob, Engelse routes en het i18n-systeem,
de panelentinten en kleurschaal van Editie 02, kaarten, iconentegels,
het openingsdoek, de service worker en de PWA-meldingen.

## Besluiten

- **Mappen**: `app/ components/ data/ lib/ styles/` in de root, geen `src/` en
  geen atomic-design-lagen.
- **Contact** komt op een eigen route `/kennismaken` (niet in het hoofdmenu),
  zodat Kennismaken overal naar dezelfde plek wijst en `/contact` er straks
  naartoe kan verwijzen.
- **Chroom in px, tekst in clamp()**: het menu en de knoppen houden hun maat bij
  grotere tekst (les uit gronn-studio).
- **Syne staat alleen als SemiBold in de repo.** De gids noemt Syne Bold; we
  vragen gewicht 600 en laten de browser geen nep-vet maken. Een echt
  Syne-Bold-bestand kan er later bij.
- **Geen verzonnen feiten.** De vijver noemt geen plaats (Nick gaf er geen),
  het leidingwerk is 50 mm druk-pvc, de uren zijn "circa 120". Wat niet in
  de bron staat, staat niet op de site.

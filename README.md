# GRØNN Studio — gronn.studio (nieuwe build)

Een kleine, rustige site voor GRØNN Studio: vijvers en tuinen in Stein en
omgeving. Het werk en de foto's spelen de hoofdrol; de site zelf verdwijnt
bijna. Vijf pagina's (`/`, `/vijvers`, `/tuinen`, `/werk`, `/over`), één
knop (Kennismaken), geen extra's.

De productiesite (`gronnstudio/gronn-studio`) blijft live tot Nick deze
build op telefoon en desktop heeft goedgekeurd. Deze build staat op
`noindex` tot de domeinwissel.

## Aan de slag

```bash
npm install
npm run dev            # http://localhost:3000
```

## Controles

```bash
npm run build          # productiebouw (ook de TypeScript-check)
npm run lint
npm run contrast       # WCAG AA over de echte tokens in styles/globals.css
npm run photos         # geen EXIF/GPS in public/, en binnen het budget
npm run test:e2e       # Playwright: desktop + telefoon
```

In een omgeving met een vooraf geïnstalleerde Chromium:
`PW_CHROMIUM=/pad/naar/chromium npm run test:e2e`.

## Opbouw

```
app/          routes (App Router); layout.tsx = kop, menu, colofon, pre-paint
components/   één component per zichtbare verantwoordelijkheid
data/         getypte inhoud: projecten, bedrijfsgegevens, vaste teksten
lib/          weergave (kleur/beweging)
styles/       globals.css (tokens, typografie, raster, beweging) + fonts
public/       logo's en foto's (zonder metadata)
scripts/      contrast- en fotocheck
tests/        een kleine Playwright-suite
docs/         architectuurbesluiten
```

Zie `docs/ARCHITECTUUR.md` voor wat uit de oude site meekwam, wat opnieuw
is gemaakt en wat bewust achterbleef.

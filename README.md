# GRØNN Studio — gronn.studio (nieuwe build)

Een kleine, rustige site voor GRØNN Studio: vijvers en tuinen in Stein en
omgeving. Het werk en de foto's spelen de hoofdrol; de site zelf verdwijnt
bijna. Vijf pagina's (`/`, `/vijvers`, `/tuinen`, `/werk`, `/over`), één
knop (Kennismaken), geen extra's.

**Preview: https://gronn26.vercel.app** (Vercel-project `gronn26`).

De productiesite (`gronnstudio/gronn-studio`) blijft live tot Nick deze
build op telefoon en desktop heeft goedgekeurd. Deze build staat op
`noindex` tot de domeinwissel.

**Stand:** fase 1 (fundament) is af. Fase 2 (homepage, werk, de vijver als
casestudy) en fase 3 (diensten, over, contact, juridisch, redirects) staan
in [`docs/09-roadmap.md`](docs/09-roadmap.md).

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

## Documentatie

| Document | Inhoud |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | de korte versie: gouden regels en waar alles staat |
| [`docs/00-plan-nieuwe-repo.md`](docs/00-plan-nieuwe-repo.md) | Nicks oorspronkelijke plan, ongewijzigd |
| [`docs/01-brief.md`](docs/01-brief.md) | de ontwerp- en bouwbrief, per onderwerp |
| [`docs/02-architectuur.md`](docs/02-architectuur.md) | Keep / Rewrite / Leave behind, mappen, rendering, gegevensstroom, besluiten |
| [`docs/03-designsysteem.md`](docs/03-designsysteem.md) | kleur, contrast, typografie, raster, glas, beweging, focus, logo |
| [`docs/04-componenten.md`](docs/04-componenten.md) | elk component en elke route in detail |
| [`docs/05-inhoud.md`](docs/05-inhoud.md) | bronnen, geverifieerde feiten, foto-inventaris, inhoudsregels |
| [`docs/06-kwaliteit.md`](docs/06-kwaliteit.md) | toegankelijkheid, prestaties, privacy, SEO, checks en tests |
| [`docs/07-werkwijze.md`](docs/07-werkwijze.md) | lokaal werken, git, Vercel, de domeinwissel |
| [`docs/08-bouwlog.md`](docs/08-bouwlog.md) | elke stap van de bouw, met bevindingen en afwijkingen |
| [`docs/09-roadmap.md`](docs/09-roadmap.md) | fase 2 en 3, redirects, open vragen |

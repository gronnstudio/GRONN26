# Werkwijze: lokaal, git, Vercel en livegang

## 1. Lokaal

Vereist: Node 22 (getest met 22.22), npm 10.

```bash
git clone https://github.com/gronnstudio/GRONN26
cd GRONN26
npm install
npm run dev          # http://localhost:3000
```

Productie lokaal bekijken:

```bash
npm run build && npm start      # http://localhost:3000
```

Let op: draait er nog een oude `next start` terwijl je opnieuw bouwt, dan
verwijst die naar verdwenen CSS-bestanden en zie je een pagina zonder
opmaak. Stop de oude server eerst.

## 2. Voor elke push

```bash
npm run build
npm run check        # typecheck + lint + contrast + photos
npm run test:e2e     # bij wijzigingen aan menu, weergave, routes of kleur
```

Alles groen, dan pas pushen.

## 3. Git

- **Repo:** `gronnstudio/GRONN26` (publiek).
- **Werkbranch:** `claude/brave-einstein-no9sq8`. Dit is nu de enige branch
  en dus ook de standaardbranch van de repo.
- **`main` bestaat nog niet.** Zodra Nick hem wil, wordt `main` aangemaakt
  vanaf de werkbranch, wordt hij de standaardbranch en de productiebranch
  in Vercel, en gaat nieuw werk via pull requests.
- **Commitberichten** in de vorm `feat: …`, `fix: …`, `chore: …`,
  `docs: …`, één onderwerp per commit.
- **`gronn-studio` wordt nooit gewijzigd** vanuit dit werk. Het is de
  live site en blijft het archief.

## 4. Vercel

| | |
| --- | --- |
| Team | GRØNN Studio (`gronn`) |
| Project | `gronn26` (`prj_RnEcBcxu3Pp9vcyZJHI5g7Y9gyfT`), aangemaakt 4 okt 2026 |
| Gekoppeld aan | GitHub `gronnstudio/GRONN26` |
| Productiebranch | `claude/brave-einstein-no9sq8` (tot `main` bestaat) |
| Framework | Next.js, standaardinstellingen (geen `vercel.json`) |
| Regio | `iad1` (standaard) |
| **Link** | **https://gronn26.vercel.app** |
| Ook | `gronn26-gronn.vercel.app`, `gronn26-git-claude-brave-einstein-no9sq8-gronn.vercel.app` |

- Elke push naar de productiebranch zet https://gronn26.vercel.app bij.
  Elke andere branch krijgt een eigen previewlink.
- De link is openbaar (geen Vercel-login), maar staat op `noindex`.
- **Het productieproject `gronn-studio` en het domein gronn.studio zijn niet
  aangeraakt.**

Te overwegen bij livegang: de regio naar Europa (`fra1` of `cdg1`), omdat
de bezoekers in Limburg zitten. Voor een statische site maakt het weinig
uit (het CDN serveert overal), maar het is één instelling.

## 5. De domeinwissel (pas na akkoord van Nick)

Volgorde, en geen stap overslaan:

1. Fase 1–3 af, alle checks groen.
2. Nick bekijkt https://gronn26.vercel.app op zijn telefoon en op desktop,
   en leest alle teksten na.
3. Redirects van alle oude URL's staan in `next.config.ts` en zijn getest
   (zie `09-roadmap.md`).
4. `robots: noindex` eraf in `app/layout.tsx`; sitemap en `robots.ts` aan.
5. `main` aanmaken (als dat nog niet is gebeurd) en als productiebranch
   instellen.
6. In Vercel het domein `gronn.studio` (en `www`) van project `gronn-studio`
   **verwijderen** en aan `gronn26` **toevoegen**. DNS staat bij
   Cloudflare; de records hoeven niet te veranderen zolang ze naar Vercel
   wijzen.
7. Controleren: home, alle routes, redirects, formulier (FormSubmit
   activeren voor het nieuwe domein indien nodig), Open Graph.
8. `gronn-studio` blijft bestaan als archief. Subdomeinen die daar nog aan
   hangen (zoals `links.gronn.studio`) eerst inventariseren: ze verdwijnen
   als het domein verhuist en de host-regel niet mee komt.

Terugdraaien kan door het domein terug te zetten op `gronn-studio`.

## 6. Werken met Claude Code

- De sessie werkt op de werkbranch en pusht daarheen.
- Grote beslissingen staan in `docs/02-architectuur.md` (sectie
  Besluiten); elke fase in `docs/08-bouwlog.md`.
- Inhoud komt uit `gronn-studio` of van Nick; verzin nooit tekst of
  cijfers (`docs/05-inhoud.md`).

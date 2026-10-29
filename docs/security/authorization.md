# Inlog en rechten

## Nu

| Laag | Wat | Waar |
| --- | --- | --- |
| Inlog | Google, alleen `EDITOR_ALLOWED_EMAIL`; koekje met HMAC-SHA256 (`AUTH_SECRET`), 30 dagen | `src/lib/eigenaar.ts` |
| Eerste deur | `/dashboard/*` en `/offertes/*` zonder geldig koekje → naar de inlog; zonder Google-instellingen 404 | `src/proxy.ts` |
| Tweede deur | elke server-actie en API-route met klantgegevens: `eisEigenaar()` / `isEigenaar()` | `src/lib/crm/toegang.ts`, `src/app/api/crm/foto`, `api/assistent`, `api/uren-schatting`, exports |
| Opslag | Blob-store privé; foto's alleen via de route met inlog, `Cache-Control: private, no-store` | `src/lib/crm/opslag.ts` |
| Invoer | alle velden ingekort en tegen vaste lijsten gecontroleerd; bedragen als tekst ontleed; regels van de browser of Claude door `schoonRegel` | acties en `calculatie.ts` |
| Totalen | de server rekent bij bewaren opnieuw; totalen uit de browser tellen niet | `calculatie/acties.ts` |
| Claude | krijgt geen telefoon, e-mail of adres; schrijft niets | `src/lib/crm/context.ts` |
| Geheimen | alleen in Vercel-omgevingsvariabelen, nooit in de browser | |

**Getest** (`tests/crm.spec.ts`): zonder koekje geeft het dashboard een
redirect naar de inlog, en `/api/assistent`, `/api/crm/foto` (lezen en
uploaden) en de CSV-export weigeren. Een foto die de eigenaar ziet, krijgt een
ander zonder koekje niet.

## Bekende grenzen

- Eén rol. Rollen uit de opdracht (kantoor, projectleider, uitvoerder,
  onderaannemer, klant) vragen om meerdere accounts en rijen per eigenaar:
  dat komt met Postgres (ADR 0001).
- Geen rate limit op de dashboardacties (alleen de eigenaar kan ze aanroepen).
  `/api/aanvraag` is publiek: dubbelcontrole van 10 minuten, maar geen limiet per IP; `/api/vijverfoto` heeft er wel een.
- Server-acties van Next controleren de Origin (CSRF); de API-routes accepteren alleen het koekje (`SameSite=Lax`).
- Verwijderen is echt verwijderen (geen prullenbak). Voor AVG-verzoeken is dat
  goed; voor vergissingen niet. Een prullenbak staat op de roadmap.
- Back-up: Vercel Blob heeft geen versies. Op de roadmap: dagelijkse kopie van `dashboard/*.json`.

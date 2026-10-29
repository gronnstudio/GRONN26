# ADR 0004 · De bestaande inlog is de poort van het CRM

29 okt 2026 · **Besloten**

Geen tweede inlogsysteem. Google-inlog met één toegestaan adres
(`EDITOR_ALLOWED_EMAIL`) en een ondertekend koekje blijft de poort. De proxy
houdt `/dashboard` en `/offertes` dicht; elke server-actie en API-route
controleert het koekje nog eens (`src/lib/crm/toegang.ts`), omdat een
server-actie een gewone POST is die iedereen kan sturen.

Rollen (kantoor, uitvoerder, onderaannemer, klant) komen pas met meer
gebruikers en een database met lidmaatschappen. `rol()` in `toegang.ts` is de
plek waar dat dan bijkomt. Klanten loggen nooit in op `/dashboard`: hun portaal
wordt een eigen route met uitnodiging.

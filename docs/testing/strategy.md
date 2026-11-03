# Testen

Alles draait in Playwright tegen de productiebuild (`npm run build`, dan
`npx playwright test`), lokaal en in GitHub Actions. Eén testpakket; geen
Vitest erbij (ADR 0003).

| Bestand | Wat |
| --- | --- |
| `tests/crm-rekenen.spec.ts` | zonder browser: centen en afronden, invoer lezen, btw per tarief, korting/onvoorzien naar rato, optionele regels, marge tegenover opslag, wegzetten, rekenhulpen (55 m² + 7 % = 58,85 m²), prijshistorie, dubbelen, oude gegevens |
| `tests/crm.spec.ts` | in de browser: deuren dicht zonder inlog; aanvraag (dubbel verzonden) → klant → tweede aanvraag bij dezelfde klant → fase en tijdlijn → tuin, opname met geschiedenis, foto → calculatie via rekenhulp, twee versies → ★ catalogus → tabel; dubbele klant; CRM-pagina's zonder fouten of overloop |
| overige | de publieke site (bestond) |

De testserver krijgt een testinlog en `CRM_LOKAAL=1`
(`playwright.config.ts`), zodat er niets in Blob komt. Het koekje maakt de
test zelf met `maakKoekje()`.

**Nog niet getest:** Grønn met een echte API-sleutel (CI heeft er geen),
gelijktijdig schrijven tegen Blob (`ifMatch`), drag-and-drop in de pijplijn,
toegankelijkheid met axe. Het acceptatiescenario uit de opdracht loopt nu tot
en met stap 5 (calculatie); stappen 6–20 komen met de modules die ze nodig hebben.

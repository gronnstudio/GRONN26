# Opbouw

## 1. Audit: wat er al was (29 okt 2026)

Repo `gronnstudio/GRONN26`, productietak `claude/brave-einstein-no9sq8`,
Vercel-project `gronn26`. Next.js 16 (App Router, Turbopack), React 19,
TypeScript strict, Tailwind 4. Afhankelijkheden in productie: `@anthropic-ai/sdk`,
`@vercel/blob`, `@vercel/analytics`, `@vercel/speed-insights`, `passkit-generator`.
Tests: Playwright tegen de productiebuild, in GitHub Actions (`quality.yml`).

| Wat | Waar | Hergebruikt? |
| --- | --- | --- |
| Inlog: Google, één toegestaan adres, HMAC-koekje (30 dagen) | `src/lib/eigenaar.ts`, `src/app/api/inloggen`, `api/auth/callback/google`, `src/proxy.ts` | Ja, ongewijzigd. Wordt de poort van het hele CRM. |
| Dashboard met tabbladen (Vandaag, Klanten, Geld, Social, Links) | `src/app/dashboard/page.tsx` | Ja. De ring en "Volgende stap" rekenen nu met de echte klanten. |
| Klanten: pijplijn en klantkaart (PR #148) | `src/app/dashboard/klanten`, `src/lib/beheer/klanten.ts` | Ja, uitgebreid (zie database.md). Bestaande gegevens blijven leesbaar. |
| Rekenblad Prijs berekenen (PR #146/#147) | `src/components/beheer/prijs.tsx` | Ja, herschreven op de nieuwe rekenkern; alle functies bleven. |
| Urenvoorstel door Claude (PR #149/#150) | `src/app/api/uren-schatting` | Ja, krijgt nu ook de catalogusprijzen. |
| Assistent Grønn (spraak en tekst) | `src/components/beheer/assistent.tsx`, `src/app/api/assistent` | Ja, krijgt nu de klanten en de open klantkaart. |
| Aanvragen van het formulier | `src/app/api/aanvraag`, `src/lib/beheer/stand.ts` | Ja; "Maak klant" zet een aanvraag om. |
| Urenregistratie | `src/app/dashboard/uren`, `src/lib/beheer/uren.ts` | Ja, ongewijzigd in gebruik. |
| Offertemaker (in de browser, print naar PDF) | `src/app/offertes`, `src/components/offertes/maker.tsx` | Nog los. Fase 2 koppelt hem aan de calculatie. |
| Leveranciers | `src/lib/beheer/leveranciers.ts` | Nog los; de catalogus heeft een vrij leveranciersveld. |
| Mollie (borderpakketten, cadeaubon) | `src/lib/mollie.ts` | Niet aangeraakt. |
| Opslag | Vercel Blob, privé, JSON per onderdeel | Ja, via één adapter (ADR 0001). |

Het route `/clients` uit de opdracht bestaat in deze repo niet; het CRM blijft
onder `/dashboard`, waar de inlog, de bladwijzers en de proxy al zitten.
`/clients` wordt later het klantportaal (module 16), voor klanten zelf.

### Risico's die de audit vond

- **Kommagetallen voor geld.** Het rekenblad rekende met `number` in euro's.
  Opgelost: alles in centen (ADR 0002).
- **Gelijktijdig schrijven.** Lezen-aanpassen-schrijven op één JSON-bestand
  kon een wijziging stil overschrijven. Opgelost met `ifMatch` op de ETag en
  één nieuwe poging (`src/lib/crm/opslag.ts`).
- **Vaste gegevens in `data.ts`.** Het dashboard toonde projecten uit code.
  De ring en Grønn gebruiken nu de klanten; to-do's, facturen en offertes in
  `data.ts` zijn nog handwerk (zie roadmap).
- **Formulier na bewaren.** React zet een formulier na een server-actie terug
  naar zijn beginwaarden; een select hield dan een oude waarde. Opgelost met
  een `key` uit de bewaarde gegevens (`sleutel()` in `src/lib/crm/klant.ts`).
- **Geen rollen.** Er is één gebruiker. Medewerkers en klanten vragen om een
  database met rijen per eigenaar (ADR 0001, roadmap fase 5).

## 2. Lagen

```
src/lib/crm/          domein: puur, ook in de browser bruikbaar (behalve opslag/toegang/context)
  geld.ts             centen, duizendsten, bp, afronden, lezen en tonen
  calculatie.ts       de rekenkern: kostprijs, verkoop, opslag, marge, btw, wegzetten
  rekenhulpen.ts      hoeveelheden: bestrating, afgraven, grond, grind, gazon, planten, mulch, machine, arbeid
  catalogus.ts        items, prijshistorie, item → regel
  intake.ts           de vragenlijst van de tuinopname
  klant.ts            het klantmodel, normaliseren, dubbelen zoeken
  opslag.ts           server: Blob of lokale map, ifMatch          ← het enige bestand dat Blob kent
  toegang.ts          server: wie mag dit (nu: eigenaar)
  context.ts          server: wat Grønn uit het CRM te zien krijgt
src/lib/beheer/       lezen/schrijven per onderdeel (klanten.ts, catalogus.ts, stand.ts, uren.ts)
src/app/dashboard/    schermen en server-acties
src/components/beheer/ componenten van het dashboard
```

Rekenen staat nooit in een component: het rekenblad roept `reken()` aan, de
server rekent bij bewaren opnieuw, en wat de browser aan totalen stuurt telt niet.

## 3. Migratie en terugrollen

- **Gegevens.** Geen omzetting nodig. `normaliseer()` vult nieuwe velden bij
  het lezen; een oude klant zonder `tuinen` of `email` wordt gewoon getoond.
  Pas bij de eerste wijziging komt de nieuwe vorm in Blob.
- **Terugrollen.** Een eerdere deploy terugzetten (`npx vercel rollback` of
  de Vercel-knop) werkt: de oude code leest de velden die hij kent en laat de
  rest liggen. Wat in de tussentijd in nieuwe velden stond (tuinen,
  calculaties, tijdlijn) is dan niet zichtbaar, maar niet weg.
- **Nieuwe Blob-bestanden:** `dashboard/catalogus.json`, `crm/fotos/<id>.jpg`.

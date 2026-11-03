# Gegevensmodel

Opslag is nu JSON in Vercel Blob (ADR 0001). Het model is wel relationeel
gedacht, zodat de overstap naar Postgres een kwestie van tabellen maken is:
elk ding heeft een `id` (UUID), verwijzingen gaan via id, en geld en
hoeveelheden zijn gehele getallen (ADR 0002).

## Documenten in Blob

| Pad | Inhoud | Bewaren |
| --- | --- | --- |
| `dashboard/klanten.json` | `Klant[]` met tuinen, calculaties en tijdlijn | Administratie: blijft |
| `dashboard/catalogus.json` | `Item[]` met prijshistorie | Blijft |
| `dashboard/stand.json` | aanvragen, planning, bestellingen, bonnen | Aanvragen 30 dagen (privacyverklaring) |
| `dashboard/uren.json` | urenregels | 7 jaar |
| `crm/fotos/<uuid>.jpg` | foto's van tuinen, privé | Met de klant |

## Klant (`src/lib/crm/klant.ts`)

```
Klant
├─ id, naam, soort (Particulier | Zakelijk | Leverancier | Onderaannemer | Architect | Tuinontwerper | Partner)
├─ bedrijf, email, telefoon, voorkeur, adres (factuur), plaats, tags[], bron
├─ lead: fase (8), prioriteit, waarde (centen), kans (0–100), opvolgen (datum), volgende, verlorenReden
├─ notities
├─ stukken[]       Offerte | Factuur, nummer, bedrag (euro's, uit DigiBoox), datum, rond
├─ tuinen[]        Tuin
│   ├─ id, naam, adres
│   ├─ antwoorden { veld-id: tekst }, diensten[]   ← de opname (intake.ts)
│   ├─ geschiedenis[] eerdere opnames (datum, antwoorden, diensten)
│   └─ fotos[]     id, datum, bijschrift, moment (Opname | Voor | Tijdens | Na)
├─ calculaties[]   Calculatie
│   ├─ id, titel, tuinId?
│   └─ versies[]   nr, datum, beschrijving, uren, uurtarief, onvoorzien, korting, regels[], totaal, winst
└─ activiteit[]    id, datum, wie, soort, tekst     ← de tijdlijn
```

Een tuin hoort bij één klant en heeft een eigen id, zodat hij later los kan
staan (meerdere klanten per perceel, of een perceel met een nieuwe eigenaar).

## Calculatieregel (`src/lib/crm/calculatie.ts`)

| Veld | Eenheid | Betekenis |
| --- | --- | --- |
| `hoeveelheid` | duizendsten | netto, vóór afval |
| `inkoop` | centen per eenheid | excl. btw |
| `opslag`, `afval`, `btw` | bp (1 % = 100) | |
| `soort` | materiaal, planten, machine, bezorging, afvoer, onderaanneming, ontwerp, overig | |
| `optioneel`, `groep`, `catalogusId` | | |

Een versie bewaart de regels zelf (met hun prijzen), niet een verwijzing naar
de catalogus: een oude calculatie verandert nooit mee als een prijs stijgt.

## Catalogusitem (`src/lib/crm/catalogus.ts`)

`id, naam, soort, eenheid, inkoop, leverancier, opslag, btw, afval, sku, link,
notitie, bijgewerkt, historie[] (datum, inkoop, leverancier)`.

## Naar Postgres (later)

Tabellen volgen het model één op één: `klanten`, `tuinen`, `opnames`,
`fotos`, `calculaties`, `calculatie_versies`, `calculatie_regels`,
`catalogus_items`, `prijzen`, `gebeurtenissen`, plus `organisaties` en
`lidmaatschappen` zodra er meer dan één gebruiker is. Geld in `bigint` centen.
Alleen `src/lib/crm/opslag.ts` en de `beheer/*.ts`-bestanden veranderen.

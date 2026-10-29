# ADR 0001 · Opslag: Blob nu, Postgres later

29 okt 2026 · **Besloten** (eigenaar koos "Blob nu, Postgres later")

**Vraag.** De opdracht noemt PostgreSQL en Supabase. Het dashboard bewaart nu
alles als JSON in een privé Vercel Blob-store.

**Besluit.** Verder op Blob, achter één adapter (`src/lib/crm/opslag.ts`).
Schrijven gebruikt `ifMatch` op de ETag, zodat twee gelijktijdige wijzigingen
elkaar niet stil overschrijven; bij een botsing één nieuwe poging op de nieuwe stand.

**Waarom.** Eén gebruiker en tientallen klanten: een JSON-document per
onderdeel is snel genoeg, kost niets extra, en past bij de gouden regel
(functioneel en eenvoudig). Supabase is een nieuwe dienst met sleutels,
migraties en een betaalde laag als het groeit.

**Wat het kost.** Geen echte transacties over meerdere documenten, geen
rijbeveiliging, zoeken gebeurt in het geheugen van de server. Boven een paar
duizend klanten of bij een tweede gebruiker wordt dat de grens.

**Wanneer opnieuw bekijken.** Zodra er een medewerker of een klantportaal met
eigen inlog komt (roadmap fase 5). Dan Postgres (Supabase of Neon via Vercel),
met Drizzle voor de migraties; alleen de adapter en `src/lib/beheer/*.ts` veranderen.

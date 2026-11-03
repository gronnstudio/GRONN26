# Koppelingen

| Koppeling | Stand | Waar |
| --- | --- | --- |
| Google-inlog | Productieklaar (bestond) | `src/app/api/inloggen`, `api/auth/callback/google` |
| Vercel Blob (privé) | Productieklaar (bestond), nu via `src/lib/crm/opslag.ts` | `BLOB_READ_WRITE_TOKEN` |
| Claude (Anthropic API) | Gebouwd: Grønn leest het CRM, urenvoorstel leest de catalogus | `ANTHROPIC_API_KEY`, `src/app/api/assistent`, `api/uren-schatting` |
| Formulier → aanvraag | Productieklaar (bestond), nu met dubbelcontrole | `src/app/api/aanvraag` |
| Mollie | Niet aangeraakt | `src/lib/mollie.ts` |
| DigiBoox | Geen koppeling. Facturen en btw-aangifte blijven daar; bedragen neem je over op de klantkaart. | |
| Agenda (Google) | Gepland, niet gebouwd | |

## Grønn en het CRM

Grønn leest, hij schrijft niets. Per vraag krijgt hij alle lopende klanten
kort (naam, plaats, fase, volgende stap, opvolgdatum, laatste calculatie,
open bedrag) en, op een klantkaart, die klant uitgebreid (opname, calculatie,
stukken, laatste tijdlijn). **Geen** telefoonnummers, e-mail of adressen
(`src/lib/crm/context.ts`). Als Grønn later iets mag wijzigen (taak maken,
concept-offerte), dan alleen na een bevestiging van Nick, en elke wijziging komt op de tijdlijn met `wie: "Grønn"`.

# ADR 0003 · Geen nieuwe afhankelijkheden voor fase 1

29 okt 2026 · **Besloten**

De opdracht noemt shadcn/ui, TanStack Table/Query, React Hook Form, dnd-kit,
FullCalendar, Recharts, Vitest, Drizzle/Prisma en Zod. Voor fase 1 is geen
ervan nodig:

| Gevraagd | Nu | Wanneer wel |
| --- | --- | --- |
| Zod | kleine eigen controles in de server-acties (`schoonRegel`, `normaliseer`, `leesOpname`) | als er een publieke API met veel velden komt |
| TanStack Table | gewone `<table>`, filter via de URL | boven een paar honderd rijen per tabel |
| React Hook Form | gewone formulieren met server-acties | bij lange formulieren met veel afhankelijke velden |
| dnd-kit | native drag-and-drop in de pijplijn (bestond al) | als slepen op touch of met toetsen moet |
| FullCalendar | – | module 10 (planning) |
| Recharts | – | module 18, alleen als een grafiek een vraag beantwoordt |
| Vitest | Playwright draait ook de rekentests (`tests/crm-rekenen.spec.ts`) | als de unit-tests traag worden door de webserver |
| Drizzle | – | samen met Postgres (ADR 0001) |

Elke nieuwe afhankelijkheid krijgt een eigen ADR met licentie, grootte en onderhoud.

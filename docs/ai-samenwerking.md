# AI-samenwerking · Claude Code × GPT/Codex

De regels staan in [AGENTS.md](../AGENTS.md) (die `CLAUDE.md` importeert, dus
beide modellen lezen hetzelfde). Hier staat de cyclus.

## Per PR

1. Claude kijkt welke open PR's dezelfde bestanden raken, werkt op een eigen
   branch vanaf `claude/brave-einstein-no9sq8` en opent een PR die de
   geraakte mappen noemt.
2. Raakt de PR API, CRM, dashboard, inlog of `.github/`, dan reviewt Codex
   (automatisch, of met de opmerking `@codex review`).
3. Claude beantwoordt elke bevinding in de reviewthread:
   - `opgelost` — met de commit en de test die het bewijst;
   - `weerlegd` — met code, test of documentatie die laat zien waarom niet;
   - `besluit Nick` — scope, kosten, privacy of smaak.
4. Bij een weerlegging krijgt de reviewer één tegenronde (`@codex review`
   opnieuw). Wat dan nog openstaat, gaat naar Nick.
5. Mergen pas zonder open P0/P1 en met groene `quality`.

## Wat er niet naar een extern model gaat

`.env*`, `.crm-data/`, uploads, foto's, en echte namen, adressen,
telefoonnummers, e-mailadressen of IBAN's. Alleen code.

## Uitbreiden

Voor het CRM of de AI-intake vul je de review guidelines in `AGENTS.md` aan.
Een andere repo krijgt hetzelfde blok in zijn eigen `AGENTS.md`.

## Fasen

| Fase | Wat | Stand |
| --- | --- | --- |
| 1 | Protocol: `AGENTS.md`, dit document, ADR 0008 | Gebouwd |
| 2 | `scripts/gpt.mjs` (review en vraag via de Responses API), tests in `scripts/gpt.test.mjs` | Getest |
| 3 | Skills `/review-with-gpt` en `/vraag-gpt` (`.claude/skills/`) | Gebouwd |
| 4 | Codex code review aan op GRONN26, test op `src/components/stapel.tsx` | Gepland |

## Het script

`node scripts/gpt.mjs review` stuurt de diff ten opzichte van de standaardbranch naar GPT
(`gpt-6.1-sol`, met `--zwaar` `gpt-6-astra`). `vraag "<vraag>" <bestanden>` vraagt tegenadvies.
De sleutel komt uit `OPENAI_API_KEY` of `OPENAI_API_KEY_FILE`.

Beveiliging: paden als `.env*`, `.crm-data/`, uploads en foto's gaan nooit mee. Het script stopt
als het een sleutel, IBAN, telefoonnummer, e-mailadres (behalve @gronn.studio) of postcode met
huisnummer ziet. Er gaan maximaal ongeveer 60.000 tokens in en 4.000 uit (≈ $0,16 met Sol), en
`store: false`. Elke uitvoer eindigt met het aantal tokens en de kosten.

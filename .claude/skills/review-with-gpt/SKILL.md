---
name: review-with-gpt
description: Laat GPT de huidige branch onafhankelijk reviewen, beoordeel elke bevinding kritisch, los op wat klopt, weerleg wat niet klopt, en zet het verslag in de PR. Gebruik vóór het mergen van PR's die src/app/api, src/lib/crm, src/app/dashboard, inlog of .github/ raken, of als Nick erom vraagt.
---

# /review-with-gpt

Regels: `AGENTS.md`, sectie "Samenwerking Claude Code × GPT/Codex". GPT krijgt niet
automatisch gelijk, en jij ook niet.

1. **Review ophalen.** `node scripts/gpt.mjs review` (optioneel `--base <ref>`, `--zwaar` voor
   een grote architectuurwijziging). Stopt het script op mogelijk gevoelige gegevens: niet
   omzeilen, maar haal de gegevens uit de code of vraag Nick.
2. **Elke bevinding zelf controleren.** Open het bestand op die regel. Probeer de claim te
   reproduceren met een test, een commando of de documentatie in `node_modules/next/dist/docs/`.
   Geef één status:
   - `opgelost`: fix plus een test of commando dat het bewijst;
   - `weerlegd`: concreet tegenbewijs (code, test-uitvoer, documentatie), geen mening;
   - `besluit Nick`: scope, kosten, privacy of smaak.
3. **Fixen en testen.** `npx tsc --noEmit`, `npx eslint src`, `npm run build` en de Playwright-tests
   die het raakt. Een test die je niet gedraaid hebt, meld je als niet gedraaid.
4. **Eén tegenronde** als je iets weerlegt: schrijf je weerleggingen naar een tijdelijk bestand
   in je scratchpad en draai `node scripts/gpt.mjs review --tegenronde <bestand>`. Wat GPT
   daarna met nieuw bewijs aanhoudt, beoordeel je opnieuw. Wat dan nog openstaat, wordt
   `besluit Nick`.
5. **Verslag in de PR** als één comment: de GPT-uitvoer (inclusief de kostenregel), en per
   bevinding je status met bewijs, de commit en wat er getest is.
6. **Mergen** alleen zonder open P0/P1, met groene `quality`, en geen open `besluit Nick` van P0/P1.

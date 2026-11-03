---
name: vraag-gpt
description: Vraag GPT om tegenadvies bij een lastige ontwerp- of architectuurkeuze tijdens het bouwen, met de relevante bestanden als context. Gebruik bij keuzes die moeilijk terug te draaien zijn (datamodel, opslag, inlog, een nieuwe afhankelijkheid).
---

# /vraag-gpt

1. Formuleer de keuze als één vraag met je eigen voorkeur en waarom, zodat GPT die kan
   aanvechten. Kies 1 tot 5 bestanden die ertoe doen (geen `.env*`, `.crm-data/` of foto's;
   het script laat die weg).
2. `node scripts/gpt.mjs vraag "<vraag>" <bestand> …` (`--zwaar` bij een grote keuze).
3. Weeg het advies op argumenten, niet op wie het zegt. Neem je het niet over, zeg dan in de
   PR of ADR waarom, met bewijs.
4. Raakt de keuze scope, kosten of privacy, leg haar dan aan Nick voor met beide standpunten.

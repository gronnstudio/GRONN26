# Ontwerp

Het CRM gebruikt de tokens van de site (`src/app/globals.css`), zodat licht,
donker en hoog contrast vanzelf werken: `--grond` (zand), `--inkt`, `--lijn`,
`--gedempt`, `--oranje` (het ene accent, #FF5B04; oranje vlak draagt
antraciet tekst) en `--oranje-tekst` (#B84000 op licht).

**Afwijking van de opdracht:** de opdracht vraagt botanisch groene accenten.
De eigenaar wees groen, salie en mos af voor GRØNN (okt 2026, palet "Grova":
zand, aarde, oranje). Het CRM volgt de eigenaar.

- **Type:** Syne voor koppen en grote getallen, Montserrat voor tekst, Geist
  Mono (`font-mono`) voor bedragen in tabellen en formules.
- **Labels:** kleine hoofdletters met spatiëring, 10px (`lbl` in de pagina's).
- **Vlakken:** randen van 1px `--lijn`, rondingen 10–18px, geen schaduwen
  behalve op de kaarten in de pijplijn, geen verlopen.
- **Eén oranje actie per vlak** (Bewaren, + Klant). De rest is een omlijnde knop.
- **Desktop eerst** (`min-w-[1200px]` op pijplijn, tabel en catalogus, eigenaar
  29 okt: "enkel voor desktop"). De tuinopname en het rekenblad werken ook op
  een tablet bij de klant.
- **Lege staten** zeggen wat je kunt doen ("Nog geen tuin. Voeg er een toe…").
- **Beweging:** geen nieuwe animaties in het CRM.

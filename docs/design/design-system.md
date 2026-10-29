# Ontwerp

Het systeem achter `/dashboard` heeft een eigen palet, alleen binnen `.crm`
(`:root .crm` en `:root.donker .crm` in `src/app/globals.css`). De publieke site
houdt zand, aarde en oranje; daar wees de eigenaar groen af. Het systeem volgt
de opdracht (29 okt 2026): warm crème, antraciet tekst, botanisch groen.

| Token | Licht | Donker | Voor |
| --- | --- | --- | --- |
| `--grond` | #f4f0e6 | #161614 | achtergrond |
| `--vlak` / `--veld` | #fbf9f4 / #fffdf8 | #1f1f1c / #262623 | panelen, velden |
| `--zijbalk` | #ebe5d8 | #1b1b19 | zijbalk, pijplijnkolommen |
| `--inkt` / `--gedempt` | #23221f / #5f5b52 | #ece8df / #a9a497 | tekst |
| `--lijn` / `--lijn-sterk` | #e0d9ca / #cbc2b0 | #33322e / #46443e | randen |
| `--accent` / `--accent-tekst` | #2f6a4f / #2a5f47 | #8fbf9f / #9fcdaf | actie, "hier ben je" |
| `--let` | #b84000 | #ff8a4c | aandacht: te laat, open bedrag |

- **Groen = doen of hier**, **oranje = let op**. Een getal is alleen oranje als
  er iets mee moet (open bedrag, te laat).
- **Type:** Syne voor koppen, Montserrat voor alles in de bediening, Geist Mono
  (`crm-cijfer`) voor bedragen, datums en aantallen.
- **Klassen** (`@layer components`): `crm-label`, `crm-knop` / `-rand` /
  `-stil` / `-klein`, `crm-veld`, `crm-paneel`, `crm-badge` (`-let`, `-stil`),
  `crm-tabel`, `crm-link`, `crm-let`.
- **Indeling:** de inhoud is een container (`@container` in de schil). Twee
  kolommen worden één als de inhoud smaller is dan 1060px, bijvoorbeeld als
  Grønn openstaat; het rekenblad pas vanaf 1340px.
- **Desktop eerst** (`min-w-[1200px]`, eigenaar 29 okt: "enkel voor desktop").
- **Lege staten** zeggen wat je kunt doen. **Beweging:** geen, behalve hover.

# Componenten

Algemeen (`src/components/beheer/`):

| Component | Doet |
| --- | --- |
| `CrmKop` | bovenbalk: kruimelpad en de vaste onderdelen |
| `Pijplijn` | kolommen per fase, slepen met optimistische update |
| `Assistent` | Grønn, spraak en tekst; met `klantId` kent hij de open klant |
| `Rekenhulp` | maten in, hoeveelheid en formule uit, als regel in de calculatie |
| `TuinFotos` | foto's per moment, verkleinen in de browser, privé uploaden |
| `PrijsRekenaar` | het rekenblad; los, of bij een klant met versies (`begin`) |

Pagina's stellen alleen samen. Rekenen zit in `src/lib/crm/`, nooit in een component.

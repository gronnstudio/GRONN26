# Componenten

## Publieke site: het ontwerpsysteem (9 nov 2026)

`src/components/ontwerp/` (opmaak in `ontwerp.css`, richting in [../website/ART-DIRECTION.md](../website/ART-DIRECTION.md)):

| Component / klasse | Doet | Gebruik |
| --- | --- | --- |
| `Markering` | `01 — Naam` op een haarlijn | begin van elke sectie |
| `Maatlijn` | `\|—— maat ——\|` | alleen met een echte maat uit de data |
| `Figuur` | foto + mono bijschrift en code | elk beeld van werk; `vorm` zet de verhouding |
| `Regels` | kopregels die één voor één binnenkomen | alleen de h1 van een opening |
| `LijnLink` | tekstlink met aangroeiende lijn en pijl | secundaire acties |
| `.index` | grote woorden met meewisselend beeld | keuzelijsten (diensten) |
| `.spec` | maten als op een tekening | projectdata |
| `.stappen` | stappen op één lijn | werkwijze |
| `.vlak-diep` + `.donker` | antraciet sectie | wisselen met crème |
| `.opkomst` | blok komt op bij scrollen | koppen en beelden, niet op alles |
| `t-display` … `t-body`, `meta`, `bijschrift`, `raster` | type en raster (globals.css) | nooit een eigen maat |

## Systeem

Het systeem (`src/components/crm/`):

| Component | Doet |
| --- | --- |
| `Schil` | zijbalk (in te klappen), Nieuw-menu, Zoeken, Grønn-paneel (⌘J); stand in `gronn-crm-schil` |
| `Zoekvenster` | ⌘K: klanten, tuinen, calculaties, stukken, catalogus, leveranciers, onderdelen |
| `Kop`, `Tabs` | kruimelpad, titel, acties; tabbladen als links |
| `Cijfer`, `Cijfers` | een getal met wat het is en een link naar de lijst erachter |
| `Blok`, `Leeg` | sectie met titel; lege staat |
| `GrønnKnop` | opent het Grønn-paneel bij de open klant |
| `Icoon` | de lijniconen van de zijbalk |

De onderdelen en het Nieuw-menu staan in `src/lib/crm/navigatie.ts`; de cijfers
van Vandaag en Geld in `src/lib/crm/overzicht.ts`.

Uit `src/components/beheer/`:

| Component | Doet |
| --- | --- |
| `Pijplijn` | kolommen per fase, slepen met optimistische update |
| `Assistent` | Grønn, spraak en tekst; met `klantId` kent hij de open klant |
| `Rekenhulp` | maten in, hoeveelheid en formule uit, als regel in de calculatie |
| `TuinFotos` | foto's per moment, verkleinen in de browser, privé uploaden |
| `PrijsRekenaar` | het rekenblad; los, of bij een klant met versies (`begin`) |

Pagina's stellen alleen samen. Rekenen zit in `src/lib/crm/`, nooit in een component.

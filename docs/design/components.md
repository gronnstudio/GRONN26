# Componenten

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

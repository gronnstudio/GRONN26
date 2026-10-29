# Wijzigingen

## 29 okt 2026 · Nieuw systeem in plaats van het dashboard

- Schil met zijbalk (Werk, Rekenen, Bedrijf), Nieuw-menu, ⌘K-zoekvenster en Grønn als zijpaneel (⌘J).
- Eigen palet binnen `.crm`: crème, antraciet, botanisch groen; donker in antraciet. Syne, Montserrat, Geist Mono.
- Nieuwe onderdelen: Vandaag, Aanvragen, Planning, Calculaties, Geld en papieren, Links. Uren, Social en Leveranciers in het nieuwe jasje.
- Weg: ring, klok, tabbladen, de vaste lijsten met facturen en offertes in `data.ts`.
- Tests: elke pagina één h1, geen fouten of overloop in licht en donker; oude adressen; zoekvenster; schil.

## 29 okt 2026 · CRM fase 0 en 1

- Documentatie: audit, architectuur, gegevensmodel, ADR 0001–0004, modules, roadmap.
- Rekenkern in centen (`src/lib/crm/geld.ts`, `calculatie.ts`), rekenhulpen, catalogus met prijshistorie.
- Opslag via één adapter met `ifMatch`; `CRM_LOKAAL=1` voor tests.
- Klantkaart met tabbladen; soort, e-mail, telefoon, bron, tags, kans, waarde, opvolgen, verloren; tijdlijn.
- Tuinen met opname, geschiedenis en foto's.
- Calculaties per klant met versies; rekenblad herschreven op de rekenkern (hoeveelheid × eenheidsprijs, opslag per regel, afval, optioneel, onvoorzien).
- Aanvraag → klant met dubbelcontrole; dezelfde aanvraag binnen 10 minuten telt één keer.
- Dashboard-ring uit klanten; Grønn leest het CRM; urenvoorstel leest de catalogus.
- Tests: `tests/crm-rekenen.spec.ts`, `tests/crm.spec.ts`.

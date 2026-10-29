# Wijzigingen

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

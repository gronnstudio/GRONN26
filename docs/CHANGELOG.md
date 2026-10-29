# Wijzigingen

## 29 okt 2026 · Plan intake en projectvoorbereiding

- Audit en architectuur voor de opdracht "Intelligent Intake & Project Intelligence": [architecture/intake.md](architecture/intake.md), ADR 0005 (één checklist als gegevens), 0006 (video via beelden uit de browser), 0007 (Claude stelt voor, de code rekent). Nog geen code.

## 29 okt 2026 · Offerte met privélink

- Op een calculatie: "Offerte met link maken". Er komt een momentopname met alleen omschrijving, hoeveelheid en prijs (geen inkoop, opslag of uren) onder een onraadbare sleutel in `crm/offertes/`.
- De klant opent `/offerte/[token]` zonder inlog, vult zijn naam in en geeft akkoord; het stuk wordt akkoord en de klant gaat naar fase Akkoord, met een regel op de tijdlijn.
- Intrekken maakt de link ongeldig; na 30 dagen verloopt hij.
- Ook: adres zoekt mee via PDOK; opname-checklist per tuin.

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

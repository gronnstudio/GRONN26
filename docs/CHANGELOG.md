# Wijzigingen

## 9 nov 2026 · Premium redesign, fase 1: ontwerpsysteem en voorpagina

- Master Brief van de eigenaar: [website/BLUEPRINT.md](website/BLUEPRINT.md) en [website/ART-DIRECTION.md](website/ART-DIRECTION.md).
- Kleur: crème #EFEEEA en antraciet #202020/#1A1A18 in plaats van zand en bruin; oranje blijft het ene accent. Foto-hoek 4px.
- Type: schaal `t-display` … `t-body`, `meta` en `bijschrift`; Geist Mono terug voor annotaties.
- Menu: geen glas maar dicht antraciet; komeet één ronde, iconen bewegen alleen bij aanwijzen.
- Voorpagina opnieuw: opening, Studio, index Wat ik maak, Werk met maten, Werkwijze, slot. Bouwstenen in `src/components/ontwerp/`.
- Dashboard, API en privélinks niet aangeraakt.

## 29 okt 2026 · Intake-engine (fase 2)

- Eén vragenlijst (`src/lib/crm/vragenlijst.ts`) vervangt `intake.ts` en `checklist.ts`: 11 categorieën, 153 vragen, met de ids van de oude vragen en vinkjes. Een vinkje van de oude checklist wordt bij het lezen "Ja".
- Aan te passen zonder code op `/dashboard/vragenlijst` (`dashboard/vragenlijst.json`, met versienummer). Een vraag gaat nooit weg, hij wordt "vervallen"; een antwoord bewaart de vraagtekst van dat moment.
- De opname is een intake: per vraag Ja/Nee/Onbekend/N.v.t. of een waarde, een notitie (met inspreken) en een aandachtspunt. Categorieën en vragen met "Alleen bij" verschijnen pas bij die werkzaamheden. Snelle intake, uitgebreide intake en vervolginspectie. Open punten. Zones met maten.
- Tussentijds opslaan (`intake-acties.ts`): elke wijziging na 0,7 s; zonder verbinding in localStorage tot er weer bereik is. Eén versie per dag in de geschiedenis.
- Op een scherm smaller dan 1024px valt op de intakepagina de zijbalk weg; de rest van het systeem blijft voor de desktop.
- ADR's van het intakeplan hernummerd naar 0008–0010 (0005 is de GPT-reviewer).

## 29 okt 2026 · Plan intake en projectvoorbereiding

- Audit en architectuur voor de opdracht "Intelligent Intake & Project Intelligence": [architecture/intake.md](architecture/intake.md), ADR 0008 (één checklist als gegevens), 0009 (video via beelden uit de browser), 0010 (Claude stelt voor, de code rekent). Nog geen code.

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

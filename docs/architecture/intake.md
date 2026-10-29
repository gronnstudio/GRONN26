# Intake en projectvoorbereiding

29 okt 2026 · fase 1 (analyse en architectuur) van de opdracht "Intelligent
Intake & Project Intelligence". Dit document zegt wat er al is, wat erbij
komt, waar het komt te staan en wat bewust niet gebouwd wordt.

Uitgangspunt van de eigenaar: **één keer vastleggen, overal hergebruiken.**
Een maat die bij de opname wordt ingevuld, komt zonder overtypen in de
meetstaat, de calculatie en de offerte.

Gouden regel (CLAUDE.md): functioneel en eenvoudig. Alles hieronder is
gewogen tegen één gebruiker (Nick) op een telefoon in een tuin.

## 1. Audit: wat er al is

| Stap in de opdracht | Wat er nu staat | Waar |
| --- | --- | --- |
| Klant | Klantkaart met fasen, tijdlijn, dubbelen zoeken | `src/lib/crm/klant.ts`, `src/app/dashboard/klanten` |
| Intake | Tuinopname: vaste vragenlijst in 5 groepen, 14 diensten, geschiedenis van eerdere versies | `src/lib/crm/intake.ts`, `…/tuin/[tuin]/page.tsx` |
| Locatie-inspectie | Opname-checklist: 10 groepen, 38 punten om af te vinken | `src/lib/crm/checklist.ts` |
| Foto's | Upload per tuin (JPG, in de browser verkleind tot 1600px, privé in Blob), moment Opname/Voor/Tijdens/Na | `src/app/api/crm/foto` |
| Fotoanalyse | Alleen op de website: één foto van een vijver, drie zinnen van Claude | `src/app/api/vijverfoto` |
| Claude in het dashboard | Grønn: chat met spraak (Web Speech API), leest klanten en de open klantkaart; urenvoorstel | `src/app/api/assistent`, `src/app/api/uren-schatting`, `src/lib/crm/context.ts` |
| Materiaalstaat | Tien rekenhulpen met formule erbij (bestrating, afgraven, grond, grind, gazon, planten, mulch, machine, arbeid) | `src/lib/crm/rekenhulpen.ts` |
| Calculatie | Centen, btw per tarief, opslag/marge, versies, uurtarief € 50 | `src/lib/crm/calculatie.ts` |
| Catalogus | Artikelen met prijshistorie | `src/lib/crm/catalogus.ts` |
| Offerte | Momentopname uit een calculatieversie, privélink, akkoord zonder inlog | `src/lib/crm/offerte.ts`, `/offerte/[token]` |
| Werkplanning, uitvoering, oplevering | Nog niet (roadmap fase 3) | |
| Opslag | JSON in privé Vercel Blob, één adapter met ETag-controle | `src/lib/crm/opslag.ts` (ADR 0001) |
| Toegang | Eén eigenaar, Google-inlog, HMAC-koekje | `src/lib/eigenaar.ts` (ADR 0004) |

Ongeveer de helft van de opdracht bestaat dus al in een eerste vorm. De
grootste gaten: de checklist staat in code (niet aan te passen zonder
programmeren), antwoorden kennen alleen "afgevinkt", foto's zijn los van de
vragen, er is geen video, en de maten uit de opname komen niet vanzelf in een
calculatie.

### Wat de audit verder vond

- **Twee vragenlijsten naast elkaar.** `INTAKE` (vragen met antwoorden) en
  `CHECKLIST` (punten om af te vinken) overlappen: toegang, grond, afwatering,
  leidingen staan in allebei. Die worden één lijst.
- **Alles in één bestand.** Alle klanten staan in `dashboard/klanten.json`.
  Met foto-analyses erbij groeit dat snel. Analyses (fase 3) krijgen
  daarom een eigen bestand per tuin (zie §3).
- **Route.** De opdracht noemt `/clients/intakes`. `/clients` is in de
  roadmap het klantportaal (voor klanten zelf). De intake komt onder
  `/dashboard/klanten/[id]/tuin/[tuin]`, waar de inlog en de opname al zitten.
- **Video en Claude.** De Claude API neemt geen video aan, alleen afbeeldingen
  (JPG, PNG, GIF, WebP) en tekst. Videoanalyse gaat daarom via losse beelden
  uit de video (§5). Audio neemt de API ook niet aan.

## 2. Eén lijst: de checklist-engine

Eén configureerbare lijst vervangt `INTAKE` en `CHECKLIST`. Nick past hem aan
in het dashboard (Instellingen → Checklist), zonder code.

```
Sjabloon (versie n)
└─ Categorie       A Klant en project … J Financieel en uitvoering (uit de opdracht)
   └─ Vraag        id, tekst, soort, opties, eenheid, hulp
                   toonBij: ["Bestrating"]       ← slimme vervolgvraag
                   maat: "terras.oppervlak"      ← koppeling naar de meetstaat
                   intake: ["snel", "uitgebreid", "vervolg"]
```

- **Soorten vraag:** ja/nee/onbekend/n.v.t., keuze, getal met eenheid, tekst,
  lange tekst. Bij elke vraag: een notitie, een vlag "aandachtspunt" en de
  foto's die erbij horen.
- **Slimme vervolgvragen:** een vraag met `toonBij` verschijnt alleen als die
  dienst is gekozen. Bestrating toont fundering, afschot, opsluiting,
  klinkermaat; Vijver toont pomp, filter, leidingdiameter, debiet, overloop.
- **Drie soorten intake** zijn filters op dezelfde lijst, geen drie lijsten:
  snel (telefoon, formulier: categorie A en de diensten), uitgebreid
  (alles), vervolg (alleen wat open of onbekend staat).
- **Startinhoud:** de categorieën A–J uit de opdracht, aangevuld met wat nu
  in `INTAKE` en `CHECKLIST` staat. Bestaande antwoorden worden bij het eerste
  lezen omgezet; niets gaat verloren.
- **Geschiedenis blijft kloppen:** een sjabloon krijgt een versienummer bij
  elke wijziging. Een antwoord bewaart het vraag-id én de vraagtekst zoals
  die toen was. Een vraag die later verdwijnt, blijft bij oude intakes
  zichtbaar onder "Vervallen vragen". Vragen worden nooit hernummerd.
- **Open punten:** één overzicht per tuin van wat nog leeg, onbekend of
  gevlagd is. Dat is ook wat "Vervolginspectie" laat zien.

## 3. Gegevensmodel

De opdracht noemt 17 domeinmodellen. Voor één gebruiker op Blob zijn het er
zes, in bestaande of nieuwe JSON-bestanden.

| Opdracht | Hier | Bestand |
| --- | --- | --- |
| Customers | `Klant` (bestaat) | `dashboard/klanten.json` |
| Projects | `Tuin` (bestaat) en later `Project` (roadmap fase 3) | idem |
| ChecklistTemplates, ChecklistQuestions | `Vragenlijst` met categorieën en vragen (`src/lib/crm/vragenlijst.ts`) | `dashboard/vragenlijst.json` |
| IntakeSessions, ChecklistAnswers, Measurements | In de `Tuin`: soort intake, antwoorden met de vraagtekst van dat moment, notities, aandachtspunten, zones met maten | `dashboard/klanten.json` |
| MediaAssets | `Foto` (bestaat), uitgebreid met video, zone en vraag | idem, bestanden in `crm/fotos/` en `crm/video/` |
| MediaAnalyses, AIObservations | `Bevinding`: bron (foto, frame + tijdcode, checklist), tekst, zeker/vermoed, status | `crm/intakes/{tuinId}.json` |
| ProjectPlans, MaterialCalculations, CostEstimates | `Calculatie` met versies (bestaat); de meetstaat wordt een bron van regels | `dashboard/klanten.json` |
| WorkSchedules, ProjectTasks | Fasen en taken in `Project` | roadmap fase 3 |
| Approvals, AuditEvents | De tijdlijn (bestaat) plus een veld `goedgekeurd` op alles wat Claude voorstelt | in de klant |

**Gebouwd in fase 2 (anders dan eerst gedacht):** de antwoorden bleven in de
`Tuin`, waar de calculatie, Grønn en de klantkaart ze al lazen. Een eigen
bestand had al die plekken laten veranderen voor een paar kilobyte per tuin.
De analyses van fase 3 (foto's en beelden met lange teksten) krijgen wel een
eigen bestand per tuin.

### Zones en de meetstaat (uit de schermafbeelding van de eigenaar)

Een tuin krijgt zones: "A Terras", "B Gazon", "C Border", "D Vijver". Een
zone heeft een soort, maten (lengte, breedte of oppervlak, diepte, hoogte),
foto's en eigen antwoorden. De soort bepaalt welke rekenhulpen erbij horen:

| Zone | Rekenhulpen (bestaan al) |
| --- | --- |
| Terras / pad | afgraven, fundering (grind), straatzand, bestrating met snijverlies, opsluiting in m |
| Gazon | grond, graszoden of zaad |
| Border | grond of compost, planten per m², mulch |
| Vijver | uitgraven, folie (lengte + 2 × diepte + rand), later pomp en filter |

Past Nick het terras aan van 50 naar 70 m², dan rekent de meetstaat
fundering, zand, klinkers en uren opnieuw uit en zie je per regel de formule
(bijvoorbeeld `70 m² × 0,04 m = 2,8 m³ zandbed`). Met "Zet in calculatie"
komt dat als nieuwe calculatieversie; een oude versie verandert nooit mee.

Materiaalgegevens die een berekening nodig heeft (soortelijk gewicht,
verdichtingsfactor, stuks per m², besteleenheid) komen bij het
catalogusartikel te staan. Ontbreekt er een, dan zegt de meetstaat dat in
plaats van een standaardpercentage te raden.

## 4. Mobiel op locatie

- De intake is de enige pagina van het dashboard die eerst voor de telefoon
  wordt ontworpen: één categorie per scherm, grote knoppen (48px),
  voortgang per categorie bovenaan, de camera onder één knop.
- **Tussentijds opslaan:** elke wijziging gaat na een korte pauze naar de
  server. Zonder bereik blijft de wijziging in de browser staan (localStorage)
  en gaat ze mee zodra er weer bereik is, met "Nog niet bewaard" in beeld.
  Een volledige offline-app (service worker, synchroniseren met conflicten)
  wordt niet gebouwd: voor één persoon in een tuin met af en toe bereik is
  dit genoeg.
- **Spraak naar tekst** bij elke notitie, met dezelfde Web Speech API als Grønn.
- De inlog is dezelfde als voor het dashboard. Er komt geen aparte
  mobiele toegang of link.

## 5. Foto, video en Claude

**Foto's**
- Meerdere tegelijk, rechtstreeks met de camera (`capture`), of slepen op
  desktop. De browser verkleint tot 1600px JPG zonder metadata (dus zonder
  GPS); dat gebeurt nu al.
- Het origineel bewaren kost veel ruimte en heeft voor een offerte geen
  nut. Standaard alleen de verkleinde versie. Wil Nick het origineel, dan is
  dat één instelling.
- Elke foto kan aan een zone en een vraag hangen, met een bijschrift.

**Video**
- De video gaat rechtstreeks van de telefoon naar Blob (client-upload, geen
  limiet van 4,5 MB per verzoek), privé, met een maximum van 200 MB.
- **De browser haalt de beelden eruit**, met `<video>` en `<canvas>`: één beeld
  per 3 seconden, hooguit 20, plus een beeld waar het beeld sterk verandert.
  Elk beeld krijgt zijn tijdcode. Geen ffmpeg op de server en geen nieuwe
  afhankelijkheid.
- Claude krijgt die beelden met hun tijdcodes en eventuele notities, en
  schrijft een inspectieverslag per zone. Er wordt nergens gezegd dat
  Claude de video zelf bekijkt.
- Gesproken uitleg in de video wordt niet uitgeschreven: de Claude API kent
  geen audio en een spraakdienst is een nieuwe betaalde dienst. Wat Nick
  wil zeggen, spreekt hij in als notitie (spraak naar tekst).

**Analyse**
- "Analyseer met Claude" per foto en "Analyseer locatievideo" per video.
- Claude antwoordt in een vast JSON-schema (structured outputs). De server
  controleert het voordat er iets wordt bewaard.
- Elke bevinding heeft: zone, tekst, **zichtbaar** of **vermoed**, de bron
  (foto-id of beeld + tijdcode) en optioneel een voorgestelde vraag of
  ontbrekende meting. Afmetingen uit een foto heten altijd "schatting, meten".
- Bevindingen komen als **voorstel** in de checklist: Bevestigen, Aanpassen
  of Afwijzen. Pas na bevestigen worden ze een antwoord.

**Gebouwd in fase 3 (29 okt 2026, eenvoudiger dan hierboven):**
- De video zelf wordt niet bewaard. De browser haalt er elke 3 seconden een
  beeld uit (hooguit 20). Die beelden worden opnamefoto's met hun tijdcode,
  dus er is geen client-upload naar Blob en geen limiet van 200 MB nodig.
- Er is geen detectie van sterke beeldwisselingen; de vaste stap is genoeg.
- Foto's hangen aan een zone. Aan een vraag hangen ze niet: dat doet de
  bevinding.
- "Analyseer met Claude" is één knop voor de opnamefoto's die nog niet
  bekeken zijn (hooguit 12 per keer), via `src/lib/crm/ai/beeld.ts` en
  `/api/crm/analyse`.
- De bevindingen staan in `Tuin.bevindingen`, niet in een eigen bestand: ze
  zijn kort.
- Bevestigen zet een voorgesteld antwoord in de intake, via dezelfde weg als
  zelf invullen. Afwijzen bewaart alleen de status.
- Elke aanroep komt met model en tokens in de tijdlijn. Er is nog geen
  maandbudget.
- Volledigheid controleren gebeurt in dezelfde aanroep (de "metingen") plus
  de bestaande Open punten, zonder een tweede aanroep.

## 6. De AI-laag

Eén map `src/lib/crm/ai/`, één bestand per taak, allemaal via dezelfde
aanroep:

| Taak | Invoer | Uitvoer (schema) |
| --- | --- | --- |
| `beeld.ts` | één foto + zone + gekozen diensten | bevindingen |
| `video.ts` | beelden met tijdcodes + notities | verslag per zone + bevindingen + ontbrekende metingen |
| `volledigheid.ts` | intake, maten, bevindingen | open punten: kritiek / belangrijk / advies / optioneel, elk met status Open, In onderzoek, Bevestigd, Afgehandeld |
| `plan.ts` (fase 4) | intake + meetstaat | projectomschrijving, werkvolgorde, risico's, open beslissingen |

Vaste regels, in code en niet alleen in de opdracht aan Claude:
- **Rekenen doet de code.** Claude stelt maten en hoeveelheden voor; de
  rekenhulpen en `reken()` rekenen. Een getal van Claude komt nooit
  rechtstreeks in een prijs.
- **Niets wordt definitief zonder Nick.** Claude verstuurt geen offerte,
  bestelt niets en verandert geen antwoord zelf.
- **Wat Claude ziet:** de tuin, de antwoorden en de foto's. Geen naam,
  telefoon, e-mail of adres van de klant (zoals nu bij Grønn).
- **Logboek en kosten:** elke aanroep komt in de tijdlijn met taak, model en
  tokens. Een maandbudget in tokens; daarboven vraagt de knop eerst of het
  door mag.
- De sleutel staat alleen op de server (`ANTHROPIC_API_KEY`, bestaat al).
- Bij een fout een melding "Analyse lukte niet, probeer opnieuw"; geen
  automatische herhaling die geld kost.

Grønn wordt de projectassistent: hij leest straks ook de intake, de meetstaat
en de bevindingen van de open tuin. Er komt geen tweede chat.

## 7. Wat bewust niet (of later)

| Gevraagd | Besluit | Waarom |
| --- | --- | --- |
| 17 aparte domeinmodellen | 6, zie §3 | één gebruiker op Blob |
| Volledig offline met synchronisatie | lokaal bewaren tot er bereik is | genoeg voor één persoon |
| Tekenen en pijlen op foto's | later | eerst kijken of bijschrift en zone genoeg zijn |
| Spraak uit video uitschrijven | nee, notitie inspreken | API kent geen audio; nieuwe betaalde dienst |
| Origineel van elke foto | instelling, standaard uit | opslag en kosten |
| Gantt met slepen | eerst een lijst met dagen en afhankelijkheden | slepen pas als de lijst gebruikt wordt |
| Aparte chat per project | Grønn leest het project | één assistent |
| Medewerkers en rechten per project | wacht op Postgres (ADR 0001) | er is één gebruiker |

## 8. Fasering

| Fase | Wat | Klaar als |
| --- | --- | --- |
| 1 · Analyse en architectuur | Dit document, ADR 0008–0010, roadmap | Klaar (PR #157) |
| 2 · Intake-engine | Eén checklist (A–J + bestaand), te bewerken in het dashboard; ja/nee/onbekend/n.v.t., notitie, aandachtspunt; vervolgvragen per dienst; snel/uitgebreid/vervolg; zones met maten; tussentijds opslaan; open punten; mobiel eerst | test 1, 2, 6 en 10 uit de opdracht |
| 3 · Media en AI | Meerdere foto's en camera, foto bij zone en vraag; video-upload en beelden in de browser; Analyseer met Claude; bevindingen als voorstel; Controleer volledigheid | test 3, 4 en 5 |
| 4 · Meetstaat | Zones → rekenhulpen → materiaalstaat met formules; materiaalgegevens in de catalogus; "Zet in calculatie"; projectomschrijving en werkvolgorde door Claude | test 7 |
| 5 · Planning en offerte | Werkplanning per fase met dagen, machines en levermomenten; offerte uit de calculatie (bestaat) met werkomschrijving uit het plan | test 8 en 9 |
| 6 · Uitvoering en evaluatie | Project (roadmap fase 3): taken afvinken, uren, meerwerk, voortgangsfoto's, opleverlijst, begroot tegenover werkelijk | |
| 7 · Testen en afronden | Toegang (test 11), rekenlogica, mobiel, prestaties | alle 11 tests |

Elke fase is een eigen PR met tests, en wordt pas samengevoegd als alles
groen is. Het bestaande dashboard blijft werken: oude opnames worden bij het
lezen omgezet, niet in één keer.

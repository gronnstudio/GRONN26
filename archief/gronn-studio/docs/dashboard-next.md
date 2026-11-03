# Het dashboard — wat er nu logisch op volgt

Geschreven 30 augustus 2026, na de ronde die het paneel naar `/dashboard`
verplaatste, het klantportaal opleverde en twee gaten in het intake-archief
dichtte.

Dit is geen wensenlijst. Elk voorstel hieronder is er een waarvan de
**data al bestaat** of waarvan het ontbreken ervan vandaag iets kost.
`nav.ts` zegt het zelf: *"Klanten en Abonnementen arrive with the data
that backs them — en niet eerder."* Voor drie ervan is dat moment nu.

---

## Klaar om te bouwen: de data ligt er al

### 1. Klanten — de tegel die de rail al kent

`ICONS` in de schil heeft `clients` en `hours` al als sleutel, en `nav.ts`
laat ze bewust weg omdat er niets achter zat. Sinds deze ronde wel:
`clients` is een tabel, `/api/admin/clients` maakt en leest dossiers, en
een intake kan eraan gekoppeld worden.

Wat er ontbreekt is het scherm. Eén tabel — naam, adres, telefoon, wanneer
geactiveerd — met per dossier de gekoppelde intakes en documenten. De
onderdelen liggen er alle drie; ze zijn nergens bij elkaar te zien.

**Waarom eerst:** het is de enige plek waar "wie is dit" beantwoord wordt.
Nu staat een klant in het intake-archief, in de documentenlijst en in de
database, en nergens naast elkaar.

### 2. Het urenregister — de tabel die op zijn scherm wacht

`hours` staat in de migratie, met opzet zonder policy: het is het register
van de studio zelf. PR #69 staat al drie weken open en doet het in een
markdown-bestand; `TODO.md` zegt daarover letterlijk *"het hoort niet in
een markdown-bestand"*.

Let op de grens die `HOURS_MANIFEST.md` trekt: dit project mag uren niet
schatten, verzinnen of noemen. Een scherm dat opslaat wat Nick intypt is
precies wat dat document beschrijft — een berekende duur is dat niet.

**Klein te houden:** datum, project, minuten, notitie. Geen timer, geen
automatische registratie.

### 3. Abonnementen en verlengingen

`subscriptions` heeft `renews_at` en een status van drie waarden. Daar
volgt één nuttig scherm uit: wat loopt er, wat verlengt er deze maand, wat
is gepauzeerd. De agenda die er al is, is de natuurlijke plek om een
verlengdatum te tonen.

**Wat het vandaag kost:** een abonnement dat afloopt, ziet niemand.

---

## Kleiner, en de moeite waard

### 4. Van intake naar project, niet alleen naar dossier

Deze ronde koppelt een aanvraag aan een **klant**. `IntakeSubmission` heeft
ook `projectId`, en dat veld heeft nog steeds niets dat het zet. Een
huishouden met twee tuinen is geen uitzondering — dat is de reden dat
`projects` een eigen tabel is.

### 5. Een prullenbak in plaats van een definitieve verwijdering

Verwijderen werkt nu, en het is onomkeerbaar: het record én de foto's
gaan weg. Dat is bewust zo gebouwd, met twee drukken en een expliciete
waarschuwing. Maar de eerste keer dat de verkeerde aanvraag wordt geraakt,
is er niets meer.

Een zachtere variant — het record markeren en de bestanden dertig dagen
laten staan — verandert de knop niet en haalt de scherpe rand eraf.
`AGENTS.md` verplicht sowieso te overleggen vóór het verwijderen van
inhoud; dit is de bouwkundige versie van die regel.

### 6. De doorbel aanzetten

`SLACK_WEBHOOK_URL` staat nog steeds niet in Vercel (`OPERATIONS.md` §1).
Zonder die variabele wordt elke intake wél gearchiveerd, maar krijgt de
studio alleen een e-mail. Geen code nodig — één omgevingsvariabele.

### 7. Het klantportaal heeft nog geen bestanden

Een klant ziet zijn tuinen en zijn abonnementen. Wat hij niet ziet is zijn
eigen offerte of factuur, en dat is waarschijnlijk het eerste waarvoor hij
inlogt. Dat is bewust nog niet gebouwd: documenten liggen in Blob, niet in
Postgres, en er is dus nog geen rij waar een RLS-policy op kan staan. Het
is de volgende echte stap, en hij begint bij de opslag en niet bij het
scherm.

---

## Wat ik expliciet niet zou bouwen

- **Een takenlijst of een teamweergave.** `nav.ts` heeft dit al afgewezen
  en had gelijk: één persoon, geen takenmodel.
- **Grafieken over intakes per maand.** Er zijn er nu enkele tientallen.
  Een grafiek over die aantallen is decoratie die precies zo lang overtuigt
  tot iemand hem serieus neemt.
- **Een CRM-koppeling.** `api/intake/route.ts` legt uit waarom: elke
  gratis laag zet een eigen cookie, en de cookiemelding staat op ijs. Dat
  is eerst een beslissing over die melding.

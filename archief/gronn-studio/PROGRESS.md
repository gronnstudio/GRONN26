# Voortgang — klantportaal, eigenaar-dashboard en het intakespoor

Bijgewerkt: 1 september 2026.

Dit bestand beschrijft wat er in deze reeks werkelijk gebouwd is, in de
volgorde waarin het gebeurde, met de reden erbij. Het is geen
releaselijst: waar iets stuk was staat erbij wát er stuk was en hoe dat
te zien was, want dat is het deel dat over een half jaar nog waarde
heeft.

Wat nog niet af is staat onderaan, met evenveel detail.

---

## 1. Eerst het datalek in de eigen administratie

Voordat er iets bijgebouwd werd, zijn er twee fouten hersteld die stil
gegevens vernietigden.

### De verdwenen bestanden (#98)

De browser en de server rekenden allebei zelf de mapnaam van een intake
uit — en ze deden dat verschillend. Bij **vijf van de negen** realistische
projectnamen kwamen ze op een andere naam uit. De foto's landden dan in
de ene map, het antwoordformulier in de andere, en de controle bij het
opslaan gooide vervolgens elk bestand weg dat niet onder de verwachte map
stond. De studio ontving intakes die zeiden "4 foto's" en er nul bij
hadden.

Er was geen foutmelding, geen waarschuwing en geen falende test. Dat is
precies waarom dit maandenlang kon doorlopen.

De reparatie is één module, `src/lib/intake-reference.ts`, die niets
importeert — daardoor kan de browser, de server én de test dezelfde
functie gebruiken. Er kan geen tweede transformatie meer naast groeien.
`tests/e2e/intake-reference.spec.ts` houdt dat vast en bewaart de twee
oude transformaties als het gedrag dat nooit terug mag komen.

De al verloren bestanden bleken **niet weg**: ze stonden nog in de opslag
onder de verkeerde verwijzing. `readArchive()` herkent zo'n map nu als
wees en biedt hem aan bij de aanvraag waar hij bij hoort;
`reattachOrphan()` koppelt hem terug zonder iets te verplaatsen of te
wissen.

### De offerte die de hele boekhouding kon wissen

`makeQuote` las de documenten uit de modulecache zonder eerst te
`hydrate()`. Op een koude laadbeurt van die route — een bladwijzer, een
verversing, de tegel op het overzicht: geen van drieën opent de
offertebouwer — was die cache nog leeg. De schrijfactie zette dan een
array met alleen het nieuwe concept over élke offerte en factuur heen, en
begon de nummering opnieuw bij `YYYY-0001`.

Nu wordt er eerst gehydrateerd, en er wordt **geweigerd te schrijven**
zolang de leesstatus `error` is. Een mislukte lezing en een leeg archief
zien er in een lege array identiek uit, en maar één van de twee is veilig
om overheen te schrijven.

---

## 2. Het paneel wordt een dashboard

### Verhuizing en vorm (#99, #106, #107)

Het beheerpaneel stond op `/admin` en is één adres geworden:
`/dashboard`. Wie daar komt krijgt wat bij hem hoort — de studio het
eigen paneel, een ingelogde klant het eigen dossier — en dat is géén
`if (isAdmin)` binnen één scherm. Het zijn aparte routes met aparte
API-handlers, om de reden die in de opdracht stond: een gevoelige lijst
mag niet één vergeten voorwaarde van zichtbaar zijn.

De intake-archiefpagina was een accordeon; hij is een werkbank geworden.
Aanvragen links, de hele aanvraag rechts, de lijst blijft staan terwijl
je leest — wat vergelijken van twee aanvragen pas mogelijk maakt.

### Agenda en zoeken (#104)

Beide op gegevens die er al waren, zonder een enkele bibliotheek erbij.
De agenda is een raster van `div`'s met percentages, in de lijn van
`season-year.tsx`; er is bewust geen kalenderpakket toegevoegd voor een
scherm dat twaalf vakjes telt. De zoekbalk kijkt door de intakes en de
documenten die al in de pagina staan.

De agenda markeert intakes op de dag dat ze binnenkwamen — de enige datum
die zegt hoe lang een aanvraag onbeantwoord ligt.

### Cijfers

`src/lib/analytics.ts` staat klaar op een aparte tak: omzet per maand,
gemiddelde offerte, aandeel geoffreerd, aandeel geaccepteerd, doorlooptijd
(mediaan, niet gemiddelde — één uitschieter mag het beeld niet bepalen)
en aandeel betaald.

Wat er **bewust niet** in zit is omzet per dienst. Een document draagt
geen dienst-slug, dus dat getal zou verzonnen zijn. Een dashboard met één
verzonnen cijfer is minder waard dan een dashboard zonder.

---

## 3. Het intakespoor gerepareerd

### De upload zegt wat er misging (#100, #103)

De browser accepteerde alles wat met `image/` of `video/` begon; de
tokenroute op de server hield een eigen vaste lijst van elf types aan.
Een bezoeker kon dus een GIF, een AVIF, een TIFF of een Live Photo in het
bakje zien verschijnen, veertig vragen invullen, en aan het eind te horen
krijgen dat de upload geweigerd was — zonder te horen wélk bestand, of
waarom.

`src/lib/intake-uploads.ts` is nu de enige lijst, geïmporteerd door beide
kanten. Twintig types, een fotoplafond van 12 MB en een videoplafond van
150 MB. Sinds #103 bewaart het record ook de échte foutmelding van de
opslag, in plaats van alleen een aantal.

### De map die de server benoemt

De tokenroute is publiek — het formulier dat hij bedient is dat ook. Tot
deze wijziging kwam de mapnaam uit de projectnaam van de bezoeker, wat
betekende dat iemand een token kon vragen voor
`intake/2026-08-30-jansen-tuin/` en in het dossier van een echte klant
kon schrijven. De eigenaar had die bestanden dan als diens bewijsmateriaal
gezien.

De server munt de verwijzing nu zelf: een datum plus 48 willekeurige
bits. Een niet-gemunte naam wordt alleen nog toegelaten in een map waar
nog geen `submission.json` staat — anders zouden formulieren die al open
stonden toen dit landde hun eigen upload niet meer kunnen afmaken, en dat
kostte een echte bezoeker twee bestanden.

### Zeven dingen die de intake stil verkeerd deed (#102)

Uit een tegensprekende audit van 42 agenten op het intakepad kwamen
**30 bevestigde bevindingen en 6 weerlegde**. Zeven zijn er in #102
hersteld. De scherpste: de e-mail die bij een nieuwe aanvraag afgaat
stuurde, zolang Slack niet ingesteld is — en dat is de huidige
configuratie — **12.000 tekens antwoorden van de klant** mee naar
FormSubmit. Die doorbel is nu een melding en niets meer.

### De boundary-storing (#101)

Ik heb hier zelf een productiestoring veroorzaakt. De navigatie gaf
lucide-iconen als *componenten* door van een Server- naar een
Client-Component. Alleen serialiseerbare gegevens mogen die grens over;
een functie kan dat niet. `next build` slaagde en 146 tests slaagden — en
het scherm was stuk voor iedereen die ingelogd was, omdat een test zonder
sessie nooit verder komt dan het inlogscherm.

De reparatie is een string-sleutel (`icon-keys.ts`) in plaats van een
component, en `tests/e2e/panel-boundary.spec.ts` legt vast dat het zo
blijft. De les eronder is structureel: CI kan niets zien wat achter de
Google-login staat, dus wat daar getest wordt zijn **invarianten** in de
broncode, niet pagina's.

---

## 4. De database, dicht bij aanvang (#105)

`supabase/migrations/0001_client_dossier.sql` legt vier tabellen aan:
`clients`, `projects`, `subscriptions` en `hours`. Op alle vier staat
row level security **aan**, met precies drie SELECT-policies.

`hours` heeft er bewust géén. Dat is het urenregister van de eigenaar; er
bestaat geen rol die het via de anonieme sleutel mag lezen, en een tabel
zonder policy is dicht. Dat is de veiligste standaard die er is.

`src/lib/supabase.ts` begint met `import "server-only"`, zodat de
service-role-sleutel — die élke policy omzeilt — nooit in een
browserbundel kan belanden. `tests/e2e/secrets.spec.ts` controleert dat
op de gebouwde chunks, niet op de bron.

---

## 5. Archiveren en het afvoerputje

De aanleiding was direct: er zat helemaal geen verwijderknop op intakes,
offertes en facturen. De uitwerking verschilt per kant, en dat verschil
is het punt.

### Documenten worden gearchiveerd, nooit verwijderd

Art. 52 AWR legt zeven jaar bewaarplicht op een factuur. Een knop die er
echt een weggooit is een knop die de boekhouding kan beschadigen. Wat de
eigenaar werkelijk wil is dat een oude regel niet meer in de weg staat —
en dat is wat archiveren doet.

`archivedAt` is optioneel, zodat elk bestaand document ongemoeid laadt.
`active()` staat op één plek in plaats van als filter bij elk van de vier
leesplekken; de plek die het vergeet zou een gearchiveerde factuur terug
in een totaal zetten. De tabel is de énige die het archief te zien
krijgt, via een aparte prop — de tegels, de agenda en de zoekbalk lezen
`active()` en kunnen er niet per ongeluk in gaan tellen.

### Intakes gaan eerst in het afvoerputje

De knop bij een aanvraag zette tot nu toe meteen `DELETE` in werking: één
muisklik tussen een misgerichte cursor en de enige kopie die de studio
heeft van iemands tuin.

Hij zet nu `deletedAt`. De aanvraag verlaat de lijst en wacht onder
**`/dashboard/afvoerputje`**, waar terugzetten altijd kan en definitief
weggooien een tweede, aparte beslissing is — genomen vóór een telling van
wat er verdwijnt. Die telling doet het werk: "weet je het zeker" zegt
niets, "én de 7 foto's die eronder staan" houdt iemand tegen die vergeten
was dat de foto's de enige kopie waren.

`deleteSubmission()` zelf is niet aangeraakt. De afscherming was nooit het
probleem — de map wordt uit de verwijzing herbouwd en niet uit paden die
de aanroeper aanlevert, en de paging van `list` wordt afgelopen zodat een
halve verwijdering geen foto's laat staan. De enkele klik was het
probleem.

Dat definitieve pad is meteen het **AVG-verwijderrecht** dat de audit als
volledig ontbrekend aanmerkte. Het is nu de enige plek in het hele paneel
waar iets onherstelbaar wordt, en dat hoort zo.

---

## 6. Wat er nu open staat

### Wacht op Nick

- **Eén testinzending mét bestanden.** De uploadfout is nog niet opgelost
  en drie theorieën zijn inmiddels weerlegd: het verschil in
  verwijzingen (hersteld, was het niet), de typelijst (hersteld, was het
  niet) en het oude tabblad (hersteld, was het niet). Sinds #103 bewaart
  het record de echte foutmelding van de opslag — één inzending maakt
  zichtbaar wat er werkelijk gebeurt.
- **Resend.** De SMTP-instellingen staan inmiddels in Supabase. Wat er
  nog bij hoort: het domein `gronn.studio` moet in Resend geverifieerd
  zijn (Domains → DNS-records), anders weigert Resend te verzenden. En
  in Supabase → Authentication → URL Configuration moeten de site-URL en
  de redirect-URL's op `https://gronn.studio` staan, anders wijst de
  bevestigingslink naar localhost.
- **Eén offerte afdrukken**, om te zien of het printvel klopt.
- **De vier privacypassages uit #102**, en de aanpassing van `/privacy`
  en `/voorwaarden` aan het klantportaal. Bewust niet zelf juridisch
  ingevuld.
- **Echte projecten en echte foto's.** Alles in
  `src/lib/data/{projects,journal,services}.ts` is nog verzonnen
  plaatsvervanging.
- **Urenregister (#69).** Gebouwd voor de eigenaar, maar het vult zich
  met cijfers die hij zelf intypt. Het project mag geen uren stellen of
  schatten — dat staat in `HOURS_MANIFEST.md` en dat blijft zo.

### Nog te doen aan mijn kant

- **De Cijfers-tak verplaatsen** van `/clients/admin/analytics` naar
  `/dashboard/analytics` en `f31b911` opnieuw op main zetten. Nog niet
  samengevoegd.
- **Het logboek.** Elf PR's op één dag en geen regel documentatie,
  terwijl `AGENTS.md` §7 en §8 het allebei voorschrijven.
  `OPERATIONS.md` klopt niet meer in §1, §2, §6, §8 en §12. Dit bestand
  vervangt dat niet — het is de aanloop ernaartoe.
- **23 openstaande bevindingen** uit de audit. De scherpste twee:
  `bg-accent` met `text-gronn-white` haalt 1,15:1 op vijf paletten,
  Blue Hour inbegrepen; en `/contact/intake` is nooit door de
  axe-controle gegaan.
- **#93** ligt er nog, bewust niet samengevoegd: dat is het auditrapport
  zelf, geen wijziging.

---

## Wat hierbij hoort te weten

**De poort** is `tsc` → `eslint` → `check-contrast` → `next build` →
`playwright`. Lokaal draaien mét `NEXTAUTH_SECRET` gezet en op een verse
poort 3210: `reuseExistingServer` hergebruikt anders een oude server, en
dat kostte een vals alarm van 39 fouten dat bijna als bevinding gemeld
werd. Op main stond de teller op 266 groen; met deze wijziging op 286.

**Wat CI structureel niet kan zien** is alles achter de Google-login. Er
wordt daarom getest op invarianten in de bron —
`panel-boundary.spec.ts`, `intake-reference.spec.ts`, `secrets.spec.ts`,
`archive-and-drain.spec.ts` — en niet op schermen. Dat is een bewuste
keuze en geen tekortkoming die nog ingehaald moet worden.

**Contrast** wordt op 122 paren gecontroleerd. Let op: Lighthouse meet
alleen de rusttoestand. Een `:hover`- of `:active`-kleur die het nooit
ziet kan alsnog zakken — zo stond wit-op-Signal-Ember op 2,99:1 onder een
score van 100.

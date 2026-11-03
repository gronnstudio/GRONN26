# 26 augustus 2026 — Deel 5, prijzen, en de navigatie opnieuw

Een dagverslag voor later. Wat er gebouwd is, waarom, wat er misging, en
wat er open bleef. Geschreven om over jaren nog te kunnen reconstrueren
waarom iets is zoals het is — de commits vertellen het *wat*, dit
vertelt het *waarom* en het *bijna niet*.

Alle tijden zijn UTC. Alle PR-nummers verwijzen naar
`gronnstudio/gronn-studio`.

---

## 0. Waar de dag mee begon

Nick leverde `GRONNverdienmodellen.pdf` aan — een intern werkdocument van
48 pagina's over verdienmodellen. **Deel 5** daarvan (§5.1–5.8) gaat over
website-implementatie. De opdracht: lees het, en stel voor hoe de site
uitgebreid moet worden.

De eerste pdf was de verkeerde (een KVK-wijzigingsformulier). Dat is het
soort ruis dat je over drie jaar niet meer terugvindt maar dat wel
verklaart waarom er twee leesronden in de geschiedenis staan.

---

## 1. PR #75 — Gepubliceerde prijzen en een pagina per dienst

**Gemerged als `cbb8a09`.**

Deel 5 stelt dat de site prijzen moet tonen. Dat was de grootste
inhoudelijke stap van de dag.

### Wat er gebouwd is

- **`src/lib/data/pricing.ts`** — gepubliceerde consumentenprijzen,
  gesleuteld op dienst-slug, **inclusief btw**.
- **Vijf seizoensdiensten** toegevoegd: `leaf-net`,
  `pond-autumn-service`, `winterising`, `pond-survey`,
  `maintenance-subscription`. Daarmee ging de praktijk van zes naar elf
  diensten, in twee families.
- **`SERVICE_GROUPS`** in `services.ts` — de tweedeling *ontwerp en
  aanleg* versus *seizoenswerk*, met per familie één zin uitleg.
- **`src/lib/werkgebied.ts`** + `postcode-check.tsx` — een
  postcodecontrole vóór de boekingsstap.
- Elf taglines van vier tot zes woorden ("Vóór de bladval", "Gemeten,
  niet geraden").

### De beslissing die uitleg verdient

Prijzen zijn **bewust géén veld op `Service`**. De inline-editor in
`/editor` bewerkt alleen `{en, nl}`-waarden; een getal in het
contentdocument zou half-bewerkbaar in Blob stranden. Prijzen zijn
bedrijfsbeslissingen — die horen in een commit met een review, niet in
een live editor. De *tekst* rondom een prijs blijft wel bewerkbaar.

Let ook op de asymmetrie met `src/lib/documents.ts`: in `/admin` zijn
regelbedragen **ex** btw en wordt `vatRate` op het subtotaal toegepast.
Op de site zijn ze **inclusief**, want dat is wat een particulier ziet.

### Waarom de verrekenregel is zoals hij is

Bij `garden-design`: de helft van het ontwerpbedrag wordt verrekend met
de eerste factuur bij aanleg. **Nooit alles** — een ontwerp dat gratis
wordt, leert iedereen dat het denkwerk niets waard was.

---

## 2. PR #76 en #77 — Het mega menu

**Gemerged als `b38e8a5` en `3bfacaf`.**

Aanleiding, letterlijk van Nick: *"alles is beetje weg gemoffeld nu."*
Elf diensten zaten achter één woord in de balk.

Twee bevindingen die dat onderbouwden:

1. **De tabletweergave had geen navigatie.** De dock was `md:hidden`
   (weg vanaf 768px), de inline-nav `hidden lg:flex` (pas vanaf 1024px).
   Tussen 768 en 1024px stond er alleen een hamburger. Dat was een gat,
   geen ontwerpkeuze.
2. **De balk mengde vier soorten bestemmingen** zonder één regel uitleg.

#76 bouwde het mega menu en dichtte het tabletgat. #77 gaf het de vorm
van een zwevende kaart in plaats van een strook over de volle breedte —
op verzoek, met GitHub's platform-menu als referentie. Een kaart leest
als een object dat je opende; een strook leest als deel van de pagina.

**Referentie die niet te halen was:** Nick vroeg om naar biovijver.nl te
kijken. Het netwerkbeleid van de bouwomgeving blokkeerde dat domein
(`CONNECT tunnel failed, response 403`). Gemeld in plaats van geraden;
Nick stuurde screenshots.

---

## 3. PR #78 — Ingangen volgen de tweedeling

**Gemerged als `0367956`.**

Drie vragen in één ronde:

1. **Het aanvraagformulier splitst.** Stap 1 was een vlakke lijst van
   zeven projecttypen, stap 2 nog eens zeven situaties — allebei
   geschreven vóór de praktijk in tweeën ging. Nu: eerst welke helft,
   dan welke dienst met vanaf-prijs.
2. **De contactpagina herhaalde de footer.** E-mail, telefoon, naam,
   adres, KVK en BTW stonden twee keer binnen één scherm. Weg. Het
   paginalabel ging van "Start een project" naar "Begin hier", omdat de
   pagina nu ook een klus met een datum boekt.
3. **Admin naast Editor**, onder een eigen kop "Alleen voor de
   eigenaar", en één regel uitleg bij elk menu-item.

### Twee correcties die tijdens de review binnenkwamen

- **De postcode sprak zichzelf tegen.** Het veld zei "vier cijfers is
  genoeg" en toonde `6171 GB` als voorbeeld — cijfers *en* letters.
  `checkPostcode()` leest alleen `/^(\d{4})/`, dus de instructie klopte
  en het voorbeeld was fout. Nick: *"slordig!"* Terecht.
- **De ronde hoeken werden een stap ruimer**, gezet in het
  `@theme`-blok van `globals.css` in plaats van met de hand over ~55
  `rounded-*`-utilities. `rounded-lg` ging van 8 naar 14px.
  `rounded-full` bleef ongemoeid.

---

## 4. PR #79 en #80 — De admin-link, twee keer

Dit is de leerzaamste episode van de dag.

### De fout

#78 zette `/admin` in de footer, de curtain én de dock — maar voegde hem
niet toe aan `UNLOCALIZED` in `src/lib/locale.ts`. `LocaleLink` zet een
taalprefix voor elk intern pad dat niet in die lijst staat. Elke
Nederlandse bezoeker die erop klikte kwam op `/nl/admin`, een 404.

**Waarom het door de review kwam:** `localePath("en", …)` laat het pad
met rust. In het Engels werkte het gewoon. De screenshots waren Engels.

### De halve fix (#79, `57d2306`)

`/admin` toegevoegd aan `UNLOCALIZED`, plus drie regressietests die de
href in **beide talen** vastpinnen.

Eén test werd geschreven en weer **weggehaald**: een assertie dat beide
routes onder de 400 antwoorden. `/editor` geeft 500 in CI, waar NextAuth
geen credentials heeft. Dat is de omgeving, niet de route — en een
assertie die faalt om een reden die hij niet benoemt is slechter dan
geen assertie.

### Waarom dat niet genoeg was (#80, `d092ab9`)

Nick liep er meteen opnieuw tegenaan. De fix repareerde de *links*; wie
`/nl/admin` uit zijn geschiedenis of een bladwijzer haalde kreeg nog
steeds de 404. De middleware kende de owner-tools alleen in hun
onprefixte vorm.

Nu strippen we de prefix en redirecten met een 308, via dezelfde
`isUnlocalized()` die `LocaleLink` leest — zodat de twee het nooit meer
oneens kunnen zijn.

**De les, voor later:** een fix die alleen de bron van een kapotte URL
dichtzet en niet de URL zelf, is een halve fix. Bladwijzers en
browsergeschiedenis bestaan.

---

## 5. De navigatie opnieuw — #80 en #81

### De waarneming die het startte

Nick, over het bureaubladmenu: *"is het hamburger menu niet dubbelop met
het menu boven in de balk?"*

Hij had gelijk. De curtain-knop was `md:flex` — hij bestond alleen op
desktop en tablet, precies waar de balk de links al toonde. Twee menu's
die op hetzelfde scherm hetzelfde deden.

### De blokkade die dat niet triviaal maakte

De curtain was de **enige plek op desktop** waar `DefaultThemeToggle`,
`ThemeToggle` en `PrivacyToggle` woonden. Hem uitzetten zou die
bediening spoorloos maken.

### Twee varianten, en waarom er maar één overbleef

Op verzoek zijn er twee gebouwd om naast elkaar te zien, achter een
tijdelijke `?nav=`-schakelaar:

- **A** — elk balkitem opent zijn eigen paneel (GitHub-stijl).
- **B** — de balk blijft, de hamburger wordt het woord "Overzicht" met
  één breed paneel eronder.

Nick koos vervolgens iets anders dan A of B: *"zorg dat alle sub items
verdeeld worden onder 5 hoofditems, doe dit voor desktop, tablet, en
mobiel."* Dat maakte A automatisch de winnaar — B stopt de hele site
achter één woord, het tegenovergestelde van vijf secties — en B werd in
#81 verwijderd.

### Wat er in #81 staat

Vijf secties: **Studio · Diensten · Projecten · Journaal · Contact.**
Eén boom in `src/lib/nav.ts`, gelezen door de balk, de telefoonsheet en
de footer.

Daarvóór had elk van die drie een eigen array, en ze waren al uit elkaar
gelopen. De dock zette Projecten en Contact tussen Privacy en
Voorwaarden, als pillen identiek aan die van WhatsApp. `nav.ts` had zelfs
een comment die beweerde dat de dock hem las. Dat deed hij niet.

**Home is bewust geen zesde sectie** — dat is het logo, een merkteken.
**Aanpak is geen hoofditem meer** — het hoort bij Studio en zit in dat
paneel; Contact nam de plek in.

**De telefoonsheet kreeg twee niveaus.** Escape *nest*: op niveau 2 gaat
hij een stap terug en zet de focus terug op de rij die het opende; pas
op niveau 1 sluit hij. Focus springt bij binnenkomst naar de terug-knop,
zodat een schermlezer hoort wáár hij is.

**Iconen alleen op de vijf secties.** Elf dienst-iconen is precies de
"clipart" die CLAUDE.md afwijst, en het mega menu had die vraag al eens
beslecht: het merkteken van een dienst is zijn eigen meetindex 01–11.

---

## 6. Bugs die de tests vonden en het kijken niet

Twee stuks, allebei in de nieuwe navigatie, allebei onzichtbaar bij
handmatig testen:

1. **Hover opende een paneel en de klik erna sloot het weer.**
   `onPointerEnter` zette `openId`, waarna `onClick` het als "al open"
   las en toggelde. Het meest gewone dat iemand met een muis doet.
2. **`AnimatePresence mode="wait"` met vijf voorwaardelijke kinderen**
   hield het binnenkomende paneel tegen tot het vertrekkende weg was, en
   monteerde het daarna nooit. Opgelost met één kaart met een wisselende
   key — wat ook was wat het comment beloofde.

En één contrastfout die er al langer zat: de themaschakelaars gebruikten
`text-muted/70` op 12px → **3.43:1** waar WCAG 4.5:1 vraagt. Ze woonden
alleen in de curtain, en geen enkele axe-scan opende die ooit. Het
paneel dat de curtain verving wórdt gescand, en ving hem.

**Patroon dat zich blijft herhalen:** Lighthouse meet alleen de
rusttoestand. Een `:hover`- of paneelkleur die hij nooit ziet kan gewoon
zakken. Dat is eerder gebeurd met wit-op-Signal-Ember (2.99:1 onder een
score van 100) en nu weer.

---

## 7. De live chat — onderzoek, geen bouw

Nick vroeg om een live chat gekoppeld aan WhatsApp, *"zodat alles op 1
plek binnenkomt."* Hij heeft twee nummers: **+31 6 1811 8013**
(persoonlijk) en **+31 6 1811 8014** (zakelijk).

### Wat het onderzoek opleverde

- **Coexistence (sinds mei 2025)** maakt mijn eerste bezwaar ongeldig:
  één nummer kan tegelijk in de WhatsApp Business-app én op de Cloud API.
  Tot 6 maanden historie is te importeren. **Maar:** open je de app 14
  dagen niet, dan wordt de API-koppeling verbroken. Voor iemand die in
  tuinen staat is dat een reële faalmodus.
- **Vanaf 1 oktober 2026 worden servicegesprekken betaald.** Antwoorden
  binnen het 24-uursvenster, nu gratis, gaan geld kosten. Meta zou de
  tarieven rond 1 september publiceren. **Dit is het cijfer om opnieuw
  te controleren voordat er iets besloten wordt.**
- Nederland is gerapporteerd als de **duurste marketingmarkt ter
  wereld**: circa €0,13–0,15 per marketingbericht.
- **Gedeelde inbox, prijzen:** Chatwoot Cloud ~$19/mnd (WhatsApp inbegrepen
  vanaf de Startups-tier), Chatwoot zelf hosten ~€5/mnd server plus je
  eigen onderhoud, Crisp €95/mnd voor de tier mét WhatsApp, Trengo
  €299/mnd. De Nederlandse opties zijn geprijsd voor een callcenter van
  tien man.
- **AVG:** elke widget voegt een verwerker toe die in `/privacy` moet.
  Meta's *Local Storage* kan data-at-rest in Duitsland pinnen, maar niet
  elke BSP biedt dat aan. Tidio's Amerikaanse moeder betekent
  CLOUD-Act-blootstelling; het EU-VS Data Privacy Framework staat sinds
  de uitspraak *Trump v. Slaughter* (29 juni 2026) onder druk.

### Het advies, en de status

Het advies was: **begin met een contextuele WhatsApp-deeplink**, niet met
een chatvenster. Een widget belooft dat er nú iemand zit; Nick staat in
een tuin. Een chat die vier uur stil blijft leest als een verlaten
winkel.

Nick koos desondanks **optie C** (gedeelde inbox). Dat is zijn
beslissing en die staat. Het bouwen ervan is nog niet begonnen — het
wacht op een apart plan met de stappen die hij zelf bij Meta moet zetten.

---

## 8. Wat er openstaat

| Onderwerp | Stand |
| --- | --- |
| PR #81 | Open, CI draait |
| Live chat (optie C) | Besloten, plan nog niet geschreven |
| Vijverdiagnose (Deel 5 §5.1) | Niet gestart, niet geblokkeerd |
| Deel 5 PR 3/4 | Geblokkeerd op Supabase en Resend + DNS |
| Urenregister (PR #69) | Bewust in de ijskast; moet naar `/admin` |
| Stempel opent de chat | Gevraagd 26 aug; hangt achter de chatbeslissing. Zie `OPERATIONS.md` voor de drie randvoorwaarden |
| **Vercel-plan** | **Opgelost dezelfde dag** — Nick is naar Pro gegaan. Hobby is niet-commercieel gelicentieerd en deze site adverteert een betaalde dienst; dat was dus een licentieschending, geen limiet. |

### Bevindingen die gemeld zijn maar bewust niet gerepareerd

Buiten scope gehouden per AGENTS.md §1 ("nooit ongerelateerde refactors
combineren"), maar ze staan er nog:

- **Het IBAN zit in de client-bundle**, via `business.ts` →
  `privacy-content.tsx` (een client component). Staat live. Input voor
  factuurfraude.
- **Drie privacy-claims kloppen niet meer:** picsum.photos wordt genoemd
  als verwerker (lang geleden verwijderd), "gebruikt geen analytics"
  staat naast een gemonteerde `<SpeedInsights />`, en "twee functionele
  voorkeuren" waar er minstens zeven zijn.
- `src/middleware.ts` staat op Next 16's verouderde conventie
  (hernoemd naar `proxy`).
- De `content-length`-controle in de editor-uploadroute handhaaft niets.
- **De tap-target-test leest `::after`, maar de utility tekent
  `::before`.** De uitzondering werkt dus niet; die controles slagen puur
  omdat hun eigen doos al groot genoeg is.

---

## 8b. #83 — Het tabletgat en de kruimels

### Het tabletgat was mijn eigen regressie

Tussen 768 en 1024px droeg de balk alleen Diensten, is de dock
`md:hidden`, en ging de hamburger die dat gat overbrugde weg met het
volledige gordijn. Netto op een tablet: Studio, Projecten, Journaal en
Contact waren nergens bereikbaar.

**Dit is exact het gat dat #76 in juli dichtte.** Het ging weer open in
#80, omdat de verwijdering van het gordijn op 1280 en 1600 is gemeten en
nooit op 900. Nick vond het door naar een tablet te kijken; geen enkele
test keek naar die band.

`TabletMenu` bestaat alleen daar (`md:block lg:hidden`), staat naast
Start een project, en is een knop met het wóórd "Menu" — regel 1. Hij
opent dezelfde `PanelCard` met alle vijf secties en houdt het
disclosure-contract van de balk: Escape geeft focus terug, wegtabben
sluit, en een resize voorbij `lg` sluit hem, anders ligt hij over een
balk die de secties dan zelf draagt.

De test noemt de breedte hardop: op **900px** wordt eerst vastgesteld dat
de balk de secties níét draagt, dan dat de knop alle vijf opent, en dan
dat er één daadwerkelijk navigeert.

### De site beloofde Google een kruimelpad dat niemand zag

`breadcrumbSchema()` werd op alle drie de detailroutes uitgezonden, met
in zijn eigen docstring de belofte *"search results show the trail
instead of a bare URL"*. Google kreeg dus **Home › Journaal › Artikel**
te zien. Wie op dat resultaat klikte trof op de pagina zelf geen enkel
spoor aan — wel drie ad-hoc terugverwijzingen, op drie plekken, in twee
stijlen:

| Pagina | Wat er stond | Waar |
| --- | --- | --- |
| Journaal-artikel | `← Journaal` | bovenaan |
| Case study | `← Alle projecten` | halverwege |
| Dienst | `Alle diensten` (ghost-CTA) | onderaan |

En erger: elke route schreef dat crawler-array **met de hand**. Niets
controleerde of de gestructureerde data beschreef waar de pagina
werkelijk onder hing.

`trailFor(section, page)` in `nav.ts` is nu de ene bron, en **zowel de
JSON-LD als de zichtbare `<Breadcrumbs>` lezen hem**. De kruimel houdt
zijn Localized label in plaats van een opgeloste string: de
schema-bouwer kent de taal van de pagina die hij stempelt, terwijl het
zichtbare spoor opnieuw moet oplossen als de bezoeker de taal omzet.

Twee details die later raar lijken maar het niet zijn:

- **Het scheidingsteken en de telefoon-chevron zijn getekend, niet
  getypt** (CSS `::before` en een SVG). Een tekstknoop `/` telt mee in de
  toegankelijke naam van de kruimel — en in elke vergelijking van die
  lijst met de JSON-LD, wat de test hieronder meteen liet zien.
- **De laatste kruimel is geen link**, met `aria-current="page"`. Een
  kruimel die naar zichzelf wijst is precies de klikbaarheidsverwarring
  die vanmiddag uit de menu's is gehaald.

De test die ertoe doet leest het `BreadcrumbList`-script uit de pagina,
leest de `<ol>`, en vergelijkt de namen. Dat is de enige assertie die
voorkomt dat de twee ooit weer uit elkaar lopen.

### De footer op dezelfde boom

`nav.ts` beweerde in zijn eigen comment al dat de footer `SECTIONS` las.
Dat deed hij niet: hij had een eigen platte lijst van zeven (Diensten,
Projecten, Aanpak, Journaal, Contact, Techniek, Veldlab op één hoop) én
een tweede kopie van `OWNER`. Nu leest hij allebei uit `nav.ts` en toont
de vijf secties met hun kinderen eronder. `LEGAL` blijft lokaal: privacy
en voorwaarden staan bewust buiten de boom — het zijn verplichtingen,
geen bestemmingen.

---

## 9. Dingen die over drie jaar niet meer af te leiden zijn

- **Het thema volgt de klok van de bezoeker, niet de zonsopgang.** Echte
  zonsopgang vraagt een breedtegraad, en een locatieprompt om een kleur
  te kiezen is een wild disproportionele ruil.
- **Er is geen derde niveau in het telefoonmenu**, met opzet. De
  dienstpagina's zijn zelf het derde niveau.
- **`photo-glass` heeft bewust geen `backdrop-filter`.** `RevealImage`
  animeert `filter: blur()` op een voorouder, en `<Tilt>` geeft
  projectkaarten een 3D-getransformeerde voorouder. Allebei breken een
  backdrop-filter.
- **Het Weergave-icoon is een bewuste afwijking van ontwerpregel 1.**
  Nick vroeg erom; de regel kwam oorspronkelijk ook van hem. Het label is
  verplaatst, niet verdwenen: `aria-label` op de knop, en het woord als
  kop in het paneel.
- **De branch `design/editorial`** bevat een afgewezen herontwerp. Niet
  mergen.

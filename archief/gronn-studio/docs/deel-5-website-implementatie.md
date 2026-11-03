# Deel 5 — Website-implementatie (bouwronde 1)

Uitwerking van Deel 5 uit het interne werkdocument *Verdienmodellen*
(augustus 2026) naar deze codebase. Opgesteld 25 aug 2026.

**Status:** PR 1 (prijzen en dienstpagina's) is gebouwd — zie de tabel onder
*Volgorde*. PR 2 (Vijverdiagnose) is nog open en niet geblokkeerd; PR 3 en 4
wachten op eigenaarsactie, zie *Wat op jou wacht* onderaan.

> **Companion-documenten:** [`roadmap-business.md`](roadmap-business.md) is de
> bredere businessroadmap; dit document verdiept en corrigeert §3.1
> (prijstransparantie), §3.3 (seizoensvoorkant) en §3.4 (intakekwaliteit)
> op basis van het bronmateriaal, en botst bewust met het punt "a client
> portal" onder *Deliberately not doing* — dat is daar afgewezen voor
> ontwerpklanten, terwijl Deel 5 §5.7 het voorstelt voor abonnees. Dat laatste
> valt buiten deze ronde, maar de premisse is veranderd en verdient een
> nieuwe afweging.

## Context

`GRONNverdienmodellen.pdf` is een intern werkdocument van augustus 2026 over
hoe GRØNN Studio het komende jaar geld verdient (sep 2026 – feb 2027).
**Deel 5 (§5.1–5.8) is de website-implementatie**: acht bouwplannen die de
verdienmodellen uit Deel 1–4 op de site moeten landen. Zonder die onderdelen
bestaan de diensten wel, maar kan niemand ze vinden, begrijpen of kopen.

Het probleem dat dit oplost: de site verkoopt vandaag **ontwerp**, in
abstracte termen, zonder één prijs, met één contactformulier als enige
uitgang. De verdienmodellen draaien om iets anders — gestandaardiseerd
seizoenswerk (bladnet, najaarsbeurt, winterklaar), betaalde diagnose, en
uiteindelijk terugkerend inkomen uit onderhoudsabonnementen.

Deze ronde bouwt de **drie onderdelen die vóór 1 november af moeten** (§5.8,
en Deel 7 zet ze in week 1, week 4–6 en week 7–10). De rest — seizoenspagina
`/nu`, Plantenkiezer, abonnementenpagina, klantportaal — is winterwerk en
valt hier expliciet buiten.

Bedoeld resultaat: iemand met een groene vijver kan in november zelf
uitzoeken wat er aan de hand is, ziet wat het kost om het te laten oplossen,
en boekt dat — of vraagt een winterontwerp aan met genoeg informatie erbij
dat er direct een prijsindicatie op kan.

## Vastgestelde keuzes

| Vraag | Besluit |
| --- | --- |
| Scope | §5.3 prijzen, §5.1 Vijverdiagnose, §5.5 aanvraagflow |
| Taal | Volledig tweetalig EN+NL, geen uitzondering op CLAUDE.md |
| Prijzen | Vast voor seizoenswerk, ranges voor ontwerp/aanleg |
| Infra | Supabase (leads) + Resend (mail) |

De infrakeuze is de zwaarste: de repo heeft vandaag géén database en géén
server-side mail. AGENTS.md §1 eist expliciet toestemming voor betaalde
diensten en privacy-relevante wijzigingen — die is hiermee gegeven, maar het
maakt de privacypagina-herziening een verplicht onderdeel van deze ronde,
geen bijzaak.

---

## A · §5.3 — Diensten met vaste prijzen

### Prijsdata

Nieuw bestand `src/lib/data/pricing.ts`, gesleuteld op service-slug:

```ts
export type PriceTier = { label: L; amount: number; note?: L }
export type Pricing = {
  basis: "fixed" | "from" | "range" | "monthly"
  vatIncluded: true          // consumentprijs — dit is wat de klant ziet
  tiers: PriceTier[]
  offset?: L                 // de verrekenregel
}
```

**Bewust géén veld op `Service`.** De verkenning legde de scherpste
beperking bloot: `src/editor/toolbar.tsx:79-122` rendert precies twee
tekstvakken voor `en`/`nl`, dus **een `{en, nl}`-waarde is gratis
bewerkbaar en een getal is helemaal niet bewerkbaar**. Een prijs als
`Service`-veld zou meepubliceren naar het Blob-document en daar
half-bewerkbaar stranden. Een los, gecommit bestand houdt bedragen in code
review — waar ze horen, want een verkeerd gepubliceerde prijs is erger dan
een deploy.

Consequentie, eerlijk gezegd: **je kunt een prijs niet zelf wijzigen zonder
deploy.** De teksten eromheen (wat je krijgt, wat je niet krijgt) zijn wél
gewoon bewerkbaar in `/editor`, want dat zijn `L`-waarden.

`vatIncluded` lost meteen een repo-brede scheefheid op die de verkenning
vond: `/admin` rekent in bedragen **ex** btw, een consumentprijs is **incl**,
en vandaag draagt geen enkel bedrag in de repo die markering.

`euro()` staat nu in `src/lib/documents.ts:112-120` (admin-only). Verhuizen
naar `src/lib/format.ts` en daar hergebruiken, zodat de publieke site niet
het hele geldmodel van de facturenbouwer hoeft te importeren.

### Pagina's

**Nieuw: `/services/[slug]` detailpagina's.** Vandaag bestaan diensten alleen
als ankers op één overzichtspagina (`<article id={slug}>` in
`services-content.tsx`). Deel 5 spreekt van "dienstenpagina's", meervoud, elk
met een eigen boek-CTA — en losse URL's zijn ook de helft van het punt, want
ze kunnen apart ranken. Patroon volledig analoog aan
`src/app/[locale]/projects/[slug]/page.tsx` (`generateStaticParams` over de
slugs; locale komt van de layout erboven).

Meeliften: `src/app/sitemap.ts` uitwaaieren zoals projecten al doen; de
`RELATED_SERVICE`-map in `case-study.tsx:281` en de homepage-kaarten in
`services-overview.tsx:81` van `/services#slug` naar `/services/slug`. De
ankers op het overzicht blijven staan, dus oude links breken niet.
`src/lib/content.ts` krijgt een `getServiceContent(slug)` naast de
bestaande `getProjectContent`/`getArticleContent`, en de detailpagina zet
`breadcrumbSchema()` zoals de projectpagina dat al doet.

Nieuw veld op `Service`: `excludes?: L[]` — het **"wat je niet krijgt"**-blok.
Het document noemt dat het belangrijkste onderdeel van de pagina, en het is
precies de merkstem: *"Wat je niet krijgt: een steriele vijver. Als ik alles
wegzuig, gooi ik de biologie weg en heb je volgend jaar meer algen dan
ooit."* Als `L[]` is het gratis bewerkbaar via het bestaande
`EditableText`-pad-idioom (`services.slug:<slug>.excludes.<i>`), zonder één
regel editorwijziging. Wel `content/site-content.json` opnieuw genereren met
`npx tsx scripts/export-content.ts` in dezelfde commit.

### Werkgebied

Nieuw `src/lib/werkgebied.ts` — viercijferige postcodes, `checkPostcode()`
geeft `"binnen" | "buiten" | "ongeldig"`. Er is vandaag **geen enkele**
postcode-, regio- of afstandslogica in de repo. Staat vóór het boekformulier:
buiten het gebied volgt de eerlijke tekst uit §5.3 in plaats van een
formulier. Dat scheelt volgens het document elke week een paar ritten van
anderhalf uur voor een klus van €150.

Hetzelfde bestand corrigeert een bestaande overclaim: `schema.ts:50` zegt nu
`areaServed: Country/Netherlands`, wat voor onderhoudswerk niet waar is.

### Structured data

`serviceCatalogueSchema()` krijgt een `priceSpecification` per Offer —
puur additief binnen één `.map()`. Let op de bindende kopregel in
`src/lib/schema.ts:11-17`: *"Nothing is invented: no coordinates, **no price
range**…"* Die regel bestond omdat er geen echte prijzen wáren; nu zijn ze
er. De kopregel moet in dezelfde PR worden bijgesteld, anders spreekt het
bestand zichzelf tegen.

---

## B · §5.1 — De Vijverdiagnose

Route `/vijvercheck`, in beide talen dezelfde padnaam — precedent is
`/voorwaarden`, dat ook Nederlands is voor beide locales.

**Vragen** in `src/lib/data/diagnose.ts` met **stabiele sleutels**:

```ts
{ id: "probleem", label: L, options: [{ key: "groen-water", label: L }, …] }
```

Dit repareert meteen een bestaande fout: `ChipGrid` in
`intake-form.tsx:83` gebruikt **`option.en` als waarde** — de Engelse string
ís de sleutel. Dat is broos (hernoem een label en je data verschuift) en
voor een deelbare diagnose-URL onbruikbaar.

**Regels** in `src/lib/diagnose-rules.ts` als één pure functie
`diagnose(answers): Diagnosis` — geen React, geen i18n, geeft regel-id's en
urgentie terug; de teksten liggen los, gesleuteld op regel-id. De vijf regels
die het document uitschrijft zijn de eerste vijf entries (te veel licht bij
weinig begroeiing; voedingsophoping bij nooit ontslibd; externe
voedingstoevoer bij gazon eromheen; zuurstoftekort bij ondiep + veel vis,
gemarkeerd urgent; en lekkage als aparte tak die altijd naar een
doorlichting leidt, want dat diagnosticeer je niet online).

**Testen zonder unit-runner.** De repo heeft alleen Playwright e2e. In plaats
van een testframework toevoegen: `scripts/check-diagnose.mjs`, een tabel van
invoer → verwachte regel, exit non-zero bij afwijking, in
`.github/workflows/quality.yml` naast `check-contrast.mjs`. Dat is exact het
huisidioom (`check-contrast.mjs`, `check-locales.mjs`) en kost geen
dependency.

**Deelbaar resultaat**: antwoorden in de querystring, resultaatpagina draait
dezelfde pure functie opnieuw. Deterministisch, tweetalig via `localePath`,
en er is geen opslag nodig om een link te kunnen delen — wat het document als
verspreidingsmechanisme noemt (mensen sturen dit door in Facebookgroepen).

**Geen e-mailmuur.** Resultaat direct tonen; het e-mailadres wordt pas
daarna gevraagd, voor het volledige PDF-rapport. Het document rekent voor dat
een muur vóór het resultaat 70% van de bezoekers kost en als een truc voelt.
De drie blokken staan vast: wat er waarschijnlijk aan de hand is (mét de
onzekerheid erin) → wat je zelf kunt doen (niets achterhouden) → wanneer het
slimmer is iemand te laten kijken (doorlichting €195, verrekenbaar).

---

## C · §5.5 — De ontwerpaanvraag-flow

Uitbreiding van `src/components/contact/intake-form.tsx`. Drie dingen die
daar nu stuk zijn en meteen meegaan:

1. **De uploadstap is een fopspeen.** `onChange` doet
   `.map(f => f.name)` en gooit de `File`-objecten weg — er is nooit één foto
   verstuurd. Het document noemt dit juist het belangrijkste veld.
2. **Geen e-mailvalidatie.** De velden staan niet in een `<form>`, dus ook de
   native validatie draait niet.
3. **Stapanimatie op `duration: 0.3` zonder `useReducedMotion()`** — een
   overtreding van ontwerpregel 4 in CLAUDE.md.

Velden erbij conform §5.5: m²-schuifbalk (patroon:
`before-after.tsx:121`, de enige bestaande control met `aria-valuenow` en
toetsenbedediening), budgetband als chips in plaats van vrije tekst,
oplevermoment, postcode via `werkgebied.ts`, en **"hoe kwam je hier
terecht?"** — dat laatste voedt ook het doorverwijsprogramma uit §3.2, dat
zonder registratie bij binnenkomst niet werkt.

Budget wordt zacht gevraagd, met de formulering uit het document erbij: een
vijver van €3.000 en een van €15.000 zijn twee verschillende ontwerpen.

**Foto's**: Supabase Storage, private bucket, met een **kortlevende signed
upload-URL** uit de API-route. De browser PUT't rechtstreeks naar de opslag,
dus de bytes raken de Vercel-functie nooit. De audit maakt duidelijk dat dit
niet één keuze maar vier problemen tegelijk oplost, en dat de bestaande
Blob-route echt niet geschikt is:

- De size-check in `api/editor/upload/route.ts:20-23` **handhaaft niets**:
  `Number(header ?? 0)` laat chunked, ontbrekende én niet-numerieke
  content-length allemaal door (`NaN > MAX` is `false`). Daarna buffert
  `:28` de hele body in het functiegeheugen. En de geadverteerde 8MB ligt
  boven Vercels eigen ~4,5MB body-limiet, dus de grens klopt in beide
  richtingen niet.
- `api/img/[...path]` heeft een deugdelijke traversal-guard maar **geen
  enkele autorisatie**: alles onder `images/` gaat naar iedereen die het pad
  kent. Sleutels zijn `Date.now()-originele-bestandsnaam` met
  `addRandomSuffix: false` — en telefoonbestandsnamen zijn voorspelbaar.
- Diezelfde route zet `Cache-Control: public, max-age=31536000, immutable`.
  Voor een foto van de eigenaar is dat prima. Voor een foto van andermans
  huis bij een verwijderverzoek is het een defect: de blob wissen haalt de
  CDN-kopie niet weg.
- Of een upload publiek of privé landt, wordt nu **afgeleid uit een
  opgeslokte exception** (`upload/route.ts:32-46` probeert eerst `public`,
  valt in een lege `catch` terug op `private`). Dat is het enige patroon in
  deze repo dat ik voor bezoekersfoto's onder geen beding zou overnemen —
  dat hoort een expliciete configuratiekeuze te zijn.

Client-side eerst verkleinen naar max ~2000px en hercoderen naar JPEG via
`canvas.toBlob()`. Dat lost de 12MB-vakantiefoto op waar het document voor
waarschuwt, én HEIC van iPhones dat de bestaande allowlist weigert — en het
**stript EXIF**, wat hier geen bijvangst is maar een privacymaatregel: een
tuinfoto draagt routinematig GPS-coördinaten van iemands woonhuis, en met de
postcode erbij is dat een klein, scherp dataset over identificeerbare
huishoudens. Serverkant daarna verifiëren op magic bytes in plaats van op de
`content-type`-header, die de client zelf verzint. Geen extra dependency
nodig.

---

## D · Infrastructuur

**Supabase** — `src/lib/supabase.ts`, server-only, service-role sleutel
nooit in de browser. Tabellen `vijvercheck_leads` (antwoorden als `jsonb`,
zodat je over een jaar kunt zien welke problemen het meest voorkomen — gratis
marktonderzoek, zoals het document terecht opmerkt) en `ontwerpaanvragen`.
RLS standaard alles dicht; schrijven uitsluitend via de service-role uit de
API-route.

**Misbruikbescherming.** Dit worden de **eerste niet-geauthenticeerde
schrijfroutes in deze repo** — er is vandaag geen rate limiting, geen CAPTCHA,
geen CSRF-laag, en de enige verdediging is de honeypot in het contactformulier.
Maar de audit corrigeert het uitgangspunt: **je exploiteert vandaag al een
niet-geauthenticeerde schrijfroute naar je inbox.** `formsubmit.co/ajax/…`
is door iedereen aan te roepen, met `_captcha: "false"` hardcoded in de
client (`intake-form.tsx:212`) — en de honeypot beschermt een pad dat een
spammer nooit loopt, want die laadt je pagina helemaal niet. Naar een eigen
endpoint gaan is dus **winst, geen ruil**: validatie, rate limiting,
retentie, logging en een echte verwerkersovereenkomst worden voor het eerst
van jou. Wat je opgeeft is de eigenschap "er raakt nooit persoonsgegeven
onze server" — en dat is een privacy-*tekst*-probleem, geen beveiligingsstap
terug.

Het dreigingsbeeld is bovendien niet een gerichte aanvaller maar
commodity-formulierspam en **kosten- en quota-misbruik**: Supabase-opslag,
Resend-verzendlimiet, Vercel-invocaties. Ontwerp voor "vierduizend junkrijen
en een rekening", niet voor inbraak.

Voorstel, in volgorde van opbrengst per eenheid moeite: signed uploads (zie
hierboven) · serverkant-validatie die de client vijandig veronderstelt
(lengtecaps op elk vrij tekstveld, enum-checks, hard maximum van 6 bestanden)
· rate limit op IP + endpoint · honeypot behouden **plus een
minimum-invultijd** (een formulier dat binnen drie seconden binnenkomt is een
bot — gratis, onzichtbaar, en het vangt het overgrote deel) · harde plafonds
(Resend-dagcap, Supabase-quota, alert) · en **een retentietaak vanaf dag
één**, want verwijdering achteraf op data die je al hebt verzameld
retrofitten is veel erger dan hem meteen bouwen.

Voor de rate limit is de goedkoopste oplossing geen code: **Vercel Firewall
draait op de edge, kost geen invocaties en vraagt geen dependency** — maar
het is Pro-tier, wat weer aansluit op het openstaande plan-punt. Blijf je op
Hobby, dan een teller in Supabase; onthoud dan dat een IP-limiter een IP
opslaat, dus hashen en in uren bewaren, niet in maanden.

**Turnstile niet in v1.** Het is gratis en Cloudflare is al de DNS-zone, maar
het zou het **eerste externe script op deze site** zijn, het dwingt de CSP
open die nog niet eens gefaseerd is, het is een nieuwe verwerker in een
privacyverklaring die toch al herschreven wordt, en het wordt een
beschikbaarheidsafhankelijkheid op precies je twee conversiepaden. Er is ook
een consistentie-argument: Turnstile op de nieuwe routes zetten terwijl de
oude FormSubmit-deur met `_captcha: "false"` openstaat is theater. Eerst
meten hoeveel rommel er werkelijk binnenkomt, dan pas — en alleen op het
endpoint dat aantoonbaar misbruikt wordt.

**Alles daarvan moet ín elke `route.ts`.** De Next 16-documentatie is hier
expliciet: de middleware-matcher in `src/middleware.ts:46` sluit `api` uit,
en *"a matcher change or a refactor… can silently remove Proxy coverage —
always verify authentication and authorization inside each Server Function
rather than relying on Proxy alone."* Er is bovendien **geen
framework-bescherming voor route handlers**: *"Route Handlers are public HTTP
endpoints. Any client can access them."* Server Actions krijgen wel een
ingebouwde origin-check, route handlers niet. Een rate limit in de middleware
zou dus precies niets doen.

Ook goed om te weten: Next 16 documenteert **geen body-size-limiet voor route
handlers**. De enige getallen in de docs zijn 1MB voor Server Actions en een
10MB proxy-buffer — allebei niet van toepassing. De caps zijn dus volledig
mijn verantwoordelijkheid.

**`after()` gebruiken.** `import { after } from "next/server"` is stabiel
sinds 15.1 en de docs bevelen precies dit geval aan: werk dat de respons niet
mag blokkeren, zoals loggen en mail versturen. De bezoeker krijgt zijn
diagnose dus meteen; de rij in Supabase en de Resend-mail gaan erna. Eén
valkuil om af te vangen: `after` draait **ook als de respons faalde** ("even
if the response didn't complete successfully"), dus dat moet ik zelf gaten.

De documentatie schrijft voor uploads bovendien exact het patroon voor dat ik
hierboven koos: *"upload them from the browser and store the returned URI in
your database to reduce request size."*

**Resend** — vervangt FormSubmit. CLAUDE.md verbiedt FormSubmit *server-side
te relayen* (datacenter-IP's krijgen 403, bewezen 19 juli 2026). Dat verbiedt
niet een andere transportlaag die wél server-side werkt. Resend is precies het
doel dat OPERATIONS.md §9 en AGENTS.md §2 al benoemen, en het is de enige
manier om de automatische bevestigingsmail te krijgen die §5.5 vraagt. De
`mailto:`-terugval blijft staan. De FormSubmit-alinea in CLAUDE.md moet in
dezelfde PR mee, anders klopt die notitie niet meer.

### Next 16-conventies (uit de gebundelde docs, niet uit geheugen)

- Route handlers zijn **niet gecachet** by default; een `POST` is dynamisch
  zonder opt-out. Geen segment-config nodig.
- `params` is een **Promise** en moet worden ge-`await`. Next 16 heeft
  bovendien een globale `RouteContext<'/pad'>`-helper die niet geïmporteerd
  hoeft te worden.
- `server-only` bovenaan de Supabase-module; de docs beschrijven precies de
  Data Access Layer die ik hierboven voorstel, inclusief "geef DTO's terug,
  geen ruwe rijen". Omdat deze repo ESLint draait is `npm i server-only`
  aan te raden, anders klaagt de extraneous-dependency-regel.
- `generateStaticParams` alleen voor `slug` declareren onder de bestaande
  `[locale]`-layout is het gedocumenteerde top-down-patroon — dus
  `/services/[slug]` mag exact het projectpatroon kopiëren.

Twee dingen die de verkenning terloops opleverde en die **niet** in deze PR's
horen (AGENTS.md §1 verbiedt losse refactors mee te liften), maar wel gemeld
moeten worden:

1. **`src/middleware.ts` staat op een afgeschafte conventie.** Next 16 heeft
   `middleware` hernoemd naar `proxy`; er is geen `middleware.md` meer in de
   docs. Het werkt nog, maar het is een aparte opruim-PR waard.
2. **`next/image` `qualities` is in 16 teruggebracht tot `[75]`** en
   `minimumCacheTTL` van 60s naar 4 uur. Dat kan het gerenderde beeld
   veranderd hebben — de moeite van een blik waard op een site die op
   fotografie leunt.

---

## E · Privacy en voorwaarden — verplicht, zelfde PR

Deze claims worden onwaar zodra dit live gaat:

| Plek | Huidige tekst |
| --- | --- |
| `privacy-content.tsx:98-100` | "niets wat je op deze site invult wordt op onze servers opgeslagen" |
| `privacy-content.tsx:42` | "are not stored in a database by us" |
| `privacy-content.tsx:64` | verwerkerslijst kent alleen Vercel + FormSubmit — en noemt nog picsum.photos, dat al weg is |
| `cookie-notice.tsx:75` | "your data stays in your own garden" |

Erbij: Supabase en Resend als verwerkers (met regio/derde land), een
bewaartermijn voor leads én foto's, een verwijderroute, en de "laatst
bijgewerkt"-datum. De opsomming van wat er verzameld wordt noemt nu geen
foto's en geen diagnoseantwoorden — dat moet erbij.

**Drie claims zijn nu al onwaar, vóór er één regel geschreven is:**

- `:64` noemt **picsum.photos** als externe beeldverwerker, terwijl
  `next.config.ts:6-7` zegt "Picsum is gone" en beeld zelf gehost wordt.
- `:55` zegt *"uses no analytics"*, maar `<SpeedInsights />` staat gemonteerd
  op `layout.tsx:126`. Cookieloos en IP-truncerend, dus verdedigbaar — maar
  "geen analytics" leest een bezoeker anders.
- `:55` zegt *"two functional preferences"*. Het zijn er zeker zeven:
  `gronn-theme`, `gronn-theme-mode`, `gronn-privacy-blur`, `gronn-intro`,
  `gronn-cookies-noted`, `gronn-locale` en `gronn-editor-hint`.

Los daarvan: FormSubmit staat wel als verwerker genoemd, maar er is **nergens
een verwerkersovereenkomst** naar verwezen. Dat is een bestaand AVG-gat, los
van dit plan.

`/voorwaarden` krijgt gepubliceerde prijzen, de geldigheid daarvan, de
verrekenregels (50% van het ontwerp, doorlichting bij opdracht >€750), wat
een vaste prijs wel en niet omvat, en dat een verwaarloosde vijver pas na
inspectie geprijsd wordt. Let op: OPERATIONS.md §1 heeft `/voorwaarden` al
staan als **ongetoetst concept** — dit maakt het juridisch zwaarder, niet
lichter.

---

## Volgorde

| PR | Inhoud | Geblokkeerd? |
| --- | --- | --- |
| 1 · prijzen ✅ | `pricing.ts`, `format.ts`, `Service.excludes` + `kind`, `/services/[slug]`, `werkgebied.ts`, schema, sitemap, voorwaarden | Nee — gebouwd |
| 2 · `feat/vijvercheck` | vragen, regels, `check-diagnose.mjs` in CI, flow + deelbaar resultaat — nog zonder opslag | Nee |
| 3 · `feat/lead-storage` | Supabase, API-routes, rate limiting, privacyherziening | Ja — Supabase-project |
| 4 · `feat/design-request` | intake-upgrade, foto-uploads, Resend, FormSubmit eruit | Ja — Resend + DNS |

PR 1 en 2 zijn bewust vrij van externe afhankelijkheden, zodat de twee
onderdelen die Deel 7 in week 1 en week 4–6 zet niet op accountaanmaak staan
te wachten.

## Verificatie

Let op: **`node_modules/` bestaat niet in deze checkout** — `npm ci` gaat
vooraf aan alles, en `npx playwright test` vereist eerst `npm run build`
(de playwright-config bouwt zelf niets).

Per PR de definition of done uit AGENTS.md §9: `npx tsc --noEmit`,
`npx eslint src scripts tests`, `node scripts/check-contrast.mjs`,
`npm run build`, `npx playwright test` — en verifiëren op de Vercel-preview
op desktop **en** mobiel, in **beide talen** (er verandert copy) en met
`prefers-reduced-motion` aan (er verandert motion).

Toevoegen aan de bestaande specs: `/vijvercheck` en een `/services/[slug]`
in `tests/e2e/a11y.spec.ts` `PAGES` (inclusief de `/nl`-variant), en in
`behaviors.spec.ts` het diagnosepad — toetsenbediening door de chipgroepen,
resultaat verschijnt zonder e-mailadres, en een gedeelde URL reproduceert
exact dezelfde uitkomst. `scripts/check-diagnose.mjs` bewaakt de regels zelf.

Voor PR 3 en 4 geldt bovendien: één echte inzending door de zichtbare
productie-UI, en een test waarin `fetch` faalt zodat de `mailto:`-terugval
bewijsbaar werkt zonder een echte mail te versturen — dat zijn de twee
bewijspunten die AGENTS.md §2 nog open heeft staan.

Eén valkuil bij het verifiëren: **previews zitten achter Vercel SSO**, dus
het niet-geauthenticeerde pad is daar niet zonder meer te testen. De
beveiliging uitzetten op een preview die aan een *productie*-Supabase hangt
is precies wat je niet wilt — dus daarvoor een aparte Supabase-omgeving, of
testen na merge op productie met een wegwerprij.

Bijhouden zoals AGENTS.md §7/§8 eist: een gedateerd `docs/log/`-item met wat
er is gebouwd én wat is afgewezen en waarom, plus een `docs/worklog.md`-entry
met de Nederlandstalige DigiBoox-samenvatting.

---

## Wat op jou wacht

- **Supabase-project** aanmaken, connectiegegevens in Vercel. Blokkeert PR 3.
- **Resend-account + domeinverificatie.** Vraagt DNS-records in Cloudflare, en
  AGENTS.md §1 verbiedt mij DNS aan te raken zonder jouw akkoord. Blokkeert PR 4.
- **Vercel-plan.** OPERATIONS.md §1 heeft al open staan dat Hobby officieel
  niet-commercieel is. Zodra de site prijzen toont en boekingen aanneemt is dat
  geen grijs gebied meer.

## Iets dat nu al leefde, los van dit plan — opgelost 27 aug 2026 (#89)

**Dit is verholpen.** Wat er stond, en waarom het bleef staan tot #89:

`src/lib/business.ts` bevatte het **IBAN**, en dat kwam in de client-bundle
terecht. Het was breder dan hier eerst genoteerd: niet alleen
`privacy-content.tsx`, maar ook `terms-content.tsx` én de **footer** —
en die staat op elke pagina. Het nummer zat dus in de gedeelde chunk en
was te vinden zonder één pagina te openen die het afdrukt. KVK, BTW,
adres en telefoon zijn terecht openbaar voor een Nederlands bedrijf; een
IBAN hoeft niet op een marketingsite te staan en is een bekende ingang
voor factuurfraude.

Sinds #89 staat het in `src/lib/business-private.ts`, dat een fout gooit
zodra het in een browser wordt geëvalueerd. `/admin` leest het
server-side ná de sessiecontrole en geeft het door als prop. De footer
toont het niet meer; de voorwaarden verwijzen naar *de rekening op de
factuur*. Gecontroleerd op een schone build: nul treffers in
`.next/static`, nul in de geprerenderde HTML.

Kleinere dingen uit dezelfde audit: `src/lib/auth.ts:22-24` controleert geen
`email_verified`, `robots.ts` sluit `/admin` niet uit (de pagina zet zelf wel
`noindex`), en `/editor` en `/admin` zijn frame-baar omdat er nergens
security-headers staan. En OPERATIONS.md verwijst op `:179` nog naar
`src/app/api/contact/route.ts`, een bestand dat sinds 19 juli 2026 niet meer
bestaat — je leest die handleiding als bron van waarheid, dus verouderde
beveiligingsclaims daarin zijn extra vervelend.

## Eén ding dat ik zou aankaarten

De projecten, journaalstukken en beelden zijn **placeholderfictie**
(OPERATIONS.md §1). Straks staat €350 voor een najaarsbeurt naast een
casestudy die niet bestaat. Prijzen maken de site controleerbaar; verzonnen
referenties maken hem juist ongeloofwaardiger zodra iemand doorklikt. Dat
pleit ervoor de echte foto's en projecten hoog op de lijst te zetten, of de
casestudies tot die tijd duidelijker als voorbeeld te markeren.

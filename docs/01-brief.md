# De ontwerp- en bouwbrief

Gegeven door Nick op 4 oktober 2026, bij het begin van deze repo. Hieronder
de brief per onderwerp samengevat, in de volgorde waarin hij is gegeven.
Nick erbij: **"dit alles zijn ideeën en geen vastigheden!"** De brief is
een richting, geen contract. Waar de bouw ervan afwijkt, staat dat in
[`08-bouwlog.md`](08-bouwlog.md) met de reden.

Het korte plan dat eraan voorafging staat ongewijzigd in
[`00-plan-nieuwe-repo.md`](00-plan-nieuwe-repo.md).

---

## 1. Kernidee

GRØNN voelt als **landschapsarchitectuur × editorial design × ecologische
techniek**. Rustig, beeldend, architectonisch, redactioneel, premium,
ingetogen, tastbaar, eigentijds, natuur voorop, technisch precies waar
dat nodig is.

Het werk en de fotografie domineren; de site zelf verdwijnt bijna. Denk
aan een digitaal architectuurtijdschrift of een monografie over
landschap.

Niet: een SaaS-site, een standaard hoveniersjabloon, een
componentenbibliotheek, een dashboard, een marketingtrechter, een site
vol kaarten of een animatiedemo.

## 2. Referenties (als mentaliteit, niet om te kopiëren)

| Referentie | Wat we meenemen |
| --- | --- |
| Bart Kolenda | Het blijvende menu onderaan: links een oranje knop, in het midden een glazen pil met vier woorden (actief op salie), rechts een ronde pijl. Donkergroene basis. |
| Phlypo | Fotografie eerst, projecten in het midden, weinig zichtbare interface, projectcodes, ingetogen overgangen, vertrouwen door weglaten. |
| Piet Oudolf | Stilte, witruimte, minimale interface, botanische sfeer, bescheiden typografie. |
| Garden Eight | Eigentijdse art direction, typografie, rastercompositie, beheerste beweging, grote lege vlakken. |
| OJB en andere landschapsstudio's | Technische projectinformatie, metadata, gedisciplineerde rasters, balans tussen beeld en techniek. |

Uit het plan: Studio Verde (opening met één zin en één knop), Stefan
Morael (schermbrede foto's), Con-Tour (projectraster met naam en plaats),
Tuinarchitect Puur (rustige typografie). Tuinpionier is het
tegenvoorbeeld: veel blokken en tekst door elkaar.

## 3. Gouden regel: weglaten

Bij elke ontwerpbeslissing: *kan dit eenvoudiger zonder betekenis te
verliezen?* Zo ja, dan eenvoudiger. Geen interface toevoegen alleen omdat
het technisch kan.

## 4. Wat niet terugkomt

Waaier- of radiaal menu, de oude dock, bubbels, het 404-spel, de
tuinkalender, de techniekpagina, ⌘K, easter eggs, portaal, dashboard,
editor, DEV-laag, NextAuth, Supabase, Vercel Blob, overbodige zwevende
knoppen, te veel badges, tientallen pillen, kaartrasters zonder reden.

## 5. Sitestructuur

Precies vier menuwoorden: **Vijvers, Tuinen, Werk, Over**. Home is het
logo. Vijf hoofdpagina's: `/`, `/vijvers`, `/tuinen`, `/werk`, `/over`.
Ondersteunende en juridische routes mogen bestaan, buiten het menu.
Eerst alleen Nederlands; geen i18n-systeem tenzij er een dwingende reden
is, maar de opbouw mag vertalen later niet onmogelijk maken.

## 6. Homepage: opening

Eén dominante schermvullende foto (ongeveer `min-height: 90svh`). Erover
alleen een subtiele project- of categorie-annotatie, de
positioneringszin en één knop. Bestaande GRØNN-teksten gaan voor nieuwe.
Als de openingsspread van een ontwerpboek.

## 7. Homepage: projecten

Geen kleine kaarten. Een regel, een nummer, een groot beeld, een korte
zin, de plaats. Elk project mag een eigen ritme hebben; witruimte in
plaats van kaders. Twee echte projecten is genoeg; geen groot portfolio
nabootsen.

## 8. Homepage: over

Na de projecten één korte, sterke introductie van Nick en GRØNN, geen
biografie. Daarna contact.

## 9. Vijvers

Een dienstenpagina die er niet zo uitziet: geen dienstkaarten, iconen,
feature-rasters of herhaalde CTA-blokken. Rijen met nummer, dienst en
vanaf-prijs, met één of enkele sterke foto's. Hiërarchie uit ruimte,
lijnen, typografie en schaal, niet uit kaders.

## 10. Tuinen

Dezelfde logica als Vijvers, herkenbaar verwant maar geen kopie. Rijen
met nummer, dienst, korte uitleg waar nodig en vanaf-prijs. Foto's
onderbreken de typografie in plaats van in kaarten te zitten.

## 11. Werk

De projectindex: een ingetogen raster (Con-Tour, Phlypo). Niet elk
project even groot; redactionele asymmetrie mag als het rustig blijft.
Projectcodes kunnen deel van de identiteit worden, bijvoorbeeld
`GR / 001`.

## 12–13. Projectpagina's

Hier mag het rijker: casestudy's, geen blogposts. De vijverrenovatie is
de referentie. Idee: *twee vijvers, één levend systeem*. Ritme: opening
met schermvullend beeld, veel witruimte, een klein mono-label ("THE
CHALLENGE / 01"), een grote redactionele uitspraak, ondersteunende
tekst. Niets in kaarten.

## 14. Negatieve ruimte

Witruimte is functioneel. Sectieafstand op desktop ongeveer
`clamp(120px, 14vw, 240px)`. Leestekst ongeveer `max-width: 38rem`. Lege
kolommen hoeven niet gevuld.

## 15. Raster

Desktop twaalf kolommen, ruime buitengoot (`clamp(24px, 4vw, 72px)`),
canvas tot 1400–1600px, asymmetrische plaatsing. Niet alles op dezelfde
linkerlijn; het raster schept orde maar wordt niet zichtbaar mechanisch.

## 16. Fotografie

Het belangrijkste beeldelement. Meerdere vormen: schermbreed, verschoven
(offset) met bijschrift, paren met ongelijke breedtes, de bestaande
fotostrook. Niet elke foto in dezelfde verhouding; het ritme van een
gedrukte publicatie.

## 17. Technisch systeem

Eén groot interactief moment op de vijverpagina: een minimaal
systeemschema (vijver B → pomp → filter → splitsing → vijver A en
waterval → beek → vijver B). Dunne lijnen, mono-annotaties, weinig kleur,
precieze geometrie. Onderdelen mogen bij het scrollen één voor één
oplichten; water als een heel subtiele bewegende lijn of stip. **Echte
projectgegevens, niets verzinnen.**

## 18. Cijfers

Projectcijfers als grote typografische momenten, één per moment waar
het kan. Alleen geverifieerde gegevens.

## 19. Overgang probleem → systeem

Eén gedenkwaardige overgang: "Twee vijvers. Twee problemen." Een dunne
lijn verschijnt, wordt de beeldtaal van het hydraulische systeem en loopt
door in het schema: "Eén systeem." Elegant, niet theatraal.

## 20. Proces

Eén sticky verhaalsectie, niet meer: links een vaste foto, rechts de
stappen (Analyse, Ontwerp, Realisatie, Establishment) die oplichten bij
het lezen. Juist de zeldzaamheid geeft impact.

## 21. Einde van een project

Steeds rustiger, minder interface, een grote laatste foto, een slotzin
("Built to mature, not to remain finished." of een bestaande GRØNN-zin),
veel witruimte, dan "VOLGEND PROJECT →". Geen groot promotieblok.

## 22. Typografie

Brand Guide 2026. **Syne** (Bold) voor openingskoppen, grote
uitspraken, grote getallen en enkele sectietitels, schaars. **Montserrat**
voor lezen (`line-height` 1,55–1,7). **Geist Mono** veel, voor de
technische laag: codes, nummers, data, bijschriften, eenheden,
leidingmaten, metadata, plaatsen, labels, prijzen, schema's. De spanning
Syne × Geist Mono = natuur × techniek.

## 23. Kleur

De tokens van de Brand Guide, niet opnieuw opbouwen. 60/30/10 behouden.
Donkergroen, salie, gebroken wit, antraciet, oranje. Oranje blijft
bijzonder; de foto's leveren al veel groen, dus de interface is zuinig
met kleur.

## 24–25. Menu onderaan

Desktop: `[ KENNISMAKEN ]  [ VIJVERS | TUINEN | WERK | OVER ]  [ ↓ ]`.
Kennismaken in oranje met antraciet tekst; een glazen pil met het actieve
woord op salie; een ronde knop met een pijl die zijn betekenis
begrijpelijk houdt. Glas met ingetogen transparantie, bescheiden blur,
fijne rand, geen gloed.

Telefoon: niet het desktopmenu inpersen. De pil mag bijna schermbreed,
Kennismaken naar de kop naast het logo, duimvriendelijk, liefst geen
hamburgermenu. Testen op smalle schermen.

## 26. Kop

Links het logo, rechts **Weergave**: Auto, Licht, Donker en eventueel
waardevolle leesopties. Geen groot instellingenpaneel. De bewezen
pre-paint-logica hergebruiken.

## 27. Voet

Functioneel en bescheiden: adres, KVK, privacy, voorwaarden, FAQ,
contact. Als het colofon van een tijdschrift, geen grote marketingvoet.

## 28–31. Beweging en interactie

Principe: **beweging laat structuur zien, nooit alleen decoratie.**
Ongeveer vier gedragingen: (1) gemaskerde tekstonthulling, (2)
beeldonthulling met overflow of clip-path, (3) heel lichte diepte
(parallax 3–6 %), (4) technische lijnen tekenen.

CSS eerst, geen GSAP: scroll-gedreven animaties (`animation-timeline`),
View Transitions API, transforms, opacity, clip-path. JavaScript alleen
waar interactie het vraagt. Altijd `prefers-reduced-motion`, en dan nog
steeds verzorgd.

Paginawissels rustig: crossfade, kleine verschuiving, gedeelde beelden
waar het robuust kan. Geen laadschermen, navigatie nooit blokkeren.

Micro-interacties bijna onzichtbaar: tekst schuift een paar pixels, de
pijl draait, een onderlijn volgt, de actieve vulling glijdt, bijschriften
bij hover. Geen magnetische cursor, eigen cursor, elastiek of constante
beweging; nooit hover nodig om iets te begrijpen.

## 32. Techniek

Next.js 16, TypeScript, Tailwind CSS v4, Vercel, beweging in CSS,
getypte lokale data. Geen CMS. Projecten, diensten, prijzen en
bedrijfsgegevens als getypte data in de repo; het datamodel klein, geen
mini-CMS.

## 33. Wat meekomt uit gronn-studio

Selectief kopiëren, niet mergen: Brand Guide-tokens, Syne, Montserrat,
Geist Mono, de logo-SVG's, de typeschaal, echte fotografie, de
vijverrenovatie, het terras in Geulle, het portret, de
positioneringszin, diensten en prijzen, de Over-tekst, FAQ, privacy,
voorwaarden, `business.ts`, de pre-paint-logica, de fotostrook en de
contrastcheck. Al het andere moet zijn plek verdienen.

## 34. Bedrijfsgegevens

`business.ts` blijft de enige bron. Nooit adres, KVK, e-mail, telefoon of
URL's verspreid hardcoden.

## 35. Contact

Het eenvoudige FormSubmit-formulier vanuit de browser blijft. Geen CRM,
database, auth of server actions. Het formulier hoort bij de redactionele
site: geen groot kader, maar labels en lijnen ("Naam ____").

## 36. Responsief

Telefoon bewust ontwerpen, niet het desktopraster stapelen. Witruimte,
hiërarchie, grote foto's, typografie en het projectverhaal blijven.
Ongeveer 24px zijmarge, 96–128px tussen grote secties. Foto's mogen tot
bijna de rand; cijfers mogen schermvullend.

## 37. Toegankelijkheid

Vanaf het begin: semantische HTML, toetsenbord, zichtbare focus,
toegankelijk menu onderaan, voldoende contrast, betekenisvolle alt-tekst,
minder beweging, logische koppen, juiste landmarks, goede formulierlabels.

## 38. Prestaties

Correcte `sizes`, moderne formaten, passende afmetingen, Next/Image waar
nuttig, `priority` alleen voor de openingsfoto, lazy loading elders,
geen onnodige client-componenten.

## 39. Foto-privacy

Gepubliceerde foto's zonder ongewenste metadata; de bestaande check
blijft.

## 40. SEO

Conventioneel: titelsjablonen, beschrijvingen, Open Graph,
projectmetadata, canonical URL's, sitemap, robots, gestructureerde data
waar nuttig. Niet overdrijven.

## 41. Redirects

Oude adressen blijven werken, minstens `/services`, `/studio`, `/contact`
en `/kennisbank`, naar de best passende nieuwe plek.

## 42. Testen

Voor "klaar": productiebuild, lint, TypeScript, contrast, navigatie,
contactformulier, 404, projectroutes, responsief, minder beweging,
fotometadata. Een kleine Playwright-suite.

## 43–44. Repo en componenten

`app/ components/ data/ lib/ styles/ public/ tests/`, geen diepe
abstractieboom (geen atoms/molecules/organisms). Componenten per
zichtbare verantwoordelijkheid (SiteHeader, BottomNavigation,
ProjectHero, ProjectIndex, ProjectGallery, ProjectMetric, SystemDiagram,
ServiceRow, EditorialStatement, ContactSection, SiteFooter), niet één per
`<div>`.

## 45–47. Anti-patronen, tekst en ritme

Te veel glas, verlopen, ronde kaarten, schaduwen, pillen, randen,
iconen, badges, animatie, tekst of knoppen afwijzen. Bevat een sectie
meer dan één visuele container, dan heroverwegen. Tekst meestal links
uitgelijnd, korte alinea's, belangrijke ideeën als losse uitspraken.
Secties niet allemaal even hoog; de pagina ademt.

## 48–49. Kwaliteit en principe

Geloofwaardig naast toonaangevende landschapsarchitecten en
ontwerpstudio's, zonder Awwwards-trucs ten koste van helderheid. De oude
site wilde zijn techniek laten zien; de nieuwe bewijst kwaliteit door
die niet te hoeven tonen. De bezoeker onthoudt de tuinen, het water, de
foto's, GRØNN en het denken erachter, niet de interface.

## 50–52. Fasen

1. **Fase 1 — fundament:** repo-opbouw, tokens, typografie,
   thema/pre-paint, kop, responsief menu onderaan, basisraster,
   homepage-opening, eerste projectteaser. Dan build, lint, responsieve
   check, toegankelijkheid en contrast, en een eerste preview.
2. **Fase 2:** de homepage helemaal, `/werk`, en de vijverrenovatie als
   eerste volledige casestudy (geen star sjabloon).
3. **Fase 3:** `/vijvers`, `/tuinen`, `/over`, contact, voet, FAQ,
   juridische pagina's, redirects, metadata, sitemap, tests.

## 53–55. Git, productie en werkwijze

Alleen in de nieuwe repo werken; `gronn-studio` niet aanraken. Betekenisvolle
commits. Architectuurbesluiten vastleggen, triviale details niet. De
huidige site blijft live; het domein verhuist pas na mobiele en desktop-
review, checks, inhoudscontrole en Nicks akkoord. De oude repo blijft als
archief. Voor de code: eerst de oude site inventariseren op tokens,
typografie, logo's, inhoud, beelden, data en de genoemde utilities, en
Keep / Rewrite / Leave behind vastleggen
([`02-architectuur.md`](02-architectuur.md)).

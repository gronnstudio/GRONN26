# Inhoud: bronnen, feiten en regels

Alle tekst en alle cijfers op de site komen uit wat Nick heeft
aangeleverd, via `gronnstudio/gronn-studio`. Deze build verzint niets: geen
marketingtekst, geen plaats, geen getal. Wat hieronder niet staat, staat
niet op de site.

## 1. Regels

1. **Bestaande GRØNN-tekst gaat voor nieuwe tekst.** Is er nog geen tekst,
   dan blijft het leeg of vraag je het Nick.
2. **Alleen echt werk.** Twee projecten is genoeg; geen portfolio
   nabootsen.
3. **Benaderingen blijven benaderingen.** Waterinhoud, afmetingen en uren
   van de vijver zijn "circa".
4. **Geen klantnaam, geen bedragen, geen reparatiegarantie** bij de vijver.
5. **De vijver heeft geen plaats.** De projecttekst noemt er geen.
6. **Een AI-visualisatie is geen foto.** Ze draagt altijd een zichtbaar
   label ("AI-visualisatie") en staat alleen bij het denkwerk, nooit als
   resultaat.
7. **Sfeerbeelden zijn geen bewijs van werk** en staan nooit bij een
   project. (Ze zijn in fase 1 niet overgenomen.)
8. **Nooit minderjarigen in beeld.** De toestemming van de klant gaat over
   het project, niet over een kind.
9. **Nooit op de site zeggen dat de site met Claude is gebouwd** (Nick, 29
   sep 2026).
10. **Bij twijfel over een beeld: eerst Nick vragen.**
11. **Bedrijfsgegevens alleen uit `data/business.ts`.**

## 2. Vaste teksten (`data/site.ts`)

| Naam | Tekst | Bron |
| --- | --- | --- |
| `OPENING.label` | Vijvers en tuinen · Stein en omgeving | gronn-studio `home.tsx`, 3 okt 2026 |
| `OPENING.kop` | Een vijver en tuin die gezond blijven. | idem |
| `OPENING.zin` | Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf. | idem |
| `MERKBASIS` | GRØNN Studio ontwerpt, legt aan en onderhoudt vijvers en tuinen bij particulieren in Stein en omgeving. Planten, water en bodem als één systeem, zodat het gezond blijft met weinig ingrijpen. | `plekken.ts`; ook de sitebeschrijving |
| `MERKBELOFTE` | Een tuin die met je meegroeit. | Brand Guide 2026, p. 2 (nog niet op de site) |
| `NAV` | Vijvers · Tuinen · Werk · Over | de brief |
| `KENNISMAKEN` | Kennismaken → `/kennismaken` | de brief |

De positioneringszin uit de werknotities van gronn-studio luidt: "Ik maak
en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en
omgeving, met een vaste prijs vooraf." Op de live site staat de uitgewerkte
versie hierboven; die is overgenomen.

## 3. Bedrijfsgegevens (`data/business.ts`)

| Veld | Waarde |
| --- | --- |
| Naam | GRØNN Studio (eenmanszaak) |
| Eigenaar | Nick Peters |
| Adres | Kelderstraat 32, 6171 GB Stein, Limburg |
| Telefoon | +316 181 180 14 (`tel:+31618118014`) |
| E-mail | hello@gronn.studio |
| KVK | 42072154 |
| BTW | NL005473265B04 |
| Instagram | instagram.com/gronn.studio |
| WhatsApp | wa.me/31618118014 |
| URL | https://gronn.studio |

Het IBAN staat bewust niet in deze repo.

## 4. Projecten (`data/projects.ts`)

Het type:

```ts
type Project = {
  slug: string          // URL: /werk/<slug>
  code: string          // "GR / 001", oplopend in volgorde van oplevering
  titel: string
  categorie: string
  plaats?: string       // alleen als Nick er een gaf
  jaar: number
  status: string
  samenvatting: string  // overzichten en metadata
  intro: string[]
  cover: Foto
}
type Foto = { src; width; height; alt; bijschrift?; label?; focus? }
```

### GR / 001 — Vijverrenovatie (`/werk/vijverrenovatie`)

- **Titel:** Twee vijvers. Eén samenhangend watersysteem.
- **Status:** In afronding; verdere aanplant voorzien voor voorjaar 2027.
- **Jaar:** 2026 (live op gronn.studio sinds 23 sep 2026).
- **Plaats:** geen.
- **Bron:** de overdracht van Nick van 22 sep 2026 ("BEGIN PUBLIEKE
  PROJECTTEKST" tot "EINDE"), in gronn-studio `src/lib/data/vijverrenovatie.ts`.
  De twaalf hoofdstukken (opgave, denkwerk, waterroute, leidingwerk,
  onderhoud, filter, skimmer, filterherstel, afwerking, beplanting,
  afronding, eerste project), het citaat en de slottekst staan daar
  woordelijk; ze komen in fase 2 naar deze repo.

**Geverifieerde cijfers** (letterlijk uit de bron):

| Onderdeel | Waarde |
| --- | --- |
| Vijvers | 2, verbonden binnen één watersysteem |
| Open water | circa 5.000 liter |
| Waterlijn | circa 12 meter |
| Beekrand | circa 6 meter |
| Droge grind- en steenzone | circa 3 m² |
| Pvc-leidingwerk | **50 mm** druk-pvc; buis gespecificeerd tot 7,5 bar (drukvastheid van de buis, **geen** systeemdruk) |
| Bochten | 2 tot maximaal 4 bochten van 90°; overige 45° |
| Oppervlakteopvang | 1 skimmer |
| Onderhoudsaansluitingen | losneembare koppelingen met schroefdraad |
| Filter | 3 kamers, met een bypass |
| Pomp | AquaForte DM-10000 Vario S |
| Regelbare waterverdeling | 2 takken: naar vijver A en naar de waterval |
| Bestede tijd | circa 120 uur, inclusief voorbereiding en denkwerk (± 15 werkdagen van 8 uur) |
| Oorspronkelijk beplantingsplan | 11 manden, 44 planten, 7 soorten (plan, geen telling) |

**De waterroute** (voor het systeemschema in fase 2), letterlijk uit de
bron: "Vanuit vijver B gaat het water via de pomp naar het driekamerfilter.
Na de filtratie wordt het verdeeld over twee takken: één richting vijver A
en één richting de waterval. Het water van de waterval loopt via de
beekloop terug naar vijver B. Vijver A voert via de afvoer- en
overloopverbinding terug naar vijver B."

```
VIJVER B → POMP → DRIEKAMERFILTER (met bypass) → SPLITSING (kogelkranen)
                                                   ├→ VIJVER A → afvoer/overloop → VIJVER B
                                                   └→ WATERVAL → BEEKLOOP → VIJVER B
```

**Beplantingsplan:**

| Zone | Soorten | Manden | Planten |
| --- | --- | --- | --- |
| Waterlijn | gele lis, zwanenbloem, egelskop, holpijp | 6 | 24 |
| Beekrand | penningkruid, beekpunge, watermunt | 5 | 20 |
| **Totaal** | 7 soorten | 11 | 44 |

**Citaat (Nick):** "Ik heb ontzettend genoten van dit eerste project. Van
het uitdenken van de waterstromen tot het moment waarop de onderdelen
samenkomen. Het vertrouwen om dit te mogen maken was een belangrijke stap
in het opbouwen van GRØNN Studio."

### GR / 002 — Terras Geulle (`/werk/terras-geulle`)

- **Titel:** Een terras van 24 m², gelegd in twee dagen.
- **Status:** Afgerond. **Plaats:** Geulle (Limburg). **Wanneer:** augustus 2026.
- **Bron:** Nick, 24 sep 2026, en zijn Instagrambericht van 12 aug 2026.
- **Cijfers:** 24 m² betontegels van 60 × 60 × 4 cm; leggen circa 8 uur;
  twee dagen in totaal; materialen aangeleverd door de klant; afschot
  richting het gras.
- **Werkstappen:** ondergrond ontgraven en voorbereiden · ophogen en
  verdichten · zandbed aanbrengen en afrijen · banden stellen en uitlijnen
  · zandbed aantrillen en opnieuw controleren · 24 m² tegels leggen · alles
  op afschot richting het gras · afwerken en controleren.
- **Citaat:** "Een goed terras ziet er niet alleen waterpas uit. Het weet
  ook waar het water heen moet."

## 5. Beeld

Alle foto's: verkleind, **zonder EXIF/XMP** (geen GPS), met toestemming
van de klant. Gecontroleerd door `npm run photos`. Alt-teksten zijn in
gronn-studio geschreven ná het bekijken van elke foto.

### Vijverrenovatie (`public/projecten/vijverrenovatie/`)

| ID | Bestand | px | kB | Fase | Wat je ziet |
| --- | --- | --- | --- | --- | --- |
| F01 | `F01.jpg` | 2000 × 1500 | 746 | uitvoering | overzicht tijdens afronding: klinkerpad, treurwilg, ronde stapstenen. **Cover** (uitsnede 82 % 55 %, zodat de container links wegvalt) |
| F02 | `F02-1.jpg`, `F02-2.jpg` | 1000 × 1778 | 495, 467 | bestaande situatie | de oude vijver, afgedekt met net; vijver tegen een gemetselde muur |
| F03 | `F03-1.jpg` | 1000 × 1333 | 255 | proces | vijverfolie uitgerold op het gazon |
| F03 | `F03-2.jpg` | 1400 × 1050 | 356 | — | **AI-visualisatie** van het beoogde eindbeeld (label verplicht) |
| F03 | `F03-3.jpg` | 896 × 1195 | 270 | — | **AI-visualisatie**, vijver met waterlelies (label verplicht) |
| F04 | `F04-1.jpg`, `F04-2.jpg` | 1000 × 1333 | 322, 267 | uitvoering | sleuf met pvc-leidingen; leidingen met blauwe kogelkranen |
| F05 | `F05.jpg` | 1200 × 1600 | 471 | uitvoering | filterbak met drie kamers |
| F06 | — | — | — | — | skimmer: **nog geen foto** |
| F07 | `F07-1.jpg`, `F07-2.jpg` | 1400 × 1050, 1000 × 1333 | 334, 164 | proces | het beschadigde filter met lijmpistool; slib uit de filterbak |
| F08 | `F08-1.jpg`, `F08-2.jpg` | 1000 × 1333 | 290, 155 | uitvoering | keien op de folie bij het terras; Nick aan het werk |
| F09 | `F09-1.jpg`, `F09-2.jpg` | 1000 × 1333 | 148, 294 | uitvoering | plantje in een plantmand; Nick tussen de oeverplanten |
| F10 | `F10.jpg` | 2000 × 1500 | 367 | uitvoering | de waterval met canna en de kogelkraan. **Openingsbeeld van de site** |
| F11 | `F11.jpg` | 1000 × 1333 | 220 | uitvoering | Nick bij de beekloop in aanbouw (juli) |
| V01 | `V01-poster.jpg` | 720 × 1280 | 164 | — | poster van de clip (statiefje op een kei) |
| V02 | `V02-poster.jpg` | 720 × 1280 | 116 | — | poster van de clip (oeverplanten zetten) |

De clips zelf (`V01.mp4`, `V02.mp4`) zijn nog niet overgenomen; ze komen
mee als de casestudy ze gebruikt. Ze spelen dan stil, in een lus, en niet
vanzelf bij minder beweging.

### Terras Geulle (`public/projecten/terras-geulle/`)

| Bestand | px | kB | Wat je ziet |
| --- | --- | --- | --- |
| `T01.jpg` | 1000 × 1333 | 174 | het nieuwe terras onder de overkapping (**cover**) |
| `T02.jpg` | 1000 × 1333 | 179 | het tegelpad langs gevel en schutting |
| `T03.jpg` | 1000 × 1333 | 212 | Nick op het nieuwe pad, klaar na twee dagen |
| `T04.jpg` | 1000 × 1333 | 138 | het pad vanaf de andere kant |

### Nog niet overgenomen

- Het portret van Nick (`public/nick/portret-espresso.jpg`, 1,3 MB): eerst
  verkleinen voor het web (fase 3, Over).
- De sfeerbeelden (`public/sfeer/`): niet nodig.

## 6. Waar de brief en de bron verschillen

| Brief | Bron | Op de site |
| --- | --- | --- |
| Vijver in "Geleen" | geen plaats | geen plaats |
| "75 MM pressure PVC" | 50 mm druk-pvc | 50 mm (fase 2) |
| "Twee vijvers. Eén levend systeem." | "Twee vijvers. Eén samenhangend watersysteem." | de bron |
| "120+ hours" | "circa 120 uur" | "circa 120" (fase 2) |
| Stappen Analyse / Ontwerp / Realisatie / Establishment | fasen Opgave / Uitvoering / Afronding / Beplanting (voorjaar 2027) | de bron (fase 2) |
| "Built to mature, not to remain finished." | geen Engelse slotzin; wel "Een vijver die weer past bij de tuin" | aan Nick voorleggen |

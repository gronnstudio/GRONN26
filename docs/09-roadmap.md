# Roadmap

Wat er nog komt, in de volgorde van de brief. Elk punt alleen met echte
inhoud (`05-inhoud.md`). Volgorde binnen een fase mag schuiven; de fase
zelf niet.

---

## Fase 1 — fundament ✓ (4 oktober 2026)

Repo, tokens, typografie, weergave en pre-paint, kop, menu onderaan,
raster, opening, eerste projectteaser, checks, eerste preview op
https://gronn26.vercel.app. Zie [`08-bouwlog.md`](08-bouwlog.md).

**Wacht op:** Nicks oordeel over het beeld (menu, ruimte, opening).

## Fase 2 — homepage, werk en de vijver als casestudy

### Homepage helemaal

- [ ] Het tweede project (GR / 002, terras) als spread met een **ander
      ritme** dan de vijver (bv. beeld links, staand, tekst rechts).
- [ ] Het Over-fragment: één korte introductie van Nick (uit de Over-tekst
      van gronn-studio) en een link "Meer over GRØNN".
- [ ] Contactblok onderaan (de kop van het formulier; het formulier zelf
      is fase 3) of een link naar `/kennismaken`.

### `/werk`

- [ ] Een asymmetrisch raster: GR / 001 groot en liggend, GR / 002
      kleiner en staand, verschoven. Code, titel, plaats (als die er is) en
      jaar in mono.
- [ ] Bijschriften bij hover (nooit nodig om iets te begrijpen).
- [ ] Gedeelde beeldovergang van index naar project via
      `<ViewTransition name>` (alleen als het robuust werkt).

### De vijverrenovatie (`/werk/vijverrenovatie`)

Het ritme uit de brief, met de inhoud uit de bron:

1. [ ] **Opening:** schermvullend beeld, `PROJECT / 01`, titel, ondertitel
       ("Een vijverrenovatie waarin watertechniek, beplanting en
       natuurlijke afwerking samenkomen.").
2. [ ] **Witruimte**, dan de intro.
3. [ ] **De opgave** (hoofdstuk 1) met F02 (bestaande situatie) als paar.
4. [ ] **Cijfers als momenten:** "circa 120 / uur, inclusief denkwerk",
       "2 / vijvers, één watersysteem", "circa 5.000 / liter open water".
       Eén per moment, in Syne, eenheid en uitleg in mono.
5. [ ] **Overgang probleem → systeem:** een dunne lijn die verschijnt en
       doorloopt in het schema.
6. [ ] **`SystemDiagram`:** inline SVG van de waterroute (zie
       `05-inhoud.md`): vijver B → pomp (AquaForte DM-10000 Vario S) →
       driekamerfilter met bypass → splitsing met kogelkranen → vijver A
       (terug via afvoer/overloop) en waterval → beekloop → vijver B.
       Dunne lijnen, mono-annotaties ("50 MM DRUK-PVC", "7,5 BAR
       DRUKVASTHEID BUIS"), onderdelen lichten op scroll op, het water als
       een heel subtiele bewegende stip (CSS `offset-path`). Bij minder
       beweging: het hele schema staat er, zonder stip.
7. [ ] **Leidingwerk, onderhoud, filter** (hoofdstukken 4–6) met F04 en F05
       in verschillende beeldvormen (offset, paar).
8. [ ] **Filterherstel** (hoofdstuk 8) met F07.
9. [ ] **De ene sticky sectie:** proces in de fasen van de bron (Opgave,
       Uitvoering, Afronding, Beplanting — voorjaar 2027), links een vaste
       foto die mee wisselt.
10. [ ] **Water naar tuin en beplanting** (hoofdstukken 9–10) met F08, F09,
        de planttabel als mono-tabel zonder kaders, en clip V02 (stil, in
        een lus, niet vanzelf bij minder beweging).
11. [ ] **Denkwerk** met F03-1 en de twee AI-visualisaties, **met label**.
12. [ ] **Citaat van Nick**, groot.
13. [ ] **Einde:** steeds rustiger, F10 of F01 groot, een slotzin (aan Nick
        vragen: de brief stelt een Engelse zin voor, de bron heeft "Een
        vijver die weer past bij de tuin"), veel witruimte, "VOLGEND
        PROJECT — Terras Geulle →".

Nieuwe componenten (alleen als ze nodig blijken): `ProjectHero`,
`EditorialStatement`, `ProjectMetric`, `SystemDiagram`, `ProjectGallery`,
`ProcessSticky`, `NextProject`. Geen star sjabloon: het terras krijgt een
kortere eigen pagina.

### Het terras (`/werk/terras-geulle`)

- [ ] Korte pagina: opening (T01), intro, de acht werkstappen als
      genummerde mono-lijst, T02 en T04 als paar, het citaat, T03 als
      slotbeeld, "VOLGEND PROJECT".

## Fase 3 — de rest en de livegang

### Pagina's

- [ ] **`/vijvers`:** diensten als rijen (nummer, dienst, korte uitleg,
      vanaf-prijs in mono), één of twee sterke foto's ertussen. Inhoud uit
      gronn-studio `services.ts` + `pricing.ts`: o.a. vijverdoorlichting
      (€195, verrekend boven €750), herfstbeurt vijver (€250/€350/€450–650),
      winterklaar (vanaf €95), bladnet (vanaf €125), onderhoudsabonnement
      (vanaf €45 p/m), watersystemen (op maat). Prijzen incl. btw. Met Nick
      afstemmen welke dienst onder Vijvers en welke onder Tuinen valt.
- [ ] **`/tuinen`:** dezelfde logica, ander ritme. Tuinontwerp (altijd
      offerte, de helft verrekend bij aanleg), aanleg, beplanting en
      habitat, transformatie, advies.
- [ ] **`/over`:** het portret (eerst verkleinen, metadata eraf), Nicks
      verhaal uit gronn-studio, de werkwijze.
- [ ] **`/kennismaken`:** het FormSubmit-formulier vanuit de browser
      (honeypot, validatie in de browser, mailto als terugval), in de
      redactionele vorm: label, lijn, geen kader. Kop: een bestaande zin
      van Nick.
- [ ] **FAQ** (`/faq`), **privacy** (`/privacy`), **voorwaarden**
      (`/voorwaarden`, `/voorwaarden-zakelijk`), **herroeping**
      (`/herroeping`), **colofon**: teksten uit gronn-studio
      `src/lib/data/legal/`. De voorwaarden zijn een concept dat nog
      professioneel nagekeken moet worden.
- [ ] **Voet:** adres, KVK, BTW, contact, links naar FAQ en juridische
      pagina's, als colofon.

### Redirects (`next.config.ts`)

gronn-studio heeft Engels als standaard (zonder prefix) en Nederlands
onder `/nl`. Alles moet op een bestaande nieuwe pagina landen. Voorstel
(permanent, 308, na akkoord):

| Oud (en `/nl/…`) | Nieuw |
| --- | --- |
| `/services` | `/vijvers` |
| `/services/pond-survey`, `/services/pond-autumn-service`, `/services/winterising`, `/services/leaf-net`, `/services/water-systems`, `/services/maintenance-subscription` | `/vijvers` |
| `/services/garden-design`, `/services/planting-habitat`, `/services/garden-transformation`, `/services/consultancy`, `/services/implementation` | `/tuinen` |
| `/projects` | `/werk` |
| `/projects/vijverrenovatie-twee-vijvers-waterval-beekloop` | `/werk/vijverrenovatie` |
| `/projects/terras-geulle-24-m2-betontegels` | `/werk/terras-geulle` |
| `/projects/:rest*` | `/werk` |
| `/studio` | `/over` |
| `/contact`, `/contact/intake` | `/kennismaken` |
| `/kennisbank`, `/kennisbank/:rest*` | `/faq` |
| `/journal/:rest*`, `/approach`, `/lab`, `/easter-eggs` | `/` (of `/over` voor approach) |
| `/stack`, `/calendar`, `/winkel`, `/checklist`, `/herfstbeurt` | `/` (herfstbeurt eventueel `/vijvers`) |
| `/portaal`, `/clients/*`, `/dashboard/*`, `/editor`, `/admin`, `/os/*` | **eerst met Nick bespreken**: draaien er nog klanten op het portaal? |
| `/links` en links.gronn.studio | **eerst met Nick bespreken** |
| `/nl` | `/` |
| `www.gronn.studio/*` | `gronn.studio/*` |

Met een test die elke oude URL opvraagt en de bestemming controleert.

### Metadata en livegang

- [ ] `app/sitemap.ts`, `app/robots.ts`, canonical URL's.
- [ ] Open Graph-beeld (een foto van het werk, 1200 × 630, zonder
      metadata).
- [ ] JSON-LD: `LocalBusiness` uit `business.ts`; per project
      `CreativeWork`.
- [ ] Tests uitbreiden: contactformulier (zonder echt te verzenden),
      redirects, projectroutes, foto's per pagina met alt-tekst, minder
      beweging.
- [ ] Livegang volgens [`07-werkwijze.md`](07-werkwijze.md) §5.

---

## Open vragen voor Nick

1. Wat vind je van fase 1 (menu, witruimte, opening)?
2. Mag `main` worden aangemaakt (en de productiebranch in Vercel worden)?
3. Is er een **Syne Bold**-bestand?
4. Wat gebeurt er met het **portaal en het dashboard** van gronn-studio:
   ergens anders onderbrengen of vervallen? (open vraag uit het plan)
5. Blijft er later een **Engelse** versie? (open vraag uit het plan; nu
   alleen Nederlands)
6. Welke diensten horen onder **Vijvers** en welke onder **Tuinen**?
7. De **slotzin** van de vijverpagina: de Engelse zin uit de brief, een
   Nederlandse vertaling, of "Een vijver die weer past bij de tuin"?
8. Mag de **projectcode** `GR / 001` blijven als identiteit?
9. De naam van de repo: `GRONN26` (het plan stelde `gronn-site` voor).

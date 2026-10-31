# Besluiten

Wat Nick heeft besloten over het bedrijf, de site en het systeem, nieuwste
eerst per onderwerp. Een besluit dat de opbouw van de code raakt, heeft ook
een ADR in [architecture/decisions/](architecture/decisions/). Wat hier niet
staat, is niet besloten: vraag het Nick.

Stand: 29 okt 2026.

## Hoe we werken

| Datum | Besluit | Waarom |
| --- | --- | --- |
| 4 okt 2026 | **Gouden regel: functioneel en eenvoudig.** De eenvoudigste versie die werkt; geen complexiteit die bezoeker of Nick niet nodig heeft. | Nick: "Aangezien ik graag overcompliceer en over-engineer, moet je dat als gouden regel vastleggen." |
| 10 okt 2026 | **Nick beslist over smaak.** Een concrete ontwerpkeuze van Nick wordt gebouwd; een risico noem je in één zin. | "Mijn gezag hierop niet ondermijnd." De gouden regel gaat over complexiteit, niet over zijn smaak. |
| 29 okt 2026 | **Claude Code schrijft, GPT/Codex reviewt.** Review verplicht voor API, CRM, dashboard, inlog en `.github/`; de rest auto-merge na groene CI. | Eén schrijver per branch; een tweede model vangt wat de schrijver mist. [ADR 0008](architecture/decisions/0008-gpt-als-reviewer.md) |
| 29 sep / 9 okt 2026 | **Claude merget zijn eigen PR's** na groene CI, tot Nick anders zegt. | Snelheid; Nick hoeft niet elke PR te openen. |
| 9 okt 2026 | **Geen previews per branch** op Vercel, alleen productie. Een preview alleen op verzoek. | Kosten (Vercel Pro zo laag mogelijk). |
| 21 okt 2026 | **CI één keer per commit**, met caches; docs-only draait niet. | Minder Actions-minuten, geen geforceerde herhalingen. |
| 31 okt 2026 | **Archief van de vorige site in deze repo** onder `archief/gronn-studio/`, buiten de build, openbaar (Nick: "laat maar alles public"). Klantgegevens vervangen door voorbeelden. | Alles op één plek. [ADR 0009](architecture/decisions/0009-archief-van-de-vorige-site.md) |
| 29 okt 2026 | **Versies en releases**: zie [ADR 0010](architecture/decisions/0010-versies-en-releases.md). | Nick: "there is also no release". |
| 3 okt 2026 | Opleveringen als losse bestanden, nooit gezipt. | Nick. |
| 30 sep 2026 | Geen halfwerkende tussenoplossingen laten zien; alleen het werkende resultaat of één duidelijke blokkade. | "Bespaar me deze tussenoplossingen." |

## Wat GRØNN doet

| Datum | Besluit | Waarom |
| --- | --- | --- |
| 3 okt 2026 | **Positionering:** "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf." Vijvers en tuinen wegen even zwaar. | Eén zin die site, social en papierwerk stuurt. |
| 3 okt 2026 | **Werkgebied** "Stein en omgeving" = Stein plus ongeveer 30 km (tot Maastricht, Heerlen, Kerkrade). Niet "Westelijke Mijnstreek". | Zo zoeken klanten. |
| 4 okt 2026 | **Vanaf-prijzen in plaats van "op maat"**: advies op locatie vanaf € 195, beplantingsplan vanaf € 395, waterontwerp vanaf € 595, vijverrenovatie/aanleg vanaf € 5.000, tuinontwerp vanaf € 795, aanleg vanaf € 2.500, tuin omvormen vanaf € 5.000 (incl. btw). | "Op maat" leest als "geen idee of het € 400 of € 14.000 is". Data in `src/lib/data/pricing.ts`. |
| 9 okt 2026 | **Borderpakketten:** 8 pakketten + op maat; aangeplant € 75/m². Online betalen via Mollie sinds 21 okt. | Een product dat zonder opname te kopen is. |
| 29 okt 2026 | **Rekenblad Prijs berekenen** met vaste opslag per kostensoort: planten 25 %, steen/grond/hout/techniek 15 %, machinehuur, transport, afvoer en onderaanneming 10 %, ontwerp 0 %. Waarschuwing onder € 37 per uur. | Opslag op inkoop werd vergeten. `src/lib/crm/calculatie.ts`, PR #146/#147. |
| 29 okt 2026 | **Standaard uurtarief in het rekenblad € 50** (excl. btw). | Uit de winstanalyse van 29 okt. Het tarief per offerte blijft aanpasbaar; de rest van die analyse is **nog niet besloten**. |
| 29 okt 2026 | **DigiBoox blijft de boekhouding** en de btw-aangifte. Het CRM maakt offertes en straks facturen, maar boekt niet; facturen gaan per kwartaal als export naar DigiBoox. | Niets dubbel invoeren. Eerst nagaan wat DigiBoox als import accepteert. |
| 29 sep 2026 | Merkregistratie loopt; geen ® tot die rond is. | Juridisch. |

## Het systeem (CRM)

| Datum | Besluit | Waarom |
| --- | --- | --- |
| 29 okt 2026 | **Het dashboard wordt het hoveniers-CRM**, onder `/dashboard` met de bestaande inlog. Volgorde: contacten → leads → tuinopname → calculatie → offertes → projecten → facturen. | Eén systeem van aanvraag tot factuur. [roadmap.md](roadmap.md) |
| 29 okt 2026 | **Opslag: Blob nu, Postgres later.** Postgres pas bij een tweede gebruiker of het klantportaal; vraag Nick vóór een betaalde dienst. | [ADR 0001](architecture/decisions/0001-opslag-blob-eerst.md) |
| 29 okt 2026 | **Geld in centen**, hoeveelheden in duizendsten, afronden op één plek. | [ADR 0002](architecture/decisions/0002-geld-in-centen.md) |
| 29 okt 2026 | **Geen nieuwe afhankelijkheden** zonder eigen ADR. | [ADR 0003](architecture/decisions/0003-geen-nieuwe-afhankelijkheden.md) |
| 29 okt 2026 | **De bestaande Google-inlog is de poort**; klanten loggen nooit in op `/dashboard`. `/clients` is gereserveerd voor een later klantportaal. | [ADR 0004](architecture/decisions/0004-bestaande-inlog.md) |
| 29 okt 2026 | **Offerte via privélink** (`/offerte/[token]`, 30 dagen), akkoord zonder inlog; er wordt niets automatisch gemaild. Een klantlogin komt nog niet. | Simpel voor de klant, geen accountbeheer. PR #156 |
| 29 okt 2026 | **Intake en projectvoorbereiding: fase 1 (plan) klaar**; één bewerkbare checklist, video via beelden uit de browser, Claude stelt voor en de code rekent. Fase 2 wacht op Nicks ja. Weggelaten: volledig offline, tekenen op foto's, audio uitschrijven, sleep-Gantt, tweede chat. | [intake.md](architecture/intake.md), ADR 0005–0007 (voorgesteld) |
| 29 okt 2026 | Claude krijgt nooit naam, telefoon, e-mail of adres van een klant. | Privacy. `src/lib/crm/context.ts` |

## De site

| Datum | Besluit | Waarom |
| --- | --- | --- |
| 9 okt 2026 | **gronn.studio draait op deze repo** (Vercel-project `gronn26`). De vorige site (`gronn-studio`) serveert alleen nog links.gronn.studio. | Nieuwe opbouw. |
| 11 okt 2026 | **Palet aards, zonder groen:** licht = warm zand met donkere aarde, donker = warm aardebruin; oranje op volle sterkte. Geen bosgroen of salie. | Nick houdt van de Grova-look; "hou niet van dat bosgroen, salie". |
| 18 okt 2026 | **Eén oranje: #FF5B04** overal, uit het logo. Oranje als tekst op licht: #B84000 (22 okt). | Herkenning; contrast. |
| 18 okt 2026 | **Navigatie:** één glazen pil onderaan (Home, Werk, Studio, Shop, menu), Omhoog als laatste tijdens het lezen; op desktop ook een brede balk bovenaan. Shop = shoptas (22 okt). Mand, tuinbroek en kruiwagen zijn geprobeerd en afgewezen. | Zie [architecture/site.md](architecture/site.md#navigatie). |
| 18 okt 2026 | Voet in warm aardebruin; de vijverrand (lisdodde, lelies) is weg en komt niet terug. | "Haal deze onzin weg." |
| 10 okt 2026 | De balk "Nu in de maand" is weg; geen cijferstrook tot er echte cijfers zijn. | Geen loze inhoud. |
| 21 okt 2026 | **Kleur Auto volgt de klok**: donker van 19:00 tot 07:00. | Voorspelbaar, geen locatievraag. |
| 22 okt 2026 | Zoomen staat aan. | Toegankelijkheid. |
| 25 okt 2026 | **Twee layouts**, Klassiek en Blueprint, 50/50 met meting. | Meten in plaats van gokken. |
| 4 okt 2026 | Kennisbank weg van de site; `/kennisbank` gaat naar `/faq`. Equilibrium blijft de aparte kennisbank. | Focus. |
| 29 sep 2026 | **Nergens op de site zeggen dat Claude de site bouwt.** | Nick. |
| 24 sep 2026 | Alleen echt werk, met toestemming; sfeerbeelden dragen het label Sfeerbeeld; nooit minderjarigen in beeld. | Eerlijkheid en privacy. |
| 21 okt 2026 | Basisbeveiligingsheaders, geen CSP. | Gouden regel; inline scripts. |
| 3 okt 2026 | Leeseffect (tekst die oplicht) alleen op intro's, niet op lopende tekst. | Leesbaarheid. |

## Nog open (wacht op Nick)

- Uurtarief en dagprijs als vast beleid, en de andere voorstellen uit de winstanalyse.
- Fase 2 van de intake-engine.
- Wat DigiBoox als import accepteert, voor de facturenexport.
- Welke UI-ideeën voor het CRM eerst: telefoonvriendelijke opname, klantkaart-overzicht, snelle acties op Vandaag, vast totaal op Prijs.
- Prijs van opgestuurde borderpakketten.

import { BUSINESS } from "@/lib/business"
import { HERROEPING_REGELS } from "./herroeping"
import type { LegalDocument } from "./types"

// Algemene voorwaarden voor particuliere opdrachtgevers.
//
// Geschreven op aanneming van werk (Boek 7 titel 12 BW) en het
// consumentenrecht, niet op koop. Dat onderscheid loopt door de hele
// tekst: een tuin wordt niet geleverd maar aangelegd, en de regels over
// oplevering, meerwerk en verborgen gebreken zijn daarom andere dan die
// van een webshop.
//
// DRIE DINGEN DIE HIER ANDERS ZIJN DAN IN HET CONCEPT DAT ER STOND.
//
// 1. **Er staat nu een artikel over bedenktijd in, en dat is het zwaarste
//    artikel van het document.** De intake vindt plaats bij de klant
//    thuis; een overeenkomst die daar tot stand komt valt onder art.
//    6:230o BW en draagt veertien dagen bedenktijd. De uitzondering voor
//    "op maat gemaakt" in art. 6:230p sub f geldt voor zaken en niet voor
//    diensten, dus die redt een hovenier niet. Wie hier niet over
//    informeert loopt tegen art. 6:230o lid 2: de bedenktijd rekt op tot
//    twaalf maanden.
//
// 2. **De stilzwijgende verlenging van het abonnement is gerepareerd.**
//    Het concept zei: verlengt stilzwijgend tenzij een maand voor het
//    einde opgezegd — dus wie het venster mist zit nog een jaar vast. Dat
//    is art. 6:236 sub j BW, de zwarte lijst, en zo'n beding is
//    vernietigbaar. Na het eerste jaar loopt het nu voor onbepaalde tijd
//    door, elk moment opzegbaar met één maand.
//
// 3. **Geen verwijzing naar het Europese ODR-platform.** Verordening
//    524/2013 is ingetrokken bij Verordening 2024/3228; het platform is
//    per 20 maart 2025 gestopt. Vrijwel elk sjabloon dat online circuleert
//    heeft die link nog. Hem overnemen zou de klant naar een dode dienst
//    sturen.
//
// Wat hier NIET in staat en er ook niet in hoort: een beding dat een
// wettelijk consumentenrecht uitsluit. Aansprakelijkheid wordt beperkt,
// niet uitgesloten; opzet en bewuste roekeloosheid blijven buiten die
// beperking, want anders is het beding zelf vernietigbaar.

export const VOORWAARDEN_CONSUMENT: LegalDocument = {
  id: "voorwaarden-consument",
  slug: "voorwaarden",
  title: "Algemene voorwaarden voor particuliere opdrachtgevers",
  kind: "voorwaarden",
  audience: "consument",
  updated: "2026-09-24",
  status: "concept",
  intro:
    `Deze voorwaarden gelden voor alle offertes, opdrachten en overeenkomsten tussen ${BUSINESS.name} en particuliere opdrachtgevers. Ze zijn geschreven om leesbaar te zijn. Waar de wet de klant meer rechten geeft dan hieronder staat, geldt de wet — een voorwaarde kan een wettelijk consumentenrecht niet wegnemen.`,
  sections: [
    {
      heading: "Wie wij zijn en waarop deze voorwaarden van toepassing zijn",
      body: [
        `${BUSINESS.name}, gevestigd aan ${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}, ingeschreven bij de Kamer van Koophandel onder nummer ${BUSINESS.kvk}, btw-identificatienummer ${BUSINESS.btw}. Rechtsvorm: ${BUSINESS.legalForm}. Bereikbaar via ${BUSINESS.email} en ${BUSINESS.phone}.`,
        "Deze voorwaarden gelden voor tuinadvies, tuinontwerp, beplantingsplannen, tuinaanleg, renovatie en onderhoud, en voor alles wat daarmee samenhangt.",
        "Ze gelden voor particuliere opdrachtgevers. Voor zakelijke opdrachtgevers gelden aparte voorwaarden; die staan op dezelfde plek op de website.",
        "Afspraken die afwijken van deze voorwaarden gelden alleen wanneer ze schriftelijk zijn vastgelegd. Wat in een offerte staat gaat vóór wat hier staat.",
      ],
    },

    {
      heading: "Offertes en het ontstaan van de overeenkomst",
      body: [
        "Een offerte is vrijblijvend en dertig dagen geldig, tenzij er in de offerte zelf een andere termijn staat. Staat er een kortere termijn, dan geldt die.",
        "Een offerte is gebaseerd op de situatie zoals wij die hebben gezien en op de gegevens die de opdrachtgever heeft aangeleverd. Blijkt die situatie wezenlijk anders, dan bespreken we dat voordat we verder gaan.",
        "De overeenkomst komt tot stand op het moment dat de opdrachtgever de offerte aanvaardt. Een bevestiging per e-mail of bericht is daarvoor voldoende; wij bevestigen de opdracht schriftelijk terug.",
        "Na afloop van de geldigheidsduur kunnen wij opnieuw calculeren op basis van de dan geldende materiaal-, transport-, afval-, machine- en leveranciersprijzen.",
        "Ontwerpen, tekeningen, beplantingsplannen en adviezen blijven ons intellectueel eigendom, ook nadat ze zijn betaald, tenzij schriftelijk anders is afgesproken. De opdrachtgever mag ze gebruiken voor het eigen project. Ze mogen niet zonder onze toestemming worden verveelvoudigd, gepubliceerd of door een ander laten uitvoeren.",
      ],
    },

    {
      heading: "Bedenktijd van veertien dagen",
      body: [
        "Dit artikel gaat over een recht dat de wet de opdrachtgever geeft. Lees het, ook als de rest van deze voorwaarden ongelezen blijft.",
        "Komt de overeenkomst tot stand bij de opdrachtgever thuis, op een andere plek buiten onze bedrijfsruimte, of volledig op afstand — per e-mail, telefoon of via de website — dan heeft de opdrachtgever veertien dagen bedenktijd. Binnen die veertien dagen kan de overeenkomst zonder opgave van redenen worden herroepen. Onze intake vindt in de regel bij de opdrachtgever thuis plaats, dus in de meeste gevallen geldt dit recht.",
        "De bedenktijd begint op de dag nadat de overeenkomst is gesloten.",
        "Herroepen kan met een ondubbelzinnige mededeling per e-mail of brief, of met het modelformulier voor herroeping. Dat formulier krijgt de opdrachtgever bij de opdrachtbevestiging mee en is ook op de website te vinden.",
        "Wil de opdrachtgever dat wij al binnen de bedenktijd beginnen — met werkvoorbereiding, het bestellen van materiaal of de uitvoering zelf — dan kan dat alleen als daar uitdrukkelijk om wordt verzocht. Wij leggen dat verzoek vast en bevestigen het schriftelijk.",
        "Wordt daarna alsnog binnen de bedenktijd herroepen, dan is de opdrachtgever een evenredig deel verschuldigd van wat er op dat moment al is geleverd, afgezet tegen de volledige opdracht. Is het werk op verzoek van de opdrachtgever binnen de bedenktijd volledig uitgevoerd, dan vervalt het herroepingsrecht — de opdrachtgever verklaart dat te weten op het moment dat om die uitvoering wordt gevraagd.",
        "Wij betalen na een herroeping binnen veertien dagen terug wat de opdrachtgever heeft betaald, verminderd met het hierboven bedoelde evenredige deel.",
      ],
    },

    {
      heading: "Ontwerp en uitvoering zijn twee dingen",
      body: [
        "Een ontwerpopdracht en een uitvoeringsopdracht zijn afzonderlijke overeenkomsten, ook wanneer ze in één offerte staan. Een goedgekeurd ontwerp verplicht niemand tot uitvoering.",
        "Een ontwerp is af wanneer de opdrachtgever het schriftelijk heeft goedgekeurd. Daarna zijn wijzigingen meerwerk.",
        "Voeren wij het ontwerp zelf uit, dan wordt de helft van het ontwerpbedrag verrekend met de eerste uitvoeringsfactuur. Een betaalde doorlichting wordt volledig verrekend met een vervolgopdracht boven € 750. Verrekening vindt eenmalig plaats en wordt niet in geld uitgekeerd.",
        "Beschrijvingen van hoe een tuin zich zal ontwikkelen zijn een inschatting op basis van vakmanschap. Het zijn geen toegezegde resultaten.",
      ],
    },

    {
      heading: "Prijzen, stelposten, meerwerk en minderwerk",
      body: [
        "Prijzen voor particuliere opdrachtgevers zijn inclusief btw, tenzij uitdrukkelijk anders vermeld.",
        "Een stelpost is een geraamd bedrag voor een onderdeel dat nog niet definitief is bepaald. Stelposten worden afgerekend op basis van de daadwerkelijk gekozen uitvoering en de werkelijk benodigde hoeveelheid. Wijkt dat af van de raming, dan bespreken wij dat vooraf.",
        "Meerwerk is alles wat buiten de omschreven opdracht valt: wijzigingen op verzoek van de opdrachtgever, extra bestrating of hekwerk, aanvullende beplanting, extra grond, extra container- of afvoerkosten, extra machinehuur, drainage, onvoorziene beton- of puinlagen en aanvullende grondverbetering.",
        "Meerwerk wordt vooraf besproken en pas na akkoord uitgevoerd. De enige uitzondering is direct handelen dat nodig is om schade of een onveilige situatie te voorkomen; ook dan melden wij het zo snel mogelijk.",
        "Minderwerk wordt verrekend wanneer een onderdeel vervalt vóórdat het is besteld of uitgevoerd, voor zover daarvoor nog geen kosten zijn gemaakt die niet meer ongedaan te maken zijn.",
        "Kleine afwijkingen in hoeveelheden zonder wezenlijke invloed op materiaal- of arbeidskosten vallen binnen de normale uitvoering en worden niet verrekend.",
      ],
    },

    {
      heading: "Planning, weer en onvoorziene omstandigheden",
      body: [
        "De uitvoeringsperiode wordt in overleg ingepland na opdrachtbevestiging, definitieve inmeting en materiaalreservering. Genoemde data zijn indicatief totdat materiaalbeschikbaarheid, machineplanning en weersomstandigheden bevestigd zijn.",
        "Regen, vorst, extreme hitte, langdurige droogte of een verzadigde bodem kunnen een vaktechnisch goede uitvoering onmogelijk maken. In dat geval verschuiven wij het werk in overleg. Weersvertraging geeft geen recht op korting of schadevergoeding, en ontslaat de opdrachtgever niet van betaling van wat al is uitgevoerd.",
        "De prijs gaat uit van normale grondcondities. Verborgen beton, funderingsresten, puinlagen, wortelstobben, vervuilde grond, oude constructies, kabels of leidingen zijn niet inbegrepen. Treffen wij die aan, dan leggen wij het werk zo nodig tijdelijk stil en bespreken wij de aanvullende werkzaamheden en kosten vooraf.",
        "Deze bepaling geeft ons geen vrijbrief. Wat wij bij een normale opname hadden kunnen zien, hadden wij moeten zien.",
      ],
    },

    {
      heading: "Wat wij van de opdrachtgever nodig hebben",
      body: [
        "· vrije en veilige toegang tot het werkterrein op de afgesproken dagen;",
        "· opgave vóór aanvang van bekende particuliere kabels, leidingen, drainage, beregening en andere ondergrondse voorzieningen;",
        "· de juiste aanwijzing van eigendoms- en erfgrenzen, en waar nodig toestemming van buren of vergunningverleners;",
        "· kosteloos gebruik van water en elektriciteit tijdens de uitvoering;",
        "· ruimte voor het plaatsen van materiaal, machines en een container.",
        "Wij verrichten geen kadastrale grensbepaling en vragen geen vergunningen aan, tenzij dat afzonderlijk is afgesproken.",
        "Niet gemelde particuliere voorzieningen waarvan de ligging niet zichtbaar was en redelijkerwijs niet bekend kon zijn, vallen buiten onze verantwoordelijkheid.",
        "Kan het werk door het ontbreken van een van deze zaken niet doorgaan op een afgesproken dag, dan kunnen wij de daardoor werkelijk gemaakte kosten in rekening brengen.",
      ],
    },

    {
      heading: "Materialen, beplanting en levend materiaal",
      body: [
        "Materialen worden geleverd volgens de overeengekomen soort, maat en uitvoering, voor zover beschikbaar bij leverancier of fabrikant. Bij niet-beschikbaarheid stellen wij alleen na overleg een gelijkwaardig alternatief voor.",
        "Natuurlijke of producttypische verschillen in kleur, maat, structuur, trommeling en veroudering zijn geen gebrek wanneer ze binnen de normale productspecificaties vallen. Getrommelde straatbaksteen en cortenstaal zijn daarvan de duidelijkste voorbeelden: cortenstaal ontwikkelt na plaatsing een roestpatina, en tijdens dat proces kan tijdelijk roestwater of verkleuring van aangrenzende materialen optreden.",
        "Speciaal voor een project bestelde materialen kunnen na bestelling niet altijd worden geannuleerd of geretourneerd. Kosten die daardoor onomkeerbaar zijn gemaakt, blijven bij annulering verschuldigd.",
        "Plantmateriaal is seizoens- en voorraadgebonden. De definitieve plantprijs wordt bij bestelling vastgesteld op basis van de dan geldende consumentenadviesprijs en de afgesproken korting.",
        "Planten worden bij levering visueel gecontroleerd en in gezonde staat aangeplant. Na oplevering is de opdrachtgever verantwoordelijk voor voldoende watergift en regulier onderhoud, tenzij daarvoor een afzonderlijke onderhoudsopdracht is gesloten.",
        "Uitval door droogte, vorst, hitte, ziekte, vraat, huisdieren, onvoldoende watergift of andere externe omstandigheden valt niet onder kosteloze vervanging. Uitval die aantoonbaar het gevolg is van ondeugdelijk plantmateriaal of van onjuist aanplanten door ons, wel.",
        "Graszoden moeten na aanleg direct en gedurende de bewortelingsfase voldoende vochtig worden gehouden. Uitdroging of schade door intensief gebruik, huisdieren, ziekte of onvoldoende beregening na oplevering valt buiten garantie.",
      ],
    },

    {
      heading: "Betaling",
      body: [
        "Tenzij in de offerte anders staat, factureren wij in termijnen die aan het werk zijn gekoppeld. Welke termijnen dat zijn, staat in de offerte; de opdrachtgever weet dus vóór akkoord wanneer wat betaald moet worden.",
        "De betaaltermijn is veertien dagen na factuurdatum.",
        "Een aanbetaling bij opdrachtbevestiging dekt werkvoorbereiding, het reserveren van uitvoeringscapaciteit en het bestellen van projectspecifieke materialen.",
        "Bij niet-tijdige betaling kunnen wij verdere werkzaamheden en materiaalbestellingen opschorten totdat de betreffende termijn is voldaan. Aantoonbare extra kosten of vertraging die daardoor ontstaat kunnen wij doorberekenen.",
        "Blijft betaling uit, dan sturen wij eerst een kosteloze aanmaning met een termijn van veertien dagen om alsnog te betalen. Pas daarna zijn wij gerechtigd de wettelijke rente en incassokosten in rekening te brengen, berekend volgens de staffel van het Besluit vergoeding voor buitengerechtelijke incassokosten. Die aanmaning is niet optioneel: zonder haar zijn incassokosten bij een consument niet verschuldigd.",
      ],
    },

    {
      heading: "Oplevering",
      body: [
        "Na afronding lopen wij het werk samen na. Kleine opleverpunten herstellen wij binnen een redelijke termijn.",
        "Het werk geldt als opgeleverd wanneer de opdrachtgever het heeft aanvaard, of wanneer wij hebben laten weten dat het klaar is en de opdrachtgever niet binnen een redelijke termijn reageert.",
        "Het werkgebied wordt bezemschoon opgeleverd. Dieptereiniging of het reinigen van bestaande tuinonderdelen is niet inbegrepen.",
        "Schade die na oplevering ontstaat door gebruik, door derden of door werk van andere partijen valt buiten onze herstelverplichting.",
      ],
    },

    {
      heading: "Klachten, herstel en garantie",
      body: [
        "Wij staan in voor een vaktechnisch correcte uitvoering van het overeengekomen werk. Dat is een wettelijke verplichting en die kan niet worden weggeschreven.",
        "Zichtbare gebreken meldt de opdrachtgever bij oplevering of zo snel mogelijk daarna. Andere gebreken meldt de opdrachtgever binnen [[klachttermijn]] na ontdekking. Wij reageren binnen vijf dagen en zoeken samen naar een oplossing.",
        "Een melding buiten die termijn nemen wij nog steeds in behandeling wanneer de opdrachtgever het gebrek redelijkerwijs niet eerder kon ontdekken. De termijn is bedoeld om ons in staat te stellen iets te herstellen, niet om een klacht af te wijzen.",
        "Garantie die wij zelf geven bovenop de wet: [[eigen garantietermijnen per onderdeel: bestrating, constructiewerk, beplanting]].",
        "Normale zetting, natuurlijke veroudering, mosvorming, vervuiling, materiaaltypische kleur- en maatvariaties en gevolgen van weersinvloeden zijn geen gebrek.",
        "Bij nieuw aangebrachte grond kan natuurlijke inklinking optreden. Een absolute garantie tegen latere zetting is niet te geven; grond aanvullen na natuurlijke zetting valt buiten de aanneemsom tenzij schriftelijk anders is afgesproken.",
        "Werk nabij bestaande bomen voeren wij zorgvuldig uit. Zonder specifiek boomtechnisch onderzoek kunnen wij niet instaan voor reeds bestaande wortelschade of toekomstige vitaliteitsproblemen.",
      ],
    },

    {
      heading: "Aansprakelijkheid",
      body: [
        "Onze aansprakelijkheid voor schade is beperkt tot het bedrag dat onze aansprakelijkheidsverzekering in het betreffende geval uitkeert. Keert de verzekering niet uit, dan is de aansprakelijkheid beperkt tot het factuurbedrag van de betreffende opdracht.",
        "Deze beperking geldt niet bij opzet of bewuste roekeloosheid van onze kant, en niet bij schade door dood of lichamelijk letsel. Die uitzonderingen zijn dwingend recht.",
        "Wij zijn verzekerd bij [[verzekeraar]] met een dekking van [[dekkingsbedrag]] per gebeurtenis.",
        "Wij zijn niet aansprakelijk voor schade door niet vooraf zichtbare gebreken in bestaande constructies, lekkages, leidingen, dieren, of gebruik waarvoor het aangelegde onderdeel niet is ontworpen.",
        "Schakelen wij voor een deel van het werk een ander in, dan zijn wij voor diens werk aansprakelijk alsof wij het zelf hadden uitgevoerd.",
      ],
    },

    {
      heading: "Annulering en beëindiging",
      body: [
        "De opdrachtgever kan de overeenkomst op elk moment opzeggen. Dat volgt uit de wet en wij maken het niet moeilijker dan het is.",
        "Bij opzegging is de opdrachtgever verschuldigd: het werk dat al is verricht, de kosten die wij al onomkeerbaar hebben gemaakt — waaronder projectspecifiek bestelde materialen die niet te retourneren zijn — en de winst die wij door de opzegging mislopen, verminderd met wat wij door de opzegging besparen.",
        "Wij zeggen alleen op als het werk redelijkerwijs niet kan worden voortgezet, bijvoorbeeld doordat de opdrachtgever ondanks aanmaning geen toegang verleent of een opeisbare termijn niet betaalt. Dan brengen wij het uitgevoerde werk en de gemaakte kosten in rekening.",
        "Wordt een van beide partijen failliet verklaard of raakt die in surseance, dan mag de ander de overeenkomst beëindigen.",
      ],
    },

    {
      heading: "Onderhoudsabonnementen",
      body: [
        "Een onderhoudsabonnement wordt aangegaan voor [[looptijd van het abonnement]] en gefactureerd per [[factuurritme]].",
        "Na afloop van de eerste termijn loopt het abonnement door voor onbepaalde tijd. De opdrachtgever kan het vanaf dat moment op elk gewenst moment opzeggen, met een opzegtermijn van ten hoogste één maand. Dat volgt uit de wet en wij kunnen daar niet van afwijken.",
        "Opzeggen kan op dezelfde manier als het abonnement is aangegaan: een bericht per e-mail is voldoende. Wij bevestigen de opzegging.",
        "Het maandbedrag kan jaarlijks per 1 januari worden geïndexeerd volgens de prijsindex van het CBS. Een verhoging boven die index melden wij ten minste [[aankondigingstermijn prijswijziging]] vooraf; de opdrachtgever kan het abonnement dan opzeggen tegen de datum waarop de verhoging ingaat.",
        "Seizoensbezoeken zijn afhankelijk van het weer en het seizoen. Waar omstandigheden een gepland bezoek zinloos of schadelijk maken, verschuiven wij het in overleg in plaats van het uit te voeren omdat de agenda dat zegt.",
        "Voorrang bij een storing betekent voorrang bij het inplannen. Een reparatie wordt apart geoffreerd.",
      ],
    },

    {
      heading: "Wat niet is inbegrepen, tenzij uitdrukkelijk vermeld",
      body: [
        "· vergunningen, leges, kadastrale grensbepaling en toestemming van derden;",
        "· drainage, rioleringswerk, hemelwaterinstallaties, elektra, tuinverlichting en automatische beregening;",
        "· bodemonderzoek, sanering, asbestverwijdering en afvoer van vervuilde grond of gevaarlijke stoffen;",
        "· sloop van verborgen betonconstructies, funderingen, oude zwembadkuipen of zwaar puin;",
        "· boomtechnisch onderzoek, het rooien van grote bomen of stobben en specialistisch wortelwerk;",
        "· renovatie van bestaand terras, overkapping, bestaande schuttingen of aangrenzend werk;",
        "· onderhoud na oplevering, tenzij afzonderlijk overeengekomen;",
        "· werkzaamheden op of via percelen van buren zonder door de opdrachtgever geregelde toestemming.",
      ],
    },

    {
      heading: "Persoonsgegevens",
      body: [
        "Wij verwerken persoonsgegevens om een aanvraag te beoordelen, een opdracht uit te voeren en onze administratie te voeren. Hoe wij dat doen, met welke partijen wij gegevens delen en hoe lang wij ze bewaren, staat in onze privacyverklaring.",
        "Foto's van een uitgevoerd project gebruiken wij alleen voor eigen portfolio of publicatie wanneer de opdrachtgever daar vooraf toestemming voor heeft gegeven. Die toestemming kan op elk moment worden ingetrokken.",
      ],
    },

    {
      heading: "Klachten en geschillen",
      body: [
        "Kom eerst bij ons. Een klacht die wij niet kennen kunnen wij niet oplossen. Meld hem via " +
          BUSINESS.email +
          " of " +
          BUSINESS.phone +
          "; wij reageren binnen vijf dagen.",
        "Komen wij er samen niet uit, dan kan de opdrachtgever het geschil voorleggen aan de bevoegde Nederlandse rechter. [[Deelname aan een geschillencommissie — invullen of schrappen]].",
        "Op alle overeenkomsten is Nederlands recht van toepassing. Deze rechtskeuze ontneemt een consument niet de bescherming van dwingend recht van het land waar hij woont.",
      ],
    },

    {
      heading: "Wijziging van deze voorwaarden",
      body: [
        "Wij kunnen deze voorwaarden wijzigen. Op een lopende overeenkomst gelden de voorwaarden die golden op het moment dat die overeenkomst werd gesloten.",
        "De actuele versie staat altijd op de website, met de datum waarop hij is vastgesteld.",
      ],
    },

    {
      heading: "Bijlage — modelformulier voor ontbinding / herroeping",
      body: [
        "Dit formulier hoort bij het artikel over bedenktijd hierboven. De bewoording is wettelijk voorgeschreven; de opmaak is die van ons.",
        "Gebruik ervan is niet verplicht: een duidelijke mededeling per e-mail of brief werkt evengoed.",
        "",
        ...HERROEPING_REGELS,
      ],
    },
  ],
  open: [
    "Rechtsvorm invullen (eenmanszaak, vof of bv) — bepaalt de tenaamstelling en de aansprakelijkheid.",
    "Verzekeraar en dekkingsbedrag van de bedrijfsaansprakelijkheidsverzekering opvragen en invullen. De aansprakelijkheidsbeperking verwijst nu naar een polis die niet is benoemd.",
    "Klachttermijn en reactietermijn kiezen. Het oude concept zei 14 dagen voor beide; dat is verdedigbaar maar het is een keuze, geen wet.",
    "Eigen garantietermijnen per onderdeel vaststellen: bestrating, constructiewerk, beplanting. Nu een open plek.",
    "Looptijd, factuurritme en aankondigingstermijn voor prijswijziging van het onderhoudsabonnement invullen.",
    "Beslissen of je je aansluit bij een geschillencommissie of branchevereniging (VHG). Zo niet: die zin schrappen in plaats van leeg laten.",
    "Het modelformulier staat nu als bijlage in dit document én als los vel (slug herroeping), dus het reist mee met de voorwaarden. Blijft te doen: het ook daadwerkelijk meesturen bij elke offerte aan een particulier — een bijlage die in de map blijft liggen verstrekt niets.",
    "Vastgelegd op 7 sep 2026: offerte 30 dagen geldig, factuur 14 dagen betaaltermijn. De offerte voor Clannad & Stijn zegt nog 14 dagen geldig — die moet naar 30, of hij moet uitdrukkelijk als afwijking worden benoemd.",
    "In de offertesjabloon een vakje opnemen waarin de opdrachtgever uitdrukkelijk verzoekt om aanvang binnen de bedenktijd, met de verklaring dat het herroepingsrecht vervalt bij volledige uitvoering. Zonder dat vakje is de 50%-aanbetaling een risico voor eigen rekening.",
    "Laten toetsen door een Nederlandse jurist voordat dit de status 'vastgesteld' krijgt — in het bijzonder het artikel over bedenktijd en de aansprakelijkheidsbeperking.",
  ],
}

import { BUSINESS } from "@/lib/business"
import type { LegalDocument } from "./types"

// Algemene voorwaarden voor zakelijke opdrachtgevers.
//
// Een eigen document, geen consumentenset met een uitzonderingsparagraaf.
// Dat is een bewuste keuze: de twee lopen op zes punten wezenlijk uiteen,
// en een document dat beide bedient is een document waarin een consument
// een beding vindt dat niet voor hem bedoeld was — en dan is de vraag of
// het beding hem bindt. Twee teksten zijn meer onderhoud en minder risico.
//
// WAT HIER ANDERS IS DAN IN DE CONSUMENTENSET, EN WAAROM.
//
// · **Geen bedenktijd.** Art. 6:230o BW beschermt de consument. Een
//   zakelijke opdrachtgever heeft dat recht niet, en het hier toch
//   opnemen zou een recht weggeven dat de wet niet eist.
// · **Klachtplicht binnen bekwame tijd** (art. 6:89 BW). Bij een
//   consument is een strakke vervaltermijn al snel onredelijk bezwarend;
//   tussen ondernemers is hij normaal en zelfs wettelijk verankerd.
// · **Wettelijke handelsrente** (art. 6:119a BW) in plaats van de gewone
//   wettelijke rente, en geen verplichte kosteloze aanmaning vooraf — die
//   veertiendagenbrief is een consumentenregel.
// · **Eigendomsvoorbehoud** op geleverde materialen. Bij een consument
//   levert dat in de praktijk niets op zodra iets in de grond ligt; bij
//   een aannemer of ontwikkelaar wel.
// · **Ruimere aansprakelijkheidsbeperking**, maar nog steeds niet
//   onbegrensd: opzet en bewuste roekeloosheid blijven eruit. Een
//   volledige uitsluiting daarvan houdt ook tussen ondernemers geen stand.
// · **Opschorting en retentie** expliciet benoemd.
//
// Wat GELIJK blijft: de vakinhoudelijke artikelen. Grondcondities, weer,
// levend materiaal en stelposten gedragen zich niet anders omdat de
// opdrachtgever een bv is.

export const VOORWAARDEN_ZAKELIJK: LegalDocument = {
  id: "voorwaarden-zakelijk",
  slug: "voorwaarden-zakelijk",
  title: "Algemene voorwaarden voor zakelijke opdrachtgevers",
  kind: "voorwaarden",
  audience: "zakelijk",
  updated: "2026-09-24",
  status: "concept",
  intro:
    `Deze voorwaarden gelden voor offertes, opdrachten en overeenkomsten tussen ${BUSINESS.name} en opdrachtgevers die handelen in de uitoefening van een beroep of bedrijf. Handelt de opdrachtgever als consument, dan gelden onze consumentenvoorwaarden — die geven meer bescherming en gaan in dat geval voor.`,
  sections: [
    {
      heading: "Toepasselijkheid",
      body: [
        `${BUSINESS.name}, gevestigd aan ${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}, KvK ${BUSINESS.kvk}, btw ${BUSINESS.btw}. Rechtsvorm: ${BUSINESS.legalForm}.`,
        "Deze voorwaarden gelden voor tuinadvies, tuinontwerp, beplantingsplannen, aanleg, renovatie en onderhoud, en voor alle daaruit voortvloeiende opdrachten.",
        "Inkoop-, aanbestedings- of andere voorwaarden van de opdrachtgever worden uitdrukkelijk van de hand gewezen en gelden niet, ook niet wanneer daar in correspondentie naar wordt verwezen, tenzij wij de toepasselijkheid ervan schriftelijk hebben aanvaard.",
        "Afwijkingen gelden alleen wanneer ze schriftelijk zijn vastgelegd. Wat in een opdrachtbevestiging staat gaat vóór wat hier staat.",
      ],
    },

    {
      heading: "Offertes en opdracht",
      body: [
        "Offertes zijn vrijblijvend en dertig dagen geldig, tenzij anders vermeld, en kunnen tot aanvaarding worden herroepen.",
        "Een offerte is gebaseerd op de situatie zoals wij die hebben opgenomen en op de door de opdrachtgever verstrekte gegevens, tekeningen en maten. Voor de juistheid daarvan is de opdrachtgever verantwoordelijk.",
        "De overeenkomst komt tot stand door onze schriftelijke opdrachtbevestiging, of doordat wij met de uitvoering beginnen.",
        "Wordt de opdracht in fasen uitgevoerd, dan kunnen wij de uitvoering van een volgende fase opschorten totdat de opdrachtgever de voorafgaande fase schriftelijk heeft goedgekeurd.",
        "Ontwerpen, tekeningen, beplantingsplannen, berekeningen en adviezen blijven ons intellectueel eigendom. De opdrachtgever verkrijgt een gebruiksrecht voor het overeengekomen project; verveelvoudiging, publicatie of uitvoering door een derde vereist onze voorafgaande schriftelijke toestemming.",
      ],
    },

    {
      heading: "Prijzen en verrekening",
      body: [
        "Prijzen voor zakelijke opdrachtgevers zijn exclusief btw, tenzij uitdrukkelijk anders vermeld.",
        "Stijgen tussen offerte en uitvoering de kosten van materiaal, transport, afvalverwerking, machinehuur, brandstof of arbeid met meer dan [[drempel prijswijziging in procenten]], dan zijn wij gerechtigd die stijging door te berekenen. Wij melden dat vooraf en onderbouwd.",
        "Stelposten worden afgerekend op basis van de daadwerkelijk gekozen uitvoering en de werkelijk benodigde hoeveelheid.",
        "Verrekenbare hoeveelheden worden na uitvoering ingemeten en afgerekend tegen de in de offerte genoemde eenheidsprijzen.",
      ],
    },

    {
      heading: "Meerwerk en minderwerk",
      body: [
        "Wijzigingen in de opdracht, aanvullingen en werk dat voortvloeit uit onvoorziene omstandigheden gelden als meerwerk en worden verrekend tegen de overeengekomen eenheidsprijzen, of bij gebreke daarvan tegen ons geldende uurtarief van [[uurtarief]] plus materiaal.",
        "Meerwerk wordt vooraf besproken en pas na schriftelijk akkoord uitgevoerd, behalve wanneer direct handelen nodig is om schade of een onveilige situatie te voorkomen. In dat geval melden wij het zo spoedig mogelijk.",
        "Voor meerwerk geldt geen opdrachtbevestiging als voorwaarde voor betaling wanneer de opdrachtgever heeft ingestemd op een wijze die uit de omstandigheden blijkt, bijvoorbeeld door het werk te laten uitvoeren.",
        "Minderwerk wordt verrekend voor zover daarvoor nog geen onomkeerbare kosten zijn gemaakt.",
      ],
    },

    {
      heading: "Uitvoering, planning en omstandigheden",
      body: [
        "Genoemde uitvoeringsdata zijn indicatief en gelden niet als fatale termijn, tenzij een termijn uitdrukkelijk als fataal is overeengekomen.",
        "Wij zijn gerechtigd het werk geheel of gedeeltelijk door derden te laten uitvoeren. Voor het werk van door ons ingeschakelde hulppersonen zijn wij aansprakelijk als voor eigen werk.",
        "Regen, vorst, extreme hitte, langdurige droogte of een verzadigde bodem kunnen een vaktechnisch goede uitvoering verhinderen. Wij verschuiven het werk dan in overleg. Weersvertraging geeft geen recht op korting, boete of schadevergoeding.",
        "De prijs gaat uit van normale grondcondities en normale bereikbaarheid voor passend materieel. Verborgen beton, funderingsresten, puinlagen, wortelstobben, vervuilde grond, oude constructies, kabels of leidingen zijn niet inbegrepen.",
        "De opdrachtgever staat in voor tijdige beschikbaarheid van het werkterrein, voor opgave van de ligging van kabels en leidingen, voor de juiste aanwijzing van erfgrenzen, voor de benodigde vergunningen en ontheffingen, en voor kosteloze aansluiting op water en elektriciteit.",
        "Kan het werk door een oorzaak die voor rekening van de opdrachtgever komt niet doorgaan op een ingeplande dag, dan brengen wij de daardoor werkelijk gemaakte kosten in rekening, waaronder stagnatie- en wachturen tegen ons geldende uurtarief.",
      ],
    },

    {
      heading: "Materialen, eigendomsvoorbehoud en levend materiaal",
      body: [
        "Alle geleverde materialen blijven ons eigendom totdat de opdrachtgever alles heeft voldaan wat hij uit hoofde van de overeenkomst verschuldigd is, inclusief rente en kosten. Zolang het eigendomsvoorbehoud geldt, mag de opdrachtgever de materialen niet bezwaren of aan derden overdragen.",
        "Dit voorbehoud werkt niet meer zodra materiaal door verwerking bestanddeel is geworden van de onroerende zaak. Dat is een feitelijke grens, geen keuze van partijen.",
        "Natuurlijke en producttypische verschillen in kleur, maat, structuur en veroudering zijn geen gebrek wanneer zij binnen de normale productspecificaties vallen.",
        "Speciaal voor het project bestelde materialen kunnen na bestelling niet altijd worden geannuleerd of geretourneerd; reeds onomkeerbaar gemaakte kosten blijven bij annulering verschuldigd.",
        "Plantmateriaal is seizoens- en voorraadgebonden. Uitval door droogte, vorst, hitte, ziekte, vraat, onvoldoende watergift of andere externe omstandigheden na oplevering valt niet onder garantie.",
      ],
    },

    {
      heading: "Betaling",
      body: [
        "Facturen worden voldaan binnen veertien dagen na factuurdatum, tenzij in de opdrachtbevestiging een andere termijn staat. Dat is korter dan de dertig dagen die de wet als terugvaloptie kent; korter mag, mits het is overeengekomen — en dat is het, hier.",
        "Wij zijn gerechtigd in termijnen te factureren naar rato van de voortgang, en een aanbetaling te verlangen voordat wij met de uitvoering beginnen.",
        "Bij overschrijding van de betaaltermijn is de opdrachtgever zonder ingebrekestelling in verzuim en is hij de wettelijke handelsrente verschuldigd als bedoeld in artikel 6:119a BW.",
        "De buitengerechtelijke incassokosten bedragen [[incassopercentage]] van de openstaande hoofdsom met een minimum van [[minimumbedrag incassokosten]]. Anders dan bij een consument is daarvoor geen voorafgaande kosteloze aanmaning vereist.",
        "De opdrachtgever is niet gerechtigd te verrekenen of zijn betalingsverplichting op te schorten.",
        "Blijft betaling uit, dan zijn wij gerechtigd de uitvoering op te schorten en ons beroep te doen op het retentierecht: wij houden zaken van de opdrachtgever onder ons totdat is betaald.",
      ],
    },

    {
      heading: "Oplevering en klachten",
      body: [
        "Het werk wordt als opgeleverd beschouwd wanneer de opdrachtgever het heeft aanvaard, of wanneer wij hebben meegedeeld dat het gereed is en de opdrachtgever niet binnen veertien dagen schriftelijk en gemotiveerd heeft gereageerd.",
        "De opdrachtgever onderzoekt het werk bij oplevering. Zichtbare gebreken meldt hij bij oplevering; andere gebreken meldt hij binnen bekwame tijd na ontdekking, en in elk geval binnen veertien dagen na oplevering. Meldt hij niet tijdig, dan vervalt zijn aanspraak — dit is de klachtplicht van artikel 6:89 BW.",
        "Een klacht schort de betalingsverplichting niet op.",
        "Wij zijn na oplevering niet meer aansprakelijk voor gebreken die de opdrachtgever bij oplevering redelijkerwijs had moeten ontdekken, behoudens verborgen gebreken.",
      ],
    },

    {
      heading: "Aansprakelijkheid",
      body: [
        "Onze aansprakelijkheid is beperkt tot het bedrag dat onze aansprakelijkheidsverzekering in het betreffende geval uitkeert, vermeerderd met het eigen risico. Keert de verzekering niet uit, dan is de aansprakelijkheid beperkt tot de aanneemsom van de betreffende opdracht, met een maximum van [[maximum aansprakelijkheid]].",
        "Wij zijn niet aansprakelijk voor gevolgschade, waaronder bedrijfsschade, gederfde winst, gemiste besparingen, schade door bedrijfsstagnatie en schade door aanspraken van derden op de opdrachtgever.",
        "Deze beperkingen gelden niet bij opzet of bewuste roekeloosheid van ons of van onze leidinggevenden, en niet bij schade door dood of lichamelijk letsel.",
        "De opdrachtgever vrijwaart ons voor aanspraken van derden die verband houden met door hem verstrekte onjuiste gegevens, met niet gemelde ondergrondse voorzieningen, of met het ontbreken van een vereiste vergunning of toestemming.",
        "Elke aanspraak vervalt door verloop van [[vervaltermijn aanspraken]] na oplevering, tenzij de opdrachtgever de aanspraak binnen die termijn schriftelijk heeft gemeld en binnen een jaar daarna in rechte heeft gevorderd.",
        "Wij zijn verzekerd bij [[verzekeraar]] met een dekking van [[dekkingsbedrag]] per gebeurtenis.",
      ],
    },

    {
      heading: "Opschorting, ontbinding en overmacht",
      body: [
        "Wij zijn gerechtigd de uitvoering op te schorten of de overeenkomst te ontbinden wanneer de opdrachtgever een verplichting niet nakomt, in staat van faillissement wordt verklaard, surseance aanvraagt of onder bewind wordt gesteld, of wanneer op zijn zaken beslag wordt gelegd.",
        "Onder overmacht verstaan wij in ieder geval: extreme of langdurige weersomstandigheden, overheidsmaatregelen, transportbelemmeringen, tekortkomingen van toeleveranciers, ziekte van sleutelpersoneel, storingen in energie- of datanetwerken, en het niet beschikbaar zijn van projectspecifieke materialen.",
        "Duurt de overmacht langer dan [[overmachtstermijn]], dan mag elk van beide partijen de overeenkomst ontbinden voor het niet-uitgevoerde deel, zonder tot schadevergoeding gehouden te zijn. Reeds uitgevoerd werk wordt afgerekend.",
      ],
    },

    {
      heading: "Onderhoudsovereenkomsten",
      body: [
        "Een onderhoudsovereenkomst wordt aangegaan voor [[looptijd zakelijk onderhoud]] en verlengt telkens met dezelfde periode, tenzij een van beide partijen uiterlijk [[opzegtermijn zakelijk onderhoud]] vóór het einde van de lopende periode schriftelijk opzegt.",
        "Voor zakelijke opdrachtgevers geldt de wettelijke beperking op stilzwijgende verlenging uit artikel 6:236 BW niet; die is voorbehouden aan consumenten. Deze verlengingsregel is daarmee toegestaan, maar wel een keuze — hij mag ook milder.",
        "Prijzen worden jaarlijks per 1 januari geïndexeerd volgens de prijsindex van het CBS.",
        "Seizoensbezoeken zijn afhankelijk van weer en seizoen en worden bij ongeschikte omstandigheden in overleg verschoven.",
      ],
    },

    {
      heading: "Persoonsgegevens en geheimhouding",
      body: [
        "Verwerken wij bij de uitvoering persoonsgegevens waarvoor de opdrachtgever verwerkingsverantwoordelijke is, dan sluiten partijen daarvoor een verwerkersovereenkomst.",
        "Partijen houden bedrijfsgegevens die zij van elkaar ontvangen en waarvan het vertrouwelijke karakter kenbaar is, geheim.",
        "Wij mogen het uitgevoerde werk in beeld en woord gebruiken voor eigen portfolio en publicatie, tenzij de opdrachtgever daar vooraf schriftelijk bezwaar tegen maakt.",
      ],
    },

    {
      heading: "Toepasselijk recht en geschillen",
      body: [
        "Op alle overeenkomsten is Nederlands recht van toepassing. Het Weens Koopverdrag is uitgesloten.",
        "Geschillen worden voorgelegd aan de bevoegde rechter in [[arrondissement]], onverminderd ons recht de opdrachtgever te dagvaarden voor de rechter van zijn woon- of vestigingsplaats.",
      ],
    },
  ],
  open: [
    "Rechtsvorm invullen — zelfde veld als in de consumentenset.",
    "Drempel voor het doorberekenen van prijsstijgingen kiezen (bijvoorbeeld 5%). Zonder getal is het beding niet toepasbaar.",
    "Uurtarief voor meerwerk en stagnatie-uren invullen.",
    "Incassopercentage en minimumbedrag vaststellen. Tussen ondernemers mag je hiervan afwijken van de wettelijke staffel, maar dan moet het er wel staan.",
    "Klachttermijn na oplevering kiezen voor zakelijke opdrachtgevers.",
    "Maximum aansprakelijkheid en vervaltermijn voor aanspraken vaststellen — bij voorkeur in overleg met je verzekeraar, zodat de polis en de voorwaarden hetzelfde zeggen.",
    "Overmachtstermijn kiezen waarna ontbinding mogelijk is (bijvoorbeeld twee maanden).",
    "Looptijd en opzegtermijn voor zakelijk onderhoud vaststellen.",
    "Arrondissement kiezen voor de forumkeuze. Voor Stein is dat vermoedelijk Limburg, maar dat moet je bevestigen — ik vul geen rechtbank in die ik niet heb nagekeken.",
    "Deponeren bij de KvK of de rechtbank is niet verplicht, maar maakt het bewijs van terhandstelling eenvoudiger. Overwegen.",
    "Laten toetsen door een Nederlandse jurist voordat dit de status 'vastgesteld' krijgt.",
  ],
}

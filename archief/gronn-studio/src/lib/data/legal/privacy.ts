import { BUSINESS } from "@/lib/business"
import type { LegalDocument } from "./types"

// De privacyverklaring.
//
// Dit is het document dat het minst mag afwijken van de werkelijkheid, en
// het document dat daar het makkelijkst van afdrijft: het beschrijft wat
// de software doet, en de software verandert.
//
// TWEE DINGEN DIE HIER ZIJN GEREPAREERD TEN OPZICHTE VAN DE VORIGE VERSIE.
//
// 1. **Supabase stond er niet in.** De vorige verklaring noemde Vercel,
//    FormSubmit en Slack, maar niet de database die klantaccounts,
//    projecten, abonnementen en uren bewaart — de verwerker met de meest
//    gevoelige gegevens van allemaal. Dat is een gat in een wettelijk
//    verplichte opsomming (art. 13 lid 1 sub e AVG).
//
// 2. **Er stond een zin in die niet meer waar was:** "Aanvragen worden
//    per e-mail aan ons bezorgd en worden door ons niet in een database
//    opgeslagen." Dat klopte vóór het klantenportaal. Sindsdien is er een
//    database, en een privacyverklaring die iets ontkent wat wél gebeurt
//    is een zelfstandig risico — los van wat er met de gegevens gebeurt.
//
// De verwerkers hieronder zijn afgeleid uit de code, niet uit een
// aanname: Vercel (hosting + Speed Insights + Blob), FormSubmit
// (formsubmit.co, waar het intakeformulier rechtstreeks vanuit de browser
// naartoe post), Supabase (klantaccounts en dossiers) en MailerLite
// (maillijst). Slack kan de code aan, maar staat uit en dus niet in de lijst. Verdwijnt of verschijnt er één, dan moet deze
// tekst mee — daar is de test voor.

export const PRIVACY: LegalDocument = {
  id: "privacy",
  slug: "privacy",
  title: "Privacyverklaring",
  kind: "privacy",
  audience: "iedereen",
  updated: "2026-09-25",
  status: "concept",
  intro:
    "Korte versie: wij gebruiken wat je ons stuurt om je te antwoorden en je project uit te voeren, wij volgen je niet over het web, en wij verkopen niets door. De lange versie staat hieronder, per soort gegeven.",
  sections: [
    {
      heading: "Wie verantwoordelijk is",
      body: [
        `${BUSINESS.name}, ${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}, KvK ${BUSINESS.kvk}, is verwerkingsverantwoordelijke voor de gegevens die op deze website en in onze dienstverlening worden verwerkt.`,
        `Vragen over privacy, of een verzoek om inzage of verwijdering: ${BUSINESS.email}. Wij reageren binnen een maand.`,
        "Wij hebben geen functionaris voor gegevensbescherming. Dat hoeft ook niet: die verplichting geldt voor overheidsinstanties en voor organisaties die op grote schaal bijzondere gegevens verwerken of mensen stelselmatig volgen, en dat doen wij geen van beide.",
      ],
    },

    {
      heading: "Een projectaanvraag of contactverzoek",
      body: [
        "Wat wij verwerken: je naam, e-mailadres, telefoonnummer als je dat invult, het adres of de locatie van de tuin, en wat je ons over het project vertelt.",
        "Waarvoor: om je aanvraag te beoordelen, je te antwoorden en waar dat volgt een offerte te maken.",
        "Grondslag: uitvoering van een overeenkomst, of stappen die daaraan voorafgaan op jouw verzoek (art. 6 lid 1 sub b AVG).",
        "Hoe lang: aanvragen waar niets uit voortkomt bewaren wij 30 dagen. Wordt het een opdracht, dan gaan de gegevens over in het klantdossier.",
        "Het korte contactformulier stuurt zijn inhoud rechtstreeks vanuit je browser naar FormSubmit (zie hieronder).",
        "De uitgebreide ontwerpintake bewaart je antwoorden en bestanden in onze besloten opslag (zie hieronder); FormSubmit krijgt daarvan alleen een melding met je naam en e-mailadres dát er een intake is. Lukt het bewaren niet, dan gaan je antwoorden als terugval via FormSubmit naar onze mailbox, zodat ze niet verloren gaan.",
        "Wil je geen van beide, dan kun je de intake printen of kopiëren en de antwoorden zelf per e-mail sturen.",
      ],
    },

    // Tekst goedgekeurd door Nick, 24 sep 2026 ("akkoord op de zin"),
    // letterlijk zoals voorgesteld — daarom in de ik-vorm, anders dan de
    // rest van dit document. Hoort bij de maillijst (src/lib/nieuwsbrief.ts).
    {
      heading: "Maillijst en checklist vooraf",
      body: [
        "Als je de checklist vooraf aanvraagt, verwerk ik je e-mailadres om je de checklist te sturen en je af en toe een mail van mij te sturen.",
        "De grondslag is je toestemming; je kunt je op elk moment afmelden.",
        "Je bevestigt je aanmelding eerst via een link in je mail; zonder die bevestiging stuur ik niets.",
        "MailerLite (MailerLite, UAB) bewaart je adres als verwerker en ik verstuur de mails via MailerLite; elke mail heeft een afmeldlink.",
        "Ik bewaar je adres tot je je afmeldt.",
      ],
    },

    {
      heading: "De uitgebreide ontwerpintake",
      body: [
        "Wat wij verwerken: je antwoorden op de intakevragen en de foto's of video's die je meestuurt.",
        "Waarvoor: om een ontwerp te kunnen maken dat op jouw tuin en jouw gebruik is toegesneden.",
        "Waar dit terechtkomt: antwoorden en bestanden worden samen bewaard in privéopslag bij Vercel Blob. Ze zijn alleen te lezen nadat wij op ons eigen paneel hebben ingelogd — niet op een openbaar adres, en niet door wie toevallig een link heeft. Weigert de opslag een bestand, dan wordt het niet ergens anders neergezet: je krijgt te zien dat het niet is gelukt, en kunt het dan zelf mailen.",
        "Zolang je de intake invult, bewaart je browser een concept van je antwoorden op je eigen apparaat, zodat je later verder kunt. Dat concept verlaat je apparaat niet tot je verstuurt, en verdwijnt als je het formulier leegt.",
        "Een kort bericht dát er een aanvraag binnen is gaat naar onze mailbox. Dat bericht bevat je naam en contactgegevens, nooit de bestanden zelf.",
        "Hoe lang: 30 dagen, tenzij het een opdracht wordt; dan gaat het dossier over in het klantdossier.",
      ],
    },

    {
      heading: "Het klantenportaal",
      body: [
        "Krijg je van ons een uitnodiging voor het klantenportaal, dan maken wij een account voor je aan.",
        "Wat wij verwerken: je e-mailadres, een door jou gekozen wachtwoord dat wij versleuteld opslaan en nooit zelf kunnen lezen, en de projectgegevens die bij jouw dossier horen — je project, de planning, wat wij van je nodig hebben, de termijnen, en eventuele documenten.",
        "Waarvoor: om je toegang te geven tot je eigen dossier.",
        "Grondslag: uitvoering van de overeenkomst.",
        "Waar dit staat: bij Supabase, in een database binnen de Europese Unie. Ieder account ziet uitsluitend het eigen dossier; dat is niet alleen een afspraak maar een regel die de database zelf afdwingt.",
        "Het portaal gebruikt cookies om je ingelogd te houden. Die zijn noodzakelijk om te kunnen inloggen en vereisen geen toestemming.",
        "Hoe lang: zolang je klant bent en daarna [[bewaartermijn klantdossiers]]. Wil je je account eerder gesloten hebben, dan doen wij dat op verzoek — de administratieve gegevens die wij fiscaal moeten bewaren blijven dan wel bestaan.",
      ],
    },

    {
      heading: "Offertes, facturen en administratie",
      body: [
        "Wat wij verwerken: naam, adres, contactgegevens en de gegevens van de opdracht.",
        "Waarvoor: om te kunnen offreren, factureren en onze boekhouding te voeren.",
        "Grondslag: uitvoering van de overeenkomst, en voor de boekhouding een wettelijke verplichting (art. 6 lid 1 sub c AVG).",
        "Hoe lang: de fiscale bewaarplicht is zeven jaar. Die termijn kunnen wij niet verkorten op verzoek — ook niet op jouw verzoek.",
      ],
    },

    {
      heading: "Bezoek aan de website",
      body: [
        "Deze website plaatst geen tracking- of advertentiecookies en gebruikt geen advertentienetwerken.",
        "Wij meten wel de laadsnelheid, via Vercel Speed Insights. Dat verzamelt geanonimiseerde prestatiemetingen, plaatst geen cookie en identificeert of volgt je niet.",
        "Zoals elke host verwerkt Vercel technische verzoekgegevens, waaronder IP-adressen, in serverlogs. Dat is nodig om de site veilig en werkend te leveren.",
        "Je browser bewaart daarnaast je eigen voorkeuren lokaal: het palet en de taal die je koos, je instellingen voor tekstgrootte, beweging en onderstreepte links, of je de opening hebt gezien, of je de installatiemelding hebt weggeklikt, en je recente zoekopdrachten. Die gegevens verlaten je apparaat niet en vereisen geen toestemming.",
        "De website zet twee functionele cookies voor je taal: welke taal je ziet, en of je die zelf koos. Ze gelden een jaar, zodat de server de pagina meteen in jouw taal kan sturen. Het klantenportaal zet daarnaast cookies om je ingelogd te houden. Andere cookies zijn er niet.",
      ],
    },

    // Toegevoegd 25 sep 2026 met de servercontrole van de easter eggs
    // (eigenaar: "Privacyverklaring krijgt een regel erbij"). Alleen wat
    // de code doet (src/lib/easter-eggs.ts, src/lib/eieren-opslag.ts);
    // grondslag en bewaartermijn staan open voor de jurist.
    {
      heading: "Easter eggs en de Instagram-actie",
      body: [
        "Op deze website zitten verstopte kleine dingen (easter eggs), met een verzamelkaart die bijhoudt welke je gevonden hebt. Die kaart staat in je eigen browser.",
        "Zodra je er één vindt, maakt je browser een willekeurige, anonieme code aan en bewaart die lokaal. Bij elke vondst stuurt je browser die code mee, met welk easter egg het is; onze server legt vast welke easter eggs onder die code gevonden zijn en wanneer. Wij vragen en bewaren daarbij geen naam, geen e-mailadres en geen IP-adres, en er wordt geen cookie voor gezet.",
        "Waarvoor: om bij de Instagram-actie te kunnen controleren of een inzending klopt en wie het eerst was. Wie het doel haalt, ziet op de kaart een controlecode; stuur je die ons, dan kunnen wij hem koppelen aan de vondsten onder jouw anonieme code.",
        "Waar dit staat: in onze opslag bij Vercel Blob.",
        "Grondslag: [[grondslag controle easter-egg-actie]].",
        "Hoe lang: [[bewaartermijn easter-egg-gegevens (voorstel: tot drie maanden na het einde van de actie)]].",
      ],
    },

    {
      heading: "Met wie wij gegevens delen",
      body: [
        "Wij verkopen je gegevens niet en delen ze niet voor commerciële doelen van anderen. Wij schakelen wel partijen in die voor ons gegevens verwerken:",
        "· **Vercel Inc.** — hosting van de website, prestatiemetingen, en Vercel Blob voor de opslag van intakedossiers, documenten en de anonieme gegevens van de easter-egg-actie.",
        "· **Supabase** — de database achter het klantenportaal: accounts, projecten, abonnementen en urenregistratie.",
        "· **FormSubmit (formsubmit.co)** — bezorgt de ingevulde formuliervelden per e-mail bij ons. Het formulier post rechtstreeks vanuit je browser naar deze dienst.",
        "· **MailerLite (MailerLite, UAB)** — bewaart de adressen van de maillijst en verstuurt die mails.",
        "· **Google (Google Workspace)** — onze mailbox en agenda.",
        "· **[[boekhoudsoftware, indien van toepassing]]** — verwerking van facturen.",
        "Met elk van deze partijen hoort een verwerkersovereenkomst te bestaan (art. 28 AVG). Status: [[status verwerkersovereenkomsten per partij]].",
        "Sommige van deze partijen zijn in de Verenigde Staten gevestigd of kunnen daar gegevens verwerken. Voor die doorgifte gelden de standaardbepalingen van de Europese Commissie of het EU-VS Data Privacy Framework. Welke grondslag per partij geldt: [[doorgiftegrondslag per partij]].",
        "Neem je contact op via WhatsApp of Instagram, dan loopt dat via de diensten van Meta, onder de voorwaarden en de privacyverklaring van Meta zelf. Wat je ons daar stuurt, gebruiken wij alleen om je te antwoorden.",
        "Daarnaast kunnen wij gegevens delen met onderaannemers die aan jouw tuin werken, voor zover zij die nodig hebben om hun werk te doen. Zij mogen die gegevens nergens anders voor gebruiken.",
      ],
    },

    {
      heading: "Foto's van je tuin",
      body: [
        "Wij maken tijdens en na het werk foto's, voor onze eigen dossiervorming.",
        "Voor gebruik in portfolio, op de website of op sociale media vragen wij je vooraf om toestemming. Die toestemming is vrij te geven en op elk moment in te trekken; trek je haar in, dan halen wij het beeld weg bij de eerstvolgende gelegenheid.",
        "Grondslag voor publicatie: toestemming (art. 6 lid 1 sub a AVG).",
      ],
    },

    {
      heading: "Beveiliging",
      body: [
        "Wij nemen passende technische en organisatorische maatregelen. Concreet: verkeer met de website loopt uitsluitend over een versleutelde verbinding, wachtwoorden worden versleuteld opgeslagen en zijn ook voor ons niet leesbaar, intakedossiers staan in privéopslag die alleen na inloggen te lezen is, en het klantenportaal dwingt in de database zelf af dat een account alleen het eigen dossier ziet.",
        "Wat een verklaring als deze niet doet, is beveiligen. Deze alinea beschrijft maatregelen; hij vervangt ze niet.",
        "Vermoed je een lek of een zwakke plek, meld het dan via " +
          BUSINESS.email +
          ". Wij nemen zo'n melding serieus en koppelen terug.",
      ],
    },

    {
      heading: "Je rechten",
      body: [
        "Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen, om de verwerking te laten beperken, om bezwaar te maken, en om je gegevens in een gangbaar formaat mee te krijgen.",
        "Heb je toestemming gegeven, dan kun je die op elk moment intrekken. Dat raakt niet aan wat daarvóór al is verwerkt.",
        `Een verzoek stuur je naar ${BUSINESS.email}. Wij reageren binnen een maand. Kunnen wij een verzoek niet uitvoeren — bijvoorbeeld omdat de fiscale bewaarplicht in de weg staat — dan leggen wij uit waarom.`,
        "Ben je het oneens met hoe wij met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens. Wij horen het liever eerst zelf, maar dat recht staat los van ons.",
      ],
    },

    {
      heading: "Wijzigingen",
      body: [
        "Wij werken deze verklaring bij wanneer de website of onze dienstverlening verandert. De actuele versie staat altijd op deze pagina, met de datum waarop hij is gewijzigd.",
      ],
    },
  ],
  open: [
    "Bewaartermijnen invullen: aanvragen zonder vervolg, intakedossiers, klantdossiers na afloop. Drie keuzes, en het moeten keuzes zijn — 'zolang als nodig' is geen termijn.",
    "Google Workspace staat nu als mailbox en agenda (OPERATIONS.md: \"mail is Google Workspace\"); bevestigen, en de verwerkersovereenkomst met Google nagaan.",
    "Door een jurist laten toetsen: de zin over WhatsApp en Instagram (Meta als zelfstandig verantwoordelijke), en of de terugval van de intake via FormSubmit zo beschreven kan blijven.",
    "Boekhoudsoftware benoemen, of deze regel schrappen als je alles zelf doet.",
    "Per verwerker nagaan of er een verwerkersovereenkomst is: Vercel en Supabase bieden die standaard aan. FormSubmit is de open vraag — die dienst ontvangt naam, e-mail en de volledige inhoud van het intakeformulier. Als daar geen verwerkersovereenkomst voor te krijgen is, is dat een reëel bezwaar tegen die dienst en geen formaliteit.",
    "Doorgiftegrondslag per partij vaststellen (EU-VS Data Privacy Framework of standaardbepalingen).",
    "Slack is geschrapt: wel een account, niet in gebruik (eigenaar, 24 sep 2026; SLACK_WEBHOOK_URL staat niet). Zet je de melding ooit aan, dan hoort Slack hier weer als verwerker bij.",
    "Bevestigen dat het productieproject van het klantenportaal in de EU draait. Het enige Supabase-project dat ik vanaf hier kan zien draait in eu-central-1 (Frankfurt) — dat is de EU, dus de bewering klopt vóór dát project. Maar `NEXT_PUBLIC_SUPABASE_URL` staat hier niet in de omgeving, dus ik kan niet vaststellen dát het productieproject is. Even naast elkaar leggen.",
    "Laten toetsen door een jurist met AVG-ervaring voordat dit de status 'vastgesteld' krijgt.",
    "Easter eggs en de Instagram-actie (toegevoegd 25 sep 2026) door een jurist laten toetsen: is de anonieme code een persoonsgegeven zodra iemand zijn controlecode in een Instagram-DM stuurt, welke grondslag hoort erbij (gerechtvaardigd belang, of de actievoorwaarden), en is de bewaartermijn goed. Kies de termijn — voorstel: tot drie maanden na het einde van de actie (EI_ACTIE.eind) — en ruim daarna alles onder `eieren/` in de Blob-opslag op.",
  ],
}

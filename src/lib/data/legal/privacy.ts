// 6 okt 2026: herschreven voor deze site (eigenaar: "maak alles wat ik juridisch
// nodig heb compleet"). Geen klantenportaal, maillijst, intake of easter eggs
// meer; alleen wat gronn.studio nu echt doet. De notities hieronder gaan over
// de oude site.
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
  updated: "2026-10-06",
  status: "vastgesteld",
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
        "Het kennismakingsformulier stuurt zijn inhoud rechtstreeks vanuit je browser naar FormSubmit (zie hieronder), dat het als e-mail bij ons bezorgt.",
        "Liever niet via het formulier? Mail of app ons dan gewoon.",
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
        "Deze website plaatst geen tracking- of advertentiecookies, gebruikt geen advertentienetwerken en geen bezoekersstatistieken.",
        "Zoals elke host verwerkt Vercel technische verzoekgegevens, waaronder IP-adressen, in serverlogs. Dat is nodig om de site veilig en werkend te leveren.",
        "Je browser bewaart je eigen voorkeuren lokaal: de kleur en taal die je koos, je instellingen voor tekstgrootte, beweging, contrast, onderstreepte links en geluid, of je de opening al hebt gezien en of je de installatiemelding hebt weggeklikt. Die gegevens verlaten je apparaat niet en vereisen geen toestemming.",
        "Bezoekers krijgen geen cookies. Alleen de eigenaar zet bij het inloggen in het beheergedeelte één noodzakelijk cookie om ingelogd te blijven.",
      ],
    },


    {
      heading: "Met wie wij gegevens delen",
      body: [
        "Wij verkopen je gegevens niet en delen ze niet voor commerciële doelen van anderen. Wij schakelen wel partijen in die voor ons gegevens verwerken:",
        "· **Vercel Inc.** — hosting van de website.",
        "· **FormSubmit (formsubmit.co)** — bezorgt de ingevulde formuliervelden per e-mail bij ons. Het formulier post rechtstreeks vanuit je browser naar deze dienst.",
        "· **Google (Google Workspace)** — onze mailbox, agenda en bestandsopslag.",
        "· **DigiBoox** — offertes, facturen en boekhouding.",
        "Deze partijen verwerken gegevens alleen in onze opdracht. Sommige zijn in de Verenigde Staten gevestigd of kunnen daar gegevens verwerken; voor die doorgifte gelden de standaardbepalingen van de Europese Commissie of het EU-VS Data Privacy Framework.",
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
        "Wij nemen passende technische en organisatorische maatregelen. Concreet: verkeer met de website loopt uitsluitend over een versleutelde verbinding, het beheergedeelte is alleen bereikbaar na inloggen met het Google-account van de eigenaar, en klantdossiers staan in afgeschermde opslag die alleen wij kunnen openen.",
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
    "FormSubmit biedt geen verwerkersovereenkomst aan (niets te vinden op hun site). Het formulier stuurt naam, e-mail en het bericht via hen; wil je dat afdekken, vervang het dan ooit door verzenden via je eigen mailbox.",
    "Eén keer laten toetsen door een jurist.",
  ],
}

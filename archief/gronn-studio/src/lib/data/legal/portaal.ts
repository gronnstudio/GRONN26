import { BUSINESS } from "@/lib/business"
import type { LegalDocument } from "./types"

// Gebruiksvoorwaarden voor het klantenportaal.
//
// Geen wettelijke plicht — er bestaat geen artikel dat zegt "wie een
// besloten omgeving aanbiedt, moet daar voorwaarden bij leveren". Wel
// verstandig, en om één reden die zwaarder weegt dan de andere: het
// portaal geeft toegang tot documenten, en op het moment dat een klant
// zegt "dat heb ik nooit gezien" is de vraag wat een account is en wat
// erop stond.
//
// Wat hier NIET in staat: een beding dat aansprakelijkheid voor
// beschikbaarheid volledig uitsluit. Het portaal is onderdeel van de
// dienstverlening waarvoor betaald is; het volledig wegschrijven van de
// verplichting het te laten werken is bij een consument een beding op de
// grijze lijst.
//
// De zin over "je ziet alleen je eigen dossier" is bewust feitelijk
// geformuleerd en niet als belofte: de database dwingt het af met
// policies, en dat is wat er staat. Een voorwaardentekst hoort niet te
// beweren dat iets veilig is; hij hoort te zeggen hoe het is geregeld.

export const PORTAAL: LegalDocument = {
  id: "portaal",
  slug: "portaal",
  title: "Gebruiksvoorwaarden klantenportaal",
  kind: "portaal",
  audience: "iedereen",
  updated: "2026-09-07",
  status: "concept",
  intro: `Deze voorwaarden gelden voor het gebruik van het klantenportaal van ${BUSINESS.name}. Ze staan naast de algemene voorwaarden die op je opdracht van toepassing zijn; bij tegenstrijdigheid gaan die laatste voor.`,
  sections: [
    {
      heading: "Wat het portaal is",
      body: [
        "Het klantenportaal is een besloten omgeving waarin je je eigen projectgegevens kunt bekijken: het traject, de planning, wat wij van je nodig hebben, de termijnen en de documenten die bij je opdracht horen.",
        "Het portaal is een gemak, geen zelfstandige dienst. Wat er staat, komt uit je dossier; wat rechtens geldt, staat in je offerte en in de algemene voorwaarden.",
        "Toegang is op uitnodiging. Je kunt je niet zelf aanmelden voor een project dat niet van jou is.",
      ],
    },

    {
      heading: "Je account",
      body: [
        "Wij maken een account aan op het e-mailadres dat je ons hebt gegeven. Je kiest zelf een wachtwoord; wij slaan dat versleuteld op en kunnen het niet lezen.",
        "Het account is persoonlijk. Deel je inloggegevens niet. Vermoed je dat iemand anders erbij kan, laat het ons dan weten — wij zetten het account dan stil en helpen je met een nieuw wachtwoord.",
        "Je ziet uitsluitend het dossier dat bij jou hoort. Dat is niet alleen een afspraak: de database controleert bij elke opvraging of je de eigenaar van het dossier bent, en weigert de rest.",
        "Je bent zelf verantwoordelijk voor wat er onder jouw account gebeurt, tenzij je ons tijdig hebt gemeld dat het misbruikt wordt.",
      ],
    },

    {
      heading: "Wat je met de inhoud mag",
      body: [
        "Documenten die in je portaal staan — offertes, facturen, planningen — mag je downloaden, bewaren, printen en delen met wie je wilt: je partner, je aannemer, je boekhouder. Het zijn jouw documenten.",
        "Ontwerpen, tekeningen en beplantingsplannen blijven ons intellectueel eigendom. Je mag ze gebruiken voor je eigen project; ze door een ander laten uitvoeren of publiceren mag alleen met onze toestemming. Dit staat ook in de algemene voorwaarden en is hier herhaald omdat het portaal de plek is waar je ze tegenkomt.",
      ],
    },

    {
      heading: "Beschikbaarheid",
      body: [
        "Wij doen ons best het portaal beschikbaar te houden, maar kunnen geen ononderbroken beschikbaarheid garanderen. Onderhoud, storingen bij onze leveranciers of een internetprobleem kunnen het portaal tijdelijk onbereikbaar maken.",
        "Is het portaal onbereikbaar en heb je iets nodig, vraag het dan gewoon: wij sturen elk document dat in je portaal staat ook per e-mail. Het portaal is nooit de enige weg naar je eigen stukken.",
        "Wij kunnen het portaal wijzigen of stoppen. Stoppen wij ermee, dan laten wij dat ruim vooraf weten en krijg je je documenten op een andere manier.",
      ],
    },

    {
      heading: "Wat niet mag",
      body: [
        "· proberen toegang te krijgen tot gegevens die niet van jou zijn;",
        "· het portaal geautomatiseerd uitlezen of belasten op een manier die de dienst hindert;",
        "· beveiligingsmaatregelen omzeilen of testen zonder onze toestemming.",
        "Vind je iets dat niet klopt — een dossier dat niet van jou is, een pagina die te veel toont — meld het dan via " +
          BUSINESS.email +
          ". Wij zijn je dankbaar en rekenen het je niet aan.",
      ],
    },

    {
      heading: "Einde van je toegang",
      body: [
        "Je kunt op elk moment vragen om je account te sluiten.",
        "Wij sluiten een account [[termijn sluiten account na afronding]] na afronding van je opdracht, tenzij je klant blijft via een onderhoudsabonnement. Voordat wij dat doen, laten wij het je weten zodat je kunt bewaren wat je wilt bewaren.",
        "Bij misbruik kunnen wij een account direct stilzetten. Wij melden dat en leggen uit waarom.",
        "Het sluiten van je account is niet hetzelfde als het wissen van je gegevens: wat wij fiscaal moeten bewaren, blijft bestaan. Wat wij daarover bewaren en hoe lang, staat in de privacyverklaring.",
      ],
    },

    {
      heading: "Persoonsgegevens",
      body: [
        "Welke gegevens wij in het portaal verwerken, waarom, met wie wij ze delen en hoe lang wij ze bewaren, staat in de privacyverklaring.",
        "Het portaal gebruikt één cookie, om je ingelogd te houden. Die is noodzakelijk voor de dienst en vereist geen toestemming.",
      ],
    },
  ],
  open: [
    "Termijn kiezen waarna een account na afronding van de opdracht wordt gesloten.",
    "Beslissen of je een responsible-disclosureregeling wilt formaliseren. De zin over melden staat er nu vriendelijk in; een echte regeling zegt ook binnen welke termijn je reageert en dat je niet vervolgt.",
    "Controleren of de belofte 'elk document uit je portaal sturen wij ook per e-mail' klopt met hoe je werkt. Staat het er, dan moet het waar zijn.",
  ],
}

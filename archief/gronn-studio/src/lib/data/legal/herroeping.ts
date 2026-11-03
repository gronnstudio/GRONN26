import { BUSINESS } from "@/lib/business"
import type { LegalDocument } from "./types"

// Het modelformulier voor ontbinding / herroeping.
//
// WAAROM DIT EEN EIGEN DOCUMENT IS. Informeren dát er bedenktijd is en het
// formulier daadwerkelijk verstrekken zijn twee losse plichten. De
// voorwaarden doen het eerste; dit doet het tweede. Wie het tweede
// overslaat ziet de bedenktijd van veertien dagen oprekken tot twaalf
// maanden — de duurste vergetelheid in dit dossier, en het kost één
// bijlage om te voorkomen.
//
// DE BEWOORDING IS VOORGESCHREVEN, NIET VAN ONS. Ze staat in bijlage I
// deel B van richtlijn 2011/83/EU, in Nederlands recht overgenomen, en de
// ACM publiceert haar als publicatie 12754. De tekst hieronder is
// woordelijk die van de ACM, door de eigenaar aangeleverd — ik kon acm.nl
// vanuit de bouwomgeving niet zelf inzien (netwerkpolicy), dus dit is zijn
// exemplaar en niet mijn reconstructie.
//
// WAT ER WÉL VAN ONS IS: de opmaak en het ingevulde "Aan"-blok. Aan de
// vorm stelt de wet geen eisen — lidstaten mogen daar geen extra
// vormvereisten opleggen — dus dit vel mag in huisstijl, zolang de zinnen
// gelijk blijven. De schrijfregels achter de velden zijn ook opmaak: een
// formulier zonder ruimte om te schrijven is een lijst met opschriften.
//
// Het formulier staat ÉÉN keer in de code en wordt zowel door dit losse
// vel als door het slothoofdstuk van de consumentenvoorwaarden gebruikt.
// Twee kopieën van een voorgeschreven tekst zijn twee kopieën die uit
// elkaar gaan lopen.

/** Waar de klant zijn herroeping heen stuurt — vooraf ingevuld. */
const AAN = `${BUSINESS.name}, ${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city} · ${BUSINESS.email}`

/** Een schrijfregel. Opmaak, geen tekst. */
const REGEL = " ".repeat(2) + "_".repeat(46)

/**
 * De regels van het formulier, in de voorgeschreven volgorde en
 * bewoording. Geëxporteerd zodat de voorwaarden hem kunnen opnemen zonder
 * de tekst over te schrijven.
 */
export const HERROEPING_REGELS: string[] = [
  "Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt ontbinden / herroepen.",
  "",
  `Aan: ${AAN}`,
  "",
  "Ik/Wij (*) deel/delen (*) u hierbij mede dat ik/wij (*) onze overeenkomst betreffende de verkoop van de volgende goederen/levering van de volgende dienst (*) herroep/herroepen (*)",
  "",
  `Besteld op (*)/Ontvangen op (*)${REGEL}`,
  `Naam/Namen consument(en)${REGEL}`,
  `Adres consument(en)${REGEL}`,
  `Handtekening van consument(en)${REGEL}`,
  "[alleen wanneer dit formulier op papier wordt ingediend]",
  `Datum${REGEL}`,
  "",
  "(*) Doorhalen wat niet van toepassing is.",
]

export const HERROEPING: LegalDocument = {
  id: "herroeping",
  slug: "herroeping",
  title: "Modelformulier voor ontbinding / herroeping",
  kind: "formulier",
  audience: "consument",
  updated: "2026-09-08",
  status: "concept",
  intro:
    "Wilt u de overeenkomst binnen de bedenktijd ontbinden, dan kunt u dit formulier gebruiken. Het hoeft niet — een duidelijke mededeling per e-mail of brief volstaat ook. Wij bevestigen de ontvangst.",
  sections: [
    {
      heading: "Het formulier",
      body: HERROEPING_REGELS,
    },
    {
      heading: "Wat u verder moet weten",
      body: [
        "U heeft veertien dagen bedenktijd, gerekend vanaf de dag nadat de overeenkomst is gesloten. Binnen die termijn kunt u ontbinden zonder opgave van redenen.",
        `Stuur het formulier of uw mededeling naar ${BUSINESS.email}, of per post naar ${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city}.`,
        "U bent op tijd wanneer u uw mededeling verstuurt vóórdat de bedenktijd is verstreken.",
        "Heeft u ons uitdrukkelijk gevraagd al binnen de bedenktijd te beginnen en ontbindt u daarna alsnog, dan bent u een evenredig deel verschuldigd van wat op dat moment al is geleverd, afgezet tegen de volledige opdracht. Is het werk op uw verzoek binnen de bedenktijd volledig uitgevoerd, dan vervalt het herroepingsrecht.",
        "Wij betalen binnen veertien dagen na uw mededeling terug wat u heeft betaald, verminderd met dat evenredige deel.",
      ],
    },
  ],
  open: [
    "Dit formulier meesturen bij ELKE offerte aan een particulier, samen met de algemene voorwaarden. Zonder verstrekking rekt de bedenktijd op naar twaalf maanden — dat is de enige fout in dit dossier die je direct geld kan kosten.",
    "Publicatie 12753 van de ACM (de modelinstructie) naast artikel 03 van de consumentenvoorwaarden leggen. Dat artikel doet de informatieplicht; dit formulier de verstrekkingsplicht. De twee horen hetzelfde te zeggen.",
  ],
}

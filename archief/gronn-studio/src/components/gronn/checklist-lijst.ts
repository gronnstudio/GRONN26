import { BUSINESS } from "@/lib/business"
import { pricingFor } from "@/lib/data/pricing"
import { consumerPrice } from "@/lib/format"
import { pick, type L, type Locale } from "@/lib/i18n"
import {
  CONTACT_BUDGETTEN,
  CONTACT_UITNODIGING,
  KENNISMAKING_VRIJBLIJVEND,
} from "./teksten"

// De checklist vooraf (/checklist) — de weggever van de maillijst.
//
// CONCEPT, wacht op Nicks akkoord. De regel is dezelfde als bij /faq:
// NIETS NIEUWS. Elk punt komt uit tekst die al op de site staat — de
// werkwijze en "Over mij" (teksten.ts), de diensten
// (content/site-content.json), de prijzen (pricing.ts), de veelgestelde
// vragen (vragen-lijst.ts) en het contactformulier. Een punt draagt zijn
// bron: `waar` zegt waar het staat, `zin` is het stuk Nederlandse tekst
// dat er LETTERLIJK staat. `nieuwsbrief.spec.ts` zoekt elke `zin` op in
// die bronnen; een punt zonder vindplaats laat de test vallen.
//
// De punten zijn vragen die de lezer zelf kan nakijken, geen beloftes:
// het enige wat ze beweren, is wat de bron al beweert.

type Bron = { waar: L; zin: string }
type Punt = { tekst: L; uitleg?: L; bronnen: Bron[] }
type Onderdeel = { id: string; kop: L; intro?: L; punten: Punt[] }

/** Een onderdeel in de taal van de lezer. */
export type ChecklistOnderdeel = {
  id: string
  kop: string
  intro?: string
  punten: { tekst: string; uitleg?: string; bronnen: { waar: string; zin: string }[] }[]
}

/** "a, b of c" / "a, b or c". */
function reeks(items: string[], locale: Locale) {
  if (items.length < 2) return items.join("")
  return `${items.slice(0, -1).join(", ")} ${locale === "en" ? "or" : "of"} ${items[items.length - 1]}`
}

/** De checklist in de taal van de lezer. */
export function checklist(locale: Locale): ChecklistOnderdeel[] {
  const t = (v: L) => pick(v, locale)
  return onderdelen().map((o) => ({
    id: o.id,
    kop: t(o.kop),
    intro: o.intro && t(o.intro),
    punten: o.punten.map((p) => ({
      tekst: t(p.tekst),
      uitleg: p.uitleg && t(p.uitleg),
      bronnen: p.bronnen.map((b) => ({ waar: t(b.waar), zin: b.zin })),
    })),
  }))
}

const W = {
  stap1: { nl: "Werkwijze, stap 01 · Eerst kijken", en: "How I work, step 01 · Looking first" },
  stap2: { nl: "Werkwijze, stap 02 · Uitzoeken hoe het werkt", en: "How I work, step 02 · Working out how it works" },
  stap6: { nl: "Werkwijze, stap 06 · Laten groeien", en: "How I work, step 06 · Letting it grow" },
  overMij: { nl: "Over mij, alinea 2", en: "About me, paragraph 2" },
  uitgangspunt: { nl: "Uitgangspunten (Over mij)", en: "Principles (About me)" },
  tuinontwerp: { nl: "Dienst · Tuinontwerp", en: "Service · Garden design" },
  omvormen: { nl: "Dienst · Bestaande tuin omvormen", en: "Service · Reworking an existing garden" },
  beplanting: { nl: "Dienst · Beplanting", en: "Service · Planting" },
  advies: { nl: "Dienst · Advies op locatie", en: "Service · Advice on site" },
  doorlichting: { nl: "Dienst · Vijverdoorlichting", en: "Service · Pond survey" },
  bladnet: { nl: "Dienst · Bladnet plaatsen (en prijzen)", en: "Service · Leaf net (and prices)" },
  ontwerpNiveau: { nl: "Diensten · niveau Ontwerp", en: "Services · level Design" },
  contact: { nl: "Contactformulier", en: "Contact form" },
  faqPrijs: { nl: "Veelgestelde vragen · intro en “Wat kost een tuinontwerp?”", en: "FAQ · intro and “How much does a garden design cost?”" },
  faqAdvies: { nl: "Veelgestelde vragen · “Wat kost advies aan huis?”", en: "FAQ · “How much does advice at home cost?”" },
  faqBeginnen: { nl: "Veelgestelde vragen · “Wanneer kan ik het best beginnen?”", en: "FAQ · “When is the best time to start?”" },
  faqPlaats: { nl: "Veelgestelde vragen · “Werk je ook in mijn plaats?”", en: "FAQ · “Do you also work where I live?”" },
  contactTekst: { nl: "Contact en veelgestelde vragen · “Hoe begin ik?”", en: "Contact and FAQ · “How do I start?”" },
} satisfies Record<string, L>

function onderdelen(): Onderdeel[] {

  // De vijverdoorlichting en de tuinscan, met hun prijzen uit pricing.ts —
  // dezelfde bron als het antwoord op /faq. Valt de prijs weg, dan valt
  // dit punt weg in plaats van een oud bedrag te noemen.
  const survey = pricingFor("pond-survey")
  const adviesPunt: Punt | null = survey
    ? {
        tekst: { nl: "Heb je eerst iemand nodig die meekijkt?", en: "Do you first need someone to look along with you?" },
        uitleg: {
          nl: `Soms heb je geen ontwerp nodig. ${survey.tiers
            .map((tier) => `${tier.label.nl}: ${consumerPrice(tier.amount, "nl")}`)
            .join(", ")}, inclusief btw.${survey.offset ? ` ${survey.offset.nl}` : ""}`,
          en: `Sometimes you don’t need a design. ${survey.tiers
            .map((tier) => `${tier.label.en}: ${consumerPrice(tier.amount, "en")}`)
            .join(", ")}, including VAT.${survey.offset ? ` ${survey.offset.en}` : ""}`,
        },
        bronnen: [
          { waar: W.ontwerpNiveau, zin: "Soms heb je geen ontwerp nodig, maar iemand die meekijkt." },
          { waar: W.faqAdvies, zin: "De vijverdoorlichting heeft een vaste prijs, inclusief btw" },
        ],
      }
    : null

  const budgetten = (locale: Locale) => reeks(CONTACT_BUDGETTEN.map((b) => pick(b.label, locale)), locale)

  return [
    {
      id: "je-tuin-nu",
      kop: { nl: "Je tuin zoals hij nu is", en: "Your garden as it is now" },
      intro: {
        nl: "Hier kijk ik naar als ik langskom. Kijk er alvast zelf naar.",
        en: "This is what I look at when I come round. Have a look yourself first.",
      },
      punten: [
        {
          tekst: { nl: "Waar valt het licht, en waar is het schaduw?", en: "Where does the light fall, and where is it shady?" },
          bronnen: [
            { waar: W.stap1, zin: "waar het licht valt" },
            { waar: W.stap2, zin: "de bodem, het water, de schaduw" },
          ],
        },
        {
          tekst: { nl: "Waar blijft water staan, en waar gaat het regenwater heen?", en: "Where does water stay, and where does the rainwater go?" },
          bronnen: [
            { waar: W.stap1, zin: "waar water blijft staan" },
            { waar: W.tuinontwerp, zin: "Waar het regenwater heen gaat" },
          ],
        },
        {
          tekst: { nl: "Hoe is de bodem?", en: "What is the soil like?" },
          bronnen: [
            { waar: W.stap2, zin: "Ik breng in kaart wat de plek meebrengt: de bodem, het water, de schaduw." },
            { waar: W.uitgangspunt, zin: "Ik begin bij de bodem en het water" },
          ],
        },
        {
          tekst: { nl: "Wat groeit er al, en welk leven zie je?", en: "What already grows, and what life do you see?" },
          uitleg: { nl: "Vogels, insecten, kikkers en padden.", en: "Birds, insects, frogs and toads." },
          bronnen: [
            { waar: W.stap1, zin: "wat er al groeit" },
            { waar: W.tuinontwerp, zin: "Plek voor vogels, insecten en ander leven" },
            { waar: W.beplanting, zin: "Plek voor kikkers en padden" },
          ],
        },
        {
          tekst: { nl: "Wat mag blijven, en wat mag weg?", en: "What can stay, and what can go?" },
          uitleg: {
            nl: "Denk aan tegels die niets doen, en aan wat er al ligt en opnieuw gebruikt kan worden.",
            en: "Think of paving that serves no purpose, and of what is already there and can be reused.",
          },
          bronnen: [
            { waar: W.omvormen, zin: "Ik kijk wat kan blijven, wat weg mag" },
            { waar: W.omvormen, zin: "Tegels eruit waar ze niets doen" },
            { waar: W.omvormen, zin: "Wat er al ligt opnieuw gebruiken" },
          ],
        },
      ],
    },
    {
      id: "hoe-jij-hem-gebruikt",
      kop: { nl: "Hoe jij de tuin gebruikt", en: "How you use the garden" },
      intro: {
        nl: "Juist die dagelijkse dingen geven richting aan wat ik maak.",
        en: "It’s exactly those everyday things that give direction to what I make.",
      },
      punten: [
        {
          tekst: { nl: "Waar drink je ’s ochtends je koffie?", en: "Where do you drink your coffee in the morning?" },
          bronnen: [{ waar: W.overMij, zin: "Waar drink je ’s ochtends je koffie?" }],
        },
        {
          tekst: { nl: "Waar spelen de kinderen?", en: "Where do the children play?" },
          bronnen: [{ waar: W.overMij, zin: "Waar spelen de kinderen?" }],
        },
        {
          tekst: { nl: "Waar kom je na een drukke dag tot rust?", en: "Where do you come to rest after a busy day?" },
          bronnen: [{ waar: W.overMij, zin: "En waar kom je na een drukke dag tot rust?" }],
        },
        {
          tekst: { nl: "Welk onderhoud past bij jou?", en: "What upkeep suits you?" },
          bronnen: [
            { waar: W.advies, zin: "Welk onderhoud bij jou past" },
            { waar: W.stap6, zin: "het onderhoud stemmen we af op wat bij jou past" },
          ],
        },
        {
          tekst: { nl: "Alles in één keer, of in stappen?", en: "All at once, or in steps?" },
          uitleg: {
            nl: "Een plan in stappen kan, zodat niet alles tegelijk hoeft.",
            en: "A plan in steps is possible, so not everything has to happen at once.",
          },
          bronnen: [
            { waar: W.tuinontwerp, zin: "Een plan in stappen, zodat niet alles tegelijk hoeft" },
            { waar: W.omvormen, zin: "Omvormen in stappen, in jouw tempo" },
          ],
        },
      ],
    },
    {
      id: "heb-je-een-vijver",
      kop: { nl: "Heb je een vijver?", en: "Do you have a pond?" },
      intro: {
        nl: "Deze punten komen uit mijn vijverdoorlichting.",
        en: "These points come from my pond survey.",
      },
      punten: [
        {
          tekst: {
            nl: "Wat zie je: is hij groen, lekt hij, stinkt hij, of leeft er niets in?",
            en: "What do you see: is it green, leaking, smelling, or empty of life?",
          },
          bronnen: [{ waar: W.doorlichting, zin: "een vijver die groen is, lekt, stinkt of waar niets in leeft" }],
        },
        {
          tekst: {
            nl: "Hoeveel uur zon krijgt de vijver, en hoeveel planten staan erin?",
            en: "How many hours of sun does the pond get, and how much is planted in it?",
          },
          bronnen: [{ waar: W.doorlichting, zin: "Zonuren en plantbezetting" }],
        },
        {
          tekst: {
            nl: "Welke pomp draait er, en hoeveel water zit er in de vijver?",
            en: "Which pump is running, and how much water is in the pond?",
          },
          bronnen: [{ waar: W.doorlichting, zin: "Pompcapaciteit tegenover vijverinhoud" }],
        },
        {
          tekst: {
            nl: "Wat ligt eromheen: bomen, een gazon dat bemest wordt, verharding die afspoelt?",
            en: "What is around it: trees, a lawn that gets fed, paving that runs off into it?",
          },
          bronnen: [{ waar: W.doorlichting, zin: "Omgeving — bomen, gazonbemesting, afspoeling van verharding" }],
        },
        {
          tekst: { nl: "Hoe groot is de vijver, in m²?", en: "How big is the pond, in m²?" },
          uitleg: {
            nl: "Staan er bomen bij? Een bladnet moet erop vóór de bladval.",
            en: "Are there trees nearby? A leaf net has to go on before the leaves fall.",
          },
          bronnen: [
            { waar: W.bladnet, zin: "Een net over de vijver vóór de bladval" },
            { waar: W.bladnet, zin: "Tot 15 m²" },
          ],
        },
      ],
    },
    {
      id: "voordat-je-contact-opneemt",
      kop: { nl: "Voordat je contact opneemt", en: "Before you get in touch" },
      punten: [
        {
          tekst: {
            nl: "Waar gaat het over: advies, een ontwerp, aanleg of onderhoud, of een vijver of watersysteem?",
            en: "What is it about: advice, a design, build or maintenance, or a pond or water system?",
          },
          uitleg: { nl: "Weet je het nog niet? Dat mag ook.", en: "Not sure yet? That is fine too." },
          bronnen: [
            { waar: W.contact, zin: "Waar gaat het over?" },
            { waar: W.contact, zin: "Ontwerp — meekijken of een plan" },
            { waar: W.contact, zin: "Aanleg — leg de tuin aan" },
            { waar: W.contact, zin: "Onderhoud — per seizoen" },
            { waar: W.contact, zin: "Vijver of watersysteem" },
            { waar: W.contact, zin: "Weet ik nog niet" },
          ],
        },
        {
          tekst: { nl: "Wat is je budget?", en: "What is your budget?" },
          uitleg: {
            nl: `In het contactformulier kies je: ${budgetten("nl")}. Alle prijzen op de site zijn inclusief btw; voor elk ontwerp maak ik een offerte.`,
            en: `In the contact form you choose: ${budgetten("en")}. All prices on the site include VAT; I quote every design.`,
          },
          bronnen: [
            { waar: W.contact, zin: "Meer dan € 15.000" },
            { waar: W.faqPrijs, zin: "Alle prijzen zijn inclusief btw." },
            { waar: W.faqPrijs, zin: "elk ontwerp krijgt een eigen offerte" },
          ],
        },
        ...(adviesPunt ? [adviesPunt] : []),
        {
          tekst: { nl: "Wanneer wil je beginnen?", en: "When do you want to start?" },
          uitleg: {
            nl: "Het beste moment is de herfst, of net daarvoor. Hoe lang je moet wachten, hangt af van mijn agenda.",
            en: "The best time is autumn, or just before it. How long you wait depends on my calendar.",
          },
          bronnen: [
            { waar: W.faqBeginnen, zin: "Het beste moment is de herfst, of net daarvoor." },
            { waar: W.faqBeginnen, zin: "Hoe lang je moet wachten, hangt af van mijn agenda." },
          ],
        },
        {
          tekst: { nl: "Waar is het? Je plaats of postcode.", en: "Where is it? Your town or postcode." },
          uitleg: {
            nl: `Ik werk vanuit ${BUSINESS.address.city}, ${BUSINESS.address.province}. Ontwerp en advies reizen verder.`,
            en: `I work from ${BUSINESS.address.city}, ${BUSINESS.address.province}. Design and advice travel further.`,
          },
          bronnen: [
            { waar: W.contact, zin: "Plaats of postcode" },
            { waar: W.faqPlaats, zin: `Ik werk vanuit ${BUSINESS.address.city}, ${BUSINESS.address.province}.` },
            { waar: W.faqPlaats, zin: "Ontwerp en advies reizen verder." },
          ],
        },
        {
          tekst: { nl: "Schrijf een paar zinnen over je tuin of vijver.", en: "Write a few sentences about your garden or pond." },
          uitleg: { nl: `${CONTACT_UITNODIGING.nl} ${KENNISMAKING_VRIJBLIJVEND.nl}`, en: `${CONTACT_UITNODIGING.en} ${KENNISMAKING_VRIJBLIJVEND.en}` },
          bronnen: [
            { waar: W.contact, zin: "Vertel kort over je tuin of vijver" },
            { waar: W.contactTekst, zin: CONTACT_UITNODIGING.nl },
            { waar: W.contactTekst, zin: KENNISMAKING_VRIJBLIJVEND.nl },
          ],
        },
      ],
    },
  ]
}

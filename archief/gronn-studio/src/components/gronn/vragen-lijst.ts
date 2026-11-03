import { BUSINESS } from "@/lib/business"
import { pricingFor, priceHint, quoteOffsetFor, type Pricing } from "@/lib/data/pricing"
import { SERVICE_GROUPS, servicesInGroup, type Service, type ServiceKind } from "@/lib/data/services"
import { VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { consumerPrice } from "@/lib/format"
import { pick, type L, type Locale } from "@/lib/i18n"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"
import { KENNISMAKING, PIJLERS } from "./plekken"
import { CONTACT_UITNODIGING, KENNISMAKING_VRIJBLIJVEND, OVER_MIJ, WERKWIJZE } from "./teksten"

// De veelgestelde vragen (/faq), één keer beschreven.
//
// WAAROM DIT BESTAAT. Nick liet op 23 sep 2026 het advies van Dan Hoye
// zien: een site moet je helpen gevonden te worden door Google én door
// AI-hulpen, en hij moet antwoord geven op "wat kost een tuinontwerper?".
// Deze lijst is dat antwoord.
//
// DE REGEL. "Verzin geen klantreacties, projecten, adressen, prijzen,
// keurmerken, ecologische resultaten of bedrijfsstatistieken." Daarom
// staat hier geen enkel bedrag, geen plaats en geen stap met de hand:
// prijzen komen uit `pricing.ts`, diensten uit de samengevoegde
// dienstenlijst (dus ook een wijziging uit /editor), het werkgebied uit
// `werkgebied.ts` en `business.ts`, de werkwijze en "over mij" uit
// `teksten.ts`. Verandert daar iets, dan verandert het antwoord mee.
// Een vraag waarop die bronnen geen antwoord hebben, staat hier alleen
// met Nicks eigen antwoord (duur, welke tuinen, wanneer beginnen: 23 sep
// 2026) — of niet: garantie laat hij bewust weg.
//
// ONTWERP IS ALTIJD EEN OFFERTE (Nick, 23 sep 2026). Er staat geen
// ontwerpprijs in `pricing.ts`, dus ook niet hier; de verrekenregel komt
// uit `QUOTE_OFFSETS`.
//
// Dezelfde lijst voedt de zichtbare pagina, de FAQPage-JSON-LD en de
// zoekfunctie. Wat Google leest is dus letterlijk wat er staat.

/** Een regel in een antwoordlijst: optioneel een vetgedrukt kopje. */
export type Regel = { kop?: string; tekst: string }

export type Vraag = {
  /** Anker op /faq en in de zoekfunctie. */
  id: string
  vraag: string
  alineas: string[]
  lijst?: Regel[]
  /** De verdere lees-link onder het antwoord (geen deel van de tekst). */
  verder?: { href: string; label: string }
}

const SLUG = {
  ontwerp: "garden-design",
  advies: "pond-survey",
  aanleg: "implementation",
} as const

/**
 * Advies aan huis: de eerste stap van Ontwerp (sinds 28 sep 2026 geen
 * eigen niveau meer). "Wat kost een tuinontwerp?" noemt de plannen, "Wat
 * kost advies aan huis?" deze twee — zo zegt geen van beide antwoorden
 * iets over de diensten van het andere.
 */
const ADVIES_DIENSTEN = new Set(["consultancy", "pond-survey"])

/** Alles wat met water te maken heeft, in de volgorde van de niveaus. */
const VIJVER_DIENSTEN = [
  "pond-survey",
  "water-systems",
  "leaf-net",
  "pond-autumn-service",
  "winterising",
  "maintenance-subscription",
]

/** Het antwoord als één tekst: wat de JSON-LD en de zoekfunctie lezen. */
export function antwoordTekst(v: Vraag): string {
  return [...v.alineas, ...(v.lijst ?? []).map((r) => (r.kop ? `${r.kop}. ${r.tekst}` : r.tekst))].join(" ")
}

/**
 * De vragen in de taal van de bezoeker, uit de diensten zoals de site ze
 * rendert. Een vraag waarvan de bron ontbreekt (geen prijs meer voor de
 * vijverdoorlichting, bijvoorbeeld) valt weg in plaats van iets te beweren.
 */
export function vragen(services: Service[], locale: Locale): Vraag[] {
  const t = (v: L) => pick(v, locale)
  const en = locale === "en"
  const prijs = (n: number) => consumerPrice(n, locale)
  const klein = (s: string) => s.charAt(0).toLocaleLowerCase(locale) + s.slice(1)
  const reeks = (items: string[]) =>
    items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${en ? "and" : "en"} ${items[items.length - 1]}`
  const dienst = (slug: string) => services.find((s) => s.slug === slug)
  const btw = en ? "including VAT" : "inclusief btw"

  // "De vijverdoorlichting heeft een vaste prijs, inclusief btw: …". De
  // zin volgt `basis`: een vaste prijs heet alleen zo als pricing.ts dat
  // zegt.
  const prijsZin = (onderwerp: L, p: Pricing) => {
    const voor = p.basis === "from" ? (en ? "from " : "vanaf ") : ""
    const per = p.basis === "monthly" ? (en ? " a month" : " per maand") : ""
    const treden = reeks(
      p.tiers.map(
        (tier) =>
          `${klein(t(tier.label))} ${voor}${prijs(tier.amount)}${tier.amountMax ? `–${prijs(tier.amountMax)}` : ""}${per}`
      )
    )
    if (p.basis === "fixed")
      return en ? `${onderwerp.en} has a fixed price, ${btw}: ${treden}.` : `${onderwerp.nl} heeft een vaste prijs, ${btw}: ${treden}.`
    return en ? `${onderwerp.en} costs, ${btw}: ${treden}.` : `${onderwerp.nl} kost, ${btw}: ${treden}.`
  }

  // De vanafprijs zoals de dienstenkaart hem toont, of "op maat".
  const vanaf = (slug: string) => {
    const h = priceHint(slug)
    if (!h) return en ? "Tailored: quoted per project, after an introduction on site." : "Op maat: per project geoffreerd, na een kennismaking op locatie."
    return `${en ? "From" : "Vanaf"} ${prijs(h.from)}${h.monthly ? (en ? " a month" : " per maand") : ""}, ${btw}.`
  }

  // "Voor vijvers en water, beplanting en … maak ik per project een offerte."
  // `advies`: alleen de adviesdiensten van het niveau, of juist zonder.
  const opMaat = (kind: ServiceKind, advies: boolean) => {
    const namen = servicesInGroup(services, kind)
      .filter((s) => ADVIES_DIENSTEN.has(s.slug) === advies)
      .filter((s) => !pricingFor(s.slug))
      .map((s) => klein(t(s.title)))
    if (!namen.length) return null
    return en
      ? `For ${reeks(namen)} I quote per project, after an introduction on site.`
      : `Voor ${reeks(namen)} maak ik per project een offerte, na een kennismaking op locatie.`
  }

  const groep = (kind: ServiceKind) => SERVICE_GROUPS.find((g) => g.kind === kind)
  const lijst: (Vraag | null)[] = []

  // 1 · Wat kost een tuinontwerp? — de vraag van Dan Hoye. Altijd een
  // offerte: de intro van het niveau, welke ontwerpdiensten dat zijn, en
  // de verrekenregel. Geen bedrag.
  {
    const s = dienst(SLUG.ontwerp)
    const g = groep("ontwerp")
    const verrekening = quoteOffsetFor(SLUG.ontwerp)
    lijst.push(
      s
        ? {
            id: "wat-kost-een-tuinontwerp",
            vraag: en ? "How much does a garden design cost?" : "Wat kost een tuinontwerp?",
            alineas: [
              ...(g ? [t(g.intro)] : []),
              opMaat("ontwerp", false) ??
                (en
                  ? "I quote every design, after an introduction on site."
                  : "Voor elk ontwerp maak ik een offerte, na een kennismaking op locatie."),
              ...(verrekening ? [t(verrekening)] : []),
            ],
            verder: { href: `/services/${s.slug}`, label: en ? `What ${klein(t(s.title))} includes` : `Wat een ${klein(t(s.title))} inhoudt` },
          }
        : null
    )
  }

  // 2 · Wat kost advies aan huis?
  {
    const s = dienst(SLUG.advies)
    const p = pricingFor(SLUG.advies)
    // Advies hoort bij Ontwerp: het intro van dat niveau opent ook dit antwoord.
    const g = groep("ontwerp")
    lijst.push(
      s && p && g
        ? {
            id: "wat-kost-advies-aan-huis",
            vraag: en ? "How much does advice at home cost?" : "Wat kost advies aan huis?",
            alineas: [
              t(g.intro),
              prijsZin({ nl: `De ${klein(s.title.nl)}`, en: `The ${klein(s.title.en)}` }, p),
              ...(p.offset ? [t(p.offset)] : []),
              ...[opMaat("ontwerp", true)].filter((x): x is string => !!x),
            ],
            verder: { href: `/services/${s.slug}`, label: en ? `About the ${klein(t(s.title))}` : `Over de ${klein(t(s.title))}` },
          }
        : null
    )
  }

  // 3 · Alleen de vijver: elke waterdienst los, met zijn vanafprijs.
  {
    const water = VIJVER_DIENSTEN.map(dienst).filter((s): s is Service => !!s)
    lijst.push(
      water.length
        ? {
            id: "alleen-hulp-met-mijn-vijver",
            vraag: en ? "Can I get help with just my pond?" : "Kan ik alleen hulp met mijn vijver krijgen?",
            alineas: [en ? "Yes. You can ask for each of these on its own:" : "Ja. Elk van deze diensten kun je los vragen:"],
            lijst: water.map((s) => ({ kop: t(s.title), tekst: vanaf(s.slug) })),
            verder: {
              href: `/projects/${VIJVER_SLUG}`,
              // De projecttekst bestaat alleen in het Nederlands.
              label: en ? "Read about my first pond project (in Dutch)" : "Lees over mijn eerste vijverproject",
            },
          }
        : null
    )
  }

  // 4 · Leg je de tuin ook aan?
  {
    const s = dienst(SLUG.aanleg)
    const p = pricingFor(SLUG.aanleg)
    lijst.push(
      s
        ? {
            id: "leg-je-de-tuin-ook-aan",
            vraag: en ? "Do you also build the garden?" : "Leg je de tuin ook aan?",
            alineas: [
              `${en ? "Yes." : "Ja."} ${t(s.summary)}`,
              `${en ? "What you get:" : "Wat je krijgt:"} ${reeks(s.includes.map((x) => klein(t(x))))}.`,
              p
                ? prijsZin({ nl: "Een aanleg", en: "A build" }, p)
                : en
                  ? "I quote a build per project, after an introduction on site."
                  : "Voor een aanleg maak ik per project een offerte, na een kennismaking op locatie.",
            ],
            verder: { href: `/services/${s.slug}`, label: en ? `About ${klein(t(s.title))}` : `Over ${klein(t(s.title))}` },
          }
        : null
    )
  }

  // 4b · Ik heb een budget — Nicks eigen antwoord, 25 sep 2026: "wanneer
  // iemand een budget opgeeft, dat ik dan mijn best doe om het de klant
  // naar de wens te maken. Klant is koning, maar ik moet mezelf ook niet
  // onderuit halen."
  lijst.push({
    id: "ik-heb-een-budget",
    vraag: en ? "I have a budget. Can you work within it?" : "Ik heb een budget. Kun je daarbinnen werken?",
    alineas: [
      en
        ? "Yes, please mention it. A budget helps me: I do my best to get as close to what you want as that amount allows."
        : "Ja, noem het gerust. Een budget helpt me juist: ik doe mijn best om binnen dat bedrag zo dicht mogelijk bij je wens te komen.",
      en
        ? "The customer is king, but I also have to be able to do the work properly. If something does not fit the budget, I will tell you honestly, and we look together at what does."
        : "De klant is koning, maar ik moet het werk ook goed kunnen doen. Past iets niet binnen het budget, dan zeg ik dat eerlijk en kijken we samen wat wel kan.",
    ],
    verder: { href: "/contact", label: t(KENNISMAKING) },
  })

  // 5 · Werk je ook in mijn plaats? — alleen de plaatsen die werkgebied.ts noemt.
  lijst.push({
    id: "werk-je-ook-in-mijn-plaats",
    vraag: en ? "Do you also work where I live?" : "Werk je ook in mijn plaats?",
    alineas: [
      en
        ? `I work from ${BUSINESS.address.city}, ${BUSINESS.address.province}. For seasonal work I come to places including ${reeks([...SERVICE_AREA_TOWNS])}.`
        : `Ik werk vanuit ${BUSINESS.address.city}, ${BUSINESS.address.province}. Voor seizoenswerk kom ik onder meer in ${reeks([...SERVICE_AREA_TOWNS])}.`,
      en
        ? "Design and advice travel further. Tell me what you have in mind, and I will say honestly whether I am the right person for it."
        : "Ontwerp en advies reizen verder. Vertel wat je voor je ziet, dan zeg ik eerlijk of ik de juiste ben.",
    ],
    verder: { href: "/contact", label: t(KENNISMAKING) },
  })

  // 6 · Voor welke tuinen werk je? — Nicks eigen antwoord, 23 sep 2026.
  lijst.push({
    id: "voor-welke-tuinen-werk-je",
    vraag: en ? "What kind of gardens do you work on?" : "Voor welke tuinen werk je?",
    alineas: [
      en ? "The size of your garden does not matter." : "De grootte van je tuin doet er niet toe.",
      en
        ? "If a project is bigger than I can take on alone, I work together with other landscape gardeners or designers."
        : "Is een project groter dan ik alleen aankan, dan ga ik samenwerken met andere hoveniers of ontwerpers.",
    ],
  })

  // 7 · Hoe gaat zo'n traject? — de zes stappen van de werkwijze.
  lijst.push({
    id: "hoe-gaat-zo-n-traject",
    vraag: en ? "How does a project go?" : "Hoe gaat zo’n traject?",
    alineas: [en ? `In ${telwoord(WERKWIJZE.length, locale)} steps:` : `In ${telwoord(WERKWIJZE.length, locale)} stappen:`],
    lijst: WERKWIJZE.map((stap) => ({ kop: t(stap.titel), tekst: t(stap.tekst) })),
  })

  // 8 · Hoe lang duurt een ontwerp of aanleg? — Nicks eigen antwoord; de
  // tweede zin wijst alleen naar de eerste stap van de werkwijze.
  lijst.push({
    id: "hoe-lang-duurt-een-ontwerp-of-aanleg",
    vraag: en ? "How long does a design or a build take?" : "Hoe lang duurt een ontwerp of aanleg?",
    alineas: [
      en ? "That depends on what I find." : "Dat hangt af van wat ik aantref.",
      en
        ? `That is why it starts with the first step: ${klein(t(WERKWIJZE[0].titel))}.`
        : `Daarom begint het met de eerste stap: ${klein(t(WERKWIJZE[0].titel))}.`,
    ],
  })

  // 9 · Wie werkt er aan mijn tuin?
  {
    const persoonlijk = PIJLERS.find((p) => p.label.nl === "Persoonlijk")
    lijst.push({
      id: "wie-werkt-er-aan-mijn-tuin",
      vraag: en ? "Who works on my garden?" : "Wie werkt er aan mijn tuin?",
      alineas: [t(OVER_MIJ[0]), ...(persoonlijk ? [t(persoonlijk.tekst)] : [])],
      verder: { href: "/studio", label: en ? "About me" : "Over mij" },
    })
  }

  // 10 · Wanneer kan ik het best beginnen? — Nicks eigen antwoord.
  lijst.push({
    id: "wanneer-kan-ik-het-best-beginnen",
    vraag: en ? "When is the best time to start?" : "Wanneer kan ik het best beginnen?",
    alineas: [
      en ? "How long you wait depends on my calendar." : "Hoe lang je moet wachten, hangt af van mijn agenda.",
      en
        ? "The best time is autumn, or just before it. Then you plant in the dormant period, the winter, and in spring the plants get an extra boost as they come into leaf."
        : "Het beste moment is de herfst, of net daarvoor. Dan plant je aan in de rustperiode, de winter, en krijgen de planten in het voorjaar een extra boost als ze uitlopen.",
    ],
  })

  // 11 · Hoe begin ik?
  lijst.push({
    id: "hoe-begin-ik",
    vraag: en ? "How do I start?" : "Hoe begin ik?",
    alineas: [
      en
        ? "Send me a message through the contact form, about your garden or pond."
        : "Stuur me een bericht via het contactformulier, over je tuin of vijver.",
      t(CONTACT_UITNODIGING),
      t(KENNISMAKING_VRIJBLIJVEND),
      en
        ? `Rather direct? Call or WhatsApp ${BUSINESS.phone}, or e-mail ${BUSINESS.email}.`
        : `Liever direct? Bel of app ${BUSINESS.phone}, of mail ${BUSINESS.email}.`,
    ],
    verder: { href: "/contact", label: t(KENNISMAKING) },
  })

  return lijst.filter((v): v is Vraag => v !== null)
}

/**
 * De vragen die ook op home staan (Nick, 25 sep 2026: "Veelgestelde
 * vragen staat enkel in de footer, kunnen we dat niet op HOME
 * toevoegen?"). Alleen ids: de tekst blijft die van /faq. De vier dingen
 * die een eerste bezoeker wil weten voor hij schrijft — wat het kost,
 * of ik bij hem werk, hoe lang het duurt en wanneer, en hoe hij begint.
 * Valt een vraag weg (geen bron), dan staat hij ook op home niet.
 */
export const THUIS_VRAGEN = [
  "wat-kost-een-tuinontwerp",
  "werk-je-ook-in-mijn-plaats",
  "hoe-lang-duurt-een-ontwerp-of-aanleg",
  "wanneer-kan-ik-het-best-beginnen",
  "hoe-begin-ik",
] as const

/** De homevragen uit de volledige lijst, in de volgorde van `THUIS_VRAGEN`. */
export function thuisVragen(lijst: Vraag[]): Vraag[] {
  return THUIS_VRAGEN.map((id) => lijst.find((v) => v.id === id)).filter((v): v is Vraag => !!v)
}

function telwoord(n: number, locale: Locale): string {
  const woorden = {
    nl: ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien"],
    en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  }[locale]
  return woorden[n] ?? String(n)
}

/**
 * FAQPage voor Google en AI-hulpen, uit precies dezelfde vragen als de
 * pagina toont. `vragen.spec.ts` legt de twee naast elkaar.
 */
export function vragenSchema(lijst: Vraag[], locale: Locale, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url,
    inLanguage: locale === "nl" ? "nl-NL" : "en",
    mainEntity: lijst.map((v) => ({
      "@type": "Question",
      name: v.vraag,
      acceptedAnswer: { "@type": "Answer", text: antwoordTekst(v) },
    })),
  }
}

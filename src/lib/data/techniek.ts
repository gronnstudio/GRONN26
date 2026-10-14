import type { L } from "@/lib/i18n"

// De techniek achter de site (/techniek). Sinds 14 okt 2026 zonder de vijver
// (eigenaar: "niet werk gerelateerd maar wel interactief"): de site als een
// stapel van vijf lagen, van je scherm tot de meting. Elke laag zegt in één
// zin wat hij doet en welk gereedschap erbij hoort.
// Alleen gereedschap dat echt gebruikt wordt; nieuw gereedschap komt van Nick.
// Nooit zeggen dat een AI de site bouwt (eigenaar, 29 sep 2026).

export type Onderdeel = { naam: string; soort: L; wat: L }
export type Laag = { id: string; naam: L; zin: L; delen: Onderdeel[] }

const PAKKET: L = { nl: "Softwarepakket", en: "Software package" }
const DIENST: L = { nl: "Dienst", en: "Service" }
const BROWSER: L = { nl: "In de browser", en: "In the browser" }
const EIGEN: L = { nl: "Eigen werk", en: "In-house" }

export const LAGEN: Laag[] = [
  {
    id: "scherm",
    naam: { nl: "Op je scherm", en: "On your screen" },
    zin: { nl: "Alles wat in je browser aankomt: pagina's, letters, beweging en geluid.", en: "Everything that reaches your browser: pages, type, motion and sound." },
    delen: [
      { naam: "Next.js 16", soort: PAKKET, wat: { nl: "Bouwt de pagina's en zet ze vooraf klaar, zodat ze meteen openen.", en: "Builds the pages and prepares them in advance, so they open instantly." } },
      { naam: "React 19", soort: PAKKET, wat: { nl: "De bouwstenen van elke pagina: menu, kaarten, formulier.", en: "The building blocks of every page: menu, cards, form." } },
      { naam: "Tailwind CSS 4", soort: PAKKET, wat: { nl: "De opmaak: kleuren, maten en ruimte, allemaal uit de merkgids.", en: "The styling: colours, sizes and spacing, all from the brand guide." } },
      { naam: "Syne · Montserrat", soort: PAKKET, wat: { nl: "De twee letters van het merk, zelf gehost: geen verzoek naar Google bij je bezoek.", en: "The brand's two typefaces, self-hosted: no request to Google when you visit." } },
      { naam: "View Transitions", soort: BROWSER, wat: { nl: "Een projectfoto groeit door naar de projectpagina, zonder doek ertussen.", en: "A project photo grows into the project page, with no curtain in between." } },
      { naam: "CSS-scrollanimaties", soort: BROWSER, wat: { nl: "Foto's bewegen mee met scrollen; de browser rekent het uit, niet JavaScript.", en: "Photos move as you scroll; the browser does the maths, not JavaScript." } },
      { naam: "WebGL", soort: EIGEN, wat: { nl: "Het water op de vijverfoto's rimpelt onder je vinger of muis.", en: "The water in the pond photos ripples under your finger or mouse." } },
      { naam: "GSAP", soort: PAKKET, wat: { nl: "Het doek tussen de pagina's; de rest van de beweging is gewone CSS.", en: "The curtain between pages; the rest of the motion is plain CSS." } },
      { naam: "Muziek", soort: { nl: "Geluid", en: "Sound" }, wat: { nl: "Een rustige melodie van Pixabay, alleen als je hem aanzet in Weergave.", en: "A calm tune from Pixabay, only when you switch it on in Display." } },
    ],
  },
  {
    id: "server",
    naam: { nl: "Waar het draait", en: "Where it runs" },
    zin: { nl: "Waar de site draait. Geen server in een kast, maar servers dicht bij jou.", en: "Where the site runs. No server in a cupboard, but servers close to you." },
    delen: [
      { naam: "Vercel", soort: DIENST, wat: { nl: "Bouwt de site bij elke wijziging en zet hem op servers dicht bij jou.", en: "Builds the site on every change and puts it on servers close to you." } },
      { naam: "GitHub", soort: DIENST, wat: { nl: "Waar de code staat, met de hele geschiedenis van elke wijziging.", en: "Where the code lives, with the full history of every change." } },
      { naam: "Cloudflare", soort: DIENST, wat: { nl: "De adressenlijst van gronn.studio: waar het domein naartoe wijst.", en: "The address book of gronn.studio: where the domain points." } },
      { naam: "Service worker", soort: EIGEN, wat: { nl: "Houdt de site bereikbaar met een eigen pagina als je geen verbinding hebt.", en: "Keeps the site reachable with its own page when you are offline." } },
      { naam: "Vercel Blob", soort: DIENST, wat: { nl: "Bewaart een meegestuurde vijverfoto privé, en wist hem na 30 dagen.", en: "Keeps an uploaded pond photo private, and deletes it after 30 days." } },
    ],
  },
  {
    id: "post",
    naam: { nl: "Wat binnenkomt", en: "What comes in" },
    zin: { nl: "Waar woorden binnenkomen: mijn teksten, en jouw aanvraag.", en: "Where words come in: my texts, and your enquiry." },
    delen: [
      { naam: "Tekst in de code", soort: EIGEN, wat: { nl: "Geen CMS: elke zin staat in de code, in het Nederlands en het Engels.", en: "No CMS: every sentence lives in the code, in Dutch and English." } },
      { naam: "FormSubmit", soort: DIENST, wat: { nl: "Stuurt het kennismakingsformulier rechtstreeks vanuit je browser naar mijn mail.", en: "Sends the contact form straight from your browser to my email." } },
      { naam: "Claude", soort: DIENST, wat: { nl: "Geeft bij een meegestuurde vijverfoto een korte eerste inschatting. Ik kijk altijd zelf.", en: "Gives a short first impression of an uploaded pond photo. I always look myself." } },
    ],
  },
  {
    id: "controle",
    naam: { nl: "De controle", en: "The checks" },
    zin: { nl: "Controleert elke wijziging. Faalt één controle, dan gaat er niets live.", en: "Checks every change. If one check fails, nothing goes live." },
    delen: [
      { naam: "TypeScript", soort: PAKKET, wat: { nl: "Controleert de code voordat hij draait: een typefout komt niet live.", en: "Checks the code before it runs: a typo does not go live." } },
      { naam: "ESLint", soort: PAKKET, wat: { nl: "Leest de code na op slordigheid en bekende valkuilen.", en: "Reads the code for sloppiness and known pitfalls." } },
      { naam: "Playwright", soort: PAKKET, wat: { nl: "Opent elke pagina in een echte browser, op telefoon- en desktopbreedte.", en: "Opens every page in a real browser, at phone and desktop width." } },
    ],
  },
  {
    id: "meting",
    naam: { nl: "De meting", en: "The measuring" },
    zin: { nl: "Meet hoeveel mensen komen en hoe snel de site bij ze laadt. Zonder cookies.", en: "Measures how many people visit and how fast the site loads for them. Without cookies." },
    delen: [
      { naam: "Web Analytics", soort: DIENST, wat: { nl: "Telt bezoeken per pagina, zonder cookies en zonder je te volgen.", en: "Counts visits per page, without cookies and without following you." } },
      { naam: "Speed Insights", soort: DIENST, wat: { nl: "Meet hoe snel de site laadt bij echte bezoekers, op echte telefoons.", en: "Measures how fast the site loads for real visitors, on real phones." } },
    ],
  },
]

export const AANTAL = LAGEN.reduce((n, l) => n + l.delen.length, 0)

// De controle, stap voor stap: precies wat .github/workflows/quality.yml en Vercel doen.
export const STAPPEN: { naam: string; wat: L; fout?: L }[] = [
  { naam: "GitHub", wat: { nl: "Vastgelegd: wie, wat en waarom.", en: "Recorded: who, what and why." } },
  { naam: "TypeScript", wat: { nl: "Elke waarde klopt.", en: "Every value adds up." }, fout: { nl: "Tegengehouden: een tekst staat waar een getal hoort.", en: "Stopped: a piece of text sits where a number belongs." } },
  { naam: "ESLint", wat: { nl: "Geen slordigheid gevonden.", en: "No sloppiness found." } },
  { naam: "Build", wat: { nl: "Alle pagina's gebouwd, in twee talen.", en: "Every page built, in two languages." } },
  { naam: "Playwright", wat: { nl: "Elke pagina getest op drie breedtes.", en: "Every page tested at three widths." } },
  { naam: "Vercel", wat: { nl: "Live, op servers dicht bij jou.", en: "Live, on servers close to you." } },
]

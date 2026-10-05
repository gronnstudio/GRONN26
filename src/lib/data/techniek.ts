import type { L } from "@/lib/i18n"

// De techniek achter de site (/techniek, eigenaar 5 okt 2026: "zet naast merk
// ook een techniek pagina op (stack)"). Alleen gereedschap dat echt gebruikt
// wordt: de pakketten komen uit package.json, de rest uit de werkwijze en de
// vorige /stack (iPhone en Ulanzi zijn van de eigenaar). Nieuw gereedschap komt
// van Nick. Nooit zeggen dat een AI de site bouwt (eigenaar, 29 sep 2026).

export type Groep = { id: string; label: L; uitleg: L }
export type Onderdeel = { naam: string; groep: string; soort: L; wat: L }

export const GROEPEN: Groep[] = [
  {
    id: "vastleggen",
    label: { nl: "Vastleggen", en: "Capturing" },
    uitleg: { nl: "Wat ik op de bouwplaats bij me heb om het werk te filmen en te fotograferen.", en: "What I carry on site to film and photograph the work." },
  },
  {
    id: "zien",
    label: { nl: "Wat je ziet", en: "What you see" },
    uitleg: { nl: "Alles wat in je browser aankomt: de pagina's, de letters, de beweging en het geluid.", en: "Everything that reaches your browser: the pages, the type, the motion and the sound." },
  },
  {
    id: "draaien",
    label: { nl: "Waar het draait", en: "Where it runs" },
    uitleg: { nl: "Geen eigen server in een kast. De site wordt gebouwd en verspreid over servers dicht bij jou.", en: "No server in a cupboard. The site is built and spread across servers close to you." },
  },
  {
    id: "woorden",
    label: { nl: "Waar de woorden wonen", en: "Where the words live" },
    uitleg: { nl: "Mijn teksten staan in de code, jouw aanvraag gaat rechtstreeks naar mijn inbox.", en: "My texts live in the code, your enquiry goes straight to my inbox." },
  },
  {
    id: "controle",
    label: { nl: "Controle", en: "Checks" },
    uitleg: { nl: "Wat er draait voordat er iets live gaat. Faalt één controle, dan gaat er niets door.", en: "What runs before anything goes live. If one check fails, nothing gets through." },
  },
]

const HARDWARE: L = { nl: "Hardware", en: "Hardware" }
const PAKKET: L = { nl: "Softwarepakket", en: "Software package" }
const DIENST: L = { nl: "Dienst", en: "Service" }
const EIGEN: L = { nl: "Eigen werk", en: "In-house" }

export const ONDERDELEN: Onderdeel[] = [
  { naam: "iPhone 13", groep: "vastleggen", soort: HARDWARE, wat: { nl: "Mijn camera: ik film en fotografeer het werk onderweg, tussen het werk door.", en: "My camera: I film and photograph the work on the fly, in between the work itself." } },
  { naam: "Ulanzi MA38", groep: "vastleggen", soort: HARDWARE, wat: { nl: "Het statiefje dat de telefoon vasthoudt, op een kei of waar het maar kan staan.", en: "The little stand that holds the phone, on a rock or wherever it will stand." } },

  { naam: "Next.js 16", groep: "zien", soort: PAKKET, wat: { nl: "Het raamwerk dat de pagina's bouwt en ze vooraf klaarzet, zodat ze meteen openen.", en: "The framework that builds the pages and prepares them in advance, so they open instantly." } },
  { naam: "React 19", groep: "zien", soort: PAKKET, wat: { nl: "De bouwstenen van elke pagina: menu, kaarten, formulier.", en: "The building blocks of every page: menu, cards, form." } },
  { naam: "Tailwind CSS 4", groep: "zien", soort: PAKKET, wat: { nl: "De opmaak: kleuren, maten en ruimte, allemaal uit de merkgids.", en: "The styling: colours, sizes and spacing, all from the brand guide." } },
  { naam: "GSAP", groep: "zien", soort: PAKKET, wat: { nl: "Het doek tussen de pagina's en de opening; de rest van de beweging is gewone CSS.", en: "The curtain between pages and the opening; the rest of the motion is plain CSS." } },
  { naam: "Syne · Montserrat", groep: "zien", soort: PAKKET, wat: { nl: "De twee letters van het merk, zelf gehost: geen verzoek naar Google bij je bezoek.", en: "The brand's two typefaces, self-hosted: no request to Google when you visit." } },
  { naam: "Web Audio", groep: "zien", soort: EIGEN, wat: { nl: "Het windje en vogeltje bij het doek, in de browser gemaakt, zonder geluidsbestand. Standaard uit.", en: "The breeze and bird at the curtain, made in the browser, without a sound file. Off by default." } },

  { naam: "Vercel", groep: "draaien", soort: DIENST, wat: { nl: "Bouwt de site bij elke wijziging en zet hem op servers dicht bij jou.", en: "Builds the site on every change and puts it on servers close to you." } },
  { naam: "GitHub", groep: "draaien", soort: DIENST, wat: { nl: "Waar de code staat, met de hele geschiedenis van elke wijziging.", en: "Where the code lives, with the full history of every change." } },
  { naam: "Cloudflare", groep: "draaien", soort: DIENST, wat: { nl: "De adressenlijst van gronn.studio: waar het domein naartoe wijst.", en: "The address book of gronn.studio: where the domain points." } },
  { naam: "Service worker", groep: "draaien", soort: EIGEN, wat: { nl: "Maakt de site installeerbaar als app, met een eigen pagina als je geen verbinding hebt.", en: "Makes the site installable as an app, with its own page when you are offline." } },

  { naam: "Tekst in de code", groep: "woorden", soort: EIGEN, wat: { nl: "Geen CMS: elke zin staat in de code, in het Nederlands en het Engels.", en: "No CMS: every sentence lives in the code, in Dutch and English." } },
  { naam: "FormSubmit", groep: "woorden", soort: DIENST, wat: { nl: "Stuurt het kennismakingsformulier rechtstreeks vanuit je browser naar mijn mail.", en: "Sends the contact form straight from your browser to my email." } },

  { naam: "TypeScript", groep: "controle", soort: PAKKET, wat: { nl: "Controleert de code voordat hij draait: een typefout komt niet live.", en: "Checks the code before it runs: a typo does not go live." } },
  { naam: "ESLint", groep: "controle", soort: PAKKET, wat: { nl: "Leest de code na op slordigheid en bekende valkuilen.", en: "Reads the code for sloppiness and known pitfalls." } },
  { naam: "Playwright", groep: "controle", soort: PAKKET, wat: { nl: "Opent elke pagina in een echte browser, op telefoon- en desktopbreedte, en kijkt of alles klopt.", en: "Opens every page in a real browser, at phone and desktop width, and checks that everything holds." } },
]

import type { L } from "@/lib/i18n"

import type { MerkId } from "./stack-merken"

// /stack: waar Nick mee werkt, van de telefoon op de bouwplaats tot de
// code onder deze site (eigenaar, 24 sep 2026: "create a tech stack page
// similar to the old one, but more intuitive and interactive").
//
// BRONNEN — niets hieronder is verzonnen:
//
// - De site-onderdelen komen van de oude techniekpagina: `STACK_TECH` in
//   src/lib/stack.ts (branch concept/oude-site-v3, commit 2325675; de
//   pagina zelf was src/app/[locale]/stack/stack-content.tsx), bijgewerkt
//   naar wat V5 écht gebruikt zoals gemeten in de nooit gemergde
//   V5-techniekpagina (commit c767874, branch feat/v5-techniek,
//   src/components/gronn/techniek.ts). "Waarom" en "afweging" zijn de
//   oude teksten, ingekort, alleen waar ze voor V5 nog kloppen.
// - Weggelaten van de oude pagina, omdat de V5-site ze niet meer
//   gebruikt: Lenis (niet gemount, zie CLAUDE.md), three.js + React Three
//   Fiber (het 3D-terrein is concept) en de GRØNN Editor-werkbalk (niet
//   meer op de publieke pagina's). Ook weg, als loodgieterswerk zonder
//   betekenis voor een bezoeker: clsx + tailwind-merge, de Tailwind
//   PostCSS-plugin en de typedefinities.
// - Vastleggen: de iPhone 13 en het Ulanzi-statiefje heeft Nick zelf
//   genoemd (24 sep 2026: "one of my favourite tools"). Het statiefje
//   staat ook in de clip op de vijverpagina (VIDEOS.V01), en die clip
//   staat sinds 29 sep 2026 ook bij deze groep op /stack. De modelnaam
//   MA38 komt van Nick zelf (29 sep 2026: "ulanzi MA38 statief").
// - Merktekens (`merk`): alleen waar het product een eigen teken heeft in
//   Simple Icons; bron en licentie in ./stack-merken.ts. De iPhone draagt
//   het teken van Apple, dat ook op het toestel zelf staat.
//
// - Gekoppeld aan Claude: de koppelingen die op 29 sep 2026 in Nicks
//   claude.ai-account verbonden waren (eigenaar: "zet in techniek pagina
//   ook welke connectors aan claude zijn gekoppeld"). Alleen verbonden
//   koppelingen; Canva (opnieuw aanmelden), Lovable en Sentry (niet
//   afgerond) en Figma (nog niet toegevoegd) staan er niet bij. Per
//   koppeling staat wat Claude er kán, geen verzonnen gebruik. Nooit
//   zeggen dat Claude de site bouwt (eigenaar, 29 sep 2026: "zeg niet
//   dat we claude hebben gebruikt om website te bouwen").
// - In de gaten houden: hoe de site en de code nu gevolgd worden, zoals
//   in CLAUDE.md en tests/e2e beschreven (voorbeeldadressen, de volle
//   testronde vóór samenvoegen, de contrastmeting op schermafdrukken,
//   terugdraaien bij Vercel).
//
// Versies worden nooit getypt: `pakketten` zijn npm-namen, en de pagina
// leest de versie bij het bouwen uit package.json.

export type StackGroepId = "vastleggen" | "zien" | "draaien" | "inhoud" | "controle" | "claude" | "bewaken"

export type StackGroep = {
  id: StackGroepId
  label: L
  /** Eén zin: wat deze groep doet. */
  uitleg: L
}

export type StackOnderdeel = {
  id: string
  /** Productnaam zoals de makers hem schrijven. Nooit vertaald. */
  naam: string
  groep: StackGroepId
  /** Hardware, pakket, dienst, eigen werk … */
  soort: L
  /** Eén zin: waar Nick het voor gebruikt. */
  wat: L
  waarom?: L
  /** Wat het kost of waar je op moet letten (de oude "Wat het kost"). */
  afweging?: L
  /** npm-pakketten erachter; de versie komt uit package.json. */
  pakketten?: string[]
  /** Een project waar het aantoonbaar gebruikt is. */
  project?: { pad: string; label: L }
  /** Door Nick zelf als favoriet genoemd. */
  favoriet?: boolean
  /**
   * Het merkteken uit Simple Icons (./stack-merken.ts). Alleen als het
   * product er een eigen teken heeft; zonder blijft de kaart tekst.
   */
  merk?: MerkId
}

export const STACK_GROEPEN: StackGroep[] = [
  {
    id: "vastleggen",
    label: { nl: "Vastleggen", en: "Capturing" },
    uitleg: {
      nl: "Wat ik op de bouwplaats bij me heb om het werk te filmen en te fotograferen.",
      en: "What I carry on site to film and photograph the work.",
    },
  },
  {
    id: "zien",
    label: { nl: "Wat je ziet", en: "What you see" },
    uitleg: {
      nl: "Alles wat in je browser aankomt: de pagina's, de kleuren, de menu's en de Uren-schakelaar.",
      en: "Everything that reaches your browser: the pages, the colours, the menus and the Hours switch.",
    },
  },
  {
    id: "draaien",
    label: { nl: "Waar het draait", en: "Where it runs" },
    uitleg: {
      nl: "Er staat geen eigen server in een kast. De site wordt gebouwd en verspreid over servers dicht bij jou.",
      en: "There is no server in a cupboard. The site is built and spread across servers close to you.",
    },
  },
  {
    id: "inhoud",
    label: { nl: "Waar de woorden wonen", en: "Where the words live" },
    uitleg: {
      nl: "Mijn teksten, jouw aanvraag en jouw dossier, ieder op een eigen plek.",
      en: "My texts, your enquiry and your file, each in its own place.",
    },
  },
  {
    id: "controle",
    label: { nl: "Controle", en: "Checks" },
    uitleg: {
      nl: "Wat er draait voordat er iets live gaat. Faalt één controle, dan gaat er niets door.",
      en: "What runs before anything goes live. If one check fails, nothing gets through.",
    },
  },
  {
    id: "claude",
    label: { nl: "Gekoppeld aan Claude", en: "Connected to Claude" },
    uitleg: {
      nl: "De diensten die aan Claude, de AI-assistent van Anthropic, gekoppeld zijn, en waar ze voor dienen.",
      en: "The services connected to Claude, the AI assistant made by Anthropic, and what they are for.",
    },
  },
  {
    id: "bewaken",
    label: { nl: "In de gaten houden", en: "Keeping watch" },
    uitleg: {
      nl: "Hoe we de site en de code volgen, van de eerste versie van een wijziging tot nadat hij live staat.",
      en: "How we follow the site and the code, from the first draft of a change to after it is live.",
    },
  },
]

const HARDWARE: L = { nl: "Hardware", en: "Hardware" }
const PAKKET: L = { nl: "Softwarepakket", en: "Software package" }
const DIENST: L = { nl: "Dienst", en: "Service" }
const EIGEN: L = { nl: "Eigen werk", en: "In-house" }
const KOPPELING: L = { nl: "Koppeling", en: "Connector" }
const WERKWIJZE: L = { nl: "Werkwijze", en: "Practice" }

export const STACK: StackOnderdeel[] = [
  // ── Vastleggen ────────────────────────────────────────────────────────
  {
    id: "iphone-13",
    merk: "apple",
    naam: "iPhone 13",
    groep: "vastleggen",
    soort: HARDWARE,
    wat: {
      nl: "Mijn camera: ik film en fotografeer het werk onderweg, tussen het werk door.",
      en: "My camera: I film and photograph the work on the fly, in between the work itself.",
    },
  },
  {
    id: "ulanzi",
    naam: "Ulanzi MA38",
    groep: "vastleggen",
    soort: HARDWARE,
    favoriet: true,
    wat: {
      nl: "Het statiefje dat de telefoon vasthoudt, op een kei of waar het maar kan staan. Een van mijn favoriete stukken gereedschap.",
      en: "The little stand that holds the phone, on a rock or wherever it will stand. One of my favourite tools.",
    },
    project: {
      pad: "/projects/vijverrenovatie-twee-vijvers-waterval-beekloop",
      label: { nl: "Te zien bij de vijverrenovatie", en: "Seen in the pond renovation" },
    },
  },

  // ── Wat je ziet ───────────────────────────────────────────────────────
  {
    id: "next",
    merk: "nextdotjs",
    naam: "Next.js",
    groep: "zien",
    soort: PAKKET,
    pakketten: ["next"],
    wat: {
      nl: "Het raamwerk. Pagina's worden vooraf gebouwd, zodat ze direct klaarstaan.",
      en: "The framework. Pages are built ahead of time, so they are ready straight away.",
    },
    waarom: {
      nl: "Routering, metadata, afbeeldingen en de taalwissel op één plek. De Nederlandse routes zijn een rewrite, geen aparte taalbibliotheek: minder afhankelijkheden, echte adressen.",
      en: "Routing, metadata, images and the language switch in one place. The Dutch routes are a rewrite, not a separate i18n library: fewer dependencies, real addresses.",
    },
    afweging: {
      nl: "De versie staat exact vast, niet als bereik: grote versies gaan snel en de werkwijze gaat mee. Elke upgrade wordt gelezen tegen de documentatie die in het pakket zelf zit.",
      en: "The version is pinned exactly, not as a range: majors move fast and the conventions move with them. Every upgrade is read against the documentation shipped inside the package.",
    },
  },
  {
    id: "react",
    merk: "react",
    naam: "React",
    groep: "zien",
    soort: PAKKET,
    pakketten: ["react", "react-dom"],
    wat: {
      nl: "Waar de pagina's uit bestaan: kleine bouwstenen die ik overal hergebruik.",
      en: "What the pages are made of: small building blocks I reuse everywhere.",
    },
    waarom: {
      nl: "Alleen wat je echt kunt aanraken, zoals de filters op deze pagina, het menu en de Uren-schakelaar, gaat als JavaScript naar je browser. De rest is gewone HTML.",
      en: "Only what you can actually touch, like the filters on this page, the menu and the Hours switch, is sent to your browser as JavaScript. The rest is plain HTML.",
    },
    afweging: {
      nl: "Vastgezet op een exacte versie, samen met react-dom: die twee mogen nooit uit elkaar lopen.",
      en: "Pinned to an exact version together with react-dom: those two must never drift apart.",
    },
  },
  {
    id: "tailwind",
    merk: "tailwindcss",
    naam: "Tailwind CSS",
    groep: "zien",
    soort: PAKKET,
    pakketten: ["tailwindcss"],
    wat: {
      nl: "De kleuren en maten uit de brand guide, als één set afspraken.",
      en: "The colours and sizes from the brand guide, as one set of rules.",
    },
    waarom: {
      nl: "Kleuren heten naar hun rol, zoals achtergrond, lijn en accent, nooit naar een kleurcode. Van Uur wisselen verandert alleen de waarden eronder.",
      en: "Colours are named after their role, like background, line and accent, never after a colour code. Switching Hours only swaps the values underneath.",
    },
    afweging: {
      nl: "De discipline is onverbiddelijk: één vastgezette kleur en een van de twee Uren breekt.",
      en: "The discipline is unforgiving: one hardcoded colour and one of the two Hours breaks.",
    },
  },
  {
    id: "next-themes",
    naam: "next-themes",
    groep: "zien",
    soort: PAKKET,
    pakketten: ["next-themes"],
    wat: {
      nl: "De Uren-schakelaar: licht overdag, donker 's avonds, of zelf gekozen.",
      en: "The Hours switch: light by day, dark in the evening, or your own choice.",
    },
    waarom: {
      nl: "Het zet het gekozen palet vóór de eerste weergave, zodat een donkere pagina bij herladen niet wit opflitst, en onthoudt je keuze.",
      en: "It sets the chosen palette before the first paint, so a dark page never flashes white on reload, and it remembers your choice.",
    },
    afweging: {
      nl: "De server weet niet welk palet jij koos, dus alles wat een themanaam toont wacht tot de pagina in je browser draait.",
      en: "The server cannot know which palette you picked, so anything that shows a theme name waits until the page runs in your browser.",
    },
  },
  {
    id: "framer-motion",
    naam: "Framer Motion",
    groep: "zien",
    soort: PAKKET,
    pakketten: ["framer-motion"],
    wat: {
      nl: "De beweging in de menu's en onder de muis. Vraag je minder beweging, dan staat het stil.",
      en: "The motion in the menus and under the mouse. Ask for less motion and it stands still.",
    },
    afweging: {
      nl: "De grootste afhankelijkheid in de browser. Daarom beweegt de rest met gewone CSS, en komt er nooit een tweede animatiebibliotheek naast.",
      en: "The largest dependency in the browser. That is why everything else moves with plain CSS, and no second animation library ever stands beside it.",
    },
  },
  {
    id: "lucide",
    merk: "lucide",
    naam: "Lucide",
    groep: "zien",
    soort: PAKKET,
    pakketten: ["lucide-react"],
    wat: {
      nl: "De iconen, onder andere in de balk onderin op je telefoon.",
      en: "The icons, among others in the bar at the bottom of your phone.",
    },
    waarom: {
      nl: "Iconen worden stuk voor stuk geladen, dus een pijl kost een pijl. Elk icoon staat naast een geschreven woord.",
      en: "Icons are loaded one by one, so an arrow costs an arrow. Every icon sits next to a written word.",
    },
  },
  {
    id: "letters",
    naam: "Syne, Montserrat, Geist Mono",
    groep: "zien",
    soort: { nl: "Lettertypen, zelf gehost", en: "Typefaces, self-hosted" },
    wat: {
      nl: "De drie letters uit de brand guide. Ze komen van deze site zelf, niet van een ander.",
      en: "The three typefaces from the brand guide. They come from this site itself, not from someone else.",
    },
  },

  // ── Waar het draait ───────────────────────────────────────────────────
  {
    id: "vercel",
    merk: "vercel",
    naam: "Vercel",
    groep: "draaien",
    soort: { nl: "Platform", en: "Platform" },
    wat: {
      nl: "Bouwt de site bij elke wijziging en serveert hem. Wat op main komt, staat daarna live.",
      en: "Builds the site on every change and serves it. Whatever lands on main is live after that.",
    },
    waarom: {
      nl: "Elke wijziging krijgt eerst een eigen voorbeeldadres om te controleren, en er is geen server om zelf bij te houden.",
      en: "Every change first gets its own preview address to check, and there is no server to maintain myself.",
    },
    afweging: {
      nl: "Afhankelijk van één platform in ruil voor die eenvoud: beeldoptimalisatie en opslag zijn op Vercel gevormd.",
      en: "Dependence on one platform in exchange for that simplicity: image optimisation and storage are shaped around Vercel.",
    },
  },
  {
    id: "proxy",
    naam: "proxy.ts",
    groep: "draaien",
    soort: EIGEN,
    wat: {
      nl: "Stuurt /nl/… naar de Nederlandse pagina's, zonder aparte taalbibliotheek.",
      en: "Sends /nl/… to the Dutch pages, without a separate language library.",
    },
  },
  {
    id: "blob",
    naam: "Vercel Blob",
    groep: "draaien",
    soort: PAKKET,
    pakketten: ["@vercel/blob"],
    wat: {
      nl: "Opslag voor wat mijn editor publiceert en voor foto's bij een aanvraag.",
      en: "Storage for what my editor publishes and for photos sent with an enquiry.",
    },
    afweging: {
      nl: "Een tweede bron naast de code. Ontbreekt de opslag, dan valt de site terug op de laatst vastgelegde kopie in plaats van een lege pagina.",
      en: "A second source beside the code. If the store is missing, the site falls back to the last committed copy instead of an empty page.",
    },
  },
  {
    id: "speed-insights",
    naam: "Speed Insights",
    groep: "draaien",
    soort: PAKKET,
    pakketten: ["@vercel/speed-insights"],
    wat: {
      nl: "Meet anoniem hoe snel pagina's bij bezoekers laden.",
      en: "Measures anonymously how fast pages load for visitors.",
    },
  },

  // ── Waar de woorden wonen ─────────────────────────────────────────────
  {
    id: "tekst-in-code",
    naam: "Tekst in de code",
    groep: "inhoud",
    soort: EIGEN,
    wat: {
      nl: "Mijn eigen verhaal en de diensten staan in de code, zodat niets ze per ongeluk overschrijft.",
      en: "My own story and the services live in the code, so nothing overwrites them by accident.",
    },
  },
  {
    id: "formsubmit",
    naam: "FormSubmit",
    groep: "inhoud",
    soort: DIENST,
    wat: {
      nl: "Het contactformulier gaat vanuit je browser direct naar mijn mail. Lukt dat niet, dan opent je eigen mailprogramma.",
      en: "The contact form goes from your browser straight to my mail. If that fails, your own mail app opens.",
    },
  },
  {
    id: "supabase",
    merk: "supabase",
    naam: "Supabase",
    groep: "inhoud",
    soort: PAKKET,
    pakketten: ["@supabase/supabase-js", "@supabase/ssr"],
    wat: {
      nl: "Het klantportaal: inloggen en je eigen dossier.",
      en: "The client portal: signing in and your own file.",
    },
  },
  {
    id: "next-auth",
    naam: "NextAuth",
    groep: "inhoud",
    soort: PAKKET,
    pakketten: ["next-auth"],
    wat: {
      nl: "De Google-inlog voor mijn eigen dashboard en editor.",
      en: "The Google sign-in for my own dashboard and editor.",
    },
    waarom: {
      nl: "Eén persoon bewerkt deze site, en het bestaande Google-account van de studio is de sleutel.",
      en: "One person edits this site, and the studio's existing Google account is the key.",
    },
  },

  // ── Controle ──────────────────────────────────────────────────────────
  {
    id: "typescript",
    merk: "typescript",
    naam: "TypeScript",
    groep: "controle",
    soort: PAKKET,
    pakketten: ["typescript"],
    wat: {
      nl: "Vangt fouten in de code voordat een bezoeker ze ziet.",
      en: "Catches mistakes in the code before a visitor sees them.",
    },
    waarom: {
      nl: "Elke zichtbare tekst is een Nederlands-Engels paar. Een ontbrekende vertaling is daardoor een bouwfout, geen lege plek die jij als eerste vindt.",
      en: "Every visible string is a Dutch/English pair. A missing translation is therefore a build error, not a blank space you find first.",
    },
  },
  {
    id: "eslint",
    merk: "eslint",
    naam: "ESLint",
    groep: "controle",
    soort: PAKKET,
    pakketten: ["eslint"],
    wat: {
      nl: "Leest de code na op slordigheden.",
      en: "Proofreads the code for sloppiness.",
    },
    waarom: {
      nl: "Het meeste wat hij vangt zie je bij het nalezen niet: het verkeerde soort link, een afbeelding zonder maten.",
      en: "Most of what it catches is invisible when reading along: the wrong kind of link, an image without dimensions.",
    },
  },
  {
    id: "playwright",
    naam: "Playwright + axe",
    groep: "controle",
    soort: PAKKET,
    pakketten: ["@playwright/test", "@axe-core/playwright"],
    wat: {
      nl: "Test de site in een echte browser, op desktop, telefoon en liggend, en controleert de toegankelijkheid.",
      en: "Tests the site in a real browser, on desktop, phone and landscape, and checks accessibility.",
    },
  },
  {
    id: "contrast",
    naam: "Contrastcontrole",
    groep: "controle",
    soort: { nl: "Eigen script", en: "In-house script" },
    wat: {
      nl: "Meet elk kleurpaar van beide Uren tegen de toegankelijkheidsnorm.",
      en: "Measures every colour pair of both Hours against the accessibility standard.",
    },
  },
  {
    id: "github-actions",
    merk: "githubactions",
    naam: "GitHub Actions",
    groep: "controle",
    soort: DIENST,
    wat: {
      nl: "Draait alle controles hierboven voordat een wijziging naar main mag.",
      en: "Runs all the checks above before a change may go to main.",
    },
  },
  // ── Gekoppeld aan Claude ──────────────────────────────────────────────
  {
    id: "claude",
    merk: "claude",
    naam: "Claude",
    groep: "claude",
    soort: { nl: "AI-assistent", en: "AI assistant" },
    wat: {
      nl: "De AI-assistent van Anthropic. Alleen de diensten hieronder zijn eraan gekoppeld.",
      en: "The AI assistant made by Anthropic. Only the services below are connected to it.",
    },
    afweging: {
      nl: "Aan het domein, de mail of iets dat geld kost verandert niets zonder mijn akkoord.",
      en: "Nothing about the domain, the mail or anything that costs money changes without my say-so.",
    },
  },
  {
    id: "koppeling-github",
    merk: "github",
    naam: "GitHub",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Waar de code van deze site staat, met elke wijziging als apart voorstel.",
      en: "Where the code of this site lives, with every change as a separate proposal.",
    },
  },
  {
    id: "koppeling-vercel",
    merk: "vercel",
    naam: "Vercel",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "De bouwstappen, de voorbeeldadressen en de foutmeldingen van de live site, om in te zien.",
      en: "The builds, the preview addresses and the error logs of the live site, to look into.",
    },
  },
  {
    id: "koppeling-supabase",
    merk: "supabase",
    naam: "Supabase",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "De database achter het klantportaal.",
      en: "The database behind the client portal.",
    },
  },
  {
    id: "koppeling-drive",
    merk: "googledrive",
    naam: "Google Drive",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Hier staan mijn foto's en merkbestanden. Wat online komt, gaat zonder locatiegegevens.",
      en: "This is where my photos and brand files live. What goes online goes without location data.",
    },
  },
  {
    id: "koppeling-gmail",
    merk: "gmail",
    naam: "Gmail",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Claude kan mijn mail doorzoeken en concepten klaarzetten.",
      en: "Claude can search my mail and prepare drafts.",
    },
  },
  {
    id: "koppeling-cloudflare",
    merk: "cloudflare",
    naam: "Cloudflare",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Het domein gronn.studio en zijn DNS. Daar verandert niets zonder mijn akkoord.",
      en: "The gronn.studio domain and its DNS. Nothing changes there without my say-so.",
    },
  },
  {
    id: "koppeling-mailerlite",
    naam: "MailerLite",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Voor e-mail aan wie zich aanmeldt. Nog niet aangesloten op de site.",
      en: "For email to people who sign up. Not yet connected to the site.",
    },
  },
  {
    id: "koppeling-slack",
    naam: "Slack",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Claude kan er berichten lezen en klaarzetten.",
      en: "Claude can read and prepare messages there.",
    },
  },
  {
    id: "koppeling-blotato",
    naam: "Blotato",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Berichten voor sociale media voorbereiden en inplannen.",
      en: "Preparing and scheduling social media posts.",
    },
  },
  {
    id: "koppeling-tinyfish",
    naam: "TinyFish",
    groep: "claude",
    soort: KOPPELING,
    wat: {
      nl: "Een webagent: zoekt op het web en leest pagina's.",
      en: "A web agent: searches the web and reads pages.",
    },
  },

  // ── In de gaten houden ────────────────────────────────────────────────
  {
    id: "voorbeeldadres",
    naam: "Voorbeeldadres per wijziging",
    groep: "bewaken",
    soort: WERKWIJZE,
    wat: {
      nl: "Elke wijziging krijgt eerst een eigen adres, waar hij te bekijken is voordat hij live gaat, ook op de telefoon.",
      en: "Every change first gets its own address, where it can be seen before it goes live, on a phone too.",
    },
  },
  {
    id: "testronde",
    naam: "De hele testronde",
    groep: "bewaken",
    soort: WERKWIJZE,
    wat: {
      nl: "Vóór elke samenvoeging draaien alle tests in een echte browser, op desktop, telefoon en liggend. Faalt er één, dan gaat er niets live.",
      en: "Before every merge every test runs in a real browser, on desktop, phone and landscape. If one fails, nothing goes live.",
    },
    waarom: {
      nl: "Een wijziging aan het menu kan een pagina breken waar niemand aan dacht. Alleen de hele ronde vangt dat.",
      en: "A change to the menu can break a page nobody thought of. Only the whole round catches that.",
    },
  },
  {
    id: "wijziging-gevolgd",
    naam: "Elke wijziging gevolgd",
    groep: "bewaken",
    soort: WERKWIJZE,
    wat: {
      nl: "Elke open wijziging op GitHub wordt gevolgd. Een rode controle of een opmerking wordt opgelost of uitgelegd voordat er iets live gaat.",
      en: "Every open change on GitHub is followed. A red check or a comment is fixed or explained before anything goes live.",
    },
  },
  {
    id: "contrast-foto",
    naam: "Contrast boven foto's",
    groep: "bewaken",
    soort: EIGEN,
    wat: {
      nl: "Een test maakt schermafdrukken van de menu's en de opening boven de zwaarste foto's en meet of alles leesbaar blijft.",
      en: "A test takes screenshots of the menus and the opening over the heaviest photos and measures whether everything stays readable.",
    },
    waarom: {
      nl: "Een kleurcode zegt niets over glas boven een foto. Pas de schermafdruk laat zien wat je echt leest.",
      en: "A colour code says nothing about glass over a photo. Only the screenshot shows what you actually read.",
    },
  },
  {
    id: "terugdraaien",
    naam: "Terug in één stap",
    groep: "bewaken",
    soort: WERKWIJZE,
    wat: {
      nl: "Gaat er toch iets mis, dan staat de vorige versie met één opdracht weer live.",
      en: "If something still goes wrong, the previous version is live again with a single command.",
    },
  },
]

export const aantalIn = (groep: StackGroepId) => STACK.filter((o) => o.groep === groep).length

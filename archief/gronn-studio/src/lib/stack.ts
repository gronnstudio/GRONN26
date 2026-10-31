import pkg from "../../package.json"

import type { L } from "@/lib/i18n"

// The machine-readable stack of gronn.studio — the data behind /stack.
//
// Division of labour, deliberately:
//   • STRUCTURE lives here, in code: which layers exist, which technology
//     sits in which layer, and which npm packages back it. Versions are
//     never typed by hand — they are read out of package.json below, so
//     the page cannot drift from what is actually installed.
//   • The cross-reference with the sister site (Equilibrium) also lives
//     here: it is a fact taken from TECH-STACK.md, not editorial copy.
//   • PROSE (role / why / cost) is defined here only as the fallback the
//     content document is seeded from (scripts/export-content.ts). The
//     rendered sentences come from content/site-content.json, so the
//     owner can rewrite them in the editor without touching code.

const VERSIONS: Record<string, string> = {
  ...(pkg.dependencies as Record<string, string>),
  ...(pkg.devDependencies as Record<string, string>),
}

/** Installed version of a package, straight from package.json. */
export function versionOf(name: string): string | null {
  return VERSIONS[name] ?? null
}

/** `["next", "react"]` → `[{ name: "next", version: "16.2.10" }, …]` */
export function packageVersions(names: readonly string[]) {
  return names.map((name) => ({ name, version: versionOf(name) }))
}

export type StackLayerKey = "frontend" | "hosting" | "content" | "tooling"

export type StackLayer = {
  key: StackLayerKey
  /** Fallback label — the content document may override it. */
  title: L
  /** Fallback summary — the content document may override it. */
  summary: L
}

export type StackTech = {
  key: string
  layer: StackLayerKey
  /** Product name as its makers write it. Never translated. */
  name: string
  /** npm packages backing it; empty for platforms and in-house code. */
  packages: string[]
  /** Shown instead of version chips when there is no package. */
  kind?: L
  /** Does Equilibrium, the sister site, run this too? (TECH-STACK.md) */
  shared: boolean
  /** How the two repositories differ on this one, where they do. */
  sisterNote?: L
  role: L
  why: L
  cost: L
}

export const STACK_LAYERS: StackLayer[] = [
  {
    key: "frontend",
    title: { en: "Frontend", nl: "Frontend" },
    summary: {
      en: "Everything that reaches the browser: the framework, the rendering runtime, the design system and the motion vocabulary.",
      nl: "Alles wat de browser bereikt: het framework, de renderruntime, het ontwerpsysteem en de bewegingstaal.",
    },
  },
  {
    key: "hosting",
    title: { en: "Hosting", nl: "Hosting" },
    summary: {
      en: "Two moving parts, on purpose. There is no server to run and no database to back up — the site is built ahead of time and served from a CDN.",
      nl: "Bewust maar twee onderdelen. Er draait geen server en er is geen database om te back-uppen — de site wordt vooraf gebouwd en vanaf een CDN geserveerd.",
    },
  },
  {
    key: "content",
    title: { en: "Content", nl: "Inhoud" },
    summary: {
      en: "How the words on this site get changed: an in-house editor on the live site, a sign-in that guards it, and one CMS kept dormant.",
      nl: "Hoe de teksten op deze site veranderen: een eigen editor op de live site, een login die hem bewaakt en één CMS dat slapend blijft.",
    },
  },
  {
    key: "tooling",
    title: { en: "Tooling", nl: "Gereedschap" },
    summary: {
      en: "What runs before anything ships: the language, the linter, the stylesheet build and the browser-driven checks that verify both languages.",
      nl: "Wat draait voordat er iets live gaat: de taal, de linter, de stijlbladbuild en de browsercontroles die beide talen verifiëren.",
    },
  },
]

export const STACK_TECH: StackTech[] = [
  // ── Frontend ────────────────────────────────────────────────────────
  {
    key: "next",
    layer: "frontend",
    name: "Next.js",
    packages: ["next"],
    shared: true,
    sisterNote: {
      en: "Equilibrium still runs Next 15. Closing that gap is the first blocker before the two sites can share components.",
      nl: "Equilibrium draait nog op Next 15. Dat gat dichten is de eerste blokkade voordat beide sites componenten kunnen delen.",
    },
    role: {
      en: "The frame: App Router, server components, one build, one deploy.",
      nl: "Het raamwerk: App Router, servercomponenten, één build, één deploy.",
    },
    why: {
      en: "Static pages that still get to use React, with routing, metadata, images and middleware in one place. The Dutch routes are a middleware rewrite rather than an i18n library — fewer dependencies, real addresses.",
      nl: "Statische pagina's die tóch React mogen gebruiken, met routering, metadata, afbeeldingen en middleware op één plek. De Nederlandse routes zijn een rewrite in middleware in plaats van een i18n-bibliotheek — minder afhankelijkheden, echte adressen.",
    },
    cost: {
      en: "The version is pinned exactly, not as a range: majors move fast and the App Router API moves with them. Every upgrade is read against the documentation shipped inside the package itself.",
      nl: "De versie staat exact vast, niet als bereik: majors gaan snel en de App Router-API gaat mee. Elke upgrade wordt gelezen tegen de documentatie die in het pakket zelf meekomt.",
    },
  },
  {
    key: "react",
    layer: "frontend",
    name: "React",
    packages: ["react", "react-dom"],
    shared: true,
    role: {
      en: "The UI runtime — server components for the shell, client components for anything with a hand on it.",
      nl: "De UI-runtime — servercomponenten voor de schil, clientcomponenten voor alles waar een hand aan zit.",
    },
    why: {
      en: "Server components keep the content document, the copy and the metadata out of the browser bundle. Only the parts you can actually touch — this page's filters, the menu, the theme switch — are shipped as JavaScript.",
      nl: "Servercomponenten houden het contentdocument, de teksten en de metadata buiten de browserbundel. Alleen wat je echt kunt aanraken — de filters op deze pagina, het menu, de themawissel — wordt als JavaScript verstuurd.",
    },
    cost: {
      en: "Pinned to an exact version alongside react-dom: those two must never drift apart, and a version range is exactly how they do.",
      nl: "Vastgezet op een exacte versie, samen met react-dom: die twee mogen nooit uit elkaar lopen, en met een versiebereik gebeurt dat.",
    },
  },
  {
    key: "tailwind",
    layer: "frontend",
    name: "Tailwind CSS",
    packages: ["tailwindcss"],
    shared: true,
    role: {
      en: "The design system: five palettes generated from one set of semantic tokens.",
      nl: "Het ontwerpsysteem: vijf paletten uit één set semantische tokens.",
    },
    why: {
      en: "Colours are named after their role — background, surface, line, accent — never after a hex code. Switching palette swaps the token values underneath; no component knows which theme it is standing in.",
      nl: "Kleuren heten naar hun rol — achtergrond, oppervlak, lijn, accent — nooit naar een hexcode. Van palet wisselen verandert alleen de tokenwaarden eronder; geen enkel component weet in welk thema het staat.",
    },
    cost: {
      en: "Utility classes make the markup dense, and the discipline is unforgiving: one hardcoded colour and a theme breaks in the dark.",
      nl: "Utility-klassen maken de markup dicht, en de discipline is onverbiddelijk: één hardgecodeerde kleur en een thema breekt in het donker.",
    },
  },
  {
    key: "framer-motion",
    layer: "frontend",
    name: "Framer Motion",
    packages: ["framer-motion"],
    shared: true,
    role: {
      en: "Every animation on the site, from the headline reveals to the cards that open on this page.",
      nl: "Elke animatie op de site, van de onthulling van de koppen tot de kaarten die op deze pagina opengaan.",
    },
    why: {
      en: "One animation library, not three. Variants, layout animation and enter/exit transitions cover the whole vocabulary, and the reduced-motion branch is a plain condition inside the component instead of a separate stylesheet.",
      nl: "Eén animatiebibliotheek, geen drie. Variants, layout-animatie en enter/exit-overgangen dekken de hele woordenschat, en de reduced-motion-tak is gewoon een voorwaarde in het component in plaats van een apart stijlblad.",
    },
    cost: {
      en: "It is the single largest client dependency, so motion belongs in client components only — and the studio rule is that no second animation library may ever stand beside it.",
      nl: "Het is de grootste clientafhankelijkheid, dus beweging hoort alleen in clientcomponenten thuis — en de regel van de studio is dat er nooit een tweede animatiebibliotheek naast mag staan.",
    },
  },
  {
    key: "lenis",
    layer: "frontend",
    name: "Lenis",
    packages: ["lenis"],
    shared: true,
    role: {
      en: "Smooth scrolling — the inertia under every page.",
      nl: "Vloeiend scrollen — de traagheid onder elke pagina.",
    },
    why: {
      en: "Scroll-linked motion needs a scroll position something owns. Lenis provides one, drives it from a single animation frame loop, and stays invisible otherwise.",
      nl: "Scrollgebonden beweging heeft een scrollpositie nodig die iets bezit. Lenis levert die, stuurt hem vanuit één animatieframelus en blijft verder onzichtbaar.",
    },
    cost: {
      en: "It owns scrolling outright: CSS smooth scrolling must never be switched on beside it, or the two fight each other and the page stutters. Reduced motion turns it off entirely.",
      nl: "Zij bezit het scrollen volledig: vloeiend scrollen via CSS mag er nooit naast aan staan, anders vechten ze en hapert de pagina. Bij reduced motion gaat zij helemaal uit.",
    },
  },
  {
    key: "three",
    layer: "frontend",
    name: "three.js + React Three Fiber",
    packages: ["three", "@react-three/fiber"],
    shared: true,
    sisterNote: {
      en: "Equilibrium runs three 0.180 and drives its scene with a scroll timeline; the same renderer, a different subject.",
      nl: "Equilibrium draait three 0.180 en stuurt zijn scène met een scrolltijdlijn aan; dezelfde renderer, een ander onderwerp.",
    },
    role: {
      en: "The 3D terrain, written as React components instead of imperative scene code.",
      nl: "Het 3D-terrein, geschreven als React-componenten in plaats van imperatieve scènecode.",
    },
    why: {
      en: "React Three Fiber lets the field render through the same props and state as the rest of the site, so the scene can follow the active theme instead of carrying its own colours.",
      nl: "Met React Three Fiber rendert het veld via dezelfde props en state als de rest van de site, zodat de scène het actieve thema kan volgen in plaats van eigen kleuren mee te dragen.",
    },
    cost: {
      en: "By far the heaviest thing on any page. It renders only where it is used, its frame loop stops the moment it leaves the viewport, phones get a lighter mesh, and under reduced motion it never mounts at all.",
      nl: "Veruit het zwaarste op elke pagina. Het rendert alleen waar het gebruikt wordt, de framelus stopt zodra het uit beeld gaat, telefoons krijgen een lichter maaswerk en bij reduced motion wordt het helemaal niet geladen.",
    },
  },
  {
    key: "next-themes",
    layer: "frontend",
    name: "next-themes",
    packages: ["next-themes"],
    shared: false,
    sisterNote: {
      en: "Equilibrium switches palettes with its own small themes module instead.",
      nl: "Equilibrium wisselt van palet met een eigen kleine themamodule.",
    },
    role: {
      en: "Palette switching — Paper, Meadow, Forest, Night and Nocturne — as a class on the document.",
      nl: "Paletwissels — Paper, Weide, Bos, Nacht en Nocturne — als een klasse op het document.",
    },
    why: {
      en: "It writes the chosen palette before the first paint, so a dark theme never flashes white on reload, and it remembers the choice across visits.",
      nl: "Het schrijft het gekozen palet vóór de eerste paint, zodat een donker thema bij het herladen nooit wit opflitst, en het onthoudt de keuze tussen bezoeken.",
    },
    cost: {
      en: "The server cannot know which palette a visitor picked, so anything that renders a theme name has to wait for hydration before it can say it out loud.",
      nl: "De server kan niet weten welk palet een bezoeker koos, dus alles wat een themanaam toont moet wachten op hydratie voordat het die kan noemen.",
    },
  },
  {
    key: "lucide",
    layer: "frontend",
    name: "Lucide",
    packages: ["lucide-react"],
    shared: false,
    sisterNote: {
      en: "Equilibrium ships no icon library — it draws its own line-work by hand.",
      nl: "Equilibrium heeft geen iconenbibliotheek — het tekent zijn lijnwerk met de hand.",
    },
    role: {
      en: "The icon set: arrows, chevrons and status marks.",
      nl: "De iconenset: pijlen, chevrons en statusmarkeringen.",
    },
    why: {
      en: "Icons are imported one by one, so an arrow costs an arrow. Every one of them sits next to a written label — nothing on this site is icon-only.",
      nl: "Iconen worden stuk voor stuk geïmporteerd, dus een pijl kost een pijl. Elk icoon staat naast een geschreven label — niets op deze site is alleen een icoon.",
    },
    cost: {
      en: "An icon library is a standing invitation to replace words with pictures. The studio's rule runs the other way, so most of the set stays unused.",
      nl: "Een iconenbibliotheek is een blijvende uitnodiging om woorden door plaatjes te vervangen. De regel van de studio gaat de andere kant op, dus het grootste deel van de set blijft ongebruikt.",
    },
  },
  {
    key: "class-utils",
    layer: "frontend",
    name: "clsx + tailwind-merge",
    packages: ["clsx", "tailwind-merge"],
    shared: false,
    role: {
      en: "Conditional class names, with later utilities correctly beating earlier ones.",
      nl: "Voorwaardelijke klassenamen, waarbij latere utilities eerdere terecht verslaan.",
    },
    why: {
      en: "Two small functions behind one helper: the first builds the class string, the second resolves the conflicts, so a component can accept an override without a cascade of exceptions.",
      nl: "Twee kleine functies achter één hulpfunctie: de eerste bouwt de klassenstring, de tweede lost de conflicten op, zodat een component een override kan aannemen zonder een reeks uitzonderingen.",
    },
    cost: {
      en: "Two dependencies for something that looks like joining strings — right up until two padding utilities collide and the wrong one wins.",
      nl: "Twee afhankelijkheden voor iets dat op stringplakken lijkt — tot twee padding-utilities botsen en de verkeerde wint.",
    },
  },

  // ── Hosting ─────────────────────────────────────────────────────────
  {
    key: "vercel",
    layer: "hosting",
    name: "Vercel",
    packages: [],
    kind: { en: "Platform", nl: "Platform" },
    shared: true,
    role: {
      en: "Hosting, CDN and deploys. A push to the main branch is a production release.",
      nl: "Hosting, CDN en deploys. Een push naar de main-branch is een productierelease.",
    },
    why: {
      en: "It is the framework's own platform: every pull request gets its own preview URL to verify on, there is no build server to maintain, and there is no environment left to drift.",
      nl: "Het is het platform van het framework zelf: elke pull request krijgt een eigen preview-URL om op te controleren, er is geen buildserver om te onderhouden en er is geen omgeving die kan wegdrijven.",
    },
    cost: {
      en: "Platform dependency in exchange for that simplicity — image optimisation, middleware and the content store are all Vercel-shaped, and moving away would mean rebuilding those three.",
      nl: "Platformafhankelijkheid in ruil voor die eenvoud — beeldoptimalisatie, middleware en de contentopslag zijn allemaal op Vercel gevormd, en weggaan betekent die drie opnieuw bouwen.",
    },
  },
  {
    key: "blob",
    layer: "hosting",
    name: "Vercel Blob",
    packages: ["@vercel/blob"],
    shared: true,
    sisterNote: {
      en: "Equilibrium uses the same store for member file uploads.",
      nl: "Equilibrium gebruikt dezelfde opslag voor bestandsuploads van leden.",
    },
    role: {
      en: "The private store holding the published content document and the studio's uploaded photographs.",
      nl: "De private opslag met het gepubliceerde contentdocument en de geüploade foto's van de studio.",
    },
    why: {
      en: "Changing a sentence on the site should not require a commit. Publishing writes a single JSON document to the store and refreshes one cache tag; the change is live within seconds.",
      nl: "Een zin op de site aanpassen hoort geen commit te vereisen. Publiceren schrijft één JSON-document naar de opslag en vernieuwt één cachetag; de wijziging is binnen seconden live.",
    },
    cost: {
      en: "A second source of truth beside git. The same document stays committed in the repository as the fallback, so a missing store degrades to the last committed copy instead of an empty page.",
      nl: "Een tweede bron van waarheid naast git. Hetzelfde document blijft als fallback in de repository staan, zodat een ontbrekende opslag terugvalt op de laatst vastgelegde kopie in plaats van een lege pagina.",
    },
  },

  // ── Content ─────────────────────────────────────────────────────────
  {
    key: "gronn-editor",
    layer: "content",
    name: "The GRØNN Editor",
    packages: [],
    kind: { en: "Built in-house", nl: "Zelf gebouwd" },
    shared: false,
    sisterNote: {
      en: "Kept deliberately self-contained so it can be lifted into Equilibrium later.",
      nl: "Bewust op zichzelf gehouden zodat hij later naar Equilibrium verplaatst kan worden.",
    },
    role: {
      en: "Editing on the live site: sign in, click any sentence, rewrite it in both languages, publish.",
      nl: "Bewerken op de live site: inloggen, op elke zin klikken, hem in beide talen herschrijven, publiceren.",
    },
    why: {
      en: "A full content platform for one owner and one site is more machinery than the words need. This one is a handful of components with no schema to keep in step and no second dashboard to learn.",
      nl: "Een volwaardig contentplatform voor één eigenaar en één site is meer machinerie dan de teksten vragen. Deze bestaat uit een handvol componenten, zonder schema dat synchroon moet blijven en zonder tweede dashboard om te leren.",
    },
    cost: {
      en: "It is ours to maintain, and content edits deliberately bypass git — the words have their own history, separate from the code's.",
      nl: "Wij onderhouden hem zelf, en tekstwijzigingen gaan bewust buiten git om — de woorden hebben hun eigen geschiedenis, los van die van de code.",
    },
  },
  {
    key: "next-auth",
    layer: "content",
    name: "NextAuth",
    packages: ["next-auth"],
    shared: false,
    sisterNote: {
      en: "Equilibrium signs its own session cookie instead, because it has real member accounts to serve.",
      nl: "Equilibrium ondertekent zijn eigen sessiecookie, omdat het echte ledenaccounts moet bedienen.",
    },
    role: {
      en: "The Google sign-in that guards the editor — an allowlist of exactly one address.",
      nl: "De Google-login die de editor bewaakt — een toegangslijst van precies één adres.",
    },
    why: {
      en: "There are no visitor accounts to build here. One person edits this site, and the studio's existing Google account is the key.",
      nl: "Er zijn hier geen bezoekersaccounts te bouwen. Eén persoon bewerkt deze site, en het bestaande Google-account van de studio is de sleutel.",
    },
    cost: {
      en: "An authentication library on a site with no users, carried entirely for one route. Honest weight, and the reason the editor route sits outside the public language tree.",
      nl: "Een authenticatiebibliotheek op een site zonder gebruikers, alleen meegedragen voor één route. Eerlijk gewicht, en de reden dat de editorroute buiten de publieke taalstructuur valt.",
    },
  },
  // ── Tooling ─────────────────────────────────────────────────────────
  {
    key: "typescript",
    layer: "tooling",
    name: "TypeScript",
    packages: ["typescript"],
    shared: true,
    role: {
      en: "The language everything is written in — including the shape of the content document.",
      nl: "De taal waarin alles geschreven is — ook de vorm van het contentdocument.",
    },
    why: {
      en: "Every visible string is typed as an English/Dutch pair. A missing translation is therefore a build error, not a blank space a visitor finds first.",
      nl: "Elke zichtbare tekst is getypeerd als een Engels/Nederlands-paar. Een ontbrekende vertaling is daardoor een buildfout, geen lege plek die een bezoeker als eerste vindt.",
    },
    cost: {
      en: "Nothing at runtime — the types are stripped during the build. The cost is paid up front: nothing merges until the type check is silent.",
      nl: "Niets tijdens runtime — de types worden er bij de build uitgehaald. De kosten worden vooraf betaald: er wordt niets samengevoegd voordat de typecontrole zwijgt.",
    },
  },
  {
    key: "eslint",
    layer: "tooling",
    name: "ESLint",
    packages: ["eslint", "eslint-config-next"],
    shared: false,
    sisterNote: {
      en: "Equilibrium has no linter configured yet.",
      nl: "Equilibrium heeft nog geen linter ingesteld.",
    },
    role: {
      en: "The lint gate, running the framework's own rule set before every pull request.",
      nl: "De lintpoort, die vóór elke pull request de eigen regelset van het framework draait.",
    },
    why: {
      en: "Most of what it catches is framework-specific and invisible in review: the wrong kind of link, an image without dimensions, a hook called from the wrong place.",
      nl: "Het meeste wat hij vangt is frameworkspecifiek en onzichtbaar bij het reviewen: het verkeerde soort link, een afbeelding zonder afmetingen, een hook die van de verkeerde plek wordt aangeroepen.",
    },
    cost: {
      en: "Its configuration is pinned to the framework version, so a framework upgrade has to move both packages or neither.",
      nl: "De configuratie is vastgezet op de frameworkversie, dus een frameworkupgrade moet beide pakketten verplaatsen of geen van beide.",
    },
  },
  {
    key: "postcss",
    layer: "tooling",
    name: "Tailwind PostCSS plugin",
    packages: ["@tailwindcss/postcss"],
    shared: true,
    role: {
      en: "The single build step between the stylesheet and the browser.",
      nl: "De enige buildstap tussen het stijlblad en de browser.",
    },
    why: {
      en: "Tailwind 4 configures itself from the stylesheet, so the palettes and the type scale live in the CSS file next to the rules that use them. There is no separate JavaScript config to keep in sync.",
      nl: "Tailwind 4 configureert zichzelf vanuit het stijlblad, dus de paletten en de typeschaal staan in het CSS-bestand naast de regels die ze gebruiken. Er is geen aparte JavaScript-config die synchroon moet blijven.",
    },
    cost: {
      en: "One more thing that must run before anything renders — and because the configuration moved into CSS, most Tailwind examples written before version 4 no longer apply here.",
      nl: "Nog iets dat moet draaien voordat er iets rendert — en doordat de configuratie naar CSS verhuisde, gelden de meeste Tailwind-voorbeelden van vóór versie 4 hier niet meer.",
    },
  },
  {
    key: "types",
    layer: "tooling",
    name: "Type definitions",
    packages: [
      "@types/node",
      "@types/react",
      "@types/react-dom",
      "@types/three",
    ],
    shared: true,
    sisterNote: {
      en: "Equilibrium is a Node major ahead on its type definitions.",
      nl: "Equilibrium loopt een Node-major voor op zijn typedefinities.",
    },
    role: {
      en: "Types for the libraries that ship none of their own.",
      nl: "Types voor de bibliotheken die er zelf geen meeleveren.",
    },
    why: {
      en: "They are what makes the editor and the compiler agree with what actually runs. The 3D types in particular keep a scene honest that would otherwise fail silently at runtime.",
      nl: "Zij zorgen dat de editor en de compiler het eens zijn met wat er werkelijk draait. Vooral de 3D-types houden een scène eerlijk die anders pas tijdens runtime stilletjes zou falen.",
    },
    cost: {
      en: "They have to keep step with the libraries they describe: the 3D types follow the renderer's version, not their own release rhythm.",
      nl: "Ze moeten gelijke tred houden met de bibliotheken die ze beschrijven: de 3D-types volgen de versie van de renderer, niet hun eigen releaseritme.",
    },
  },
  {
    key: "checks",
    layer: "tooling",
    name: "Browser-driven checks",
    packages: [],
    kind: { en: "Repository scripts", nl: "Scripts in de repository" },
    shared: false,
    sisterNote: {
      en: "Equilibrium runs a real end-to-end suite; this site does not have one yet.",
      nl: "Equilibrium draait een echte end-to-end-suite; deze site heeft die nog niet.",
    },
    role: {
      en: "Node scripts that drive a headless browser: language rendering, 3D mounting, performance runs.",
      nl: "Node-scripts die een headless browser aansturen: taalweergave, 3D-mounten, prestatiemetingen.",
    },
    why: {
      en: "Searching the raw HTML cannot prove which language a page renders, because both languages travel in the payload of every page. The checks open a real browser and read the rendered document instead.",
      nl: "Zoeken in de ruwe HTML kan niet bewijzen welke taal een pagina toont, want beide talen reizen mee in de payload van elke pagina. De controles openen daarom een echte browser en lezen het gerenderde document.",
    },
    cost: {
      en: "An honest gap: these are checks, not a test suite. Full end-to-end coverage is on the roadmap and is not in this repository yet.",
      nl: "Een eerlijk gat: dit zijn controles, geen testsuite. Volledige end-to-end-dekking staat op de routekaart en zit nog niet in deze repository.",
    },
  },
]

export function techForLayer(layer: StackLayerKey) {
  return STACK_TECH.filter((tech) => tech.layer === layer)
}

# Concepts — approved in principle, not built yet

Parked with enough detail that any session can pick one up and start.
Written 27 Jul 2026, when the owner chose to proceed with the
internationalisation architecture and hold the rest as concepts.

---

## C1 — Analytics (privacy-preserving)

**Problem.** There is no measurement of any kind. We cannot answer the
only questions that matter commercially: does anyone reach the contact
form, where do visitors come from, which pages lose them. Every
optimisation after this is guesswork without it.

**Constraint.** The privacy page promises zero tracking cookies and the
cookie notice is a joke about vegan cookies. Whatever we add must keep
that promise literally true, and the privacy page must name it.

**Shape.** Cookieless, aggregate-only. Two candidates:
- *Vercel Web Analytics* — one component, no account, no cookies.
  Costs money past the Hobby event allowance (💳).
- *Umami*, self-hosted on a free Postgres tier — free forever, more
  setup, one more thing to keep alive.

**Minimum useful events**, not a dashboard for its own sake:
page views; contact-form *started* vs *completed* (the funnel that
matters); WhatsApp/Instagram rail clicks; language chosen; 404s.

**Done when** we can state, with numbers, how many enquiries the site
produced last month and which page preceded them.

---

## C2 — Interface labels editable

**Problem / non-problem.** Everything a visitor reads *as the studio's
voice* is already editable. What remains hard-coded is interface
vocabulary: section labels ("01 — Observation"), buttons ("Start a
Project", "View service"), navigation, the four-step form's ~30 labels,
404 copy, cookie notice, footer headings.

**Owner decision pending:** full sweep (~100–150 strings, ~20 files) or
the middle option (section labels + CTA texts only, ~40 strings). The
middle option captures most of the value; the rest is vocabulary the
owner would rarely change and where a stray phone edit could confuse
visitors — imagine renaming the form's "Send" button mid-campaign.

**Shape.** Same pattern as everything else: literals move into
`content-types.ts` + `scripts/export-content.ts`, regenerate
`content/site-content.json`, wrap with `EditableText`. The fallback
shallow-merge in `src/lib/content.ts` already protects documents
published before the new keys existed.

**Estimated cost** ≈ the whole-site editable pass (PR #19).

---

## C3 — Remaining performance levers

Measured context in `docs/perf/README.md`. After the image pipeline
and idle 3D layer, mobile sits at 44–47 against a target of 85. The
internationalisation work now in progress removes one cause. These are
the others, in order of expected effect:

**C3a — The always-on chrome.** Eight client components mount on every
single route: preloader, Lenis smooth scroll, grain overlay, custom
cursor, header, mobile dock, contact rail, install prompt, cookie
notice, editor provider. Every page pays their hydration cost before it
renders anything of its own. Worth asking of each: does it earn its
place on *every* page, and can it mount after first paint the way the
3D layer now does (`src/lib/use-deferred-visible.ts` is reusable)?

**C3b — framer-motion breadth.** Imported by ~29 components. Many uses
are a simple fade or rise on scroll, which CSS
(`@starting-style`, scroll-driven animations, or a tiny
IntersectionObserver + class toggle) does for free. Keep framer-motion
for the genuinely choreographed pieces — curtain menu, pinned gallery,
stacking cards, letter-flip — and drop it from the simple ones.

**C3c — Fonts.** Syne ships as a 70 KB TTF; woff2 is typically half
that, and it is on the critical path for the hero.

**C3d — Unused JavaScript.** Lighthouse reports ~148 KB / ~750 ms of
unused JS on the home page. Worth a bundle analysis once C3a/C3b land,
since those will change the picture.

**Honest expectation:** none of these alone reaches 85. Together with
the i18n change they plausibly do. Re-measure after each — the baseline
protocol is committed (`scripts/lighthouse-run.sh`).

---

## C4 — Editor on Equilibrium

`the-editor` (private repo) was extracted from this codebase but has
never been integrated anywhere else, so its portability claims are
untested. Equilibrium is the natural first consumer: same stack, same
owner, and it would give both brands one editing experience. Doing this
is also the honest prerequisite before the kit could ever be offered to
a client site.

---

## C5 — V3.1.1: de telefoonsite langs twee externe leidraden

**Status:** wacht op de bronnen. Er is niets aan besloten en er is niets
aan gebouwd.

**De opdracht.** De eigenaar wees op 22 september 2026 twee bronnen aan
als leidraad voor V3.1.1:

- <https://www.figma.com/resource-library/mobile-website-design/>
- <https://mobbin.com/>

**Waarom hier nog niets staat.** Geen van beide is vanuit de
bouwomgeving te lezen: de egress-proxy beantwoordt `CONNECT` naar
`figma.com` en `mobbin.com` met 403. Wat in die bronnen staat is dus
onbekend, en het is niet ingevuld met een gok — dat zou precies het
tegenovergestelde zijn van een leidraad volgen.

**Wat er nodig is om verder te kunnen.** De kern van het Figma-artikel
en de patronen uit Mobbin, aangeleverd als tekst of als schermafdrukken.
Daarna worden ze hier omgezet in concrete wijzigingen en verhuizen de
twee URL's naar de referentieparagraaf in `CLAUDE.md`, naast
navbar.gallery, biovijver.nl en het platformmenu van GitHub.

**Vier dingen die ik intussen zelf zag, en die de eigenaar
uitdrukkelijk NIET als agenda heeft aangewezen.** Ze staan hier zodat ze
niet opnieuw bedacht hoeven te worden, niet omdat ze gepland zijn:

1. *Labels onder de iconen.* De dock draagt zes iconen zonder woord.
   Van de zes is alleen het huisje een conventie; een troffel, een
   passer en een papieren vliegtuigje zijn dat niet. Alleen-iconen is
   een uitdrukkelijke keuze van de eigenaar, twee keer vastgelegd.
2. *De duimzone.* Weergave en Kleur staan rechtsboven — de moeilijkst
   bereikbare hoek met één hand op een groot toestel. Het eerste idee
   van de eigenaar (instellingen onderin, in de ingeklapte stand) was
   daar beter op; er is uiteindelijk voor de gespiegelde balken gekozen.
3. *Twee bestaande overlopen*, gemeten en niet van de navigatieronde:
   de dienstkaarten lopen op 320px 28px horizontaal over (een
   prijskolom die niet krimpt), en de homepage loopt over bij 125%
   tekst. Allebei maken ze een `inset-x-0`-balk breder dan het venster.
4. *Het intakeformulier op een telefoon.* Het enige scherm waar iemand
   echt iets moet dóén, en er staat één test op.

**Niet samenvoegen zolang dit loopt.** De eigenaar heeft op 22 september
gevraagd geen langlopende PR's te mergen. PR #69 (de telefoonnavigatie,
groen) blijft daarom als concept openstaan, net als #133, #134 en #93.

---

## C6 — Apps in de Play Store en App Store

Geparkeerd op 25 sep 2026. Eigenaar: "Zet apps voor jaar in concepts".
**Opnieuw bekijken: september 2027.**

**Wat er nu al is.** De site is een installeerbare web-app (PWA). Chrome
op Android biedt "App installeren" aan (`app-melding`); op iPhone gaat
het via Delen → Zet op beginscherm. Voor die app-weergave zijn in sep
2026 de deelknop, WhatsApp in de dock en de pijlen voor terug/verder
gebouwd.

**Android (Google Play).**
- Kosten: eenmalig $25 ontwikkelaarsaccount.
- Vorm: Trusted Web Activity (PWABuilder of Bubblewrap). De site blijft
  de bron; een wijziging op de site hoeft niet opnieuw door de winkel.
  Vereist `/.well-known/assetlinks.json` op gronn.studio.
- Let op: een nieuw *persoonlijk* account moet eerst 14 dagen gesloten
  testen met minstens 12 testers. Een *bedrijfs*account slaat dat over,
  maar vraagt een D-U-N-S-nummer (gratis, dagen tot weken).

**Apple (App Store).**
- Kosten: €99 per jaar (Apple Developer Program).
- Vorm: een schil zoals Capacitor; bouwen vraagt Xcode (Mac) of een
  cloud-build.
- Risico: richtlijn 4.2 (minimale functionaliteit) wijst "een website in
  een doosje" af. Pas zinvol als de app iets eigens doet: het
  klantportaal met projectstatus, pushmeldingen voor onderhoud, foto's
  uploaden, of het onderhoudsschema offline.

**Advies bij heropenen.** Android eerst, met een bedrijfsaccount. Apple
pas als het klantportaal genoeg eigen functies heeft om de keuring te
halen. Het account en de betaling doet de eigenaar zelf.

**Klaar als** GRØNN Studio in de Play Store staat, de app dezelfde
inhoud toont als gronn.studio, en de privacyverklaring de winkel noemt.

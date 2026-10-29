# GRØNN Studio — Work Log

Chronological record of completed development work on gronn.studio,
reconstructed from repository history (commits, branches, PRs, docs) and
maintained continuously per [HOURS_MANIFEST.md](../HOURS_MANIFEST.md).
This log documents completed work only — it never records or estimates
hours; time registration remains the owner's responsibility (DigiBoox).

---

## 2026-07-10 — Project foundation

**Phase:** Foundation

**Summary:** Initial build of the complete GRØNN Studio marketing site:
Next.js 16 application with seven pages (home, studio, services,
projects + case studies, approach, journal + articles, contact), full
bilingual content model, brand palette and typed content data.

**Detailed activities:**
- Set up Next.js 16 / React 19 / Tailwind 4 project architecture
- Built all page routes and section components (12 homepage sections)
- Created typed bilingual (EN/NL) content: 6 projects, 6 journal
  articles, 6 services
- Established brand palette and base layout, header, footer

**Categories:** Website Development, Technical Architecture, UI / UX Design, Content

**Files:** entire `src/` tree, `package.json`, `src/lib/data/*`

**Commits:** 763498f

### DigiBoox Summary
Nieuwe bedrijfswebsite opgezet. Alle pagina's gebouwd (home, studio,
diensten, projecten, aanpak, journaal, contact), tweetalige inhoud
geschreven en de technische basis van de website ingericht.

---

## 2026-07-11 — Theming, taalwissel en typografie

**Phase:** Design system

**Summary:** Added the theme switcher and EN/NL language switch, adopted
the brand type system (Syne/Montserrat/Geist Mono), and fixed the first
motion defects (scroll rubber-banding, reveals that never fired).

**Detailed activities:**
- Built theme system on semantic color tokens
- Built client-side language provider with persistent EN/NL switch
- Integrated brand fonts and the P-brandmark
- Fixed scroll behavior conflicts and masked-reveal animations
- Added showcase hover imagery, word-stagger reveals, underline-draw,
  rotating stamp

**Categories:** Website Development, UI / UX Design, Bug Fixing

**Files:** `src/components/language-provider.tsx`, `src/lib/i18n.ts`, `src/app/globals.css`, `src/components/motion/*`

**Commits:** 469c9ec, 27404d6, f6d8d26

### DigiBoox Summary
Website verder ontwikkeld. Kleurenthema's en taalwissel
(Nederlands/Engels) gebouwd, huisstijl-lettertypes doorgevoerd en
animatiefouten opgelost.

---

## 2026-07-12 — Bewegingslaag en vier thema's (Milestone 2)

**Phase:** Experience layer

**Summary:** Added the site-wide motion layer (custom cursor, page
transitions, scroll progress), replaced the binary light/dark scheme
with four named palettes behind a single labeled toggle, and delivered
the "Milestone 2" immersive experience layer including the 3D terrain.

**Detailed activities:**
- Custom cursor, page transitions and scroll-linked progress
- Four themes (Paper, Meadow, Forest, Night) with self-explaining
  cycle toggle showing the theme name
- Equal-height project cards and strict index grid
- Immersive layer: 3D wireframe terrain hero, chapter structure
- Removed outdated stamp segment

**Categories:** Website Development, UI / UX Design, Technical Architecture

**Files:** `src/components/motion/*`, `src/components/theme-toggle.tsx`, `src/components/three/*`, `src/app/globals.css`

**Commits:** 7d92ea5, bd294ef, 9070355, bb1e668, 7dd5ec0, 9b77d58

### DigiBoox Summary
Website interactiever gemaakt. Vier kleurthema's met duidelijke
schakelaar gebouwd, animaties en paginaovergangen toegevoegd en een
3D-landschap op de homepage geplaatst.

---

## 2026-07-13 — Merkidentiteit, menu en Nederlandse compliance

**Phase:** Brand & compliance

**Summary:** Rebuilt the hero as line-work, integrated the real GRØNN
brandmark and full theme-aware lockup in header and favicon, added a
large batch of Framer-style micro-interactions, fixed the unreachable
menu close button with a morphing hamburger and curtain animation, and
made the site legally compliant for a Dutch business (company details,
privacy statement, draft terms, cookie notice).

**Detailed activities:**
- Hero redrawn as line-work; observation pins kept inside frame
- Real brandmark asset cropped and integrated (logo + favicon)
- Motion batch: reveals, counters, tilt, arrow-swap, parallax
- Menu: hamburger→cross morph, full-screen curtain open/close
- Legal: business identity (KVK, BTW, IBAN, address) centralized and
  published, privacy page (AVG), draft terms page
- Humorous "vegan cookies" notice, auto-accepted on scroll
- Documented the awwwards experience plan

**Categories:** Website Development, UI / UX Design, Content, Copywriting, Documentation

**Files:** `src/components/layout/header.tsx`, `src/lib/business.ts`, `src/app/privacy/*`, `src/app/voorwaarden/*`, `src/components/cookie-notice.tsx`, `src/components/logo.tsx`, `docs/awwwards-plan.md`

**Commits:** b29bb69, 2edd53b, 008120c, 337285e, 5492c51, 4a16ede, e063352, 999d5b2, 7b8d14b, 82a0fd6

### DigiBoox Summary
Huisstijl en logo volledig doorgevoerd op de website. Menu herbouwd met
nette animaties. Wettelijk verplichte bedrijfsgegevens, privacyverklaring,
concept-voorwaarden en cookiemelding toegevoegd voor Nederlandse
compliance.

---

## 2026-07-14 — Accentkleur, mobiel volwaardig, laadscherm

**Phase:** Design refinement & mobile

**Summary:** Established brand orange (ember) as the single interaction
accent, set the light default theme, fixed the living-system diagram,
made www redirect to the apex domain, and brought the full experience to
mobile: lite-tier 3D terrain, pinned horizontal project gallery,
stacking service cards, brand-tile loading screen, and a slim ticker
replacing the rejected billboard marquee.

**Detailed activities:**
- Ember (#f95a08) as interaction accent throughout
- Paper as default theme; stamp recolored for light themes
- Fixed stale colors in the interactive diagram
- Canonical host redirect (www → apex)
- Mobile: 3D terrain lite tier, horizontal project gallery on touch
- Services as stacking cards on scroll
- Opening loader: white lockup on the forest photograph
- Explored and parked an editorial art-direction variant on a branch

**Categories:** Website Development, UI / UX Design, Performance Optimisation, Infrastructure

**Files:** `src/components/three/*`, `src/components/preloader.tsx`, `src/components/home/*`, `next.config.ts`

**Commits:** 9099f89, c419505, 4901204, a2447c8, 034e289, ee65c0f, 00b85d9, 8f28860, 267d378, 22c5702

### DigiBoox Summary
Website geschikt gemaakt voor mobiel gebruik (3D-achtergrond,
projectgalerij, dienstenkaarten). Accentkleur oranje doorgevoerd,
laadscherm met logo gebouwd en domeindoorverwijzing ingesteld.

---

## 2026-07-15 — Livegang via Vercel

**Phase:** Deployment

**Summary:** Refreshed the README to the current state and completed the
first git-triggered production deployment; site publicly live on Vercel.

**Categories:** Deployment, Documentation, Infrastructure

**Commits:** 63eb443

**Deployment:** Live on Vercel production.

### DigiBoox Summary
Website live gezet. Publicatieproces ingericht zodat elke wijziging
automatisch online komt, en documentatie bijgewerkt.

---

## 2026-07-16 — Contact, SEO en samenwerkingsbasis

**Phase:** Business readiness

**Summary:** Delivered the business bundle: working contact-form
delivery, complete SEO layer (sitemap, robots, Open Graph share card,
structured data), bilingual 404 page; hardened the form transport;
added project instructions so future development sessions inherit
context. GitHub repository created (private) and connected to Vercel.

**Detailed activities:**
- Contact form delivery pipeline
- SEO: sitemap.xml, robots.txt, OG card, ProfessionalService JSON-LD
- Custom bilingual 404 page
- FormSubmit transport headers
- CLAUDE.md project context; private GitHub repo + auto-deploys

**Categories:** Website Development, SEO, Infrastructure, Documentation

**Files:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`, `src/components/contact/intake-form.tsx`, `CLAUDE.md`

**Commits:** c222b5a, b3db0e0, 9311df2

### DigiBoox Summary
Contactformulier werkend gemaakt, vindbaarheid voor zoekmachines
ingericht (sitemap, deelafbeeldingen, bedrijfsgegevens voor Google) en
de code veilig ondergebracht in een privé-repository met automatische
publicatie.

---

## 2026-07-17 — Award-polish verkenning

**Phase:** Creative exploration

**Summary:** Explored two award-level polish directions on branches
(survey frame, pinned garden-through-time story, mist, contour shader
terrain, next/image, form success moment) and calmed the mobile terrain
rendering. Both exploration branches were later closed after review;
their best ideas are documented for reuse after performance work.

**Categories:** Website Development, UI / UX Design, Research, Planning

**Commits:** 5bcf3f3, fc4a3cc, 79df938 (branches later closed as PRs #1/#2)

### DigiBoox Summary
Twee ontwerpvarianten voor extra visuele kwaliteit uitgewerkt en
beoordeeld; beste ideeën gedocumenteerd voor later gebruik. Mobiele
3D-weergave verbeterd.

---

## 2026-07-18 — Mobiele navigatiedock

**Phase:** Mobile UX

**Summary:** Added the floating mobile navigation dock (Equilibrium
style) so phone visitors always have primary navigation at hand.

**Categories:** Website Development, UI / UX Design

**Files:** `src/components/layout/mobile-dock.tsx`

**Commits:** e8925a8, a42384f

### DigiBoox Summary
Mobiele navigatiebalk onderaan het scherm ontworpen en gebouwd voor
betere bediening op telefoons.

---

## 2026-07-19 — Domeinincident, operatiehandboek, kwaliteit en governance

**Phase:** Operations & governance

**Summary:** A full operations day. Resolved the domain outage caused by
the Hostinger→TransIP transfer (nameservers reset; DNS repaired, mail
restored, SPF/DKIM added). Wrote the durable operations manual. Shipped
a polish batch with an audit fix (contact fallback now includes the
visitor's email), the invisible-excellence pass (self-hosted images,
accessibility, cursor labels, typography), made Meadow the default theme
with the switcher in the menu. Adopted the formal governance model
(protected main, branch→PR→squash workflow, Phase 0 repository audit).
Under that model: diagnosed and fixed the contact form definitively
(browser-direct transport after proving the server relay impossible),
eliminated all lint violations properly, and verified the form
end-to-end with confirmed inbox delivery. Recorded everything in
handoff documentation (AGENTS.md, session log, verification record).

**Detailed activities:**
- DNS repair at TransIP/Cloudflare; mail (Google Workspace) restored;
  SPF and DKIM records added; www-CNAME typo fixed
- OPERATIONS.md: stack, DNS records, runbooks, checklists
- Contact fallback audit fix; a11y pass; self-hosted imagery
- Chapter color-block experiment shipped and deliberately reverted
- Meadow default theme; theme switcher into the menu
- Phase 0 read-only repository audit; PRs #1/#2 closed with salvage notes
- PR #3: form diagnostics · PR #4: browser-direct transport, dead relay
  removed · PR #5: lint compliance (hydration-safe patterns)
- End-to-end form verification with confirmed delivery to the studio
  inbox; evidence recorded in OPERATIONS.md
- AGENTS.md handoff manifest + docs/log session-log convention

**Categories:** Infrastructure, Bug Fixing, Accessibility, Testing, Documentation, Technical Architecture, Deployment

**Files:** `OPERATIONS.md`, `AGENTS.md`, `docs/log/*`, `docs/phase-0-audit.md`, `src/components/contact/intake-form.tsx`, `src/lib/use-hydrated.ts`, `src/components/language-provider.tsx`

**Commits:** 7d4bf47, 0940d36, a305f5b, e3fda2b, e948b95, 9b3e6f0, 7b0e430 (#3), 952b518 (#4), feba1ef (#5), ae3da43, 0d98193

**Deployment:** Multiple production deployments; site verified live after each.

### DigiBoox Summary
Storing aan domeinnaam en e-mail opgelost na verhuizing naar nieuwe
registrar; e-mailbeveiliging (SPF/DKIM) ingesteld. Operationeel handboek
geschreven. Contactformulier definitief werkend gemaakt en volledig
getest (testbericht in inbox bevestigd). Kwaliteitscontroles en vaste
werkwijze met controlestappen ingevoerd. Toegankelijkheid en afbeeldingen
verbeterd; standaardthema aangepast.

---

## 2026-07-19 (late evening, parallel session) — Merkcoördinatie, contactrail, Field Lab

**Phase:** Brand system & features

**Summary:** A parallel development session established cross-brand
coordination between GRØNN and Equilibrium (shared tech-stack manifest
and roadmap kept identical in both repos), shipped the floating contact
rail (WhatsApp + Instagram, mid-left, desktop), and delivered the first
"wow" slice: a Field Lab page (/lab) with interactive prototypes
(ecosystem simulation, growth field), the fifth theme "Nocturne", and
pin-to-home-screen support (web manifest, icons, install prompt).

**Detailed activities:**
- TECH-STACK.md and ROADMAP.md as shared coordination documents with
  the Equilibrium repo (three workstreams: contact rail, GRØNN
  Awwwards elevation, Equilibrium brand alignment)
- Floating contact rail: WhatsApp Business and Instagram, monochrome
  line icons with visible vertical labels, appears after the hero,
  steps aside at the footer, bilingual labels, reduced-motion safe
- Field Lab (/lab): ecosystem simulation + growth field prototypes
- Nocturne theme added to the theme cycle
- PWA: web manifest, home-screen icons, install prompt

**Categories:** Website Development, UI / UX Design, Technical Architecture, Planning, Documentation

**Files:** `ROADMAP.md`, `TECH-STACK.md`, `src/components/layout/contact-rail.tsx`, `src/app/lab/*`, `src/components/lab/*`, `src/app/manifest.ts`, `src/components/install-prompt.tsx`, `public/icons/*`

**Commits:** 19fa774, d3a2e0b, c800cf2 (#8), f3df70c (#7), aaa4f13, d6ad316, 1831be4 (#9)

**Deployment:** Merged to main and live on gronn.studio.

### DigiBoox Summary
Zwevende contactknoppen voor WhatsApp en Instagram ontworpen en live
gezet. Nieuwe experimenteerpagina met interactieve prototypes gebouwd,
extra kleurthema toegevoegd en de website installeerbaar gemaakt op de
telefoon. Gezamenlijke planning en technische afstemming tussen de twee
merkwebsites (GRØNN en Equilibrium) vastgelegd.

---

## 2026-07-20 — CMS-fundament (Sanity) en werkadministratie

**Phase:** CMS integration

**Summary:** Started the visual-editor track so text and images can be
edited without code: Sanity CMS foundation with an embedded editing
studio at /admin (Google sign-in), content schemas mirroring the
existing bilingual structure, a migration script for all current
content and photography, and separation of the public site chrome from
the editor. Set up this work log and its maintenance rules.

**Detailed activities:**
- Installed and configured Sanity; schemas for projects, journal,
  services, site copy (all EN/NL)
- Embedded Studio at /admin; public pages unaffected
- SiteShell separation so the editor doesn't inherit site animations
- One-off migration script for existing content + 7 photographs
- Environment-variable contract documented; no secrets in git
- Verified: typecheck/lint/build green; /admin renders; draft PR #10
- HOURS_MANIFEST.md + reconstructed this work log from full history

**Categories:** Website Development, Technical Architecture, Content, Documentation, Planning

**Files:** `sanity.config.ts`, `src/sanity/*`, `src/app/admin/*`, `src/components/layout/site-shell.tsx`, `scripts/migrate-to-sanity.ts`, `docs/worklog.md`, `HOURS_MANIFEST.md`

**Commits:** 9e5bb61 (draft PR #10)

### DigiBoox Summary
Gestart met een beheersysteem waarmee teksten en foto's van de website
zonder programmeren aangepast kunnen worden. Inlogomgeving opgezet,
inhoudsstructuur ingericht en migratie van bestaande inhoud voorbereid.
Werkadministratie (logboek) opgezet en de volledige projectgeschiedenis
gedocumenteerd.

---

## 2026-07-20 (vervolg) — Eigen visuele editor gebouwd en live

**Phase:** Editor & content platform

**Summary:** Built and shipped the GRØNN Editor — the studio's own
on-site visual editor, replacing the Sanity path after a cost/vendor
evaluation (Sanity stays dormant at /admin as a reactivatable backup).
The owner signs in with Google on gronn.studio/editor and edits text
(EN+NL together) and photos directly on the live pages; Publish makes
changes live in seconds with an automatic backup per publish. Zero
monthly cost. Verified end-to-end by the owner. Also corrected the
Nocturne theme twice on owner feedback (final: original dark ground,
neon mint accent replaced by soft brand green) and fixed a project
photo that had been silently missing on production.

**Detailed activities:**
- Content layer: all editorial content into one JSON document behind a
  single loader with Blob + committed fallback (PR #14)
- Google sign-in restricted to the studio account, JWT sessions,
  /editor gate (PR #15); owner set up the Google OAuth client
- The editor: click-to-edit text (bilingual popover), photo replacement
  with upload, publish/backup/exit toolbar, per-publish snapshots,
  instant cache revalidation; private-store support with an image
  proxy (PR #16)
- Sanity connected and content migrated earlier in the day, then kept
  dormant by owner decision — service can be revoked or reactivated
- Nocturne theme corrections (PRs #11, #12) and hedgerow photo fix
  (PR #13) — all live
- Operations manual updated with a phone-friendly editing guide

**Categories:** Website Development, Technical Architecture, UI / UX Design, Infrastructure, Testing, Documentation

**Files:** `src/editor/*`, `src/lib/content.ts`, `src/lib/auth.ts`, `src/app/editor/*`, `src/app/api/editor/*`, `src/app/api/img/*`, `content/site-content.json`, `OPERATIONS.md`, `AGENTS.md`

**Commits:** PRs #11–#16 (squash-merged)

**Deployment:** Live on gronn.studio; editing verified in production by
the owner ("works like a charm").

### DigiBoox Summary
Eigen visuele editor voor de website gebouwd en live gezet: inloggen
met Google, teksten in twee talen en foto's direct op de website
aanpassen en binnen seconden publiceren, met automatische back-ups.
Geen maandelijkse kosten. Donker kleurthema gecorrigeerd en een
ontbrekende projectfoto hersteld. Handleiding voor het bewerken
toegevoegd aan het operationeel handboek.

---

## 2026-07-20 (slot) — Hele website bewerkbaar + editor als product

**Phase:** Editor completion & productization

**Summary:** Extended the GRØNN Editor to cover the entire website:
every visible sentence and photograph on every page is now editable by
the owner, in both languages, live within seconds. Extracted the editor
into its own private repository ("the-editor") as a portable,
brand-agnostic kit for reuse on Equilibrium and future sites.

**Detailed activities:**
- /studio page fully editable (hero, about, founder, mission,
  philosophy, manifesto) — PR #18
- Whole-site pass — PR #19: all home chapters (observation incl. photo
  and annotation pins, living-system diagram texts, method stages,
  philosophy, principles, studio intro, ticker), full approach page,
  list-page heroes (projects/journal/services/contact), contact line,
  service-card photos
- Reusable PageHero edit support; older published documents protected
  by fallback merge; animation displays swap to plain rendering only
  in edit mode
- New repo github.com/gronnstudio/the-editor (private): generalized
  client kit (configurable locales, CSS-variable theming), server
  templates, 10-step integration guide with production pitfalls
- All verified on production after deploy

**Categories:** Website Development, Technical Architecture, UI / UX Design, Content, Documentation

**Files:** `src/components/home/*`, `src/app/approach/*`, `src/app/studio/*`, `src/app/contact/*`, `content/site-content.json`, `src/lib/content-types.ts`; repo `the-editor` (16 files)

**Commits:** PRs #18, #19 (gronn-studio); d87f032 (the-editor)

**Deployment:** Live on gronn.studio, production-verified.

### DigiBoox Summary
Beheersysteem afgerond: nu is elke tekst en elke foto op de hele
website door de eigenaar zelf aan te passen in beide talen, direct
online. Het systeem is daarnaast als herbruikbaar product in een eigen
repository gezet, zodat het ook voor andere websites ingezet kan
worden. Alles op de live website gecontroleerd.

---

## 2026-07-21 — Mobiele ervaring: liquid-glass dock, navigatie en projectcarrousel

*(Entry reconstructed from repository history — commits/PRs #21–#36 —
by a later session; the session that shipped this work did not append
its own log.)*

**Phase:** Mobile experience overhaul

**Summary:** Full rework of how the site feels on phones. The mobile
dock got a "liquid glass" treatment (frosted blur, Instagram-style
pill, pull-to-refresh) that was then extended across the page chrome;
mobile navigation was reworked into a slim logo-only header whose logo
comes and goes with scroll; the pinned project gallery — which clipped
on phones — was replaced by scroll-linked horizontally gliding cards
served to all phones. Nocturne became the default theme. Also added: a
password-gated "recording blur" that hides business credentials
(email/phone) during screen recordings, and a desktop back-to-top
button. Editor entry added to the curtain menu, footer and dock sheet
(#21, evening of 20 Jul).

**Detailed activities:**
- Editor made reachable from the site chrome: curtain menu, footer and
  mobile dock sheet entries (PR #21)
- Mobile dock rebuilt as a liquid-glass pill: blur film, frosted glass,
  tuck-away behavior and pull-to-refresh; a tilt sheen was tried and
  removed after evaluation (PRs #22–#24)
- Liquid-glass visual language extended to the rest of the page chrome
  (header, cookie notice, install prompt) (PR #25)
- Nocturne set as the site's default theme (PR #24)
- Mobile navigation iterations: header first hidden in favour of the
  dock, then restored as a slim logo-only strip whose logo appears and
  disappears with scroll direction; glass strip removed (PRs #26, #29,
  #31)
- Projects on phones: pinned horizontal gallery (which clipped)
  replaced by a grid, then by horizontally swipeable cards, then by a
  scroll-linked card glide, finally served to all phones; dock cleared
  beneath the gallery (PRs #27, #28, #30, #32, #33)
- Privacy toggle: password-gated recording blur covering business
  credentials on contact, footer, privacy and terms pages; boot timing
  fixed so the blur is active from first paint and the last two exposed
  email spots covered (PRs #34, #36)
- Desktop back-to-top button (PR #35)

**Categories:** Website Development, UI / UX Design, Bug Fixing

**Files:** `src/components/layout/mobile-dock.tsx`, `src/components/layout/header.tsx`, `src/components/home/selected-projects.tsx`, `src/components/pull-to-refresh.tsx`, `src/components/privacy-toggle.tsx`, `src/components/back-to-top.tsx`, `src/components/motion/tilt-indicator.tsx`, `src/lib/use-device-tilt.ts`, `src/app/globals.css`, `src/components/layout/footer.tsx`

**Commits:** PRs #21–#36 (squash-merged, 942020e…d2cc1a4)

**Deployment:** Live on gronn.studio.

### DigiBoox Summary
Website geschikt gemaakt voor optimaal gebruik op de telefoon: nieuwe
navigatiebalk onderin met matglas-effect en ververs-gebaar, slanker
logo-menu bovenin, en projectkaarten die soepel met het scrollen
meebewegen. Donker kleurthema als standaard ingesteld. Daarnaast een
beveiligde weergavefunctie toegevoegd die bedrijfsgegevens (e-mail,
telefoon) onleesbaar maakt tijdens schermopnames, en een
terug-naar-boven-knop voor desktop. Alles live op de website gezet.

---

## 2026-07-27 — Prestaties gemeten en verbeterd, Nederlandse site vindbaar

**Phase:** Performance & internationalisation

**Summary:** Measured the site's real performance for the first time,
fixed the two largest causes, and rebuilt the language system so the
Dutch site exists as far as search engines are concerned. Also produced
a business roadmap for the website and parked the remaining ideas as
documented concepts.

**Detailed activities:**
- Reproducible Lighthouse protocol committed; production baseline
  recorded for five pages on mobile and desktop
- Image pipeline: all photography through next/image with AVIF and
  per-breakpoint sizing; brand logos and the loading screen's images
  resized (heaviest photo 501 KB → 97 KB)
- 3D landscape layer now builds only after the page has loaded and is
  near the viewport, and stops rendering when off screen
- Fixed a code-quality error on the main branch that blocked checks
- Language architecture rebuilt: Dutch pages now have their own
  addresses (/nl/...), the language is known before any JavaScript runs,
  the switch keeps you on the same page, sitemap and language tags
  declare both languages (63 Dutch URLs added)
- Verification scripts committed that drive a real browser, after two
  measurement traps were found and documented
- Business roadmap (discovery, trust, conversion, operations) and a
  concepts document for parked work

**Categories:** Performance Optimisation, SEO, Technical Architecture, Testing, Documentation, Bug Fixing, Planning

**Files:** `docs/perf/*`, `docs/roadmap-business.md`, `docs/concepts.md`, `scripts/lighthouse-run.sh`, `scripts/check-terrain-mount.mjs`, `scripts/check-locales.mjs`, `src/components/photo.tsx`, `src/lib/use-deferred-visible.ts`, `src/lib/locale.ts`, `src/middleware.ts`, `src/app/[locale]/*`

**Commits:** PRs #38, #39, #40, #41, #42

**Deployment:** Live on gronn.studio; production verified after each
merge (both languages reachable, canonical redirects in place).

### DigiBoox Summary
Snelheid van de website voor het eerst echt gemeten en flink verbeterd:
foto's worden nu veel kleiner geleverd en de 3D-achtergrond laadt pas na
de inhoud. Op desktop haalt de site nu de streefwaarde op vier van de
vijf pagina's; op mobiel ging de score ongeveer twintig punten omhoog.
Daarnaast de taalstructuur herbouwd: de Nederlandse pagina's hebben nu
eigen webadressen en zijn daardoor vindbaar in Google — voorheen bestond
de Nederlandse site niet voor zoekmachines. Verder een plan opgesteld
voor vindbaarheid, vertrouwen en klantaanvragen, en de resterende ideeën
gedocumenteerd.

---

## 2026-07-27 — Toegankelijkheidsbasis (roadmap B4)

**Phase:** Awwwards elevation — accessibility floor

**Summary:** Delivered the B4 usability floor from the roadmap after a
full accessibility audit of the site. Both overlay menus (the desktop
curtain menu and the phone dock sheet) now behave as proper dialogs for
keyboard and screen-reader users: focus stays inside while open, Escape
closes them, and focus returns to the button that opened them. The
"skip to content" link now works in all browsers and both languages,
the keyboard focus ring meets contrast requirements on every theme, and
the last animations without a reduced-motion fallback got one.

**Detailed activities:**
- New shared focus-trap hook (`use-focus-trap`); applied to the curtain
  menu and the mobile dock sheet, with focus restore and Escape close
- Header bar's own nav/CTA made inert while the curtain menu is open,
  ending the duplicate tab sequence above the dialog; dialog wiring
  (`aria-controls`, ids) on both menu buttons
- Dock sheet given proper dialog semantics (`role="dialog"`,
  `aria-modal`, bilingual label) — it previously announced nothing
- Skip link moved into the site shell: bilingual, no longer dangling on
  the owner tools; `<main>` made programmatically focusable (Safari
  fix); 404 page given its own `<main>` landmark
- Theme-aware focus ring: burnt ember on the two light palettes (the
  signal ember failed the 3:1 non-text contrast there), signal ember on
  the three dark palettes; suppressed outlines restored on the contact
  form and record-blur password inputs
- Reduced-motion fallbacks added to the last four gaps: cookie notice,
  hero entrance staggers, living-system pulse (the site's only infinite
  loop that ignored the preference), dock tuck snap
- Aria pass: bilingual labels for the language switch, project filter
  and external links ("opens in new tab"); `aria-pressed` on filter
  buttons with a live result count; `aria-current` on the intake-form
  step indicator; placeholder/step-label contrast raised
- Full audit documented; remaining owner-visible contrast decisions
  (ember/green as text on light themes) and 44px touch targets deferred
  to B5 with notes in the PR and roadmap

**Categories:** Accessibility, Website Development, UI / UX Design, Testing

**Files:** `src/lib/use-focus-trap.ts`, `src/components/layout/{header,mobile-dock,site-shell,footer}.tsx`, `src/app/{layout,not-found}.tsx`, `src/app/globals.css`, `src/components/{language-toggle,cookie-notice,privacy-toggle}.tsx`, `src/components/home/{hero,living-system}.tsx`, `src/components/projects/project-grid.tsx`, `src/components/contact/intake-form.tsx`, `ROADMAP.md`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Website toegankelijk gemaakt volgens de wettelijke richtlijnen
(WCAG): menu's volledig bedienbaar met het toetsenbord en bruikbaar
met schermlezers, "direct naar inhoud"-link gerepareerd en tweetalig
gemaakt, zichtbaarheid van de toetsenbordfocus op alle kleurthema's op
norm gebracht, en animaties uitgeschakeld voor bezoekers die verminderde
beweging hebben ingesteld. Volledige toegankelijkheidscontrole van de
site uitgevoerd en gedocumenteerd.

---

## 2026-07-27 (vervolg) — PageSpeed-bevindingen: contrast naar 100, laadtijd op mobiel

**Phase:** Performance & accessibility (owner PageSpeed report)

**Summary:** The owner ran Google PageSpeed on the live site (mobile:
performance 66, accessibility 97, LCP 5.7 s). Both findings addressed.
The contrast failure — brand green as small text fails on the dark
default theme — fixed site-wide by moving static small green text to the
per-theme accent token: accessibility now measures 100. The slow
"largest contentful paint" traced to three boot-time behaviors: the
route-transition curtain covered the whole page in solid green until
React finished (also hiding the opening veil entirely on slow phones),
the opening veil itself only appeared after hydration, and the cookie
banner appeared seconds late and became the measured element. All three
now paint from the initial HTML with CSS-driven animation: measured
LCP on a throttled phone went from ~4.6 s to ~1.1 s (lab score on this
machine 57→71; production expected higher). Bonus: the designed opening
veil is now actually visible on slow phones — visitors used to get a
blank green screen instead.

**Detailed activities:**
- Section labels and all static small green text moved from raw brand
  green (3.4:1 on Nocturne) to the semantic accent token (4.6–16.9:1 on
  all five themes, verified programmatically); new `--ember-text` token
  deepens the ember index digits on light themes
- Route curtain now plays only on in-site navigations, never on first
  load (it server-rendered as a full green cover until hydration)
- Opening veil server-rendered and fully CSS-animated: photo preloaded
  with high priority, lockup visible from the first frame, lift and
  cleanup timed in CSS; once-per-session decided pre-paint by an inline
  script (same pattern as theme/recording-blur boot)
- Cookie banner server-rendered with a CSS-timed entrance instead of a
  post-hydration timer; hidden pre-paint for visitors who dismissed it
- Hero headline/subtitle/CTA entrances converted from framer-motion to
  CSS so the text paints before hydration (verified visible with
  JavaScript disabled)
- Full regression suite re-run: dialogs, focus traps, skip link, themes,
  reduced motion — all passing; Lighthouse accessibility 100, contrast
  audit zero failures
- Sitemap verified (42 URLs, both languages, robots.txt pointing at it)
  ready for Search Console submission (owner action)

**Categories:** Performance Optimisation, Accessibility, Website Development, Testing, SEO

**Files:** `src/app/template.tsx`, `src/components/preloader.tsx`, `src/components/cookie-notice.tsx`, `src/components/home/hero.tsx`, `src/components/section-label.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, small green-text sweep across `src/components/*`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Naar aanleiding van de PageSpeed-meting van de eigenaar: het
kleurcontrast van kleine groene teksten op alle kleurthema's op norm
gebracht (toegankelijkheidsscore nu 100) en de laadtijd op mobiel sterk
verbeterd door het opstartgedrag van de website te herbouwen: het
openingsscherm, het cookiebericht en de paginateksten verschijnen nu
direct bij het laden in plaats van pas nadat alle programmatuur is
opgestart. Gemeten laadtijd van het grootste zichtbare element op een
langzame telefoon van ruim 4,5 seconde naar ruim 1 seconde. De sitemap
is gecontroleerd en klaar om bij Google Search Console ingediend te
worden zodat de website in Google vindbaar wordt.

---

## 2026-07-30 — Tech Stack page: the build made explorable

**Phase:** Content & transparency (sister-site parity)

**Summary:** New public page at `/stack` (`/nl/stack`), modelled on the
sister site Equilibrium's "the engine" section but built as something you
explore rather than read. Nineteen technologies are grouped into four
layers (frontend, hosting, content, tooling); selecting a layer narrows
the grid, opening a technology reveals why it was chosen and what it
costs, and a third filter crosses both axes by asking which of these
Equilibrium also runs. Version numbers are read out of `package.json`
when the site is built, so the page cannot claim a version the
repository does not install. Every sentence on the page is editable
through the GRØNN Editor; the structure and the versions are not.

**Detailed activities:**
- `src/lib/stack.ts`: the machine-readable stack — four layers, nineteen
  technologies, their npm packages, and the Equilibrium cross-reference
  taken from `TECH-STACK.md`; versions resolved from `package.json` at
  build time
- New route `src/app/[locale]/stack/` — server shell with per-language
  metadata, client component carrying the interaction
- Interaction: layer cross-section (buttons with written labels and a
  live count), per-technology disclosure with "why this" / "what it
  costs" / "next to Equilibrium", an "also runs on Equilibrium" filter,
  open-all / close-all, an empty state with a clear-filters button and a
  polite live region announcing how many are shown
- Accessibility: every control is a native button with a visible word,
  `aria-pressed` / `aria-expanded` / `aria-controls` throughout, keyboard
  focus and activation verified in a real browser, and a still version of
  every animation under reduced motion
- Content: new `stack` section in the content document (hero, layer
  summaries, and role/why/cost for all nineteen entries, EN + NL),
  regenerated `content/site-content.json`
- Linked from the footer navigation and added to both language sitemaps

**Categories:** Website Development, Content, Accessibility, SEO

**Files:** `src/lib/stack.ts`, `src/app/[locale]/stack/page.tsx`, `src/app/[locale]/stack/stack-content.tsx`, `src/lib/content-types.ts`, `scripts/export-content.ts`, `content/site-content.json`, `src/components/layout/footer.tsx`, `src/app/sitemap.ts`

**Commits:** see PR (branch `feat/tech-stack-page`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Nieuwe pagina "Techniek" toegevoegd aan de website, in twee talen
(`/stack` en `/nl/stack`). De pagina laat zien waar de website van
gemaakt is: negentien onderdelen, verdeeld over vier lagen, waarbij de
bezoeker een laag kan kiezen en per onderdeel kan openklappen waarom het
gekozen is en wat het kost. De versienummers worden automatisch uit het
project zelf gelezen, zodat de pagina nooit iets kan beweren dat niet
klopt. Alle teksten op de pagina zijn door de eigenaar zelf aan te passen
via de eigen editor. De pagina is opgenomen in het menu onderaan de site
en in de sitemap voor Google.

---

## 2026-07-30 — Bewegingsvocabulaire, tikdoelen, 404 en Awwwards-strategie

**Phase:** Craft pass (roadmap B2/B5/B6)

**Summary:** Finished three of the remaining Awwwards-elevation items in
one pass. The site's animation curves were re-typed by hand in fifteen
different components; they now come from one module, which also exposed
that the mobile dock was animating on the sister project's easing curve.
Every interactive control was audited against the 44-pixel touch-target
standard and the ones that failed were widened by their *press area*
only, so nothing on screen got visually heavier. The 404 page was
rebuilt from a plain oversized numeral into a survey-sheet fragment.
Separately, researched how Awwwards Site of the Day is actually awarded
and wrote down an honest assessment of where the site stands against
that bar.

**Detailed activities:**
- New `src/lib/motion.ts` holds the two house easing curves and the
  cursor's spoken vocabulary; nine hand-typed curve definitions across
  eight files now import from it, and the file records that the CSS
  equivalents in `globals.css` must be changed in the same commit
- Found and corrected three animations running on Equilibrium's easing
  curve rather than this site's (mobile dock sheet, dock pill,
  pull-to-refresh), plus a duplicated cursor label list that had already
  begun to diverge between two components
- Homepage section numbering rebuilt as one continuous survey sequence
  01–10; it contained two duplicate numbers (two sections numbered 03,
  two numbered 06) and one unnumbered section in the middle of the run
- Touch-target audit across the whole site: a new `tap-target` utility
  gives any control a 44-pixel press area without changing the size it
  is drawn at, applied to fourteen files (dock sheet pills, language and
  theme switches, contact rail, header menu, footer links, project
  filters, cookie and install prompts, case-study back links)
- Safe-area insets so fixed elements clear the iPhone home indicator and
  the Dynamic Island; sheet height switched to the dynamic viewport unit
  so it no longer runs under mobile Safari's address bar
- Touch equivalents added wherever an ember hover answer was the only
  feedback — on a phone `:hover` never fires, so those controls were
  silent to a thumb
- 404 rebuilt as a "lost field marker": contour lines, a surveyor's
  traverse walked in from the sheet edge, an ember station mark where
  the route stops, mono coordinates for Stein. It now speaks one
  language instead of mashing English and Dutch into one button label
- Console signature for visitors who open the developer tools
- Fixed a defect introduced during the touch-target sweep: the press
  expander and the link underline animation were competing for the same
  pseudo-element, which would have inflated a 1-pixel hover underline
  into a 44-pixel block
- Researched Awwwards judging and wrote `docs/sotd-strategy.md`

**Categories:** Website Development, UI / UX Design, Accessibility, Technical Architecture, Documentation

**Files:** `src/lib/motion.ts`, `src/app/globals.css`, `src/app/not-found.tsx`, `src/components/lost-marker.tsx`, `src/components/console-signature.tsx`, `src/components/home/*`, `src/components/layout/*`, `src/components/motion/*`, `docs/sotd-strategy.md`, `ROADMAP.md`

**Commits:** see PR (branch `claude/resume-work-sbu8hz`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Afwerkingsronde op de website. De bewegingssnelheden van alle animaties
zijn samengebracht op één plek, waarbij bleek dat een deel van de
mobiele navigatie op de verkeerde curve liep. Alle knoppen en links zijn
gecontroleerd op de norm voor bedienbaarheid met de vinger (44 pixels)
en waar nodig vergroot — alleen het aanraakgebied, het zichtbare ontwerp
is niet zwaarder geworden. Vaste elementen houden nu afstand tot de
onderrand en de camera-uitsparing van moderne telefoons. De
foutpagina (404) is opnieuw ontworpen als een fragment van een
meetblad met hoogtelijnen en een meetpunt, en spreekt nu één taal in
plaats van Engels en Nederlands door elkaar. De hoofdstuknummering op de
homepage bevatte dubbele nummers en is rechtgetrokken. Tot slot is
uitgezocht hoe de Awwwards-onderscheiding daadwerkelijk wordt toegekend
en is eerlijk op papier gezet wat er nog nodig is — vooral echte
projectfoto's.

---

## 2026-07-30 (vervolg) — Contrastcontrole en ember-correctie (twee thema's afgekeurd)

**Phase:** Design system

> **Correction, appended after owner review.** This entry originally
> recorded two new themes — Marl (light) and Peat (dark) — as delivered.
> The owner reviewed them and **rejected both outright**; they have been
> removed from the codebase. The contrast auditor and the ember fix
> described below were built in the same pass and **were kept** — they
> are live and correct. The entry is left in place rather than deleted so
> the record stays honest; see "What was rejected" at the end. The
> replacement palettes are in the next entry.

**Summary:** Built a permanent contrast auditor to prove every palette
meets the accessibility standard. The auditor immediately found a real
defect that had been live for some time: the white label on the primary
call-to-action button failed the readability standard while the mouse
was over it. Google's accessibility score had reported 100 because it
only ever measures buttons at rest, never while hovered. In the same pass
two new themes were designed and built, and subsequently rejected by the
owner.

**Detailed activities (kept — live in the codebase):**
- New `scripts/check-contrast.mjs` reads the real colour definitions out
  of the stylesheet — not a copy — and checks every palette per run:
  body text, secondary text, section labels, the ember index digits,
  keyboard focus rings and the 3D terrain lines, each against the
  standard that applies to it. Exits non-zero on any failure, so it can
  be wired into the build later
- Audited the five existing palettes: all passing
- Found and fixed: white text on Signal Ember measured 2.99:1 where 4.5:1
  is required, affecting every primary button's hover state, the centre
  slot of the mobile dock, the tilt indicator and the editor toolbar.
  A deepened ember (`--gronn-ember-strong`, #c74100) is now used wherever
  ember is a filled surface under white text; Signal Ember itself is
  unchanged at #f95a08 and still used for every line, dot, marker, border
  and tint
- Established why this had been missed: Google Lighthouse only measures
  the *resting* state of a control, so a colour that exists only under
  `:hover` is never scored. The site held an accessibility score of 100
  with this failing

**What was rejected (removed from the codebase):**
- Theme "Marl" (Mergel), a light limestone ground, and theme "Peat"
  (Veen), a dark brown-black — designed and built as a matched warm pair,
  then rejected outright by the owner on review. Both token blocks,
  switcher entries and provider names have been removed
- Reasons recorded so they are not repeated: a mid-value tinted light
  ground reads **muddy** whatever the contrast maths says (Marl), and a
  brown-black dark ground reads **sepia** rather than soil (Peat).
  Passing the audit is not the same as looking right — which is exactly
  why the replacement set still needs the owner's eyes on it
- Marl's own deepened ember variant went with it

**Categories:** UI / UX Design, Accessibility, Website Development, Technical Architecture

**Files:** `scripts/check-contrast.mjs`, `src/app/globals.css`, `src/components/providers.tsx`, `src/components/theme-toggle.tsx`, `src/components/cta-link.tsx`, `src/components/layout/*`, `src/components/contact/intake-form.tsx`, `src/components/motion/tilt-indicator.tsx`, `src/editor/*`, `CLAUDE.md`

**Commits:** see PR #48 (branch `claude/resume-work-sbu8hz`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Een controleprogramma gebouwd dat automatisch nakijkt of alle
tekstkleuren op alle kleurthema's van de website leesbaar genoeg zijn
volgens de toegankelijkheidsnorm. Het programma leest de echte
kleurdefinities uit de website zelf, zodat de controle niet kan
verouderen. Het vond meteen een echt probleem: het witte opschrift op de
oranje actieknop was niet leesbaar genoeg zodra de muis erop stond — op
elke primaire knop, in de mobiele navigatiebalk en in de tekstbewerker.
De Google-toegankelijkheidsscore had dit gemist omdat die knoppen alleen
in rusttoestand meet, nooit tijdens aanwijzen. Opgelost met een iets
dieper oranje, uitsluitend op gevulde knoppen; de signaalkleur zelf is
ongewijzigd. In dezelfde ronde zijn twee nieuwe kleurthema's ontworpen
("Mergel" en "Veen"), die de eigenaar bij beoordeling heeft afgekeurd;
die zijn weer uit de website verwijderd. De reden is vastgelegd zodat
dezelfde fout niet terugkeert.

---

## 2026-07-30 (vervolg 2) — "The Hours": vijf nieuwe kleurthema's en een tweede themaschakelaar

**Phase:** Design system

**Summary:** Replaced the two rejected themes with a set of five,
designed this time from research into how dark and light mode are
actually built in practice rather than from a concept. The set is called
The Hours and runs one day from dawn to dark: First Light, Glasshouse,
Golden Hour, Blue Hour, Moonlight. Because the site already had five
palettes and ten in one cycle button would be unusable, the new set got
its own separately labeled switcher next to the existing one. All ten
palettes now pass the contrast audit: 122 colour pairs, none failing.
The palettes are verified by measurement and by build only — they have
not been looked at by a human, which is precisely how the previous two
got as far as a commit.

**Detailed activities:**
- Researched established dark/light-mode practice before drawing
  anything, and wrote the findings into the palettes as a brief: never a
  pure-black ground (Material's floor is #121212 — black under bright
  content raises contrast to the point of eye strain and smears for
  readers with astigmatism); in dark mode elevation is expressed as
  *light*, so the surface colour sits lighter than the background instead
  of relying on a shadow; accents must be desaturated on dark grounds
  because a saturated colour that works on white visually vibrates
  against dark; and light grounds must stay high-value and low-chroma,
  since a mid-value tinted ground reads muddy no matter what the contrast
  maths says — the exact failure of the rejected Marl
- **First Light** (#f4f5f8): cool pale, the hour before the sun clears
  the hedge
- **Glasshouse** (#f2f7f3): noon under glass, the brightest ground in the
  system, with just enough green to read as light through leaves
- **Golden Hour** (#f8efdc): warm cream, deliberately not a true amber —
  ember has to stay legible as the interaction colour and cannot do that
  on a ground of its own hue
- **Blue Hour** (#10152e): deep indigo dusk, the twenty minutes after
  sunset; accent stays the brand's soft green so the structure still
  reads as GRØNN
- **Moonlight** (#121513): neutral graphite at Material's floor with a
  trace of green — the quiet near-neutral dark the site never had, since
  Forest is green, Night is absolute black and Nocturne is blue
- All five carry their own 3D terrain colours, so the hero landscape
  re-tints with each rather than falling back
- Second theme switcher: the five new palettes sit behind their own
  labeled control, so the original five keep theirs. The theme system can
  only hold one active palette at a time, so each switcher names its set
  and shows a dash when the active palette belongs to the other one —
  without that both controls would look switched on and a visitor could
  not tell which palette they were seeing. Clicking the inactive one
  adopts the first palette of its set
- Palette catalog extracted to `src/lib/themes.ts`; the theme provider now
  derives its list from that catalog, so adding a palette to a set can no
  longer leave the provider out of step
- Contrast audit re-run over all ten palettes: 122 pairs checked, zero
  failing
- Recorded what a new palette needs: the token block in the stylesheet,
  the dark-variant list (dark palettes only — omitting it silently
  disables every dark-mode style rule for that theme), and the labeled
  catalog entry
- Roadmap item B1 (scroll-choreographed terrain hero) deliberately left
  for a later session: it would touch the deferred 3D loading that
  brought mobile load time down from ~4.6 s to ~1.1 s, and a hero
  animation should not ship without being seen
- Session log written for the owner's other Claude account:
  `docs/log/2026-07-30-themes-and-craft-pass.md`

**Not done — open for the next session:**
- The five new palettes were checked visually by screenshot at desktop
  width (1280×900, English, reduced motion, homepage above the fold) and
  all five render correctly, with both switchers showing the right
  active/inactive state. That is a smoke test, not a review: **no phone,
  no second page, no Dutch, and no owner sign-off**. Warm and
  atmospheric grounds are exactly where the numbers pass and the result
  can still look wrong, so owner review on the preview URL — ideally on
  a phone — is still required before these are treated as settled
- Real photography remains the single blocking item for an Awwwards
  submission (owner action)

**Categories:** UI / UX Design, Research, Accessibility, Website Development, Technical Architecture, Documentation

**Files:** `src/app/globals.css`, `src/lib/themes.ts`, `src/components/theme-toggle.tsx`, `src/components/providers.tsx`, `src/components/layout/{header,mobile-dock}.tsx`, `scripts/check-contrast.mjs`, `docs/log/2026-07-30-themes-and-craft-pass.md`, `ROADMAP.md`, `CLAUDE.md`

**Commits:** see PR #48 (branch `claude/resume-work-sbu8hz`, secondary Claude account)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De twee afgekeurde kleurthema's zijn vervangen door een nieuwe reeks van
vijf, ditmaal ontworpen op basis van onderzoek naar hoe licht- en
donkerweergave in de praktijk gemaakt wordt in plaats van vanuit een
idee. De reeks heet "The Hours" en loopt als één dag van ochtend naar
nacht: Ochtendgloren, Kas, Gouden Uur, Blauwe Uur en Maanlicht. De
onderzoeksregels zijn direct in de kleuren verwerkt: nooit een volledig
zwarte achtergrond (dat vermoeit de ogen en loopt uit voor mensen met
astigmatisme), in donkere weergave wordt diepte met licht aangegeven in
plaats van met schaduw, accentkleuren moeten op donkere achtergrond
gedempter zijn, en lichte achtergronden moeten licht en weinig verzadigd
blijven — precies waar het afgekeurde "Mergel" op stukliep. Omdat tien
thema's in één knop onbruikbaar zou zijn, hebben de vijf nieuwe een
eigen, apart benoemde themaschakelaar gekregen naast de bestaande; de
twee schakelaars laten duidelijk zien welke van de twee reeksen actief
is. Alle tien de thema's zijn door de automatische leesbaarheidscontrole
gehaald: 122 kleurcombinaties, geen enkele afkeuring. Belangrijk voor de
eigenaar: de kleuren zijn wel doorgerekend en gebouwd, maar nog niet met
het oog beoordeeld — een visuele controle op de testomgeving (bij
voorkeur op de telefoon) is nog nodig voordat ze definitief zijn.

---

## 2026-07-30 (vervolg 3) — Thema volgt het tijdstip van de dag

**Phase:** Design system

**Summary:** Golden Hour and Blue Hour became the site's two default
palettes, and the site now chooses between them by the visitor's own
clock: warm ground during the day, deep indigo after dark. The visitor
can always overrule it, and that choice then sticks. The remaining eight
palettes moved to a separate "Concept" switcher.

**Detailed activities:**
- Default control rebuilt as one button with three states, cycling
  Auto → Golden Hour → Blue Hour. On Auto it names the palette the clock
  landed on ("AUTO · GOLDEN HOUR"), so a visitor can see both that the
  site is deciding and what it decided
- Day runs 07:00–19:00 on the visitor's local clock. Deliberately not
  real sunrise times: those need the visitor's latitude, and asking for
  location permission to pick a colour is out of proportion. The two
  boundaries live in one place and the pre-paint script is generated
  from them, so they cannot drift apart
- The palette is decided *before the page paints*, from the same stored
  flag, so a visitor on auto never sees a flash of the wrong ground
- A page left open across the boundary follows it: the palette
  re-evaluates on a slow timer and whenever the tab is brought back
- Any manual pick — from either switcher — stops the clock driving,
  permanently, until Auto is chosen again. A site that quietly reverted
  your choice at 19:00 would be broken
- The eight remaining palettes moved to a separate "Concept" switcher
- Fixed a defect found by driving a real browser against a pinned clock:
  a returning visitor's saved override was being overwritten on load,
  because during startup the page briefly believes it is on Auto. Ten
  cases now verified — every clock boundary, and overrides held at hours
  that contradict them

- Owner feedback rondes op de dock zelf: ruimte tussen de stadions
  (6px), de startknop door constructie altijd exact in het midden van
  de pil (twee gelijke vleugels), en terug-naar-boven als losse
  zwevende bel boven de rechterhoek zodat hij de symmetrie nooit
  verstoort

**Categories:** UI / UX Design, Website Development, Technical Architecture, Testing

**Files:** `src/lib/themes.ts`, `src/components/theme-mode-provider.tsx`, `src/components/default-theme-toggle.tsx`, `src/components/theme-toggle.tsx`, `src/components/providers.tsx`, `src/app/layout.tsx`, `src/components/layout/*`, `CLAUDE.md`

**Commits:** see PR #48 (branch `claude/resume-work-sbu8hz`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De website kiest nu zelf een kleurthema op basis van het tijdstip van de
bezoeker: overdag het warme "Gouden Uur", 's avonds en 's nachts het
diepe "Blauwe Uur". De bezoeker kan dit altijd zelf overrulen; die keuze
blijft dan staan en wordt niet stilletjes teruggedraaid. De schakelaar
toont in één oogopslag of de website zelf kiest en welk thema dat
oplevert. De overige acht kleurthema's zijn verhuisd naar een aparte
"Concept"-schakelaar. Het thema wordt bepaald vóórdat de pagina in beeld
komt, zodat er nooit kort een verkeerde kleur zichtbaar is. Getest door
een echte browser aan te sturen met een vastgezette klok; daarbij kwam
een fout aan het licht waarbij de eigen keuze van een terugkerende
bezoeker werd overschreven — opgelost en opnieuw getest.

---

## 2026-07-31 — Groene waas van foto's vervangen door een glasscherm

**Phase:** Design system

**Summary:** Removed the heavy green film that sat over every photograph on
the site and replaced it with a subtle glass screen. The photography now
shows in its own colours — blue sky reads as blue, foliage as green —
instead of through a dark green cast. The treatment is now defined in one
place instead of being copied by hand into six files, where it had already
drifted apart.

**Detailed activities:**
- New `photo-glass` treatment in the stylesheet: a single layer reading as
  light falling across a pane of glass — a bright edge at the top, clear
  through the middle, a slight settle at the foot, plus the same fine rim
  the site's other glass surfaces use
- The photograph itself deliberately stays sharp. A true frosted-glass blur
  was considered and rejected: it would not have worked inside the existing
  image reveal animation, it flickers on the tilting project cards, and
  blurring a photo while scrolling is the most expensive thing a browser can
  be asked to do — on exactly the pages that are still furthest from their
  speed targets. The photography is also the product; hiding it behind frost
  would work against the site's purpose
- Replaced the old film at all six places it appeared. Two of them had
  quietly diverged: one page used a weaker film than the rest, and the
  featured card in the menu had lost half the effect entirely. Both are now
  identical because there is only one definition
- The five annotation markers on the observation photo were the one element
  whose readability depended on the photo being darkened — they sat bare on
  the image. Each now carries its own fine ink ring, so they read on any
  photograph, including the real project photos still to come. They were not
  made larger
- Documentation corrected: several code comments and the project guide still
  described the green wash as current, and one also still claimed the images
  came from an external placeholder service, which stopped being true earlier

**Categories:** UI / UX Design, Website Development, Documentation

**Files:** `src/app/globals.css`, `src/components/project-card.tsx`, `src/components/home/featured-project.tsx`, `src/components/home/observation.tsx`, `src/components/home/services-overview.tsx`, `src/app/[locale]/projects/[slug]/case-study.tsx`, `src/components/layout/header.tsx`, `src/components/photo.tsx`, `src/editor/editable-image.tsx`, `src/lib/data/projects.ts`, `CLAUDE.md`

**Commits:** see PR (branch `claude/resume-work-sbu8hz`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De groene sluier die over alle foto's op de website lag is verwijderd en
vervangen door een subtiel glaseffect. De foto's laten nu hun eigen kleuren
zien — blauwe lucht is weer blauw, groen is weer groen — in plaats van door
een donkergroene waas. Het effect is nu op één plek vastgelegd in plaats van
handmatig gekopieerd naar zes bestanden; op twee plekken was het daardoor al
uit de pas gaan lopen, wat meteen is rechtgezet. De foto zelf blijft scherp:
een echt matglas-effect is overwogen maar afgewezen, omdat het de website op
mobiel merkbaar trager zou maken en omdat de foto's juist het werk zijn dat
getoond moet worden. De vijf meetpunten op de observatiefoto leunden voor hun
leesbaarheid op de donkere waas en hebben nu een eigen fijne rand gekregen,
zodat ze straks ook op de echte projectfoto's leesbaar blijven.

---

## 2026-08-01 — Systeemdiagram draait nu vanzelf

**Phase:** Experience layer

**Summary:** The interactive systems diagram on the homepage sat still
until a visitor clicked something, so most people never discovered that it
was interactive at all. It now walks itself around the ring on its own,
element by element, and hands control over the moment the visitor wants it.

**Detailed activities:**
- The diagram advances to the next element every few seconds, so the
  landscape reads as a living system rather than a menu waiting to be used
- It yields completely to the visitor: hovering or tabbing into it holds
  it still while it is being read, and deliberately choosing an element
  stops the rotation for good. Something that moves under your hand a
  moment after you take control is the single reason rotating panels are
  disliked, so that does not happen here
- On a phone, holding still on hover had to be restricted to real mouse
  pointers: a touch reports itself as "entering" the diagram but never
  reports leaving it, so the first tap froze the rotation for good. Found
  by testing on an emulated phone rather than assuming the desktop
  behaviour carried over
- Respects the visitor's reduced-motion setting: with that on, the diagram
  never rotates and behaves exactly as before
- No timer runs while the section is off screen, so a page open on another
  part of the site costs nothing
- Verified by driving a real browser through all four behaviours: it
  advances on its own, holds under the cursor, stops permanently after a
  choice, and stays still under reduced motion

**Categories:** UI / UX Design, Website Development, Accessibility, Testing

**Files:** `src/components/home/living-system.tsx`

**Commits:** see PR (branch `claude/resume-work-sbu8hz`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Het systeemdiagram op de homepage — de ring met bodem, water, planten,
dieren en de andere elementen — stond stil tot een bezoeker erop klikte,
waardoor veel mensen niet doorhadden dat er iets te ontdekken viel. Het
diagram loopt nu vanzelf de elementen langs. Zodra de bezoeker de muis
erop houdt blijft het staan, en zodra iemand zelf een element kiest stopt
het draaien definitief, zodat het scherm nooit onder je handen wegloopt.
Bezoekers die in hun systeem hebben aangegeven weinig beweging te willen
zien, krijgen het diagram stil zoals voorheen. Getest in een echte browser
op alle vier de situaties, en apart op een telefoon — daar bleek een
aanraking het draaien blijvend stil te zetten, wat is opgelost.

---

## 2026-08-01 (slot) — Terreinchoreografie verkend en gearchiveerd; Tech Stack-pagina live

**Phase:** Awwwards elevation — B1 exploration & PR stewardship

**Summary:** Two pieces of work. First: revived and shipped the Tech
Stack page (PR #47) that had gone stale behind four merged PRs — merged
main into it, interleaved the conflicting worklog entries, verified the
page against the five new Hours themes it predated, and merged it;
`/stack` and `/nl/stack` are live. Second: built the roadmap's B1
scroll-choreographed terrain on a side branch (camera/fog/displacement
driven by scroll, survey annotations projected from 3D terrain
coordinates, theme-token scene colours, reduced-motion still frame) —
verified working in a real browser and offered for review on a preview.
The owner judged it didn't add enough and chose to archive: PR #51
closed unmerged, exploration preserved on `feat/terrain-choreography`,
roadmap updated so it is not re-proposed.

**Detailed activities:**
- PR #47 (Tech Stack page): conflict resolution against four newer
  merges, full verification battery (typecheck, lint, 122-pair contrast
  audit, build, browser checks incl. new themes, Dutch, 375px), merged
- B1 exploration (archived): scroll choreography, projected survey
  pins with anchor positions computed against the real camera
  projection, per-theme scene colours, bounded drift, reduced-motion
  still — all functional per browser verification, not merged by
  owner decision
- Roadmap updated: B1 marked archived with the decision recorded

**Categories:** Website Development, UI / UX Design, Research, Documentation

**Files:** merged: `src/app/[locale]/stack/*`, `src/lib/stack.ts` (PR #47); archived: `src/components/three/*` on `feat/terrain-choreography`; `ROADMAP.md`, `docs/worklog.md`

**Commits:** PR #47 (merged, f5433a2); PR #51 (closed unmerged, branch kept)

**Deployment:** /stack live on gronn.studio; terrain change not deployed.

### DigiBoox Summary
De pagina "Techniek" (/stack) afgerond en live gezet in twee talen: een
verkenbaar overzicht van waar de website van gebouwd is, met filters en
uitklapbare toelichtingen per techniek. Daarnaast een proefversie
gebouwd van een 3D-terrein op de homepage dat op het scrollen reageert,
met landmeetkundige annotaties verankerd in het landschap; na
beoordeling door de eigenaar is besloten dit niet te gebruiken. Het
werk is gearchiveerd zodat het later herbruikbaar is, en de planning is
bijgewerkt.

---

## 2026-08-01 — Sanity CMS verwijderd uit de codebase

**Phase:** SOTD campaign — Phase 0 (subtraction)

**Summary:** Removed the dormant Sanity CMS integration per the owner
decision recorded in `docs/sotd-campaign.md` Phase 0. The `/admin`
Studio route, the Sanity schemas, config, env plumbing and migration
script are gone, along with the packages `sanity`, `next-sanity` and
`@sanity/image-url` (~36 MB of dependencies). The GRØNN Editor
(`/editor`) is now the single content path. The Sanity account/project
`j10z1n29` itself was left untouched — the owner may still revoke it.
Git history preserves the full integration if it is ever needed again.

**Detailed activities:**
- Deleted `src/app/admin/`, `src/sanity/` (env + five schemas),
  `sanity.config.ts` and `scripts/migrate-to-sanity.ts`
- Uninstalled `sanity`, `next-sanity`, `@sanity/image-url`
  (package.json + package-lock updated via npm)
- Removed the `/admin` exclusions from `src/middleware.ts` and
  `src/lib/locale.ts`; updated stale comments in `src/app/layout.tsx`
  and `src/components/layout/site-shell.tsx`
- Removed the Sanity entry from the Tech Stack page catalog
  (`src/lib/stack.ts`) and the Sanity vars from `.env.example`
- Docs reconciled: OPERATIONS.md stack table + editor runbook,
  AGENTS.md §6, campaign status mark in `docs/sotd-campaign.md`
- Verified: typecheck, lint, full production build (route table no
  longer contains `/admin`), contrast audit

**Categories:** Website Development, Technical Architecture, Documentation

**Files:** `src/app/admin/*` (deleted), `src/sanity/*` (deleted), `sanity.config.ts` (deleted), `scripts/migrate-to-sanity.ts` (deleted), `src/middleware.ts`, `src/lib/locale.ts`, `src/lib/stack.ts`, `src/app/layout.tsx`, `src/components/layout/site-shell.tsx`, `.env.example`, `package.json`, `package-lock.json`, `OPERATIONS.md`, `AGENTS.md`, `docs/sotd-campaign.md`, `docs/worklog.md`

**Commits:** PR branch `feat/remove-sanity`

**Deployment:** none from this branch; deploys with the PR merge.

### DigiBoox Summary
Het oude, ongebruikte beheersysteem (Sanity) is uit de website-code
verwijderd. De site had twee systemen om teksten te bewerken; alleen de
eigen GRØNN-editor wordt gebruikt. Door het slapende tweede systeem op
te ruimen is de code kleiner en eenvoudiger te onderhouden, bouwt de
site sneller en is er minder dat kapot kan gaan. Het Sanity-account
zelf is niet aangeraakt; de eigenaar kan dat later zelf opzeggen. Alles
is na de opruiming volledig getest: de site bouwt foutloos en alle
pagina's werken zoals voorheen.

---

## 2026-08-01 — Veldprestatiemeting toegevoegd (Vercel Speed Insights)

**Phase:** SOTD campaign — Phase 0 (field performance)

**Summary:** Added `@vercel/speed-insights` and mounted the
`<SpeedInsights />` component in the root layout, per the decision in
`docs/sotd-campaign.md` Phase 0. The site now reports real-user Core
Web Vitals from actual visitors to the Vercel dashboard —
`docs/perf/README.md` documents that lab numbers mislead (a stale
`next start` flatters; a hidden tab never fires
`IntersectionObserver`), so field data is the only honest answer to
whether mobile is actually fast.

**Detailed activities:**
- Installed `@vercel/speed-insights` (^2.0.0)
- Mounted `<SpeedInsights />` in `src/app/layout.tsx` inside `<body>`,
  after `<Providers>`, with a comment pointing at the perf doc's
  lab-vs-field warning; theme/boot pre-paint scripts untouched
- Campaign status mark updated in `docs/sotd-campaign.md`
- Verified: typecheck, lint, full production build

**Categories:** Performance Optimisation, Website Development, Documentation

**Files:** `src/app/layout.tsx`, `package.json`, `package-lock.json`, `docs/sotd-campaign.md`, `docs/worklog.md`

**Commits:** PR branch `feat/speed-insights`

**Deployment:** none from this branch; measurement begins when the PR merge deploys.

### DigiBoox Summary
Meting van de werkelijke laadsnelheid toegevoegd aan de website. Tot nu
toe werd de snelheid alleen in een testomgeving gemeten, en die cijfers
geven een te rooskleurig beeld. Vanaf nu meet de site anoniem hoe snel
de pagina's laden bij echte bezoekers, op echte telefoons en
verbindingen. Die gegevens verschijnen in het beheerdashboard en maken
zichtbaar of de site voor bezoekers werkelijk snel is — belangrijk voor
de gebruikerservaring en voor de vindbaarheid in zoekmachines.

---

## 2026-08-01 (vervolg) — Foto's verschijnen zacht in plaats van abrupt

**Phase:** Awwwards elevation — Phase 0 (protect what exists)

**Summary:** Every static photograph on the site now arrives as a soft
wash of its own colours that sharpens into the real image, instead of
popping into an empty frame. A build step generates a tiny (~10px)
blurred preview of each photo in `public/ph` plus the preloader's
forest photograph, committed as a small JSON map; the photo wrapper and
the preloader hand these to Next.js as inline blur placeholders. No new
dependencies — the previews are made with the image library Next.js
already ships with — and the preloader's carefully tuned LCP behaviour
is untouched.

**Detailed activities:**
- `scripts/generate-blur-map.mjs`: builds a ~10px webp preview per
  static photo as a base64 data URL, written to `src/lib/blur-map.json`
  with stable key order (reruns are byte-identical); wired as
  `prebuild` so the map can never go stale against shipped files
- `<Photo/>` passes `placeholder="blur"` + the mapped `blurDataURL`
  when an entry exists; editor-uploaded Blob images have no entry and
  safely skip the treatment
- Preloader's intro photograph gets the same treatment as inline data
  (zero extra requests, cannot delay first paint); its
  priority/fetchPriority and the LCP-candidate lockup are untouched
- Verified: production build, typecheck, lint, 122-pair contrast audit
  all green; Playwright against the built site confirmed 7/7 rendered
  photos on /projects carry the data-URL blur background while loading

**Categories:** Performance Optimisation, Website Development, Testing

**Files:** `scripts/generate-blur-map.mjs`, `src/lib/blur-map.json`,
`src/components/photo.tsx`, `src/components/preloader.tsx`,
`package.json`

**Commits:** PR `feat/blur-placeholders`

**Deployment:** ships with the next merge to `main`.

### DigiBoox Summary
Techniek toegevoegd waarmee foto's op de website zacht in beeld komen:
bezoekers zien direct een wazige kleurversie van elke foto die scherp
wordt zodra de echte foto geladen is, in plaats van een leeg vlak dat
plots gevuld wordt. Dit is vooraf klaargezet zodat het meteen werkt
wanneer de echte projectfotografie wordt aangeleverd. Gecontroleerd met
de volledige testbatterij en in een echte browser.

---

## 2026-08-01 (avond) — Kwaliteitspoort: CI met echte browsertests

**Phase:** SOTD campaign Phase 0

**Summary:** The quality gate AGENTS.md always assumed now exists: a
GitHub Actions workflow named `quality` runs on every PR — build,
typecheck, lint, the WCAG contrast auditor and Playwright driving the
real production build on desktop and mobile profiles, with axe-core
scanning six key pages and behavioural specs pinning the things that
have actually regressed before (skip link, both dialogs' focus traps,
time-of-day theme boot, tap-target minimums). Writing the gate
immediately paid for itself: axe found three real accessibility faults
on the live design that were fixed in the same change — signal ember as
small text on the service cards, an invalid interactive-inside-image
role on the systems diagram, and contact links distinguishable only by
colour.

**Categories:** Testing, Infrastructure, Accessibility, Website Development

**Files:** `.github/workflows/quality.yml`, `playwright.config.ts`, `tests/e2e/*`, `src/components/home/{services-overview,living-system}.tsx`, `src/components/lab/ecosystem-sim.tsx`, `src/app/[locale]/contact/contact-content.tsx`, `package.json`

**Commits:** see PR (branch `feat/ci-quality-gate`)

**Deployment:** CI only; three a11y fixes ship with it.

### DigiBoox Summary
Automatische kwaliteitscontrole ingericht: bij elke codewijziging
worden voortaan de bouw, de toegankelijkheid (met echte browsertests op
desktop- en telefoonformaat) en het kleurcontrast gecontroleerd voordat
iets live kan. De eerste controle vond direct drie echte
toegankelijkheidsfouten op de site, die meteen zijn hersteld.

---

## 2026-08-01 (avond) — Native view transitions: projectkaart wordt projectpagina; routegordijn hersteld

**Phase:** Awwwards elevation — SOTD campaign Phase 3 (view transitions)

**Summary:** Implemented the approved Phase 3 shared-element navigation:
clicking a project card now morphs the card's photo into the case-study
hero via the browser's native View Transitions API — no libraries, no
Next experimental flag (evaluated and rejected: it requires React-canary
APIs absent from stable typings and hijacks every navigation). The API
is feature-detected and gated on `prefers-reduced-motion`; Firefox and
reduced-motion visitors keep the plain navigation. Only the clicked
card ever carries the `view-transition-name`, and the green route
curtain stands down for exactly that navigation. While verifying the
curtain control-case, discovered the curtain had silently died site-wide:
Next 16 templates no longer remount on in-locale navigations (the root
template keys on `[locale]`), so the remount-driven curtain never
played. Rebuilt it to run off the pathname instead — same choreography,
and page/chrome state now survives navigation. Verified headlessly on
the production build: card nav runs the view transition with the curtain
held; menu nav plays the curtain; reduced motion gets neither; no
console errors, no horizontal overflow on mobile.

**Detailed activities:**
- `src/lib/view-transition.ts` (new): feature-detected
  `document.startViewTransition` wrapper; names the clicked card's
  photo frame, waits for the destination page's commit with a bounded
  timeout, clears the name and flag on `finished`
- `src/components/project-card.tsx`: click handler that runs the
  router push inside the view transition; modified clicks and
  unsupported browsers fall through to the untouched `<Link>`
- Case study: hero carries the matching `view-transition-name` on
  shared-element arrival and skips its framer entrance for that one
  arrival (the morph is the entrance)
- `src/app/template.tsx`: curtain rewritten from remount-driven to
  pathname-driven after diagnosing the Next 16 template-keying change
  (documented in `node_modules/next/dist/docs`); suppression hook for
  card navigations; initial-load behaviour preserved
- `globals.css`: morph snapshots crop like the live photos
  (aspect 4:3 → 21:9), house ease; reduced-motion kill switch for all
  view-transition pseudo-elements
- Verification: typecheck, lint, 122-pair contrast audit, production
  build, Playwright on the production build (card nav = transition +
  no curtain + correct landing; menu nav = curtain plays; reduced
  motion = plain swap; home desktop/mobile layout sanity)

**Categories:** Website Development, UI / UX Design, Bug Fixing, Testing, Research

**Files:** `src/lib/view-transition.ts`, `src/components/project-card.tsx`, `src/app/[locale]/projects/[slug]/case-study.tsx`, `src/app/template.tsx`, `src/app/globals.css`

**Commits:** branch `feat/view-transitions` (draft PR, pending review)

**Deployment:** not yet deployed — awaiting PR review and merge.

### DigiBoox Summary
De overgang tussen de projectenpagina en een projectdetailpagina is
vernieuwd: wie op een projectkaart klikt ziet nu de foto van die kaart
vloeiend uitgroeien tot de grote foto bovenaan de projectpagina, zodat
duidelijk is dat je hetzelfde project bekijkt. Dit gebruikt een
ingebouwde browserfunctie, zonder extra software. Browsers die de
functie niet kennen en bezoekers die weinig beweging willen zien,
krijgen gewoon de bestaande paginaovergang. Tijdens het testen bleek
bovendien dat het groene overgangsgordijn tussen pagina's al een tijd
onzichtbaar kapot was door een wijziging in het onderliggende
websiteplatform; dat is gerepareerd, zodat elke paginawissel weer zijn
vertrouwde overgang heeft. Alles is gecontroleerd met geautomatiseerde
browsertests op de productieversie, op desktop en telefoonformaat.

---

## 2026-08-02 — Dock: alle cirkels één maat

**Phase:** Mobile polish (owner feedback)

**Summary:** Owner feedback on the mobile dock: the three highlighted
shapes — the active page's frosted pill, the green start button and the
back-to-top ring — were three different sizes. All three now share the
wider stadium shape (56×44) the active pill already used; the plain
icon slots are untouched. Spacing tightened slightly so the bar still
fits small phones. Verified in the browser with no horizontal overflow
and all tap targets at or above the minimum.

**Categories:** UI / UX Design, Website Development

**Files:** `src/components/layout/mobile-dock.tsx`

**Commits:** see PR (branch `feat/dock-uniform-circles`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Op aanwijzing van de eigenaar de navigatiebalk onderin op telefoons
gelijkgetrokken: de drie uitgelichte knopvormen (actieve pagina,
startknop en terug-naar-boven-ring) hebben nu allemaal dezelfde bredere
vorm en maat. Gecontroleerd op verschillende schermbreedtes.

---

## 2026-08-02 (vervolg) — App-modus: de site als echte app naast de website

**Phase:** App experience Tier 1 (owner direction, Clevers reference)

**Summary:** The installed experience (home-screen launch) is now a real
app, side by side with the unchanged browser website. In app mode the
dock becomes a labeled tab bar in the style of the Clevers app — Home,
Projecten, Start, Journaal, Menu, every tab an icon with a visible word
— and switching tabs crossfades instantly instead of playing the
website's green curtain. A service worker makes repeat opens instant
(immutable assets cached; pages always fresh from the network) and adds
an offline "no signal from the field" page in the 404's visual
language. The existing add-to-home-screen window now announces this as
the GRØNN app. A middleware gap was found and fixed along the way: the
locale rewrite swallowed the /offline route.

**Detailed activities:**
- Standalone detection (display-mode + iOS flag) as the app-mode gate;
  browser experience byte-for-byte unchanged (verified)
- Labeled tab bar in app mode, bilingual labels, 52px tabs, verified at
  390px with no overflow
- Crossfade navigation in app mode (curtain suppressed — verified 0
  curtain movement on tab switches, still plays in the browser)
- Conservative service worker: cache-first for fingerprinted assets,
  network-first pages (can never go stale), precached offline page
- Install prompt reworded as the app announcement (EN/NL)
- Full quality gate green (17 browser tests, axe, contrast, build)

**Categories:** Website Development, UI / UX Design, Technical Architecture, Performance Optimisation

**Files:** `src/lib/use-standalone.ts`, `public/sw.js`, `src/components/register-sw.tsx`, `src/app/offline/page.tsx`, `src/components/layout/mobile-dock.tsx`, `src/app/template.tsx`, `src/components/install-prompt.tsx`, `src/middleware.ts`, `src/app/layout.tsx`

**Commits:** see PR (branch `feat/app-mode`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De website werkt nu als echte app wanneer bezoekers hem op het
beginscherm van hun telefoon zetten, naar het voorbeeld van de
Clevers-app: een tabbalk met benoemde knoppen (Home, Projecten, Start,
Journaal, Menu), direct wisselende schermen en een offline-pagina als
er geen verbinding is. Herhaalde starts zijn vrijwel direct doordat
vaste bestanden lokaal bewaard worden. De gewone website in de browser
is onveranderd; het bestaande installatievenster kondigt de app aan.

---

## 2026-08-02 (vervolg 2) — Dock: terug-naar-boven wisselt met de menuknop

**Phase:** App experience Tier 1 (owner feedback)

**Summary:** The floating back-to-top bubble above the dock read as a
loose element hovering over the page content (owner: "this looks
ugly"). The arrow now lives inside the pill: once the visitor is a
viewport deep, the grid (menu) slot crossfades into the back-to-top
arrow with its pulsing ember ring, and swaps back near the top — the
owner's requested "switch places when scrolling". The bar is always
exactly five equal slots, so the start button stays on the centre line
in every state; while the navigation sheet is open the menu button
always wins, so the control that closes the sheet can never vanish
mid-use. Verified at 390px in both browser and app mode: plus centred
(195/195) at rest and scrolled, swap works, tap scrolls home and
restores the menu, full quality gate green.

**Detailed activities:**
- Removed the floating bubble; menu ↔ top now share one fixed-size slot
  (absolutely stacked crossfade, geometry can never move)
- Removed the app-mode text labels under the tabs (owner call) — the
  installed app now shows the same clean icon pill as the browser
- Reduced-motion: instant opacity swap, no scale
- Verified both modes headless (centering, swap, tap-to-top, no page
  errors) + 17-test e2e suite, tsc, eslint

**Categories:** UI / UX Design, Website Development

**Files:** `src/components/layout/mobile-dock.tsx`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De mobiele navigatiebalk verfijnd na eigen review: de losse
terug-naar-boven-knop die over de pagina zweefde is vervangen door een
nette wissel binnen de balk zelf — bij het scrollen maakt de menuknop
plaats voor het pijltje omhoog en andersom. De tekstlabels onder de
knoppen in de app-weergave zijn verwijderd; de balk toont in de app
dezelfde rustige iconenrij als op de website. De balk houdt altijd
dezelfde vorm en de startknop blijft precies in het midden.

---

## 2026-08-02 (vervolg 3) — Dock: zijknoppen vouwen weg tijdens het lezen

**Phase:** App experience Tier 1 (owner direction)

**Summary:** Owner direction after the swap shipped: the side icons
should disappear while scrolling and reappear on the way back. While
reading (scrolling down) the two wings now fold away symmetrically and
the pill melts down to just the green start button; a short upward
flick brings all four side icons back — with the back-to-top arrow in
the last slot when deep, the menu grid near the top. Both wings share
one width and one transition, so the start button stays on the centre
line through the whole animation. Folded wings are `inert` (not
tabbable, hidden from assistive tech); the navigation sheet forces the
wings open so the control that closes it can never vanish. Reduced
motion swaps instantly. Verified headless: pill 324px → 79px and back,
plus centred at every stage, arrow when deep / grid at top, full
quality gate green.

**Detailed activities:**
- Wings as fixed-width motion containers (118px ↔ 0) driven by the
  existing direction-aware `compact` state; inert when folded
- Back-to-top slot back to position-based (the direction logic now
  lives in the fold; the arrow can no longer linger while reading)
- Verified headless in both directions + 17-test e2e suite, tsc, eslint

**Categories:** UI / UX Design, Website Development

**Files:** `src/components/layout/mobile-dock.tsx`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De mobiele navigatiebalk gedraagt zich nu rustiger tijdens het lezen:
bij het scrollen vouwen de zijknoppen weg en blijft alleen de groene
startknop over; een klein stukje terugscrollen brengt alle knoppen
direct terug (diep op de pagina met het pijltje terug-naar-boven,
bovenaan met de menuknop). De balk krimpt en groeit symmetrisch zodat
de startknop altijd precies in het midden blijft.

---

## 2026-08-02 (vervolg 4) — Dock: gelijke rand rond de startknop

**Phase:** App experience Tier 1 (owner feedback)

**Summary:** In the collapsed dock the glass ground around the start
button was 16px on the sides against 8px above and below (owner:
"reduce left and right padding, the background is not equal"). The
pill now carries one uniform 8px padding, and the start button's side
gaps moved into the wings' animated margins — so they fold away with
the wings and the collapsed pill reads as an even ring on all four
sides. Verified headless: ring equal on all sides collapsed, expanded
bar symmetric, plus centred in both states, full quality gate green.

**Detailed activities:**
- Pill `px-2.5 py-2` → uniform `p-2`; CTA margins moved into the
  wings' animated `marginLeft`/`marginRight` (6px ↔ 0)
- Verified headless (ring 7.2/7.2/7.2/7.2 under tuck scale, centring
  195/195) + 17-test e2e suite, tsc, eslint

**Categories:** UI / UX Design, Website Development

**Files:** `src/components/layout/mobile-dock.tsx`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De ingeklapte navigatiebalk verder verfijnd: de lichte rand rond de
groene startknop is nu aan alle vier de kanten even breed, zodat de
knop netjes gecentreerd in zijn achtergrond zit.

---

## 2026-08-02 (vervolg 5) — Actieve pagina direct gemarkeerd bij laden

**Phase:** App experience Tier 1 (owner feedback)

**Summary:** The dock's home icon (and every other active-page marker)
only lit up after a client-side navigation, never on a fresh load
(owner: "make home icon orange also when page is loaded"). Cause: the
middleware rewrite leaves `usePathname()` at the internal `/en` on a
fresh English load (Dutch pages always carry `/nl`), so raw comparison
against `/` missed. Active states in the dock and the header now
compare against the locale-stripped route via the existing
`stripLocale` helper. Verified headless: home icon ember on fresh `/`
and `/nl` loads, projects (not home) marked on a fresh `/projects`
load, full quality gate green.

**Detailed activities:**
- `stripLocale(usePathname())` for active checks in mobile dock and
  header (desktop nav + full-screen menu)
- Logo animation on phones reworked to match the dock (owner request:
  "make it smooth"): reading drifts the logo out to the left with a
  soft blur, scrolling up glides it back — one horizontal fold
  language top and bottom, with a gentler easing curve
- Ember comet orbiting the dock's glass rim (owner request): a thin
  arc travels the pill's border every 6s as a quiet attention cue — a
  rotating conic gradient clipped to a 1.5px edge, so it follows the
  pill at any width the fold gives it; reduced motion freezes it to a
  static arc
- Verified fresh-load active states in both locales + logo drift
  headless + 17-test e2e suite, tsc, eslint

**Categories:** Website Development, UI / UX Design

**Files:** `src/components/layout/mobile-dock.tsx`, `src/components/layout/header.tsx`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Kleine navigatiefout hersteld: het icoon van de actieve pagina (zoals
het huisje op de homepagina) kleurt nu direct oranje bij het openen
van de site, niet pas na doorklikken. Geldt voor de mobiele balk en
het menu bovenaan, in beide talen. Daarnaast beweegt het logo bovenaan
nu in dezelfde stijl als de navigatiebalk onderaan: bij het lezen
schuift het soepel naar links uit beeld, bij terugscrollen glijdt het
terug. Als subtiel accent loopt er nu een dun oranje lichtje langs de
rand van de navigatiebalk.

---

## 2026-08-02 (vervolg 6) — Case study met resultaatcijfers (placeholderdata)

**Phase:** SOTD campaign Phase 2 (owner unblocked with "use placeholder data")

**Summary:** The campaign's blocked item — a case study where outcome
numbers become the layout — is now built, on the owner's instruction to
proceed with placeholder data. The flagship pond project gained a
"Measured Outcomes" chapter: five results, each a full-width row where
the measured value is the largest element (before in muted, an ember
survey arrow, the after-figure counting up at display scale), with a
mono field-annotation label and a quiet explanatory note. Data is
typed (`Outcome` on the project model), bilingual, editor-labelled,
and placeholder fiction in the site's existing register — real project
figures swap in place when they exist. Along the way a content-
pipeline gap was found and closed: the published editor document
replaced the projects array wholesale, so any field the code ships
after a publish (like `outcomes`) would silently vanish — entries are
now merged per slug, published fields winning, fallback filling new
ones.

**Detailed activities:**
- `Outcome` type + five placeholder outcomes on the flagship project;
  regenerated `content/site-content.json` via the export script
- `Outcomes` component: numbers-as-layout rows, CountUp, ember arrow
  with screen-reader "to", FadeIn, reduced-motion safe, EN/NL
- Content loader: per-slug merge for projects/articles/services so a
  published document can't shadow newly shipped fields
- Verified render on mobile in both locales + contrast audit + 17-test
  e2e suite, tsc, eslint

**Categories:** Website Development, UI / UX Design, Content, Technical Architecture

**Files:** `src/lib/data/projects.ts`, `src/components/projects/outcomes.tsx`, `src/app/[locale]/projects/[slug]/case-study.tsx`, `src/lib/content.ts`, `content/site-content.json`, `docs/sotd-campaign.md`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De belangrijkste projectpagina (het vijverproject) uitgebreid met een
hoofdstuk "Gemeten resultaten": vijf uitkomsten waarbij de cijfers het
ontwerp dragen — soorten voor en na, vastgehouden regenwater,
hergebruikt materiaal, onderhoudsuren en bodemherstel. Voorlopig met
voorbeeldcijfers, in afwachting van echte projectdata; de opmaak is
klaar en de echte cijfers kunnen er zo in. Ook een technische
verbetering in het contentsysteem zodat nieuwe onderdelen niet
verdwijnen na publiceren vanuit de editor.

---

## 2026-08-02 (vervolg 7) — Voor/na-schuif en klantstemmen (Qi-inspiratie, eigen stack)

**Phase:** Appeal features (owner direction: mine Qi Addons for Elementor,
build natively in the site's own stack)

**Summary:** Audited Qi Addons' 100+ widget catalogue against the
site's design rules. Most of it the site already does natively
(counters, hotspots, process steps, reveal text); marquees/typeout
were rejected earlier as "cheap". Two genuine gaps were built, both
zero-dependency: (1) a **before/after comparison slider** on the
flagship case study — drag the ember survey handle (or use arrow keys)
to sweep the finished landscape across the starting one; clip-path
reveal, one photo-glass screen over both halves, theme-invariant
BEFORE/NA chips, full slider semantics for screen readers; and (2) a
**client voices** section on the homepage — one quote at a time in the
field-note register, quiet crossfade, labelled prev/next controls with
an 01/03 counter, self-advancing at reading pace but paused on
hover/focus and fully static under reduced motion. Quotes and the
photo pair are placeholder fiction per the owner's standing call. Home
chapters renumbered (Voices 09, Journal 10, Studio 11); the content
loader gained a key-level merge for `home` so published editor
documents can't shadow newly shipped fields.

**Detailed activities:**
- `BeforeAfter` component (pointer drag + keyboard, clip-path, a11y
  slider role) + `transformation` data on the flagship project
- `Testimonials` component + `testimonials` home content (EN/NL,
  3 placeholder quotes); export script updated, JSON regenerated
- Case-study appendix chapters now number themselves (transformation
  10 → outcomes 11 → metrics 12)
- content.ts: `home` merged key-level, same rationale as the per-slug
  entry merge
- Verified drag (50→20), keyboard (→28), rotation, both locales;
  contrast audit + 17-test e2e suite green

**Categories:** Website Development, UI / UX Design, Content

**Files:** `src/components/projects/before-after.tsx`, `src/components/home/testimonials.tsx`, `src/lib/data/projects.ts`, `src/lib/content-types.ts`, `src/lib/content.ts`, `scripts/export-content.ts`, `content/site-content.json`, `src/app/[locale]/page.tsx`, `src/app/[locale]/projects/[slug]/case-study.tsx`, `src/components/home/journal-preview.tsx`, `src/components/home/studio-intro.tsx`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Twee nieuwe onderdelen gebouwd om de site aantrekkelijker te maken,
geïnspireerd op een bekende widgetbibliotheek maar volledig in de
eigen techniek van de site: een voor/na-schuifregelaar op de
projectpagina (sleep de oranje lijn over de foto om de transformatie
te zien) en een sectie met klantcitaten op de homepagina, met
bladerknoppen. Beide voorlopig met voorbeeldmateriaal, klaar om echte
foto's en echte citaten in te vullen.

---

## 2026-08-03 — Dock: grotere iconen

**Phase:** App experience (owner feedback)

**Summary:** The dock's icons read small inside their 56×44 stadiums
(owner: "make the icons bigger"). All four outline icons went from
22px to 26px, the start plus from 20px to 24px, and the back-to-top
arrow's ember ring from 24px to 28px. Slot and pill geometry are
untouched, so the start button stays centred and nothing overflows at
390px — verified headless, full quality gate green.

**Categories:** UI / UX Design

**Files:** `src/components/layout/mobile-dock.tsx`

**Commits:** see PR (branch `claude/new-session-vu731q`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De iconen in de mobiele navigatiebalk vergroot voor betere
leesbaarheid; de balk zelf en de positie van de knoppen zijn
ongewijzigd.

---

## 2026-08-10 — Eigenaarspaneel: offertes en facturen

**Phase:** Owner tooling

**Summary:** The owner's own single-file quote/invoice builder was
brought into the site as a proper back office at `/admin`, deliberately
separate from the site editor: that one is about the public website's
words and pictures, this one is the studio's paperwork. The two share
nothing but the existing Google single sign-on (same NextAuth provider,
same one-address allowlist), so one login opens both and the panel's
markup is never served to an unauthenticated request. The panel is a
tabbed shell — one tab today, room for more — holding a live A4
document: fields on the left, the printed sheet on the right, updating
as you type. Quote/invoice toggle, one price per line or three variants
side by side, "inbegrepen" lines that carry no price and are excluded
from the totals, VAT on the subtotal in the Dutch convention, free text
blocks above and below the amounts (plain or as an ember-ruled note),
automatic document numbering that continues the year's series, and
print-to-PDF where the whole panel steps aside and only the paper
remains. Documents are kept in the browser and can be exported and
reopened as files.

**Detailed activities:**
- `src/lib/documents.ts`: typed document model, VAT/total arithmetic
  rounded to whole cents, Dutch formatting, numbering, and storage as a
  `useSyncExternalStore` store (the house pattern — no localStorage copy
  into state inside an effect)
- `/admin` route with its own Google sign-on gate, server-side session
  check, `noindex`; middleware matcher extended so the panel is not
  locale-rewritten
- `AdminPanel` tabbed shell; `DocumentBuilder` editor pane; printed A4
  `DocumentSheet` in the site's own type (Syne / Montserrat / Geist Mono)
- Sheet ink and paper are fixed constants, the second acknowledged
  exception to "never hardcode theme-dependent colour" (after
  `photo-glass`): a business document that leaves as PDF must not follow
  the visitor's theme
- Verified end to end headless: totals (€ 860,54 + 21% = € 1.041,25),
  three-variant columns, inbegrepen lines, quote↔invoice switch, saving,
  and no mobile overflow. Contrast audit, types, lint and the 17-test
  e2e suite green.

**Categories:** Website Development, Technical Architecture, UI / UX Design

**Files:** `src/lib/documents.ts`, `src/app/admin/*`, `src/app/globals.css`, `src/middleware.ts`

**Commits:** see PR (branch `feat/owner-panel`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Een eigen beheerpaneel gebouwd op de website, achter dezelfde
Google-inlog als de tekst-editor maar er verder los van: hier maak je
offertes en facturen. Links vul je de gegevens in, rechts zie je het
A4-vel meteen meelopen, met automatische btw- en totaalberekening,
doorlopende nummering en varianten naast elkaar. Afdrukken naar pdf
geeft een schoon document in de huisstijl.

---

## 2026-08-24 (vervolg) — Eigenaarspaneel verfijnd

**Phase:** Owner tooling (owner feedback)

**Summary:** Seven refinements to the quote/invoice panel, all from the
owner's own use of it. The letterhead is now a choice — the full logo
already carries the name and the tagline, so printing it beside the
typeset wordmark said everything twice; the options are logo alone, the
ember mark with the typeset name, or name only. Dates gained a calendar
picker that writes the Dutch long form into the field, while the field
itself stays free text so "in overleg" remains possible, plus a
one-click term button. Variants are now one, two or three columns, and
an invoice always shows one: the client has already chosen, so the
comparison would only confuse. An accepted quote converts into its
invoice in one click (per variant, keeping the quote on file), any
document can be duplicated, VAT has 21/9/0 shortcuts, there is an
internal note that never prints, and invoices carry a paid flag shown
in the document list. The editor and the panel now name each other
under a "Besloten" group, so neither is reachable only by URL. Finally
the page preview is fitted to the screen by measurement rather than
reflowed, so a phone shows the real PDF at 0.45 scale instead of a
differently-broken page.

**Detailed activities:**
- `masthead` on the document model with three settings; sheet renders
  one identity, never both
- Calendar + free-text dates (`dateISO`/`deadlineISO`), local-time
  parsing so a picked date never prints as the day before
- `ColumnCount` 1/2/3; invoices collapse to one column and hide the
  control
- `toInvoice()` and `duplicate()`; `normalize()` so documents saved by
  the earlier version keep working
- Fit-to-width preview via ResizeObserver on callback refs. Two real
  bugs found while building it: a mount effect attached its observer
  before the page existed (the panel opens on the empty state), and
  measuring the wrapper this hook resizes fed its own output back in
  and reset the scale to 1 on every second pass — it now measures the
  fixed 210mm page
- "Besloten" cross-links in both owner surfaces; the single-tab row was
  dropped as the same name twice
- Verified at 390 / 768 / 1500px, both document kinds; contrast audit,
  types, lint and the 17-test e2e suite green

**Categories:** UI / UX Design, Website Development, Bug Fixing

**Files:** `src/lib/documents.ts`, `src/app/admin/*`, `src/app/editor/editor-gate.tsx`, `src/app/globals.css`

**Commits:** see PR (branch `feat/owner-panel-refinements`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Het offerte- en factuurpaneel verfijnd na eigen gebruik: het briefhoofd
is nu instelbaar (logo, beeldmerk met naam, of alleen naam — het logo
bevatte de naam al, waardoor die dubbel stond), datums hebben een
kalenderkiezer én blijven vrij in te typen, er zijn nu één, twee of
drie prijskolommen mogelijk en een factuur toont er altijd één omdat de
klant zijn keuze al gemaakt heeft. Een geaccepteerde offerte wordt met
één klik de bijbehorende factuur, documenten zijn te dupliceren, er is
een interne notitie die niet meeprint en facturen hebben een
betaald-markering. Editor en paneel verwijzen nu naar elkaar. Op
telefoon schaalt het A4-vel netjes mee in plaats van scheef te lopen.

---

## 2026-08-24 (vervolg 2) — Briefhoofd: contactgegevens nog één keer

**Phase:** Owner tooling (owner feedback)

**Summary:** The sheet printed the studio's address, phone and email
twice — once beside the letterhead and again in the sign-off at the
foot. The foot already carries the full set including KvK, BTW and
IBAN, which is where a Dutch business document is read for them, so the
head's copy is gone and the letterhead is now identity only. Verified
that each detail occurs exactly once on the page and that the legal
identifiers survive.

**Categories:** UI / UX Design

**Files:** `src/app/admin/document-sheet.tsx`

**Commits:** see PR (branch `fix/sheet-contact-once`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Kleine correctie op het offerte- en factuurvel: adres, telefoon en
e-mail stonden zowel bovenaan als onderaan. Ze staan nu alleen nog in
de voettekst, samen met KvK, btw en IBAN — bovenaan blijft alleen het
briefhoofd staan.

---

## 2026-08-25 — Deel 5: gepubliceerde prijzen en eigen dienstpagina's

**Phase:** Conversion & Operations (verdienmodellen, bouwronde 1)

**Summary:** Read Deel 5 ("Website-implementatie") of the studio's
Verdienmodellen working document and turned its §5.3 into working
pages. The site sold design in abstract terms with no price anywhere;
it now carries the seasonal half of the practice as well — leaf
netting, autumn pond service, winterising, the paid pond survey and
the stewardship subscription — each with a published price, an
explicit "what you do not get" block, and a service-area postcode
check before anyone fills in a form. Each service also gained its own
URL, so a priced job can rank and be linked on its own rather than
living as an anchor on one long page. The plan for the remaining
Deel 5 items is written up alongside it, including two findings that
predate this work: the privacy statement makes three claims that are
already untrue, and the studio IBAN currently ships in the client
bundle.

**Detailed activities:**

- Read and extracted the 48-page source PDF; transcribed the price
  tables from Deel 1–3 into typed data.
- `src/lib/data/pricing.ts` — published prices keyed by service slug,
  incl. btw, with tiers, ranges and the offset rules. Kept out of the
  editable content document on purpose: the editor popover only edits
  `{en, nl}` values, so a number there would strand as half-editable.
- `src/lib/format.ts` — money formatting shared by `/admin` and the
  public pages; `euro()` moved out of the invoice model and re-exported
  so existing imports keep working. Added whole-euro consumer
  formatting, because "€ 350,00" reads like a quotation and "€350"
  reads like a price.
- `Service` gained `excludes` (the "what you do not get" list, fully
  owner-editable) and `kind`, which separates the bespoke practice from
  standardised seasonal work.
- Five new seasonal services written in both languages, with their
  included steps and their honest exclusions.
- `/services/[slug]` detail pages; `/services` regrouped into two
  sections; homepage cards limited to design work so the stack does not
  grow to eleven; case-study and card links repointed.
- `src/lib/werkgebied.ts` + a labelled postcode check component — the
  first location logic in the repo.
- Structured data: real `priceSpecification` per offer, a per-service
  `Service` node, and `areaServed` narrowed from "Netherlands" to the
  actual catchment.
- `/voorwaarden`: clauses for published prices, work that cannot be
  priced unseen, the offset rules, subscription term/indexation, and
  weather-dependent scheduling.
- Accessibility: three service pages added to the axe sweep in both
  locales; fixed a definition-list violation the new price table
  introduced.

**Categories:** Website Development, Content, Copywriting, SEO,
Accessibility, Technical Architecture, Planning, Documentation

**Files:** `src/lib/data/pricing.ts`, `src/lib/data/services.ts`,
`src/lib/format.ts`, `src/lib/werkgebied.ts`, `src/lib/schema.ts`,
`src/lib/placeholder.ts`, `src/lib/content.ts`,
`src/components/services/price-table.tsx`,
`src/components/services/postcode-check.tsx`,
`src/app/[locale]/services/[slug]/`,
`src/app/[locale]/services/services-content.tsx`,
`src/app/[locale]/voorwaarden/terms-content.tsx`,
`src/app/sitemap.ts`, `content/site-content.json`,
`docs/deel-5-website-implementatie.md`, `tests/e2e/a11y.spec.ts`

**Commits:** see PR (branch `claude/lees-deel-5-website-ideen-jcvlnj`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Het werkdocument over de verdienmodellen is uitgewerkt naar de website.
De site verkocht tot nu toe alleen ontwerp, zonder dat er ergens een
prijs stond. Daar is nu het seizoenswerk bijgekomen: bladnetten,
najaarsbeurt, winterklaar maken, de betaalde vijverdoorlichting en het
onderhoudsabonnement — allemaal met een vaste prijs erbij, met een
eerlijk blok "wat je niet krijgt", en met een postcodecontrole zodat
iemand buiten het werkgebied dat weet vóórdat hij een formulier
invult. Elke dienst heeft nu bovendien een eigen pagina met een eigen
webadres, zodat mensen er ook op kunnen zoeken en vinden. De
algemene voorwaarden zijn aangevuld met wat er juridisch bij
gepubliceerde prijzen en een maandabonnement hoort. Tot slot is het
plan voor de volgende stappen vastgelegd, met twee dingen die nu al
aandacht vragen: de privacyverklaring klopt op drie punten niet meer,
en het bankrekeningnummer staat onbedoeld in de website-code.

---

## 2026-08-25 (vervolg) — Diensten-mega-menu en navigatie

**Phase:** Conversion & Operations (navigatie)

**Summary:** After the pricing round put eleven services on the site, all of
them sat behind one word in the bar and the newly priced seasonal work was
unreachable from the navigation. Services now opens a panel showing both
families, the one sentence that explains each, and a from-price per service,
with a card for whatever is in season. Two things were fixed along the way:
tablet widths had no navigation at all (the dock disappears at 768px, the
inline nav only appeared at 1024px), and the category copy now lives in one
place instead of being repeated between the services page and the menu.

**Detailed activities:**

- New `ServicesMegaMenu` — a disclosure, not a dialog: keyboard-openable,
  Escape returns focus, Tab leaves the panel instead of being trapped.
  Hover opens it on a mouse only, so a touch tap does not fight the click.
- `SERVICE_GROUPS` and `servicesInGroup()` added to the services data as the
  single source for each family's name and description; the services page
  now reads them too.
- `priceHint()` added to the pricing data so the from-price rule exists once.
- Navigation now starts at tablet width instead of desktop; the remaining
  links join at desktop where there is room.
- The curtain menu on phones gained the two family names as sub-links, and
  the groups on the services page gained anchors to link to.
- Panel made opaque after the first attempt let the hero text read through it.
- Tablet given its own two-column grid with a compact in-season card.
- Accessibility: new end-to-end tests for the keyboard behaviour and an axe
  scan with the panel open.

**Categories:** UI / UX Design, Website Development, Accessibility,
Content, Technical Architecture, Testing, Documentation

**Files:** `src/components/layout/services-mega-menu.tsx`,
`src/components/layout/header.tsx`, `src/components/layout/site-shell.tsx`,
`src/app/[locale]/layout.tsx`,
`src/app/[locale]/services/services-content.tsx`,
`src/lib/data/services.ts`, `src/lib/data/pricing.ts`,
`tests/e2e/behaviors.spec.ts`, `tests/e2e/a11y.spec.ts`

**Commits:** see PR (branch `claude/lees-deel-5-website-ideen-jcvlnj`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Het menu van de website is opnieuw ingedeeld. Er stonden inmiddels elf
diensten op de site, maar die zaten allemaal achter één woord verstopt —
zeker het nieuwe seizoenswerk met prijzen was vanuit het menu niet te
vinden. Als je nu op Diensten gaat staan, klapt er een overzicht open met de
twee groepen naast elkaar, per groep een zin uitleg, en bij elke dienst de
vanaf-prijs. Rechts staat een kaartje met wat er in dit seizoen speelt.
Onderweg bleek dat de site op een tablet helemaal geen menu toonde, alleen
een hamburgerknop; dat is nu opgelost. Ook is gezorgd dat het menu volledig
met het toetsenbord te bedienen is en dat de teksten van de twee groepen nog
maar op één plek staan, zodat ze niet uit elkaar kunnen gaan lopen.

---

## 2026-08-26 — Mega menu als zwevende kaart

**Phase:** Conversion & Operations (navigatie, vormgeving)

**Summary:** The owner sent a reference screenshot of GitHub's platform
menu and asked for the same shape. The panel was a full-bleed strip; it is
now a floating card — inset, rounded, bordered, with a soft shadow —
hanging under the bar. Each service row gained a leading survey index as
its anchor mark (rather than an icon, which would have been the clipart
the brand rejects), and the overview link now sits in a recessed footer
strip at the start of the reading direction. Two defects were found and
fixed during review: the in-season photo stretched out of square on
tablet, and the small index marks failed the contrast minimum.

**Detailed activities:**

- Panel reshaped from edge-to-edge strip to an inset card with rounded
  corners, border and drop shadow.
- Leading `01`–`11` survey index per service row, in the brand's mono.
- Overview link moved into a recessed footer strip, left-aligned.
- Fixed the featured photo stretching on tablet (flex stretch beat the
  square aspect ratio).
- Fixed a real accessibility defect the automated scan caught: the index
  marks sat at 2.77:1 where 4.5:1 is required at that size.

**Categories:** UI / UX Design, Accessibility, Website Development

**Files:** `src/components/layout/services-mega-menu.tsx`

**Commits:** see PR (branch `claude/lees-deel-5-website-ideen-jcvlnj`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
Het uitklapmenu voor de diensten is vormgegeven naar het voorbeeld dat de
eigenaar aanleverde: het is nu een zwevende kaart met ronde hoeken die
onder de menubalk hangt, in plaats van een balk die van rand tot rand
loopt. Elke dienst heeft links een klein volgnummer gekregen als
ankerpunt, en de link naar het volledige overzicht staat nu in een eigen
strook onderaan de kaart. Tijdens de controle zijn twee fouten gevonden en
hersteld: op tablet werd de foto uitgerekt, en de kleine volgnummers waren
te licht om leesbaar te zijn — dat laatste werd opgemerkt door de
automatische toegankelijkheidstest.

---

## 2026-08-26 (vervolg) — Ingangen en menulabels

**Phase:** Conversion & Operations (navigatie, formulier)

**Summary:** Three related changes to the site's entry points. The enquiry
form now asks first which half of the practice you are there for — design
and build, or seasonal work — and only then which service, replacing two
lists of options that predated the split. The contact page stopped
repeating the studio's contact and business details, which the footer
already carries on every page. And the owner's two back-office tools now
sit together in the menu with an explanation of what they are, instead of
the editor being filed under "Legal" and the admin panel being reachable
only by typing its address.

**Detailed activities:**

- Enquiry form: first step is now the two service families as cards with
  their explanation; second step the services within that family, with
  their from-price. Same number of steps.
- Contact page: removed the duplicated email, phone, address, KVK and BTW
  block; removed the content field that fed it, which nothing rendered any
  more.
- Contact page label changed from "Start een project" to "Begin hier",
  since the page now also books dated seasonal work.
- Admin added beside the site editor in the footer, the full-screen menu
  and the phone menu, under their own heading with a line explaining that
  both are behind the studio's login.
- Each destination in the full-screen menu gained a one-line description.

**Categories:** UI / UX Design, Content, Copywriting, Website Development

**Files:** `src/components/contact/intake-form.tsx`,
`src/app/[locale]/contact/contact-content.tsx`,
`src/app/[locale]/contact/page.tsx`, `src/lib/content-types.ts`,
`scripts/export-content.ts`, `content/site-content.json`,
`src/components/layout/footer.tsx`, `src/components/layout/header.tsx`,
`src/components/layout/mobile-dock.tsx`

**Commits:** see PR (branch `claude/lees-deel-5-website-ideen-jcvlnj`)

**Deployment:** Via PR → preview → main.

### DigiBoox Summary
De ingangen van de website zijn aangepast aan de nieuwe indeling. Het
aanvraagformulier vraagt nu eerst waarvoor iemand komt — ontwerp en aanleg,
of seizoenswerk — en pas daarna om welke dienst het gaat, met de vanaf-prijs
erbij. Dat waren eerder twee lijsten met keuzes die nog uit de tijd van
vóór die tweedeling stamden. Op de contactpagina stonden onderaan nogmaals
het e-mailadres, telefoonnummer, adres, KvK en btw-nummer, terwijl die al
in de voettekst van elke pagina staan; dat dubbele blok is weg. Verder
staan de twee beheerprogramma's van de eigenaar — de site-editor en het
administratiepaneel — nu samen in het menu, met de uitleg dat ze achter de
eigen login zitten en waar ze voor dienen. Het administratiepaneel was tot
nu toe alleen te bereiken door het adres in te typen. Tot slot heeft elk
menu-item een korte omschrijving gekregen.

---

## 2026-08-30 — Klantportaal, eigenaar-dashboard en het intakespoor

**Phase:** Client portal & studio panel

**Summary:** The owner's admin panel moved from `/admin` to `/dashboard`
and became a two-audience surface: the studio's own panel and a client's
own dossier, on separate routes with separate API handlers. Along the way
two data-losing defects in the existing panel were repaired, the intake
upload path was rebuilt, and the database foundation for clients,
projects and subscriptions was laid with row level security enabled from
the first migration.

**Detailed activities:**
- Repaired the intake reference mismatch that silently dropped every
  attached file for five of nine realistic project names; one shared
  module (`src/lib/intake-reference.ts`) now serves browser, server and
  tests, with a regression spec holding it down
- Added orphan detection and reattachment, recovering the files that had
  already been separated from their submissions
- Repaired a defect by which creating a quote from a cold page load could
  overwrite the entire administration and restart the numbering
- Moved the panel to `/dashboard`; added a client portal with Supabase
  authentication, registration, password reset and account linking
- Rebuilt the intake archive as a two-pane workspace
- Added a calendar surface and a panel-wide search, both on data the
  panel already read, without adding a library for either
- Rebuilt the upload path: one shared accept list for browser and server,
  server-minted folder references, and a stored error message on failure
- Added the client/project/subscription/hours schema with row level
  security enabled on all four tables
- Repaired seven defects found in an adversarial audit of the intake
  path, including a notification email that carried the client's full
  answers to a third-party form service
- Added document archiving and an intake drain, with permanent deletion
  reachable only from the drain
- Added `PROGRESS.md`, a session log entry and this record

**Categories:** Website Development, Technical Architecture, Bug Fixing,
UI / UX Design, Data Protection & Security

**Files:** `src/app/dashboard/**`, `src/app/clients/**`,
`src/app/api/admin/**`, `src/app/api/intake/**`,
`src/lib/intake-reference.ts`, `src/lib/intake-uploads.ts`,
`src/lib/intake-archive.ts`, `src/lib/documents.ts`,
`src/lib/analytics.ts`, `src/lib/supabase.ts`,
`supabase/migrations/0001_client_dossier.sql`, `tests/e2e/*`

**Commits:** PR #98, #99, #100, #101, #102, #103, #104, #105, #106, #107,
#109

**Deployment:** Via PR → Vercel preview → main.

### DigiBoox Summary
Het beheerpaneel van de website is uitgebouwd tot een volwaardige
werkomgeving en verhuisd naar één adres, waar de eigenaar het eigen
paneel ziet en een ingelogde klant het eigen dossier. Klanten kunnen nu
zelf een account aanmaken en daarin hun aanvraag, offertes, facturen en
abonnement terugvinden.

Bij het bouwen zijn twee fouten in het bestaande paneel gevonden en
hersteld die stil gegevens vernietigden. De ernstigste: foto's die
klanten bij hun aanvraag meestuurden werden bij een deel van de
projectnamen weggegooid, zonder foutmelding — het paneel toonde dan een
aanvraag zonder bijlagen terwijl de bestanden er wel degelijk waren. De
al verloren bestanden bleken nog in de opslag te staan en zijn
teruggekoppeld aan de aanvragen waar ze bij horen. De tweede fout kon
onder bepaalde omstandigheden de hele offerte- en factuuradministratie
overschrijven; ook die is dicht.

Verder is er een agenda bijgekomen die laat zien wanneer seizoenswerk
open staat en wat er afloopt, een zoekfunctie door aanvragen en
documenten, en de mogelijkheid om oude facturen te archiveren en
aanvragen weg te halen. Facturen worden bewust gearchiveerd en nooit
gewist, vanwege de zevenjarige bewaarplicht. Weggehaalde aanvragen komen
eerst in een tussenbak waar ze teruggezet kunnen worden; definitief
wissen is een aparte, tweede handeling.

Tot slot is de databasebasis gelegd voor klanten, projecten en
abonnementen, met de toegangsbeveiliging vanaf de eerste regel
ingeschakeld in plaats van later toegevoegd.

# GRØNN Studio — business roadmap for the website

`ROADMAP.md` covers craft: Awwwards elevation and brand alignment with
Equilibrium. This document covers the other half — what the website has
to *do* for the business: get found, earn trust, convert enquiries, and
stay cheap to run. Written 21 Jul 2026.

**Context that shapes everything below:** one-person ecological design
practice in Stein (Limburg, NL), serving a regional catchment, with a
strongly **seasonal** sales cycle and a high-consideration purchase
(a garden design is a months-long, four-to-five-figure decision, chosen
largely on trust). The site is bilingual, self-editable, and costs €0/mo
to run. Nothing here requires a subscription unless marked 💳.

**Status:** ✅ done · 🔨 in progress · ⬜ not started · 🔒 owner action
· 💳 costs money

---

## Horizon 1 — Foundations (next few weeks)

### 1.1 Performance & technical health 🔨
Owned by the current work: committed Lighthouse baseline, idle rendering
for the 3D layer, image weight. Gate: mobile ≥85, desktop ≥95, LCP <2.5s.
Why it's first: it's the floor under every other item (SEO ranking,
mobile conversion, jury scoring).

### 1.2 Real content 🔒 **highest business value of anything on this list**
Every project, journal entry and photograph is currently placeholder
fiction. Real work beats any amount of code polish for both conversion
and Awwwards content scoring. Now fully self-serve through the editor.
- 3 real projects with honest before/after narrative — even small ones
- Real photography (see 1.3)
- Founder text in your own voice on `/studio`
- One real journal piece; it doubles as SEO content (2.2)

### 1.3 Photography workflow 🔒
The site's green-wash treatment unifies any photo, so consistency
matters less than coverage. Shot list per project: wide establishing,
the problem being solved, work in progress, detail of craft, the
finished system, one seasonal return visit. Phone photos in good light
beat nothing; 2000px+ masters. Upload directly in the editor.

### 1.4 Analytics that respect the privacy page ⬜
Currently there is **no measurement at all** — we cannot tell whether
anyone reaches the contact form. Options: Vercel Web Analytics (💳 on
Hobby limits, trivial to wire) or self-hosted Umami (free, more setup).
Must stay cookieless to keep the "zero tracking cookies" promise, and
the privacy page must name it. Minimum useful events: page views,
contact-form starts vs. completions, WhatsApp clicks.

### 1.5 Deliverability finish 🔒
DMARC record still missing (OPERATIONS §5). Without it, quotes and
replies risk spam folders — a silent revenue leak.

---

## Horizon 2 — Getting found (1–2 months)

### 2.1 Local discovery ⬜ 🔒 partly
For a regional service business this outranks everything else in SEO.
- **Google Business Profile** (owner): claim, category "Landscape
  designer", service area (Stein, Sittard-Geleen, Maastricht, Heerlen,
  Beek, Elsloo), photos, opening hours, link to site. This is often the
  single largest source of local enquiries.
- **LocalBusiness structured data**: the site already emits
  `ProfessionalService` JSON-LD; extend with `areaServed`, `geo`,
  `priceRange`, `openingHours`, and `sameAs` for the profile.
- **Reviews**: a simple, dignified ask after project completion, plus
  markup so stars can appear in search. Requires real clients first.

### 2.2 Content engine (SEO + authority) ⬜
The journal is currently decoration; it should be the acquisition
channel. Dutch-first, because that is the search language of the
catchment. Topics that match real intent: *vijver aanleggen kosten*,
*tuin ontwerpen met inheemse planten*, *regenwater in de tuin*,
*wateroverlast tuin oplossen*, *bijvriendelijke tuin*. Pattern: one
substantial piece per month, each answering a question a prospect
actually types, each ending in a soft CTA. Six pieces ≈ a year of
compounding traffic.

### 2.3 Service-area pages ⬜
One page per key town/region, genuinely written (soil, water table,
typical garden types of that area — you have real expertise here), not
spun duplicates. Ranks for "tuinontwerper Sittard" style queries.
Start with two and measure before scaling.

### 2.4 Search Console hygiene 🔒
Sitemap submission still open (OPERATIONS §1). Then watch which queries
actually arrive and let that steer 2.2 rather than guessing.

---

## Horizon 3 — Converting visitors (2–3 months)

### 3.1 Pricing transparency 🔨 — the biggest conversion lever
High-consideration buyers bounce when price is a mystery. Not a price
list: a "how investment works" section — what a consultation costs,
typical ranges per project type, what drives cost up or down, what
happens at each phase. Filters out mismatched leads and builds trust
with serious ones.

**Revised 25 Aug 2026.** "Not a price list" held while everything on
offer was bespoke. It no longer does: the studio also sells
standardised seasonal work (leaf net, autumn pond service, winterising,
paid survey, stewardship), and for those a published figure is exactly
what converts — most of the trade publishes nothing, which is why it
works. Both readings are now in force at different altitudes: **fixed
prices for standardised work, bands plus the offset rule for bespoke
design.** Shipped for the seasonal half; see
[`deel-5-website-implementatie.md`](deel-5-website-implementatie.md).

### 3.2 Proof & trust layer ⬜
- Testimonials (needs real clients) with names/towns where permitted
- Before/after with honest timelines ("18 months after planting")
- Credentials, memberships, insurance, guarantees — whatever is true
- "What working with GRØNN is like": timeline, what you receive, what
  is expected of the client

### 3.3 Seasonal front door ⬜ *distinctive to this business*
A garden studio's calendar is not flat: **autumn/winter is when design
work should be sold** (planning ahead for spring implementation), spring
is delivery season, summer is maintenance and observation. The homepage
CTA and availability line should follow that rhythm — "Ontwerp deze
winter, plant in het voorjaar" carries very differently in November than
in May. Now easy: both strings are editable, so this can be a seasonal
habit rather than a code change. Consider a small, optional automated
variant later.

### 3.4 Intake quality ⬜
The form works; the *lead* could be richer. Budget band, timeline,
plot size, and the sketch-your-plot idea from `ROADMAP.md` B1. Every
extra field costs completions, so add one at a time and watch 1.4.

### 3.5 Follow-up mechanics 🔒 mostly
Response-time is a conversion factor. A saved reply template, a simple
"what happens next" auto-response (needs a transport swap — see 4.1),
and a calendar link for the first call. Low effort, real effect.

---

## Horizon 4 — Hardening & scale (3–6 months)

### 4.1 Contact transport upgrade ⬜ 💳
Browser-direct FormSubmit is interim (OPERATIONS §9): it exposes the
destination, offers no server-side abuse protection, and cannot send
auto-responses. Target: Resend + server validation + rate limiting +
Turnstile. Needs owner approval (paid, privacy-policy update).

### 4.2 Security headers ⬜
No CSP, Referrer-Policy, Permissions-Policy or HSTS today. Stage CSP
report-only first — WebGL, fonts and inline JSON-LD all need allowances.

### 4.3 Automated quality gates ⬜
Still procedural. `quality` workflow (typecheck/lint/build), then
Playwright over the critical flows (menu, themes, language, form,
**editor publish**), then Axe. GitHub Free cannot enforce required
checks on a private repo, so discipline substitutes (AGENTS.md §1).

### 4.4 Backup & continuity ⬜
Content lives in one Blob store with per-publish snapshots — good, but
untested. Prove a restore once. Also: the editor's Backup button
download belongs in a real folder, not the Downloads pile.

### 4.5 Editor product 🔨
`the-editor` repo exists as a portable kit. Next real step is proving
portability by integrating it into Equilibrium — which also gives both
brands the same editing experience. Only after that is it worth
considering as something offered to clients.

---

## Deliberately not doing (and why)

- **A blog CMS, tags, categories, search** — six articles do not need
  infrastructure. Revisit past ~20 pieces.
- **A newsletter** — no audience to send to yet; would be building a
  distribution channel before having anything to distribute.
- **Multi-language beyond EN/NL** — the catchment is Dutch-speaking with
  international residents; German is a *maybe* given the border, but
  only with evidence from Search Console.
- **E-commerce / online booking of implementation work** — the product
  is bespoke design; a cart would misrepresent it.
- **A client portal** — one designer, few concurrent projects; email
  and WhatsApp are honestly better until that hurts.

---

## Sequencing logic

Horizon 1 before everything: without measurement (1.4) later decisions
are guesswork, and without real content (1.2) neither the jury nor a
prospect has anything to judge. Horizon 2 compounds slowly, so it
should start early even though it pays late. Horizon 3 is where revenue
actually moves, but it depends on real projects existing (3.2) and on
knowing what visitors do (1.4). Horizon 4 is insurance and leverage —
important, never urgent, easy to postpone forever, so it gets explicit
slots rather than "when there's time".

**Owner-only items, collected:** real projects + photography (1.2/1.3),
DMARC (1.5), Google Business Profile (2.1), sitemap submission (2.4),
pricing decisions (3.1), testimonial asks (3.2), any 💳 approval.

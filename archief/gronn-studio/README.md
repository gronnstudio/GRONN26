# GRØNN Studio

Marketing site for **GRØNN Studio** — an ecological design practice for
gardens, water systems, habitat creation and regenerative landscape
transformation.

> Nature is not decoration. Nature is infrastructure.

**Live:** https://gronn.studio

Sister project of [Equilibrium](https://equilibrium-pink.vercel.app/), the
studio's open knowledge hub. GRØNN is the parent brand; Equilibrium the
sidebrand.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** — semantic theme tokens in `src/app/globals.css`
- **framer-motion** — scroll choreography, reveals, stacking cards, transitions
- **three.js / React Three Fiber** — the procedural topographic hero field
- **Lenis** — inertia smooth scrolling
- **next-themes** — four palettes: Paper (default), Meadow, Forest, Night

## Brand

Green (`#197B4F`) carries structure; **Signal Ember** (`#F95A08`) answers
interaction. Type: **Syne SemiBold** headings, **Montserrat** body,
**Geist Mono** annotations. All brand assets originate from the studio's
brand drive; logo/mark/intro imagery live in `public/`.

## Content & i18n

- Bilingual (EN/NL) via a client-side `LanguageProvider`; every string is a
  `{ en, nl }` pair (`src/lib/i18n.ts`)
- Projects, journal and services are typed data in `src/lib/data/` — no CMS
- Business identity (address, KVK, BTW, contact) centralised in
  `src/lib/business.ts`; legal pages at `/privacy` and `/voorwaarden`
- Placeholder imagery is picsum under a green wash — to be replaced with
  real project photography

## Develop

```bash
npm install
npm run dev
```

## Deploy

Connected to Vercel via Git: **push to `main` deploys production**
(gronn.studio); other branches get preview deployments. Manual deploys
remain possible with `npx vercel deploy --prod`.

## Known stubs

- The contact intake form composes a mailto draft (no backend yet) — wire
  `IntakeForm.handleSubmit` to a route handler + email service when ready,
  and update `/privacy` accordingly.

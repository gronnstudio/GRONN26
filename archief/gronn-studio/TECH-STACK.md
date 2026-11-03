# Tech stack manifest — GRØNN Studio × Equilibrium

One brand, two surfaces. Equilibrium is a side branch of GRØNN: this
manifest is kept **byte-identical in both repositories** so either repo can
be cross-referenced against the other — what code exists in both, where the
parallel implementation lives, and which pieces can be ported to run in the
sibling to converge on one brand.

- `gronnstudio/gronn-studio` — marketing site, live at https://gronn.studio
- `gronnstudio/equilibrium` — knowledge-hub side branch, live at https://equilibrium-pink.vercel.app

Snapshot date: 2026-07-19. When either stack changes materially, update this
file **in both repos** so the copies stay identical.

## Shared foundation

Both projects are built on the same core stack and design DNA:

| Layer | Choice (both repos) |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript 5 |
| UI runtime | React 19 |
| Styling | Tailwind CSS 4 via `@tailwindcss/postcss`, semantic tokens in `globals.css` |
| Motion | Framer Motion + Lenis smooth scroll (Lenis owns scrolling — no CSS `scroll-behavior`) |
| 3D | React Three Fiber + three.js |
| i18n | Client-side EN/NL with typed dictionaries — no i18n framework |
| Content | Typed data files in `src/lib` — no CMS |
| Accessibility | `prefers-reduced-motion` hooks gate every animation |
| Images | picsum.photos placeholders pending real photography |
| Typography | Syne (self-hosted `next/font/local`) as display face |
| Hosting | Vercel (Git integration; push to `main` deploys production) |

## Parallel code cross-reference

The same concerns are solved twice, as parallel implementations rather than
a shared package. This table is the porting map: each row is a candidate for
lifting the stronger implementation into the sibling repo (or extracting
into a shared `@gronn/*` package later).

| Concern | gronn-studio | equilibrium | Notes for convergence |
| --- | --- | --- | --- |
| Smooth scroll provider | `src/components/motion/smooth-scroll.tsx` (Lenis) | `src/components/SmoothScrollProvider.tsx` (Lenis wired into GSAP ticker) | Same library; equilibrium's variant adds GSAP ScrollTrigger sync |
| Reduced-motion hook | `src/lib/use-reduced-motion.ts` (`useSyncExternalStore`) | `src/lib/usePrefersReducedMotion.ts` (`useEffect` + state) | gronn's version is SSR-safe and tear-free — ported to equilibrium 2026-07-19; keep in sync |
| i18n dictionaries | `src/lib/i18n.ts` + `useT()` in `src/components/language-provider.tsx` | `src/lib/i18n.ts`, `useLang.ts`, `pageDict.ts`, `usePageDict.ts` | Same `{ en, nl }` shape; unify on one provider API |
| Language switch UI | `src/components/language-toggle.tsx` | `src/components/LanguageSwitch.tsx` | Same job, different styling |
| Theme switching | `src/components/theme-toggle.tsx` + next-themes (4 palettes: light/meadow/forest/dark) | `src/components/ThemeToggle.tsx` + custom `src/lib/themes.ts` | gronn's semantic-token + next-themes approach is the brand standard |
| 3D scene (R3F) | `src/components/three/terrain-scene.tsx`, `terrain.tsx` | `src/components/core/EquilibriumCore3D.tsx`, `CoreScene.tsx`, `CoreChoreography.tsx` | Different subjects (field terrain vs. knowledge core), same R3F + scene-token pattern |
| Preloader | `src/components/preloader.tsx` | `src/components/Preloader.tsx` + `LoadGate.tsx` | |
| Custom cursor | `src/components/motion/cursor.tsx` | `src/components/CometCursor.tsx` | Brand rule: Signal Ember answers interaction |
| Magnetic hover | `src/components/motion/magnetic.tsx` | `src/components/MagneticButton.tsx` | |
| Kinetic/reveal text | `src/components/motion/reveal-text.tsx`, `letter-flip.tsx` | `src/components/KineticTitle.tsx`, `ScatterText.tsx`, `PixelReveal.tsx` | gronn's reveal-text carries the overflow-clip `whileInView` fix |
| Animated counters | `src/components/motion/count-up.tsx` | `src/components/StatsStrip.tsx` (inline) | |
| Header / footer / dock | `src/components/layout/{header,footer,mobile-dock}.tsx` | `src/components/{Header,Footer,MobileDock,BottomNav}.tsx` | |
| Scroll progress | — | `src/components/ScrollProgress.tsx` | Portable to gronn as-is |
| Content-as-data | `src/lib/data/{projects,journal,services}.ts` | `src/lib/content.ts` + `src/lib/{archive,seedbank,patterns,...}.ts` | Same typed-data philosophy, different domain models |
| Naming convention | kebab-case files, lowercase dirs | PascalCase component files | Pick one before extracting shared packages (gronn's kebab-case suggested) |

## Key differences

| Area | gronn-studio | equilibrium |
| --- | --- | --- |
| Nature of site | Static brochure/marketing site — no backend, no accounts | Full web app: accounts, members area, admin, contributions, payments |
| Next.js | **16.2.10** (pinned) | **^15.5.0** |
| React | 19.2.4 (pinned) | ^19.1.0 (range) |
| three.js | ^0.185 | ^0.180 |
| Scroll choreography | Framer Motion only | Framer Motion **+ GSAP ScrollTrigger** (scroll-scripted 3D "Core") |
| API routes | None — fully static; contact form posts browser-side to FormSubmit | ~20 route handlers: auth, uploads, checkout, webhooks, garden, contributions, waitlist, calendar export |
| Auth | n/a | Custom HMAC-signed session cookie (no JWT lib) + Google OAuth + one-time login tokens |
| Payments | n/a | Stripe (checkout, billing portal, webhook) |
| Storage | n/a | Two-backend pattern: Upstash Redis / Vercel KV in production, `.data/*.json` locally; file uploads via `@vercel/blob` |
| Theming | `next-themes` class strategy, four palettes | Custom `themes.ts` (no next-themes) |
| Icons | `lucide-react` | None (hand-drawn SVG line-work) |
| Class utilities | `clsx` + `tailwind-merge` | None |
| Linting | ESLint 9 + `eslint-config-next` (`npm run lint`) | No linter configured |
| Testing | None | Playwright-core e2e suite (`npm run test:e2e`): library, seedbank, legal, creators, admin, roles, members, money |
| Build pipeline | Plain `next build` | `prebuild` generates archive index + seedbank JSON; extra scripts for data checks and placeholder generation |
| Analytics | None | `@vercel/analytics` |
| Fonts | Syne (local) + Montserrat + Geist Mono (Google) | Syne (local) only |
| `next.config.ts` | www→apex 308 redirect for canonical host | `reactStrictMode`, extra `fastly.picsum.photos` image host |
| Node types | `@types/node` ^20 | `@types/node` ^22 |

## Convergence notes (toward one brand)

- **Version skew is the first blocker**: gronn-studio runs Next 16,
  equilibrium Next 15. Align equilibrium to Next 16 (checking App Router
  API changes) before sharing components, and align three.js to ^0.185.
- **Porting direction**: brand primitives (theming tokens, reduced-motion
  hook, i18n provider, cursor, motion components) should flow
  **gronn → equilibrium**, since gronn-studio carries the canonical brand
  language. App capabilities (auth, Stripe, blob storage, e2e harness,
  ScrollProgress) flow **equilibrium → gronn** if/when the main site needs
  them.
- **Shared-code strategy (decided 2026-07-19)** — in order:
  1. **Now**: finish roadmap Phase A1 (equilibrium adopts gronn's semantic
     tokens). That alone makes components copy-paste portable between the
     repos — for two sites that is ~90% of the benefit of packaging at 0%
     of the cost. This cross-reference table is the sync ledger: when a
     parallel file changes in one repo, port or note the divergence here.
  2. **Not yet**: published npm packages (`@gronn/ui` etc.). Rejected at
     current scale — every tweak would become edit → build → publish →
     bump in both repos → redeploy, Vercel builds would need private
     registry auth, shared components still depend on repo-local plumbing
     (`useT()`, `BUSINESS`, semantic tokens), and the Next 15/16 skew
     makes peer deps awkward.
  3. **Later, on a trigger**: the day a third surface appears (client
     portal, second brand site) or manual syncing becomes a burden, move
     to a **monorepo** (pnpm workspaces + Turborepo: both sites +
     `packages/ui` in one repo, native Vercel support) rather than
     published packages — same code-sharing, no publish loop.
- **Operational surface**: equilibrium needs env vars and external services
  (Stripe, Redis/KV, Blob, Google OAuth — see its `docs/LAUNCH.md`);
  gronn-studio needs none beyond Vercel itself. Any code ported into gronn
  must not drag those dependencies with it.

# ARCHITECTURE

The load-bearing structures, and why they hold. Anything here breaks
loudly and in several places at once if it is touched carelessly.

---

## Shape

A statically generated Next.js site on Vercel. No server to run, no
database to back up. Production follows `main`; every push deploys.

```
package.json ──► /stack               versions, read never typed
src/lib/data ──► content document ──► every page
src/lib/nav  ──► bar · dock · tablet menu · footer
src/lib/timevault ──► TimeVault ──► /stack Evolution
```

Each arrow is one direction on purpose. A page never writes back into
the structure it renders.

## One source per thing

| Thing | Source | Read by |
| --- | --- | --- |
| Navigation | `src/lib/nav.ts` | bar, dock, tablet menu, footer |
| Breadcrumb trail | `trailFor()` in `nav.ts` | JSON-LD **and** the visible `<ol>` |
| Technologies | `src/lib/stack.ts` | `/stack`, and TimeVault's `tech` keys |
| History | `src/lib/timevault.ts` | the Evolution timeline |
| Business identity | `src/lib/business.ts` | footer, legal pages, JSON-LD |
| Prices | `src/lib/data/pricing.ts` | every menu, every service page |

The breadcrumb one is the clearest case of why: the structured data
promised search engines a trail that no page displayed, and each route
hand-wrote its own array. Now both read one function, and a test
compares the rendered list to the emitted JSON name for name.

## Content: typed data, overridden by a document

Structure lives in code and cannot be edited. Prose lives in a content
document in blob storage, seeded from the code, and can. With no
document at all the site still builds and renders — the typed data is
the fallback, not a stub.

## Theming

Ten palettes in two sets behind two labelled switchers. All colour flows
through semantic tokens in `globals.css`; nothing theme-dependent is
hardcoded (the photo-glass screen is the one acknowledged exception, and
it is documented where it lives).

Adding a palette means **three** edits: the token block, the
`@custom-variant dark` list, and the catalogue in `themes.ts`. Miss the
second and every `dark:` utility silently does nothing.

Two things break if touched carelessly:

- the pre-paint script in `layout.tsx` seeds next-themes' storage from
  the clock **before** its script runs, and must stay ahead of
  `<Providers>` or auto visitors get a flash of the wrong ground;
- `ThemeModeProvider`'s sync effect gates on a **live `localStorage`
  read**, not the render-time `mode` — during hydration `mode` is still
  the server snapshot `"auto"`, and trusting it overwrites a returning
  visitor's saved override.

## Locales

Client-side EN/NL over `[locale]` routes with middleware rewrites. Every
user-facing string is `{ en, nl }`, resolved with `useT()` on the client
and `getT()` on the server. Pages split into a server `page.tsx` for
metadata and a client `*-content.tsx` for the rest.

`UNLOCALIZED` in `src/lib/locale.ts` lists the routes outside that tree
— `/editor`, `/admin`, `/api`. **A route linked from anywhere but
missing here 404s in Dutch and passes review in English.** That has
happened; see `PROBLEMS.md`.

## The quality gate

```
tsc --noEmit → eslint → check-contrast.mjs → next build → playwright
```

122 colour pairs, and end-to-end tests against the real production build
with axe scans inside them. Nothing merges without walking through it.

## TimeVault's own shape

```
git                     what changed
  ↓
TIMEVAULT/entries/      why, in full
  ↓
src/lib/timevault.ts    the curated event, with its provenance status
  ↓
/stack → Evolution      what a visitor sees
```

Events name technologies with the same keys `/stack` uses, so the join
between the two pages needs no second list of names. `eventsForTech()`
walks it in the other direction, which is what lets a technology card
show when it became relevant.

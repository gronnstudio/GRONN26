# 2026-08-25 — Deel 5: prijzen en dienstpagina's

Source: Deel 5 ("Website-implementatie", §5.1–5.8) of the studio's
*Verdienmodellen* working document, Aug 2026. Full translation of that
part into this codebase: [`deel-5-website-implementatie.md`](../deel-5-website-implementatie.md).

## Shipped

§5.3 — published prices and per-service pages. Five seasonal services
added (leaf net, autumn pond service, winterising, pond survey,
stewardship), each with a price, a "what you do not get" block and a
service-area postcode check. `/services/[slug]` detail pages, grouped
overview, real `priceSpecification` in JSON-LD, terms updated.

## Decisions worth keeping

**Prices are committed data, not editable content.** `src/lib/data/pricing.ts`
is keyed by service slug and deliberately *not* a field on `Service`.
The editor's popover (`src/editor/toolbar.tsx`) renders exactly two
textareas for `en`/`nl`, so a numeric field would publish into the Blob
document and strand there as half-editable. The cost is real and was
accepted knowingly: **the owner cannot change a price without a
deploy.** The copy around a price stays editable, because it is `L`.

**Design and seasonal work are listed apart** (`Service.kind`). A
visitor arrives for one or the other. Mixing eleven entries into one
list made both harder to read, and the homepage stack was never
designed to hold eleven cards — it now renders design work only.

**`areaServed` narrowed.** `schema.ts` claimed the whole of the
Netherlands. That was defensible for a design practice and became an
overclaim the moment the studio started selling work that arrives in a
van. Now Country + AdministrativeArea (Limburg).

**The "no price" rule in `schema.ts` was rewritten, not broken.** Its
header comment forbade emitting prices. That rule existed because there
were no real prices; there are now, and they are the same figures the
page shows. A service with no entry in `pricing.ts` still emits none.

## Rejected / not done

- **Turnstile on the new endpoints** — not in this round, and argued in
  the plan doc: it would be the site's first third-party script, forces
  open a CSP that has not been staged, and adds a processor to a privacy
  statement already needing a rewrite. Measure abuse first.
- **A booking calendar (Cal.com embed)** — the source document offers it
  as an option alongside "a form with preferred time slots, confirmed by
  hand". Took the simpler one: the studio is one person, and an embed is
  another third-party script on the two pages that convert.
- **A dedicated subscription comparison page** (§5.6) — out of scope
  this round. The subscription is listed as a service with its three
  tiers; the emphasis-card page is winter work. Note for whoever builds
  it: the source specifies an orange `#FF5B04` "meest gekozen" card,
  which is **not** a token in this repo — a filled ember surface under
  white text must use `--gronn-ember-strong` (#c74100), per CLAUDE.md.

## Found while working, not fixed here

These are real and predate this change. Kept out of this PR because
AGENTS.md §1 forbids combining unrelated refactors.

1. **The IBAN ships in the client bundle.** `src/lib/business.ts:20` is
   imported by `privacy-content.tsx`, which is `"use client"`. No
   paragraph prints it, but it is recoverable from the JS chunk. KVK,
   BTW and address are properly public for a Dutch business; an IBAN is
   a known invoice-fraud input and does not need to be on a marketing
   site.
2. **Three privacy claims are already untrue** — the processor list
   still names picsum.photos (removed), "uses no analytics" sits next to
   a mounted `<SpeedInsights />`, and "two functional preferences"
   undercounts at least seven storage keys.
3. **`src/middleware.ts` is on a deprecated convention.** Next 16
   renamed `middleware` to `proxy`; there is no `middleware.md` in the
   bundled docs any more. It still works.
4. **The editor upload route's size check enforces nothing.**
   `Number(content-length ?? 0)` lets chunked, absent and non-numeric
   headers all through, and the advertised 8 MB sits above Vercel's own
   body limit anyway. Owner-only today, so not urgent — but it must not
   be the basis for visitor uploads.

## Verified

`tsc --noEmit`, `eslint src scripts tests`, `check-contrast.mjs`
(122 pairs, 0 failing), `next build` (22 service paths generated),
`playwright test` (23 passed). Axe now covers `/services`,
`/services/pond-autumn-service` and its `/nl` twin; the new price table
initially failed the `definition-list` rule and was restructured so the
tier note sits inside its `<dt>`.

Not yet verified on the Vercel preview at the time of writing — that is
the owner's review step, on a phone, per CLAUDE.md.

# PROBLEMS

What broke, why, and what stops it happening again. The pattern matters
more than the individual bug.

---

## The recurring one: building is not looking

Three defects in one week shipped or nearly shipped because the check
performed was "does it build" rather than "what does it look like".

- **The studio panel** put seven principles into a four-column grid
  inside a half-width column while the left column sat half empty. The
  owner: *"ziet gewoon brak uit … deze foutjes kunnen gewoon voorkomen
  worden door kritisch te kijken."*
- **The install prompt at `z-[62]`** covered an open modal dialog
  mid-read. Found only by screenshotting each panel at phone size.
- **The tablet gap** (below) was measured at 1280 and 1600 and never at
  900.

**What stops it** rendering screenshots via a throwaway Playwright spec
and measuring geometry in the browser with `getBoundingClientRect`, on
every visual change. That is how the header collision, the cramped
principles and the install-prompt overlay were each established.

## The tablet gap, closed twice

`md`–`lg` (768–1024px) had no navigation at all: the bar carried only
Services below `lg`, the dock is `md:hidden`, and the hamburger that
bridged the band left with the full-screen curtain.

**PR #76 closed this in July. PR #80 reopened it.** It was found because
the owner looked at a tablet, not because anything failed.

**What stops it** an end-to-end test that states the width out loud: at
900px, assert the bar is *not* carrying the sections, then that the Menu
opens all five, then that one navigates.

## The icons that were "restored" three times

The owner asked for the old dock icons back. The **drawings** were
restored — and the **line-up** was left alone, so nothing changed on the
row he was actually looking at. #81 had replaced Home and Journal with
Studio and Projects; no amount of redrawing paths could put the house
and the field-note page back.

He asked three times before the real cause was found.

**What stops it** the line-up is now written explicitly in
`mobile-dock.tsx` with a comment saying it is the owner's and is not to
be re-derived from `SECTIONS`.

**The wider lesson** when someone repeats a request, the fix that was
applied did not address it. Re-read what they are looking at rather than
re-applying the same change harder.

## `/nl/admin` returned 404, twice

`/admin` was linked from the footer, the curtain and the dock in #78 but
never added to `UNLOCALIZED` in `src/lib/locale.ts`. It survived review
because `localePath("en", …)` returns the path untouched and every
screenshot was English.

The first fix corrected the **links**. The owner hit it again from a
bookmark — because the **URL** still 404'd. The second fix added a 308
redirect in the middleware.

**What stops it** tests in both locales, plus a sweep asserting that
nothing anywhere on a Dutch page links into a localized owner path.

## Framer-motion traps, each paid for once

- **`AnimatePresence mode="wait"` with five conditional siblings** holds
  the incoming panel until the outgoing one exits, then never mounts it.
  Fixed with one card and a changing `key`.
- **`whileInView` never fires** on elements that start fully clipped by
  an `overflow-hidden` mask. Observe an unclipped parent and drive
  children through variants.
- **SVG `style` fills are cached.** Put changing SVG colours in CSS
  classes, not the `style` prop.
- **Hover opened a panel and the click closed it**: `onPointerEnter` set
  the open id, so `onClick` read it as already-open and toggled. Fixed
  with a `hoverOpened` ref.

## A modal that was not modal

Both dock dialogs carried `aria-modal="true"` while the dock stayed lit
and interactive above them — including the grid button that closes the
sheet. `aria-modal` tells a screen reader that everything outside the
dialog does not exist, so it was hiding the control needed to get out.

**Fixed** non-modal dialogs, with focus contained across both containers
instead: `useFocusTrap` takes an optional second root.

## Focus landing on a detached node

When the dock's row swaps between its closed and open forms, the trigger
button is a *different DOM element* by the time focus should return to
it. Focusing the old one puts focus nowhere.

**Found by** the existing "Escape restores focus" test going red. It was
fixed rather than papered over: the trigger is looked up again once the
row has re-rendered.

---

## The contact rail sits on the content, site-wide

The quick-contact rail is `fixed` at `left: 1.25rem` and about 36px
wide. The page container is `max-w-7xl` (90rem) with `px-4`, so at any
viewport up to roughly **1472px** the content's left gutter is only
16px and the rail lands on top of it.

Visible on every section of every page once the rail appears — the
TimeVault figures panel simply made it obvious, because a large number
went behind it.

**Not fixed here.** It is global chrome, and `AGENTS.md` §1 forbids
combining unrelated refactors into a feature PR. It belongs to the UI/UX
revision, whose brief already names "overlapping controls" as a thing to
find. Recorded so it is not rediscovered from scratch.

## Repaired on 27 August 2026 (#89)

All five were re-verified against `main` that morning, then fixed
together in one round. Each had been reported when found and kept out of
its own PR's scope under `AGENTS.md` §1 — never combine unrelated
refactors. Left here rather than deleted: what was wrong is the part
worth remembering.

- **The IBAN shipped in the client bundle.** Worse than first recorded:
  `business.ts` was imported by `privacy-content.tsx`, `terms-content.tsx`
  **and the footer**, which is on every page — so the number was in the
  shared chunk, findable without opening a page that displays it. The
  fix is `lib/business-private.ts`, which throws if evaluated in a
  browser; `/admin` reads it server-side after its session check.
  Verified on a clean build: nothing in `.next/static`, nothing in the
  prerendered HTML.
- **Three claims on `/privacy` were false.** picsum.photos named as a
  processor (images self-hosted in `public/ph` for weeks); "uses no
  analytics" beside a mounted `<SpeedInsights />`; "two functional
  preferences" where there were closer to nine. The replacement names
  them by purpose rather than by count, because a count goes stale the
  next time one is added — which is exactly how this went wrong once.
- **`src/middleware.ts`** used Next 16's deprecated convention. Renamed
  to `src/proxy.ts` per the documented migration.
- **The editor upload's `content-length` check** enforced nothing:
  omitting the header made `Number(null ?? 0)` pass. Bytes are now
  counted off the stream and the body cancelled at the first chunk over
  the limit.
- **The tap-target test read `::after`** while the utility draws
  `::before`, so its exemption never applied to anything and it passed
  regardless. It now reads the right pseudo-element and the size that
  pseudo-element claims.
- **`/` opened search with no way to switch it off** — WCAG 2.1.4
  Character Key Shortcuts, Level A. The whole single-key set now sits
  behind one switch beside motion and underlines. `⌘K` stays
  unconditional: it holds a modifier, and 2.1.4 does not cover chorded
  shortcuts.

## Known and unrepaired

Nothing from the August audit. Two things stand, neither a defect in
shipped behaviour:

- **The contact rail overlaps page content below 1472px.** Site-wide.
  Belongs to the UI/UX revision round, which has not started.
- **Four comments still say "middleware"** where the file is now
  `proxy.ts` (`header.tsx`, `mobile-dock.tsx`, `locale.ts`, `stack.ts`).
  They describe the concept rather than the file, so nothing is broken —
  but they will read as wrong to the next person who greps for it.

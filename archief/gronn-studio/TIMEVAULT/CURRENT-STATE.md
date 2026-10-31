# CURRENT STATE

**28 August 2026.** `main` at `49173c2`, deployed to production.

## Live

https://gronn.studio — production follows `main`; every push deploys.

Seven public pages plus eleven service pages, English and Dutch on
separate indexable URLs, ten palettes in two sets, an owner panel at
`/dashboard`, an on-site editor at `/editor`, and a client portal at
`/clients`.

## In flight

**#88 — the site speaks the visitor's language.** An unprefixed path was
English, always; it now reads `Accept-Language` and sends a Dutch
browser to `/nl`, and the moment the visitor picks a language the
guessing stops permanently — the same contract the theme's clock has.
Open, green, merged up onto the renamed `proxy.ts`. Held deliberately:
it changes what a first-time visitor sees, so the owner looks first.

**TimeVault on tablet and phone.** #87 shipped desktop-only by
instruction. The full experience is to be established at 1280–1920px
before any translation down.

## Waiting on the owner

- DMARC at `p=none` — SPF and DKIM are live, this is the sluitstuk
- Real project photography and copy — every project and journal entry is
  still placeholder fiction
- Sitemap submitted in Search Console
- Legal review of `/voorwaarden`, which ships as a draft
- Old Hostinger hosting cancelled, if it still runs
- A backup domain-contact address at TransIP

## Blocked on one decision

Live chat, option C (shared inbox). Chosen, not planned. Two things
hanging off it:

- **The stamp should open the chat.** Three problems first: it carries
  brand words and no verb, it exists only on the home page, and it is
  `hidden md:block` — invisible on the device most visitors arrive on.
- **The cookie notice is on ice** and must return before any chat
  widget, analytics with a visitor identifier, marketing pixel, or
  third-party embed ships.

## Known and unrepaired

The August audit is paid off — #89 merged and deployed, see
`entries/2026-08-27-security-and-integrity.md` and the repaired list in
`PROBLEMS.md`. The IBAN is out of everything a browser can request;
verified on a clean build, not assumed from the merge.

What still stands is one layout defect: the contact rail overlaps page
content below 1472px, site-wide. It belongs to the UI/UX revision round.

## Ready to build

- Pond diagnosis (Deel 5 §5.1) — not started, not blocked
- The UI/UX revision — briefed, starts with an audit, not with code
- Deel 5 PR 3 and 4 — blocked on Supabase, and on Resend plus DNS

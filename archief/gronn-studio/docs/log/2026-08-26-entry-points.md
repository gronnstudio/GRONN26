# 2026-08-26 — Entry points follow the two-family structure

Three owner asks in one round, all about the site's doors and how they
are labelled.

## 1. The intake form splits by family

`"start een project" moet ook worden aangepast op deze nieuwe structuur,
maak een twee splitsing hierin, dat laat ik aan jou.`

Step 1 used to be a flat list of seven project types (`PROJECT_TYPES`) and
step 2 a list of seven situations (`SITUATIONS`) — both written before the
practice split into design and seasonal work. They now read:

1. **Which half are you here for** — the two `SERVICE_GROUPS` as cards,
   each carrying the sentence that says what it is for.
2. **Which service** — the services in that family, with their from-price.

Same four steps, better answers, and it says the same thing the rest of
the site now says. `ChipGrid` fell out of use and is gone.

**Judgement call, open to reversal:** the CTA text stays *"Start een
project"*. The split is behind the door rather than in it — the button is
the established brand phrase and the higher-value path, and two buttons in
the bar would crowd it. What did change is the contact page's own label,
from "Start een project" to **"Begin hier"**, because the page now also
books a dated job and should not promise only projects.

## 2. The contact page stops repeating the footer

The page ended with the studio's email and phone, then its name, address,
KVK and BTW. All of it is in the footer of every page, this one included —
the same details twice within one screen. Removed; the page is the form.

`pages.contact.direct` went with it. Nothing rendered it any more, and an
unrendered content field cannot be edited in `/editor`, so leaving it would
have been dead weight in the document.

## 3. Admin joins Editor, and the menu says what things are

`/admin` was reachable only by typing the URL. It now sits beside the
editor in the footer, the curtain and the phone dock.

Both were previously filed under **Legal** in the footer, which said
nothing about what they are. They now have their own group, **"Alleen voor
de eigenaar"**, with one line explaining that both sit behind the studio's
Google sign-in and hold nothing for visitors — and one line each on what
they do (`Site-editor`: the website's words and pictures; `Admin`: quotes,
invoices, paperwork).

Listing them publicly is deliberate and safe: `src/lib/auth.ts` gates both
on a single-address allowlist, enforced again in `getEditorSession()`.

The curtain's seven destinations each gained a one-line annotation. Home
did not — it needs no gloss. Same reasoning as the mega menu: a bare word
is only obvious to someone who already knows the site.

## Verified

`tsc --noEmit`, `eslint src scripts tests`, `check-contrast.mjs` (122
pairs, 0 failing), `next build`, `playwright test` (25 passed).
Screenshotted the new first step and the curtain at 1280px in Dutch.

## Note for whoever picks this up next

The phone menu still cannot reach the eleven services directly — the
curtain lists the two families, which land on `/services#design` and
`/services#seasonal`. A drill-down is designed and waiting (see
[`2026-08-26-mega-menu-card.md`](2026-08-26-mega-menu-card.md)); it is not
rejected, just not started.

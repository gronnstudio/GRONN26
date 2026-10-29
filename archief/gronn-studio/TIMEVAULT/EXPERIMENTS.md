# EXPERIMENTS

Tried. Some kept, some dropped within hours. The dropped ones are the
useful half of this file — without them the same idea comes back every
few months wearing a new hat.

---

## Kept

**View transitions between card and case study** (#57). The project you
click becomes the page you land on. The clearest single piece of craft
on the site.

**The 3D terrain, built late** (#41). Three tiers — mobile-lite, WebGL,
reduced-motion. Built only when the browser is idle and the viewport is
close, paused when it leaves. The pattern generalised into the rule for
every heavy piece since.

**App mode** (#60). Installed to a home screen the site behaves as an
app in its own right, side by side with the website rather than
replacing it.

**The recording blur** (#34, #36). A password-gated blur over the
business credentials, so the owner can record the screen without
exposing an IBAN. It boots with the page rather than after it.

**Time-of-day theming** (#48). The site reads the visitor's clock until
they choose for themselves. Choosing anything stops the clock driving,
permanently, until Auto is picked again.

**The dock's tuck** (#62). Wings fold away while reading and return on
an upward flick. Instagram's idea, adapted.

---

## Dropped

**The tilt sheen on the dock** (#22 → #23). Added and removed the same
day.

**Removing the header on phones** (#26 → #29). The header went, then
came back slimmed to the logo alone. Removing a thing entirely is rarely
the same as making room.

**The pinned horizontal gallery on phones** (#27 → #28 → #30 → #33). Four
attempts in one day: clear the dock beneath it, then swap to a grid,
then link the card slide to page scroll, then serve that glide to all
phones. The pinned version clipped on phones and no amount of adjustment
fixed it.

**Sanity CMS** (#10 → #53). Built as a foundation, never wired up, left
dormant for six weeks, then removed as a dead second content path.

**A server-side relay for the contact form** (#3 → #4). Not a style
choice: FormSubmit 403-blocks datacenter IPs. Proven with UA and origin
diagnostics, then deleted.

**"Marl" and "Peat"** (#48). Two palettes rejected. A mid-value tinted
ground reads muddy however good its numbers are.

**The shared-ground icon set** (26 Aug → 26 Aug). Five icons rebuilt on
one construction rule, then reverted the same day. See `DECISIONS.md`.

**A test asserting both owner routes answer under 400.** Written and
removed in the same session: `/editor` returns 500 in CI, where NextAuth
has no credentials. An assertion that fails for a reason it does not
name is worse than no assertion.

---

## Deferred, not rejected

From closed PRs #1 and #2, gated behind performance work and never
picked back up: survey-frame, mist-veil, a pinned garden-through-time,
and a form success moment. Shader terrain was deferred until the
performance gates were green — they have been since 27 July, and nobody
has gone back for it.

**B1 terrain choreography** was archived by owner decision (#52) rather
than dropped. It is in the campaign document.

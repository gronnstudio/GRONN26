# UX / UI

The design rules, and the feedback that produced them. Almost every rule
here started as the owner rejecting something, which is why the
rejections are kept with the rules.

---

## The five standing rules

### 1. End-user clarity over cleverness

Every control needs a visible label a first-time visitor understands.
**Came from** four unlabelled theme dots. Insider iconography cannot be
decoded by the people the site is for.
**Applied since** the theme switch is one labelled cycle button; the
tablet menu says "Menu" beside its hamburger rather than three bare
lines.
**One acknowledged exception** the accessibility glyph in the control
pill, at the owner's own request. The label moved rather than vanished:
`aria-label` on the button, and the word as a heading inside the panel.

### 2. Small and precise beats big and decorative

**Came from** oversized outlined marquees and clipart illustration, both
rejected as "cheap" and "look like shit".
**The working language** fine line-work, mono-font field annotations,
survey marks, restrained motion.

### 3. Green carries structure; ember answers the hand

Signal Ember (`#f95a08`) is for hovers, arrows, markers and the cursor —
interaction, not decoration. As a filled surface under white text it
becomes `--gronn-ember-strong` (`#c74100`), because pure ember cannot
carry a white label at AA.

### 4. Every animation has a reduced-motion fallback

Not a media query bolted on afterwards: the stored preference beats the
OS in **both** directions, so someone can calm this one site without
changing a system setting, or watch the terrain move despite one.

### 5. Mobile is a first-class experience

Scroll-driven pieces run on phones in lighter tiers, never hidden.
**TimeVault is a stated, sequenced exception** — desktop first by
instruction, and even so it renders a plain readable list below `lg`
rather than nothing.

---

## What the owner has rejected

Each of these came back as a rule.

- **Clipart illustration** in the hero — abstraction and photography only.
- **Giant marquee text bands** — "looks crap and cheap".
- **Unlabelled icon controls** — became rule 1.
- **A full editorial colour-block redesign** — reverted; kept on the
  `design/editorial` branch. Do not merge it.
- **"Marl" and "Peat"** — a mid-value tinted ground reads muddy however
  good its contrast numbers are.
- **The shared-ground icon set** — consistent and unreadable at 22px.
- **A grid button repeating the dock's own five icons** — the same thing
  twice on one screen.

---

## Clickability, which this site got wrong twice

**The complaint** *"het is niet duidelijk welke klikbaar zijn, welke
niet — 'who is behind gronn', dan is er 'the studio' dat is wel een
link, maar er zit zoveel ruimte tussen dat ze niet verwant lijken."*

Headings and links were set in the same face at nearly the same size,
and nothing said which rows would respond.

**Fixed by** an ember arrow leading every link row — the arrow is the
affordance; non-clickable headings toned down in colour; and a
permanent link-underline preference in the accessibility panel, which
fixes it everywhere at once for anyone who needs it.

**And its inverse** a breadcrumb that links to the page you are already
on is the same confusion from the other side. The last crumb is a label
with `aria-current="page"`, never a link.

---

## Disclosure or dialog — the distinction that matters

- **Bar panels and the tablet menu are disclosures.** No focus trap; Tab
  walks out and closes them on the way; Escape restores focus to the
  trigger.
- **The dock sheet, the dock's section panels and search are dialogs.**
  Focus contained — but *not* `aria-modal`, because the dock stays lit
  and live above them.

Getting this backwards is how a menu becomes a trap.

---

## Motion vocabulary

- `orbit-ring` — the ember comet riding a pill's edge. The site's one
  attention cue. Freezes under reduced motion.
- View transitions — a project card's photograph becomes the case
  study's hero. Two pages, one movement.
- The dock's tuck — wings fold away while reading, return on an upward
  flick.
- Panel cards — a short drop and fade, 0.28s, one shared component so
  the bar and the tablet menu cannot drift on radius or shadow.

**Avoided** parallax for its own sake, constant animation, transitions
that delay a click.

---

## Typography

Syne for headings, semibold — **only SemiBold ships**, so `font-bold`
would synthesise a weight and is forbidden (#85). Montserrat for body.
A mono face for field annotations: section labels, prices, crumbs,
status marks.

A menu item **is** a heading and is set in the heading face. In body
medium it sat at almost the same weight as its own note underneath, so
the two read as one grey block and the hierarchy vanished.

# RESEARCH

Questions that were actually investigated before a decision, and what
was found. Not a reading list — a record of what changed someone's mind.

---

## What makes a dark theme readable rather than merely dark?

**30 July 2026** · fed into the ten palettes and the contrast auditor

**Investigated** why a pure-black ground is the wrong floor; how
elevation should be expressed when there is no light to cast a shadow;
why a saturated accent that works on white vibrates against dark.

**Found**

- **Never a pure-black ground.** Material's floor is `#121212`, because
  black under bright content pushes contrast to eye-strain levels and
  smears for readers with astigmatism. The `.dark`/Night palette
  predates this finding and is kept deliberately.
- **In dark mode, elevation is light.** A raised surface is *lighter*
  than its background, never shadowed. So the `surface` token sits above
  `background` in value, which is the opposite of the light palettes.
- **Accents desaturate on dark grounds.**
- **Light grounds stay high value and low chroma.** A mid-value tinted
  ground reads muddy however good its contrast numbers are — which is
  exactly how the rejected "Marl" failed.

**Decided** the palette rules above, plus an auditor that parses the
shipped tokens so no future palette can quietly break them.

---

## Is a resting-state contrast score enough?

**31 July 2026** · fed into the auditor's scope

**Investigated** what Lighthouse actually measures.

**Found** Lighthouse only measures the **resting** state. A `:hover` or
`:active` colour it never sees can still fail. White on Signal Ember sat
at 2.99:1 under a perfect score of 100.

**Decided** the auditor checks every declared pair, not the rendered
page. Also: non-text UI needs 3:1, small text 4.5:1 — and a 12px
`text-muted/70` label measured 3.43:1, which is why it moved.

---

## How should one navigation structure carry every viewport?

**25–27 August 2026** · fed into the whole navigation rebuild

**Investigated** navbar.gallery, a collection of real navigation bars,
sent by the owner as the reference to reach for before proposing a
shape; biovijver.nl, a Dutch pond retailer, for how a catalogue is
actually shopped; GitHub's platform menu, for the floating-card shape.

**Found** the structure has to be **data, not markup**. Every surface
that renders it can then differ in shape without differing in content.
A menu written per surface drifts, and this project's three had already
drifted: the dock's primary list held four items where the bar held
five, and its secondary list put Projects and Contact between Privacy
and Terms.

**Decided** `SECTIONS` in `src/lib/nav.ts`, read by every surface.

**Note** navbar.gallery could not be fetched from the build environment
on 27 August — the network policy blocked it. The reference is recorded
for a human to open; nothing in the rebuild claims to have read it.

---

## What does a shared WhatsApp inbox actually cost?

**26 August 2026** · fed into the live chat decision, still unbuilt

**Investigated** WhatsApp Coexistence, message pricing by market, and
three shared-inbox vendors.

**Found**

- **Coexistence** (since May 2025) lets one number run the app and the
  Cloud API simultaneously — but a 14-day gap in app activity severs the
  API link.
- **From 1 October 2026 service messages become billable.** The
  Netherlands is the most expensive marketing market, roughly
  €0.13–0.15 per message.
- Vendors range from about $19/month to €299/month for the tier that
  includes WhatsApp.

**Caveat, stated at the time** several vendor pages were blocked by the
environment's network policy and could not be read directly. Verify the
pricing before committing.

**Decided** option C, a shared inbox. The plan is still unwritten.

---

## Where does this repository's history actually begin?

**27 August 2026** · fed into TimeVault's provenance model

**Investigated** `git rev-list`, the earliest commits, and the day logs
in `docs/log/`.

**Found** 62 commits, the first on **20 July 2026 at PR #21** — by which
time the site was already live on its own domain. The first ten days
exist only in `docs/log/2026-07-10--19-initial-build.md`, written at the
time. PRs #1–#20 are not in this history at all.

**Decided** a status on every event, shown on the public timeline rather
than hidden: `verified` when commits back it, `reconstructed` when only
the logs do. An honest gap is worth more than a confident guess.

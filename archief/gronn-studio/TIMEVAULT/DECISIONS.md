# DECISIONS

Choices that constrain everything after them, with what they cost. A
decision without its trade-off is just a preference with better
lighting.

Reversed decisions stay here, marked. Removing them loses the reason
they were reversed, which is the expensive half.

---

## One animation library

**Chose** framer-motion, and no second one.
**Why** Two motion systems means two ways to express the same movement
and two sets of reduced-motion fallbacks to remember.
**Cost** Some timeline-style choreography is harder without GSAP.
**Standing** — from the master brief, 10–19 Jul.

## Content in a document, not a CMS

**Chose** a content document in blob storage, seeded from typed data in
the code, edited in place on the live site.
**Why** The typed data stays the source of structure and the fallback,
so the site still builds and renders with no document at all. Nothing
new to pay for, back up or log into.
**Cost** No editorial workflow, no versioning, no second editor.
**Standing** — 20 Jul. A Sanity foundation was built alongside, left
dormant, and removed 1 Aug (#53) as a dead second path.

## Versions are read, never typed

**Chose** `/stack` reads names and versions from `package.json` at build
time.
**Why** A hand-typed version is wrong the first time a dependency is
upgraded. Reading it makes the page unable to lie.
**Cost** Versions cannot be edited in the editor. They are facts, not
copy.
**Standing** — 1 Aug (#47). The same rule now governs TimeVault
provenance: state what is verifiable, mark what is not.

## The contrast auditor parses the shipped CSS

**Chose** `scripts/check-contrast.mjs` reads the real token blocks in
`globals.css`.
**Why** A check that reads a copy of the palette drifts from the palette.
**Cost** Adding a palette means satisfying a script as well as an eye.
**Standing** — 31 Jul (#48). 122 pairs on every build.

## Tests drive a real browser

**Chose** end-to-end tests against the real production build, with an
accessibility scan inside them.
**Why** The defects this project actually produces are behavioural — a
panel that closes under the cursor, a focus that lands nowhere. No type
check sees those.
**Cost** The gate takes minutes, not seconds.
**Standing** — 1 Aug (#55).

## The theme follows the visitor's clock, not the sun

**Chose** a local-time split at 07:00 and 19:00.
**Why** Real sunrise needs a latitude, and a location prompt to pick a
colour is a wildly disproportionate trade.
**Cost** In midsummer the site goes dark while it is still light out.
**Standing** — 31 Jul (#48).

## The contact form posts from the browser

**Chose** direct submission to FormSubmit from the visitor's browser.
**Why** Not stylistic: FormSubmit 403-blocks datacenter IPs. A server
relay was built, proven impossible, and deleted (#3, #4).
**Cost** Validation and the honeypot are client-side, and the transport
is named in the privacy policy.
**Standing** — 19 Jul. Marked INTERIM in `OPERATIONS.md` §9.

## Published prices for seasonal work only

**Chose** seasonal work priced in the open; design work quoted per
project.
**Why** They are different products. One is a dated job with a known
scope; the other is months of thinking about a site like no other.
**Cost** A published price can be undercut. It also filters out the
enquiries that were never going to convert.
**Standing** — 25 Aug (#75).

## The navigation is data, not markup

**Chose** five sections in one file, read by the bar, the phone dock,
the tablet menu and the footer.
**Why** Four hand-written copies of one tree is four chances to drift,
and three had already been taken.
**Cost** Each surface needs its own rendering, which is more code than
one menu — but code that cannot disagree with itself.
**Standing** — 26 Aug (#81, #83).

## The dock line-up is the owner's, not derived

**Chose** Home · Services · + · Journal · grid, written explicitly and
not computed from the section tree.
**Why** It was derived from the tree in #81, which silently replaced
Home and Journal. The owner asked for the old icons three times before
anyone noticed that restoring the *drawings* changed nothing about the
*row*.
**Cost** One list that does not follow the tree, and a comment in the
file saying so.
**Standing** — 27 Aug (#86).

## TimeVault desktop first, deliberately

**Chose** establish the full desktop experience at 1280–1920px before
any tablet or phone version.
**Why** Owner instruction, 27 Aug: build it so the later question is
"how do we translate this?" rather than "what do we remove?"
**Cost** It stands against this project's own rule that mobile is a
first-class experience. It is a sequencing exception, not a repeal — and
below `lg` the section still renders a plain, readable, accessible list
rather than nothing.
**Standing** — 27 Aug (#87).

---

## Reversed

### The full editorial redesign — reverted

Merged once by misreading an instruction; the owner ordered an immediate
revert. Kept as the `design/editorial` branch. **Do not merge it.**
The lesson recorded at the time: read ambiguous requests narrowly.
"Push that up" is not "merge everything".

### The shared-ground icon set — reverted

Five section icons rebuilt on one construction rule: every icon standing
on a shared ground line with a survey instrument above it. Consistent,
and unreadable at 22px. The owner's verdict was that the icons "slaan op
oorlog" — they make no sense. Reverted 26 Aug.

The rule that came out of it: a family that coheres perfectly while none
of its five members says what it stands for has traded away the only
thing an icon is for. Tighten stroke and weight; do not swap subjects
for cleverer ones.

### The full-screen curtain menu — superseded

Replaced by panels hanging from the bar (#80). The replacement reopened
a tablet gap that #76 had closed in July, because it was measured at
1280 and 1600 and never at 900. See `PROBLEMS.md`.

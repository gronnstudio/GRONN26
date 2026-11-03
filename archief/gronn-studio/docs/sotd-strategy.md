# GRØNN — winning Site of the Day: mechanics, benchmarks, gap list

Companion to [`awwwards-plan.md`](awwwards-plan.md), which dissects four
reference sites and proposes patterns. This document covers the other half:
**how the award is actually decided**, what the world's most durable brands
do that a jury rewards, and an honest audit of where gronn.studio stands
against that bar today (2026-07-30).

Research date: 2026-07-30. Sources listed at the end.

---

## 1. How SOTD is actually won

Understanding the mechanism changes what is worth building.

- **Weighting: Design 40 · Usability 30 · Creativity 20 · Content 10.**
  Design and Usability together are 70%. A spectacular idea that stutters
  on a mid-range Android loses to a calmer site that is flawless.
- **A minimum of 18 jurors score each site**, and the three scores furthest
  from the average are dropped automatically. This is the single most
  important structural fact: **outlier enthusiasm is discarded, outlier
  hatred is discarded.** You do not win by making three jurors fall in love.
  You win by making fifteen jurors find nothing to mark down.
- **Honorable Mention is 6.5+.** SOTD sits above it, decided by the weighted
  average plus PRO-user voting.
- **Voting runs 5 days**, but a site with strong jury scores and 10+ PRO
  votes can take SOTD early. An approved site has **3 months** to win.
- Only validated Professional users' votes count.

**The strategic consequence:** our scoring ceiling is not set by our best
moment, it is set by our worst one. Every rough edge — a 40px tap target, a
placeholder photograph, a hover that does nothing on touch — is a deduction
applied by all eighteen jurors. This is why the B3/B4/B5 floor work
(performance, accessibility, mobile) was the correct thing to do before the
signature moments, and why it should be finished, not abandoned mid-way.

---

## 2. What the durable brands actually do

The brief was "top iconic brands." The useful finding is that the ones worth
learning from are not the loud ones — they are the ones whose restraint has
survived a decade of trend cycles. Four, and what each one implies for a
landscape studio:

**Apple — the gallery.** Whites, greys, aluminium; the product is lit like a
museum object and nothing competes with it. The lesson is not minimalism,
it is *hierarchy discipline*: on any given screen exactly one thing is
allowed to be the subject. GRØNN's equivalent subject is a garden
photograph. Today nothing on our pages is lit like a museum object, because
we have no object yet.

**Aesop — winning by doing less.** Aesop's site is mostly type, generous
margin, and a muted palette; its luxury reads as confidence. This is the
closest analogue to our declared visual language ("small and precise beats
big and decorative"). It is evidence that our instinct is right and that we
should resist the temptation to answer an award brief with more effects.

**Patagonia — the position is the headline.** Environmental commitment is
not a footer link, it is the narrative spine; content runs from product
origin to field story. This is the biggest *unclaimed* opportunity for
GRØNN. We are an ecological garden studio whose ecology is currently
implied by colour and 3D terrain rather than stated as evidence. Species
counts, water retention, soil recovery over three seasons — that is
Patagonia's move, and it converts our Content score (10%) and our Design
score (40%) simultaneously, because data becomes the layout.

**Nike — storytelling through people.** Athletes, not products. Our
equivalent is the client's garden in use, and the hands that made it. A
single honest portrait of Nick on site outperforms any amount of generative
foliage.

The pattern across all four: **the brand's substance is the design
material.** None of them decorate their way to distinctiveness. That maps
exactly onto our own rule 2 — and it is the argument for spending the next
effort on evidence, not effects.

The 2026 award-gallery trend reading agrees, for what it's worth: WebGL is
now used "for atmosphere instead of spectacle," motion is expected to carry
narrative rather than decorate, and restraint is described as intention
rather than emptiness. Our terrain scene and survey-annotation language are
already on the right side of that line.

---

## 3. Honest audit: where gronn.studio stands

Scored the way a juror would, from the live site as of 2026-07-30.

| Criterion | Weight | Standing | Reasoning |
|---|---|---|---|
| Design | 40% | Held back | The system is coherent — five palettes on semantic tokens, fine line-work, mono field annotations, real brand lockups. But every photograph is a picsum placeholder under a green wash. A jury reads that instantly, and it caps the largest single component of the score. |
| Usability | 30% | Strong | Lighthouse accessibility 100, mobile LCP ~1.1s after the boot-sequence rebuild, focus traps, skip link, reduced-motion parity, labelled controls, EN/NL on indexable routes. This is genuinely competitive and is our best asset. |
| Creativity | 20% | Partly banked | The Field Lab prototypes (ecosystem-disturbance simulation, growth-follows-you cursor) are real differentiators, but they live at `/lab` where a juror will never look. Nothing on the main path is unmistakably "only here". |
| Content | 10% | Weakest | Six projects, six journal articles, six services — all placeholder fiction. No real case study, no outcome data, no client voice. |

**Diagnosis:** we have built an excellent chassis and have not yet put
anything real inside it. The usability floor is close to award grade. The
two things standing between this site and a credible submission are both
content problems wearing design clothing.

---

## 4. The gap list, ranked by score impact per unit of effort

1. **Real photography** (owner action — the hard gate). Nothing below
   rescues placeholder imagery, and the green-wash treatment is drop-in, so
   the moment photographs exist the Design score moves without new code.
   Shot list per section and per project is the deliverable to ask for.
   *This has been the blocking item since 19 July and it remains the only
   thing that cannot be solved from the repository.*
2. **Promote one Field Lab prototype to the homepage.** The
   ecosystem-disturbance simulation is the strongest "only here" moment we
   own, and it is currently hidden. Moving it onto the main scroll converts
   banked work into Creativity score. Needs a mobile tier and a
   reduced-motion still.
3. **One real case study with outcome data.** Patagonia's move: species
   count before/after, water retained, materials reused. Turns Content from
   a liability into a design material — the numbers become the layout.
4. **Finish the floor (B5 mobile polish).** Tap targets and safe areas are
   deductions applied by all eighteen jurors. Cheap to fix, currently in
   progress.
5. **B1 terrain choreography.** The roadmap's headline item. High cost,
   high risk to the LCP work just banked, and it needs the owner's eyes on
   a preview as it is built — it is not a fire-and-forget task.
6. **Submission craft.** A flawless presentation — description, screenshots
   at 1440/1280/390, credits — is repeatedly cited as affecting outcomes.
   Budget ~€65–75, midweek timing, after photography.

---

## 5. What we should explicitly *not* do

- Do not add effects to answer the award brief. The jury's outlier-trimming
  means novelty for its own sake is discarded while its usability cost is
  not. Every one of the four reference brands wins by subtraction.
- Do not hide anything on mobile to protect a desktop effect (rule 5).
- Do not let a signature moment regress the boot sequence. Mobile LCP went
  from ~4.6s to ~1.1s; that number is worth more to the score than any
  hero animation.

---

## Sources

- [Awwwards — Evaluation System](https://www.awwwards.com/about-evaluation/)
- [Awwwards Review: Criteria, Pricing, and Categories (2026)](https://www.webdesignawards.io/awards/awwwards)
- [Award-Winning Web Design: Judging Criteria Decoded — Utsubo](https://www.utsubo.com/blog/award-winning-website-design-guide)
- [10 tips to win a Site of the Day on Awwwards — Elias Studio](https://www.elias.studio/en/blog/post/10-conseils-pour-gagner-un-site-of-the-day-sotd-sur-awwwards)
- [Best Award-Winning Websites 2026 (WebGL & Awwwards)](https://www.hontran.dev/blog/best-award-winning-websites-2026)
- [20 Inspiring Brand Websites: Learn What Makes Them Work](https://liveyourmessage.com/brand-website-examples/)
- [Web Design Trends 2026 — Figma Resource Library](https://www.figma.com/resource-library/web-design-trends/)
- [Best Architectural Design Websites — Awwwards](https://www.awwwards.com/websites/architecture/)

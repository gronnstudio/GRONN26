# Should gronn.studio move to Vue / Nuxt?

A decision record, so this question does not get re-litigated from scratch
on another account or in another session.

Asked 2026-08-01, in the context of the Awwwards SOTD campaign
([`sotd-campaign.md`](sotd-campaign.md)).

**Answer: no — and the award goal is the weakest possible argument for it.**

---

## The short version

Awwwards scores Design 40 · Usability 30 · Creativity 20 · Content 10. **Not
one of those criteria can detect a framework.** No juror sees whether the
HTML was rendered by React or Vue. A migration therefore buys exactly zero
score, while putting at risk the two things that currently *are* competitive:
Lighthouse accessibility 100, and the boot-sequence work that took mobile
LCP from ~4.6 s to ~1.1 s.

If the goal is the award, the framework is the one variable that provably
does not matter.

---

## What Nuxt would genuinely give us

Being fair to the question — these are real, not strawmen:

- **`@nuxtjs/i18n`.** We hand-rolled locale routing, typed `{ en, nl }`
  pairs, `useT()`/`getT()`, middleware and indexable `/nl/` routes. Nuxt
  ships that as a module. This is the single most legitimate point in
  Nuxt's favour — we built infrastructure that another framework gives away.
- **A simpler reactivity model.** No `useSyncExternalStore` gymnastics for
  reading `localStorage`, no `set-state-in-effect` lint rule to design
  around, and far fewer `useHydrated` guards scattered through components.
  We hit all three of those this session alone.
- **A smaller client runtime** — Vue's is roughly a third lighter than
  React's. Directionally useful, since our documented bottleneck is script
  evaluation and style/layout rather than bytes. But React Server
  Components ship less React in the first place, so in practice this is a
  wash rather than a win.
- **Nitro's deployment portability.** Irrelevant to us: we are on Vercel
  deliberately, and the editor depends on Vercel Blob.

## What it would cost

- **React Three Fiber → TresJS.** TresJS is genuinely production-ready, but
  the ecosystem around R3F (drei, gltfjsx, postprocessing) has no full
  equivalent. More importantly the terrain is not a naive scene: it carries
  a tuned deferred-mount, poster fallback and off-screen pause strategy
  that is directly responsible for the LCP number above. Rebuilding that
  correctly in a thinner ecosystem is the largest single risk in the whole
  migration.
- **Framer Motion → Motion for Vue / `@vueuse/motion`.** We have just
  centralised the easing vocabulary, and every animation carries a
  reduced-motion branch plus documented `whileInView` gotchas. All of it
  re-derived.
- **The GRØNN Editor, entirely.** NextAuth Google allowlist, `/api/editor/*`
  routes, Vercel Blob uploads, editable text/image components, instant
  publish. This is bespoke and would be a full reimplementation.
- **The whole verification surface.** Accessibility 100, focus traps, skip
  link, the ten-palette token system, the contrast auditor — all re-proved
  from zero.
- **Every word of institutional memory.** `CLAUDE.md`, the worklog and the
  session logs all assume Next. That knowledge does not port.

## The argument that settles it

`TECH-STACK.md` is kept byte-identical across `gronn-studio` and
`equilibrium` precisely so the two surfaces can converge, and `ROADMAP.md`
Part A is an active plan to align Equilibrium to GRØNN by *porting
implementations between them*.

Moving one repo to Nuxt would delete that porting map. Two surfaces of one
brand would need every shared concern — tokens, cursor, motion vocabulary,
labelled controls — solved twice in two languages, permanently. The
convergence goal and a framework migration are mutually exclusive, and
convergence is the one already committed to.

Note also that Equilibrium was itself a greenfield build, and it chose
Next. The moment to pick Vue has already come and gone once.

---

## When this answer should be revisited

Not "never" — but the trigger is not an award:

- If Nick hires or contracts **Vue developers**, DX for the people actually
  maintaining it outweighs everything above.
- If a **third, unrelated surface** is started from scratch with no need to
  share code with either existing repo.
- If we hit a **hard wall in Next or React** that has no workaround. We have
  not; the friction so far has been ordinary and solvable.

Cost of being wrong in the current direction: some React-specific
awkwardness we already know how to handle. Cost of being wrong after a
migration: a rebuilt 3D pipeline, a rebuilt editor, and a re-proved
accessibility floor, for a score that cannot see any of it.

---

## Sources

- [Nuxt vs Next.js: A Practical Comparison — DebugBear](https://www.debugbear.com/blog/nuxt-vs-next)
- [Nuxt vs Next (2026): Key Differences, Use Cases & Guide — Naturaily](https://naturaily.com/blog/nuxt-vs-next)
- [Next.js vs Nuxt Performance 2026: Benchmarks & When Each Wins — PageSpeedFix](https://www.pagespeedfix.com/blog/nextjs-vs-nuxt-performance/)
- [TresJS — Bring Three to the Vue ecosystem](https://docs.tresjs.org/)
- [React Three Fiber — Introduction](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [What's New in Three.js (2026): WebGPU, New Workflows & Beyond — Utsubo](https://www.utsubo.com/blog/threejs-2026-what-changed)

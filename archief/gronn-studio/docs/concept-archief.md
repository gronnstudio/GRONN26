# Concept-archief: de site van vóór V5

Afgesproken met de eigenaar op 23 september 2026: "Zet alles van de oude
versie als concept weg, zodat we dingen kunnen hergebruiken en in kunnen
zien, zet dan de nieuwe build op main. […] Na 31 december wil ik alles
per definitief van de verouderde versie verwijderen, zodat de build clean
blijft."

## Waar de oude site staat

- **Branch `concept/oude-site-v3`**. Dit is `main` zoals hij was vlak
  vóór V5 (commit `2325675`, PR #69). Vercel bouwt er automatisch een
  preview van, dus de oude site is te bekijken én te klikken:
  `gronn-studio-git-concept-oude-site-v3-gronn.vercel.app` (achter de
  Vercel-inlog, net als elke preview).
- Op GitHub: <https://github.com/gronnstudio/gronn-studio/tree/concept/oude-site-v3>.

Iets hergebruiken: open het bestand op die branch en haal het naar de
huidige site. Kopieer het, merge de branch niet: hij loopt bewust achter.

## Oude code die nog in de nieuwe build staat

V5 bouwt de publieke site uit `src/components/gronn/`. De onderstaande
bestanden worden vanaf geen enkele pagina meer bereikt (gemeten op
23 sep 2026 door vanaf `src/app` alle imports te volgen). Ze doen niets
in de site, maar staan er nog, zodat hergebruik niet eerst een
archeologie-opdracht is.

- `src/components/availability-badge.tsx`
- `src/components/back-to-top.tsx`
- `src/components/brandmark.tsx`
- `src/components/contact/intake-form.tsx`
- `src/components/cookie-notice.tsx`
- `src/components/cta-link.tsx`
- `src/components/home/brand-statement.tsx`
- `src/components/home/featured-project.tsx`
- `src/components/home/final-cta.tsx`
- `src/components/home/hero.tsx`
- `src/components/home/journal-preview.tsx`
- `src/components/home/living-system.tsx`
- `src/components/home/marquee.tsx`
- `src/components/home/observation.tsx`
- `src/components/home/principles.tsx`
- `src/components/home/process.tsx`
- `src/components/home/selected-projects.tsx`
- `src/components/home/services-overview.tsx`
- `src/components/home/studio-intro.tsx`
- `src/components/home/testimonials.tsx`
- `src/components/install-prompt.tsx`
- `src/components/lab/ecosystem-sim.tsx`
- `src/components/lab/growth-field.tsx`
- `src/components/layout/contact-rail.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/site-shell.tsx`
- `src/components/lost-marker.tsx`
- `src/components/motion/count-up.tsx`
- `src/components/motion/cursor.tsx`
- `src/components/motion/drift.tsx`
- `src/components/motion/fade-in.tsx`
- `src/components/motion/grain-overlay.tsx`
- `src/components/motion/magnetic.tsx`
- `src/components/motion/reveal-image.tsx`
- `src/components/motion/smooth-scroll.tsx`
- `src/components/motion/tilt-indicator.tsx`
- `src/components/motion/tilt.tsx`
- `src/components/preloader.tsx`
- `src/components/project-card.tsx`
- `src/components/projects/before-after.tsx`
- `src/components/projects/outcomes.tsx`
- `src/components/projects/project-grid.tsx`
- `src/components/projects/system-diagram.tsx`
- `src/components/pull-to-refresh.tsx`
- `src/components/services/postcode-check.tsx`
- `src/components/services/price-table.tsx`
- `src/components/stack/concepts.tsx`
- `src/components/stack/evolution-figures.tsx`
- `src/components/stack/evolution.tsx`
- `src/components/stack/tech-history.tsx`
- `src/components/stamp.tsx`
- `src/components/three/terrain-scene.tsx`
- `src/components/three/terrain.tsx`
- `src/editor/editable-image.tsx`
- `src/editor/toolbar.tsx`
- `src/lib/data/concepts.ts`
- `src/lib/project-stats.ts` — nog gebruikt door `scripts/collect-stats.mjs`
- `src/lib/stack.ts` — nog gebruikt door `scripts/export-content.ts`
- `src/lib/timevault.ts`
- `src/lib/use-deferred-visible.ts`
- `src/lib/use-device-tilt.ts`
- `src/lib/use-in-center.ts`

Let op bij het opruimen: `src/lib/stack.ts` en `src/lib/project-stats.ts`
worden nog door scripts gelezen. Eerst die scripts bijwerken, dan pas
weghalen.

Twee dingen die bij deze meting opvielen en die de eigenaar moet weten:

- **`src/editor/toolbar.tsx`** hangt niet meer in de publieke site. De
  editor-werkbalk op de pagina's is er in V5 dus niet. `/editor` zelf
  bestaat nog. Is de werkbalk nodig, dan komt hij terug in
  `src/app/[locale]/layout.tsx`.
- **`src/components/contact/intake-form.tsx`** is niet meer het
  contactformulier. Dat is nu `src/components/gronn/contact-formulier.tsx`,
  met hetzelfde transport: direct naar FormSubmit, mailto als terugval.

## Na 31 december 2026

Op 1 januari 2027 draait een geplande taak die een opruim-PR voorbereidt:

- de bestanden hierboven weg, en de tests die alleen over hen gaan;
- de tijdelijke redirects in `next.config.ts` nalopen;
- de branch `concept/oude-site-v3` weg.

De PR en het verwijderen van de branch gebeuren pas na akkoord van de
eigenaar. Verwijderen is niet terug te draaien. Wat daarna nog nodig is,
staat in de git-geschiedenis (commit `2325675`).

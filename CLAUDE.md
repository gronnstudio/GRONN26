# GRØNN Studio — nieuwe site (GRONN26)

Instructies voor wie (mens of Claude) aan deze repo werkt. Lees eerst
`docs/` — daar staat alles in detail. Dit bestand is de korte versie.

## Wat dit is

De nieuwe, kleine site voor GRØNN Studio (Nick Peters, vijvers en tuinen,
Stein). Vijf pagina's: `/`, `/vijvers`, `/tuinen`, `/werk`, `/over`. Eén
knop: Kennismaken. Het werk en de foto's spelen de hoofdrol.

- Preview: **https://gronn26.vercel.app** (Vercel-project `gronn26`,
  team `gronn`), `noindex`.
- De live site blijft `gronnstudio/gronn-studio` op gronn.studio tot Nick
  akkoord geeft. **Die repo nooit wijzigen** — alleen lezen, als bron.

## Gouden regels

1. **Weglaten.** Kan het eenvoudiger zonder betekenis te verliezen, dan
   eenvoudiger. Geen UI omdat het kan. Meer dan één visuele container in een
   sectie? Heroverwegen.
2. **Nooit iets verzinnen.** Tekst, cijfers, plaatsen en beelden komen uit
   gronn-studio of van Nick (`docs/05-inhoud.md`). Bij twijfel: vragen.
3. **Bedrijfsgegevens alleen uit `data/business.ts`.**
4. **Kleur alleen via tokens** in `styles/globals.css`. Na een
   kleurwijziging: `npm run contrast`. Oranje als vlak draagt antraciet;
   oranje tekst op licht is `#a14312`. Eén oranje accent per compositie.
5. **Beweging laat structuur zien**, in CSS. Elke animatie stil bij
   `prefers-reduced-motion` én bij `data-motion="reduced"`. Geen GSAP,
   framer-motion of Lenis.
6. **Chroom in px, tekst in `clamp()`.**
7. **Foto's zonder metadata** (`npm run photos`). AI-visualisaties dragen
   altijd een zichtbaar label.
8. **Niet terugbrengen:** zie "Leave behind" in `docs/02-architectuur.md`.
9. **Nooit op de site zeggen dat Claude de site bouwt.**

## Waar staat wat

```
app/         routes            components/  zeven componenten
data/        inhoud (getypt)   lib/         weergave
styles/      globals.css + fonts
scripts/     contrast, foto's  tests/       Playwright
docs/        00 plan · 01 brief · 02 architectuur · 03 designsysteem ·
             04 componenten · 05 inhoud · 06 kwaliteit · 07 werkwijze ·
             08 bouwlog · 09 roadmap
```

## Voor elke push

```bash
npm run build && npm run check
PW_CHROMIUM=/opt/pw-browsers/chromium npm run test:e2e   # in de cloudomgeving
```

## Next.js 16

Nieuwer dan de meeste trainingsdata. Bij twijfel de docs in
`node_modules/next/dist/docs/` lezen (bv. `01-app/02-guides/view-transitions.md`).

## Documentatie bijhouden

Een nieuw besluit → `docs/02-architectuur.md` §5. Een afgeronde stap →
`docs/08-bouwlog.md`. Iets afgevinkt of erbij → `docs/09-roadmap.md`.

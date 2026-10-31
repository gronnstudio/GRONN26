# DEV-laag

Een verborgen gereedschapslaag om op productie te testen, alleen voor de
eigenaar (25 sep 2026). Toegang: het kleine "·" achter de voetnoot op
`/stack` (Techniek).

- **Gezag:** alleen de NextAuth-sessie. `GET /api/dev/sessie` →
  `{ eigenaar: boolean }` via `getOwnerSession()` (`src/lib/auth.ts`).
  De schakelaar in localStorage (`gronn-dev-laag`) is gemak, geen gezag:
  alles wat de laag ontgrendelt wacht op `geverifieerd` uit
  `useDevLaag()` (`src/lib/dev-laag.ts`).
- **Flags:** `FLAGS` en `useFlag(naam)` in `src/lib/flags.ts`. Bezoekers
  krijgen altijd de standaard.
- **Meldingen:** `stuurDev({ soort })` stuurt `gronn:dev`; `AppMelding`,
  `OfflineMelding` en `VerderLezen` luisteren alleen als de laag
  geverifieerd is.
- Schrijft nooit data en verandert niets voor bezoekers.

## Ideeën

Nog niet gebouwd:

1. **Uur forceren** — Gouden/Blauwe Uur en een kloktijd kiezen om
   `resolveAutoTheme()` rond 07:00/19:00 te zien omslaan.
2. **Traag netwerk** — afbeeldingen en fetches kunstmatig vertragen om
   laadstanden en plaatshouders te zien.
3. **Landmarks tonen** — header/nav/main/footer en koppen als omlijnde
   labels, de toegankelijkheidsboom in één oogopslag.
4. **Minder beweging aan/uit** — `prefers-reduced-motion` simuleren
   zonder de systeeminstelling te wijzigen.
5. **Deploy-geschiedenis** — de laatste paar deploys naast de huidige build-stempel (die staat er al: sha en bouwtijd).
6. **Contactformulier droog testen** — de intake doorlopen en de payload
   tonen in plaats van naar FormSubmit te sturen.
7. **Seizoen vooruit** — de seizoensinhoud van een gekozen maand bekijken.
8. **Tekstgrootte 125/150 %** — chroom in px naast groeiende tekst
   controleren (telefoonnavigatie punt 1).

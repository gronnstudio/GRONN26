# ADR 0009 · Het archief van de vorige site staat in deze repo

29 okt 2026 · **Besloten** (Nick: "put the archive in GRONN26"; 31 okt 2026: "laat maar alles public")

**Vraag.** De vorige site staat in `gronnstudio/gronn-studio` (287 commits,
V2 tot V5, live tot 9 okt 2026). Kennis daaruit (de merkgids, OPERATIONS,
ROADMAP, de besluiten in CLAUDE.md) moest je in een andere repo zoeken.

**Besluit.** Een momentopname van `gronn-studio` (commit `73d59af`, tak `main`)
in `archief/gronn-studio/`, zonder foto's, video en lettertypen (68 bestanden,
16 MB). De oude repo blijft bestaan, met zijn hele geschiedenis; hij serveert
nog links.gronn.studio.

Het archief doet niet mee met de site:

| Waar | Hoe |
| --- | --- |
| typecheck | `tsconfig.json` → `exclude: ["archief"]` |
| lint | `eslint.config.mjs` → `ignores: ["archief/**"]` |
| Tailwind | `src/app/globals.css` → `@source not "../../archief"` (CSS gemeten: met en zonder archief even groot, 165.526 bytes) |
| Vercel | `.vercelignore` → `archief/` |
| Claude Code | `CLAUDE.md` en `AGENTS.md` van de oude site heten daar `CLAUDE-oud.md` en `AGENTS-oud.md`, zodat een agent ze niet als geldende regels laadt |

**Niet gekozen.** `git subtree` met de volledige geschiedenis: deze repo merget
met squash, dus dat vraagt één keer een merge-commit, en het voegt 17 MB beeld
toe aan elke clone. Kan alsnog als Nick dat wil.

**Openbaar.** Deze repo is openbaar en `gronn-studio` privé. Nick koos op 31 okt 2026 om het archief toch openbaar te zetten. Echte klantnamen, een klantadres en een projectbedrag zijn bij het overnemen vervangen door voorbeelden.

**Regel.** Niets in `archief/` aanpassen of importeren. Iets hergebruiken =
kopiëren naar `src/` en daar laten voldoen aan de regels van nu.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Samenwerking Claude Code × GPT/Codex

Geldt voor elke AI-agent in deze repo. Uitleg: [docs/ai-samenwerking.md](docs/ai-samenwerking.md),
waarom: [ADR 0005](docs/architecture/decisions/0005-gpt-als-reviewer.md).

- **Rollen.** Claude Code schrijft de code. GPT/Codex reviewt en adviseert, maar pusht nooit naar
  een branch van Claude. Vraagt Nick Codex om code, dan komt die op een eigen `codex/`-branch met
  een eigen PR. Nick beslist over scope, kosten, privacy en productie.
- **Niemand krijgt automatisch gelijk.** Een bevinding zonder bestand:regel en zonder manier om het
  te controleren telt niet. Claude geeft per bevinding één status: `opgelost` (commit + test),
  `weerlegd` (bewijs: code, test, documentatie) of `besluit Nick`. Op een weerlegging krijgt de
  reviewer één tegenronde; wat daarna openstaat gaat naar Nick. Een review is advies, geen
  mergetoestemming.
- **Wanneer verplicht** (Nick, 29 okt 2026): PR's die `src/app/api`, `src/lib/crm`,
  `src/app/dashboard`, inlog/toegang of `.github/` raken. Niet mergen zolang daar een P0 of P1
  openstaat. Al het andere blijft auto-merge na groene CI.
- **Geen botsingen.** Elke PR noemt de mappen die hij raakt. Voor je begint: kijk welke open PR's
  dezelfde bestanden raken; bij overlap wachten of rebasen. Nooit op andermans branch pushen.
- **Data.** Naar een extern model gaat alleen code, nooit `.env*`, `.crm-data/`, uploads, foto's of
  echte klantgegevens. Sleutels alleen als omgevingsvariabele of GitHub-secret.
- **Branch.** Er is geen `main`: de standaardbranch is `claude/brave-einstein-no9sq8`.

## Review guidelines

Ernst: **P0** datalek of toegang tot andermans gegevens · **P1** regressie, onveilig patroon,
kapotte test · **P2** onderhoud, toegankelijkheid, prestatie · **P3** idee zonder blokkade.
Format: `[P1] pad:regel — probleem; bewijs; hoe te controleren`. Scheid bewezen fout van
aannemelijk risico. Zeg wat je niet kon controleren.

Let vooral op:
- Elke route onder `src/app/api` en `src/app/dashboard` controleert de eigenaarsessie
  (`src/lib/crm/toegang.ts`); niets klantgebonden is zonder inlog bereikbaar, behalve via een
  bedoelde privélink.
- Vercel Blob: klantbestanden zijn privé (`access: "private"`), nooit een publieke terugval.
- Bedragen in centen (ADR 0002), hoeveelheden uit rekenfuncties, niet uit modeluitvoer.
- Modelaanroepen (Anthropic, OpenAI): geen telefoon, e-mail of adres in de prompt
  (`src/lib/crm/context.ts`); modeluitvoer is onbetrouwbare invoer.
- Geen nieuwe afhankelijkheid zonder ADR (ADR 0003).
- Toegankelijkheid: zichtbare labels, `prefers-reduced-motion`, contrast.
- De gouden regel: de eenvoudigste versie die werkt. Benoem overbodige complexiteit als P3.

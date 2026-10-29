# ADR 0005 · GPT/Codex reviewt, Claude Code schrijft

29 okt 2026 · **Besloten** (Nick koos "Alleen gevoelige delen")

Eén schrijver per branch voorkomt botsende wijzigingen. Een tweede model dat
alleen reviewt, vangt wat de schrijver over het hoofd ziet, zonder dat twee
agents dezelfde bestanden aanpassen.

- **PR-review:** Codex code review via Nicks ChatGPT Plus-abonnement (geen
  API-kosten). Het leest de `## Review guidelines` in `AGENTS.md`.
- **Raadplegen tijdens het bouwen:** `scripts/gpt.mjs` (fase 2) roept de
  OpenAI Responses API aan met `fetch`. Er komt geen SDK bij (ADR 0003).
- **Verplicht** alleen voor API, CRM, dashboard, inlog/toegang en `.github/`.
  De rest houdt auto-merge na groene CI.

**Niet gekozen:** een Claude Code-hook die na elke beurt reviewt (te duur, te
druk); `openai/codex-action` in CI (API-kosten bovenop het abonnement, alleen
als reserve); GPT die zelf fixes pusht (dan zijn er twee schrijvers).

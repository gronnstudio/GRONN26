# Session log — 20 Jul 2026 · GRØNN Editor, Nocturne corrections

Agent: Claude Code (Fable 5) · Owner: Nick

## What shipped

PRs #11–#16, all live: Nocturne theme corrections, hedgerow photo fix,
and the **GRØNN Editor** — own on-site visual editor (content layer →
Google SSO → click-to-edit UI). Owner verified end-to-end in
production. Also: hours manifest + reconstructed worklog (PR #6),
Sanity CMS foundation (PR #10, now dormant).

## Rejected / decided — do not re-propose

- **Sanity as the content backend** — owner: "sanity is not free, dont
  know if this is the right path." Replaced by the own-build editor on
  Vercel Blob (€0). **But: Sanity stays installed and dormant at
  /admin** — owner explicitly wants the option to revoke or reactivate;
  do not tear it out.
- **Neon mint accent #8de8c0** (Nocturne) — "the neon bleuish green
  needs to goooo." Replaced with soft brand green #d0ede0. Note the
  precise nuance: the dark blue-charcoal *ground* (#0a1624) was
  explicitly RESTORED after a first fix wrongly removed it. Rule:
  no neon/fluorescent accents; dark grounds may be blue-charcoal.
- Lesson recorded: when the owner names a color to remove, confirm the
  exact hex before repainting a palette.

## Gotchas learned

- PowerShell pipes append `\r` to values fed to `vercel env add` —
  broke the Sanity projectId with an invisible character (500 on
  /admin). Always use bash `printf` for env values.
- Turbopack dev server serves stale CSS/routes across branch switches —
  delete `.next` and restart before trusting dev output; a global dev
  404 right after starting the server is stale state, not code.
- Next 16: `revalidateTag(tag)` single-arg is deprecated — use
  `revalidateTag(tag, { expire: 0 })` in route handlers.
- `"use cache"`/cacheTag needs `cacheComponents: true` (invasive);
  `unstable_cache` works fine on Next 16 for tagged non-fetch reads.
- New Vercel Blob stores auth via OIDC (`BLOB_STORE_ID`, no static
  token); `vercel env pull` tokens don't work for the development
  environment; private stores 403 public URLs — the editor supports
  both modes (SDK reads + /api/img proxy for private).
- FormSubmit-era lesson repeated: verify which color/element the owner
  means before shipping the "fix."

## State at end of session

Editor live and owner-verified. Sanity dormant (owner may delete the
migration token / project or keep). Next work queue unchanged
(AGENTS.md §3): governance CI → Playwright → perf → wow → SOTD
submission. Editor extraction for Equilibrium is a later track.

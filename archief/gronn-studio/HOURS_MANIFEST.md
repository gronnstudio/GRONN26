# HOURS_MANIFEST — work log rules

The owner maintains business time registration in DigiBoox. This repo
keeps a continuous work log as a **memory aid** for that registration.
The log never determines or claims hours — it documents completed work;
the owner alone decides actual hours.

## Standing rule for every agent/session

After every meaningful development session, append an entry to
`docs/worklog.md` (newest at the bottom). Create it if missing.

## Every entry contains

1. **Date** — local date (YYYY-MM-DD)
2. **Phase** — short project-phase label
3. **Summary** — one short paragraph of what was accomplished
4. **Detailed activities** — clear bullet list
5. **Business categories** — one or more of: Website Development,
   UI / UX Design, Performance Optimisation, SEO, Accessibility,
   Content, Copywriting, Research, Technical Architecture,
   Infrastructure, Deployment, Testing, Bug Fixing, Documentation,
   Planning
6. **Files changed** — the important ones
7. **Git commits** — hashes when applicable
8. **Deployment** — mention if applicable
9. **### DigiBoox Summary** — plain Dutch, understandable by
   non-programmers, business activities rather than code, suitable to
   copy into a bookkeeping time registration.

## Hard rules

- **Never estimate, invent, or state hours or durations.** Document
  completed work only.
- Never invent work or fabricate dates. Only document what repository
  evidence or the session itself supports. If intent of historical work
  cannot be determined: state "Purpose could not be determined from
  repository history."
- Group related commits into logical milestones — not one entry per
  commit.

The goal: `docs/worklog.md` reads as a complete chronological project
diary; each DigiBoox Summary can be copied almost directly into the
bookkeeping system.

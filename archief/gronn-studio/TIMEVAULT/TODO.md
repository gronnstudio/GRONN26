# TODO

What is open, and what each thing is waiting on. Mirrors
`OPERATIONS.md` §1 for the owner-facing items — that file is the one
Nick ticks off; this one carries the reasoning.

## Waiting on the owner

| Item | Waiting on |
| --- | --- |
| DMARC at `p=none` | One TXT record at TransIP. Recipe in `OPERATIONS.md` §5 |
| Real photography and copy | The studio's own projects. Everything on the site is fiction until then |
| Sitemap in Search Console | Two clicks; the domain is already verified |
| Legal review of `/voorwaarden` | A professional. It ships as a draft |
| Cancel old Hostinger hosting | Confirmation it is still running |
| Backup domain contact at TransIP | Any address that is not on the domain itself |

## Blocked

| Item | Blocked on |
| --- | --- |
| Live chat, option C | A written plan. Costs change 1 Oct 2026 |
| Stamp opens the chat | The chat decision, plus three problems in `PROBLEMS.md` |
| Cookie notice returns | Whatever third party the chat brings |
| Deel 5 PR 3 | Supabase |
| Deel 5 PR 4 | Resend, plus DNS |
| Hours register (#69) | `/dashboard` — it does not belong in a markdown file |

## Open, waiting on the owner's eye

| Item | Waiting on |
| --- | --- |
| #88 — the site follows the visitor's language | The owner looking at it. Green and mergeable; it changes what a first-time visitor sees, so it is not a merge to make on someone's behalf |

## Ready to build

| Item | Note |
| --- | --- |
| Pond diagnosis (Deel 5 §5.1) | Not started, not blocked |
| UI/UX revision | Briefed. Starts with an audit on its own branch, not with code |
| TimeVault on tablet and phone | Deliberately deferred. Translate the desktop experience; do not subtract from it |

## Repairs owed

The August audit is paid off — #89 merged 27 Aug and deployed. What is
left is in `PROBLEMS.md` under "Known and unrepaired": the contact rail
overlapping content below 1472px, and four comments that still name
`middleware` where the file is `proxy.ts`.

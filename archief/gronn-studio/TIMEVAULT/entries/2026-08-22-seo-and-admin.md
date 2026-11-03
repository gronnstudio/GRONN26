# 22–24 Aug 2026 · Found by search, run from a phone

**Status** verified · **PRs** #70–#74 · **Category** architecture

## Context

The Dutch pages carried English metadata — for a studio whose customers
are almost entirely Dutch. And the studio's paperwork lived in a
spreadsheet.

## Implementation

**SEO** (#71): Dutch metadata, per-page canonicals, and structured data
built from real business facts. Nothing invented — no ratings, no
coordinates, no opening hours. A schema claim a search engine can catch
out is worse than an absent one.

**The owner panel** (#72–#74): quotes and invoices at `/admin`, a
switchable letterhead, date pickers, one to three columns, fit-to-width,
and a document sheet that prints the studio's details **once**, at the
foot, rather than on every page.

Scroll locking partway down long pages was fixed in the same stretch
(#70).

## Result

Dutch is now the site's first language to a crawler, as it always was to
its customers.

`/admin` also produced a bug worth remembering: it was linked from three
places before being added to `UNLOCALIZED`, so every Dutch visitor who
clicked it got a 404. See `PROBLEMS.md`.

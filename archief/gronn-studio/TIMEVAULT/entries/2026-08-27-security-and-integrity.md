# 27 Aug 2026 · Security, accessibility and technical integrity

**Status** in-progress · **PR** #89 · **Category** architecture

Five known problems, each reported when it was found and each kept out
of its own PR's scope under `AGENTS.md` §1. This is the round that pays
them off.

## The IBAN was in the client bundle

**Problem.** The studio's account number shipped to every visitor and
was findable with a text search, without opening a page that shows it.
Live since launch.

**Root cause.** Not the three call sites — `BUSINESS.iban` sat in a
module every component may import. The footer (on *every* page), the
terms page and the privacy page's credential detector all pulled it in.
Fixing the call sites would have left the next person to type
`BUSINESS.` and read the autocomplete free to put it straight back.

**Solution.** `src/lib/business-private.ts`, with an explicit throw if
evaluated in a browser. `/admin` is a server component that checks the
session before rendering anything, so it reads the value there and hands
it down as a prop — it travels only in an authenticated response. No new
dependency: `server-only` is not installed and this did not warrant it.

The footer stops showing it (Dutch law wants name, address, email, KVK
and BTW — not a bank account) and the terms point at the account stated
on the invoice, which is both safer and more accurate.

**Verification.** Clean build: zero occurrences in `.next/static`, none
in any prerendered page. The remaining copy is a server chunk, which
never reaches a browser.

**Worth being clear about the risk.** Nothing secret leaked — the number
is on every invoice the studio sends. The danger runs the other way: a
number a stranger can read on your own website is a number they can use
to make a fraudulent invoice look right.

## Three false statements on the privacy page

Each written before the thing that made it untrue.

| Claimed | Actually |
| --- | --- |
| picsum.photos is a processor | Images self-hosted in `public/ph` for weeks |
| "uses no analytics" | `<SpeedInsights />` mounted in `layout.tsx` |
| "two functional preferences" | Closer to nine |

The replacement names the preferences by purpose rather than by count.
A number goes stale the next time one is added, and this page has now
been wrong about exactly that once.

## `/` was a WCAG 2.1.4 failure

**Problem.** `/` opened search. Character Key Shortcuts is Level A and
requires a single-character shortcut to be turn-off-able, remappable, or
confined to focus. It had none of the three. Guarding against typing in
a field is careful and is not one of the three.

**Solution.** A shortcuts preference beside motion and underlines, and
a system built on one shared typing guard: `g` + digit for the five
sections, `g h` home, `?` for the list, `/` for search. All single-key
bindings sit behind the switch.

`⌘K` deliberately does not: it holds a modifier, so it cannot be fired
by a stray keypress or by speech input dictating a word, and 2.1.4 does
not cover chorded shortcuts.

A shortcut nobody can discover is a shortcut nobody has, so the toggle
reads "Shortcuts on · ?" rather than just "on".

## The upload limit enforced nothing

`content-length` is a claim the client makes about itself. Omit it —
chunked transfer encoding does — and `Number(null ?? 0)` is 0, which
passes; the body then went whole into `arrayBuffer()`.

The header check stays as a cheap early-out. The enforcement is now
counting bytes off the stream and cancelling at the first chunk over the
line: reading it all and measuring after would still let a lying client
exhaust memory before being told no.

## The tap-target test tested the wrong pseudo-element

`@utility tap-target` draws `::before`; the test read `::after`. The
exemption never applied to anything, and it passed anyway because every
element it measured already cleared 24px on its own box.

It now reads the right pseudo-element **and** the size that pseudo-
element claims. "There is a `::before`" was never the question.

## `middleware.ts` → `proxy.ts`

Deprecated in Next 16.0 and renamed; this project runs 16.2.10. Renamed
per the documented migration. One behavioural difference, checked rather
than assumed: Proxy defaults to the Node.js runtime where Middleware ran
at the edge — nothing here needs the edge.

## Deliberately not in this round

DMARC, the TransIP backup contact, Hostinger, the sitemap submission,
real photography, the legal review of `/voorwaarden`, live chat, the
cookie notice, pond diagnosis and the hours register. All remain in
`TODO.md`.

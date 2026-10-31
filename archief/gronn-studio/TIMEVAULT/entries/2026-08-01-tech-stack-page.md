# 1 Aug 2026 · The build becomes explorable

**Status** verified · **PR** #47 · **Category** technology

## Context

The sister site, Equilibrium, had an "engine" section naming its
technologies. The owner asked for something *"more interactive and
intuitive"* — and he was right that a list of package names says nothing
a `package.json` could not.

## Decision

**Names and versions read from `package.json` at build time; the
sentences from the content document.**

A hand-typed version is wrong the first time a dependency is upgraded.
Reading it makes the page unable to lie. The cost is that versions
cannot be edited in the editor — they are facts, not copy.

That division runs through the whole page: structure in code, prose in
the document.

## Implementation

Three axes of exploration, all plain buttons with written labels:

1. a cross-section of four layers — selecting one narrows the grid and
   explains what that layer is for;
2. every technology opens to say why it was chosen and what it costs;
3. a filter for which of these the sister site also runs, taken from
   `TECH-STACK.md` as fact rather than editorial.

## Result

`/stack`, and later the page this timeline was added to. The two halves
answer different questions — *what is this built with* and *how did it
get here* — and they join through the technology keys, which are the
same on both sides.

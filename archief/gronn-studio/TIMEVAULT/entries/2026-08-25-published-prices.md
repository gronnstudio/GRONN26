# 25 Aug 2026 · Prices in the open

**Status** verified · **PR** #75 · **Category** design

## Context

From Deel 5 §5.3 of the studio's own *Verdienmodellen* working document.

Seasonal work is standardised and datable. Hiding its price behind a
quote form costs the studio exactly the customers who were ready to
book — the ones who knew what they wanted and only needed a number.

## Decision

**Publish prices for seasonal work; keep design work quoted per
project.**

They are different products. One is a dated job with a known scope; the
other is months of thinking about a site that is like no other. A
published price can be undercut — and it also filters out the enquiries
that were never going to convert.

## Implementation

Five seasonal services with prices: leaf net, autumn pond service,
winterising, pond survey, stewardship. A page per service saying what is
included **and what deliberately is not**. A from-price everywhere the
service is named, from one source. And a service-area postcode check
that answers honestly when the answer is no.

## A small thing that mattered

The postcode field's placeholder showed `6171 GB` while the message said
four digits was enough. The owner: *"vier cijfers is genoeg staat er,
maar het voorbeeld toont ook letters, slordig!"*

An example that contradicts its own instruction is worse than no
example.

## Result

Eleven services, priced or quoted, each with a URL of its own — and the
immediate cause of the navigation rebuild two days later, because no
menu on the site could hold eleven of anything.

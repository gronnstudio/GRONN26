# 2026-08-26 — Mega menu reshaped as a floating card

Owner sent a screenshot of GitHub's Platform menu: *"maak het mega menu
zoals dit."* This is the visual follow-up to
[`2026-08-25-services-mega-menu.md`](2026-08-25-services-mega-menu.md),
which shipped the panel's behaviour and content.

## What changed

The panel was a full-bleed strip spanning the viewport. It is now a
**floating card**: inset with the page gutter, rounded, bordered, with a
soft drop shadow, hanging flush under the bar. A card reads as an object
you opened; a strip reads as part of the page.

Also taken from the reference:

- **A leading mark per item.** GitHub anchors each row with an icon. Ours
  uses the service's own survey index (`01`–`11`) in mono — the brand
  already has a mark for this, and eleven bespoke icons is exactly the
  clipart CLAUDE.md rejected. Same left-edge rhythm, house language.
- **A recessed footer strip** (`bg-surface/50`) for the overview link, so
  the way out reads as the floor of the card rather than another item in
  it. The link sits left, where reading starts — GitHub puts "View all
  features" there too.

## Fixed on review

- **The in-season photo stretched on tablet.** Flex children stretch by
  default, so `aspect-square` lost to the row height. `items-start` on the
  card link.
- **The index marks failed contrast at `text-muted/60`** — 2.77:1 against
  the Paper ground, where 4.5:1 is required at 10px. Caught by the axe
  scan with the panel open, not by eye: at that size the difference is
  easy to miss on a screenshot and hard to read in reality. Now the full
  `muted` token, which the contrast auditor already covers. The group
  intros went the same way (`/85` → full token) rather than sitting one
  review away from the same problem.

## Verified

`tsc --noEmit`, `eslint src scripts tests`, `check-contrast.mjs`
(122 pairs, 0 failing), `next build`, `playwright test` (25 passed).
Screenshotted at 1440px and 900px.

## Still open, deliberately

**The phone menu.** The curtain gained the two family names as sub-links
in the previous round, so a phone reaches the right group on `/services`,
but the eleven services are not tappable from the menu itself. A
drill-down (the pattern in the owner's biovijver screenshots: bold + a
chevron means "there is more behind this", plus an explicit "← Ga terug")
was proposed and dropped after the owner said *"zonder de bestaande
website structuur te veranderen"*. That reading was too broad on my part
and was corrected in conversation: a second level in the phone menu
changes no page, route or nav item. It is available to pick up, not
rejected.

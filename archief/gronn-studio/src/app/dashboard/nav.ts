import type { SurfaceGroup } from "@/app/dashboard/dashboard-shell"

// The owner's navigation, in one place so every surface under
// /dashboard shows the same rail.
//
// What is NOT here is deliberate. The reference has Tasks, Calendar and
// Team; this studio has no task model, no diary, and one person. An item
// that opens a screen with invented numbers on it is worse than a shorter
// menu. Klanten and Abonnementen arrive with the data that backs them —
// PR 2 and PR 3 — and not before.
export function ownerNav(counts: {
  intakes?: number
  overdue?: number
  drain?: number
  /** Openstaande punten in de juridische documenten, over alle heen. */
  letters?: number
} = {}): SurfaceGroup[] {
  return [
    {
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: "dashboard",
        },
        {
          href: "/dashboard/agenda",
          label: "Agenda",
          icon: "agenda",
        },
        {
          href: "/dashboard/intakes",
          label: "Intakes",
          icon: "intakes",
          badge: counts.intakes,
        },
        {
          href: "/dashboard/offertes",
          label: "Offertes & facturen",
          icon: "documents",
          badge: counts.overdue,
        },
        {
          // Owner only, and it stays that way. Every figure on it is a
          // total across all households; the client rail below is a
          // separate function precisely so this cannot leak into it by
          // someone forgetting a condition.
          href: "/dashboard/analytics",
          label: "Cijfers",
          icon: "analytics",
        },
      ],
    },
    {
      title: "Algemeen",
      // The site editor is a different tool behind the same login —
      // words and pictures rather than paperwork — so it sits apart
      // instead of pretending to be a fourth surface.
      items: [
        {
          // Visible even when empty, and that is the point. A drain
          // nobody can find is a drain nobody trusts, and the whole
          // reason it exists is so that pressing "verwijder" is no
          // longer a decision somebody has to be sure about.
          href: "/dashboard/afvoerputje",
          label: "Afvoerputje",
          icon: "drain",
          badge: counts.drain,
        },
        {
          // "Kleine letters" en niet "Juridisch": dit is de plek waar de
          // voorwaarden, de privacyverklaring en de portaalregels staan,
          // en dat is precies wat iedereen bedoelt als hij zegt dat hij
          // de kleine lettertjes niet heeft gelezen.
          //
          // Het telletje is het aantal punten dat nog moet worden
          // ingevuld of getoetst — niet het aantal documenten. Dat
          // laatste verandert nooit en zou dus een badge zijn die altijd
          // hetzelfde zegt, wat hetzelfde is als geen badge.
          href: "/dashboard/kleine-letters",
          label: "Kleine letters",
          icon: "legal",
          badge: counts.letters,
        },
        { href: "/editor", label: "Site-editor", icon: "editor" },
      ],
    },
  ]
}

/** The counts a rail can carry. The strip takes the same ones. */
export type OwnerCounts = NonNullable<Parameters<typeof ownerNav>[0]>

/**
 * What the studio's panel offers ON A PHONE: all of it.
 *
 * Until 25 September 2026 this was two items — the documents shelf and
 * the small print — because the panel was a large-screen tool and every
 * other surface ran into "Dit paneel is voor een groot scherm gemaakt".
 * That day the owner opened /dashboard on his iPhone, hit the wall, and
 * reversed the rule: he wants to USE the dashboard on his phone
 * (overzicht, offertes, intakes, …), not read a notice about it. Every
 * owner surface is `phoneReady` since, and this strip lists them all.
 *
 * DERIVED from `ownerNav`, not written beside it, so a surface added to
 * the rail reaches the phone in the same edit and the two cannot drift.
 * It only ever ADDS — the shelf, right after the builder — and never
 * filters: a filter is one forgotten condition away from dropping a
 * screen, which is what the old comment here rightly warned about.
 *
 * The shelf is not on the desktop rail because there the builder IS the
 * list. On a phone it is the quickest way to "welke prijs stond er ook
 * alweer in" and to a printable sheet, so the strip carries both.
 *
 * The client's strip is untouched: `clientNav` stays its own function,
 * and nothing here reads it or is read by it.
 */
export function ownerPhoneNav(counts: OwnerCounts = {}): SurfaceGroup[] {
  return ownerNav(counts).map((group) => ({
    ...group,
    items: group.items.flatMap((item) =>
      item.href === "/dashboard/offertes"
        ? [
            item,
            {
              href: "/dashboard/documenten",
              label: "Documenten",
              icon: "shelf" as const,
            },
          ]
        : [item]
    ),
  }))
}

/**
 * The client's rail. Four items where the studio has five, and every one
 * of them is about their own garden.
 *
 * A separate function rather than the owner's list with things removed.
 * Filtering a menu is how a surface ends up one forgotten `if` away from
 * showing somebody the studio's invoices: the two audiences share a
 * frame and nothing else, which is the same reason their routes and
 * their API handlers are separate files.
 *
 * No badges anywhere. A badge is a count, and a count is data.
 */
export function clientNav(): SurfaceGroup[] {
  return [
    {
      items: [
        { href: "/dashboard", label: "Mijn dossier", icon: "dashboard" },
        { href: "/dashboard/intakes/new", label: "Nieuwe aanvraag", icon: "intakes" },
      ],
    },
    // No "Algemeen / Naar de site" group. The shell already ends the
    // rail with a "Bekijk de site" card pointing at `/` for anyone
    // signed in, so this group put the same link on screen twice, a
    // handspan apart.
  ]
}

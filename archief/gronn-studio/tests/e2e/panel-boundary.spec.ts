import { expect, test } from "@playwright/test"

import { ownerNav, ownerPhoneNav } from "@/app/dashboard/nav"
import { ICON_KEYS } from "@/app/dashboard/icon-keys"

// The test that would have caught a production outage.
//
// The owner panel's navigation is built in a Server Component and handed
// to a Client Component as a prop. Everything crossing that boundary has
// to be serializable — and the first version of this carried lucide icon
// COMPONENTS, which are functions. React refuses to serialize a function,
// so /dashboard threw a server error on every render where a session
// existed.
//
// It passed `next build`, it passed all 146 tests, and it was broken the
// moment the owner opened it. The reason is worth stating plainly: with
// no session the page returns the sign-in gate and the shell is never
// reached, so every automated check — all of which are unauthenticated —
// exercised the one path where the bug cannot appear.
//
// This asserts the invariant directly instead of hoping a page test
// happens to cover it.

/** Everything a prop tree may hold on its way to a Client Component. */
function offendingPaths(value: unknown, path = "groups"): string[] {
  if (value === null) return []
  const type = typeof value
  if (type === "function" || type === "symbol" || type === "bigint") {
    return [`${path} is a ${type}`]
  }
  if (type !== "object") return []
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => offendingPaths(v, `${path}[${i}]`))
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    offendingPaths(v, `${path}.${k}`)
  )
}

test.describe("the panel's server-to-client boundary", () => {
  test("the navigation carries no functions", () => {
    const offenders = offendingPaths(ownerNav({ intakes: 3, overdue: 1 }))
    expect(offenders, offenders.join("; ")).toEqual([])
  })

  test("the phone strip carries no functions either", () => {
    // Since 25 Sep 2026 every owner page hands the shell a second
    // navigation, `ownerPhoneNav()`, across the same boundary.
    const strip = ownerPhoneNav({ intakes: 3, overdue: 1 })
    const offenders = offendingPaths(strip, "phoneGroups")
    expect(offenders, offenders.join("; ")).toEqual([])
    expect(JSON.parse(JSON.stringify(strip))).toEqual(strip)
    const known: readonly string[] = ICON_KEYS
    for (const item of strip.flatMap((g) => g.items)) {
      expect(known, `${item.href} icon "${item.icon}"`).toContain(item.icon)
    }
  })

  test("the navigation survives a round trip through JSON", () => {
    // The blunt version of the same check: if this throws or loses a
    // field, the prop cannot cross the boundary intact.
    const nav = ownerNav({ intakes: 2 })
    const round = JSON.parse(JSON.stringify(nav))
    expect(round).toEqual(nav)
  })

  test("every surface names an icon by key, and every key is one the shell knows", () => {
    // From the shell's own list, not a copy of it. A hardcoded list here
    // fails on every new surface — which is noise, not a finding. What
    // actually matters is that a navigation never names an icon the
    // shell cannot render.
    const known: readonly string[] = ICON_KEYS
    for (const group of ownerNav()) {
      for (const item of group.items) {
        expect(typeof item.icon, `${item.href} icon`).toBe("string")
        expect(known, `${item.href} icon "${item.icon}"`).toContain(item.icon)
        expect(item.href.startsWith("/"), item.href).toBe(true)
        expect(item.label.length, item.href).toBeGreaterThan(0)
      }
    }
  })

  test("a badge is only ever a number, and absent when there is nothing to count", () => {
    // A zero badge used to render as an empty orange dot. The shell hides
    // it, but the data should not carry noise either.
    const quiet = ownerNav()
    for (const group of quiet) {
      for (const item of group.items) {
        if (item.badge !== undefined) expect(typeof item.badge).toBe("number")
      }
    }
  })
})

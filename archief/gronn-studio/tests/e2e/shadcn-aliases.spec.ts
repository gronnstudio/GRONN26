import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// The translation layer for components copied from 21st.dev.
//
// Those components are written for a shadcn project and reach for
// `border`, `card`, `primary`, `secondary`, `ring`. None of those names
// exist here — this project has its own set — so such a component
// compiles and renders colourless. The aliases in globals.css are the
// translation.
//
// Two names are deliberately NOT aliased, and that is the part worth
// holding down: `accent` and `muted` already exist here with a different
// meaning. Aliasing them would give every copied component a plausible
// wrong colour, which renders fine and reads wrong — the failure nobody
// catches. Left absent, a component that wants them fails to build or
// draws nothing, and gets translated by hand.

const CSS = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8"
)

/** The `@theme inline` block, where Tailwind's colour names are made. */
const THEME = CSS.slice(CSS.indexOf("@theme inline"), CSS.indexOf("\n}", CSS.indexOf("@theme inline")))

test.describe("shadcn's token names resolve to this project's colours", () => {
  test("the names a copied component reaches for all exist", () => {
    for (const [name, target] of [
      ["border", "line"],
      ["input", "line"],
      ["card", "surface"],
      ["popover", "surface"],
      ["primary", "gronn-green"],
      ["primary-foreground", "gronn-white"],
      ["secondary", "surface"],
      ["muted-foreground", "muted"],
      ["ring", "focus-ring"],
      ["destructive", "gronn-ember-strong"],
    ]) {
      expect(THEME, `--color-${name}`).toContain(
        `--color-${name}: var(--${target});`
      )
    }
  })

  test("accent and muted keep THIS project's meaning", () => {
    // `--color-accent` and `--color-muted` already exist and point at
    // this project's own tokens. The test is that they still point
    // there — not at a shadcn background — and that no alias quietly
    // redefines them further down the block.
    expect(THEME).toContain("--color-accent: var(--accent);")
    expect(THEME).toContain("--color-muted: var(--muted);")
    expect(THEME.match(/--color-accent:/g)).toHaveLength(1)
    expect(THEME.match(/--color-muted:/g)).toHaveLength(1)
    // And shadcn's paired foregrounds for those two are absent, because
    // having them would imply the backgrounds mean what shadcn means.
    expect(THEME.includes("--color-accent-foreground")).toBe(false)
    expect(THEME.includes("--color-muted-background")).toBe(false)
  })

  test("every fill that carries white is one check-contrast guarantees", () => {
    // `primary` and `destructive` are the only two aliases used as a
    // filled surface under white text. Both resolve to a constant with a
    // row in the audit: brand green at 4.87:1 and burnt ember at 4.64:1.
    // Pure Signal Ember (2.99:1) is deliberately not among them.
    expect(THEME).toContain("--color-primary: var(--gronn-green);")
    expect(THEME).toContain("--color-destructive: var(--gronn-ember-strong);")
    expect(THEME.includes("--color-primary: var(--gronn-ember);")).toBe(false)
  })

  test("the aliases add names and change none", () => {
    // Every token this project already used must still be declared, or
    // the alias block silently repainted the existing site.
    for (const name of [
      "background",
      "surface",
      "foreground",
      "muted",
      "line",
      "accent",
    ]) {
      expect(THEME, name).toContain(`--color-${name}: var(--${name});`)
    }
  })
})

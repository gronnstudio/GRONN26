import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

// `--accent` is not a fill that carries white text, and on half the
// palettes it is the opposite of one.
//
// In the five dark themes — Night, Forest, Nocturne, Blue Hour and
// Moonlight — `--accent` is a PALE MINT, because on a dark ground
// emphasis is expressed as light (see the palette rules in CLAUDE.md).
// White on it measures 1.15:1. Blue Hour is half the Auto default, so
// every visitor arriving after 19:00 on their own clock got the intake
// form's closing band — the one that asks the single question the whole
// form is built around — as white on near-white.
//
// Lighthouse scored that page 100. It measures the resting state of
// pages it can reach, and axe has never reached `/contact/intake` at
// all; `check-contrast` audits the pairs it is told about, and this pair
// was not one of them. Three tools, none of which could see it.
//
// So the rule is held here instead, in source: `bg-accent` is for tints
// and lines. A fill under white text is `bg-gronn-green` (4.87:1) or
// `bg-gronn-ember-strong` (4.64:1), and those two are the only ones
// `check-contrast` guarantees.

const ROOT = process.cwd()

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) sourceFiles(path, out)
    else if (/\.(tsx|ts)$/.test(name)) out.push(path)
  }
  return out
}

/** Class lists only — a `bg-accent/10` tint is fine and must not match. */
const WHITE_ON_ACCENT =
  /\b(?:enabled:|disabled:|group-)?(?:hover:|focus:|focus-visible:|active:)?bg-accent(?![/\w-])/

test.describe("nothing fills a surface with --accent and writes white on it", () => {
  const files = sourceFiles(join(ROOT, "src"))

  test("the source carries no white-on-accent pairing", () => {
    const offenders: string[] = []
    for (const file of files) {
      const source = readFileSync(file, "utf8")
      // Per className string, not per file: a file may legitimately hold
      // a bare `bg-accent` swatch AND, elsewhere, white text.
      for (const match of source.matchAll(/className=\{?["'`]([^"'`]*)["'`]/g)) {
        const classes = match[1]
        if (!WHITE_ON_ACCENT.test(classes)) continue
        if (!/text-gronn-white/.test(classes)) continue
        offenders.push(`${file.replace(`${ROOT}/`, "")}: ${classes.slice(0, 90)}`)
      }
    }
    expect(
      offenders,
      "use bg-gronn-green or bg-gronn-ember-strong under white text"
    ).toEqual([])
  })

  test("the intake form's closing band uses a fill that carries white", () => {
    // The specific regression, named. This band is the public form's
    // single most important surface and the one that was unreadable.
    const source = readFileSync(
      join(ROOT, "src/components/intake/deep-intake.tsx"),
      "utf8"
    )
    const band = source.slice(source.indexOf('data-intake-print="hero"'))
    const section = band.slice(0, band.indexOf("</section>"))
    expect(section).toContain("bg-gronn-green")
    expect(section).not.toContain("bg-accent")
    // And nothing inside it fades below the body-text floor: white at
    // 80% on brand green is 3.72:1.
    expect(section).not.toContain("text-gronn-white/")
    // Ember on this ground is 1.63:1 — it is a line and marker colour,
    // never a label over a saturated fill.
    expect(section).not.toContain("text-gronn-ember")
  })
})

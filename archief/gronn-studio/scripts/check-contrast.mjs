#!/usr/bin/env node
// WCAG contrast audit for every theme in globals.css.
//
// The palettes are the one part of the design system where a wrong value
// looks fine to whoever picked it and fails for the person who has to read
// it. This parses the real token blocks — not a copy — so it cannot drift
// from what ships.
//
//   node scripts/check-contrast.mjs         audit, exit 1 on any failure
//   node scripts/check-contrast.mjs --all   also print the passing rows
//
// Thresholds are WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text
// and for non-text UI (focus rings, borders that carry meaning).

import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const CSS = join(ROOT, "src/app/globals.css")

/* ---------- colour maths (WCAG 2.x relative luminance) ---------- */

const parseHex = (hex) => {
  const h = hex.trim().replace(/^#/, "")
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`bad hex: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

const luminance = (hex) => {
  const [r, g, b] = parseHex(hex).map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

/* ---------- parse the token blocks out of globals.css ---------- */

// `:root` carries the brand constants *and* the default (Paper) theme;
// each theme class overrides a subset, so a theme's real value set is
// :root merged with its own block.
const readBlock = (css, selector) => {
  const at = css.indexOf(selector + " {")
  if (at === -1) throw new Error(`no block for ${selector}`)
  const body = css.slice(at + selector.length + 2, css.indexOf("\n}", at))
  const vars = {}
  for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    vars[name] = value.trim()
  }
  return vars
}

// Tokens may point at brand constants (`--ember-text: var(--gronn-ember)`).
const resolve = (vars) => {
  const out = {}
  for (const key of Object.keys(vars)) {
    let v = vars[key]
    for (let i = 0; i < 5 && v.startsWith("var("); i++) {
      v = vars[v.slice(6, v.indexOf(")"))] ?? v
    }
    if (/^#[0-9a-f]{3,6}$/i.test(v)) out[key] = v
  }
  return out
}

/* ---------- what has to hold, and why ---------- */

// Each row: [foreground token, background token, minimum, what it is]
const CHECKS = [
  ["foreground", "background", 4.5, "body text on the page"],
  ["foreground", "surface", 4.5, "body text on cards"],
  // `muted` is also what `--color-muted-foreground` aliases to, so these
  // two rows cover every copied component's secondary text as well.
  ["muted", "background", 4.5, "secondary text on the page (= muted-foreground)"],
  ["muted", "surface", 4.5, "secondary text on cards (= muted-foreground)"],
  ["accent", "background", 4.5, "section labels (12px, on page)"],
  ["accent", "surface", 4.5, "section labels (12px, on cards)"],
  // --ember-text is ook de foutkleur van de invulvelden: de foutregel
  // onder een veld en de rand van een fout veld (grond = bg-background).
  ["ember-text", "background", 4.5, "ember index digits + field error text/border on the page"],
  ["ember-text", "surface", 4.5, "ember index digits on cards"],
  // Het licht gedrukte voorbeeld in een leeg invulveld (eigenaar, 28 sep
  // 2026). Geen WCAG-plicht, wel de wens van de eigenaar: leesbaar.
  ["placeholder", "background", 4.5, "field placeholder (example) on the field ground"],
  ["placeholder", "surface", 4.5, "field placeholder (example) on cards"],
  ["focus-ring", "background", 3, "keyboard focus ring on the page"],
  ["focus-ring", "surface", 3, "keyboard focus ring on cards"],
  ["scene-life", "scene-ground-b", 3, "3D terrain life lines on ground"],
  ["scene-stroke", "scene-ground-b", 3, "3D terrain wireframe on ground"],
  // Paneeltinten (Editie 02): kaarten bij een dienst of plantgroep dragen
  // gewone tekst en gewone secundaire tekst, in beide thema's.
  ...["oranje", "bos", "mos", "salie", "antraciet"].flatMap((k) => [
    ["foreground", `paneel-${k}`, 4.5, `body text on the ${k} panel`],
    ["muted", `paneel-${k}`, 4.5, `secondary text on the ${k} panel`],
  ]),
]

// Brand pairs that are identical in every theme — checked once.
//
// These two are also what the shadcn aliases in globals.css point at:
// `--color-primary` is brand green with `--color-primary-foreground`
// white, and `--color-destructive` is the burnt ember with white. So a
// component copied from 21st.dev that writes `bg-primary
// text-primary-foreground` is covered by the first row here, and one
// that writes `bg-destructive` by the second. Aliases do not need their
// own rows — they resolve to these same two constants — but they do need
// this note, or the next person adds a third alias to a colour nothing
// audits.
const BRAND = [
  ["gronn-white", "gronn-green", 4.5, "CTA label on brand green (= primary)"],
  ["gronn-white", "gronn-ember-strong", 4.5, "CTA label on ember fill (= destructive, hover)"],
  // Brand Guide 2026, p. 5 — de vier gevallen die de gids zelf meet.
  ["gronn-black", "gronn-ember", 4.5, "antraciet label on the aarde-oranje CTA"],
  ["gronn-ember-strong", "gronn-white", 4.5, "donker oranje text link on gebroken wit"],
  ["gronn-white", "gronn-forest", 4.5, "gebroken wit on the bosgroen section"],
  ["gronn-white", "gronn-black", 4.5, "gebroken wit on the antraciet section"],
  ["gronn-ember", "gronn-black", 4.5, "aarde-oranje annotation on antraciet"],
  // Editie 02, bord "Contrast": de nieuwe paren uit de kleurschaal.
  ["merk-gebroken-wit", "merk-mos-schaduw", 4.5, "gebroken wit on mosgroen-schaduw (Heesters)"],
  ["merk-oranje", "merk-oranje-licht", 4.5, "donkeroranje on oranje-licht (Vaste planten, Onderhoud)"],
  ["merk-oranje-midden", "merk-antraciet", 4.5, "oranje-midden on antraciet"],
  // De naam op de icoontegels (src/lib/iconen.ts): "vormen in een icoon
  // hoeven geen 4,5:1; hun naam wel". iconen.spec.ts meet elke tegel.
  ["merk-salie", "merk-bos", 4.5, "salie name on the bosgroen tile (Bomen)"],
  ["merk-bos", "merk-salie", 4.5, "bosgroen name on the salie tile (Siergrassen)"],
  ["merk-bos", "merk-bos-licht", 4.5, "bosgroen name on bos-licht (Klimplanten)"],
  ["merk-bos", "merk-mos-licht", 4.5, "bosgroen name on mos-licht (Bodembedekkers)"],
  ["merk-oranje", "merk-gebroken-wit", 4.5, "donkeroranje name on gebroken wit (Bollen & knollen)"],
]

// Aarde-oranje is checked as a background only under ANTRACIET: the
// guide rules out white on it, and #DB6923 on #EFEEEA (2,99:1) is never a
// text pairing — orange text on the light ground is --gronn-ember-strong.

const THEMES = [
  // :root is the fallback ground under both Hours; the Hours are the only
  // palettes the site offers (the eight concept palettes were retired on
  // 23 Sep 2026).
  [":root", "Paper (root fallback)"],
  [".goldenhour", "Golden Hour"],
  [".bluehour", "Blue Hour"],
]

/* ---------- run ---------- */

const css = await readFile(CSS, "utf8")
const root = readBlock(css, ":root")
const showAll = process.argv.includes("--all")

const ratio = (n) => n.toFixed(2).padStart(5) + ":1"
let failures = 0
let checked = 0

for (const [selector, name] of THEMES) {
  let vars
  try {
    vars = resolve({ ...root, ...(selector === ":root" ? {} : readBlock(css, selector)) })
  } catch {
    console.log(`\n  ${name}  — no such block, skipped`)
    continue
  }

  const rows = []
  for (const [fg, bg, min, what] of CHECKS) {
    if (!vars[fg] || !vars[bg]) {
      rows.push([false, `  MISSING TOKEN  ${fg} or ${bg} — ${what}`])
      failures++
      continue
    }
    const c = contrast(vars[fg], vars[bg])
    checked++
    const ok = c >= min
    if (!ok) failures++
    rows.push([
      ok,
      `  ${ok ? "pass" : "FAIL"}  ${ratio(c)}  (min ${min})  ${fg} on ${bg} — ${what}`,
    ])
  }

  // Het voorbeeld moet STILLER zijn dan de gedempte tekst, anders leest
  // het als ingevulde waarde. Lager contrast met de grond dan muted.
  if (vars.placeholder && vars.muted && vars.background) {
    const stil = contrast(vars.placeholder, vars.background) < contrast(vars.muted, vars.background)
    checked++
    if (!stil) failures++
    rows.push([stil, `  ${stil ? "pass" : "FAIL"}  placeholder is quieter than muted on background — an example must not read as a filled-in value`])
  }

  const bad = rows.filter(([ok]) => !ok)
  console.log(`\n${name}   ${bad.length ? `${bad.length} FAILING` : "all pass"}`)
  for (const [ok, line] of rows) if (showAll || !ok) console.log(line)
}

console.log("\nBrand constants (theme-independent)")
for (const [fg, bg, min, what] of BRAND) {
  const c = contrast(resolve(root)[fg], resolve(root)[bg])
  checked++
  const ok = c >= min
  if (!ok) failures++
  if (showAll || !ok) {
    console.log(`  ${ok ? "pass" : "FAIL"}  ${ratio(c)}  (min ${min})  ${what}`)
  }
}

console.log(
  `\n${checked} pairs checked · ${failures} failing\n` +
    (failures ? "" : "All themes meet WCAG 2.2 AA.\n")
)
process.exit(failures ? 1 : 0)

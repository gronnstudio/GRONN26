#!/usr/bin/env node
// WCAG-contrast voor elk thema in styles/globals.css.
//
// Overgenomen uit gronn-studio en ingekort tot de tokens die deze site
// heeft. Het script leest de echte blokken, geen kopie, dus het kan niet
// uit de pas lopen met wat er live staat. Faalt (exit 1) bij één paar
// onder AA: 4,5:1 voor tekst, 3:1 voor focusringen.

import { readFile } from "node:fs/promises"

const css = await readFile(new URL("../styles/globals.css", import.meta.url), "utf8")

const rgb = (hex) => {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
}
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

// Het EERSTE blok met deze selector (het :root met de merkkleuren).
const blok = (selector) => {
  const at = css.indexOf(`\n${selector} {`)
  if (at === -1) throw new Error(`geen blok voor ${selector}`)
  const body = css.slice(at, css.indexOf("\n}", at))
  return Object.fromEntries([...body.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-f]{3,6})\s*;/gi)].map(([, k, v]) => [k, v]))
}

const root = blok(":root")
const THEMAS = [
  ["Licht (ook zonder JS)", root],
  ["Licht", { ...root, ...blok(".licht") }],
  ["Donker", { ...root, ...blok(".donker") }],
]

const PER_THEMA = [
  ["foreground", "background", 4.5, "lopende tekst"],
  ["foreground", "surface", 4.5, "tekst op een vlak"],
  ["muted", "background", 4.5, "secundaire tekst"],
  ["muted", "surface", 4.5, "secundaire tekst op een vlak"],
  ["accent", "background", 4.5, "accenttekst"],
  ["ember-text", "background", 4.5, "oranje tekst"],
  ["focus-ring", "background", 3, "focusring"],
]

// Merkparen: gelijk in elk thema. Het menu onderaan staat hier.
const MERK = [
  ["gronn-antraciet", "gronn-oranje", 4.5, "Kennismaken: antraciet op oranje"],
  ["gronn-wit", "gronn-bos", 4.5, "menu: gebroken wit op bosgroen glas"],
  ["gronn-bos", "gronn-salie", 4.5, "menu: actief woord, bosgroen op salie"],
  ["gronn-oranje-donker", "gronn-wit", 4.5, "donkeroranje tekst op gebroken wit"],
]

let fout = 0
const regel = (ok, c, min, wat) => `  ${ok ? "ok  " : "FOUT"}  ${c.toFixed(2).padStart(5)}:1  (min ${min})  ${wat}`

for (const [naam, v] of THEMAS) {
  console.log(`\n${naam}`)
  for (const [fg, bg, min, wat] of PER_THEMA) {
    const c = contrast(v[fg], v[bg])
    if (c < min) fout++
    console.log(regel(c >= min, c, min, `${fg} op ${bg} — ${wat}`))
  }
}
console.log("\nMerk")
for (const [fg, bg, min, wat] of MERK) {
  const c = contrast(root[fg], root[bg])
  if (c < min) fout++
  console.log(regel(c >= min, c, min, wat))
}
console.log(fout ? `\n${fout} paar onder de norm.\n` : "\nAlles haalt WCAG 2.2 AA.\n")
process.exit(fout ? 1 : 0)

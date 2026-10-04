#!/usr/bin/env node
// Geen metadata in gepubliceerde foto's.
//
// Een telefoonfoto draagt GPS-coördinaten van de tuin — dat is het adres
// van de klant. Dit script loopt elke JPEG onder public/ langs en faalt
// als er een APP1-segment (EXIF/XMP) in zit, of als een bestand groter is
// dan het webbudget. Overgenomen uit gronn-studio (vijver-beeld.spec.ts),
// maar als script: zo dekt het elke foto, niet alleen die op één pagina.
//
// Opschonen: `exiftool -all= foto.jpg` of opnieuw exporteren zonder metadata.

import { readdir, readFile, stat } from "node:fs/promises"
import { join, relative } from "node:path"

const PUBLIC = new URL("../public/", import.meta.url).pathname
const MAX_BYTES = 800_000

async function* jpegs(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) yield* jpegs(p)
    else if (/\.jpe?g$/i.test(e.name)) yield p
  }
}

/** Zoekt APP1 (0xFFE1) in de headers, tot de start of scan. */
function heeftApp1(buf) {
  let i = 2
  while (i < buf.length - 4 && buf[i] === 0xff) {
    const marker = buf[i + 1]
    if (marker === 0xda) return false
    if (marker === 0xe1) return true
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return false
}

let n = 0
const fouten = []
for await (const f of jpegs(PUBLIC)) {
  n++
  const naam = relative(PUBLIC, f)
  const buf = await readFile(f)
  if (buf.subarray(0, 2).toString("hex") !== "ffd8") fouten.push(`${naam}: geen JPEG`)
  else if (heeftApp1(buf)) fouten.push(`${naam}: bevat EXIF/XMP (mogelijk GPS)`)
  if ((await stat(f)).size > MAX_BYTES) fouten.push(`${naam}: groter dan ${MAX_BYTES / 1000} kB`)
}

if (fouten.length) {
  console.error(`\n${fouten.length} probleem/problemen in ${n} foto's:\n  ${fouten.join("\n  ")}\n`)
  process.exit(1)
}
console.log(`${n} foto's gecontroleerd: geen metadata, binnen het budget.`)

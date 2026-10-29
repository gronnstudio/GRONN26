// node --test scripts/gpt.test.mjs — de privacycontrole van gpt.mjs.
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { controleer, verboden } from "./gpt.mjs"

test("verwijderde regels worden ook gecontroleerd", () => {
  assert.equal(controleer('-const email = "klant@prive.nl"').length, 1)
})

test("telefoonnummers in gangbare notaties", () => {
  for (const nr of ["020 1234567", "06 1234 5678", "0612345678", "+31 6 12345678", "046-1234567"])
    assert.equal(controleer(`+const t = "${nr}"`).length, 1, nr)
  assert.equal(controleer("+const n = 0.612345678").length, 0)
})

test("toegestaan: zakelijk adres en gewone code", () => {
  assert.deepEqual(controleer('+const mail = "hello@gronn.studio"\n+const x = 12'), [])
})

test("verboden paden, ook via ./ en een symlink", () => {
  const map = mkdtempSync(join(tmpdir(), "gpt-"))
  const oud = process.cwd()
  process.chdir(map)
  try {
    mkdirSync(".crm-data")
    writeFileSync(".crm-data/klant.json", "{}")
    symlinkSync(".crm-data/klant.json", "onschuldig.ts")
    writeFileSync("gewoon.ts", "")
    assert.ok(verboden("./.crm-data/klant.json"))
    assert.ok(verboden("onschuldig.ts"))
    assert.ok(verboden(".env.local"))
    assert.ok(!verboden("gewoon.ts"))
  } finally {
    process.chdir(oud)
  }
})

// node --test scripts/gpt.test.mjs — de privacycontrole van gpt.mjs.
// De voorbeelden worden pas hier aan elkaar geplakt, anders weigert gpt.mjs zijn eigen test.
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { controleer, verboden } from "./gpt.mjs"

test("verwijderde regels worden ook gecontroleerd", () => {
  assert.equal(controleer(`-const email = "klant${"@"}prive.nl"`).length, 1)
})

test("telefoonnummers in gangbare notaties", () => {
  for (const nr of ["020 123", "06 1234 56", "06123456", "+31 6 123456", "046-123"].map((n) => n + "78".repeat(n.endsWith("123") ? 2 : 1)))
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

test("regels die op een diffkop lijken worden ook gecontroleerd", () => {
  const mail = `klant${"@"}prive.nl`
  assert.equal(controleer(`--- ${mail}`).length, 1)
  assert.equal(controleer(`+++ ${mail}`).length, 1)
})

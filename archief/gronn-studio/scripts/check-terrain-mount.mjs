/**
 * Proves the deferred 3D layer still appears for a real visitor.
 *
 * The Browser pane runs pages as hidden tabs, where neither
 * requestIdleCallback nor IntersectionObserver fire — so a canvas count
 * of zero there means nothing. This drives a genuinely visible headless
 * Chrome over CDP instead and reports when the canvas shows up.
 *
 *   node scripts/check-terrain-mount.mjs http://localhost:3199
 */
import { spawn } from "node:child_process"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const url = process.argv[2] ?? "http://localhost:3199"
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe"
const PORT = 9333

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--no-sandbox",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "terrain-check-"))}`,
    "--window-size=1280,900",
    "about:blank",
  ],
  { stdio: "ignore" }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function cdpTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === "page")
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      /* chrome still booting */
    }
    await sleep(250)
  }
  throw new Error("Chrome did not expose a debugging target")
}

const ws = new WebSocket(await cdpTarget())
await new Promise((resolve) => (ws.onopen = resolve))

let id = 0
const pending = new Map()
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result)
    pending.delete(msg.id)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const messageId = ++id
    pending.set(messageId, resolve)
    ws.send(JSON.stringify({ id: messageId, method, params }))
  })

const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true })
  return r?.result?.value
}

await send("Page.enable")
await send("Runtime.enable")
await send("Page.navigate", { url })
await sleep(3000)

console.log("visibility:", await evaluate("document.visibilityState"))

let mountedAt = null
for (let elapsed = 3000; elapsed <= 12000; elapsed += 500) {
  const count = await evaluate("document.querySelectorAll('canvas').length")
  if (count > 0) {
    mountedAt = elapsed
    break
  }
  await sleep(500)
}

if (mountedAt === null) {
  console.log("RESULT: FAIL — no canvas within 12s")
} else {
  const detail = await evaluate(`(() => {
    const c = document.querySelector('canvas');
    const r = c.getBoundingClientRect();
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return JSON.stringify({ w: Math.round(r.width), h: Math.round(r.height), hasGL: !!gl });
  })()`)
  console.log(`RESULT: PASS — canvas mounted by ~${mountedAt}ms`, detail)
}

ws.close()
chrome.kill()
process.exit(0)

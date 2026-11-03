/**
 * Verifies the locale routes render the right language and keep the
 * visitor inside it. Raw HTML greps are useless here: the bilingual
 * content document is serialized into the RSC payload, so both
 * languages appear in the source of every page. This reads the rendered
 * DOM in a real browser instead.
 *
 *   node scripts/check-locales.mjs http://localhost:3199
 */
import { spawn } from "node:child_process"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const base = process.argv[2] ?? "http://localhost:3199"
const PORT = 9340
const chrome = spawn(
  process.env.CHROME_PATH ??
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  [
    "--headless=new",
    "--no-sandbox",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "locale-check-"))}`,
    "--window-size=1280,900",
    "about:blank",
  ],
  { stdio: "ignore" }
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let wsUrl
for (let i = 0; i < 40; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    const page = targets.find((t) => t.type === "page")
    if (page) {
      wsUrl = page.webSocketDebuggerUrl
      break
    }
  } catch {
    /* booting */
  }
  await sleep(250)
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result)
    pending.delete(m.id)
  }
}
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id
    pending.set(i, res)
    ws.send(JSON.stringify({ id: i, method, params }))
  })
const evaluate = async (expr) =>
  (await send("Runtime.evaluate", { expression: expr, returnByValue: true }))
    ?.result?.value

await send("Page.enable")
await send("Runtime.enable")

const cases = [
  { path: "/", expect: "en" },
  { path: "/nl", expect: "nl" },
  { path: "/projects", expect: "en" },
  { path: "/nl/projects", expect: "nl" },
  { path: "/nl/studio", expect: "nl" },
]

let failures = 0
for (const { path, expect } of cases) {
  await send("Page.navigate", { url: base + path })
  await sleep(2200)
  const info = JSON.parse(
    await evaluate(`JSON.stringify({
      lang: document.documentElement.lang,
      h1: (document.querySelector('h1')?.innerText || '').replace(/\\s+/g,' ').trim().slice(0, 60),
      navSample: [...document.querySelectorAll('a[href^="/"]')]
        .map(a => a.getAttribute('href'))
        .filter(h => !/^\\/(editor|admin|api)/.test(h))
        .slice(0, 6),
      toolLinks: [...document.querySelectorAll('a[href*="editor"]')].map(a => a.getAttribute('href')).slice(0,2)
    })`)
  )
  const prefixOk =
    expect === "en"
      ? info.navSample.every((h) => !h.startsWith("/nl"))
      : info.navSample.every((h) => h.startsWith("/nl"))
  const langOk = info.lang === expect
  const toolOk = info.toolLinks.every((h) => h === "/editor")
  const ok = prefixOk && langOk && toolOk
  if (!ok) failures++
  console.log(
    `${ok ? "PASS" : "FAIL"} ${path.padEnd(14)} lang=${info.lang} h1="${info.h1}"`
  )
  if (!ok) {
    console.log(
      `      links=${JSON.stringify(info.navSample)} tools=${JSON.stringify(info.toolLinks)}`
    )
  }
}

console.log(failures === 0 ? "ALL LOCALE CHECKS PASSED" : `${failures} FAILED`)
ws.close()
chrome.kill()
process.exit(failures === 0 ? 0 : 1)

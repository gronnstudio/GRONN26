// Build-time blur placeholders (SOTD campaign Phase 0).
//
// For every static photograph (public/ph/* plus the preloader's
// public/intro-bg.jpg) this produces a ~10px-wide webp, base64-encoded
// as a data URL, and writes the lot to src/lib/blur-map.json keyed by
// public path ("/ph/12.jpg"). <Photo/> and the preloader hand these to
// next/image as `blurDataURL`, so photos arrive as a soft wash of their
// own colours instead of popping in. Runs as `prebuild`, so the map can
// never go stale against the files actually shipped.
//
// sharp is deliberately NOT in package.json: it is already installed as
// a dependency of next itself (next uses it for image optimization), so
// we resolve it from node_modules rather than adding a runtime dep.
// Editor-uploaded Blob images are runtime-only and are not covered here.
import { createRequire } from "node:module"
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const sharp = require("sharp")

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = path.join(root, "public")
const outFile = path.join(root, "src", "lib", "blur-map.json")

const BLUR_WIDTH = 10
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i

// public paths to include: everything in /ph plus the preloader photo.
const targets = [
  ...(await readdir(path.join(publicDir, "ph")))
    .filter((f) => IMAGE_EXT.test(f))
    .map((f) => `/ph/${f}`),
  "/intro-bg.jpg",
]

const map = {}
for (const publicPath of targets.sort()) {
  const buf = await readFile(path.join(publicDir, publicPath))
  const tiny = await sharp(buf)
    .resize(BLUR_WIDTH) // height follows aspect ratio
    .webp({ quality: 70 })
    .toBuffer()
  map[publicPath] = `data:image/webp;base64,${tiny.toString("base64")}`
}

// Stable key order (sorted above) so reruns produce byte-identical JSON
// and never churn the diff.
await writeFile(outFile, JSON.stringify(map, null, 2) + "\n")

const size = Object.values(map).reduce((n, v) => n + v.length, 0)
console.log(
  `blur-map: ${Object.keys(map).length} images -> ${path.relative(root, outFile)} (${(size / 1024).toFixed(1)} KB of data URLs)`
)

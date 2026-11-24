import type { MetadataRoute } from "next"
import { STUKKEN } from "@/lib/data/blog"
import { VIJVER_PAGINAS } from "@/lib/data/vijver-paginas"

const BASIS = "https://gronn.studio"

// De publieke pagina's. /wireframes staat er bewust niet in.
const ROUTES = [
  "/",
  "/vijvers",
  ...VIJVER_PAGINAS.map((p) => `/vijvers/${p.slug}`),
  "/tuinen",
  "/tuinen/borderpakketten",
  "/tuinen/cadeaubon",
  "/shop",
  "/tuinen/materialen",
  "/werk",
  "/werk/vijverrenovatie",
  "/werk/terras-geulle",
  "/over",
  "/kennismaken",
  "/start-een-project",
  "/faq",
  "/privacy",
  "/voorwaarden",
  "/herroeping",
  "/colofon",
  "/merk",
  "/techniek",
  "/journaal",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...ROUTES.map((pad) => ({ url: pad === "/" ? BASIS : `${BASIS}${pad}` })),
    // journaalstukken met hun datum, zodat Google ziet wat nieuw is
    ...STUKKEN.map((s) => ({ url: `${BASIS}/journaal/${s.slug}`, lastModified: s.datum })),
  ]
}

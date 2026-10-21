import type { MetadataRoute } from "next"
import { STUKKEN } from "@/lib/data/blog"

const BASIS = "https://gronn.studio"

// De publieke pagina's. /wireframes staat er bewust niet in.
const ROUTES = [
  "/",
  "/vijvers",
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
  "/faq",
  "/privacy",
  "/voorwaarden",
  "/herroeping",
  "/colofon",
  "/merk",
  "/techniek",
  "/blog",
  ...STUKKEN.map((s) => `/blog/${s.slug}`),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((pad) => ({ url: pad === "/" ? BASIS : `${BASIS}${pad}` }))
}

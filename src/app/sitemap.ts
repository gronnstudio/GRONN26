import type { MetadataRoute } from "next"

const BASIS = "https://gronn.studio"

// De publieke pagina's. /wireframes staat er bewust niet in.
const ROUTES = [
  "/",
  "/vijvers",
  "/tuinen",
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
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((pad) => ({ url: pad === "/" ? BASIS : `${BASIS}${pad}` }))
}

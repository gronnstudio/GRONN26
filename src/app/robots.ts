import type { MetadataRoute } from "next"

const BASIS = "https://gronn.studio"

// Alles mag gelezen worden, behalve de wireframes: dat zijn ontwerpschetsen,
// geen pagina's voor bezoekers (ze dragen zelf ook <meta name="robots" content="noindex">).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/wireframes" },
    sitemap: `${BASIS}/sitemap.xml`,
    host: BASIS,
  }
}

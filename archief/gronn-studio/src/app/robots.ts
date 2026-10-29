import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    // /editor and /api are already noindex / non-HTML; keeping crawlers
    // out of them spends the crawl budget on pages that can rank.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/editor"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

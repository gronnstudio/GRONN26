import { TERRAS_SLUG } from "@/lib/data/terras-geulle"
import { VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import type { MetadataRoute } from "next"

import { getContent } from "@/lib/content"
import { DEFAULT_LOCALE, LOCALES, localePath } from "@/lib/locale"
import { SITE_URL as BASE } from "@/lib/seo"

// Both languages are listed, and each entry declares the other as its
// alternate. Without this the Dutch pages — the ones that match how the
// studio's actual catchment searches — would stay invisible.
function entry(path: string, rest: Partial<MetadataRoute.Sitemap[number]> = {}) {
  return LOCALES.map((locale) => ({
    url: `${BASE}${localePath(locale, path)}`,
    alternates: {
      languages: {
        ...Object.fromEntries(
          LOCALES.map((other) => [other, `${BASE}${localePath(other, path)}`])
        ),
        // Where to send a visitor whose language the site does not serve.
        // Matches the x-default the pages themselves declare.
        "x-default": `${BASE}${localePath(DEFAULT_LOCALE, path)}`,
      },
    },
    ...rest,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services } = await getContent()

  const staticRoutes = [
    "/",
    "/studio",
    "/services",
    "/projects",
    "/contact",
    // The questions page exists to be found: it answers "wat kost een
    // tuinontwerp?" for search engines and AI tools (owner, 23 Sep 2026).
    "/faq",
    // Terug sinds 24 sep 2026: waar Nick mee werkt, onder Studio.
    "/stack",
    // De tuinkalender achter de rechterbubbel (28 sep 2026), ook onder Studio.
    "/calendar",
    // De najaarsactie voor de vijver (29 sep 2026), onder Diensten.
    "/herfstbeurt",
    // `/contact/intake` is deliberately absent. Nothing on the public
    // site links to the long design intake any more — it belongs to
    // people who are signed in — and a sitemap is an invitation to index
    // exactly what a visitor is meant to find. Advertising a page we
    // just stopped offering would put it back in search results, which
    // is the same front door by another route.
    //
    // The address still answers, so a link sent to a client keeps
    // working. Unlinked, not removed.
    "/colofon",
    "/privacy",
    "/voorwaarden",
    "/voorwaarden-zakelijk",
    // The withdrawal form belongs here and not only as an attachment to a
    // quote. Someone who wants to cancel goes looking for it, and it has
    // to be findable without digging up the mail it once arrived in.
    "/herroeping",
    "/portaal",
  ].flatMap((path) =>
    entry(path, {
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    })
  )

  const serviceRoutes = services.flatMap((s) =>
    entry(`/services/${s.slug}`, {
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  )

  const projectRoutes = [VIJVER_SLUG, TERRAS_SLUG].flatMap((slug) =>
    entry(`/projects/${slug}`, {
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  )

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...projectRoutes,
  ]
}

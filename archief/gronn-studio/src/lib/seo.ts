import type { Metadata } from "next"

import type { L, Locale } from "@/lib/i18n"
import { pick } from "@/lib/i18n"
import { DEFAULT_LOCALE, LOCALES, localePath, toLocale } from "@/lib/locale"

export const SITE_URL = "https://gronn.studio"
export const SITE_NAME = "GRØNN Studio"

// The shared social card. Next does NOT deep-merge `openGraph` across
// segments — a page that sets any openGraph field replaces the layout's
// object wholesale — so these have to be restated on every page, not
// inherited. pageMetadata() does that; the root layout keeps its own copy
// for the routes outside the localized tree (/offline, /editor).
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  // Describes what the card shows (28 sep 2026): the woordmerk, the
  // merkzin and the three dienst-tegels on bosgroen. The old stock river
  // photo and its "Designing Living Ecosystems" slogan are gone.
  alt: "GRØNN — Een tuin die met je meegroeit. Ontwerp, aanleg en onderhoud.",
}

// Bilingual metadata in one call. Three things every public page owes a
// search engine, all derived from the same (locale, path) pair so they
// cannot drift apart:
//
//   canonical  — the one address this page is indexed under, which the
//                the proxy already enforces at the routing layer;
//   hreflang   — this page's OTHER language, per path. Declaring it in
//                the locale layout instead pointed every page at the
//                homepage, and Google drops a cluster whose links do not
//                point back;
//   x-default  — the address for a visitor whose language we do not
//                serve. English, matching DEFAULT_LOCALE.
//
// `title`/`description` take a bilingual pair so the Dutch tree finally
// gets Dutch search results — its whole reason for existing.
export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle,
  openGraph,
}: {
  locale: Locale
  path: string
  title?: L | string
  description?: L | string
  // Set on a page whose title already carries the studio name, so the
  // root layout's "%s — GRØNN Studio" template does not repeat it.
  absoluteTitle?: boolean
  openGraph?: Metadata["openGraph"]
}): Metadata {
  const t = (value: L | string | undefined) =>
    value === undefined || typeof value === "string" ? value : pick(value, locale)

  const canonical = localePath(locale, path)

  const resolvedTitle = t(title)

  return {
    title:
      resolvedTitle !== undefined && absoluteTitle
        ? { absolute: resolvedTitle }
        : resolvedTitle,
    description: t(description),
    alternates: {
      canonical,
      // Relative paths resolve against `metadataBase` (root layout).
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, path)])),
        "x-default": localePath(DEFAULT_LOCALE, path),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      images: [OG_IMAGE],
      url: canonical,
      locale: locale === "nl" ? "nl_NL" : "en_US",
      // `title`/`description` are left to Next's own resolution, which
      // fills them from the fields above and applies the title template.
      ...openGraph,
    },
  }
}

// Sugar for the common shape: a page whose metadata is static copy.
// Usage in a page file:
//
//   export const generateMetadata = localeMetadata("/projects", {
//     title: { en: "Projects", nl: "Projecten" },
//     description: { en: "…", nl: "…" },
//   })
export function localeMetadata(
  path: string,
  copy: {
    title?: L | string
    description?: L | string
    absoluteTitle?: boolean
  }
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>
  }): Promise<Metadata> {
    const { locale } = await params
    return pageMetadata({ locale: toLocale(locale), path, ...copy })
  }
}


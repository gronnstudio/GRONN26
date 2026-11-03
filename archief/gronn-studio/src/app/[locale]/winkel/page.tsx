import type { Metadata } from "next"

import { WinkelPagina } from "@/components/gronn/winkel"
import { toLocale } from "@/lib/locale"
import { pageMetadata } from "@/lib/seo"

// De winkel als CONCEPT (Nick, 25 sep 2026). Noindex, nofollow; niet in
// de sitemap, nav, voet of zoekfunctie. Alleen via de directe link, om te
// beoordelen. Zie docs/shop-plan.md en src/components/gronn/winkel.tsx.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = toLocale((await params).locale)
  return {
    ...pageMetadata({
      locale,
      path: "/winkel",
      title: { nl: "Winkel (concept)", en: "Shop (concept)" },
      description: {
        nl: "Concept van de winkel. Nog niet te koop.",
        en: "Concept of the shop. Not for sale yet.",
      },
    }),
    robots: { index: false, follow: false },
  }
}

export default async function WinkelPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale)
  return <WinkelPagina locale={locale} />
}

import type { Metadata } from "next"
import { cookies } from "next/headers"

import { LinksPagina } from "@/components/gronn/links"
import { linksTaal } from "@/components/gronn/links-taal"
import { LANG_COOKIE } from "@/lib/locale"
import { getContent } from "@/lib/content"
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo"

// links.gronn.studio (via src/proxy.ts) en gronn.studio/links. Een
// doorgeefpagina voor de Instagram-bio, geen inhoud die gevonden moet
// worden: noindex, maar de links mogen gevolgd worden. Niet in de
// sitemap. De canonical wijst naar het hoofddomein, ook als hij via het
// subdomein geserveerd wordt (`metadataBase` in de root-layout).
export const metadata: Metadata = {
  title: { absolute: "Links · GRØNN Studio" },
  description: "Ecologische tuinen en vijvers. Ontwerp, aanleg en onderhoud vanuit Stein, Limburg.",
  alternates: { canonical: "/links" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    images: [OG_IMAGE],
    url: `${SITE_URL}/links`,
    locale: "nl_NL",
  },
}

export default async function Links() {
  const { services } = await getContent()
  const locale = linksTaal((await cookies()).get(LANG_COOKIE)?.value)
  return <LinksPagina services={services} locale={locale} />
}

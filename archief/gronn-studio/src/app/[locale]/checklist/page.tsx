import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ChecklistPagina } from "@/components/gronn/checklist"
import { checklist } from "@/components/gronn/checklist-lijst"
import { toLocale } from "@/lib/locale"
import { nieuwsbriefZichtbaar } from "@/lib/nieuwsbrief"
import { pageMetadata } from "@/lib/seo"

// De checklist vooraf — de weggever van de maillijst. Noindex en niet in
// de sitemap: hij hoort bij de aanmelding, niet in de zoekresultaten. Een
// 404 zolang de go-live-vlag uit staat (src/lib/nieuwsbrief.ts).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const locale = toLocale((await params).locale)
  return {
    ...pageMetadata({
      locale,
      path: "/checklist",
      title: { nl: "Checklist vooraf", en: "Checklist before you start" },
      description: {
        nl: "Wat je kunt nakijken voordat je aan je tuin of vijver begint.",
        en: "What you can check before you start on your garden or pond.",
      },
    }),
    // De weggever: niet indexeren, ook niet als iemand de link deelt.
    robots: { index: false, follow: false },
  }
}

export default async function ChecklistPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!nieuwsbriefZichtbaar()) notFound()
  const locale = toLocale((await params).locale)
  return <ChecklistPagina locale={locale} onderdelen={checklist(locale)} />
}

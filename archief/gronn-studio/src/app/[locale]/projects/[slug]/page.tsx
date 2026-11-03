import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/json-ld"
import { ProjectVerhaal } from "@/components/gronn/project"
import { TerrasVerhaal } from "@/components/gronn/project-terras"
import { TERRAS, TERRAS_SLUG } from "@/lib/data/terras-geulle"
import { VIJVER, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { toLocale } from "@/lib/locale"
import { trailFor } from "@/lib/nav"
import { breadcrumbSchema, terrasSchema, vijverSchema } from "@/lib/schema"
import { pageMetadata } from "@/lib/seo"

// V5: alleen echt werk heeft een projectpagina — de vijverrenovatie en
// (sinds 24 sep 2026) het terras in Geulle. De plaatshouderprojecten
// uit src/lib/data/projects.ts hebben er geen meer (dynamicParams uit →
// 404), en staan ook niet meer in de sitemap.
export const dynamicParams = false

export function generateStaticParams() {
  return [{ slug: VIJVER_SLUG }, { slug: TERRAS_SLUG }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const p = slug === VIJVER_SLUG ? VIJVER : slug === TERRAS_SLUG ? TERRAS : null
  if (!p) return {}
  return pageMetadata({
    locale: toLocale(locale),
    path: `/projects/${slug}`,
    title: p.seoTitel,
    description: p.omschrijving,
    absoluteTitle: true,
    openGraph: { type: "article" },
  })
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (slug !== VIJVER_SLUG && slug !== TERRAS_SLUG) notFound()
  const l = toLocale(locale)
  if (slug === TERRAS_SLUG) {
    const trail = trailFor("projects", {
      label: { en: TERRAS.titel, nl: TERRAS.titel },
      path: `/projects/${slug}`,
    })
    return (
      <>
        <JsonLd data={terrasSchema(l)} />
        <JsonLd data={breadcrumbSchema(l, trail)} />
        <TerrasVerhaal locale={l} trail={trail} />
      </>
    )
  }
  const trail = trailFor("projects", {
    label: { en: VIJVER.titel, nl: VIJVER.titel },
    path: `/projects/${slug}`,
  })
  return (
    <>
      <JsonLd data={vijverSchema(l)} />
      <JsonLd data={breadcrumbSchema(l, trail)} />
      <ProjectVerhaal locale={l} trail={trail} />
    </>
  )
}

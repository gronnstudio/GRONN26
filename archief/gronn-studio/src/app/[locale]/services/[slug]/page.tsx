import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { JsonLd } from "@/components/json-ld"
import { BUSINESS } from "@/lib/business"
import { getContent, getServiceContent } from "@/lib/content"
import { pricingFor } from "@/lib/data/pricing"
import { getT, toLocale } from "@/lib/locale"
import { trailFor } from "@/lib/nav"
import { breadcrumbSchema, serviceSchema } from "@/lib/schema"
import { pageMetadata } from "@/lib/seo"
import { serviceImage } from "@/lib/placeholder"
import { DienstPagina } from "@/components/gronn/diensten"

export async function generateStaticParams() {
  const { services } = await getContent()
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const service = await getServiceContent(slug)
  if (!service) return {}
  const t = getT(toLocale(locale))
  return pageMetadata({
    locale: toLocale(locale),
    path: `/services/${slug}`,
    // Vak plus regio, zoals /services en de home: zo zoekt de buurt
    // ("vijver winterklaar maken Limburg"). De regio komt uit business.ts.
    title: `${t(service.title)} in ${BUSINESS.address.province}`,
    description: t(service.summary),
  })
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const service = await getServiceContent(slug)
  if (!service) notFound()

  const l = toLocale(locale)
  const trail = trailFor("services", {
    label: service.title,
    path: `/services/${service.slug}`,
  })
  const pricing = pricingFor(slug)

  return (
    <>
      <JsonLd
        data={serviceSchema(service, l, pricing, serviceImage(service))}
      />
      <JsonLd data={breadcrumbSchema(l, trail)} />
      <DienstPagina locale={l} service={service} trail={trail} />
    </>
  )
}

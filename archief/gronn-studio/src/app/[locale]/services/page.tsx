import { DienstenPagina } from "@/components/gronn/diensten"
import { BUSINESS } from "@/lib/business"
import { getContent } from "@/lib/content"
import { localeMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/json-ld"
import { toLocale } from "@/lib/locale"
import { serviceCatalogueSchema } from "@/lib/schema"

export const generateMetadata = localeMetadata("/services", {
  // Vak plus regio vooraan (Dan Hoye, lokaal gevonden worden), in de
  // woorden van de hometitel. De regio komt uit business.ts.
  title: {
    en: `Services for ecological gardens and ponds in ${BUSINESS.address.province}`,
    nl: `Diensten voor ecologische tuinen en vijvers in ${BUSINESS.address.province}`,
  },
  description: {
    en: `Design, building and care for gardens and ponds, from ${BUSINESS.address.city} in ${BUSINESS.address.province}. I come and look, draw a plan that fits you, build it and look after it. With a fixed price wherever possible.`,
    nl: `Ontwerp, aanleg en onderhoud voor tuinen en vijvers, vanuit ${BUSINESS.address.city} in ${BUSINESS.address.province}. Ik kom kijken, teken een plan dat bij je past, leg het aan en houd het bij. Waar het kan met een vaste prijs.`,
  },
})

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { services } = await getContent()
  return (
    <>
      <JsonLd data={serviceCatalogueSchema(services, toLocale(locale))} />
      <DienstenPagina locale={toLocale(locale)} services={services} />
    </>
  )
}

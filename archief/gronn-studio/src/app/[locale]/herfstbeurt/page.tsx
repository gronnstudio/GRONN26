import { JsonLd } from "@/components/json-ld"
import { HerfstbeurtPagina } from "@/components/gronn/herfstbeurt"
import { BUSINESS } from "@/lib/business"
import { getContent } from "@/lib/content"
import { toLocale } from "@/lib/locale"
import { trailFor } from "@/lib/nav"
import { breadcrumbSchema, serviceCatalogueSchema } from "@/lib/schema"
import { localeMetadata } from "@/lib/seo"

/** De drie najaarsdiensten op deze pagina, zoals `herfstbeurt.tsx` ze toont. */
const NAJAAR = ["leaf-net", "pond-autumn-service", "winterising"]

export const generateMetadata = localeMetadata("/herfstbeurt", {
  // Dienst plus plaats vooraan: zo zoekt de buurt ("vijver winterklaar
  // maken Stein"). De plaats komt uit business.ts.
  title: {
    en: `Pond winterising around ${BUSINESS.address.city}`,
    nl: `Vijver winterklaar maken rond ${BUSINESS.address.city}`,
  },
  description: {
    en: "Leaf net, autumn service and winterising for your pond around Stein, at fixed prices incl. VAT. Send a photo on WhatsApp.",
    nl: "Bladnet, najaarsbeurt en winterklaar maken voor je vijver rond Stein, voor vaste prijzen incl. btw. Stuur een foto via WhatsApp.",
  },
})

// De landingspagina van de najaarsactie (29 sep 2026). Niet in de menu's;
// de advertentie en de berichten wijzen hierheen. Hangt onder Diensten.
export default async function HerfstbeurtPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const { services } = await getContent()
  const najaar = services.filter((s) => NAJAAR.includes(s.slug))
  const trail = trailFor("services", { label: { en: "Pond ready for winter", nl: "Vijver winterklaar" }, path: "/herfstbeurt" })
  return (
    <>
      <JsonLd
        data={serviceCatalogueSchema(najaar, locale, {
          name: { en: "Pond ready for winter", nl: "Vijver winterklaar" },
          path: "/herfstbeurt",
        })}
      />
      <JsonLd data={breadcrumbSchema(locale, trail)} />
      <HerfstbeurtPagina locale={locale} trail={trail} />
    </>
  )
}

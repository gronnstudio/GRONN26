import { ProjectenPagina } from "@/components/gronn/projecten"
import { BUSINESS } from "@/lib/business"
import { toLocale } from "@/lib/locale"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/projects", {
  // De regio hoort bij de studio, niet bij het project: waar de
  // vijverrenovatie ligt, zegt de projecttekst niet (en er wordt geen
  // plaats bedacht).
  title: {
    en: `Projects by an ecological gardener in ${BUSINESS.address.province}`,
    nl: `Projecten van een ecologisch hovenier in ${BUSINESS.address.province}`,
  },
  description: {
    en: `Real work by GRØNN Studio, ecological gardener in ${BUSINESS.address.city}, ${BUSINESS.address.province}: gardens and ponds, told step by step.`,
    nl: `Echt werk van GRØNN Studio, ecologisch hovenier in ${BUSINESS.address.city}, ${BUSINESS.address.province}: tuinen en vijvers, stap voor stap verteld.`,
  },
})

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <ProjectenPagina locale={toLocale(locale)} />
}

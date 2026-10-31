import { Home } from "@/components/gronn/home"
import { getContent } from "@/lib/content"
import { toLocale } from "@/lib/locale"
import { nieuwsbriefZichtbaar } from "@/lib/nieuwsbrief"
import { localeMetadata } from "@/lib/seo"

// The root layout's title default carries the studio name already, so
// the homepage names what it sells rather than repeating the brand.
export const generateMetadata = localeMetadata("/", {
  title: {
    en: "GRØNN Studio · Ponds and gardens in and around Stein",
    nl: "GRØNN Studio · Vijvers en tuinen in Stein en omgeving",
  },
  // Eerst wat en voor wie (positionering, 3 okt 2026), dan wie.
  description: {
    en: "Ponds and natural gardens for homeowners in and around Stein, Limburg: renovation, maintenance and new gardens, with a fixed price up front where possible. I’m Nick Peters and you talk to me directly.",
    nl: "Vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving: renovatie, onderhoud en aanleg, waar het kan met een vaste prijs vooraf. Ik ben Nick Peters en je spreekt mij zelf.",
  },
  absoluteTitle: true,
})

// V5 (sep 2026): de publieke site van scratch — zie src/components/gronn.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Alleen de diensten komen nog uit de content: de teksten in Nicks stem
  // staan in code (teksten.ts), zodat een gepubliceerd editor-document
  // ze niet kan overschrijven.
  const { services } = await getContent()
  return <Home locale={toLocale(locale)} services={services} checklist={nieuwsbriefZichtbaar()} />
}

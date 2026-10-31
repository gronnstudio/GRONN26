import { OverPagina } from "@/components/gronn/over"
import { BUSINESS } from "@/lib/business"
import { toLocale } from "@/lib/locale"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/studio", {
  title: {
    en: `About Nick Peters, gardener in ${BUSINESS.address.city}, ${BUSINESS.address.province}`,
    nl: `Over Nick Peters, hovenier in ${BUSINESS.address.city}, ${BUSINESS.address.province}`,
  },
  description: {
    en: `I’m Nick Peters: father of two, gardener and ecological designer in ${BUSINESS.address.city}, ${BUSINESS.address.province}. I design and build gardens where people feel at home and there is room for other life too.`,
    nl: `Ik ben Nick Peters: vader van twee kinderen, hovenier en ecologisch ontwerper in ${BUSINESS.address.city}, ${BUSINESS.address.province}. Ik ontwerp en leg tuinen aan waarin mensen zich thuis voelen en waarin ook ruimte is voor ander leven.`,
  },
})

// De tekst staat in code (teksten.ts), niet in het editor-document:
// een gepubliceerd `studio`-blok zou Nicks eigen tekst anders overschrijven.
export default async function StudioPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <OverPagina locale={toLocale(locale)} />
}

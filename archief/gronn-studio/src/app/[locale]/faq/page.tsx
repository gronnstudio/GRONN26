import { JsonLd } from "@/components/json-ld"
import { VragenPagina } from "@/components/gronn/vragen"
import { vragen, vragenSchema } from "@/components/gronn/vragen-lijst"
import { getContent } from "@/lib/content"
import { localePath, toLocale } from "@/lib/locale"
import { nieuwsbriefZichtbaar } from "@/lib/nieuwsbrief"
import { localeMetadata, SITE_URL } from "@/lib/seo"

export const generateMetadata = localeMetadata("/faq", {
  title: { en: "Frequently asked questions", nl: "Veelgestelde vragen" },
  description: {
    en: "What does a garden design cost, what does advice at home cost, where do I work and how does a project go? Answers with the prices incl. VAT.",
    nl: "Wat kost een tuinontwerp, wat kost advies aan huis, waar werk ik en hoe gaat een traject? Antwoorden met de prijzen incl. btw.",
  },
})

// Eén lijst voor de pagina én de FAQPage-JSON-LD: wat Google en een
// AI-hulp lezen, is letterlijk wat er staat (vragen.spec.ts).
export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const { services } = await getContent()
  const lijst = vragen(services, locale)
  return (
    <>
      <JsonLd data={vragenSchema(lijst, locale, `${SITE_URL}${localePath(locale, "/faq")}`)} />
      <VragenPagina locale={locale} lijst={lijst} checklist={nieuwsbriefZichtbaar()} />
    </>
  )
}

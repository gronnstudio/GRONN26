import { JsonLd } from "@/components/json-ld"
import { StackPagina } from "@/components/gronn/stack"
import { toLocale } from "@/lib/locale"
import { trailFor } from "@/lib/nav"
import { breadcrumbSchema } from "@/lib/schema"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/stack", {
  title: { en: "Tech stack: what I work with", nl: "Techniek: waar ik mee werk" },
  description: {
    en: "From the iPhone and phone stand on site to the code under gronn.studio: every tool, what I use it for and why, with versions read straight from the code.",
    nl: "Van de iPhone en het telefoonstatief op de bouwplaats tot de code onder gronn.studio: elk stuk gereedschap, waar ik het voor gebruik en waarom, met versies rechtstreeks uit de code.",
  },
})

// Hangt onder Studio: het kruimelpad, het Studio-paneel en de dock (die
// Studio laat oplichten) zeggen alle drie hetzelfde.
export default async function StackPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const trail = trailFor("studio", { label: { en: "Tech stack", nl: "Techniek" }, path: "/stack" })
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, trail)} />
      <StackPagina locale={locale} trail={trail} />
    </>
  )
}

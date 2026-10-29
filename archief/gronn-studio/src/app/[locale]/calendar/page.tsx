import { JsonLd } from "@/components/json-ld"
import { TuinkalenderPagina } from "@/components/gronn/tuinkalender"
import { toLocale } from "@/lib/locale"
import { trailFor } from "@/lib/nav"
import { breadcrumbSchema } from "@/lib/schema"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/calendar", {
  title: { en: "Garden calendar", nl: "Tuinkalender" },
  description: {
    en: "One rule of thumb per month for garden and pond, plus today's sunrise, sunset and moon phase, calculated for Stein.",
    nl: "Eén vuistregel per maand voor tuin en vijver, plus de zonsopkomst, zonsondergang en maanfase van vandaag, uitgerekend voor Stein.",
  },
})

// Hangt onder Studio, zoals /stack: de pagina achter de rechterbubbel
// (`HemelBubbel`), niet in de menu's of de dock.
export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const trail = trailFor("studio", { label: { en: "Garden calendar", nl: "Tuinkalender" }, path: "/calendar" })
  return (
    <>
      <JsonLd data={breadcrumbSchema(locale, trail)} />
      <TuinkalenderPagina locale={locale} trail={trail} />
    </>
  )
}

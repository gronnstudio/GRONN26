import { localeMetadata } from "@/lib/seo"
import { BusinessTermsContent } from "./business-terms-content"

export const generateMetadata = localeMetadata("/voorwaarden-zakelijk", {
  title: { en: "General Terms — business clients", nl: "Algemene voorwaarden — zakelijk" },
  description: {
    en: "General terms and conditions of GRØNN Studio for business clients.",
    nl: "De algemene voorwaarden van GRØNN Studio voor zakelijke opdrachtgevers.",
  },
})

export default function BusinessTermsPage() {
  return <BusinessTermsContent />
}

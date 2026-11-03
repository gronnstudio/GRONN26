import { TermsContent } from "./terms-content"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/voorwaarden", {
  title: { en: "General Terms", nl: "Algemene voorwaarden" },
  description: {
    en: "General terms and conditions of GRØNN Studio.",
    nl: "De algemene voorwaarden van GRØNN Studio.",
  },
})

export default function TermsPage() {
  return <TermsContent />
}

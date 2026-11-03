import { PrivacyContent } from "./privacy-content"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/privacy", {
  title: { en: "Privacy Policy", nl: "Privacyverklaring" },
  description: {
    en: "How GRØNN Studio handles personal data: what we collect, why, and your rights under the AVG/GDPR.",
    nl: "Hoe GRØNN Studio omgaat met persoonsgegevens: wat we verzamelen, waarom, en je rechten onder de AVG/GDPR.",
  },
})

export default function PrivacyPage() {
  return <PrivacyContent />
}

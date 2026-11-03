import { localeMetadata } from "@/lib/seo"
import { PortalTermsContent } from "./portal-terms-content"

export const generateMetadata = localeMetadata("/portaal", {
  title: { en: "Client portal terms", nl: "Gebruiksvoorwaarden klantenportaal" },
  description: {
    en: "Terms of use for the GRØNN Studio client portal.",
    nl: "De gebruiksvoorwaarden van het klantenportaal van GRØNN Studio.",
  },
})

export default function PortalTermsPage() {
  return <PortalTermsContent />
}

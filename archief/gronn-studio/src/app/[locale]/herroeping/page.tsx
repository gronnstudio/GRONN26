import { localeMetadata } from "@/lib/seo"
import { WithdrawalFormContent } from "./withdrawal-form-content"

export const generateMetadata = localeMetadata("/herroeping", {
  title: {
    en: "Model withdrawal form",
    nl: "Modelformulier voor ontbinding / herroeping",
  },
  description: {
    en: "The statutory model form for withdrawing from an agreement with GRØNN Studio within the cooling-off period.",
    nl: "Het wettelijke modelformulier om een overeenkomst met GRØNN Studio binnen de bedenktijd te ontbinden.",
  },
})

export default function WithdrawalFormPage() {
  return <WithdrawalFormContent />
}

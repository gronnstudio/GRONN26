import { ColofonContent } from "./colofon-content"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/colofon", {
  title: { en: "Colophon", nl: "Colofon" },
  description: {
    en: "Business details, terms and policies of GRØNN Studio in one place.",
    nl: "Bedrijfsgegevens, voorwaarden en beleid van GRØNN Studio op één plek.",
  },
})

export default function ColofonPage() {
  return <ColofonContent />
}

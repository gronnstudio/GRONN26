import { IntakePageContent } from "./intake-content"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/contact/intake", {
  title: { en: "Design intake", nl: "Intake tuinontwerp" },
  description: {
    en: "The long form: everything a garden design needs to know before the first line is drawn. Fill in what you know, skip what you do not.",
    nl: "Het uitgebreide formulier: alles wat een tuinontwerp moet weten voordat er één lijn getekend wordt. Vul in wat je weet, sla over wat je niet weet.",
  },
})

export default function IntakePage() {
  return <IntakePageContent />
}

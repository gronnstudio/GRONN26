import { pick, type Locale } from "@/lib/i18n"
import { VCARD_PAD } from "@/lib/vcard"

import { Knop } from "./knop"

/**
 * "Zet in je contacten" — downloadt de vCard (`/contact.vcf`), die
 * bij het bouwen uit `business.ts` wordt opgebouwd (`src/lib/vcard.ts`,
 * `src/app/contact.vcf/route.ts`). Geen gegevens hier: alleen de knop.
 */
export function ContactKaart({ locale }: { locale: Locale }) {
  return (
    <Knop href={VCARD_PAD} soort="rand" klein download="gronn-studio.vcf">
      {pick({ nl: "Zet in je contacten", en: "Save to contacts" }, locale)}
    </Knop>
  )
}

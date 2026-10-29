"use client"

import { LegalDocumentView } from "@/components/legal/legal-document"
import { PRIVACY } from "@/lib/data/legal"

// De tekst zelf staat in src/lib/data/legal/privacy.ts.
//
// Twee dingen die daar zijn gerepareerd: Supabase ontbrak in de opsomming
// van verwerkers — terwijl dat de partij is die klantaccounts en dossiers
// bewaart — en er stond een zin in die zei dat aanvragen niet in een
// database worden opgeslagen. Dat klopte vóór het klantenportaal.
export function PrivacyContent() {
  return (
    <LegalDocumentView
      doc={PRIVACY}
      label={{ en: "Legal", nl: "Juridisch" }}
      lines={[{ en: "Privacy policy", nl: "Privacyverklaring" }]}
    />
  )
}

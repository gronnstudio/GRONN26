"use client"

import { LegalDocumentView } from "@/components/legal/legal-document"
import { PORTAAL } from "@/lib/data/legal"

export function PortalTermsContent() {
  return (
    <LegalDocumentView
      doc={PORTAAL}
      label={{ en: "Legal", nl: "Juridisch" }}
      lines={[{ en: "Client portal terms", nl: "Voorwaarden klantenportaal" }]}
    />
  )
}

"use client"

import { LegalDocumentView } from "@/components/legal/legal-document"
import { VOORWAARDEN_ZAKELIJK } from "@/lib/data/legal"

export function BusinessTermsContent() {
  return (
    <LegalDocumentView
      doc={VOORWAARDEN_ZAKELIJK}
      label={{ en: "Legal", nl: "Juridisch" }}
      lines={[{ en: "Business terms", nl: "Algemene voorwaarden zakelijk" }]}
    />
  )
}

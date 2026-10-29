"use client"

import { LegalDocumentView } from "@/components/legal/legal-document"
import { HERROEPING } from "@/lib/data/legal"

export function WithdrawalFormContent() {
  return (
    <LegalDocumentView
      doc={HERROEPING}
      label={{ en: "Legal", nl: "Juridisch" }}
      lines={[{ en: "Withdrawal form", nl: "Modelformulier herroeping" }]}
    />
  )
}

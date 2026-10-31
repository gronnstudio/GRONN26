"use client"

import { LegalDocumentView } from "@/components/legal/legal-document"
import { VOORWAARDEN_CONSUMENT } from "@/lib/data/legal"

// De tekst zelf staat in src/lib/data/legal/voorwaarden-consument.ts.
//
// Hij stond hier, als JSX, tweetalig. Dat is op drie punten veranderd en
// alle drie zijn ze inhoudelijk, niet cosmetisch: er staat nu een artikel
// over de veertien dagen bedenktijd in (dat ontbrak, terwijl de intake bij
// de klant thuis plaatsvindt), de stilzwijgende verlenging van het
// abonnement is uit de zwarte lijst van art. 6:236 sub j BW gehaald, en de
// tekst is nog uitsluitend Nederlands omdat een bindende tekst in twee
// talen twee bindende teksten zijn.
export function TermsContent() {
  return (
    <LegalDocumentView
      doc={VOORWAARDEN_CONSUMENT}
      label={{ en: "Legal", nl: "Juridisch" }}
      lines={[{ en: "General terms", nl: "Algemene voorwaarden" }]}
    />
  )
}

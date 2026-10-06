import { HERROEPING } from "./herroeping"
import { PRIVACY } from "./privacy"
import type { LegalDocument } from "./types"
import { VOORWAARDEN_CONSUMENT } from "./voorwaarden-consument"

// De documenten die als PDF bij een offerte of op het dashboard horen,
// met de bestandsnaam in public/documenten (gemaakt door scripts/documenten.mjs).
export const DOCUMENTEN: { doc: LegalDocument; pagina: string; pdf: string }[] = [
  { doc: VOORWAARDEN_CONSUMENT, pagina: "/voorwaarden", pdf: "GRONN-algemene-voorwaarden-particulier.pdf" },
  { doc: HERROEPING, pagina: "/herroeping", pdf: "GRONN-modelformulier-herroeping.pdf" },
  { doc: PRIVACY, pagina: "/privacy", pdf: "GRONN-privacyverklaring.pdf" },
]

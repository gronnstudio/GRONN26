import bron from "./pdf-bron.json"
import { openPlaces, type LegalDocument } from "./types"

// Welke juridische documenten als PDF te downloaden zijn.
//
// Art. 6:234 BW: algemene voorwaarden gaan elektronisch naar de klant "op
// zodanige wijze dat deze door hem kunnen worden opgeslagen". Een PDF doet
// dat, ook op een telefoon zonder "Opslaan als PDF" in het printvenster.
//
// Een document krijgt ALLEEN een PDF als er geen open plek ([[...]]) meer
// in staat: een PDF met gaten erin neemt die gaten mee in een
// overeenkomst. De bestanden maakt `npm run juridisch:pdf` uit de pagina
// zelf; pdf-bron.json houdt per document de datum en een vingerafdruk van
// de tekst bij, en juridisch-pdf.spec.ts rekent die na.

type Bron = Record<string, { bestand: string; updated: string; vingerafdruk: string }>

export function juridischePdf(doc: LegalDocument): { href: string; naam: string } | null {
  const b = (bron as Bron)[doc.id]
  if (!b || b.updated !== doc.updated || openPlaces(doc).length > 0) return null
  return {
    href: `/pdf/juridisch/${b.bestand}`,
    // Een schuine streep mag niet in een bestandsnaam.
    naam: `GRØNN Studio – ${doc.title.replace(/\s*\/\s*/g, " of ")} (${doc.updated}).pdf`,
  }
}

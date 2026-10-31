"use client"

import { DocumentSheet } from "@/app/dashboard/document-sheet"
import { blankDocument, type StudioDocument } from "@/lib/documents"

// A two-variant quote, invented here and nowhere else.
//
// The variant names are deliberately long: they are what makes the two
// money columns wider than the amounts under them, which is the case the
// gutter exists for. A short name would let the test pass on a sheet
// that is still broken for a real one.
function twoVariantQuote(): StudioDocument {
  const base = blankDocument("offerte")
  return {
    ...base,
    client: "Voorbeeldklant\nVoorbeeldstraat 1\n1000 AA Voorbeeldstad",
    title: "Voorbeeldtuin",
    intro: "Een verzonnen offerte, alleen voor deze werkbank.",
    columns: 2,
    variantNames: ["Basisaanleg", "Met cortenstaal", "C"],
    amountsHeading: "Werkzaamheden en prijsopbouw",
    items: [
      {
        id: "line-a",
        description: "01 · Grondwerk",
        detail: "Afgraven, profileren en verdichten.",
        included: false,
        amounts: [1000, 1000, null],
      },
      {
        id: "line-b",
        description: "02 · Optie — cortenstalen kantopsluiting",
        detail: "Lage rand tussen gazon en borders.",
        included: false,
        amounts: [null, 400, null],
      },
    ],
  }
}

export function SheetPreview() {
  // A made-up account number: the real one is server-only and has no
  // business travelling to a workbench.
  return (
    <div style={{ background: "#e6e4dd", padding: "20px" }}>
      <DocumentSheet doc={twoVariantQuote()} iban="NL00 BANK 0000 0000 00" />
    </div>
  )
}

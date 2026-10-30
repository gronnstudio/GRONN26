"use client"

// Twee knoppen onder de offerte: PDF bewaren en printen. Allebei via het
// printvenster van de browser, zonder extra pakket; bij PDF staat de
// bestandsnaam al goed, zodat "Opslaan als PDF" meteen klopt.
export function OfferteKnoppen({ naam }: { naam: string }) {
  const druk = (titel?: string) => {
    const oud = document.title
    if (titel) document.title = titel
    window.print()
    document.title = oud
  }
  return (
    <div className="mt-8 flex flex-wrap gap-3 print:hidden">
      <button type="button" onClick={() => druk(naam)} className="knop bg-oranje text-antraciet">
        Download als PDF
      </button>
      <button type="button" onClick={() => druk()} className="knop border border-inkt">
        Printen
      </button>
    </div>
  )
}

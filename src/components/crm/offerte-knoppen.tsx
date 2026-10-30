"use client"

import { useState } from "react"

// Twee knoppen onder de offerte (Nick, 30 okt 2026: "1 knop voor pdf, 1 knop
// voor printen"). PDF maakt in de browser een A4-bestand van het blad en
// downloadt het meteen; Printen opent het printvenster. Beide pakketten laden
// pas bij de klik, zodat de pagina zelf licht blijft (ADR 0011).
export function OfferteKnoppen({ naam }: { naam: string }) {
  const [bezig, setBezig] = useState(false)
  const pdf = async () => {
    const blad = document.querySelector<HTMLElement>(".offerte-druk")
    if (!blad) return
    setBezig(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")])
      const doek = await html2canvas(blad, { scale: 2, backgroundColor: "#ffffff", ignoreElements: (el) => el.hasAttribute("data-geen-pdf"),
        // Het woordmerk als PNG (dezelfde vector, gerasterd): html2canvas tekent deze SVG niet goed. En geen witrand boven de kop.
        onclone: (d) => {
          d.querySelectorAll<HTMLImageElement>('img[src="/brand/woordmerk-primair.svg"]').forEach((i) => (i.src = "/brand/woordmerk-primair.png"))
          const b = d.querySelector<HTMLElement>(".offerte-druk")
          if (b) b.style.paddingTop = "0"
        },
      })
      const doc = new jsPDF({ unit: "mm", format: "a4" })
      const breed = 210
      const hoog = 297
      // Het blad als één lange afbeelding, in A4-stukken over de pagina's verdeeld.
      const perPagina = Math.floor((doek.width * hoog) / breed)
      for (let y = 0, p = 0; y < doek.height; y += perPagina, p++) {
        const stuk = document.createElement("canvas")
        stuk.width = doek.width
        stuk.height = Math.min(perPagina, doek.height - y)
        stuk.getContext("2d")!.drawImage(doek, 0, -y)
        if (p) doc.addPage()
        doc.addImage(stuk.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, breed, (stuk.height * breed) / doek.width)
      }
      doc.save(`${naam.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim()}.pdf`)
    } finally {
      setBezig(false)
    }
  }
  return (
    <div data-geen-pdf className="mt-8 flex flex-wrap gap-3 print:hidden">
      <button type="button" onClick={pdf} disabled={bezig} className="knop bg-oranje text-antraciet disabled:opacity-60">
        {bezig ? "PDF maken…" : "Download PDF"}
      </button>
      <button type="button" onClick={() => window.print()} className="knop border border-inkt">
        Printen
      </button>
    </div>
  )
}

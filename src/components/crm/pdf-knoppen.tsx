"use client"

import { useState, useSyncExternalStore } from "react"

// Twee knoppen onder de offerte en in de calculatie (Nick, 30 okt 2026: "1 knop voor pdf, 1 knop
// voor printen"). PDF maakt in de browser een A4-bestand van het blad en
// downloadt het meteen; Printen opent het printvenster. Beide pakketten laden
// pas bij de klik, zodat de pagina zelf licht blijft (ADR 0011).
const geen = () => () => {}

export function PdfKnoppen({ naam, doel = ".offerte-druk", uit = false, className = "mt-8 flex flex-wrap gap-3" }: { naam: string; doel?: string; uit?: boolean; className?: string }) {
  const [bezig, setBezig] = useState(false)
  // Terug alleen als Nick hier vanuit het dashboard kwam; de klant opent de link los.
  const terug = useSyncExternalStore(geen, () => document.referrer.includes("/dashboard"), () => false)
  const pdf = async () => {
    const blad = document.querySelector<HTMLElement>(doel)
    if (!blad) return
    setBezig(true)
    // Een blad dat alleen bij printen zichtbaar is (de calculatie), even buiten beeld tonen om het te kunnen tekenen.
    const verborgen = getComputedStyle(blad).display === "none"
    const oud = blad.getAttribute("style")
    if (verborgen) blad.setAttribute("style", "display:block;position:absolute;left:-10000px;top:0;width:794px")
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
      if (verborgen) (oud === null ? blad.removeAttribute("style") : blad.setAttribute("style", oud))
      setBezig(false)
    }
  }
  return (
    <div data-geen-pdf className={`${className} print:hidden`}>
      {terug && (
        <button type="button" onClick={() => history.back()} className="knop border border-inkt">
          ← Terug
        </button>
      )}
      <button type="button" onClick={pdf} disabled={bezig || uit} className="knop bg-oranje text-antraciet disabled:opacity-60">
        {bezig ? "PDF maken…" : "Download PDF"}
      </button>
      <button type="button" onClick={() => window.print()} disabled={uit} className="knop border border-inkt disabled:opacity-50">
        Printen
      </button>
    </div>
  )
}

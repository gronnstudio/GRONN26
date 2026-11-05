"use client"

import { useState, useSyncExternalStore } from "react"

// Twee knoppen onder de offerte en in de calculatie (Nick, 30 okt 2026: "1 knop voor pdf, 1 knop
// voor printen"). PDF maakt in de browser een A4-bestand van het blad en
// downloadt het meteen; Printen opent het printvenster. Beide pakketten laden
// pas bij de klik, zodat de pagina zelf licht blijft (ADR 0011).
const geen = () => () => {}

export function PdfKnoppen({ naam, doel = ".offerte-druk", uit = false, className = "mt-8 flex flex-wrap gap-3", crm = false }: { naam: string; doel?: string; uit?: boolean; className?: string; crm?: boolean }) {
  const [bezig, setBezig] = useState(false)
  // Terug alleen als Nick hier vanuit het dashboard kwam; de klant opent de link los.
  const terug = useSyncExternalStore(geen, () => document.referrer.includes("/dashboard"), () => false)
  const pdf = async () => {
    const blad = document.querySelector<HTMLElement>(doel)
    if (!blad) return
    setBezig(true)
    // Een blad dat alleen bij printen zichtbaar is (de calculatie): een zichtbare kopie direct onder html tekenen, buiten de opmaak van het dashboard.
    const verborgen = getComputedStyle(blad).display === "none"
    const kopie = verborgen ? (blad.cloneNode(true) as HTMLElement) : null
    if (kopie) {
      kopie.classList.remove("hidden")
      kopie.setAttribute("style", "display:block;position:fixed;left:0;top:0;width:794px;z-index:9999")
      document.documentElement.appendChild(kopie)
    }
    const bron = kopie ?? blad
    // html2canvas meet verkeerd in een gescrolde pagina: even naar boven, daarna terug.
    const scroll = window.scrollY
    window.scrollTo(0, 0)
    // Waar een pagina niet mag knippen (Nick, 5 nov 2026: "regels lopen half door van pagina naar
    // pagina"): elke regel, alinea, kop en tabelrij, in CSS-pixels vanaf de bovenkant van het blad.
    const rb = bron.getBoundingClientRect()
    // onclone haalt de bovenruimte van de offerte weg: de blokken schuiven even hoog mee.
    const weg = bron.matches(".offerte-druk") ? parseFloat(getComputedStyle(bron).paddingTop) || 0 : 0
    const blokken = [...bron.querySelectorAll<HTMLElement>("tr, li, dl > div, p, h1, h2, h3, img, [data-blok]")]
      .filter((el) => !el.closest("[data-geen-pdf]"))
      // Een kop blijft bij wat eronder staat: hij telt als blok tot 80 px onder zich.
      .map((el) => { const r = el.getBoundingClientRect(); return [r.top - rb.top - weg, r.bottom - rb.top - weg + (/^H[1-3]$/.test(el.tagName) ? 80 : 0)] as const })
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")])
      const doek = await html2canvas(bron, { scale: 2, backgroundColor: "#ffffff", ignoreElements: (el) => el.hasAttribute("data-geen-pdf"),
        // Het woordmerk als PNG (dezelfde vector, gerasterd): html2canvas tekent deze SVG niet goed. En geen witrand boven de kop.
        onclone: (d) => {
          d.querySelectorAll<HTMLImageElement>('img[src$="/brand/woordmerk-primair.svg"], img[src$="/brand/woordmerk-primair-antraciet.svg"]').forEach((i) => (i.src = i.src.replace(/\.svg$/, ".png")))
          const b = d.querySelector<HTMLElement>(".offerte-druk")
          if (b) b.style.paddingTop = "0"
        },
      })
      const doc = new jsPDF({ unit: "mm", format: "a4" })
      // A4 in CSS-pixels van dit blad, met 12 mm wit boven (vanaf pagina 2) en onder.
      const s = doek.width / rb.width
      const pagina = (rb.width * 297) / 210
      const marge = (rb.width * 12) / 210
      // Witruimte onderaan het blad geeft geen lege laatste pagina.
      const totaal = Math.min(doek.height / s, Math.max(0, ...blokken.map(([, b]) => b)) + 24)
      for (let y = 0, p = 0; y < totaal - 1; p++) {
        const boven = p ? marge : 0
        let eind = y + pagina - marge - boven
        // Knipt de grens door een regel heen, dan begint die regel op de volgende pagina.
        if (eind < totaal) for (const [t, b] of blokken) if (t > y && t < eind && b > eind && b - t < pagina / 2) eind = t
        eind = Math.min(eind, totaal)
        const stuk = document.createElement("canvas")
        stuk.width = doek.width
        stuk.height = Math.round(pagina * s)
        const c = stuk.getContext("2d")!
        c.fillStyle = "#ffffff"
        c.fillRect(0, 0, stuk.width, stuk.height)
        const h = Math.round((eind - y) * s)
        c.drawImage(doek, 0, Math.round(y * s), doek.width, h, 0, Math.round(boven * s), doek.width, h)
        if (p) doc.addPage()
        doc.addImage(stuk.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 210, 297)
        y = eind
      }
      doc.save(`${naam.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim()}.pdf`)
    } finally {
      kopie?.remove()
      window.scrollTo(0, scroll)
      setBezig(false)
    }
  }
  return (
    <div data-geen-pdf className={`${className} print:hidden`}>
      {terug && !crm && (
        <button type="button" onClick={() => history.back()} className="knop border border-inkt">
          ← Terug
        </button>
      )}
      <button type="button" onClick={pdf} disabled={bezig || uit} className={`${crm ? "crm-knop-groen" : "knop bg-oranje text-antraciet"} disabled:opacity-60`}>
        {bezig ? "PDF maken…" : "Download PDF"}
      </button>
      <button type="button" onClick={() => window.print()} disabled={uit} className={`${crm ? "crm-knop-rand" : "knop border border-inkt"} disabled:opacity-50`}>
        Printen
      </button>
    </div>
  )
}

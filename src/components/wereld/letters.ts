// Letter voor letter oplichten (eigenaar, 5 okt 2026: "kunnen we dit niet beter
// letter voor letter doen"). Elke letter krijgt een leespositie: de bovenkant van
// zijn regel plus hoe ver hij in die regel staat (links → rechts = één regelhoogte).
// Zo loopt het oplichten tijdens het scrollen van links naar rechts door de regel.
export function lichtLetters(woorden: HTMLElement[], vh: number, stil: boolean, laag: string) {
  const grens = vh * 0.7
  for (const w of woorden) {
    const letters = w.children as HTMLCollectionOf<HTMLElement>
    if (stil) {
      for (const l of letters) l.style.opacity = ""
      continue
    }
    const blok = (w.closest("[data-onthul]") as HTMLElement | null) ?? w
    const b = blok.getBoundingClientRect()
    const r = w.getBoundingClientRect()
    if (r.height === 0) continue // verborgen taal
    const regel = r.height
    for (const l of letters) {
      const x = r.left - b.left + l.offsetLeft
      const pos = r.top + (x / Math.max(b.width, 1)) * regel
      l.style.opacity = pos < grens ? "" : laag
    }
  }
}

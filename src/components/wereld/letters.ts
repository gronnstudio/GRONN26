// Letter voor letter oplichten (eigenaar, 5 okt 2026: "kunnen we dit niet beter
// letter voor letter doen"). Elke letter krijgt een leespositie: de bovenkant van
// zijn regel plus hoe ver hij in die regel staat (links → rechts = één regelhoogte).
// Zo loopt het oplichten tijdens het scrollen van links naar rechts door de regel,
// als een zachte golf: over anderhalve regel gaat een letter van gedimd naar vol.
//
// Snel gehouden: eerst alles lezen, dan pas schrijven (geen layout per letter),
// alleen de woorden waar de grens doorheen loopt worden per letter bekeken, en een
// woord wordt alleen aangeraakt als zijn stand verandert.
type Stand = "aan" | "uit" | "deels"

export function lichtLetters(woorden: HTMLElement[], vh: number, stil: boolean, laag: string) {
  const grens = vh * 0.7
  const zacht = (pos: number, regel: number, laagN: number) =>
    laagN + (1 - laagN) * Math.min(1, Math.max(0, (grens - pos) / (regel * 1.5)))
  const blokken = new Map<Element, DOMRect>()
  const plan: { w: HTMLElement; stand: Stand; posities?: number[]; h?: number[] }[] = []

  // 1. lezen
  for (const w of woorden) {
    if (stil) {
      plan.push({ w, stand: "aan" })
      continue
    }
    const r = w.getBoundingClientRect()
    if (r.height === 0) continue // verborgen taal
    if (r.bottom < grens - r.height * 3) { plan.push({ w, stand: "aan" }); continue }
    if (r.top > grens + 2) { plan.push({ w, stand: "uit" }); continue }
    const blok = w.closest("[data-onthul]") ?? w
    let b = blokken.get(blok)
    if (!b) { b = blok.getBoundingClientRect(); blokken.set(blok, b) }
    const breedte = Math.max(b.width, 1)
    const begin = r.top + ((r.left - b.left) / breedte) * r.height
    const eind = r.top + ((r.right - b.left) / breedte) * r.height
    if (eind < grens - r.height * 1.5) { plan.push({ w, stand: "aan" }); continue }
    if (begin >= grens) { plan.push({ w, stand: "uit" }); continue }
    const posities = [...(w.children as HTMLCollectionOf<HTMLElement>)].map(
      (l) => r.top + ((r.left - b.left + l.offsetLeft - w.offsetLeft) / breedte) * r.height,
    )
    plan.push({ w, stand: "deels", posities, h: [r.height] })
  }

  // 2. schrijven
  for (const { w, stand, posities, h } of plan) {
    // hele woorden dimmen we als woord (goedkoop); alleen het woord op de grens per letter
    const was = w.dataset.licht
    if (stand !== "deels" && was === stand) continue
    w.dataset.licht = stand
    w.style.opacity = stand === "uit" ? laag : ""
    const letters = w.children as HTMLCollectionOf<HTMLElement>
    if (stand === "deels") {
      const l = Number(laag)
      for (let i = 0; i < letters.length; i++) {
        const o = zacht(posities![i], h![0], l)
        letters[i].style.opacity = o >= 0.999 ? "" : o.toFixed(3)
      }
    }
    else if (was === "deels") for (let i = 0; i < letters.length; i++) letters[i].style.opacity = ""
  }
}

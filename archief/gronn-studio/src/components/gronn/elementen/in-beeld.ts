// Eén keer meekijken tot een element het scherm in komt — de trekker
// onder Kop, BeeldOnthulling en TelOp. Het element zelf wordt bekeken,
// niet wat erin gemaskeerd zit: een volledig weggeknipt element meldt
// nooit een snijvlak (zie de gotcha in CLAUDE.md over `whileInView`).
//
// `-10%` onderaan: pas als iets echt een stukje in beeld staat, zodat de
// beweging niet net onder de rand van het scherm wordt opgemaakt.

export function eenmaalInBeeld(
  el: Element,
  binnen: () => void,
  /** Krijgt de allereerste meting, ook als die buiten beeld is. */
  eerst?: (e: IntersectionObserverEntry) => void
): () => void {
  let eerste = true
  const io = new IntersectionObserver(
    ([e]) => {
      if (eerste) {
        eerste = false
        eerst?.(e)
      }
      if (!e.isIntersecting) return
      io.disconnect()
      binnen()
    },
    { rootMargin: "0px 0px -10% 0px" }
  )
  io.observe(el)
  return () => io.disconnect()
}

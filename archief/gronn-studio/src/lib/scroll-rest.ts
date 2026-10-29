"use client"

import { useSyncExternalStore } from "react"

/**
 * Leest de bezoeker, of kijkt hij rond?
 *
 * ── WAAROM DIT EEN GEDEELDE BRON IS ─────────────────────────────────
 *
 * Twee balken hangen hieraan: de bovenbalk met het logo en de twee
 * instellingen, en de dock onderin. Ze horen op precies hetzelfde moment
 * te wijken en op precies hetzelfde moment terug te komen — anders zie
 * je er één vertrekken en de ander achterblijven, en dat leest als een
 * storing.
 *
 * Twee componenten die elk hun eigen `scroll`-luisteraar opzetten,
 * komen daar niet gegarandeerd uit: ze zien dezelfde gebeurtenissen,
 * maar hun `lastY` loopt uiteen zodra er één later mount. Eén store,
 * één luisteraar, één waarheid.
 *
 * ── DE DREMPELS ZIJN NIET NIEUW ─────────────────────────────────────
 *
 * 80px en een dode zone van ±4px komen letterlijk uit de tuck van het
 * oude menuwiel, en daarvóór uit het concept. Ze staan er om dezelfde
 * reden: kleine uitslagen mogen niet meetellen, zodat de uitloop van
 * Lenis en het rubber-banden van iOS de balken niet laten flikkeren.
 *
 * ── WAAROM `wek()` BESTAAT ──────────────────────────────────────────
 *
 * Toetsenbordfocus in een van de balken moet ze terugbrengen, óók als de
 * bezoeker niet scrolt. Zonder dat kan iemand die tabt in een
 * ingeklapte balk belanden waarvan de helft `inert` staat — en dan is de
 * navigatie met een toetsenbord onbereikbaar. De vlag vervalt vanzelf
 * zodra er weer naar beneden wordt gelezen.
 */

let rust = false
let handmatigWakker = false
let vorigeY = 0
let gekoppeld = false

const luisteraars = new Set<() => void>()

function meld() {
  for (const l of luisteraars) l()
}

function meet() {
  const y = window.scrollY
  const dy = y - vorigeY
  vorigeY = y

  const was = rust
  if (y < 80) {
    rust = false
    handmatigWakker = false
  } else if (dy > 4) {
    rust = true
  } else if (dy < -4) {
    rust = false
    handmatigWakker = false
  }
  if (rust !== was) meld()
}

function abonneer(cb: () => void) {
  luisteraars.add(cb)
  if (!gekoppeld) {
    vorigeY = window.scrollY
    meet()
    window.addEventListener("scroll", meet, { passive: true })
    gekoppeld = true
  }
  return () => {
    luisteraars.delete(cb)
    if (luisteraars.size === 0) {
      window.removeEventListener("scroll", meet)
      gekoppeld = false
    }
  }
}

/** Staan de balken in rust — dus: is de bezoeker aan het lezen? */
export function useInRust(): boolean {
  return useSyncExternalStore(
    abonneer,
    () => rust && !handmatigWakker,
    // Op de server weten we niets van scrollen, en de uitgeklapte stand
    // is de veilige: daar staat alles er nog.
    () => false
  )
}

/** Breng de balken terug, ook zonder scrollen. */
export function wekBalken() {
  if (handmatigWakker) return
  handmatigWakker = true
  meld()
}

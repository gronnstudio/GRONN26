// Het metroraster van /services (eigenaar, 29 sep 2026: "we kunnen metro
// aanhouden als dat mooi uitziet, een groot blok, twee kleine ernaast,
// beetje golden ratio principe aanhouden en daar op de achtergrond ook
// zo'n curve achterzetten"). Twee zuivere functies, zonder JSX, zodat
// tests/e2e/diensten-tegels.spec.ts ze rechtstreeks kan importeren:
//   - `metroIndeling`: welke kaart waar staat;
//   - `guldenSpiraal`: de spiraal van gulden vierkanten erachter.

/** De gulden snede, φ = (1 + √5) / 2. */
export const PHI = (1 + Math.sqrt(5)) / 2

/**
 * De kolommen van het raster vanaf `lg`, als `grid-template-columns`.
 *
 * Twee kolommen in φ : 1 die om en om van kant wisselen passen niet in één
 * vast raster van twee sporen: rechts staat dan de smalle kolom, ook als
 * het blok daar hoort. Daarom drie sporen: buiten twee gelijke (de kleine
 * kaart, s), in het midden het verschil. Het blok beslaat midden plus één
 * buitenspoor plus één tussenruimte, en dan moet gelden
 *   midden + tussenruimte + s = φ · s,  met  s = (breedte − tussenruimte) / φ²
 * zodat blok : klein precies φ : 1 is, links én rechts, en de grens op
 * dezelfde plek ligt als in een raster van `1.618fr 1fr` (de kop, een
 * liggende kaart). Het middenspoor is dus (breedte − 16px) · (φ − 1)/φ² − 16px.
 */
export function metroKolommen(tussenruimte = 16): string {
  const midden = ((PHI - 1) / (PHI * PHI)).toFixed(6)
  return `minmax(0, 1fr) calc((100% - ${tussenruimte}px) * ${midden} - ${tussenruimte}px) minmax(0, 1fr)`
}

/**
 * De rol van een kaart in het raster (vanaf `lg`; eronder is alles een
 * gewone kaart in een stapel):
 *  - `groot`: het grote blok van een eenheid, twee rijen hoog, in de
 *    brede kolom (φ);
 *  - `klein`: één van de twee kaarten ernaast, in de smalle kolom (1);
 *  - `breed`: een losse kaart over beide kolommen (één dienst over);
 *  - `paar-groot` / `paar-klein`: twee kaarten over, naast elkaar in
 *    dezelfde twee kolommen, één rij hoog.
 */
export type MetroRol = "groot" | "klein" | "breed" | "paar-groot" | "paar-klein"

export type MetroPlek<T> = {
  item: T
  rol: MetroRol
  /** Volgnummer van de eenheid (0, 1, …): een blok van drie, een brede kaart of een paar. */
  eenheid: number
  /** Het grote blok (of het beeld van de brede kaart) staat rechts. */
  gespiegeld: boolean
  /** `grid-column` vanaf `lg`, in de drie sporen van `metroKolommen`. */
  kolom: string
  /** `grid-row` vanaf `lg`. */
  rij: string
}

/**
 * Deelt een lijst op in metro-eenheden, in leesvolgorde.
 *
 * Per drie kaarten één eenheid: het grote blok met de twee kleine
 * ernaast; om en om staat het blok links en rechts. Het grote blok is de
 * eerste kaart van die drie waar `voorkeur` waar is (op /services: een
 * echte eigen foto), anders de eerste van de drie. De volgorde binnen een
 * eenheid volgt het oog, links boven eerst: blok links → blok, klein,
 * klein; blok rechts → klein, blok, klein.
 *
 * Wat overblijft:
 *  - één kaart → `breed`, over beide kolommen: het beeld in de brede
 *    kolom, de tekst in de smalle, zodat de kolomlijn doorloopt. Liever
 *    dan één blok naast drie kleine: dan zou het blok drie rijen hoog
 *    worden (een toren) en is de verhouding geen gulden rechthoek meer.
 *  - twee kaarten → een paar in dezelfde twee kolommen, één rij hoog.
 */
export function metroIndeling<T>(items: readonly T[], voorkeur: (item: T) => boolean = () => false): MetroPlek<T>[] {
  const uit: MetroPlek<T>[] = []
  let rij = 1
  let eenheid = 0
  for (let i = 0; i < items.length; ) {
    const rest = items.length - i
    const gespiegeld = eenheid % 2 === 1
    // Drie sporen (zie METRO_KOLOMMEN): het blok beslaat er twee, een
    // kleine kaart één; gespiegeld schuift het blok één spoor op.
    const groot = gespiegeld ? "2 / span 2" : "1 / span 2"
    const klein = gespiegeld ? "1" : "3"
    if (rest >= 3) {
      const stuk = items.slice(i, i + 3)
      const k = Math.max(0, stuk.findIndex(voorkeur))
      const blok = stuk[k]
      const [een, twee] = stuk.filter((_, n) => n !== k)
      const plek = (item: T, rol: MetroRol, kolom: string, r: string): MetroPlek<T> => ({ item, rol, eenheid, gespiegeld, kolom, rij: r })
      const b = plek(blok, "groot", groot, `${rij} / span 2`)
      const s1 = plek(een, "klein", klein, `${rij}`)
      const s2 = plek(twee, "klein", klein, `${rij + 1}`)
      uit.push(...(gespiegeld ? [s1, b, s2] : [b, s1, s2]))
      rij += 2
      i += 3
    } else if (rest === 2) {
      const stuk = items.slice(i, i + 2)
      const k = Math.max(0, stuk.findIndex(voorkeur))
      const b: MetroPlek<T> = { item: stuk[k], rol: "paar-groot", eenheid, gespiegeld, kolom: groot, rij: `${rij}` }
      const s: MetroPlek<T> = { item: stuk[1 - k], rol: "paar-klein", eenheid, gespiegeld, kolom: klein, rij: `${rij}` }
      uit.push(...(gespiegeld ? [s, b] : [b, s]))
      rij += 1
      i += 2
    } else {
      uit.push({ item: items[i], rol: "breed", eenheid, gespiegeld, kolom: "1 / -1", rij: `${rij}` })
      rij += 1
      i += 1
    }
    eenheid += 1
  }
  return uit
}

/** Eén vierkant van de gulden verdeling, in de eenheden van de viewBox. */
export type Vierkant = { x: number; y: number; z: number }

export type GuldenSpiraal = {
  /** viewBox-breedte: φ × hoogte. */
  breedte: number
  hoogte: number
  /** De spiraal: één kwartcirkel per vierkant, als één pad. */
  boog: string
  /** De vierkanten, groot naar klein. */
  vierkanten: Vierkant[]
  /**
   * De snedes: per vierkant alleen de lijn waar het van de rest wordt
   * afgesneden, als één pad. Zonder de buitenrand van de rechthoek.
   */
  snedes: string
}

const r3 = (n: number) => Math.round(n * 1000) / 1000

/**
 * De gulden spiraal (eigenaar, 29 sep 2026: het plaatje met de gulden
 * rechthoek, recursief verdeeld in vierkanten, met de spiraal als
 * kwartcirkels door elk vierkant). Dezelfde bouwsteen als de iconen van
 * Editie 02: de kwartcirkel.
 *
 * Een rechthoek van φ × 1 (× `hoogte`): het grote vierkant links, dan
 * boven, rechts, onder in de rest, en zo verder, `stappen` keer. In elk
 * vierkant een kwartcirkel met het middelpunt in de hoek aan de kant van
 * de rest, zodat de bogen op elkaar aansluiten en naar binnen draaien. De
 * spiraal eindigt in de smalle strook rechts: het grote vierkant hoort
 * bij het grote blok, de strook bij de kleine kaarten.
 */
export function guldenSpiraal(hoogte = 1000, stappen = 10): GuldenSpiraal {
  const breedte = r3(hoogte * PHI)
  let x = 0
  let y = 0
  let w = hoogte * PHI
  let h = hoogte
  const vierkanten: Vierkant[] = []
  const d: string[] = [`M${r3(0)},${r3(hoogte)}`]
  const snedes: string[] = []
  for (let n = 0; n < stappen; n++) {
    const kant = n % 4
    if (kant === 0) {
      // Links: vierkant h × h; boog van linksonder naar rechtsboven.
      const z = h
      vierkanten.push({ x, y, z })
      d.push(`A${r3(z)},${r3(z)} 0 0 1 ${r3(x + z)},${r3(y)}`)
      snedes.push(`M${r3(x + z)},${r3(y)}V${r3(y + h)}`)
      x += z
      w -= z
    } else if (kant === 1) {
      // Boven: vierkant w × w; boog van linksboven naar rechtsonder.
      const z = w
      vierkanten.push({ x, y, z })
      d.push(`A${r3(z)},${r3(z)} 0 0 1 ${r3(x + z)},${r3(y + z)}`)
      snedes.push(`M${r3(x)},${r3(y + z)}H${r3(x + w)}`)
      y += z
      h -= z
    } else if (kant === 2) {
      // Rechts: vierkant h × h; boog van rechtsboven naar linksonder.
      const z = h
      vierkanten.push({ x: x + w - z, y, z })
      d.push(`A${r3(z)},${r3(z)} 0 0 1 ${r3(x + w - z)},${r3(y + z)}`)
      snedes.push(`M${r3(x + w - z)},${r3(y)}V${r3(y + h)}`)
      w -= z
    } else {
      // Onder: vierkant w × w; boog van rechtsonder naar linksboven.
      const z = w
      vierkanten.push({ x, y: y + h - z, z })
      d.push(`A${r3(z)},${r3(z)} 0 0 1 ${r3(x)},${r3(y + h - z)}`)
      snedes.push(`M${r3(x)},${r3(y + h - z)}H${r3(x + w)}`)
      h -= z
    }
  }
  return {
    breedte,
    hoogte,
    boog: d.join(" "),
    snedes: snedes.join(""),
    vierkanten: vierkanten.map((v) => ({ x: r3(v.x), y: r3(v.y), z: r3(v.z) })),
  }
}

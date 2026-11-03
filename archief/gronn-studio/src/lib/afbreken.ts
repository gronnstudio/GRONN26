// Waar een lang Nederlands samengesteld woord mag afbreken (coördinator
// namens de eigenaar, 29 sep 2026: "Onderhoudsabonnemen-t" op 390px). De
// browser breekt met `hyphens: auto` alleen af als hij een woordenboek voor
// de taal heeft, en dat heeft niet elke browser; `overflow-wrap: anywhere`
// brak toen op de laatste letter. Daarom vaste breekpunten, tussen de delen
// van de samenstelling, als zacht afbreekstreepje (U+00AD): onzichtbaar
// tenzij de regel daar echt breekt, en een schermlezer leest het woord heel.
//
// Alleen woorden die op 320px niet op één regel van een kaart passen; een
// kort woord (Tuinontwerp, Winterklaar) past en blijft heel. Het lijstje
// staat hier en niet in de content: een publicatie uit /editor zou een
// zacht streepje in de data zo weer weghalen.

const ZACHT = "­"

/** De samenstellingen, met `|` op de plek waar ze mogen breken. */
const SAMENSTELLINGEN = ["Onderhouds|abonnement", "Vijver|doorlichting", "Najaars|beurt"]

const BREEKPUNTEN = new Map<string, string>(
  SAMENSTELLINGEN.flatMap((w) => {
    const heel = w.replace("|", "")
    const zacht = w.replace("|", ZACHT)
    const klein = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
    return [
      [heel, zacht],
      [klein(heel), klein(zacht)],
    ] as [string, string][]
  })
)

/** Zet zachte afbreekstreepjes in de bekende lange samenstellingen van `tekst`. */
export function zachtAfbreken(tekst: string): string {
  return tekst.replace(/\p{L}+/gu, (woord) => BREEKPUNTEN.get(woord) ?? woord)
}

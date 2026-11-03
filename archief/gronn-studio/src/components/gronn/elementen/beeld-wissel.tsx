import Image from "next/image"

/** De tweede foto van een kaart: altijd een ECHTE foto van hetzelfde werk. */
export type WisselFoto = { src: string; width: number; height: number }

/**
 * Qi's "interactive banner – image switch", rustig: onder de muis (of bij
 * toetsenbordfocus) vloeit een tweede echte foto over de eerste.
 *
 * Dit is alleen de tweede laag. Hij ligt `absolute inset-0` over de
 * eerste, dus de ouder is `relative` en draagt de 16px-hoeken met
 * `overflow-hidden`; `object-cover` op dezelfde box, dus nooit een
 * verspringing. De trekker is een voorouder met `g-wissel-groep` (de
 * kaartlink, of het vlak waar de kaart in staat) — zie "BeeldWissel" in
 * globals.css.
 *
 * `alt=""`: de laag herhaalt de kaart, die al een naam heeft (de eerste
 * foto en de titel). Een tweede alt zou de naam van de link dubbel maken.
 * `loading="lazy"`: wie niet wijst, laadt hem pas als hij in de buurt komt.
 *
 * Nooit een sfeerbeeld of AI-visualisatie: die dragen hun label, en een
 * laag die pas onder de muis verschijnt zou dat label niet laten zien.
 */
export function BeeldWissel({
  foto,
  sizes,
  focus = "50% 50%",
}: {
  foto: WisselFoto
  sizes: string
  focus?: string
}) {
  return (
    <Image
      src={foto.src}
      alt=""
      width={foto.width}
      height={foto.height}
      sizes={sizes}
      loading="lazy"
      data-beeld-wissel=""
      style={{ objectPosition: focus }}
      className="g-wissel pointer-events-none absolute inset-0 size-full object-cover"
    />
  )
}
